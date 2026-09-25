<script setup lang="ts">
import type {
  AdvertiserCreateResultResponse,
  CreationTaskItem,
} from '#/api/models/marketing';

/**
 * 批投任务详情面板 - 通用组件，适配所有平台
 *
 * 共享方：
 *  1. 创编任务列表页「查看详情」（creation_task/index.vue）
 *  2. 各平台批投结果抽屉（components/result/BatchTaskResultDrawer.vue）
 * 两处展示同一套 UI，只维护这一份。
 *
 * 结构：Hero 概览（状态 / 任务名 / ID / 完成度环形）→ 失败汇总 → KPI 四卡
 *      → 任务信息 → 执行结果（分层 Tab + 表格）
 *
 * 组件全部使用 ant-design-vue（Badge / Progress / Statistic / Card / Alert /
 * Descriptions / Tabs / Table / Skeleton / Empty / Tag / Tooltip）与 vben 的
 * Loading / VbenButton / VbenIconButton；颜色只走项目语义 token 与 antd 语义枚举，
 * 不再硬编码 gray / blue / green。
 *
 * 数据：进入面板即查一次 create_result，之后每 3s 轮询一次；
 *      计数与状态以接口返回为准，未就绪时回落到列表行快照 props.task。
 *      是否停止由接口状态决定（3 完成 / 4 失败 / 5 超时），或达到 200 次上限。
 *      查询期间整个面板盖上 Loading 遮罩（带「加载中...」文案），查完自动淡出。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import { Loading, VbenButton, VbenIconButton } from '@vben/common-ui';
import { CircleAlert, Copy, RotateCw } from '@vben/icons';

import {
  Alert,
  Badge,
  Card,
  Descriptions,
  Empty,
  message,
  Progress,
  Skeleton,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { creationTaskApi } from '#/api';
import { RuleType } from '#/constants/enums';
import { PLATFORM } from '#/constants/locales';

/** 结果层级：计划 / 广告组 / 广告 / 创意 */
type LayerKey = 'adGroup' | 'campaign' | 'creative' | 'promotion';

const props = defineProps<{
  /** 任务数据（列表行快照，或提交成功后拼出的最小信息） */
  task: CreationTaskItem;
  /** 是否自动轮询（处理中的任务） */
  autoPoll?: boolean;
  /** 需要隐藏的结果层（如智擎版没有广告组 / 广告层） */
  hiddenLayers?: LayerKey[];
}>();

const emit = defineEmits<{
  /** 任务进入终态（完成 / 失败 / 超时），供父级刷新列表 */
  taskCompleted: [status: number];
}>();

// ==================== 任务结果（轮询） ====================

const taskResult = ref<AdvertiserCreateResultResponse | null>(null);
const loading = ref(false);
const error = ref<null | string>(null);
let pollTimer: null | ReturnType<typeof setInterval> = null;
/** 已轮询次数，用于兜底上限 */
let pollCount = 0;
/** 轮询间隔（毫秒） */
const POLL_INTERVAL = 3000;
/** 最大轮询次数（3s × 200 次 = 10 分钟），避免任务长期无回调时无限轮询 */
const MAX_POLL_COUNT = 200;

/**
 * 查询一次任务结果
 * 是否继续由接口返回的状态决定：拿到终态（3 完成 / 4 失败 / 5 超时）就停轮询并通知父级，
 * 否则保持轮询；接口异常也继续重试，直到达到次数上限。
 */
async function fetchTaskResult() {
  if (!props.task?.id) return;
  loading.value = true;
  error.value = null;
  let status: null | number = null;
  try {
    taskResult.value = await creationTaskApi.fetchVivoSubmitResult({
      id: String(props.task.id),
    });
    status = liveStatus.value;
  } catch (e: any) {
    error.value = e?.message || '获取任务结果失败';
  } finally {
    loading.value = false;
  }

  pollCount++;

  if (status === 3 || status === 4 || status === 5) {
    stopPolling();
    emit('taskCompleted', status);
  } else if (pollCount >= MAX_POLL_COUNT) {
    stopPolling();
  }
}

/**
 * 开始轮询：先立即查一次，之后每 3s 一次
 * 不复用列表行快照里的状态做预判（快照可能已过期），是否停止只由接口状态决定。
 */
