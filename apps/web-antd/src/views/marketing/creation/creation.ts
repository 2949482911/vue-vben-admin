import {
  AdGroupRuleKey,
  AdRuleKey,
  CampaignRuleKey,
  DistributionMode,
  Platform
} from "#/constants/enums";
import type { VivoConfigData, VivoCreation } from "#/views/marketing/creation/vivo/vivo";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import type { PageViewItem } from "#/api/models/assert";
import type { HuaWeiStoreCreation } from "#/views/marketing/creation/huawei_store/huawei_store";

/**
 * 媒体基类
 */
export interface PlatformCreation<C> {
  platform: string;
  version: string;
  accountInfo: Array<AccountInfo>;
  ruleInfo: RuleInfo;
  configData: C;
  project: Project;
  monitoringLink: MonitoringLinkType;
}

export interface MonitoringLinkType {
  clickLink: string;
  exposureLink: string;
  monitorLink: string;
  linkModeType: string;
  allocateType: string;
  ocpxTaskId: string;
}

/**
 * 项目
 */
export interface Project {
  projectId: string;
  projectName: string;
  packageName: string;
  icon: string;
  // 媒体APPID
  // appId: string
}

export interface AccountInfo {
  localAdvertiserId: string;
  advertiserName: string;
}

export interface RuleInfo {
  projectRuleKey: string;
  projectCount: number;
  adGroupRuleKey: string;
  adGroupCount: number;
  adRuleKey: string;
  adCount: number;
  // 创意生成规则
  creativeRuleKey: string;
  creativeCount: number;
}

export interface MaterialData {
  config: MaterialDataConfig;
  data: Map<string, Material[]>;
}

export interface MaterialDataConfig {
  method: string;
  // imageMaxCount: number;
  // videoMaxCount: number;
  // 图文个数
  // carouselMaxCount: number;
  // trialMaxCount: number;
}

// 素材
export interface Material {
  image: Array<LocalMaterialData>;
  video: Array<LocalMaterialData>;
  isExpanded: boolean;
  active: string;
  brandName: string;
}

// 本地素材data
export interface LocalMaterialData {
  name: string;
  url: string;
  localMaterialId: string;
}

// 广告搭建通用基础类
export interface Campaign {
  getName: () => string;
}

export interface Adgroup {
  getName: () => string;
}

export interface Promotion {
  getName: () => string;
}

/**
 * 规则层级配置接口
 * 定义每个规则层级的显示名称和是否显示
 */
export interface RuleLevelConfig {
  show: boolean;         // 是否显示该层级
  name: string;          // 该层级的显示名称
  rules: string;         // 该层级的规则名称（如：营销单元生成规则）
  countLabel: string;    // 该层级指定数量时的标签文字
}

/**
 * 规则配置接口
 * 定义整个规则配置的结构
 */
export interface RuleConfiguration {
  project: RuleLevelConfig;    // 项目层级配置
  adGroup: RuleLevelConfig;    // 广告组层级配置
  ad: RuleLevelConfig;         // 广告层级配置
  creative: RuleLevelConfig;   // 创意层级配置
}

/**
 * 规则选项接口
 * 定义单个规则选项的数据结构
 */
export interface RuleOption {
  title: string;    // 规则标题
  desc: string;     // 规则描述
  key: string;      // 规则键值
}

/**
 * 规则选项集合接口
 * 定义所有规则选项的集合
 */
export interface RuleOptions {
  projectRules: RuleOption[];      // 项目规则选项
  adGroupRules: RuleOption[];      // 广告组规则选项
  adRules: RuleOption[];           // 广告规则选项
  creativeRules: RuleOption[];     // 创意规则选项
}

/**
 * 表单字段配置接口
 * 定义单个表单字段的数据结构
 */
export interface FormFieldConfig {
  component: string;    // 组件类型（如：Input、Select等）
  fieldName: string;    // 字段名，对应实体字段
  label: string;        // 字段label，用于显示
  rules?: string;       // 校验规则（可选，如：required）
}

