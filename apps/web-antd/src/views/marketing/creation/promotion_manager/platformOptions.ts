/**
 * 广告管理-平台选项 & 批量操作枚举/配置统一管理
 *
 * 将批量操作相关的类型（操作类型、媒体、层级、应用模式）以及每个媒体
 * 支持的批量操作矩阵统一收敛到本文件，供列表页、批量操作入口、抽屉与
 * 各操作组件共同引用，避免散落字符串判断。
 */

// ==================== 广告管理平台选项 ====================
export const AD_MANAGEMENT_PLATFORM_OPTIONS = [
  { label: 'vivo', value: 'vivo' },
  { label: 'oppo', value: 'oppo' },
  { label: 'huawei', value: 'huawei' },
  { label: '巨量引擎', value: 'bytedance' },
];

// ==================== 媒体平台 ====================
export const MediaPlatform = {
  VIVO: 'vivo',
  OPPO: 'oppo',
  HUAWEI: 'huawei',
  BYTEDANCE: 'bytedance',
  BYTEDANCE_STD: 'bytedance_std',
} as const;
export type MediaPlatform = (typeof MediaPlatform)[keyof typeof MediaPlatform];

// ==================== 批量操作层级 ====================
export const BatchLevel = {
  CAMPAIGN: 'campaign',
  ADGROUP: 'adgroup',
  PROMOTION: 'promotion',
} as const;
export type BatchLevel = (typeof BatchLevel)[keyof typeof BatchLevel];

// ==================== 批量应用模式 ====================
export const BatchMode = {
  /** 全部应用：所有已选元素共用一个配置 */
  ALL: 'all',
  /** 单独设置：每个已选元素独立配置 */
  INDIVIDUAL: 'individual',
} as const;
export type BatchMode = (typeof BatchMode)[keyof typeof BatchMode];

// ==================== 批量操作类型 ====================
export const BatchOperationType = {
  DELETE_CAMPAIGN: 'delete_campaign',
  UPDATE_PROJECT_STATUS: 'update_project_status',
  UPDATE_PROJECT_BUDGET: 'update_project_budget',
  UPDATE_PROJECT_ROI: 'update_project_roi',
  DELETE_ADGROUP: 'delete_adgroup',
  UPDATE_ADGROUP_STATUS: 'update_adgroup_status',
  UPDATE_ADGROUP_PRICE: 'update_adgroup_price',
  UPDATE_ADGROUP_OCPC_PRICE: 'update_adgroup_ocpc_price',
  UPDATE_ADGROUP_DEEP_OCPC_PRICE: 'update_adgroup_deep_ocpc_price',
  OPEN_ADGROUP_DEFAULT_SECOND_STAGE: 'open_adgroup_default_second_stage',
  UPDATE_ADGROUP_DEEPLINK: 'update_adgroup_deeplink',
  UPDATE_ADGROUP_ROI: 'update_adgroup_roi',
  DELETE_PROMOTION: 'delete_promotion',
  ADD_PROMOTION: 'add_promotion',
  UPDATE_PROMOTION_STATUS: 'update_promotion_status',
  UPDATE_PROMOTION_MONITOR_URL: 'update_promotion_monitor_url',
} as const;
export type BatchOperationType = (typeof BatchOperationType)[keyof typeof BatchOperationType];

// ==================== 操作类型 → 标题 i18n key ====================
export const BATCH_OPERATION_LABEL_KEYS: Record<BatchOperationType, string> = {
  [BatchOperationType.DELETE_CAMPAIGN]: 'marketing.promotionManager.optionTypes.deleteCampaign',
  [BatchOperationType.UPDATE_PROJECT_STATUS]: 'marketing.promotionManager.optionTypes.updateStatus',
  [BatchOperationType.UPDATE_PROJECT_BUDGET]: 'marketing.promotionManager.optionTypes.updateBudget',
  [BatchOperationType.UPDATE_PROJECT_ROI]: 'marketing.promotionManager.optionTypes.updateRoi',
  [BatchOperationType.DELETE_ADGROUP]: 'marketing.promotionManager.optionTypes.deleteAdgroup',
  [BatchOperationType.UPDATE_ADGROUP_STATUS]:
    'marketing.promotionManager.optionTypes.updateAdgroupStatus',
  [BatchOperationType.UPDATE_ADGROUP_PRICE]:
    'marketing.promotionManager.optionTypes.updateAdgroupPrice',
  [BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE]:
    'marketing.promotionManager.optionTypes.updateAdgroupOcpcPrice',
  [BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE]:
    'marketing.promotionManager.optionTypes.updateAdgroupDeepOcpcPrice',
  [BatchOperationType.OPEN_ADGROUP_DEFAULT_SECOND_STAGE]:
    'marketing.promotionManager.optionTypes.openAdgroupSecondStage',
  [BatchOperationType.UPDATE_ADGROUP_DEEPLINK]:
    'marketing.promotionManager.optionTypes.updateAdgroupDeeplink',
  [BatchOperationType.UPDATE_ADGROUP_ROI]:
    'marketing.promotionManager.optionTypes.updateAdgroupRoi',
  [BatchOperationType.DELETE_PROMOTION]: 'marketing.promotionManager.optionTypes.deletePromotion',
  [BatchOperationType.ADD_PROMOTION]: 'marketing.promotionManager.optionTypes.addPromotion',
  [BatchOperationType.UPDATE_PROMOTION_STATUS]:
    'marketing.promotionManager.optionTypes.updatePromotionStatus',
  [BatchOperationType.UPDATE_PROMOTION_MONITOR_URL]:
    'marketing.promotionManager.optionTypes.updatePromotionMonitorUrl',
};

