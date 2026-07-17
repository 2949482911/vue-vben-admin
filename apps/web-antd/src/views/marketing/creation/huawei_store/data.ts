/**
 * 华为批投任务类型
 */
export const TaskTypeSelect = [
  {
    "label": "推荐-系统投放-CPC任务",
    "value": "461314520477184955"
  },
  {
    "label": "精选推荐-系统投放-CPD任务",
    "value": "243728192482956951"
  },
  {
    "label": "精选推荐-系统投放-OCPD任务",
    "value": "243728192482956951"
  },
  {
    "label": "精选推荐-影子投放-CPD任务",
    "value": "243728192482956951"
  }, {
    "label": "精选推荐-RTA投放-CPD任务",
    "value": "243728192482956951"
  }
];


export const AdType = [
  {
    "label": "搜索大卡",
    "value": "search_card"
  },
  {
    "label": "信息流使用",
    "value": "feed"
  }
];

// ======================== Label 辅助函数 ========================

/** 根据 value 从 options 数组中查找对应的 label */
function findLabel(options: Array<{ label: string; value: any }>, value: any): string {
  const item = options.find((opt) => opt.value === value);
  return item?.label ?? String(value ?? '');
}

export function getTaskTypeLabel(value: any) { return findLabel(TaskTypeSelect, value); }
export function getAdTypeLabel(value: any) { return findLabel(AdType, value); }

/** 按字段名获取对应的 Label 转换函数 */
export const fieldLabelMap: Record<string, (value: any) => string> = {
  type: getTaskTypeLabel,
  adType: getAdTypeLabel,
};
