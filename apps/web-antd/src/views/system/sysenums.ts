/**
 * 系统模块通用枚举
 */
export enum BatchOptionsType {
  Delete = 'delete',
  DISABLE = 'disable',
  Enable = 'enable',
  /** 主体批量设置销售人员 */
  UpdateMainBodySale = 'update_main_body_sale',
  /** 主体批量修改套餐 */
  UpdateMainBodyCombo = 'update_main_body_combo',
}

/** 套餐权益单位 */
export enum ComboPrivilegeUnit {
  /** GB */
  Gb = 'gb',
  /** 次数 */
  Count = 'count',
  /** 个 */
  Unit = 'unit',
}

/** 获取套餐权益单位名称 */
export function getComboPrivilegeUnitName(unit: string): string {
  switch (unit) {
    case ComboPrivilegeUnit.Gb: {
      return 'Gb';
    }
    case ComboPrivilegeUnit.Count: {
      return '次数';
    }
    case ComboPrivilegeUnit.Unit: {
      return '个';
    }
    default: {
      return unit;
    }
  }
}
