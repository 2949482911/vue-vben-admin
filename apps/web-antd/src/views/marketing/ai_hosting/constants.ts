/**
 * AI 智能托管 — 常量配置
 *
 * 规则类型、执行模式、状态等枚举的中文映射
 * 供列表页和创建抽屉共用
 */

import type {
  ActionType,
  ExecutionMode,
  HostingStatus,
  HostingTarget,
  LogResult,
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
  { label: "仅告警", value: "alert" as ActionType }
];

/** 日志结果选项 */
export const LOG_RESULT_OPTIONS = [
  { label: "成功", value: "success" as LogResult, color: "green" },
  { label: "失败", value: "failed" as LogResult, color: "red" },
  { label: "执行中", value: "pending" as LogResult, color: "blue" },
  { label: "已回滚", value: "rollback" as LogResult, color: "orange" }
];

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

/** 日志结果 → { label, color } */
export const LOG_RESULT_MAP: Record<string, { label: string; color: string }> =
  Object.fromEntries(LOG_RESULT_OPTIONS.map((r) => [r.value, r]));

// ==================== 可监控指标 ====================

/** 规则条件可选的指标字段 */
export const METRIC_OPTIONS = [
  { label: "平台_展现", value: "AdShow" },
  { label: "平台_消耗", value: "AdCost" },
  { label: "平台_点击", value: "AdClick" },
  { label: "平台_曝光", value: "AdShow" },
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