function startPolling() {
  stopPolling();
  pollCount = 0;
  fetchTaskResult();
  pollTimer = setInterval(fetchTaskResult, POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// ==================== 状态与计数（taskResult 优先，回落列表快照） ====================

const COUNT_FIELDS = [
  'commitAdvertiserCount',
  'commitCampaignCount',
  'successCampaignCount',
  'commitAdGroupCount',
  'successAdGroupCount',
  'commitPromotionCount',
  'successPromotionCount',
  'commitCreativeCount',
  'successCreativeCount',
] as const;

/** 实时计数：轮询结果优先，未就绪时用列表行快照 */
const live = computed(() => {
  const result = taskResult.value as null | Record<string, any>;
  const row = props.task as unknown as Record<string, any>;
  const counts: Record<string, number> = {};
  for (const field of COUNT_FIELDS) {
    counts[field] = Number(result?.[field] ?? row?.[field] ?? 0) || 0;
  }
  return counts;
});

/** 实时状态码：1 待处理 / 2 处理中 / 3 已完成 / 4 失败 / 5 超时 */
const liveStatus = computed(
  () => Number(taskResult.value?.taskState ?? props.task?.taskStatus ?? 0),
);

const STATUS_META: Record<
  number,
  { badge: 'default' | 'error' | 'processing' | 'success' | 'warning'; text: string }
> = {
  1: { badge: 'warning', text: '待处理' },
  2: { badge: 'processing', text: '处理中' },
  3: { badge: 'success', text: '已完成' },
  4: { badge: 'error', text: '失败' },
  5: { badge: 'error', text: '超时' },
};

const statusMeta = computed(
  () =>
    STATUS_META[liveStatus.value] ?? { badge: 'default' as const, text: '未知' },
);

/** 平台展示文案（复用项目 PLATFORM 常量，带多语言） */
const platformText = computed(() => {
  const value = props.task?.platform;
  if (!value) return '';
  return PLATFORM.find((item) => item.value === value)?.label ?? value;
});

/** 任务生成规则文案 */
const RULE_TYPE_TEXT: Record<string, string> = {
  [RuleType.IMMEDIATELY]: '立即提交',
};

const ruleText = computed(() =>
  props.task?.ruleType ? RULE_TYPE_TEXT[props.task.ruleType] ?? '' : '',
);

// ==================== 执行结果数据 ====================

interface ResultRow {
  advertiserId: string;
  index: number;
  parentId?: string;
  requestId?: string;
  resultId?: string;
  code: number;
  message: string;
}

interface Layer {
  key: LayerKey;
  label: string;
  /** 该层结果 ID 的列名，如「计划ID」 */
  idLabel: string;
  /** 是否存在父级 ID（计划层没有父级） */
  hasParent: boolean;
  commit: number;
  success: number;
  failed: number;
  percent: number;
  rows: ResultRow[];
}

/** 解析结果数据为表格行 */
function parseResultData(
  respData: Record<string, any> | undefined,
  resultType: 'adgroup' | 'campaign' | 'creative' | 'promotion',
): ResultRow[] {
  if (!respData || typeof respData !== 'object') return [];

  const rows: ResultRow[] = [];
  Object.entries(respData).forEach(([advertiserId, items]) => {
    if (!items || typeof items !== 'object') return;
    Object.entries(items as Record<string, any>).forEach(([index, detail]) => {
      const d = detail as any;
      let parentId: string | undefined;
      let resultId: string | undefined;

      switch (resultType) {
        case 'campaign': {
          resultId = d.campaignId;
          break;
        }
        case 'adgroup': {
          parentId = d.campaignId;
          resultId = d.adgroupId;
          break;
        }
        case 'promotion': {
          parentId = d.adgroupId || d.campaignId;
          resultId = d.promotionId;
          break;
        }
        case 'creative': {
          resultId = d.creativeId;
          break;
        }
      }

      rows.push({
        advertiserId,
        index: Number(index),
        parentId,
        requestId: d.requestId,
        resultId,
        code: d.code || 0,
        message: d.message || '',
      });
    });
  });

  return rows;
}

/** 结果码 9 表示「已清理」，不算失败 */
function isFailedCode(code: number): boolean {
  return code !== 0 && code !== 9;
}

/** 汇总某一层的指标 */
function buildLayer(
  key: LayerKey,
  label: string,
  idLabel: string,
  hasParent: boolean,
  commit: number | undefined,
  success: number | undefined,
  rows: ResultRow[],
): Layer {
  const commitNum = Number(commit) || 0;
  const successNum = Number(success) || 0;
  return {
    key,
    label,
    idLabel,
    hasParent,
    commit: commitNum,
    success: successNum,
    failed: rows.filter((row) => isFailedCode(row.code)).length,
    percent: commitNum === 0 ? 0 : Math.round((successNum / commitNum) * 100),
    rows,
  };
}

/**
 * 四层执行结果（含创意层）
 * 过滤规则：显式隐藏的层不展示；既无提交数又无明细的层也不展示
 * （智擎版这类单层流程不会出现三个空 Tab）
 */
const layers = computed<Layer[]>(() => {
  const result = taskResult.value;
  const counts = live.value;
  const hidden = props.hiddenLayers ?? [];
  const all = [
    buildLayer(
      'campaign',
      '计划',
      '计划ID',
      false,
      counts.commitCampaignCount,
      counts.successCampaignCount,
      parseResultData(result?.campaignResp, 'campaign'),
    ),
    buildLayer(
      'adGroup',
      '广告组',
      '广告组ID',
      true,
      counts.commitAdGroupCount,
      counts.successAdGroupCount,
      parseResultData(result?.adGroupResp, 'adgroup'),
    ),
    buildLayer(
      'promotion',
      '广告',
      '广告ID',
      true,
      counts.commitPromotionCount,
      counts.successPromotionCount,
      parseResultData(result?.promotionResp, 'promotion'),
    ),
    buildLayer(
      'creative',
      '创意',
      '创意ID',
      false,
      counts.commitCreativeCount,
      counts.successCreativeCount,
      parseResultData(result?.creativeResp, 'creative'),
    ),
  ];
  return all.filter(
    (layer) =>
      !hidden.includes(layer.key) && (layer.commit > 0 || layer.rows.length > 0),
  );
});

/** 是否存在任意一层的执行结果 */
const hasResults = computed(() => layers.value.some((layer) => layer.rows.length > 0));

/** 提交明细总条数 */
const totalRows = computed(() =>
  layers.value.reduce((sum, layer) => sum + layer.rows.length, 0),
);

/** 有失败的层 */
const failedLayers = computed(() => layers.value.filter((layer) => layer.failed > 0));

/** 失败提交条数（按结果码统计，不含「已清理」） */
const failedCount = computed(() =>
  failedLayers.value.reduce((sum, layer) => sum + layer.failed, 0),
);

const failedLayerText = computed(() =>
  failedLayers.value.map((layer) => layer.label).join('、'),
);

// ==================== 汇总进度 ====================

/** 汇总：仅统计当前展示的层，隐藏层不计入环形完成度 */
const totals = computed(() => ({
  commit: layers.value.reduce((sum, layer) => sum + layer.commit, 0),
  success: layers.value.reduce((sum, layer) => sum + layer.success, 0),
}));

const progressPercent = computed(() => {
  const { commit, success } = totals.value;
  if (commit === 0) return 0;
  return Math.round((success / commit) * 100);
});

/** 环形进度状态（antd 语义枚举，避免写死颜色） */
const ringStatus = computed(() => {
  if (liveStatus.value === 4 || liveStatus.value === 5) return 'exception';
  if (progressPercent.value >= 100) return 'success';
  return 'normal';
});

/** 某层进度条状态：有失败 > 全部完成 > 进行中 > 未开始 */
function progressStatusOf(layer: Layer) {
  if (layer.failed > 0) return 'exception';
  if (layer.commit > 0 && layer.success >= layer.commit) return 'success';
  if (layer.success > 0) return 'active';
  return 'normal';
}

/** 某层百分比徽标颜色（antd Tag 语义色） */
function percentColorOf(layer: Layer) {
  if (layer.failed > 0) return 'error';
  if (layer.commit > 0 && layer.success >= layer.commit) return 'success';
  if (layer.success > 0) return 'processing';
  return 'default';
}

/** 结果码文案与状态（antd Badge 语义色） */
const CODE_META: Record<
  string,
  { badge: 'error' | 'success' | 'warning'; text: string }
> = {
  '0': { badge: 'success', text: '成功' },
  '9': { badge: 'warning', text: '已清理' },
};

const CODE_FAILED = { badge: 'error' as const, text: '失败' };

function codeMeta(code: number) {
  return CODE_META[String(code)] ?? CODE_FAILED;
}

// ==================== 表格列 ====================

/** 结果表列定义：计划层没有父级 ID */
function tableColumns(layer: Layer) {
  return [
    { dataIndex: 'advertiserId', key: 'advertiserId', title: '账户ID', width: 110 },
    { dataIndex: 'index', key: 'index', title: '序号', width: 64 },
    ...(layer.hasParent
      ? [{ dataIndex: 'parentId', key: 'parentId', title: '父级ID', width: 150 }]
      : []),
    { dataIndex: 'resultId', key: 'resultId', title: layer.idLabel, width: 158 },
    { dataIndex: 'code', key: 'code', title: '结果码', width: 96 },
    { dataIndex: 'message', key: 'message', title: '消息' },
  ];
}

function resultRowKey(row: ResultRow): string {
  return `${row.advertiserId}-${row.index}-${row.resultId ?? ''}`;
}

// ==================== 交互 ====================

/** 当前结果层；首次拿到数据后自动落到第一个有数据的层 */
const activeTab = ref<LayerKey>('campaign');

watch(
  () => layers.value.map((layer) => layer.rows.length).join(','),
  () => {
    const current = layers.value.find((layer) => layer.key === activeTab.value);
    if (current && current.rows.length > 0) return;
    const first = layers.value.find((layer) => layer.rows.length > 0);
    if (first) activeTab.value = first.key;
  },
  { immediate: true },
);

/** 跳到第一个有失败的层 */
function goToFailedLayer() {
  const first = failedLayers.value[0];
  if (first) activeTab.value = first.key;
}

async function copyText(text?: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    await message.success('已复制');
  } catch {
    await message.error('复制失败');
  }
}

// 任务变化时重新加载：先清掉上一个任务的结果和计时器，避免串数据
watch(
  () => props.task?.id,
  (id) => {
    stopPolling();
    taskResult.value = null;
    if (!id) return;
    if (props.autoPoll === false) {
      fetchTaskResult();
    } else {
      startPolling();
    }
  },
  { immediate: true },
);

onBeforeUnmount(stopPolling);
</script>

<template>
  <!-- 查询任务结果时整个面板盖上 loading（轮询期间每次查询都会出现） -->
  <Loading class="task-detail-drawer" :spinning="loading" text="加载中...">
    <!-- ==================== 错误提示 ==================== -->
    <Alert v-if="error" type="error" show-icon :message="error">
      <template #action>
        <VbenButton size="sm" variant="outline" @click="fetchTaskResult">
          <RotateCw class="mr-1 size-3.5" />
          重试
        </VbenButton>
      </template>
    </Alert>

    <!-- ==================== Hero 概览 ==================== -->
    <Card :bordered="false" class="detail-card">
      <div class="hero">
        <div class="hero-main">
          <div class="hero-badges">
            <Badge :status="statusMeta.badge" :text="statusMeta.text" />
            <Tag v-if="failedCount > 0" :bordered="false" color="error">
              <CircleAlert class="mr-1 -mt-0.5 inline size-3" />
              {{ failedCount }} 条失败
            </Tag>
            <Tag v-if="ruleText" :bordered="false">{{ ruleText }}</Tag>
          </div>

          <div class="hero-name">{{ task.name || '-' }}</div>

          <div class="hero-meta">
            <span class="font-mono text-xs">{{ task.id || '-' }}</span>
            <VbenIconButton
              v-if="task.id"
              size="xs"
              variant="ghost"
              @click="copyText(String(task.id))"
            >
              <Copy class="size-3.5" />
            </VbenIconButton>
            <span class="hero-sep"></span>
            <Tag v-if="platformText" :bordered="false" color="blue">{{ platformText }}</Tag>
            <span class="hero-sep"></span>
            <span>项目 {{ task.projectId || '-' }}</span>
          </div>
        </div>

        <!-- 完成度环形 -->
        <Progress
          class="hero-ring"
          type="circle"
          :percent="progressPercent"
          :size="92"
          :stroke-width="7"
          :status="ringStatus"
        >
          <template #format="percent">
            <span class="ring-center">
              <span class="ring-num">{{ percent }}%</span>
              <span class="ring-label">共 {{ totals.commit }} 项</span>
            </span>
          </template>
        </Progress>
      </div>
    </Card>

    <!-- ==================== 失败汇总 ==================== -->
    <Alert
      v-if="failedCount > 0"
      type="error"
      show-icon
      :message="`本次有 ${failedCount} 条提交失败（${failedLayerText}），可在下方「执行结果」查看失败原因`"
    >
      <template #action>
        <VbenButton size="sm" variant="link" @click="goToFailedLayer">去查看</VbenButton>
      </template>
    </Alert>

    <!-- ==================== KPI 指标卡（随展示层数自适应列数） ==================== -->
    <div
      v-if="layers.length > 0"
      class="kpi-row"
      :style="{ gridTemplateColumns: `repeat(${layers.length}, minmax(0, 1fr))` }"
    >
      <Card
        v-for="layer in layers"
        :key="layer.key"
        :bordered="false"
        class="detail-card kpi-card"
      >
        <Statistic
          :value="layer.success"
          :value-style="{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.5px' }"
        >
          <template #title>
            <span class="kpi-head">
              <span>{{ layer.label }}</span>
              <Tag
                :bordered="false"
                :color="percentColorOf(layer)"
                class="kpi-pct"
              >
                {{ layer.percent }}%
              </Tag>
            </span>
          </template>
          <template #suffix>
            <span class="kpi-total">/ {{ layer.commit }}</span>
          </template>
        </Statistic>
        <Progress
          :percent="layer.percent"
          :show-info="false"
          :status="progressStatusOf(layer)"
          size="small"
        />
      </Card>
    </div>

    <!-- ==================== 任务信息 ==================== -->
    <Card :bordered="false" class="detail-card" title="任务信息">
      <Descriptions :column="2" size="small" class="info-desc">
        <Descriptions.Item label="任务ID">
          <span class="font-mono text-xs">{{ task.id || '-' }}</span>
        </Descriptions.Item>
        <Descriptions.Item label="项目ID">
          <span class="font-mono text-xs">{{ task.projectId || '-' }}</span>
        </Descriptions.Item>
        <Descriptions.Item label="任务名称">{{ task.name || '-' }}</Descriptions.Item>
        <Descriptions.Item label="所属平台">{{ platformText || '-' }}</Descriptions.Item>
        <Descriptions.Item label="任务状态">
          <Badge :status="statusMeta.badge" :text="statusMeta.text" />
        </Descriptions.Item>
        <Descriptions.Item label="提交账户数">
          {{ live.commitAdvertiserCount }}
        </Descriptions.Item>
        <Descriptions.Item label="开始时间">{{ task.startTime || '-' }}</Descriptions.Item>
        <Descriptions.Item label="结束时间">{{ task.endTime || '-' }}</Descriptions.Item>
      </Descriptions>
    </Card>

    <!-- ==================== 执行结果 ==================== -->
    <Card :bordered="false" class="detail-card" title="执行结果">
      <template #extra>
        <span v-if="hasResults" class="card-extra">共 {{ totalRows }} 条提交明细</span>
      </template>

      <!-- 加载中：仅结果区出骨架，任务信息不受影响 -->
      <Skeleton v-if="loading && !hasResults" active :paragraph="{ rows: 4 }" />

      <!-- 空态 -->
      <Empty v-else-if="!hasResults" description="暂无执行结果">
        <span class="text-xs text-muted-foreground">
          任务尚未产生提交明细，稍后会自动刷新
        </span>
      </Empty>

      <!-- 分层结果表 -->
      <Tabs v-else v-model:active-key="activeTab" size="small" class="res-tabs">
        <Tabs.TabPane v-for="layer in layers" :key="layer.key">
          <template #tab>
            <span class="layer-tab">
              {{ layer.label }}
              <Tag
                :bordered="false"
                :color="layer.failed > 0 ? 'error' : 'default'"
                class="layer-count"
              >
                {{ layer.failed > 0 ? `${layer.failed} 失败` : layer.rows.length }}
              </Tag>
            </span>
          </template>

          <Table
            :columns="tableColumns(layer)"
            :data-source="layer.rows"
            :pagination="false"
            :row-key="resultRowKey"
            :scroll="{ x: 760, y: 360 }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'resultId'">
                <span class="cell-id">
                  <span class="font-mono text-xs text-primary">
                    {{ record.resultId || '-' }}
                  </span>
                  <VbenIconButton
                    v-if="record.resultId"
                    size="xs"
                    variant="ghost"
                    @click="copyText(record.resultId)"
                  >
                    <Copy class="size-3" />
                  </VbenIconButton>
                </span>
              </template>
              <template v-else-if="column.key === 'code'">
                <Badge
                  :status="codeMeta(record.code).badge"
                  :text="codeMeta(record.code).text"
                />
              </template>
              <template v-else-if="column.key === 'message'">
                <Tooltip v-if="record.message" :title="record.message">
                  <span class="cell-msg">{{ record.message }}</span>
                </Tooltip>
                <span v-else class="text-muted-foreground">-</span>
              </template>
              <template v-else-if="column.key === 'parentId'">
                <span class="font-mono text-xs text-muted-foreground">
                  {{ record.parentId || '-' }}
                </span>
              </template>
              <template v-else-if="column.key === 'advertiserId'">
                <span class="text-muted-foreground">{{ record.advertiserId }}</span>
              </template>
              <template v-else-if="column.key === 'index'">
                <span class="text-muted-foreground">{{ record.index }}</span>
              </template>
            </template>
          </Table>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </Loading>
</template>

<style scoped lang="scss">
/* ==================== 卡片栈：统一的卡片间距 ==================== */
.task-detail-drawer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/*
 * 统一的卡片外观（对齐项目卡片风格：1px token 边框 + 12px 圆角 + 极浅投影）
 * 用 :bordered="false" + 自绘边框，保证边框取项目 --border token
 */
.detail-card {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);

  :deep(.ant-card-head) {
    min-height: 48px;
    padding: 0 20px;
  }

  :deep(.ant-card-head-title) {
    font-size: 15px;
    font-weight: 600;
  }

  :deep(.ant-card-body) {
    padding: 16px 20px 20px;
  }
}

