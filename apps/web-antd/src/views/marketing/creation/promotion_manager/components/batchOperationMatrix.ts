/**
 * 批量操作支持矩阵：媒体 -> 层级 -> 支持的 optionType
 *
 * 与后端白名单（对接文档第 5 章）保持一致。
 * 「待开发 / 不支持」的操作不要写进来，否则会出现在前端菜单但后端无法执行。
 */
export const BATCH_OPERATION_MATRIX: Record<string, Record<string, string[]>> = {
  oppo: {
    campaign: ['update_project_status', 'delete_campaign'],
    adgroup: [
      'update_adgroup_status',
      'update_adgroup_price',
      'update_adgroup_ocpc_price',
      'update_adgroup_deep_ocpc_price',
      'open_adgroup_default_second_stage',
      'update_adgroup_deeplink',
      'update_adgroup_roi',
      'delete_adgroup',
    ],
    promotion: [
      'update_promotion_status',
      'update_promotion_monitor_url',
      'add_promotion',
      'delete_promotion',
    ],
  },
  // 巨量引擎与智擎共用同一批量接口与白名单
  bytedance: {
    campaign: [
      'update_project_status',
      'update_project_budget',
      'update_project_roi',
      'delete_campaign',
    ],
    // 巨量「广告」层级复用删除创意（后端按 promotion 层级处理）
    adgroup: ['delete_promotion'],
  },
  bytedance_std: {
    campaign: [
      'update_project_status',
      'update_project_budget',
      'update_project_roi',
      'delete_campaign',
    ],
  },
};

/** 取某媒体某层级支持的批量操作；未配置返回空数组（即不开放批量入口） */
export function getBatchOperations(platform: string, level: string): string[] {
  return BATCH_OPERATION_MATRIX[platform]?.[level] ?? [];
}
