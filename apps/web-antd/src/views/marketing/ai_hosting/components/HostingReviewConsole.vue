<script setup lang="ts" name="HostingReviewConsole">
/**
 * AI 智能托管 — 审核台
 *
 * 待审核决策的筛选、批量审批（通过并执行 / 拒绝）、详情与留痕查看。
 * - 列表：项目统一的 vxe Grid（useVbenVxeGrid，多选，仅 pending 可勾选）
 * - 详情：vben Drawer（本地使用），内容为 HostingDecisionDetail
 * - 审批：受控 Modal 二次确认（高风险强提示；拒绝原因必填）
 *
 * UI 全部由 ant-design-vue / vben 组件实现（Card / Statistic / Row / Col / Space /
 * Tag / Avatar / Typography / Alert / Modal / Timeline 等），仅保留锁定高度的布局声明。
 * 数据：decision/list（后端返回数组，前端分页）、decision/review、decision/audits
 */
import type { VbenFormProps } from "@vben/common-ui";
import type {
  HostingAudit,
  HostingDecision,
  HostingDecisionStatus,
  ReviewConclusion,
  RiskLevel
} from "#/api/models/ai_hosting";
import { computed, onMounted, ref } from "vue";

import { useVbenDrawer } from "@vben/common-ui";

import {
  AlertOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from "@ant-design/icons-vue";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Input,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Typography
} from "ant-design-vue";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { VxeGridProps } from "#/adapter/vxe-table";
import { aiHostingApi } from "#/api/core";
import { PLATFORM } from "#/constants/locales";
import { getPlatformColor, getPlatformLabel } from "#/constants/platform";
import { trimObject } from "#/utils/trim";

import {
  ACTION_TYPE_MAP,
  ACTION_TYPE_OPTIONS,
  AUTO_EXECUTABLE_ACTIONS,
  DECISION_STATUS_MAP,
  DECISION_STATUS_OPTIONS,
  RISK_LEVEL_MAP,
  RISK_LEVEL_OPTIONS,
  RULE_TYPE_MAP,
  TARGET_LEVEL_LABEL
} from "../constants";
import HostingDecisionDetail from "./HostingDecisionDetail.vue";

const emit = defineEmits<{
  /** 待审核数量变化（供页面角标 / 概览联动） */
  pendingChange: [count: number];
}>();

// ==================== 筛选表单 ====================

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
      componentProps: { class: "w-full", options: DECISION_STATUS_OPTIONS },
      defaultValue: "pending",
      fieldName: "decisionStatus",
      label: "状态"
    },
    {
      component: "ApiSelect",
      componentProps: {
        api: async (params: any) => aiHostingApi.fetchTaskList(params),
        class: "w-full",
        labelField: "name",
        params: { page: 1, pageSize: 1000 },
        placeholder: "全部任务",
        resultField: "items",
        showSearch: true,
        valueField: "id"
      },
      fieldName: "taskId",
      label: "任务"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        class: "w-full",
        options: PLATFORM,
        placeholder: "全部媒体"
      },
      fieldName: "platform",
      label: "媒体"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        class: "w-full",
        options: RISK_LEVEL_OPTIONS,
        placeholder: "全部风险"
      },
      fieldName: "riskLevel",
      label: "风险"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        class: "w-full",
        options: ACTION_TYPE_OPTIONS,
        placeholder: "全部动作"
      },
      fieldName: "action",
      label: "建议动作"
    }
  ],
  showCollapseButton: true,
  submitOnEnter: false
};

// ==================== 数据 ====================

/** 可自动执行 快捷筛选（后端无此参数，前端过滤） */
const onlyAuto = ref(false);
/** 风险快捷卡片选中态 */
const riskQuick = ref<"all" | "auto" | "high" | "medium">("all");
/** 表格已勾选记录 */
const selected = ref<HostingDecision[]>([]);
/** 待审核快照：风险概览卡与页面角标（始终取 pending） */
const pendingSnapshot = ref<HostingDecision[]>([]);

const selectedCount = computed(() => selected.value.length);
/** 已选中里的高风险条数（批量通过前提示） */
const selectedHighRiskCount = computed(
  () => selected.value.filter((d) => d.riskLevel === "high").length
);
/** 风险卡数值样式 */
const RISK_VALUE_STYLE = { fontSize: "22px", fontWeight: 700 };

/** 取消勾选 */
function clearSelection() {
  selected.value = [];
  gridApi.grid?.clearCheckboxRow?.();
}

