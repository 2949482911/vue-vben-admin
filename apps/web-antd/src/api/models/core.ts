export interface PageRequestParams {
  page: number;
  pageSize: number;
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
