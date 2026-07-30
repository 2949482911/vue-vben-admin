import type { BaseItem, PageRequestParams } from '#/api/models/core';

// ==================== 素材分析 ====================

/**
 * 素材分析查询参数
 */
export interface MaterialAnalysisQuery extends PageRequestParams {
  /** 平台 */
  platform?: string;
  /** 素材类型：video / image */
  materialType?: string;
  /** 日期范围 */
  dateRange?: [string, string];
  /** 排序字段 */
  sortBy?: 'spend' | 'ctr' | 'cvr' | 'roi';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 素材效果数据
 */
export interface MaterialAnalysisItem extends BaseItem {
  /** 素材ID */
  materialId: string;
  /** 素材名称 */
  materialName: string;
  /** 素材类型 */
  materialType: string;
  /** 缩略图 */
  thumbnailUrl: string;
  /** 文件URL */
  fileUrl: string;
  /** 所属平台 */
  platform: string;
  /** 消耗（分） */
  spend: number;
  /** 曝光 */
  impression: number;
  /** 点击 */
  click: number;
  /** 转化数 */
  convert: number;
  /** 点击率 */
  ctr: number;
  /** 转化率 */
  cvr: number;
  /** CPA（分） */
  cpa: number;
  /** ROI */
  roi: number;
  /** 投放状态 */
  deliveryStatus: string;
  /** 生命周期阶段 */
  lifecycle: 'new' | 'growing' | 'peak' | 'declining' | 'dead';
  /** 标签列表 */
  tags: MaterialTag[];
  /** 首次投放时间 */
  firstDeliveryAt: string;
  /** 最近投放时间 */
  lastDeliveryAt: string;
}

/**
 * 素材标签
 */
export interface MaterialTag {
  /** 标签ID */
  id: string;
  /** 标签名 */
  name: string;
  /** 标签类型：auto（自动识别）/ manual（手动） */
  type: 'auto' | 'manual';
  /** 标签分组 */
  group?: string;
}

/**
 * 素材概览统计
 */
export interface MaterialOverview {
  /** 素材总数 */
  totalMaterials: number;
  /** 使用中素材数 */
  activeMaterials: number;
  /** 新起量素材数 */
  growingMaterials: number;
  /** 衰退素材数 */
  decliningMaterials: number;
  /** 素材平均CTR */
  avgCtr: number;
  /** 素材平均CVR */
  avgCvr: number;
  /** 素材平均ROI */
  avgRoi: number;
}

/**
 * 素材生命周期分布
 */
export interface LifecycleDistribution {
  /** 新素材 */
  newCount: number;
  /** 成长期 */
  growingCount: number;
  /** 峰值期 */
  peakCount: number;
  /** 衰退期 */
  decliningCount: number;
  /** 已停投 */
  deadCount: number;
}

/**
 * 素材对比项
 */
export interface MaterialCompareItem {
  /** 素材ID */
  materialId: string;
  /** 素材名称 */
  materialName: string;
  /** 缩略图 */
  thumbnailUrl: string;
  /** 消耗趋势数据（按天） */
  dailySpend: Array<{ date: string; value: number }>;
  /** CTR趋势 */
  dailyCtr: Array<{ date: string; value: number }>;
  /** ROI趋势 */
  dailyRoi: Array<{ date: string; value: number }>;
  /** 汇总数据 */
  summary: {
    totalSpend: number;
    totalImpression: number;
    totalClick: number;
    totalConvert: number;
    avgCtr: number;
    avgCvr: number;
    avgRoi: number;
  };
}
