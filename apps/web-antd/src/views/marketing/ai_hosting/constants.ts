/**
 * AI 智能托管 — 常量配置
 *
 * 规则类型、执行模式、状态等枚举的中文映射
 * 供列表页和创建抽屉共用
 */

import type {
  ActionType,
  AlertMethod,
  AlertMethodItem,
  ExecutionMode,
  HostingDecisionStatus,
  HostingStatus,
  HostingTarget,
  RiskLevel,
  RulesMode,
  RuleType
} from "#/api/models/ai_hosting";

// ==================== 选项配置 ====================

/** 监控目标层级选项 */
export const TARGET_LEVEL_OPTIONS = [
  { label: "账户", value: "advertiser" as HostingTarget },
  { label: "计划", value: "campaign" as HostingTarget },
  { label: "广告", value: "promotion" as HostingTarget }
];

/** 监控目标层级 → 提示文案 */
export const TARGET_LEVEL_HINT: Record<HostingTarget, string> = {
  advertiser: "托管到账户：该账户下全部计划与广告自动纳入托管",
  campaign: "托管到计划：仅所选计划纳入监控，广告层级自动跟随",
  promotion: "托管到广告：精确到单条广告，适合重点素材精细调优"
};

/** 监控目标层级 → 该层级对象称谓 */
export const TARGET_LEVEL_NAME: Record<HostingTarget, string> = {
  advertiser: "账户",
  campaign: "计划",
  promotion: "广告"
};

/** 规则判定模式选项 */
export const RULES_MODE_OPTIONS = [
  { label: "全部满足", value: "all" as RulesMode },
  { label: "任一", value: "any" as RulesMode }
];

/** 规则判定模式 → 提示文案 */
export const RULES_MODE_HINT: Record<RulesMode, string> = {
  all: "规则全部命中后才触发执行",
  any: "任意一条规则命中即触发执行"
};

/** 单次最多可监控的目标数 */
export const MAX_TARGET_COUNT = 100;

/** 执行模式选项 */
export const EXECUTION_MODE_OPTIONS = [
  { label: "全自动", value: "auto" as ExecutionMode },
  { label: "人工确认", value: "manual" as ExecutionMode },
  { label: "混合策略", value: "hybrid" as ExecutionMode }
];

/** 托管状态选项 */
export const HOSTING_STATUS_OPTIONS = [
  { label: "运行中", value: "running" as HostingStatus },
  { label: "已暂停", value: "paused" as HostingStatus },
  { label: "已结束", value: "ended" as HostingStatus },
  { label: "异常", value: "error" as HostingStatus }
];

/** 规则类型选项 */
export const RULE_TYPE_OPTIONS = [
  { label: "自动止损", value: "stop_loss" as RuleType, color: "red" },
  { label: "预算优化", value: "budget_optimize" as RuleType, color: "blue" },
  { label: "出价调整", value: "bid_adjust" as RuleType, color: "orange" },
  { label: "起量追投", value: "scale_up" as RuleType, color: "green" }
];

/** 动作类型选项 */
export const ACTION_TYPE_OPTIONS = [
  { label: "暂停广告", value: "pause_ad" as ActionType },
  { label: "恢复广告", value: "resume_ad" as ActionType },
  { label: "增加预算", value: "increase_budget" as ActionType },
  { label: "减少预算", value: "decrease_budget" as ActionType },
  { label: "提高出价", value: "increase_bid" as ActionType },
  { label: "降低出价", value: "decrease_bid" as ActionType },
  { label: "复制计划", value: "duplicate_ad" as ActionType },
  { label: "删除广告", value: "delete_promotion" as ActionType },
  { label: "删除广告组", value: "delete_adgroup" as ActionType },
  { label: "仅告警", value: "alert" as ActionType }
];

// ==================== 通知方式 ====================

/** 通知方式选项（邮箱 / 飞书 webhook / 钉钉 webhook），命中告警与执行成功时推送 */
export const ALERT_METHOD_OPTIONS: Array<{
  color: string;
  label: string;
  placeholder: string;
  value: AlertMethod;
}> = [
  {
    color: "blue",
    label: "邮箱",
    placeholder: "请输入邮箱地址",
    value: "email"
  },
  {
    color: "cyan",
    label: "飞书",
    placeholder: "请输入飞书机器人 Webhook 地址",
    value: "feishu"
  },
  {
    color: "purple",
    label: "钉钉",
    placeholder: "请输入钉钉机器人 Webhook 地址",
    value: "dingtalk"
  }
];

/** 通知方式 → 地址输入占位提示 */
export const ALERT_VALUE_PLACEHOLDER: Record<AlertMethod, string> = {
  email: "请输入邮箱地址",
  dingtalk: "请输入钉钉机器人 Webhook 地址",
  feishu: "请输入飞书机器人 Webhook 地址"
};

/** 新增一条默认通知方式（邮箱、空地址） */
export function createDefaultAlertMethod(): AlertMethodItem {
  return { alert_method: "email", alert_value: "" };
}

// ==================== 标签映射 ====================

/** 规则类型 → { label, color } */
export const RULE_TYPE_MAP: Record<string, { label: string; color: string }> =
  Object.fromEntries(RULE_TYPE_OPTIONS.map((r) => [r.value, r]));

/** 执行模式 → label */
export const EXECUTION_MODE_MAP: Record<string, string> =
  Object.fromEntries(EXECUTION_MODE_OPTIONS.map((m) => [m.value, m.label]));

/** 托管状态 → { label, color } */
export const HOSTING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  running: { label: "运行中", color: "green" },
  paused: { label: "已暂停", color: "default" },
  ended: { label: "已结束", color: "blue" },
  error: { label: "异常", color: "red" }
};

