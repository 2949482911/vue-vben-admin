<script setup lang="ts" name="Workspace">
import type { Component } from 'vue';

import type { EchartsUIType, ECOption } from '@vben/plugins/echarts';

/**
 * 工作台 — 运营摘要与待办入口
 *
 * 数据全部来自现有接口：托管统计/洞察/决策、批创创建任务、资产运行记录、
 * 统一看板概览/告警、站内公告。「今日批创」统计依赖 Airflow 汇总接口，
 * 接口上线前使用演示数据并在卡片上标记。
 */
import type { RunItem } from '#/api/models/ai_asset';
import type {
  HostingBatchStats,
  HostingDecision,
  HostingInsight,
  HostingStats,
  HostingTask,
} from '#/api/models/ai_hosting';
import type {
  AlertItem,
  OverviewMetrics,
  TrendDataPoint,
} from '#/api/models/dashboard';
import type { CreationTaskItem } from '#/api/models/marketing';
import type { NoticeItem } from '#/api/models/notice';

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { useUserStore } from '@vben/stores';

import {
  AlertOutlined,
  AppstoreAddOutlined,
  AuditOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FundOutlined,
  LineChartOutlined,
  NotificationOutlined,
  ProfileOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WalletOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  List,
  message,
  Popover,
  Progress,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  aiAssetApi,
  aiHostingApi,
  creationTaskApi,
  dashboardApi,
  noticeApi,
} from '#/api/core';
import { chartPalette } from '#/utils/chart-colors';
import { noticeLevelColor, noticeLevelText, noticePlainText } from '#/utils/notice';
import {
  ACTION_TYPE_MAP,
  DECISION_STATUS_MAP,
  RISK_LEVEL_MAP,
  RULE_TYPE_MAP,
  TARGET_LEVEL_LABEL,
} from '#/views/marketing/ai_hosting/constants';

const router = useRouter();
const userStore = useUserStore();

const nickname = computed(() => userStore.userInfo?.nickname || '管理员');

/** 当前时间（问候语 + 实时时钟） */
const now = ref(dayjs());
const clock = computed(() => now.value.format('HH:mm'));
const greeting = computed(() => {
  const hour = now.value.hour();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '早安';
  if (hour < 18) return '下午好';
  return '晚上好';
});
const dateText = computed(() => {
  const week = ['日', '一', '二', '三', '四', '五', '六'];
  return `${now.value.format('M月D日')} 星期${week[now.value.day()]}`;
});

/** 数据状态 */
const stats = ref<HostingStats>({});
const insight = ref<HostingInsight>({});
const statsLoading = ref(false);
const decisions = ref<HostingDecision[]>([]);
const decisionTotal = ref(0);
const highRiskTotal = ref(0);
const decisionsLoading = ref(false);
const alerts = ref<AlertItem[]>([]);
const alertTotal = ref(0);
const alertsLoading = ref(false);
const batchTasks = ref<CreationTaskItem[]>([]);
const batchTaskTotal = ref(0);
const batchTasksLoading = ref(false);
const runningHostings = ref<HostingTask[]>([]);
const runningCreations = ref<CreationTaskItem[]>([]);
const runningRuns = ref<RunItem[]>([]);
const runningLoading = ref(false);
const overview = ref<null | OverviewMetrics>(null);
const overviewLoading = ref(false);
const notices = ref<NoticeItem[]>([]);
const noticesLoading = ref(false);
const trendData = ref<TrendDataPoint[]>([]);
const trendLoading = ref(false);

/** 今日批创：接口未上线前使用演示数据 */
const DEMO_BATCH_STATS: HostingBatchStats = {
  date: dayjs().format('YYYY-MM-DD'),
  taskCount: 6,
  successAdCount: 21,
  failedTaskCount: 1,
  pendingTaskCount: 3,
  updatedAt: '12:10',
};
const batchStats = ref<HostingBatchStats>({ ...DEMO_BATCH_STATS });
const batchStatsIsDemo = ref(true);
const batchStatsLoading = ref(false);

const today = dayjs().format('YYYY-MM-DD');

const pendingCount = computed(() => stats.value.pendingCount ?? decisionTotal.value);
const hitRatePercent = computed(() =>
  Math.min(100, Math.max(0, (insight.value.hitRate ?? 0) * 100)),
);
const hitRateText = computed(() =>
  (insight.value.evaluatedCount ?? 0) > 0
    ? `${hitRatePercent.value.toFixed(1)}%`
    : '--',
);
const roiDeltaText = computed(() => {
  const delta = insight.value.avgRoiDelta;
  if ((insight.value.roiSampleCount ?? 0) <= 0 || delta === null || delta === undefined) {
    return '--';
  }
  return `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`;
});