const riskCards = computed(() => {
  const list = pendingSnapshot.value;
  return [
    {
      key: "all" as const,
      icon: SafetyCertificateOutlined,
      value: list.length,
      label: "待审核（全部）"
    },
    {
      key: "high" as const,
      icon: AlertOutlined,
      value: list.filter((d) => d.riskLevel === "high").length,
      label: "高风险 · 优先处理"
    },
    {
      key: "medium" as const,
      icon: ClockCircleOutlined,
      value: list.filter((d) => d.riskLevel === "medium").length,
      label: "中风险 · 常规"
    },
    {
      key: "auto" as const,
      icon: ThunderboltOutlined,
      value: list.filter((d) => AUTO_EXECUTABLE_ACTIONS.includes(d.action ?? ""))
        .length,
      label: "可自动执行"
    }
  ];
});

async function fetchPendingSnapshot() {
  const res = await aiHostingApi.fetchDecisionList({
    page: 1,
    pageSize: 1000,
    decisionStatus: "pending"
  });
  pendingSnapshot.value = Array.isArray(res) ? res : [];
  emit("pendingChange", pendingSnapshot.value.length);
}

function syncSelected() {
  selected.value = gridApi.grid?.getCheckboxRecords?.() ?? [];
}

const gridEvents = {
  checkboxChange: () => syncSelected(),
  checkboxAll: () => syncSelected()
};

// ==================== 表格 ====================

const gridOptions: VxeGridProps<HostingDecision> = {
  checkboxConfig: {
    highlight: true,
    // 仅待审核可勾选；已处理的决策行不可再操作
    checkMethod: ({ row }: { row: HostingDecision }) =>
      row.decisionStatus === "pending"
  },
  columns: [
    { type: "checkbox", width: 46, fixed: "left" },
    {
      align: "left",
      field: "advertiserName",
      minWidth: 260,
      slots: { default: "target" },
      title: "账户 / 目标"
    },
    {
      align: "left",
      field: "ruleName",
      minWidth: 160,
      slots: { default: "rule" },
      title: "命中规则"
    },
    { field: "action", minWidth: 170, slots: { default: "action" }, title: "建议动作" },
    { minWidth: 220, slots: { default: "snapshot" }, title: "指标快照" },
    { field: "riskLevel", slots: { default: "risk" }, title: "风险", width: 92 },
    {
      align: "left",
      field: "aiReason",
      minWidth: 220,
      slots: { default: "aiReason" },
      title: "AI 理由"
    },
    {
      field: "decisionStatus",
      slots: { default: "status" },
      title: "状态",
      width: 100
    },
    { field: "createTime", minWidth: 165, title: "创建时间" },
    { fixed: "right", slots: { default: "operation" }, title: "操作", width: 84 }
  ],
  height: "auto",
  keepSource: true,
  pagerConfig: { pageSize: 10 },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const params = trimObject((formValues ?? {}) as Record<string, any>);
        const res = await aiHostingApi.fetchDecisionList({
          page: page.currentPage,
          pageSize: page.pageSize,
          decisionStatus: params.decisionStatus as HostingDecisionStatus,
          platform: params.platform,
          riskLevel: params.riskLevel as RiskLevel,
          taskId: params.taskId
        });
        let list: HostingDecision[] = Array.isArray(res) ? res : [];
        // 服务端无 action / 可自动执行 参数，这里叠加前端过滤
        if (params.action) {
          list = list.filter((d) => d.action === params.action);
        }
        if (onlyAuto.value) {
          list = list.filter((d) =>
            AUTO_EXECUTABLE_ACTIONS.includes(d.action ?? "")
          );
        }
        const start = (page.currentPage - 1) * page.pageSize;
        return {
          items: list.slice(start, start + page.pageSize),
          total: list.length
        };
      }
    }
  },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true }
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents
});

/** 风险概览卡 → 表单筛选联动 */
async function applyRiskCard(key: "all" | "auto" | "high" | "medium") {
  riskQuick.value = key;
  onlyAuto.value = key === "auto";
  await gridApi.formApi?.resetForm();
  await gridApi.formApi?.setValues({
    decisionStatus: "pending",
    riskLevel: key === "high" || key === "medium" ? key : undefined
  });
  selected.value = [];
  gridApi.reload();
}

// ==================== 展示辅助 ====================

const METRIC_LABEL: Record<string, string> = {
  cost: "消耗",
  spend: "消耗",
  roi: "ROI",
  ctr: "CTR",
  cpa: "成本",
  activate: "激活",
  frequency: "频次",
  show: "曝光"
};
const MONEY_KEYS = new Set(["cost", "spend", "cpa"]);

