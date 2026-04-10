import type {BaseItem, PageRequestParams} from "#/api/models/core";
import type {RuleType} from "#/constants/enums";
import { type PlatformCreation } from "#/views/marketing/creation/creation";
/**
 * 账户请求
 */
export interface AdvertiserPageRequest extends PageRequestParams {
  advertiserId?: string;
  advertiserName?: string;
  putStatus?: number;
  platform?: string;
  putStatue?: number
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
  tagId: string;
  hourlyState: number;
}
// 拉取历史列表
export interface HistoryItem extends BaseItem {
  taskType: string;
  source: string;
  localAdvertiserId: string;
  startTime: string;
  endTime: string;
  taskStatus: number;
  retry: number;
  taskStartTime: string;
  taskEndTime: string;
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
export interface ImportChildRequest {
  id: string;
  advertiserIds: Array<string>;
  projectId: string;
}


/**
 * 账户授权请求iD
 */
export interface AuthAdvertiserRequest {
  platform: string;
  developerId?: string
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
  id?: string,
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
export interface MetricPageRequest {
  metricGroupId: string;
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
  size?: number;
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
  projectId: string;
  queryMetric: string[];
  dateTimeRange?: [string, string];
  campaign_id?: string[];
  adgroup_id?: string[];
  promotion_id?: string[];
  creative_id?: string[];
}

/**模板列表数据类型*/
export interface templateListType {
  page: number;
  pageSize: number;
  name?: string;
  type?: string;
}

/**删除模板列表数据类型*/
export interface delTemplate {
  targetIds: string[];
  type: string;
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

/**创建文件夹和编辑文件夹的type */
export interface CreateFolderParams {
  id?: string;
  name: string;
  parentId?: string;
  remark?: string;
}

/**素材列表数据类型 */
export interface MaterialListParams {
  name?: string;
  albumId?: string;
  type?: number;
  pageSize: number;
  page: number;
  needAlbum?: boolean;
}

/**上传素材 */
export interface FileInfo extends BaseItem {
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
  id: string,
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
  apiId?: string,
  apiKey?: string,
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
export interface ImportDataType {
  platform: string;
  files: FormData;
}

/**账户消耗详情-账户名字下拉请求接口类型 */
export interface AdCompanyOptionsType {
  platform: string;
}

/**营销-资产-标题包查询 */
export interface GetTitlePackType {
  platform?: string;
  title?: string;
  projectId?: string;
  page: number;
  pageSize: number;
}

/**营销-资产-标题包删除 */
export interface DelTitlePackType {
  targetIds: string[];
  type: string;
}

/**营销-资产-标题包新建 */
export interface TitlePackConfig {
  subTitle: string[];
  pushSubTitle: string[];
}

/** 标题包基础数据结构 */
export interface TitlePackItem {
  title: string;
  platform: string;
  projectId: string;
  config: TitlePackConfig;
}

/**营销-资产-定向包查询 */
export interface GetTargetedPackageType {
  platform?: string;
  name?: string;
  platformAdvertiserId?: string;
  page: number;
  pageSize: number;
}

/**营销-资产-定向包新建 */
export interface NewTargetedPackageType {
  localAdvertiserId?: string;
  name: string;
  platform?: string;
  platformAdvertiserId?: string;
  remark?: string;
  config?: {
    sexList?: string[];
    ageList?: string[];
    interestSet?: string[];
    installedApp?: number;
    androidVersionSet?: string;
    phonePriceSet?: string;
    network?: number;
    phoneSeriesSet?: string;
    networkOperatorSet?: string;
    region?: {
      regionCodeList?: string[];
      stayType?: number;
    },
    installBehavior?: {
      period?: number;
      behavior?: number;
    },
    startBehavior?: {
      period?: number;
      behavior?: number;
    },
  }
}


/**定向包类型 */
export interface TargetedPackageTypeItem extends BaseItem {
  id: string;
  name: string;
  platform: string;
  platformAdvertiserId: string;
  config: string;
  remark: string;
}

/**标题包类型 */
export interface TitlePackageItem extends BaseItem {
  projectName: string;
  title: string;
  createdBy: string;
  platform: string;
  projectId: string;
  updatedBy: string;
  advertiserName: string;
  config: any;
}


/** 创编任务-查询任务列表 */
export interface GetCreationTaskType {
  platform?: string;
  name?: string;
  taskStatus?: Number;
  projectId?: string;
}

/** 创编任务列表数据结构 */
export interface CreationTaskItem extends BaseItem{
  platform?: string;
  name?: string;
  projectId?: string;
  ruleType?: RuleType;
  commitAdvertiserCount?: Number;
  commitCampaignCount?: Number;
  successCampaignCount?: Number;
  commitAdGroupCount?: Number;
  successAdGroupCount?: Number;
  commitPromotionCount?: Number;
  successPromotionCount?: Number;
  commitCreativeCount?: Number;
  successCreativeCount?: Number;
  startTime?: string;
  endTime?: string;
  taskStatus?: Number;
}
// 账户标签
export interface LabelItem extends BaseItem {
  name?: string;
  remark?: string;
}
 /** 账户标签-查询任务列表 */
export interface GetLabelItemType {
  name?: string;
}
 /** 账户标签-新增任务列表 */
export interface NewLabelItemType {
  name?: string;
  remark?: string;
}
/**账户标签-编辑任务列表 */
export interface EditLabelItemType extends NewLabelItemType {
  id:string,

}
/**营销-资产-标题包删除 */
export interface DelLabelItemType {
  targetIds: string[];
  type:string;
}

/**营销-创编-Vivo营销-广告主-广告投放资质ID */
export interface AdInvestmentType {
  advertiserId: string[];
}

/**营销-创编-Vivo营销-广告创意素材组-广告创意类型 */
export interface AdCreativeType {
  advertiserId: string[],
  displayType: number,
  adType: number,
  mediaType: number,
  positionType: number,
  genType: number
}

/**营销-创编-Vivo营销-广告创意素材组-投放虚拟位置 */
export interface VirtualLocationType {
  advertiserId: string[],
  normId: number,
  displayType: number,
  adType: number,
  mediaType: number,
}

/**营销-创编-Vivo营销-提交审核 */
export interface VivoSubmitType {
  name: string,
  platform: string,
  projectId: string,
  ruleType: string,
  version: string,
  fullParamsData: string,
  configArea: string,
}
/**营销-创编-Vivo营销-策略组 */
export interface StrategyGropType<T = any> extends BaseItem {
  name: string;
  platform: string;
  projectId: string;
  config: string;
  configObj: PlatformCreation<T>;
}
export interface GetStrategyGropType extends PageRequestParams {
  name: string;
  platform: string;
  projectId: string;
}
export interface UpdateStrategyGropType extends StrategyGropType {
  id: string;
}

export interface MetricGroupType extends BaseItem {
  name: string;
  description: string;
}
export interface MetricGroupPageRequest extends BaseItem {
  name: string;
}
export interface UpdateMetricGroupType extends MetricGroupType {
  id: string;
}
export interface pushConfigType {
  pushMethod: number;
  emailAddress: string;
}
export interface ReportSubscriptionItem {
  name: string;
  type: string;
  queryMetric: string[];
  status: number;
  config: searchDataFilter;
  subscribeDateTimeRange: [string, string];
  pushConfig: Record<string, string[]>[];
}
export interface UpdateSubscribeType extends ReportSubscriptionItem {
  id: string;
}
export interface GetSubscribeType extends PageRequestParams{
  name: string;
  type: string;
}
