export interface BasicPageParams {
  page: number;
  pageSize: number;
}

export interface BasicFetchResult<T> {
  items: T[];
  total: number;
}

export interface BatchOptions {
  targetIds: Array<String>;
  type: string;
  values: Map<string, any>;
}