function snapshotItems(snapshot?: Record<string, any>) {
  if (!snapshot) {
    return [];
  }
  return Object.entries(snapshot)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 3)
    .map(([key, value]) => {
      const num = Number(value);
      let display: string;
      if (MONEY_KEYS.has(key)) {
        display = `¥${(num / 100).toLocaleString("zh-CN", {
          maximumFractionDigits: 2
        })}`;
      } else if (Number.isFinite(num)) {
        display = num.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
      } else {
        display = String(value);
      }
      return { label: METRIC_LABEL[key] ?? key, value: display };
    });
}

function actionText(action?: string, params?: Record<string, any>) {
  const label = ACTION_TYPE_MAP[action ?? ""] ?? action ?? "-";
  if (params?.ratio) {
    const sign = label.includes("增加") || label.includes("提高") ? "+" : "-";
    return `${label} ${sign}${params.ratio}%`;
  }
  return label;
}

function isAutoAction(action?: string) {
  return AUTO_EXECUTABLE_ACTIONS.includes(action ?? "");
}

// ==================== 详情抽屉 ====================

const selectedDecision = ref<HostingDecision | null>(null);
const audits = ref<HostingAudit[]>([]);
const auditsLoading = ref(false);

const [DecisionDrawer, decisionDrawerApi] = useVbenDrawer({
  class: "w-[620px]",
  footer: true,
  showCancelButton: false,
  showConfirmButton: false,
  onOpenChange(isOpen) {
    if (!isOpen) {
      selectedDecision.value = null;
      audits.value = [];
    }
  }
});

async function loadAudits(decisionId?: number | string) {
  if (!decisionId) {
    audits.value = [];
    return;
  }
  auditsLoading.value = true;
  try {
    const res = await aiHostingApi.fetchDecisionAudits(decisionId);
    audits.value = Array.isArray(res) ? res : [];
  } finally {
    auditsLoading.value = false;
  }
}

function openDetail(record: HostingDecision) {
  selectedDecision.value = record;
  audits.value = [];
  decisionDrawerApi.open();
  void loadAudits(record.id);
}

const drawerActionable = computed(
  () => selectedDecision.value?.decisionStatus === "pending"
);

// ==================== 审批（二次确认） ====================

const review = ref<{
  conclusion: ReviewConclusion;
  ids: Array<number | string>;
  open: boolean;
  reason: string;
  submitting: boolean;
}>({
  conclusion: "approve",
  ids: [],
  open: false,
  reason: "",
  submitting: false
});

/** 本次待审批中的高风险条数 */
const reviewHighRisk = computed(() =>
  pendingSnapshot.value.filter(
    (d) =>
      review.value.ids.includes(d.id as number | string) &&
      d.riskLevel === "high"
  )
);

function openReview(conclusion: ReviewConclusion) {
  const ids = selected.value.map((d) => d.id as number | string);
  if (ids.length === 0) {
    message.warning("请先选择要处理的决策");
    return;
  }
  review.value = { conclusion, ids, open: true, reason: "", submitting: false };
}

/** 抽屉内的单条审批 */
function reviewSingle(conclusion: ReviewConclusion) {
  const id = selectedDecision.value?.id;
  if (id === undefined || id === null) {
    return;
  }
  review.value = {
    conclusion,
    ids: [id],
    open: true,
    reason: "",
    submitting: false
  };
}

async function submitReview() {
  const { conclusion, ids, reason } = review.value;
  if (conclusion === "reject" && !reason.trim()) {
    message.warning("请填写拒绝原因（用于留痕）");
    return;
  }
  review.value.submitting = true;
  try {
    const result = await aiHostingApi.fetchReviewDecision({
      ids,
      conclusion,
      reason: reason.trim() || undefined
    });
    if (conclusion === "approve") {
      message.success(`已通过并执行 ${result ?? 0} 条决策`);
    } else {
      message.success(`已拒绝 ${ids.length} 条决策`);
    }
    review.value.open = false;
    selected.value = [];
    decisionDrawerApi.close();
    gridApi.reload();
    await fetchPendingSnapshot();
  } finally {
    review.value.submitting = false;
  }
}

/** 供页面「待审核」KPI 跳转时调用：回到待审核视图 */
async function focusPending() {
  riskQuick.value = "all";
  onlyAuto.value = false;
  selected.value = [];
  await gridApi.formApi?.resetForm();
  await gridApi.formApi?.setValues({ decisionStatus: "pending" });
  gridApi.reload();
}

defineExpose({ focusPending, reload: () => gridApi.reload() });

onMounted(() => {
  void fetchPendingSnapshot();
});
</script>