/* 卡片头右侧的补充信息 */
.card-extra {
  font-size: 12px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

/* ==================== Hero 概览 ==================== */
.hero {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-main {
  min-width: 0;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;

  /* 间距交给 flex gap，压掉 antd Tag 默认右边距 */
  :deep(.ant-tag) {
    margin-inline-end: 0;
  }
}

.hero-name {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  color: hsl(var(--foreground));
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.hero-sep {
  width: 1px;
  height: 12px;
  background: hsl(var(--border));
}

/* ==================== 完成度环形 ==================== */
.hero-ring {
  flex: none;

  /* 让 format 插槽内的两行文案垂直居中堆叠 */
  :deep(.ant-progress-text) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.ring-num {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: hsl(var(--foreground));
}

.ring-label {
  margin-top: 5px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* ==================== KPI 四卡 ==================== */
.kpi-row {
  display: grid;
  /* 列数随展示层数变化，由模板上的 inline gridTemplateColumns 决定 */
  gap: 16px;
}

.kpi-card {
  :deep(.ant-card-body) {
    padding: 16px;
  }

  :deep(.ant-statistic-title) {
    margin-bottom: 0;
  }
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.kpi-pct {
  margin: 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.kpi-total {
  font-size: 13px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

/* ==================== 任务信息 ==================== */
/* 卡片已提供边框，描述列表不再加框，避免框中框 */
.info-desc {
  :deep(.ant-descriptions-item-label) {
    width: 88px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  :deep(.ant-descriptions-item-content) {
    font-size: 14px;
  }

  /* 让两列之间的留白更明确 */
  :deep(.ant-descriptions-item) {
    padding-bottom: 12px;
  }

  /* 最后一行不再留底边距，避免和卡片底部内边距叠加 */
  :deep(.ant-descriptions-row:last-child .ant-descriptions-item) {
    padding-bottom: 0;
  }
}

/* ==================== 执行结果 ==================== */
.res-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 12px;
  }

  :deep(.ant-table) {
    font-size: 13px;
  }
}

.layer-tab {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.layer-count {
  margin: 0;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 16px;
}

.cell-id {
  display: inline-flex;
  gap: 4px;
  align-items: center;

  /* 复制按钮 hover 才出现 */
  :deep(button) {
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &:hover :deep(button) {
    opacity: 1;
  }
}

.cell-msg {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
