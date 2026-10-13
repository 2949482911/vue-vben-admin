<script setup lang="ts" name="HostingDecisionDetail">
/**
 * AI 智能托管 — 决策详情（审核台抽屉内容）
 *
 * 纯展示组件，全部由 ant-design-vue 组件实现（Flex / Space / Typography / Alert /
 * Descriptions / Timeline / Tag / Spin / Empty），不写自定义样式。
 * 审批动作由使用方（HostingReviewConsole）在抽屉 footer 中承载。
 */
import type { HostingAudit, HostingDecision } from "#/api/models/ai_hosting";

import { computed } from "vue";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileAddOutlined,
  InfoCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  RobotOutlined,
  RollbackOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined
} from "@ant-design/icons-vue";
import {
  Alert,
  Col,
  Descriptions,
  Empty,
  Flex,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
  Typography
} from "ant-design-vue";

import { getPlatformColor, getPlatformLabel } from "#/constants/platform";

import {
  ACTION_TYPE_MAP,
  AUDIT_CONCLUSION_COLOR,
  AUDIT_CONCLUSION_MAP,
  AUDITOR_TYPE_COLOR,
  AUDITOR_TYPE_MAP,
  AUTO_EXECUTABLE_ACTIONS,
  DECISION_STATUS_MAP,
  EFFECT_VERDICT_MAP,
  EXECUTED_BY_MAP,
  isQuotaBlocked,
  RISK_LEVEL_MAP,
  ROLLBACK_STATUS_MAP,
  RULE_TYPE_MAP,
  TARGET_LEVEL_LABEL
} from "../constants";

const props = defineProps<{
  decision: HostingDecision | null;
  audits: HostingAudit[];
  auditsLoading?: boolean;
}>();

/** 指标快照字段 → 中文名 */
const METRIC_LABEL: Record<string, string> = {
  cost: "消耗",
  spend: "消耗",
  roi: "ROI",
  ctr: "CTR",
  cpa: "转化成本",
  activate: "激活数",
  frequency: "曝光频次",
  show: "曝光",
  click: "点击",
  clickCost: "点击成本"
};

/** 金额类指标（分 → 元） */
const MONEY_KEYS = new Set(["clickCost", "cost", "cpa", "spend"]);

function fmtNumber(value: number): string {
  return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

function fmtMoney(cents: number): string {
  return `¥${(cents / 100).toLocaleString("zh-CN", {
    maximumFractionDigits: 2
  })}`;
}

const statusMeta = computed(() =>
  DECISION_STATUS_MAP[props.decision?.decisionStatus ?? ""] ?? {
    label: props.decision?.decisionStatus ?? "-",
    color: "default"
  }
);

const riskMeta = computed(() =>
  RISK_LEVEL_MAP[props.decision?.riskLevel ?? ""] ?? null
);

/** 指标快照 → [{ label, value }] */
const metricItems = computed(() => {
  const snapshot = props.decision?.metricSnapshot ?? {};
  return Object.entries(snapshot)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => {
      const num = Number(value);
      let display: string;
      if (MONEY_KEYS.has(key)) {
        display = `¥${(num / 100).toLocaleString("zh-CN", {
          maximumFractionDigits: 2
        })}`;
      } else if (key === "ctr" || key.endsWith("Rate")) {
        display = `${num}%`;
      } else if (Number.isFinite(num)) {
        display = num.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
      } else {
        display = String(value);
      }
      return { key, label: METRIC_LABEL[key] ?? key, value: display };
    });
});

