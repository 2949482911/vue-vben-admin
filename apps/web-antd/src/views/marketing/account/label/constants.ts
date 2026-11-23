/** 标签类型字典编码（系统字典管理里维护：value 存 labelType） */
export const LABEL_TYPE_DICT_CODE = 'label_type';

/** 各类资产对应的标签类型值 */
export const LABEL_TYPE_CODES = {
  advertiser: 'advertiser_label',
  material: 'material_label',
  page: 'page_label',
  strategy: 'strategy_label',
  target: 'target_label',
  title: 'title_label',
} as const;

/** 标签类型默认配色（字典未配置颜色时使用） */
export const LABEL_TYPE_COLORS: Record<string, string> = {
  [LABEL_TYPE_CODES.advertiser]: 'blue',
  [LABEL_TYPE_CODES.material]: 'purple',
  [LABEL_TYPE_CODES.page]: 'cyan',
  [LABEL_TYPE_CODES.strategy]: 'geekblue',
  [LABEL_TYPE_CODES.target]: 'orange',
  [LABEL_TYPE_CODES.title]: 'green',
};