<template>
  <!-- 锁高：概览固定、表格占满剩余高度并在内部滚动（与托管任务 Tab 一致） -->
  <div class="review-console">
    <!-- ==================== 风险概览卡 ==================== -->
    <Row :gutter="[16, 16]" class="risk-strip">
      <Col
        v-for="card in riskCards"
        :key="card.key"
        :lg="6"
        :md="12"
        :xs="24"
      >
        <Card
          :bordered="false"
          hoverable
          size="small"
          class="risk-card"
          :class="[`risk-card--${card.key}`, { 'is-on': riskQuick === card.key }]"
          @click="applyRiskCard(card.key)"
        >
          <Flex align="center" :gap="12">
            <span class="risk-icon">
              <component :is="card.icon" />
            </span>
            <Statistic :value="card.value" :value-style="RISK_VALUE_STYLE">
              <template #title>
                <span>{{ card.label }}</span>
              </template>
            </Statistic>
          </Flex>
        </Card>
      </Col>
    </Row>

    <!-- ==================== 决策列表（统一 vxe Grid） ==================== -->
    <div class="grid-wrap">
      <Grid>
        <!-- 账户 / 目标 -->
        <template #target="{ row }">
          <Space>
            <Avatar size="small">
              {{ (row.advertiserName || "?").slice(0, 1) }}
            </Avatar>
            <Space direction="vertical" :size="0">
              <Space :size="4">
                <Typography.Text strong>
                  {{ row.advertiserName || "-" }}
                </Typography.Text>
                <Tag :bordered="false" :color="getPlatformColor(row.platform)">
                  {{ getPlatformLabel(row.platform) }}
                </Tag>
              </Space>
              <Typography.Text type="secondary">
                {{ TARGET_LEVEL_LABEL[row.targetLevel || ""] || row.targetLevel || "-" }}
                · {{ row.targetName || "-" }}
              </Typography.Text>
            </Space>
          </Space>
        </template>

        <!-- 命中规则 -->
        <template #rule="{ row }">
          <Space direction="vertical" :size="0">
            <Typography.Text>{{ row.ruleName || "-" }}</Typography.Text>
            <Typography.Text type="secondary">
              {{ RULE_TYPE_MAP[row.ruleType || ""]?.label || row.ruleType || "-" }}
            </Typography.Text>
          </Space>
        </template>

        <!-- 建议动作 -->
        <template #action="{ row }">
          <Space :size="4">
            <Typography.Text>
              {{ actionText(row.action, row.params) }}
            </Typography.Text>
            <Tag v-if="isAutoAction(row.action)" :bordered="false" color="cyan">
              可自动
            </Tag>
          </Space>
        </template>

        <!-- 指标快照 -->
        <template #snapshot="{ row }">
          <Space v-if="snapshotItems(row.metricSnapshot).length" :size="16">
            <Space
              v-for="item in snapshotItems(row.metricSnapshot)"
              :key="item.label"
              direction="vertical"
              :size="0"
            >
              <Typography.Text type="secondary">
                {{ item.label }}
              </Typography.Text>
              <Typography.Text strong>{{ item.value }}</Typography.Text>
            </Space>
          </Space>
          <Typography.Text v-else type="secondary">-</Typography.Text>
        </template>

        <!-- 风险 -->
        <template #risk="{ row }">
          <Tag
            :bordered="false"
            :color="RISK_LEVEL_MAP[row.riskLevel || '']?.color || 'default'"
          >
            {{ RISK_LEVEL_MAP[row.riskLevel || '']?.label || row.riskLevel || "-" }}
          </Tag>
        </template>

        <!-- AI 理由（超长由表格 showOverflow 自动省略 + 悬浮提示） -->
        <template #aiReason="{ row }">
          <Typography.Text>{{ row.aiReason || "-" }}</Typography.Text>
        </template>

        <!-- 状态 -->
        <template #status="{ row }">
          <Tag
            :bordered="false"
            :color="DECISION_STATUS_MAP[row.decisionStatus || '']?.color || 'default'"
          >
            {{ DECISION_STATUS_MAP[row.decisionStatus || '']?.label || row.decisionStatus }}
          </Tag>
        </template>

        <!-- 操作 -->
        <template #operation="{ row }">
          <Button type="link" size="small" @click="openDetail(row)">详情</Button>
        </template>
      </Grid>
    </div>

    <!-- ==================== 底部批量操作条 ==================== -->
    <Flex
      v-if="selectedCount > 0"
      align="center"
      class="bulk-bar"
      justify="space-between"
    >
      <Space :size="12">
        <Typography.Text>
          已选 <Typography.Text strong>{{ selectedCount }}</Typography.Text> 条决策
        </Typography.Text>
        <Typography.Text v-if="selectedHighRiskCount > 0" type="warning">
          其中高风险 {{ selectedHighRiskCount }} 条，请谨慎确认
        </Typography.Text>
      </Space>
      <Space>
        <Button @click="clearSelection">取消选择</Button>
        <Button danger @click="openReview('reject')">批量拒绝</Button>
        <Button type="primary" @click="openReview('approve')">
          批量通过并执行
        </Button>
      </Space>
    </Flex>

    <!-- ==================== 详情抽屉 ==================== -->
    <DecisionDrawer title="决策详情">
      <HostingDecisionDetail
        :decision="selectedDecision"
        :audits="audits"
        :audits-loading="auditsLoading"
      />
      <template #footer>
        <Space>
          <Typography.Text type="secondary">
            {{ drawerActionable
              ? (selectedDecision?.riskLevel === "high"
                ? "高风险决策，通过后将立即执行"
                : "通过后将立即下发执行，请确认")
              : `该决策已处理（${DECISION_STATUS_MAP[selectedDecision?.decisionStatus || ""]?.label || "-"}），无需操作` }}
          </Typography.Text>
          <template v-if="drawerActionable">
            <Button danger @click="reviewSingle('reject')">拒绝</Button>
            <Button type="primary" @click="reviewSingle('approve')">
              通过并执行
            </Button>
          </template>
          <Button v-else @click="decisionDrawerApi.close()">关闭</Button>
        </Space>
      </template>
    </DecisionDrawer>

    <!-- ==================== 二次确认 ==================== -->
    <Modal
      v-model:open="review.open"
      :title="review.conclusion === 'approve' ? '确认通过并执行' : '确认拒绝'"
      :confirm-loading="review.submitting"
      :ok-text="review.conclusion === 'approve' ? '通过并执行' : '确认拒绝'"
      :ok-button-props="{ danger: review.conclusion === 'reject' }"
      cancel-text="取消"
      centered
      @ok="submitReview"
    >
      <Flex vertical :gap="12">
        <Alert
          :description="review.conclusion === 'approve'
            ? '通过后立即向媒体下发执行，动作不可自动回滚。'
            : '拒绝后不执行任何媒体动作，原因会写入留痕。'"
          show-icon
          :type="review.conclusion === 'approve' ? 'warning' : 'error'"
          :message="`本次将处理 ${review.ids.length} 条决策`"
        />

        <Alert
          v-if="review.conclusion === 'approve' && reviewHighRisk.length"
          show-icon
          type="error"
          :message="`包含 ${reviewHighRisk.length} 条高风险决策`"
        >
          <template #description>
            <Space direction="vertical" :size="0">
              <Space v-for="item in reviewHighRisk" :key="item.id" :size="4">
                <span>{{ item.advertiserName }}</span>
                <Typography.Text strong>{{ item.targetName }}</Typography.Text>
              </Space>
            </Space>
          </template>
        </Alert>

        <Input.TextArea
          v-if="review.conclusion === 'reject'"
          v-model:value="review.reason"
          :rows="3"
          placeholder="请填写拒绝原因（必填），用于留痕"
        />
      </Flex>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