/**
 *根据规则获取计划个数
 * @param platform
 * @param creation
 * @param localMaterialIds
 */
export function getRuleInfoCampaignCount(
  platform: string,
  creation: PlatformCreation<VivoConfigData | any>,
  localMaterialIds: Array<string>
): number {
  if (platform === Platform.VIVO) {
    creation = creation as VivoCreation;
  }

  let method: string = DistributionMode.all;
  let campaignCount: number = 0;

  const projectRuleKey: string = creation.ruleInfo.projectRuleKey;
  if (projectRuleKey === CampaignRuleKey.targeting) {
    method = creation.configData.audience?.audienceConfig ? creation.configData.audience?.audienceConfig.method : creation.configData.audience.config.method;
    campaignCount = getCampaignCount(
      method,
      creation.configData.audience?.data,
      localMaterialIds
    );
  } else if (projectRuleKey === CampaignRuleKey.creative) {
    method = creation.configData.material?.config.method;
    campaignCount = getCampaignCount(
      creation.configData.material?.config.method,
      creation.configData.material?.data,
      localMaterialIds
    );
  } else if (projectRuleKey === CampaignRuleKey.title) {
    method = creation.configData.titlePackage?.titlePackageConfig ? creation.configData.titlePackage?.titlePackageConfig.method : creation.configData.titlePackage?.config.method;
    campaignCount = getCampaignCount(
      method,
      creation.configData.titlePackage?.data,
      localMaterialIds
    );
  } else {
    campaignCount = creation.ruleInfo.projectCount || 0;
  }

  if (method == DistributionMode.all) {
    return campaignCount * localMaterialIds.length;
  } else {
    return campaignCount;
  }
}

/**
 * 根据项目配置获取广告组个数
 */
export function getRuleInfoAdCountGroup(
  platform: string,
  creation: PlatformCreation<VivoConfigData | any>,
  localMaterialIds: Array<string>
): number {
  if (platform === Platform.VIVO) {
    creation = creation as VivoCreation;
  }
  if (platform === Platform.HUAWEI_STORE) {
    creation = creation as HuaWeiStoreCreation;
  }
  const adGroupRuleKey = creation.ruleInfo.adGroupRuleKey;
  if (adGroupRuleKey === AdGroupRuleKey.targeting) {
    return getCampaignCount(
      creation.configData.audience?.audienceConfig ? creation.configData.audience?.audienceConfig.method : creation.configData.audience?.config.method,
      creation.configData.audience?.data,
      localMaterialIds
    );
  } else if (adGroupRuleKey === AdGroupRuleKey.creative) {
    return getCampaignCount(
      creation.configData.material?.config.method,
      creation.configData.material?.data,
      localMaterialIds
    );
  } else if (adGroupRuleKey === AdGroupRuleKey.title) {
    return getCampaignCount(
      creation.configData.titlePackage?.config.method,
      creation.configData.titlePackage?.data,
      localMaterialIds
    );
  } else {
    return creation.ruleInfo.adGroupCount || 0;
  }
}

/**
 * 根据广告组配置获取广告个数
 */
export function getRuleInfoAdCount(
  platform: string,
  creation: PlatformCreation<VivoConfigData | any>,
  localMaterialIds: Array<string>
): number {
  if (platform === Platform.VIVO) {
    creation = creation as VivoCreation;
  }
  if (platform === Platform.HUAWEI_STORE) {
    creation = creation as HuaWeiStoreCreation;
  }
  const adRuleKey = creation.ruleInfo.adRuleKey;
  if (adRuleKey === AdRuleKey.creative) {
    return getCampaignCount(
      creation.configData.material?.config.method,
      creation.configData.material?.data,
      localMaterialIds
    );
  } else if (adRuleKey === AdRuleKey.title) {
    return getCampaignCount(
      creation.configData.titlePackage?.titlePackageConfig ? creation.configData.titlePackage?.titlePackageConfig.method : creation.configData.titlePackage?.config.method,
      creation.configData.titlePackage?.data,
      localMaterialIds
    );
  } else {
    return creation.ruleInfo.adCount || 0;
  }
}

