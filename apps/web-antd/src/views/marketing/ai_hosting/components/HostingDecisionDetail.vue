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
  RobotOutlined,
  RiseOutlined,
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
  AUDITOR_TYPE_MAP,
  AUDIT_CONCLUSION_MAP,
  AUTO_EXECUTABLE_ACTIONS,
  DECISION_STATUS_MAP,
  RISK_LEVEL_MAP,
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
const MONEY_KEYS = new Set(["cost", "spend", "cpa", "clickCost"]);

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
    default: {
      return "gray";
    }
  }
}

function evidenceEntries(evidence?: Record<string, any>) {
  if (!evidence) {
    return [];
  }
  return Object.entries(evidence).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
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
        <Tag v-if="riskMeta" :bordered="false" :color="riskMeta.color">
          {{ riskMeta.label }}
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
      <Typography.Title :level="5">指标快照</Typography.Title>
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

    <!-- ==================== AI 审核理由 ==================== -->
    <Alert
      v-if="decision.aiReason"
      show-icon
      type="success"
      :message="decision.aiReason"
    />

    <!-- ==================== 拒绝原因 ==================== -->
    <Alert
      v-if="decision.rejectReason"
      show-icon
      type="warning"
      :message="decision.rejectReason"
    />

    <!-- ==================== 审核与执行留痕 ==================== -->
    <Flex vertical :gap="12">
      <Typography.Title :level="5">审核与执行留痕</Typography.Title>
      <Spin :spinning="auditsLoading">
        <Timeline v-if="audits.length">
          <Timeline.Item
            v-for="(audit, index) in audits"
            :key="audit.id ?? index"
            :color="auditColor(audit.conclusion)"
          >
            <template #dot>
              <component :is="auditIcon(audit.conclusion)" />
            </template>
            <Flex vertical :gap="4">
              <Space :size="8" wrap>
                <Typography.Text strong>
                  {{ AUDITOR_TYPE_MAP[audit.auditorType || ""] || audit.auditorType }}
                </Typography.Text>
                <Typography.Text type="secondary">
                  · {{ audit.auditorName || "-" }}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {{ audit.createTime }}
                </Typography.Text>
              </Space>

              <Space :size="4" wrap>
                <Tag :bordered="false">
                  {{ AUDIT_CONCLUSION_MAP[audit.conclusion || ""] || audit.conclusion }}
                </Tag>
              </Space>

              <Typography.Text v-if="audit.reason" type="secondary">
                {{ audit.reason }}
              </Typography.Text>

              <Space
                v-if="evidenceEntries(audit.evidence).length"
                :size="4"
                wrap
              >
                <Tag
                  v-for="[key, val] in evidenceEntries(audit.evidence)"
                  :key="key"
                  :bordered="false"
                >
                  {{ key }} {{ val }}
                </Tag>
              </Space>
            </Flex>
          </Timeline.Item>
        </Timeline>
        <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无留痕" />
      </Spin>
    </Flex>

    <!-- ==================== 执行结果 ==================== -->
    <Flex v-if="decision.execResult || decision.errorMsg" vertical :gap="12">
      <Typography.Title :level="5">执行结果</Typography.Title>
      <Alert v-if="decision.errorMsg" show-icon type="error" :message="decision.errorMsg" />
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
</style>
