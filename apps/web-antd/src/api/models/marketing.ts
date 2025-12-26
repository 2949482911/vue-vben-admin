import type {BaseItem, PageRequestParams} from "#/api/models/core";


/**
 * 账户请求
 */
export interface AdvertiserPageRequest extends PageRequestParams {
  advertiserId: string;
  advertiserName: string;
  putStatus: number;
}


/**
 * 账户列表
 */
export interface AdvertiserItem extends BaseItem {
  platform: string;
  advertiserId: string;
  advertiserName: string;
  roleType: string;
  remark: string;
  advertiserRole: string;
  advertiserRoleName: string;
  platformRemark: string;
  putStatue: number;
  platformStatus: string;
  balance: number;
  dailyBudget: number;
  companyName: string;
  putStatus: number;
  projectId: string;
  platformAuditState: string;
  config: Map<string, any>;
}


export interface CreateAdvertiserRequest {

}


export interface UpdateAdvertiserRequest {
  id: string;
  putStatue: number;
  remark: string;
  projectId: string;
  config: Map<string, any>;
}



// 返回的子账户列表
export interface AccountChildResponse {
  advertiserId: string;
  advertiserName: string;
  exist: boolean;
  length: number
}


// 导入子账户
export interface ImportChildRequest{
  id: string;
  advertiserIds: Array<string>;
}


/**
 * 账户授权请求iD
 */
export interface AuthAdvertiserRequest {
  platform: string;
}


/**
 * 开发者
 */


export interface DeveloperPageRequest extends PageRequestParams {
  platform: string;
  name: string;
}

export interface DeveloperItem extends BaseItem {
  platform: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  remark: string,
  authCount: string
}


export interface CreateDeveloperRequest {
  platform: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  remark: string,
}

export interface UpdateDeveloperRequest extends CreateDeveloperRequest {
  id: string;
}


// 报表

export interface CreateSystemMetric {
  ename: string;
  cname: string;
  description: string;
  metricType: number;
  formula: string;
  tags: Array<number>;
  platformMetricMap: Array<PlatformMetricMap>;
  implMethod: string;
}


export interface UpdateMetric extends CreateSystemMetric {
  id: string;
}

export interface SystemMetricPageRequest extends PageRequestParams {
  ename: string;
  cname: string;
}


export interface MetricItem extends BaseItem {
  ename: string;
  cname: string;
  description: string;
  metricType: number;
  formula: string;
  tags: Array<number>;
  platformMetricMap: Array<Map<string, any>>;
  calculateLogic: Array<string>;
  implMethod: string;
  isSystem: boolean;
  isCustom: boolean;
  calculateSort: number;
  sort: number;
  platform: string;
}


export interface PlatformMetricMap {
  platform: string;
  metricName: string;
}


// 报表数据响应
export interface AdReportResponse {
  data: any;
  dims: Array<string>;
  cname: Map<string, string>;
  items: Array<Map<string, string>>;
  summary: Map<string, string>;
}

export interface AdReportRequest {
  dateTimeRange: Array<string>;
  queryMetric: Array<number>;
  dims: Array<string>;
  needCname: boolean;
  decimalPoint: number;
  filters: Array<{
    field: string;
    operator: number;
    values: Array<any>
  }>
}

/**
 * project request/response/page class
 */

export interface ProjectPageRequest extends PageRequestParams {
  name: string;
  projectType: number;
  packageName: string
}


export interface ProjectItem extends BaseItem {
  name: string;
  projectType: number;
  packageName: string
  description: string;
  icon: string;
}


export interface CreateProjectRequest {
  name: string;
  projectType: number;
  packageName: string
  description: string;
  icon: string;
}


export interface UpdateProjectRequest extends CreateProjectRequest {
  id: string;
}
