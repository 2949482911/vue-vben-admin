/** 标签类型字典编码（系统字典管理里维护：value 存 labelType） */
export const LABEL_TYPE_DICT_CODE = 'label_type';

/** 各类资产对应的标签类型值 */
export const LABEL_TYPE_CODES = {
  advertiser: 'advertiser_label',
  material: 'material_label',
  page: 'page_label',
  target: 'target_label',
  title: 'title_label',
} as const;