/** 动作类型 → label */
export const ACTION_TYPE_MAP: Record<string, string> =
  Object.fromEntries(ACTION_TYPE_OPTIONS.map((a) => [a.value, a.label]));

// ==================== 可监控指标 ====================

/** 规则条件可选的指标字段 */
export const METRIC_OPTIONS = [
  { label: "平台_展现", value: "AdShow" },
  { label: "平台_消耗", value: "AdCost" },
  { label: "平台_点击", value: "AdClick" },
  { label: "平台_注册量", value: "AdRegister" },
  { label: "平台_点击率", value: "AdCtr" },
  { label: "平台_ECPM", value: "AdEcpm" },
  { label: "平台_ROI", value: "AdPayRoi" },
  { label: "平台_点击均价(元)", value: "AdCap" },
  { label: "平台_千次展示均价", value: "AdThousandPrice" },
  { label: "平台_点击成本", value: "AdClickCost" },
  { label: "平台_激活数", value: "AdActivate" }
];

/** 比较符选项 */
export const OPERATOR_OPTIONS = [
  { label: "大于", value: "gt" },
  { label: "大于等于", value: "gte" },
  { label: "小于", value: "lt" },
  { label: "小于等于", value: "lte" },
  { label: "等于", value: "eq" },
  { label: "不等于", value: "neq" }
];

// ==================== 决策单 / 审核台 ====================

/** 决策单状态选项（含 Tag 颜色） */
export const DECISION_STATUS_OPTIONS: Array<{
  color: string;
  label: string;
  value: HostingDecisionStatus;
}> = [
  { label: "待审核", value: "pending", color: "orange" },
  { label: "已批准", value: "approved", color: "blue" },
  { label: "已拒绝", value: "rejected", color: "default" },
  { label: "执行中", value: "executing", color: "cyan" },
  { label: "已执行", value: "executed", color: "green" },
  { label: "执行失败", value: "failed", color: "red" },
  { label: "已过期", value: "expired", color: "default" }
];

/** 决策单状态 → { label, color } */
export const DECISION_STATUS_MAP: Record<string, { color: string; label: string }> =
  Object.fromEntries(DECISION_STATUS_OPTIONS.map((s) => [s.value, s]));

/** 风险等级选项 */
export const RISK_LEVEL_OPTIONS: Array<{
  color: string;
  label: string;
  value: RiskLevel;
}> = [
  { label: "高风险", value: "high", color: "red" },
  { label: "中风险", value: "medium", color: "orange" },
  { label: "低风险", value: "low", color: "green" }
];

/** 风险等级 → { label, color } */
export const RISK_LEVEL_MAP: Record<string, { color: string; label: string }> =
  Object.fromEntries(RISK_LEVEL_OPTIONS.map((r) => [r.value, r]));

/** 审核留痕结论 → 中文 */
export const AUDIT_CONCLUSION_MAP: Record<string, string> = {
  created: "创建决策单",
  ai_approve: "AI 审核通过",
  ai_reject: "AI 审核拒绝",
  human_approve: "人工通过",
  human_reject: "人工拒绝",
  execute_success: "执行成功",
  execute_failed: "执行失败",
  rollback: "回滚"
};

/** 审核者类型 → 中文 */
export const AUDITOR_TYPE_MAP: Record<string, string> = {
  SYSTEM: "系统",
  AI: "AI",
  HUMAN: "人工"
};

/** 审核者类型 → Tag 颜色（antd 预设色名） */
export const AUDITOR_TYPE_COLOR: Record<string, string> = {
  SYSTEM: "default",
  AI: "geekblue",
  HUMAN: "purple"
};

/** 留痕结论 → Tag 颜色（antd 预设色名） */
export const AUDIT_CONCLUSION_COLOR: Record<string, string> = {
  created: "geekblue",
  ai_approve: "blue",
  ai_reject: "volcano",
  human_approve: "green",
  human_reject: "orange",
  execute_success: "cyan",
  execute_failed: "red",
  rollback: "cyan"
};

/** 本期后端可自动执行的动作 */
export const AUTO_EXECUTABLE_ACTIONS: string[] = ["pause_ad", "resume_ad"];

// ==================== 执行来源 / 回滚 / 效果回评 ====================

/** 执行来源 → { label, color }（AI 自动执行 / 人工审批执行） */
export const EXECUTED_BY_MAP: Record<string, { color: string; label: string }> = {
  AI: { color: "geekblue", label: "AI 执行" },
  HUMAN: { color: "purple", label: "人工执行" }
};

/** 回滚状态 → { label, color } */
export const ROLLBACK_STATUS_MAP: Record<
  string,
  { color: string; label: string }
> = {
  none: { color: "default", label: "不可回滚" },
  available: { color: "orange", label: "可回滚" },
  rolled_back: { color: "cyan", label: "已回滚" },
  failed: { color: "red", label: "回滚失败" }
};

/** 效果判定 → { label, color } */
export const EFFECT_VERDICT_MAP: Record<
  string,
  { color: string; label: string }
> = {
  improved: { color: "green", label: "有效" },
  flat: { color: "default", label: "持平" },
  worse: { color: "red", label: "无效" }
};

/** 限额拦截判定：后端 errorMsg 以「限额拦截」开头（见 DecisionExecutor） */
export function isQuotaBlocked(errorMsg?: string): boolean {
  return !!errorMsg && errorMsg.startsWith("限额拦截");
}

/** 监控层级 → 中文（含决策单可能出现的 adgroup） */
export const TARGET_LEVEL_LABEL: Record<string, string> = {
  advertiser: "账户",
  campaign: "计划",
  adgroup: "广告组",
  promotion: "广告"
};

// ==================== 触发留痕（airflow 上报） ====================
