import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import type { PageViewItem } from "#/api/models/assert";
import type { StdConfigData, StdCreation } from "#/views/marketing/creation/bytedance_std/bytedance";
import type { HuaWeiStoreCreation } from "#/views/marketing/creation/huawei_store/huawei_store";
import type { VivoConfigData, VivoCreation } from "#/views/marketing/creation/vivo/vivo";

import {
  AdGroupRuleKey,
  AdRuleKey,
  CampaignRuleKey,
  DistributionMode,
  Platform
} from "#/constants/enums";

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
  appId: string
  downloadUrl?: string;
}

export interface AccountInfo {
  localAdvertiserId: string;
  advertiserName: string;
}

// ==================== 抖音号配置（巨量通用） ====================

export type AwemeDistributionRule = 'ALL_SAME' | 'PER_ACCOUNT' | 'PER_AD' | 'PER_PROJECT';

/**
 * 抖音号条目（存储在 Map 中）
 */
export interface AwemeMapping {
  awemeId: string;
  awemeName: string;
}

/**
 * 抖音号配置 —— 与标题包/落地页统一的 { config, data: Map } 模式
 *
 * Map key 语义：
 *   ALL_SAME / PER_PROJECT → key = '0'（全局一条）
 *   PER_ACCOUNT            → key = advertiserId
 *   PER_AD                 → key = `${advertiserId}-${adIdx}`
 */
export interface AwemeConfigData {
  config: { method: AwemeDistributionRule };
  data: Map<string, AwemeMapping[]>;
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
  creation: PlatformCreation<any | StdConfigData | VivoConfigData>,
  localMaterialIds: Array<string>
): number {
  if (platform === Platform.VIVO) {
    creation = creation as VivoCreation;
  }
  if (platform === Platform.BYTEDANCE) {
    creation = creation as StdCreation
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

  if (isGlobalDistribution(method)) {
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
  creation: PlatformCreation<any | VivoConfigData>,
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
  creation: PlatformCreation<any | VivoConfigData>,
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
  if (isGlobalDistribution(method)) {
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
 * 层级位置：当前节点在同级中的下标与同级总数
 * 用于「平均分配」逐层均分素材（账户 → 项目/计划 → 广告组 → 广告）
 */
export interface LevelPosition {
  index: number;
  count: number;
}

/**
 * 是否为全局单份数据的分配方式（全账户复用 / 平均分配）
 * 这两种方式的数据都只存在 data 的 '0' 键下，只有「按账户分配」按账户ID存储
 */
export function isGlobalDistribution(method: string): boolean {
  return method === DistributionMode.all || method === DistributionMode.avg;
}

/**
 * 平均分配：按同级数量均分列表，取第 index 份
 * - 每份数量按 ceil(总数 / 份数) 向上取整
 * - 数量不足时下标取模轮询复用，保证同级每个节点都能分到数据
 */
export function averageSlice<T>(list: Array<T>, position: LevelPosition): Array<T> {
  const { index, count } = position;
  if (list.length === 0 || count <= 0) return [];
  if (count === 1) return [...list];
  const size = Math.ceil(list.length / count);
  const result: Array<T> = [];
  for (let i = 0; i < size; i++) {
    result.push(list[(index * size + i) % list.length] as T);
  }
  return result;
}

/**
 * 平均分配素材：按各层级位置逐层均分到单个素材
 * 先把创意组内的素材（视频在前、图片在后）拉平后逐层取份，再按原创意组结构还原，空创意组丢弃
 */
export function averageMaterialGroups(
  groups: Array<Material>,
  levels: Array<LevelPosition>
): Array<Material> {
  const flat: Array<LocalMaterialData> = [];
  groups.forEach((group) => {
    flat.push(...(group.video || []), ...(group.image || []));
  });
  let picked = flat;
  levels.forEach((level) => {
    picked = averageSlice(picked, level);
  });
  if (picked === flat) return groups;
  const pickedSet = new Set(picked);
  const result: Array<Material> = [];
  groups.forEach((group) => {
    const video = (group.video || []).filter((item) => pickedSet.has(item));
    const image = (group.image || []).filter((item) => pickedSet.has(item));
    if (video.length > 0 || image.length > 0) {
      result.push({ ...group, video, image });
    }
  });
  return result;
}

/**
 * 获取素材
 * @param method 分配方式
 * @param data 素材数据
 * @param advertiserId 账户ID
 * @param levels 各层级位置（账户 → 项目/计划 → 广告组 → 广告），平均分配时用于逐层均分
 */
export function getMaterial(
  method: string,
  data: Map<string, Array<Material>>,
  advertiserId: string,
  levels: Array<LevelPosition> = []
): Array<Material> {
  if (method === DistributionMode.account) {
    return data.get(advertiserId) || [];
  }
  const dataList: Array<Material> = data.get("0") || [];
  // 平均分配：数据同样存在 '0' 键下，取值时按当前节点逐层均分
  if (method === DistributionMode.avg && levels.length > 0) {
    return averageMaterialGroups(dataList, levels);
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
): PageViewItem {
  let dataList: Array<PageViewItem> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return <PageViewItem>dataList[0] || {};
}


/**
 * 获取监测链接
 * @param method 分配方式
 * @param data 监测链接数据
 * @param advertiserId 账户ID
 * @param index 索引
 */
export function getMonitoringLink(
  method: string,
  data: Map<string, Array<MonitoringLinkType>>,
  advertiserId: string,
  index: number
): MonitoringLinkType {
  let dataList: Array<MonitoringLinkType> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return (
    dataList[index % dataList.length] || {
      clickLink: "",
      exposureLink: "",
      monitorLink: "",
      linkModeType: "",
      allocateType: "",
      ocpxTaskId: "",
    }
  );
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
