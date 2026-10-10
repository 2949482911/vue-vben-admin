import type { BaseItem, PageRequestParams } from '#/api/models/core';

// ==================== 枚举 ====================

/**
 * 执行模式
 */
export type ExecutionMode = 'auto' | 'manual' | 'hybrid';

/**
 * 托管任务状态
 */
export type HostingStatus = 'running' | 'paused' | 'ended' | 'error';

/**
 * 规则类型
 */
export type RuleType =
  | 'stop_loss'        // 自动止损
  | 'budget_optimize'  // 预算优化
  | 'bid_adjust'       // 出价调整
  | 'scale_up';        // 起量追投

/**
 * 规则触发条件比较符
 */
export type ConditionOperator =
  | 'gt'   // 大于
  | 'gte'  // 大于等于
  | 'lt'   // 小于
  | 'lte'  // 小于等于
  | 'eq'   // 等于
  | 'neq'; // 不等于

/**
 * 规则执行动作
 */
export type ActionType =
  | 'pause_ad'           // 暂停广告
  | 'resume_ad'          // 恢复广告
  | 'increase_budget'    // 增加预算
  | 'decrease_budget'    // 减少预算
  | 'increase_bid'       // 提高出价
  | 'decrease_bid'       // 降低出价
  | 'duplicate_ad'       // 复制计划
  | 'alert';             // 仅告警

/**
 * 日志执行结果
 * pending / report_failed 为 airflow 规则触发上报的结果（触发留痕）
 */
export type LogResult = 'success' | 'failed' | 'pending' | 'rollback' | 'report_failed';

/**
 * 监控目标层级
 */
export type HostingTarget = 'advertiser' | 'campaign' | 'promotion';

/**
 * 规则判定模式
 */
export type RulesMode = 'all' | 'any';

// ==================== 托管任务 ====================

/**
 * 规则触发条件
 */
export interface RuleCondition {
  /** 指标字段名（如 cost / convert / roi / ctr） */
  metric: string;
  /** 比较符 */
  operator: ConditionOperator;
  /** 阈值 */
  threshold: number;
  /** 持续时长（分钟） */
  duration: number;
}

/**
 * 规则执行动作配置
 */
export interface RuleAction {
  /** 动作类型 */
  type: ActionType;
  /** 动作参数（如调整比例、目标值等） */
  params: {
    /** 调整比例（百分比，如 20 表示 +20%） */
    ratio?: number;
    /** 目标值 */
    targetValue?: number;
  };
}

/**
 * 通知方式渠道
 * 仅告警（action=alert）与执行成功时，按规则配置的通知方式推送
 */
export type AlertMethod = 'email' | 'feishu' | 'dingtalk';

/**
 * 单条通知方式配置（后端按 rules[].alertMethods 落库，key 固定为 alert_method / alert_value）
 */
export interface AlertMethodItem {
  /** 渠道：email 邮箱 / feishu 飞书 webhook / dingtalk 钉钉 webhook */
  alert_method: AlertMethod;
  /** 目标地址：邮箱地址 或 webhook 地址 */
  alert_value: string;
}

/**
 * 托管规则
 */
export interface HostingRule {
  /** 规则ID */
  id?: string;
  /** 规则名称 */
  name: string;
  /** 规则类型 */
  type: RuleType;
  /** 触发条件 */
  conditions: RuleCondition[];
  /** 条件之间的关系（AND / OR） */
  conditionLogic: 'AND' | 'OR';
  /** 执行动作 */
  actions: RuleAction[];
  /** 是否启用 */
  enabled: boolean;
  /** 监控指标的数据时间范围 1表示 当天 3 表示三天内历史数据(包含当天) 7表示7天内历史数据(包含当天) */
  report_day: number;
  /** 命中后的通知方式（可多种并存；后端按规则名从 tasks 查库读取） */
  alertMethods?: AlertMethodItem[];
}

/**
 * 托管任务
 */
export interface HostingTask extends BaseItem {
  /** 任务名称 */
  name: string;
  /** 平台 */
  platform: string;
  /** 执行模式 */
  executionMode: ExecutionMode;
  /** 托管的账户ID列表 */
  advertiserIds: string[];
  /** 项目ID */
  projectId?: string[];
  /**
   * 广告IDs
   */
  promotionIds?: string[]
  /** 规则列表 */
  rules: HostingRule[];
  /** 任务状态 */
  taskStatus: HostingStatus;
  /** 轮询间隔（分钟） */
  pollInterval: number;

  /**
   * 监控目标：advertiser 账户 / campaign 计划 / promotion 广告
   */
  target: HostingTarget;
  /**
   * 规则模式：all 全部规则满足 / any 任意规则满足
   */
  rulesMode: RulesMode;

  lastPollTime?: string;
  nextPollTime?: string;
}

/**
 * 托管任务统计
 */
export interface HostingTaskStats {
  /** 今日执行次数 */
  todayExecCount: number;
  /** 累计执行次数 */
  totalExecCount: number;
  /** 今日节省消耗（分） */
  todaySavedSpend: number;
  /** 累计节省消耗（分） */
  totalSavedSpend: number;
  /** 管理的计划数 */
  managedAdCount: number;
}