// ==================== 操作类型 → 「全部应用」提示 i18n key ====================
export const BATCH_OPERATION_ALL_TIP_KEYS: Partial<Record<BatchOperationType, string>> = {
  [BatchOperationType.UPDATE_PROJECT_STATUS]: 'marketing.promotionManager.allTips.updateProjectStatus',
  [BatchOperationType.UPDATE_PROJECT_BUDGET]: 'marketing.promotionManager.allTips.updateProjectBudget',
  [BatchOperationType.UPDATE_PROJECT_ROI]: 'marketing.promotionManager.allTips.updateProjectRoi',
  [BatchOperationType.UPDATE_ADGROUP_STATUS]: 'marketing.promotionManager.allTips.updateAdgroupStatus',
  [BatchOperationType.UPDATE_ADGROUP_PRICE]: 'marketing.promotionManager.allTips.updateAdgroupPrice',
  [BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE]:
    'marketing.promotionManager.allTips.updateAdgroupOcpcPrice',
  [BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE]:
    'marketing.promotionManager.allTips.updateAdgroupDeepOcpcPrice',
  [BatchOperationType.UPDATE_ADGROUP_DEEPLINK]:
    'marketing.promotionManager.allTips.updateAdgroupDeeplink',
  [BatchOperationType.UPDATE_ADGROUP_ROI]: 'marketing.promotionManager.allTips.updateAdgroupRoi',
  [BatchOperationType.OPEN_ADGROUP_DEFAULT_SECOND_STAGE]:
    'marketing.promotionManager.allTips.openSecondStage',
  [BatchOperationType.UPDATE_PROMOTION_STATUS]:
    'marketing.promotionManager.allTips.updatePromotionStatus',
  [BatchOperationType.UPDATE_PROMOTION_MONITOR_URL]:
    'marketing.promotionManager.allTips.updatePromotionMonitorUrl',
};

// ==================== 媒体 × 层级 × 操作类型支持矩阵 ====================
// 与后端白名单（对接文档第 5 章）保持一致。
// 「待开发 / 不支持」的操作不要写进来，否则会出现在前端菜单但后端无法执行。
export const BATCH_OPERATION_MATRIX: Record<
  MediaPlatform,
  Partial<Record<BatchLevel, BatchOperationType[]>>
> = {
  [MediaPlatform.OPPO]: {
    [BatchLevel.CAMPAIGN]: [
      BatchOperationType.UPDATE_PROJECT_STATUS,
      BatchOperationType.DELETE_CAMPAIGN,
    ],
    [BatchLevel.ADGROUP]: [
      BatchOperationType.UPDATE_ADGROUP_STATUS,
      BatchOperationType.UPDATE_ADGROUP_PRICE,
      BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE,
      BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE,
      BatchOperationType.OPEN_ADGROUP_DEFAULT_SECOND_STAGE,
      BatchOperationType.UPDATE_ADGROUP_DEEPLINK,
      BatchOperationType.UPDATE_ADGROUP_ROI,
      BatchOperationType.DELETE_ADGROUP,
    ],
    [BatchLevel.PROMOTION]: [
      BatchOperationType.UPDATE_PROMOTION_STATUS,
      BatchOperationType.UPDATE_PROMOTION_MONITOR_URL,
      BatchOperationType.ADD_PROMOTION,
      BatchOperationType.DELETE_PROMOTION,
    ],
  },
  // 巨量引擎与智擎共用同一批量接口与白名单
  [MediaPlatform.BYTEDANCE]: {
    [BatchLevel.CAMPAIGN]: [
      BatchOperationType.UPDATE_PROJECT_STATUS,
      BatchOperationType.UPDATE_PROJECT_BUDGET,
      BatchOperationType.UPDATE_PROJECT_ROI,
      BatchOperationType.DELETE_CAMPAIGN,
    ],
    // 巨量「广告」层级复用删除创意（后端按 promotion 层级处理）
    [BatchLevel.ADGROUP]: [BatchOperationType.DELETE_PROMOTION],
  },
  [MediaPlatform.BYTEDANCE_STD]: {
    [BatchLevel.CAMPAIGN]: [
      BatchOperationType.UPDATE_PROJECT_STATUS,
      BatchOperationType.UPDATE_PROJECT_BUDGET,
      BatchOperationType.UPDATE_PROJECT_ROI,
      BatchOperationType.DELETE_CAMPAIGN,
    ],
  },
  [MediaPlatform.VIVO]: {},
  [MediaPlatform.HUAWEI]: {},
};

/** 取某媒体某层级支持的批量操作；未配置返回空数组（即不开放批量入口） */
export function getBatchOperations(platform: string, level: string): BatchOperationType[] {
  const levelMap = BATCH_OPERATION_MATRIX[platform as MediaPlatform];
  return (levelMap?.[level as BatchLevel] ?? []) as BatchOperationType[];
}