/**
 * 获取计划数量
 * @param method
 * @param data
 * @param advertiserIds
 */
export function getCampaignCount(
  method: string,
  data: Map<string, any[]>,
  advertiserIds: string[]
): number {
  if (method === DistributionMode.all) {
    return data.get("0")?.length || 0;
  } else {
    let count: number = 0;
    advertiserIds.forEach((x) => {
      count += data.get(x)?.length || 0;
    });
    return count;
  }
}

/**
 * 获取定向包
 * @param method
 * @param data
 * @param advertiserId
 * @param index
 */
export function getAudience(
  method: string,
  data: Map<string, Array<TargetedPackageTypeItem>>,
  advertiserId: string,
  index: number
): TargetedPackageTypeItem {
  let dataList: Array<TargetedPackageTypeItem> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return <TargetedPackageTypeItem>dataList[index % dataList.length] || {};
}

/**
 * 获取素材
 * @param method
 * @param data
 * @param advertiserId
 * @param index
 */
export function getMaterial(
  method: string,
  data: Map<string, Array<Material>>,
  advertiserId: string
): Array<Material> {
  let dataList: Array<Material> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return dataList;
}

/**
 * 获取标题包
 * @param method
 * @param data
 * @param advertiserId
 * @param index
 */
export function getTiltePackage(
  method: string,
  data: Map<string, Array<TitlePackageItem>>,
  advertiserId: string,
  index: number
): TitlePackageItem {
  let dataList: Array<TitlePackageItem> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return <TitlePackageItem>dataList[index % dataList.length] || {};
}

/**
 * 获取deepLink链接
 * @param method
 * @param data
 * @param advertiserId
 */
export function getDeepLink(
  method: string,
  data: Map<string, Array<string>>,
  advertiserId: string
): string {
  // 1. 确定查找的 Key
  // 如果是全部相同模式，固定查找 '0'；否则查找传入的广告主 ID
  const key = method === DistributionMode.all ? "0" : String(advertiserId);

  // 2. 兼容性取值
  let dataList: string[] | undefined;

  // 检查 data 是否为 Map（是否有 get 方法）
  if (data instanceof Map || typeof (data as any).get === "function") {
    dataList = (data as Map<string, string[]>).get(key);
  } else {
    // 如果是普通对象，直接用 key 取值
    dataList = (data as Record<string, string[]>)[key];
  }

  // 3. 安全返回第一个值
  return Array.isArray(dataList) && dataList.length > 0 ? String(dataList[0]) : "";
}

/**
 * 获取落地页
 * @param method
 * @param data
 * @param advertiserId
 */
export function getLandingPage(
  method: string,
  data: Map<string, Array<PageViewItem>>,
  advertiserId: string
): PageViewItem | undefined {
  let dataList: Array<PageViewItem> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return dataList[0];
}


/**
 * 生成规则判断
 */
export interface MethodConfig {
  method: string;
}


/**
 * ConfigurationConfig
 * 配置区配置对象
 */
export interface ConfigurationConfig {
  platform: string;
  template?: string;
}


/**
 * 定向包配置
 */
export interface AudienceConfigData {
  config: MethodConfig;
  data: Map<string, Array<TargetedPackageTypeItem>>;
}


/**
 * 标题包配置
 */
export interface TitlePackageConfigData {
  config: MethodConfig;
  data: Map<string, Array<TitlePackageItem>>;
}


/**
 * 落地页配置
 */
export interface PageViewConfigData {
  config: MethodConfig;
  data: Map<string, Array<PageViewItem>>;
}


/**
 * 监测链接配置
 *
 */
export interface MonitoringLinkConfigData {
  config: MethodConfig;
  linkType: string;
  data: Map<string, Array<MonitoringLinkType>>;
}
