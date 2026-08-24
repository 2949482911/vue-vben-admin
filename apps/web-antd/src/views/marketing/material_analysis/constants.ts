/**
 * 素材生命周期配置
 */

/** 生命周期阶段选项 */
export const LIFECYCLE_OPTIONS = [
  { label: '新素材', value: 'new', color: 'blue' },
  { label: '成长期', value: 'growing', color: 'cyan' },
  { label: '峰值期', value: 'peak', color: 'green' },
  { label: '衰退期', value: 'declining', color: 'orange' },
  { label: '已停投', value: 'dead', color: 'default' },
];

/** 生命周期 → { label, color } 映射 */
export const LIFECYCLE_MAP: Record<string, { label: string; color: string }> =
  Object.fromEntries(LIFECYCLE_OPTIONS.map((l) => [l.value, l]));

/** 素材类型选项 */
export const MATERIAL_TYPE_OPTIONS = [
  { label: '视频', value: 'video' },
  { label: '图片', value: 'image' },
];

/** 排序选项 */
export const SORT_OPTIONS = [
  { label: '消耗降序', value: 'spend:desc' },
  { label: '消耗升序', value: 'spend:asc' },
  { label: 'CTR降序', value: 'ctr:desc' },
  { label: 'CVR降序', value: 'cvr:desc' },
  { label: 'ROI降序', value: 'roi:desc' },
  { label: '曝光降序', value: 'impression:desc' },
];
