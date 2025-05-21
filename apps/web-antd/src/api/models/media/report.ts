export interface Filter {
  field: string;
  operator: number;
  values: Array<any>;
}

// order report interface request params
export interface OrderReportParams {
  dateList: Array<string>;
  needCname: boolean;
  metrics: Array<string>;
  filters: Array<Filter>;
  dimensions: Array<string>;
  decimalPoint: number;
}

// order report interface response params
export interface OrderReportResponse {
  columns: Array<string>;
  cname: Map<string, string>;
  items: Array<Map<string, any>>; // 数据
  total: Array<Map<string, number>>; // 汇总
}
