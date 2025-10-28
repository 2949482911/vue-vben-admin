export interface PageRequestParams {
  page: number;
  pageSize: number;
  status: number;
}

export interface BaseItem {
  id: string;
  createTime: string;
  updateTime: string;
  createUsername: string;
  updateUsername: string;
  status: number;
}


export interface DeleteItem {
  ids: string[];
}


export interface BatchOptions {
  targetIds: string[];
  type: string;
  values: Map<string, any>;
}
