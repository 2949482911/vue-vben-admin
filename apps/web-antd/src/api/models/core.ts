export interface PageRequestParams {
  page: number;
  pageSize?: number;
  status?: number;
  platform?: string;
  putStatue?: number;
}

/**
 * 后端分页响应
 * 后端 PageIntercept 切面会对以 `List` 结尾的方法统一包装成该结构
 */
export interface PageResult<T> {
  items: T[];
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface BaseItem {
  id?: string;
  createTime?: string;
  updateTime?: string;
  createUsername?: string;
  updateUsername?: string;
  status?: number;
  createdBy?: string;
  updatedBy?: string;
  del?: number;
  orgId?: string;
  mainId?:string;
  orgCode?: string;
  _X_ROW_KEY?: string;
}

export interface DeleteItem {
  ids: string[];
}

export interface BatchOptions {
  targetIds: string[];
  type: string;
  values: Record<string, any>;
}
