/** 套餐权益字典编码（系统字典管理里维护：value=privilegeCode，label=权益名称） */
export const COMBO_PRIVILEGE_DICT_CODE = 'combo_privilege';

/** 字典未就绪时的兜底文案（仅用于历史编码，不覆盖字典） */
export const COMBO_PRIVILEGE_FALLBACK: Record<string, string> = {
  api_calls: 'API调用次数',
  projects: '项目数量',
  report_export: '报表导出次数',
  storage: '存储空间',
  users: '用户数量',
};
