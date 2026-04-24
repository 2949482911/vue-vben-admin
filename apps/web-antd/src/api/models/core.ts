export interface PageRequestParams {
  page: number;
  pageSize?: number;
  status?: number;
  platform?: string;
  putStatue?: number;
}

export interface BaseItem {
  id: string;
  createTime: string;
  updateTime: string;
  createUsername: string;
  updateUsername: string;
  status: number;
  createdBy: string;
  updatedBy: string;
  _X_ROW_KEY: string;
}

export interface DeleteItem {
  ids: string[];
}

export interface BatchOptions {
  targetIds: string[];
  type: string;
  values: Record<string, any>;
}