/** 效果回评：before→after 展示项（有值才出） */
const effectRows = computed(() => {
  const d = props.decision;
  if (!d) {
    return [];
  }
  const rows: { key: string; label: string; value: string }[] = [];
  if (d.beforeRoi !== null && d.beforeRoi !== undefined) {
    rows.push({ key: "beforeRoi", label: "操作前 ROI", value: fmtNumber(d.beforeRoi) });
  }
  if (d.afterRoi !== null && d.afterRoi !== undefined) {
    rows.push({ key: "afterRoi", label: "操作后 ROI", value: fmtNumber(d.afterRoi) });
  }
  if (d.beforeCost !== null && d.beforeCost !== undefined) {
    rows.push({ key: "beforeCost", label: "操作前消耗", value: fmtMoney(d.beforeCost) });
  }
  if (d.afterCost !== null && d.afterCost !== undefined) {
    rows.push({ key: "afterCost", label: "操作后消耗", value: fmtMoney(d.afterCost) });
  }
  return rows;
});

/** 是否展示「效果回评」区块 */
const hasEffect = computed(
  () =>
    !!props.decision?.effectVerdict ||
    (props.decision?.feedbackEvaluated ?? 0) === 1 ||
    effectRows.value.length > 0
);

const actionMeta = computed(() => {
  const action = props.decision?.action ?? "";
  return {
    label: ACTION_TYPE_MAP[action] ?? action ?? "-",
    auto: AUTO_EXECUTABLE_ACTIONS.includes(action),
    ratio: props.decision?.params?.ratio
  };
});

const actionIcon = computed(() => {
  switch (props.decision?.action) {
    case "pause_ad": {
      return PauseCircleOutlined;
    }
    case "resume_ad": {
      return PlayCircleOutlined;
    }
    case "increase_bid":
    case "decrease_bid": {
      return RiseOutlined;
    }
    case "increase_budget":
    case "decrease_budget": {
      return WalletOutlined;
    }
    default: {
      return InfoCircleOutlined;
    }
  }
});

/** 留痕结论 → 时间线节点图标 */
function auditIcon(conclusion?: string) {
  switch (conclusion) {
    case "created": {
      return FileAddOutlined;
    }
    case "ai_approve":
    case "ai_reject": {
      return RobotOutlined;
    }
    case "human_approve":
    case "human_reject": {
      return UserOutlined;
    }
    case "execute_success": {
      return CheckCircleOutlined;
    }
    case "execute_failed": {
      return CloseCircleOutlined;
    }
    case "rollback": {
      return RollbackOutlined;
    }
    default: {
      return SettingOutlined;
    }
  }
}

function auditColor(conclusion?: string): string {
  switch (conclusion) {
    case "ai_approve": {
      return "blue";
    }
    case "human_approve":
    case "execute_success": {
      return "green";
    }
    case "human_reject": {
      return "orange";
    }
    case "ai_reject":
    case "execute_failed": {
      return "red";
    }
    case "rollback": {
      return "cyan";
    }
    default: {
      return "gray";
    }
  }
}

/** 留痕结论 → 节点色调 class（决定圆点配色） */
function auditTone(conclusion?: string): string {
  switch (conclusion) {
    case "ai_approve":
    case "ai_reject": {
      return "ai";
    }
    case "human_approve":
    case "human_reject": {
      return "human";
    }
    case "execute_success": {
      return "ok";
    }
    case "execute_failed": {
      return "err";
    }
    case "rollback": {
      return "human";
    }
    default: {
      return "system";
    }
  }
}

function evidenceEntries(evidence?: Record<string, any>) {
  if (!evidence) {
    return [];
  }
  return Object.entries(evidence).filter(
    ([k, v]) => k !== "aiThinking" && v !== null && v !== undefined && v !== ""
  );
}

/** 依据字段名 → 中文标签 */
const EVIDENCE_LABEL: Record<string, string> = {
  aiReason: "AI 判定依据",
  aiRiskLevel: "AI 风险",
  aiExecute: "可自动执行",
  aiAction: "AI 动作",
  aiParams: "AI 参数",
  aiConfidence: "AI 置信度",
  aiThinking: "AI 思考"
};

function evidenceLabel(key: string): string {
  return EVIDENCE_LABEL[key] ?? key;
}