const queueTab = ref('pending');
const ALERT_TYPE_LABEL: Record<string, string> = {
  account_anomaly: '账户异常',
  budget_limit: '预算撞线',
  empty_spend: '空耗',
  material_decline: '素材衰退',
  over_cost: '超成本',
};
const ALERT_LEVEL_TEXT: Record<string, string> = {
  error: '严重',
  info: '提示',
  warning: '警告',
};
const CREATION_STATUS: Record<number, { color: string; label: string }> = {
  1: { label: '待处理', color: 'orange' },
  2: { label: '处理中', color: 'blue' },
  3: { label: '已完成', color: 'green' },
  4: { label: '失败', color: 'red' },
};

function alertLevelColor(level?: string) {
  if (level === 'error') return 'red';
  if (level === 'warning') return 'orange';
  return 'blue';
}

function riskMeta(risk?: string) {
  return (
    RISK_LEVEL_MAP[risk ?? ''] ?? { color: 'default', label: risk ?? '-' }
  );
}

function riskDotClass(risk?: string) {
  if (risk === 'high') return 'bg-destructive';
  if (risk === 'medium') return 'bg-warning';
  return 'bg-success';
}

function shortTime(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '--';
}

interface RunningEntry {
  badge: string;
  color: string;
  desc: string;
  key: string;
  tag: string;
  title: string;
}

const runningItems = computed<RunningEntry[]>(() => {
  const list: RunningEntry[] = [];
  runningHostings.value.forEach((task) => {
    list.push({
      key: `hosting-${task.id}`,
      badge: '托',
      title: task.name,
      desc: `AI 托管 · 下次执行 ${task.nextPollTime || '--'}`,
      tag: '运行中',
      color: 'green',
    });
  });
  runningCreations.value.forEach((task) => {
    list.push({
      key: `batch-${task.id}`,
      badge: '批',
      title: task.name || '批创任务',
      desc: `批创下发 · ${task.platform || '-'}`,
      tag: '处理中',
      color: 'blue',
    });
  });
  runningRuns.value.forEach((run) => {
    list.push({
      key: `run-${run.id}`,
      badge: '资',
      title: `工作流运行 #${run.id}`,
      desc: `AI 资产生产 · 开始 ${run.startedAt || '--'}`,
      tag: '生成中',
      color: 'cyan',
    });
  });
  return list.slice(0, 8);
});

const roiText = computed(() =>
  overview.value?.adPayRoi === null || overview.value?.adPayRoi === undefined
    ? '--'
    : overview.value.adPayRoi.toFixed(2),
);
const costChangeText = computed(() => formatChange(overview.value?.adCostChange));
const convertChangeText = computed(() =>
  formatChange(overview.value?.adConvertChange),
);

function formatChange(value?: null | number) {
  if (value === null || value === undefined) return '--';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function formatMoney(cents?: number) {
  return ((cents ?? 0) / 100).toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString('zh-CN');
}

interface MetricCardMeta {
  foot: string;
  icon: Component;
  key: string;
  title: string;
  tone: string;
  value: number | string;
}

const aiMetricCards = computed<MetricCardMeta[]>(() => [
  {
    key: 'accounts',
    title: '托管账户',
    value: stats.value.managedAccountCount ?? 0,
    foot: '跨 OPPO / 巨量等媒体',
    icon: TeamOutlined,
    tone: 'text-primary',
  },
  {
    key: 'plans',
    title: '管理计划 / 广告',
    value: stats.value.managedAdCount ?? 0,
    foot: '由托管任务自动维护',
    icon: ProfileOutlined,
    tone: 'text-primary',
  },
  {
    key: 'actions',
    title: '今日 AI 动作',
    value: stats.value.todayExecCount ?? 0,
    foot: `自动执行 ${stats.value.todayAutoExecCount ?? 0} 次`,
    icon: ThunderboltOutlined,
    tone: 'text-success',
  },
  {
    key: 'pending',
    title: '待我审核',
    value: pendingCount.value,
    foot: `${highRiskTotal.value} 高风险`,
    icon: AuditOutlined,
    tone: 'text-warning',
  },
]);

const batchMetricCards = computed<MetricCardMeta[]>(() => [
  {
    key: 'tasks',
    title: '今日任务',
    value: batchStats.value.taskCount ?? 0,
    foot: '后台创建',
    icon: AppstoreAddOutlined,
    tone: 'text-primary',
  },
  {
    key: 'success',
    title: '成功下发',
    value: batchStats.value.successAdCount ?? 0,
    foot: '广告单元',
    icon: CheckCircleOutlined,
    tone: 'text-success',
  },
  {
    key: 'failed',
    title: '失败任务',
    value: batchStats.value.failedTaskCount ?? 0,
    foot: '含超时',
    icon: CloseCircleOutlined,
    tone: 'text-destructive',
  },
  {
    key: 'waiting',
    title: '待确认',
    value: batchStats.value.pendingTaskCount ?? 0,
    foot: '待处理 / 处理中',
    icon: ClockCircleOutlined,
    tone: 'text-warning',
  },
]);

const overviewMetricCards = computed<MetricCardMeta[]>(() => [
  {
    key: 'cost',
    title: '消耗',
    value: `¥${formatMoney(overview.value?.adCost)}`,
    foot: `较昨日 ${costChangeText.value}`,
    icon: WalletOutlined,
    tone: 'text-primary',
  },
  {
    key: 'roi',
    title: 'ROI',
    value: roiText.value,
    foot: `较昨日 ${formatChange(overview.value?.adPayRoiChange)}`,
    icon: FundOutlined,
    tone: 'text-success',
  },
  {
    key: 'convert',
    title: '转化',
    value: formatNumber(overview.value?.adConvertAppCustom),
    foot: `较昨日 ${convertChangeText.value}`,
    icon: RiseOutlined,
    tone: 'text-primary',
  },
  {
    key: 'click',
    title: '点击',
    value: formatNumber(overview.value?.adClick),
    foot: `曝光 ${formatNumber(overview.value?.adShow)}`,
    icon: EyeOutlined,
    tone: 'text-muted-foreground',
  },
]);

/* 今日投放趋势：7 日消耗柱状图 */
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

function buildTrendOption(data: TrendDataPoint[]): ECOption {
  const palette = chartPalette();
  const sorted = [...data].sort((a, b) =>
    (a.day ?? '').localeCompare(b.day ?? ''),
  );
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) =>
        `¥${Number(value).toLocaleString('zh-CN', {
          maximumFractionDigits: 2,
        })}`,
    },
    grid: { top: 12, left: 8, right: 8, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map((item) => dayjs(item.day).format('MM-DD')),
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [
      {
        name: '消耗',
        type: 'bar',
        barMaxWidth: 22,
        itemStyle: { color: palette.primary, borderRadius: [4, 4, 0, 0] },
        data: sorted.map((item) => item.adCost / 100),
      },
    ],
  };
}

