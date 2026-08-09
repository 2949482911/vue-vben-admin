<script setup lang="ts">
/**
 * 批投任务结果抽屉内容组件（通用，适配所有媒体平台）
 *
 * 使用方式：
 * 在父组件中使用 antd Drawer + v-if 条件渲染即可：
 *   <Drawer :open="open" @close="close">
 *     <BatchTaskResultDrawer v-if="taskId" :task-id="taskId" ... />
 *   </Drawer>
 *
 * 组件内部自动轮询 fetchVivoSubmitResult，任务完成后自动停止轮询。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Alert, Descriptions, Empty, Progress, Tag, Card } from 'ant-design-vue';
import { Spinner } from '@vben/common-ui';
import { creationTaskApi } from '#/api';

const props = withDefaults(
  defineProps<{
    /** 批投任务ID */
    taskId: string;
    /** 任务名称 */
    taskName?: string;
    /** 平台标识 */
    platform?: string;
    /** 项目ID */
    projectId?: string;
    /** 轮询间隔（毫秒），默认 3000 */
    pollInterval?: number;
  }>(),
  {
    taskName: '',
    platform: '',
    projectId: '',
    pollInterval: 3000,
  },
);

const emit = defineEmits<{
  /** 任务执行完毕（成功或失败） */
  taskCompleted: [status: number];
}>();

// ==================== 状态 ====================
const loading = ref(false);
const taskResult = ref<any>(null);
const error = ref<string | null>(null);
/** 从 API 响应中获取的任务状态 */
const taskStatus = ref<number>(2); // 默认处理中
let pollTimer: ReturnType<typeof setInterval> | null = null;
/** 轮询计数器，防止无限轮询 */
let pollCount = 0;
/** 最大轮询次数（3秒 × 200次 = 10分钟） */
const MAX_POLL_COUNT = 200;

// ==================== 状态映射 ====================
const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: 'orange', text: '待处理' },
  2: { color: 'blue', text: '处理中' },
  3: { color: 'green', text: '已完成' },
  4: { color: 'red', text: '失败' },
  5: { color: 'red', text: '超时' },
};

// ==================== 进度计算 ====================
const progressPercent = computed(() => {
  const r = taskResult.value;
  if (!r) return 0;
  const total = Number(r.commitTotalCount ?? 0);
  const success = Number(r.successTotalCount ?? 0);
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
});

const successCount = computed(() => Number(taskResult.value?.successTotalCount ?? 0));
const commitCount = computed(() => Number(taskResult.value?.commitTotalCount ?? 0));

/** 分层统计 */
interface LevelStat {
  success: number;
  commit: number;
}
const campaignStat = computed<LevelStat>(() => ({
  success: Number(taskResult.value?.successCampaignCount ?? 0),
  commit: Number(taskResult.value?.commitCampaignCount ?? 0),
}));
const adGroupStat = computed<LevelStat>(() => ({
  success: Number(taskResult.value?.successAdGroupCount ?? 0),
  commit: Number(taskResult.value?.commitAdGroupCount ?? 0),
}));
const promotionStat = computed<LevelStat>(() => ({
  success: Number(taskResult.value?.successPromotionCount ?? 0),
  commit: Number(taskResult.value?.commitPromotionCount ?? 0),
}));
const creativeStat = computed<LevelStat>(() => ({
  success: Number(taskResult.value?.successCreativeCount ?? 0),
  commit: Number(taskResult.value?.commitCreativeCount ?? 0),
}));

// ==================== 结果解析 ====================
interface ResultRow {
  advertiserId: string;
  index: number;
  parentId?: string;
  resultId?: string;
  code: number;
  message: string;
  requestId?: string;
}

function parseResultData(
  respData: any,
  resultType: 'campaign' | 'adgroup' | 'promotion' | 'creative',
): ResultRow[] {
  if (!respData) return [];
  const rows: ResultRow[] = [];
  Object.entries(respData).forEach(([advertiserId, items]) => {
    if (!items || typeof items !== 'object') return;
    Object.entries(items as object).forEach(([index, detail]) => {
      const d = detail as any;
      let resultId: string | undefined;
      let parentId: string | undefined;
      switch (resultType) {
        case 'campaign': resultId = d.campaignId; break;
        case 'adgroup': resultId = d.adgroupId; parentId = d.campaignId; break;
        case 'promotion': resultId = d.promotionId; parentId = d.adgroupId || d.campaignId; break;
        case 'creative': resultId = d.creativeId; break;
      }
      rows.push({
        advertiserId,
        index: Number(index),
        parentId,
        resultId,
        code: d.code ?? 0,
        message: d.message || '',
        requestId: d.requestId,
      });
    });
  });
  return rows;
}

