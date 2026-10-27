import type { PageRequestParams } from '#/api/models/core';

/** 字典类型 */
export interface DictTypeItem {
  code: string;
  createTime?: string;
  /** 该类型下的字典项数量 */
  dataCount?: number;
  id: number | string;
  name: string;
  remark?: string;
  sort?: number;
  /** 1 启用 / 9 停用 */
  status?: number;
  updateTime?: string;
}

export interface DictTypeQuery extends PageRequestParams {
  code?: string;
  name?: string;
  status?: number;
}

export interface DictTypeSaveRequest {
  code: string;
  id?: number | string;
  name: string;
  remark?: string;
  sort?: number;
  status?: number;
}

/** 字典数据 */
export interface DictDataItem {
  color?: string;
  dictCode: string;
  /** 运行时开关（0 启用 / 1 禁用，后端由 status 派生） */
  disabled?: boolean;
  extra?: Record<string, any>;
  id: number | string;
  label: string;
  remark?: string;
  sort?: number;
  /** 1 启用 / 9 停用 */
  status?: number;
  updateTime?: string;
  value: string;
}

export interface DictDataQuery extends PageRequestParams {
  dictCode: string;
  label?: string;
  status?: number;
  value?: string;
}

export interface DictDataSaveRequest {
  color?: string;
  dictCode: string;
  extra?: Record<string, any>;
  id?: number | string;
  label: string;
  remark?: string;
  sort?: number;
  status?: number;
  value: string;
}