watch(
  trendData,
  (data) => {
    if (data.length > 0) {
      renderEcharts(buildTrendOption(data));
    }
  },
  { deep: true },
);

const briefLines = computed(() => [
  `AI 智能监控：今日动作 ${stats.value.todayExecCount ?? 0} 次，待审核 ${pendingCount.value}（${highRiskTotal.value} 高风险）`,
  `决策成效：命中率 ${hitRateText.value}，真实样本 ${insight.value.evaluatedCount ?? 0}，平均 ROI ${roiDeltaText.value}`,
  `今日批创：创建 ${batchStats.value.taskCount ?? 0} 个任务，成功下发 ${batchStats.value.successAdCount ?? 0} 个广告单元`,
  `运行中：${runningItems.value.length} 个任务`,
  `今日投放：消耗 ¥${formatMoney(overview.value?.adCost)}，ROI ${roiText.value}，转化 ${overview.value?.adConvertAppCustom ?? 0}`,
  `异常待办：${alertTotal.value} 条告警`,
]);

async function copyBrief() {
  try {
    await navigator.clipboard.writeText(
      `今日简报（${dateText.value}）\n${briefLines.value.join('\n')}`,
    );
    message.success('今日简报已复制');
  } catch {
    message.warning('复制失败，请手动选择文本');
  }
}

/** 决策详情抽屉 */
const drawerOpen = ref(false);
const activeDecision = ref<HostingDecision | null>(null);

function openDecision(decision: HostingDecision) {
  activeDecision.value = decision;
  drawerOpen.value = true;
}

const METRIC_LABEL: Record<string, string> = {
  adCost: '消耗',
  click: '点击',
  clickCost: '点击成本',
  cost: '消耗',
  cpa: '转化成本',
  ctr: 'CTR',
  roi: 'ROI',
  show: '曝光',
  spend: '消耗',
};

const MONEY_METRIC_KEYS = new Set(['adcost', 'clickcost', 'cost', 'cpa', 'spend']);

const activeMetricItems = computed(() =>
  Object.entries(activeDecision.value?.metricSnapshot ?? {})
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
      const numeric = Number(value);
      const isMoney = MONEY_METRIC_KEYS.has(key.toLowerCase());
      return {
        key,
        label: METRIC_LABEL[key] ?? METRIC_LABEL[normalizedKey] ?? key,
        value:
          isMoney && Number.isFinite(numeric)
            ? `¥${numeric.toLocaleString('zh-CN', {
                maximumFractionDigits: 2,
              })}`
            : String(value),
      };
    }),
);

/** 跳转 */
function goHosting() {
  router.push('/marketing/ai_hosting');
}

function goUnified() {
  router.push('/dashboard/unified');
}

function goNoticeCenter() {
  router.push('/system/notice/center');
}

function openNotice(item: NoticeItem) {
  router.push({
    path: '/system/notice/center',
    query: item.id ? { id: item.id } : undefined,
  });
}