const campaignRows = computed(() => parseResultData(taskResult.value?.campaignResp, 'campaign'));
const adGroupRows = computed(() => parseResultData(taskResult.value?.adGroupResp, 'adgroup'));
const promotionRows = computed(() => parseResultData(taskResult.value?.promotionResp, 'promotion'));
const creativeRows = computed(() => parseResultData(taskResult.value?.creativeResp, 'creative'));

const hasResults = computed(
  () => campaignRows.value.length > 0 || adGroupRows.value.length > 0 || promotionRows.value.length > 0,
);

// ==================== 轮询逻辑 ====================
async function fetchTaskResult() {
  if (!props.taskId) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await creationTaskApi.fetchVivoSubmitResult({ id: props.taskId });
    taskResult.value = res;
    pollCount++;

    // 从响应中提取任务状态（优先使用 API 返回的状态字段）
    const apiStatus = res?.taskState ?? res?.taskState;
    if (apiStatus !== undefined && apiStatus !== null) {
      taskStatus.value = Number(apiStatus);
    } else {
      // API 返回的是分层计数，求和得到总量
      const total =
        Number(res?.commitCampaignCount ?? 0) +
        Number(res?.commitAdGroupCount ?? 0) +
        Number(res?.commitPromotionCount ?? 0) +
        Number(res?.commitCreativeCount ?? 0);
      const success =
        Number(res?.successCampaignCount ?? 0) +
        Number(res?.successAdGroupCount ?? 0) +
        Number(res?.successPromotionCount ?? 0) +
        Number(res?.successCreativeCount ?? 0);

      if (total > 0 && success >= total) {
        taskStatus.value = 3; // 全部完成
      } else if (total > 0 && success < total && pollCount >= 3) {
        // 有数据但未全部成功，可能是部分失败，持续轮询直到稳定
        taskStatus.value = 2;
      }
    }

    // 任务完成、失败、超时 或 超过最大轮询次数时停止
    const isDone = taskStatus.value === 3 || taskStatus.value === 4 || taskStatus.value === 5;
    const isMaxRetry = pollCount >= MAX_POLL_COUNT;
    if (isDone || isMaxRetry) {
      stopPolling();
      emit('taskCompleted', taskStatus.value);
    }
  } catch (e: any) {
    error.value = e?.message || '获取任务结果失败';
    // API 连续失败也应有上限
    if (pollCount >= MAX_POLL_COUNT) {
      stopPolling();
    }
  } finally {
    loading.value = false;
  }
}

