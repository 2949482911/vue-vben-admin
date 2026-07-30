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
 */
export type LogResult = 'success' | 'failed' | 'pending' | 'rollback';

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
  projectId?: string;
  /** 规则列表 */
  rules: HostingRule[];
  /** 任务状态 */
  status: HostingStatus;
  /** 轮询间隔（分钟） */
  pollInterval: number;
  /** 统计信息 */
  stats: HostingTaskStats;
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
  status?: HostingStatus;
}

// ==================== 执行日志 ====================

/**
 * 执行日志
 */
export interface HostingLog extends BaseItem {
  /** 所属托管任务ID */
  taskId: string;
  /** 任务名称 */
  taskName: string;
  /** 平台 */
  platform: string;
  /** 广告主ID */
  advertiserId: string;
  /** 广告主名称 */
  advertiserName: string;
  /** 计划/广告ID */
  adId: string;
  /** 计划/广告名称 */
  adName: string;
  /** 触发的规则名称 */
  ruleName: string;
  /** 规则类型 */
  ruleType: RuleType;
  /** 执行动作 */
  action: ActionType;
  /** 触发原因 */
  reason: string;
  /** 执行前的值（JSON） */
  beforeValue: string;
  /** 执行后的值（JSON） */
  afterValue: string;
  /** 执行结果 */
  result: LogResult;
  /** 错误信息（执行失败时） */
  errorMsg?: string;
  /** 执行时间 */
  executedAt: string;
}

/**
 * 日志查询参数
 */
export interface HostingLogQueryParams extends PageRequestParams {
  taskId?: string;
  platform?: string;
  ruleType?: RuleType;
  result?: LogResult;
  /** 日期范围 */
  dateRange?: [string, string];
}
