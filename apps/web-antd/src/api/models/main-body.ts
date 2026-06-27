import type { BaseItem, PageRequestParams } from "#/api/models/core";

export interface MainBodySearchRequest extends PageRequestParams {
  name: string;
}


export interface MainBodyItem extends BaseItem {
  name: string;
  email: string;
  remark: string;
  mainBodyCombo: Array<MainBodyItemCombo>;
}


// MainBodyItemCombo 主体套餐权益
export interface MainBodyItemCombo {
  comboId: string;
  comboName: string;
  startTime: string;
  endTime: string;
  comboType: string;
  using: boolean;
  comboPrivilegeItems: Array<MainBodyItemComboPrivilege>;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  createUsername: string;
  updateUsername: string;
}


export interface MainBodyItemComboPrivilege {
  id: string;
  privilegeCode: string;
  privilegeName: string;
  quota: number;
  unit: string;
}

export interface MainBodyCreateRequest {
  id: string;
  name: string;
  email: string;
  remark: string;
  comboId: string;
}

export interface MainBodyUpdateRequest extends MainBodyCreateRequest {
}


// 主体套餐权限实体

export interface MainBodyComboPageRequest extends PageRequestParams {
  name: string;
  type: string;
  status: number;
}


export interface MainBodyComboPageItem extends BaseItem {
  name: string;
  type: string;
  days: number;
  price: number;
  isDefault: boolean;
  version: string;
  privileges: Array<ComboPrivilegeItem>;
}

export interface ComboPrivilegeItem extends BaseItem {
  comboId: string;
  privilegeCode: string;
  privilegeName: string;
  quota: number;
  unit: string;  // gb count
}


export interface ComboPrivilegeCreateRequest {
  id: string;
  privilegeCode: string;
  privilegeName: string;
  quota: number;
  unit: string;  // gb count
}

export interface MainBodyComboCreateRequest {
  name: string;
  type: string;
  days: number;
  price: number;
  isDefault: boolean;
  version: string;
  privileges: Array<ComboPrivilegeCreateRequest>;
}


export interface MainBodyComboUpdateRequest extends MainBodyComboCreateRequest {
  id: string;
}