function focusBatchTab() {
  queueTab.value = 'batch';
  document
    .getElementById('workspace-queue')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function refreshQueue() {
  if (queueTab.value === 'alerts') {
    void loadAlerts();
  } else if (queueTab.value === 'batch') {
    void loadBatchPending();
  }
}

/** 数据加载 */
async function loadHosting() {
  statsLoading.value = true;
  decisionsLoading.value = true;
  await Promise.allSettled([
    aiHostingApi
      .fetchStats({})
      .then((data) => {
        stats.value = data ?? {};
      })
      .catch(() => {}),
    aiHostingApi
      .fetchInsight()
      .then((data) => {
        insight.value = data ?? {};
      })
      .catch(() => {}),
    aiHostingApi
      .fetchDecisionList({ page: 1, pageSize: 5, decisionStatus: 'pending' })
      .then((data) => {
        decisions.value = data?.items ?? [];
        decisionTotal.value = data?.total ?? 0;
      })
      .catch(() => {}),
    aiHostingApi
      .fetchDecisionList({
        page: 1,
        pageSize: 1,
        decisionStatus: 'pending',
        riskLevel: 'high',
      })
      .then((data) => {
        highRiskTotal.value = data?.total ?? 0;
      })
      .catch(() => {}),
  ]);
  statsLoading.value = false;
  decisionsLoading.value = false;
}

async function loadAlerts() {
  alertsLoading.value = true;
  try {
    const data = await dashboardApi.fetchAlerts(
      {
        dateRange: [today, today],
        page: 1,
        pageSize: 5,
      },
      { skipErrorMessage: true },
    );
    alerts.value = data?.items ?? [];
    alertTotal.value = data?.total ?? 0;
  } catch {
    alerts.value = [];
  } finally {
    alertsLoading.value = false;
  }
}

async function loadBatchPending() {
  batchTasksLoading.value = true;
  try {
    const data = await creationTaskApi.fetchGetCreationTaskList({
      page: 1,
      pageSize: 5,
      taskStatus: 1,
    });
    batchTasks.value = (data?.items ?? []) as CreationTaskItem[];
    batchTaskTotal.value = data?.total ?? 0;
  } catch {
    batchTasks.value = [];
  } finally {
    batchTasksLoading.value = false;
  }
}

async function loadBatchStats() {
  batchStatsLoading.value = true;
  try {
    const data = await aiHostingApi.fetchBatchStats();
    if (data) {
      batchStats.value = data;
      batchStatsIsDemo.value = false;
    }
  } catch {
    // 统计接口尚未上线：保留演示数据，卡片上标记「演示」
  } finally {
    batchStatsLoading.value = false;
  }
}

async function loadRunning() {
  runningLoading.value = true;
  const [hosting, creation, run] = await Promise.allSettled([
    aiHostingApi.fetchTaskList({
      page: 1,
      pageSize: 5,
      taskStatus: 'running',
    }),
    creationTaskApi.fetchGetCreationTaskList({
      page: 1,
      pageSize: 5,
      taskStatus: 2,
    }),
    aiAssetApi.fetchRunList({ page: 1, pageSize: 5, status: 2 }),
  ]);
  if (hosting.status === 'fulfilled') {
    runningHostings.value = hosting.value?.items ?? [];
  }
  if (creation.status === 'fulfilled') {
    runningCreations.value =
      (creation.value?.items ?? []) as CreationTaskItem[];
  }
  if (run.status === 'fulfilled') {
    runningRuns.value = run.value?.items ?? [];
  }
  runningLoading.value = false;
}

async function loadOverview() {
  overviewLoading.value = true;
  try {
    overview.value = await dashboardApi.fetchOverview({
      dateRange: [today, today],
    });
  } catch {
    overview.value = null;
  } finally {
    overviewLoading.value = false;
  }
}

async function loadNotices() {
  noticesLoading.value = true;
  try {
    const data = await noticeApi.fetchReadListNotice();
    notices.value = (data?.items ?? []).slice(0, 8);
  } catch {
    notices.value = [];
  } finally {
    noticesLoading.value = false;
  }
}

async function loadTrend() {
  trendLoading.value = true;
  try {
    trendData.value = await dashboardApi.fetchTrend({
      dateRange: [dayjs().subtract(6, 'day').format('YYYY-MM-DD'), today],
    });
  } catch {
    trendData.value = [];
  } finally {
    trendLoading.value = false;
  }
}

let clockTimer: number | undefined;

onMounted(() => {
  void loadHosting();
  void loadAlerts();
  void loadBatchPending();
  void loadBatchStats();
  void loadRunning();
  void loadOverview();
  void loadNotices();
  void loadTrend();
  clockTimer = window.setInterval(() => {
    now.value = dayjs();
  }, 30_000);
});

onBeforeUnmount(() => {
  if (clockTimer) window.clearInterval(clockTimer);
});
</script>

<template>
  <Page auto-content-height content-class="p-5">
    <div>
    <!-- 顶部问候 -->
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
        >
          <span>工作台</span>
          <span class="h-2.5 w-px bg-border"></span>
          <span class="flex items-center gap-1.5 tracking-normal normal-case">
            <span class="inline-block size-1.5 rounded-full bg-success"></span>
            实时同步 {{ clock }}
          </span>
        </div>
        <h1 class="mt-1.5 text-2xl font-semibold">
          {{ greeting }}，{{ nickname }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ dateText }} · 今日已自动执行
          {{ stats.todayAutoExecCount ?? 0 }} 次 ·
          {{ runningItems.length }} 个任务进行中
        </p>
      </div>

      <Popover trigger="click" placement="bottomRight">
        <template #content>
          <div class="w-[380px]">
            <div class="border-b border-border pb-2">
              <div class="font-semibold">今日简报</div>
              <div class="mt-0.5 text-xs text-muted-foreground">
                {{ dateText }} · 截至 {{ clock }}
              </div>
            </div>
            <Descriptions :column="1" class="mt-2" size="small">
              <Descriptions.Item label="AI 智能监控">
                今日动作 {{ stats.todayExecCount ?? 0 }} 次 · 待审核
                {{ pendingCount }}（{{ highRiskTotal }} 高风险）
              </Descriptions.Item>
              <Descriptions.Item label="决策成效">
                命中率 {{ hitRateText }} · 真实样本
                {{ insight.evaluatedCount ?? 0 }} · 平均 ROI
                {{ roiDeltaText }}
              </Descriptions.Item>
              <Descriptions.Item label="今日批创">
                创建 {{ batchStats.taskCount ?? 0 }} 个任务 · 成功下发
                {{ batchStats.successAdCount ?? 0 }} 个广告单元
              </Descriptions.Item>
              <Descriptions.Item label="运行中">
                {{ runningItems.length }} 个任务
              </Descriptions.Item>
              <Descriptions.Item label="今日投放">
                消耗 ¥{{ formatMoney(overview?.adCost) }} · ROI
                {{ roiText }} · 转化
                {{ overview?.adConvertAppCustom ?? 0 }}
              </Descriptions.Item>
              <Descriptions.Item label="异常待办">
                {{ alertTotal }} 条告警
              </Descriptions.Item>
            </Descriptions>
            <div
              class="flex items-center justify-between gap-3 border-t border-border pt-2"
            >
              <span class="text-xs text-muted-foreground">
                mock / 演练数据不计入成效
              </span>
              <Button size="small" type="primary" @click="copyBrief">
                复制简报
              </Button>
            </div>
          </div>
        </template>
        <Button>
          <BarChartOutlined class="mr-1" />
          今日简报
        </Button>
      </Popover>
    </div>

    <!-- 第一行：AI 智能监控 + 今日批创 -->
    <Row :gutter="[16, 16]" align="stretch">
      <Col :lg="16" :xs="24">
        <Card class="h-full">
          <template #title>
            <Space :size="8">
              <span
                class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
              >
                <SafetyCertificateOutlined />
              </span>
              <span>AI 智能监控</span>
              <Tag color="green">运行中</Tag>
            </Space>
          </template>
          <template #extra>
            <Space :size="4">
              <Button size="small" type="link" @click="goHosting">
                控制台
              </Button>
              <Button size="small" type="link" @click="goHosting">
                审核台
              </Button>
            </Space>
          </template>

          <Spin :spinning="statsLoading">
            <Typography.Text type="secondary" class="text-xs">
              托管任务自动巡检 · 命中规则后生成决策单
            </Typography.Text>

            <Row :gutter="[12, 12]" class="mt-3">
              <Col
                v-for="item in aiMetricCards"
                :key="item.key"
                :md="6"
                :xs="12"
              >
                <Card class="h-full" size="small">
                  <div
                    class="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <component :is="item.icon" :class="item.tone" />
                    <span class="truncate">{{ item.title }}</span>
                  </div>
                  <div
                    class="mt-1 text-2xl font-semibold leading-tight tabular-nums"
                  >
                    {{ item.value }}
                  </div>
                  <div class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ item.foot }}
                  </div>
                </Card>
              </Col>
            </Row>

            <div class="mt-4 border-t border-border pt-3">
              <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span class="text-xs text-muted-foreground">决策命中率</span>
                <span class="text-xl font-semibold">{{ hitRateText }}</span>
                <span class="text-xs text-muted-foreground">
                  真实样本 {{ insight.evaluatedCount ?? 0 }} · 平均 ROI
                  {{ roiDeltaText }}
                </span>
              </div>
              <Progress
                :percent="hitRatePercent"
                :show-info="false"
                class="mt-2 max-w-[320px]"
                size="small"
              />
            </div>
          </Spin>
        </Card>
      </Col>

      <Col :lg="8" :xs="24">
        <Card class="h-full">
          <template #title>
            <Space :size="8">
              <span
                class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
              >
                <AppstoreAddOutlined />
              </span>
              <span>今日批创</span>
              <Tag v-if="batchStatsIsDemo" color="purple">演示</Tag>
            </Space>
          </template>
          <template #extra>
            <Button size="small" type="link" @click="focusBatchTab">
              去审批
            </Button>
          </template>

          <Spin :spinning="batchStatsLoading">
            <Row :gutter="[12, 12]">
              <Col
                v-for="item in batchMetricCards"
                :key="item.key"
                :span="12"
              >
                <Card class="h-full" size="small">
                  <div
                    class="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <component :is="item.icon" :class="item.tone" />
                    <span class="truncate">{{ item.title }}</span>
                  </div>
                  <div
                    class="mt-1 text-2xl font-semibold leading-tight tabular-nums"
                  >
                    {{ item.value }}
                  </div>
                  <div class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ item.foot }}
                  </div>
                </Card>
              </Col>
            </Row>

            <div
              class="mt-3 border-t border-border pt-2 text-xs text-muted-foreground"
            >
              Airflow 定时汇总：{{ batchStats.updatedAt || '暂无统计' }}
            </div>
          </Spin>
        </Card>
      </Col>
    </Row>

    <!-- 第二行：需要我处理 + 运行中 -->
    <Row :gutter="[16, 16]" align="stretch" class="mt-4">
      <Col :lg="16" :xs="24">
        <Card id="workspace-queue" class="h-full">
          <template #title>
            <Space :size="8">
              <span
                class="flex size-6 items-center justify-center rounded-md bg-warning/10 text-warning"
              >
                <AlertOutlined />
              </span>
              <span>需要我处理</span>
              <Tag color="orange">{{ pendingCount }}</Tag>
            </Space>
          </template>
          <template #extra>
            <Button size="small" type="link" @click="goHosting">
              进入审核台
            </Button>
          </template>

          <Space :size="8" class="mt-1" wrap>
            <Button
              :type="queueTab === 'pending' ? 'primary' : 'default'"
              @click="queueTab = 'pending'"
            >
              待审核 {{ pendingCount }}
            </Button>
            <Button
              :type="queueTab === 'alerts' ? 'primary' : 'default'"
              @click="queueTab = 'alerts'"
            >
              告警 {{ alertTotal }}
            </Button>
            <Button
              :type="queueTab === 'batch' ? 'primary' : 'default'"
              @click="queueTab = 'batch'"
            >
              批创待确认 {{ batchTaskTotal }}
            </Button>
          </Space>

          <!-- 待审核决策 -->
          <List
            v-if="queueTab === 'pending'"
            :data-source="decisions"
            :loading="decisionsLoading"
            :locale="{ emptyText: '暂无待审核决策' }"
            class="mt-2 max-h-[360px] overflow-y-auto pr-1"
          >
            <template #renderItem="{ item }">
              <List.Item>
                <div class="flex w-full items-center gap-3 py-1">
                  <span
                    class="inline-block size-2 shrink-0 rounded-full"
                    :class="riskDotClass(item.riskLevel)"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <div class="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span class="truncate text-[13px] font-medium">
                        {{ item.targetName || '-' }}
                      </span>
                      <Tag :color="riskMeta(item.riskLevel).color" class="m-0">
                        {{ riskMeta(item.riskLevel).label }}
                      </Tag>
                      <Tag v-if="item.action" class="m-0">
                        {{ ACTION_TYPE_MAP[item.action] || item.action }}
                      </Tag>
                    </div>
                    <div class="mt-0.5 truncate text-xs text-muted-foreground">
                      {{ item.advertiserName || '-' }} ·
                      {{ item.aiReason || item.ruleName || '-' }}
                    </div>
                  </div>
                  <div
                    class="hidden shrink-0 text-right text-xs text-muted-foreground sm:block"
                  >
                    <div class="font-medium text-foreground">
                      {{ shortTime(item.createTime) }}
                    </div>
                    <div>
                      {{ TARGET_LEVEL_LABEL[item.targetLevel || ''] || item.targetLevel || '-' }}
                    </div>
                  </div>
                  <Button size="small" @click="openDecision(item)">
                    去审核
                  </Button>
                </div>
              </List.Item>
            </template>
          </List>

          <!-- 告警 -->
          <List
            v-else-if="queueTab === 'alerts'"
            :data-source="alerts"
            :loading="alertsLoading"
            :locale="{ emptyText: '暂无告警' }"
            class="mt-2 max-h-[360px] overflow-y-auto pr-1"
          >
            <template #renderItem="{ item }">
              <List.Item>
                <div class="flex w-full items-center gap-3 py-1">
                  <Tag
                    :color="alertLevelColor(item.level)"
                    class="m-0 shrink-0"
                  >
                    {{ ALERT_LEVEL_TEXT[item.level] || item.level }}
                  </Tag>
                  <div class="min-w-0 flex-1">
                    <div class="flex min-w-0 items-center gap-2">
                      <span class="truncate text-[13px] font-medium">
                        {{ item.title }}
                      </span>
                      <Tag class="m-0 shrink-0">
                        {{ ALERT_TYPE_LABEL[item.type] || item.type }}
                      </Tag>
                    </div>
                    <div class="mt-0.5 truncate text-xs text-muted-foreground">
                      {{ item.advertiserName || item.platform || '-' }} ·
                      {{ item.content }}
                    </div>
                  </div>
                  <div
                    class="hidden shrink-0 text-xs text-muted-foreground sm:block"
                  >
                    {{ shortTime(item.createdAt) }}
                  </div>
                </div>
              </List.Item>
            </template>
          </List>

          <!-- 批创待确认 -->
          <List
            v-else
            :data-source="batchTasks"
            :loading="batchTasksLoading"
            :locale="{ emptyText: '暂无待确认批创任务' }"
            class="mt-2 max-h-[360px] overflow-y-auto pr-1"
          >
            <template #renderItem="{ item }">
              <List.Item>
                <div class="flex w-full items-center gap-3 py-1">
                  <div class="min-w-0 flex-1">
                    <div class="flex min-w-0 flex-wrap items-center gap-2">
                      <span class="truncate text-[13px] font-medium">
                        {{ item.name || '批创任务' }}
                      </span>
                      <Tag
                        :color="CREATION_STATUS[item.taskStatus ?? 0]?.color || 'default'"
                        class="m-0"
                      >
                        {{ CREATION_STATUS[item.taskStatus ?? 0]?.label || '-' }}
                      </Tag>
                    </div>
                    <div class="mt-0.5 truncate text-xs text-muted-foreground">
                      {{ item.platform || '-' }} · 提交广告
                      {{ item.commitPromotionCount ?? 0 }} · 成功
                      {{ item.successPromotionCount ?? 0 }}
                    </div>
                  </div>
                  <div
                    class="hidden shrink-0 text-xs text-muted-foreground sm:block"
                  >
                    {{ shortTime(item.createTime) }}
                  </div>
                </div>
              </List.Item>
            </template>
          </List>

          <div
            class="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2"
          >
            <Typography.Text type="secondary" class="text-xs">
              待审核共 {{ pendingCount }} 条 · 告警 {{ alertTotal }} 条 · 批创待确认
              {{ batchTaskTotal }} 个
            </Typography.Text>
            <Button
              size="small"
              @click="queueTab === 'pending' ? goHosting() : refreshQueue()"
            >
              {{ queueTab === 'pending' ? '查看全部' : '刷新' }}
            </Button>
          </div>
        </Card>
      </Col>

      <Col :lg="8" :xs="24">
        <Card class="h-full">
          <template #title>
            <Space :size="8">
              <span
                class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
              >
                <SyncOutlined />
              </span>
              <span>运行中</span>
            </Space>
          </template>
          <template #extra>
            <Tag color="green">{{ runningItems.length }} 个任务</Tag>
          </template>

          <Spin :spinning="runningLoading">
            <div class="max-h-[360px] overflow-y-auto pr-1">
              <div
                v-for="item in runningItems"
                :key="item.key"
                class="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium"
                >
                  {{ item.badge }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[13px] font-medium">
                    {{ item.title }}
                  </div>
                  <div class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ item.desc }}
                  </div>
                </div>
                <Tag :color="item.color" class="m-0 shrink-0">
                  {{ item.tag }}
                </Tag>
              </div>
              <Empty
                v-if="!runningLoading && !runningItems.length"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="当前没有运行中的任务"
              />
            </div>
          </Spin>
        </Card>
      </Col>
    </Row>

    <!-- 第三行：今日投放 + 最新公告 -->
    <Row :gutter="[16, 16]" align="stretch" class="mt-4">
      <Col :lg="16" :xs="24">
        <Card class="h-full">
          <template #title>
            <Space :size="8">
              <span
                class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
              >
                <LineChartOutlined />
              </span>
              <span>今日投放</span>
            </Space>
          </template>
          <template #extra>
            <Space :size="4">
              <Typography.Text type="secondary" class="text-xs">
                截至 {{ clock }}
              </Typography.Text>
              <Button size="small" type="link" @click="goUnified">
                查看报表
              </Button>
            </Space>
          </template>

          <Spin :spinning="overviewLoading">
            <Row :gutter="[12, 12]">
              <Col
                v-for="item in overviewMetricCards"
                :key="item.key"
                :md="6"
                :xs="12"
              >
                <Card class="h-full" size="small">
                  <div
                    class="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <component :is="item.icon" :class="item.tone" />
                    <span class="truncate">{{ item.title }}</span>
                  </div>
                  <div
                    class="mt-1 text-2xl font-semibold leading-tight tabular-nums"
                  >
                    {{ item.value }}
                  </div>
                  <div class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ item.foot }}
                  </div>
                </Card>
              </Col>
            </Row>

            <div class="relative mt-3 h-[160px]">
              <EchartsUI ref="chartRef" height="100%" />
              <div
                v-if="!trendLoading && trendData.length === 0"
                class="absolute inset-0 flex items-center justify-center"
              >
                <Empty
                  :image="Empty.PRESENTED_IMAGE_SIMPLE"
                  description="暂无趋势数据"
                />
              </div>
            </div>
          </Spin>
        </Card>
      </Col>

      <Col :lg="8" :xs="24">
        <Card class="h-full">
          <template #title>
            <Space :size="8">
              <span
                class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
              >
                <NotificationOutlined />
              </span>
              <span>最新公告</span>
            </Space>
          </template>
          <template #extra>
            <Button size="small" type="link" @click="goNoticeCenter">
              查看全部
            </Button>
          </template>

          <List
            :data-source="notices"
            :loading="noticesLoading"
            class="max-h-[300px] overflow-y-auto"
            size="small"
          >
            <template #renderItem="{ item }">
              <List.Item class="cursor-pointer" @click="openNotice(item)">
                <div class="min-w-0 flex-1">
                  <div class="flex min-w-0 items-center gap-2">
                    <span class="truncate text-[13px]">{{ item.title }}</span>
                    <Tag :color="noticeLevelColor(item.level)" class="m-0 shrink-0">
                      {{ noticeLevelText(item.level) }}
                    </Tag>
                  </div>
                  <div class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ noticePlainText(item.content) }}
                  </div>
                </div>
                <span class="ml-3 shrink-0 text-xs text-muted-foreground">
                  {{ shortTime(item.createTime) }}
                </span>
              </List.Item>
            </template>
          </List>
          <Empty
            v-if="!noticesLoading && !notices.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无公告"
          />
        </Card>
      </Col>
    </Row>

    <!-- 决策详情 -->
    <Drawer v-model:open="drawerOpen" :width="500">
      <template #title>
        <Space :size="8" wrap>
          <span class="text-base font-semibold">决策详情</span>
          <Tag
            v-if="activeDecision"
            :color="riskMeta(activeDecision.riskLevel).color"
          >
            {{ riskMeta(activeDecision.riskLevel).label }}
          </Tag>
          <Tag
            v-if="activeDecision?.decisionStatus"
            :color="DECISION_STATUS_MAP[activeDecision.decisionStatus]?.color"
          >
            {{ DECISION_STATUS_MAP[activeDecision.decisionStatus]?.label }}
          </Tag>
        </Space>
      </template>

      <template v-if="activeDecision">
        <Typography.Title :level="5">
          {{ activeDecision.targetName || '-' }}
        </Typography.Title>
        <div class="mt-1 text-sm text-muted-foreground">
          {{ activeDecision.advertiserName || '-' }} ·
          {{ TARGET_LEVEL_LABEL[activeDecision.targetLevel || ''] || activeDecision.targetLevel || '-' }}
          · {{ shortTime(activeDecision.createTime) }}
        </div>

        <Card class="mt-4" size="small">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium">建议动作</span>
            <Tag color="blue">
              {{ ACTION_TYPE_MAP[activeDecision.action || ''] || activeDecision.action || '-' }}
            </Tag>
          </div>
          <div class="mt-2 text-xs text-muted-foreground">
            命中规则：{{ activeDecision.ruleName || '-' }}
            <template v-if="activeDecision.ruleType">
              · {{ RULE_TYPE_MAP[activeDecision.ruleType]?.label || activeDecision.ruleType }}
            </template>
          </div>
        </Card>

        <div v-if="activeMetricItems.length" class="mt-4">
          <div class="mb-2 text-sm font-medium">指标快照</div>
          <Row :gutter="[8, 8]">
            <Col v-for="item in activeMetricItems" :key="item.key" :span="8">
              <Card class="h-full" size="small">
                <div class="text-xs text-muted-foreground">
                  {{ item.label }}
                </div>
                <div class="mt-0.5 text-base font-semibold tabular-nums">
                  {{ item.value }}
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div v-if="activeDecision.aiReason" class="mt-4">
          <div class="mb-2 text-sm font-medium">AI 判定依据</div>
          <Alert :message="activeDecision.aiReason" show-icon type="success" />
        </div>

        <div v-if="activeDecision.aiThinking" class="mt-4">
          <div class="mb-2 text-sm font-medium">AI 思考</div>
          <div class="whitespace-pre-wrap text-xs text-muted-foreground">
            {{ activeDecision.aiThinking }}
          </div>
        </div>

        <Alert
          class="mt-4"
          message="本页仅做监控与查看，审批、执行与回滚请前往 AI 智能托管审核台。"
          show-icon
          type="info"
        />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="drawerOpen = false">关闭抽屉</Button>
          <Button type="primary" @click="goHosting">前往审核台</Button>
        </div>
      </template>
    </Drawer>
    </div>
  </Page>
</template>