/** 依据 chip 颜色（antd 预设色名）：风险 / 布尔 / 指标 语义着色 */
function evidenceTone(key: string, value: unknown): string {
  const k = String(key).toLowerCase();
  const v = String(value ?? "").trim().toLowerCase();
  if (k.includes("risk")) {
    if (v === "high") {
      return "red";
    }
    if (v === "medium") {
      return "orange";
    }
    if (v === "low") {
      return "green";
    }
  }
  if (k === "aiexecute") {
    return v === "true" ? "green" : "red";
  }
  if (/平台_|roi|消耗|展现|点击|转化/i.test(String(key))) {
    return "blue";
  }
  return "default";
}

/** 过长取值（叙事 / 名称）不塞 chip，改为「标签 + 可换行文本」 */
const EVIDENCE_LONG_LEN = 24;

function evidenceShort(evidence?: Record<string, any>) {
  return evidenceEntries(evidence).filter(
    ([, v]) => String(v).length <= EVIDENCE_LONG_LEN
  );
}

function evidenceLong(evidence?: Record<string, any>) {
  return evidenceEntries(evidence).filter(
    ([, v]) => String(v).length > EVIDENCE_LONG_LEN
  );
}
</script>

<template>
  <Flex v-if="decision" vertical :gap="20">
    <!-- ==================== 目标概览 ==================== -->
    <Flex vertical :gap="8">
      <Space :size="4" wrap>
        <Tag :bordered="false" :color="getPlatformColor(decision.platform)">
          {{ getPlatformLabel(decision.platform) }}
        </Tag>
        <Tag :bordered="false" :color="statusMeta.color">{{ statusMeta.label }}</Tag>
        <Tag v-if="isQuotaBlocked(decision.errorMsg)" :bordered="false" color="orange">
          限额拦截
        </Tag>
        <Tag v-if="riskMeta" :bordered="false" :color="riskMeta.color">
          {{ riskMeta.label }}
        </Tag>
        <Tag
          v-if="decision.executedBy"
          :bordered="false"
          :color="EXECUTED_BY_MAP[decision.executedBy || '']?.color || 'default'"
        >
          {{ EXECUTED_BY_MAP[decision.executedBy || '']?.label || decision.executedBy }}
        </Tag>
        <Tag
          v-if="decision.rollbackStatus && decision.rollbackStatus !== 'none'"
          :bordered="false"
          :color="ROLLBACK_STATUS_MAP[decision.rollbackStatus || '']?.color || 'default'"
        >
          {{ ROLLBACK_STATUS_MAP[decision.rollbackStatus || '']?.label || decision.rollbackStatus }}
        </Tag>
        <Typography.Text type="secondary">决策单 #{{ decision.id }}</Typography.Text>
      </Space>

      <Typography.Title :level="5">
        {{ decision.targetName || "-" }}
      </Typography.Title>

      <Space :size="8" wrap>
        <Typography.Text type="secondary">
          {{ decision.advertiserName || "-" }}
        </Typography.Text>
        <Typography.Text type="secondary">
          {{ TARGET_LEVEL_LABEL[decision.targetLevel || ""] || decision.targetLevel || "-" }}
          · {{ decision.targetId || "-" }}
        </Typography.Text>
        <Typography.Text v-if="decision.taskId" type="secondary">
          任务 {{ decision.taskId }}
        </Typography.Text>
        <Typography.Text v-if="decision.rollbackDeadline" type="secondary">
          可回滚至 {{ decision.rollbackDeadline }}
        </Typography.Text>
      </Space>
    </Flex>

    <!-- ==================== 建议动作 ==================== -->
    <Alert type="info" show-icon>
      <template #message>
        <Space :size="4" wrap>
          <component :is="actionIcon" />
          <Typography.Text strong>{{ actionMeta.label }}</Typography.Text>
          <Typography.Text v-if="actionMeta.ratio" type="secondary">
            {{ actionMeta.label.includes("增加") || actionMeta.label.includes("提高") ? "+" : "-" }}{{ actionMeta.ratio }}%
          </Typography.Text>
          <Tag v-if="actionMeta.auto" :bordered="false" color="cyan">可自动执行</Tag>
        </Space>
      </template>
      <template #description>
        命中规则「{{ decision.ruleName || "-" }}」（{{ RULE_TYPE_MAP[decision.ruleType || ""]?.label || decision.ruleType || "-" }}）
      </template>
    </Alert>

    <!-- ==================== 指标快照 ==================== -->
    <Flex v-if="metricItems.length" vertical :gap="12">
      <Typography.Title :level="5" class="section-title">指标快照</Typography.Title>
      <Row :gutter="[12, 12]">
        <Col v-for="item in metricItems" :key="item.key" :sm="8" :xs="12">
          <div class="metric-tile">
            <Statistic :value="item.value">
              <template #title>{{ item.label }}</template>
            </Statistic>
          </div>
        </Col>
      </Row>
    </Flex>

    <!-- ==================== 效果回评（执行后回评） ==================== -->
    <Flex v-if="hasEffect" vertical :gap="12">
      <Space :size="8" align="center" wrap>
        <Typography.Title :level="5" class="section-title">效果回评</Typography.Title>
        <Tag
          v-if="decision.effectVerdict"
          :bordered="false"
          :color="EFFECT_VERDICT_MAP[decision.effectVerdict || '']?.color || 'default'"
        >
          {{ EFFECT_VERDICT_MAP[decision.effectVerdict || '']?.label || decision.effectVerdict }}
        </Tag>
      </Space>

      <Row v-if="effectRows.length" :gutter="[12, 12]">
        <Col v-for="item in effectRows" :key="item.key" :sm="8" :xs="12">
          <div class="metric-tile">
            <Statistic :value="item.value">
              <template #title>{{ item.label }}</template>
            </Statistic>
          </div>
        </Col>
      </Row>

      <Typography.Text v-if="decision.effectEvaluatedAt" type="secondary">
        回评时间：{{ decision.effectEvaluatedAt }}
      </Typography.Text>
      <Typography.Text v-else type="secondary">
        尚未回评（真实执行后按观察窗口自动回评）
      </Typography.Text>
    </Flex>

    <!-- ==================== AI 审核理由 ==================== -->
    <Alert
      v-if="decision.aiReason"
      show-icon
      type="success"
      :message="decision.aiReason"
    />

    <!-- ==================== AI 思考 ==================== -->
    <Flex v-if="decision.aiThinking" vertical :gap="8">
      <Typography.Title :level="5" class="section-title">AI 思考</Typography.Title>
      <Typography.Paragraph class="ai-thinking">
        {{ decision.aiThinking }}
      </Typography.Paragraph>
    </Flex>

    <!-- ==================== 拒绝原因 ==================== -->
    <Alert
      v-if="decision.rejectReason"
      show-icon
      type="warning"
      :message="decision.rejectReason"
    />

    <!-- ==================== 审核与执行留痕 ==================== -->
    <Flex vertical :gap="12">
      <Typography.Title :level="5" class="section-title">审核与执行留痕</Typography.Title>
      <Spin :spinning="auditsLoading">
        <Timeline v-if="audits.length" class="audit-timeline">
          <Timeline.Item
            v-for="(audit, index) in audits"
            :key="audit.id ?? index"
            :color="auditColor(audit.conclusion)"
          >
            <template #dot>
              <span
                class="audit-dot"
                :class="`audit-dot--${auditTone(audit.conclusion)}`"
              >
                <component :is="auditIcon(audit.conclusion)" />
              </span>
            </template>
            <div class="audit-card">
              <div class="audit-card__head">
                <Space :size="8" wrap>
                  <Tag
                    :bordered="false"
                    :color="AUDITOR_TYPE_COLOR[audit.auditorType || ''] || 'default'"
                  >
                    {{ AUDITOR_TYPE_MAP[audit.auditorType || ""] || audit.auditorType || "-" }}
                  </Tag>
                  <Typography.Text strong>
                    {{ audit.auditorName || "-" }}
                  </Typography.Text>
                </Space>
                <Typography.Text class="audit-time" type="secondary">
                  {{ audit.createTime || "-" }}
                </Typography.Text>
              </div>

              <Tag
                :bordered="false"
                :color="AUDIT_CONCLUSION_COLOR[audit.conclusion || ''] || 'default'"
              >
                {{ AUDIT_CONCLUSION_MAP[audit.conclusion || ""] || audit.conclusion || "-" }}
              </Tag>

              <Typography.Text
                v-if="audit.reason"
                class="audit-reason"
                type="secondary"
              >
                {{ audit.reason }}
              </Typography.Text>

              <div
                v-if="evidenceShort(audit.evidence).length"
                class="audit-evidence"
              >
                <Tag
                  v-for="[key, val] in evidenceShort(audit.evidence)"
                  :key="key"
                  :bordered="false"
                  :color="evidenceTone(key, val)"
                >
                  {{ evidenceLabel(key) }} {{ val }}
                </Tag>
              </div>

              <div
                v-for="[key, val] in evidenceLong(audit.evidence)"
                :key="key"
                class="audit-evidence-row"
              >
                <span class="audit-evidence-row__k">
                  {{ evidenceLabel(key) }}
                </span>
                <span class="audit-evidence-row__v">{{ val }}</span>
              </div>
            </div>
          </Timeline.Item>
        </Timeline>
        <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无留痕" />
      </Spin>
    </Flex>

    <!-- ==================== 执行结果 ==================== -->
    <Flex v-if="decision.execResult || decision.errorMsg" vertical :gap="12">
      <Typography.Title :level="5" class="section-title">执行结果</Typography.Title>
      <Alert
        v-if="decision.errorMsg"
        show-icon
        :type="isQuotaBlocked(decision.errorMsg) ? 'warning' : 'error'"
        :message="decision.errorMsg"
      />
      <Descriptions v-else bordered :column="1" size="small">
        <Descriptions.Item
          v-for="(val, key) in decision.execResult"
          :key="key"
          :label="String(key)"
        >
          {{ val }}
        </Descriptions.Item>
      </Descriptions>
    </Flex>
  </Flex>