/* 仅保留锁定高度所需的布局声明，其余视觉按原型图微调（全部取设计 token） */
.review-console {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.risk-strip {
  flex: none;
  /* 与下方表格留出间距，避免卡片贴住表头 */
  margin-bottom: 16px;
}

.grid-wrap {
  flex: 1;
  min-height: 0;
}

/* ==================== 风险概览卡 ==================== */
.risk-card {
  height: 100%;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius, 0.75rem);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: hsl(var(--primary));
  }

  &.is-on {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 12%);
  }

  :deep(.ant-statistic-title) {
    font-size: 12px;
  }
}

.risk-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.risk-card--all .risk-icon {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.risk-card--high .risk-icon {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 12%);
}

.risk-card--medium .risk-icon {
  color: hsl(var(--warning));
  background: hsl(var(--warning) / 16%);
}

.risk-card--auto .risk-icon {
  color: hsl(var(--success));
  background: hsl(var(--success) / 14%);
}

/* ==================== 底部批量操作条 ==================== */
.bulk-bar {
  position: sticky;
  bottom: 0;
  z-index: 5;
  flex: none;
  padding: 12px 18px;
  margin-top: 16px;
  /* 柔和 tint，前景色继承主题，深浅色都成立 */
  background: hsl(var(--primary) / 8%);
  border: 1px solid hsl(var(--primary) / 25%);
  border-radius: var(--radius, 0.75rem);
  box-shadow: 0 8px 24px hsl(var(--primary) / 12%);
}
</style>
