import type { PageRequestParams } from '#/api/models/core';

// ==================== BPM 待办任务（原有，保持不变） ====================

export interface RepresentativeSearchParams extends PageRequestParams {
}

export interface RepresentativeItem {
  taskId: string;
  name: string;
  state: string;
  category: string;
  assignee: string;
  assigneeName: string;
  owner: string;
  description: string;
  executionId: string;
  processInstanceId: string;
  processDefinitionId: string;
  taskDefinitionId: string;
}

// ==================== 统一数据看板（新增） ====================

/**
 * 看板查询参数
 */
export interface DashboardQueryParams {
  /** 日期范围 [startDate, endDate]，格式 YYYY-MM-DD */
  dateRange: [string, string];
  /** 平台筛选（为空则查全部） */
  platforms?: string[];
  /** 账户ID筛选（为空则查全部） */
  advertiserIds?: string[];
}

/**
 * 核心指标概览
 */
export interface OverviewMetrics {
  /** 总消耗（分） */
  adCost: number;
  /** 总转化数 */
  adConvertAppCustom: number;
  /** 综合ROI */
  adPayRoi: number;
  /** 总曝光 */
  adShow: number;
  /** 总点击 */
  adClick: number;
  /** 消耗环比变化（百分比，正数=增长） */
  adCostChange: number;
  /** 转化环比变化 */
  adConvertChange: number;
  /** ROI环比变化 */
  adPayRoiChange: number;
  /** 曝光环比变化 */
  adShowChange: number;
}

/**
 * 趋势数据点（按天）
 */
export interface TrendDataPoint {
  /** 日期 YYYY-MM-DD */
  day: string;
  /** 消耗 */
  adCost: number;
  /** 转化数 */
  adConvertAppCustom: number;
  /** ROI */
  adPayRoi: number;
  /** 曝光 */
  adShow: number;
  /** 点击 */
  adClick: number;
}

/**
 * 平台对比数据项
 */
export interface PlatformCompareItem {
  /** 平台标识（如 bytedance / tencent） */
  platform: string;
  /** 消耗 */
  adCost: number;
  /** 转化数 */
  adConvertAppCustom: number;
  /** ROI */
  adPayRoi: number;
  /** 曝光 */
  adShow: number;
}

/**
 * 账户排行数据项
 */
export interface AccountTopItem {
  /** 广告主ID */
  platform_account_id: string;
  /** 广告主名称 */
  advertiserName: string;
  /** 所属平台 */
  platform: string;
  /** 消耗 */
  adCost: number;
  /** 转化数 */
  dConvertAppCustom: number;
  /** ROI */
  adPayRoi: number;
  /** 曝光 */
  adShow: number;
}

/**
 * 素材排行数据项
 */
export interface MaterialRankItem {
  /** 素材ID */
  materialId: string;
  /** 素材名称 */
  materialName: string;
  /** 素材类型：video / image */
  materialType: string;
  /** 缩略图URL */
  thumbnailUrl: string;
  /** 消耗 */
  spend: number;
  /** 点击率（百分比） */
  ctr: number;
  /** 转化率（百分比） */
  cvr: number;
  /** ROI */
  roi: number;
}

/**
 * 告警类型
 */
export type AlertType =
  | 'over_cost'        // 超成本
  | 'empty_spend'      // 空耗
  | 'budget_limit'     // 预算撞线
  | 'material_decline' // 素材衰退
  | 'account_anomaly'; // 账户异常

/**
 * 告警级别
 */
export type AlertLevel = 'info' | 'warning' | 'error';

/**
 * 告警状态
 */
export type AlertStatus = 'unread' | 'read' | 'resolved';

/**
 * 告警数据项
 */
export interface AlertItem {
  /** 告警ID */
  id: string;
  /** 告警类型 */
  type: AlertType;
  /** 告警级别 */
  level: AlertLevel;
  /** 告警标题 */
  title: string;
  /** 告警内容 */
  content: string;
  /** 所属平台 */
  platform: string;
  /** 广告主ID */
  advertiserId: string;
  /** 广告主名称 */
  advertiserName: string;
  /** 告警时间 */
  createdAt: string;
  /** 告警状态 */
  status: AlertStatus;
}

/**
 * 告警查询参数
 */
export interface AlertQueryParams extends DashboardQueryParams {
  /** 告警状态筛选 */
  status?: AlertStatus;
  /** 告警类型筛选 */
  type?: AlertType;
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 告警列表响应
 */
export interface AlertListResponse {
  items: AlertItem[];
  total: number;
  page: number;
  pageSize: number;
}