</template>

<style scoped lang="scss">
/* 指标快照卡片：仅做原型图的卡片外观微调，颜色取设计 token */
.metric-tile {
  height: 100%;
  padding: 12px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);

  :deep(.ant-statistic-title) {
    margin-bottom: 4px;
    font-size: 11.5px;
  }

  :deep(.ant-statistic-content) {
    font-size: 18px;
    font-weight: 600;
  }
}

/* 分区标题：主题色前缀条 */
.section-title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;

  &::before {
    width: 3px;
    height: 14px;
    background: hsl(var(--primary));
    border-radius: 2px;
    content: '';
  }
}

/* 审核留痕时间线：节点着色 + 卡片化 */
.audit-timeline {
  :deep(.ant-timeline-item) {
    padding-bottom: 16px;
  }

  :deep(.ant-timeline-item:last-child) {
    padding-bottom: 0;
  }

  :deep(.ant-timeline-item-tail) {
    border-inline-start-color: hsl(var(--border));
  }
}

.audit-dot {
  display: inline-flex;
  font-size: 14px;
}

.audit-dot--system {
  color: hsl(var(--muted-foreground));
}

.audit-dot--ai {
  color: hsl(var(--primary));
}

.audit-dot--human {
  color: hsl(var(--warning));
}

.audit-dot--ok {
  color: hsl(var(--success));
}

.audit-dot--err {
  color: hsl(var(--destructive));
}

.audit-card {
  padding: 12px 14px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.audit-card__head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.audit-time {
  font-size: 12px;
}

.audit-reason {
  display: block;
  margin-top: 8px;
}

.audit-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.audit-evidence-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
}

.audit-evidence-row__k {
  flex: none;
  color: hsl(var(--muted-foreground));
}

.audit-evidence-row__v {
  color: hsl(var(--foreground));
  word-break: break-word;
}

/* AI 思考：保留分步换行 */
.ai-thinking {
  margin: 0;
  color: hsl(var(--foreground));
  white-space: pre-wrap;
}
</style>