/**
 * 托管任务查询参数
 */
export interface HostingTaskQueryParams extends PageRequestParams {
  name?: string;
  platform?: string;
  taskStatus?: HostingStatus;
}

// ==================== 决策单（AI 审核台） ====================

/**
 * 决策单状态
 */
export type HostingDecisionStatus =
  | 'pending'    // 待审核
  | 'approved'   // 已批准
  | 'rejected'   // 已拒绝
  | 'executing'  // 执行中
  | 'executed'   // 已执行
  | 'failed'     // 执行失败
  | 'expired';   // 已过期

/**
 * 风险等级
 */
export type RiskLevel = 'high' | 'low' | 'medium';

/**
 * 审核留痕结论
 */
export type AuditConclusion =
  | 'created'          // 规则创建决策单
  | 'ai_approve'       // AI 通过
  | 'ai_reject'        // AI 拒绝
  | 'human_approve'    // 人工通过
  | 'human_reject'     // 人工拒绝
  | 'execute_success'  // 执行成功
  | 'execute_failed';  // 执行失败

/**
 * 审核者类型
 */
export type AuditorType = 'AI' | 'HUMAN' | 'SYSTEM';

/**
 * 人工审核结论
 */
export type ReviewConclusion = 'approve' | 'reject';

/**
 * 决策单（列表项）
 */
export interface HostingDecision extends BaseItem {
  /** 所属托管任务ID */
  taskId?: string;
  /** 媒体：oppo/tencent/bytedance/vivo */
  platform?: string;
  /** 广告主ID */
  advertiserId?: string;
  /** 广告主名称 */
  advertiserName?: string;
  /** 层级：advertiser/campaign/adgroup/promotion */
  targetLevel?: string;
  /** 目标ID（计划/广告组/广告） */
  targetId?: string;
  /** 目标名称 */
  targetName?: string;
  /** 命中的规则名称 */
  ruleName?: string;
  /** 规则类型（stop_loss/budget_optimize/bid_adjust/scale_up…） */
  ruleType?: string;
  /** 建议动作（pause_ad/resume_ad/increase_bid…） */
  action?: string;
  /** 动作参数（如 { ratio: 10 }） */
  params?: Record<string, any>;
  /** 判定时指标快照（如 { cost, roi }） */
  metricSnapshot?: Record<string, any>;
  /** 风险：low/medium/high */
  riskLevel?: RiskLevel;
  /** 决策单状态 */
  decisionStatus?: HostingDecisionStatus;
  /** AI 审核理由（全自动/混合模式才有） */
  aiReason?: string;
  /** AI 思考过程（分步） */
  aiThinking?: string;
  /** 拒绝原因 */
  rejectReason?: string;
  /** 执行结果（batchId/optionType/code/targetId/requestId） */
  execResult?: null | Record<string, any>;
  /** 执行失败信息 */
  errorMsg?: string;
}

/**
 * 审核留痕
 */
export interface HostingAudit {
  id?: string;
  /** 决策单ID */
  decisionId?: number | string;
  /** 任务ID */
  taskId?: number | string;
  /** 审核者类型 */
  auditorType?: AuditorType;
  /** 审核者标识（用户ID 或 AI） */
  auditorId?: string;
  /** 审核者名称 */
  auditorName?: string;
  /** 结论 */
  conclusion?: AuditConclusion;
  /** 理由 */
  reason?: string;
  /** 审核依据（重查指标快照 / AI 原始输出） */
  evidence?: Record<string, any>;
  /** 原状态 */
  fromStatus?: string;
  /** 新状态 */
  toStatus?: string;
  createTime?: string;
}

/**
 * 决策单查询参数
 */
export interface HostingDecisionQueryParams extends PageRequestParams {
  taskId?: string;
  platform?: string;
  decisionStatus?: HostingDecisionStatus;
  riskLevel?: RiskLevel;
  /** 建议动作筛选 */
  action?: string;
  /** 仅看"可自动执行"(pause_ad/resume_ad) */
  autoExecutable?: boolean;
}

/**
 * 人工审核（批量）请求
 */
export interface HostingReviewRequest {
  ids: Array<number | string>;
  conclusion: ReviewConclusion;
  /** 拒绝时建议必填 */
  reason?: string;
}

/**
 * 托管统计概览（后端 P1 修复前可能恒为 0）
 */
export interface HostingStats {
  /** 托管账户数 */
  managedAccountCount?: number;
  /** 管理的计划/广告数 */
  managedAdCount?: number;
  /** 今日执行次数 */
  todayExecCount?: number;
  /** 今日自动执行次数 */
  todayAutoExecCount?: number;
  /** 待审核决策数 */
  pendingCount?: number;
  /** 今日拦截/节省消耗（分） */
  todaySavedSpend?: number;
  /** AI 平均响应（秒） */
  avgLatency?: number;
}