function startPolling() {
  stopPolling();
  pollCount = 0;
  pollTimer = setInterval(() => {
    fetchTaskResult();
  }, props.pollInterval);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// 组件挂载时开始轮询
watch(
  () => props.taskId,
  (id) => {
    if (id) {
      fetchTaskResult();
      startPolling();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopPolling();
});

// ==================== 结果码显色 ====================
function getCodeColor(code: number) {
  if (code === 0) return 'green';
  if (code === 9) return 'orange';
  return 'red';
}
function getCodeText(code: number) {
  if (code === 0) return '成功';
  if (code === 9) return '已清理';
  return '失败';
}

/** 格式化时间 */
function formatTime(val?: string) {
  if (!val) return '-';
  return val;
}
</script>

<template>
  <div class="batch-task-result-drawer">
    <Spinner :spinning="loading" tip="加载中...">
      <!-- 错误提示 -->
      <Alert v-if="error" type="error" :message="error" show-icon class="mb-4" />

      <!-- 任务基本信息 -->
      <Card title="任务信息" size="small" class="result-card">
        <Descriptions :column="2" size="small" bordered>
          <Descriptions.Item label="任务ID">{{ taskId }}</Descriptions.Item>
          <Descriptions.Item label="任务名称">{{ taskName || '-' }}</Descriptions.Item>
          <Descriptions.Item label="所属平台">{{ platform || '-' }}</Descriptions.Item>
          <Descriptions.Item label="项目ID">{{ projectId || '-' }}</Descriptions.Item>
          <Descriptions.Item label="任务状态">
            <Tag :color="statusMap[taskStatus]?.color">
              {{ statusMap[taskStatus]?.text || '未知' }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {{ formatTime(taskResult?.startTime) }}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {{ formatTime(taskResult?.endTime) }}
          </Descriptions.Item>
          <Descriptions.Item label="提交账户数">
            {{ taskResult?.commitAdvertiserCount || 0 }}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <!-- 进度概览 -->
      <Card title="任务执行进度" size="small" class="result-card">
        <Progress
          :percent="progressPercent"
          :status="taskStatus === 4 ? 'exception' : taskStatus === 3 ? 'success' : 'active'"
        />
        <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 md:grid-cols-4">
          <div v-if="campaignStat.commit > 0">
            计划: <span class="font-medium text-green-600">{{ campaignStat.success }}</span>
            / {{ campaignStat.commit }}
          </div>
          <div v-if="adGroupStat.commit > 0">
            广告组: <span class="font-medium text-green-600">{{ adGroupStat.success }}</span>
            / {{ adGroupStat.commit }}
          </div>
          <div v-if="promotionStat.commit > 0">
            广告: <span class="font-medium text-green-600">{{ promotionStat.success }}</span>
            / {{ promotionStat.commit }}
          </div>
          <div v-if="creativeStat.commit > 0">
            创意: <span class="font-medium text-green-600">{{ creativeStat.success }}</span>
            / {{ creativeStat.commit }}
          </div>
        </div>
      </Card>

      <!-- 执行详情 -->
      <Empty v-if="taskResult && !hasResults && !loading" description="暂无执行结果数据" />

      <!-- 计划层结果 -->
      <Card v-if="campaignRows.length" title="计划创建结果" size="small" class="result-card">
        <div class="overflow-x-auto">
          <table class="min-w-full border text-xs">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="border px-2 py-1 text-left">账户ID</th>
                <th class="border px-2 py-1 text-left">序号</th>
                <th class="border px-2 py-1 text-left">计划ID</th>
                <th class="border px-2 py-1 text-left">结果码</th>
                <th class="border px-2 py-1 text-left">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in campaignRows" :key="`c-${i}`" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border px-2 py-1">{{ row.advertiserId }}</td>
                <td class="border px-2 py-1">{{ row.index }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.resultId || '-' }}</td>
                <td class="border px-2 py-1">
                  <Tag :color="getCodeColor(row.code)">{{ getCodeText(row.code) }}</Tag>
                </td>
                <td class="border px-2 py-1 max-w-[220px] truncate" :title="row.message">{{ row.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- 广告组层结果 -->
      <Card v-if="adGroupRows.length" title="广告组创建结果" size="small" class="result-card">
        <div class="overflow-x-auto">
          <table class="min-w-full border text-xs">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="border px-2 py-1 text-left">账户ID</th>
                <th class="border px-2 py-1 text-left">序号</th>
                <th class="border px-2 py-1 text-left">父计划ID</th>
                <th class="border px-2 py-1 text-left">广告组ID</th>
                <th class="border px-2 py-1 text-left">结果码</th>
                <th class="border px-2 py-1 text-left">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in adGroupRows" :key="`ag-${i}`" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border px-2 py-1">{{ row.advertiserId }}</td>
                <td class="border px-2 py-1">{{ row.index }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.parentId || '-' }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.resultId || '-' }}</td>
                <td class="border px-2 py-1">
                  <Tag :color="getCodeColor(row.code)">{{ getCodeText(row.code) }}</Tag>
                </td>
                <td class="border px-2 py-1 max-w-[220px] truncate" :title="row.message">{{ row.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- 广告/推广层结果 -->
      <Card v-if="promotionRows.length" title="广告（推广）创建结果" size="small" class="result-card">
        <div class="overflow-x-auto">
          <table class="min-w-full border text-xs">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="border px-2 py-1 text-left">账户ID</th>
                <th class="border px-2 py-1 text-left">序号</th>
                <th class="border px-2 py-1 text-left">父级ID</th>
                <th class="border px-2 py-1 text-left">广告ID</th>
                <th class="border px-2 py-1 text-left">结果码</th>
                <th class="border px-2 py-1 text-left">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in promotionRows" :key="`p-${i}`" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border px-2 py-1">{{ row.advertiserId }}</td>
                <td class="border px-2 py-1">{{ row.index }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.parentId || '-' }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.resultId || '-' }}</td>
                <td class="border px-2 py-1">
                  <Tag :color="getCodeColor(row.code)">{{ getCodeText(row.code) }}</Tag>
                </td>
                <td class="border px-2 py-1 max-w-[220px] truncate" :title="row.message">{{ row.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </Spinner>
  </div>
</template>

<style scoped lang="scss">
.batch-task-result-drawer {
  // 各展示区域 Card：统一间距与圆角阴影，避免挤在一起
  .result-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.ant-card-head) {
      padding: 10px 16px;
      min-height: auto;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    :deep(.ant-card-body) {
      padding: 16px;
    }
  }

  :deep(.ant-descriptions-item-label) {
    width: 100px;
  }

  table {
    th,
    td {
      white-space: nowrap;
    }
  }
}
</style>
