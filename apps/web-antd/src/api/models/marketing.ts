import type {BaseItem, PageRequestParams} from "#/api/models/core";


/**
 * 账户请求
 */
export interface AdvertiserPageRequest extends PageRequestParams {
  advertiserId?: string;
  advertiserName?: string;
  putStatus?: number;
  platform?:string;
  putStatue?:number
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
  advertiserRoleName?: string;
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
  customer?: "",
  saleId?: "",
}


export interface CreateAdvertiserRequest {

}


export interface UpdateAdvertiserRequest extends AdvertiserDeveloperBindRequest {
  id: string;
  putStatue: number;
  remark: string;
  projectId: string;
  companyName: string;
}



// 返回的子账户列表
export interface AccountChildResponse {
  advertiserId: string;
  advertiserName: string;
  exist: boolean;
}


// 导入子账户
export interface ImportChildRequest{
  id: string;
  advertiserIds: Array<string>;
  projectId:string;
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
  platform?: string;
  name?: string;
  status?: number
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
  id?:string,
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

/**
 * project request/response/page class
 */

export interface ProjectPageRequest extends PageRequestParams {
  name?: string;
  projectType?: number;
  packageName?: string;
  size?:number;
}


export interface ProjectItem extends BaseItem {
  name: string;
  projectType: number;
  packageName: string
  description: string;
  icon: string;
}


export interface CreateProjectRequest {
  id?: string;
  name: string;
  projectType: number;
  packageName: string
  description: string;
  icon: string;
}


export interface UpdateProjectRequest extends CreateProjectRequest {
  id: string;
}

export interface ReportFilter {
  field: string;
  operator: number;
  values: string[];
}

export interface AdReportRequest {
  /** 时间范围 */
  dateTimeRange: string[];
  /** 维度 */
  dims: string[];
  /** 查询指标 */
  queryMetric: string[];
  /** 平台 */
  platform?: ReportFilter[];
  /** 账户名字 */
  filters?: ReportFilter[];
}

export interface ReportTemplate {
  name: string;
  type: string;
  remark: string;
  template: Record<string, any>;
}

/**搜索的数据传给子组件用来保存模板*/
export interface searchDataFilter {
  advertiserId: string[];
  dims: string[];
  platform: string[];
  projectId:string;
  queryMetric:string[];
  dateTimeRange?:[string, string];
  campaign_id?:string[];
  adgroup_id?:string[];
  promotion_id?:string[];
  creative_id?:string[];
}

/**模板列表数据类型*/
export interface templateListType {
  page: number;
  pageSize: number;
  name?: string;
  type?:string;
}

/**删除模板列表数据类型*/
export interface delTemplate {
  targetIds: string[];
  type:string;
  values: Record<string, any>;
}

/**模板列表数据每项类型*/
export interface TemplateDto {
  id: string;
  mainId: string;
  name: string;
  type: string;
  status: number;
  del: number;
  orgId: string;
  orgCode: string;
  createdBy: string;
  createUsername: string;
  createTime: string;
  updatedBy: string;
  updateUsername: string;
  updateTime: string;
  remark: string | null;
  template: Record<string, any>;
}

//素材库

/**目录树*/
export interface FolderItem {
  /** 子节点 */
  children: FolderItem[];
  /** 创建时间 */
  createTime: string;
  /** 创建人名称 */
  createUsername: string;
  /** 创建人 ID */
  createdBy: string;
  /** 当前节点 ID */
  id: string;
  /** 层级 */
  level: number;
  /** 文件夹名称 */
  name: string;
  /** 父级 ID */
  parentId: string;
  /** 备注 */
  remark: string;
  /** 根节点 ID */
  rootId: string;
  /** 状态：1 启用 / 0 禁用 */
  status: number;
  /** 更新时间 */
  updateTime: string;
  /** 更新人名称 */
  updateUsername: string;
  /** 更新人 ID */
  updatedBy: string;
}

/**创建文件夹 */
export interface CreateFolderParams {
  name: string;
  parentId?: string;
  remark?: string;
}

/**素材列表数据类型 */
export interface MaterialListParams {
  name: string;
  albumId: string;
  pageSize:number;
  current:number;
}

/**上传素材 */
export interface FileInfo {
  /** 名称 */
  name: string;
  /** 相册 ID */
  albumId: string;
  /** 文件 MD5 */
  fileMd5: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 文件地址 */
  fileUrl: string;
  /** 缩略图地址 */
  thumbnailUrl: string;
  /** 图片高度 */
  height: number;
  /** 图片宽度 */
  width: number;
}

/**编辑素材 */
export interface EditPaletteParams {
  id:string,
  name: string,
  albumId: string
}

/**全部文件 */
export interface AllFilesParams {
  name?: string,
  albumId?: string,
}

/**临时凭证 */
export interface voucherParams {
  accessKeyId: string,
  accessKeySecret: string,
  expiration: string,
  securityToken: string
}

/**广告主新增开发者下拉 */
export interface DeveloperItems {
  id: string;
  name: string;
  platform: string;
  apiKey: string;
  apiSecret: string;
  status: number;
  isSystem: number;
  authCount: string;
  remark: string;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
  createUsername: string;
  updateUsername: string;
}

export interface DeveloperListResponse {
  items: DeveloperItems[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number; 
}

/**华为商店 */
export interface AdvertiserDeveloperBindRequest {
  platform: string;
  advertiserId: string;
  advertiserName: string;
  developerId: string;
  config: Record<string, any>;
  advertiserRole: string;
  putStatus: number;
  projectId: string;
  remark: string;
  companyName: string;
  customer?: string,
  saleId?: string,
}

export interface PageResult {
  items: [];
  total: number;
  page: number;
  pageSize: number;
}

/**账户消耗详情 */
export interface AdvertiserCostDetailType {
  // page: number;
  // pageSize: number;
  platform: string;
  dateTime: [string, string];      
  dims: string[];                 
  advertiserId: string[];
  huwaweiAppIdList: string[];       
  developerId: string[];       
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/**账户消耗详情-appName下拉请求接口类型 */
export interface AppNameOptionsType {
  platform: string;
  developerId?: string;       
}

/**广告效果数据-广告联动下拉 */
export interface PlatformMatchRequest {
  platform: string;
  type: string;
  platformAccountIds: string[];
  campaignIds?: string[];
  groupIds?: string[];
  promotionIds?: string[];
}

/**账户消耗详情-账户名字下拉请求接口类型 */
export interface AdCompanyOptionsType {
  platform: string;    
}

