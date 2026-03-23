import {AdRuleKey, CampaignRuleKey, DistributionMode, Platform} from "#/constants/enums";
import type {VivoConfigData, VivoCreation} from "#/views/marketing/creation/vivo/vivo";
import type {TargetedPackageTypeItem, TitlePackageItem} from "#/api/models";

/**
 * 媒体基类
 */
export interface PlatformCreation<C> {
  platform: string;
  accountInfo: Array<AccountInfo>;
  ruleInfo: RuleInfo;
  configData: C;
  project: Project
  monitoringLink: MonitoringLinkType
}

export interface MonitoringLinkType {
  clickLink: string,
  exposureLink: string,
  monitorLink: string,
  linkModeType: string,
  allocateType: string,
}

/**
 * 项目
 */
export interface Project {
  projectId: string;
  projectName: string;
  packageName: string;
  icon: string
}

export interface AccountInfo {
  localAdvertiserId: string;
  advertiserName: string;
}

export interface RuleInfo {
  projectRuleKey: string;
  projectCount: number;
  adRuleKey: string;
  adCount: number;
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
  isExpanded: boolean
  active: string
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
 *根据规则获取计划个数
 * @param platform
 * @param creation
 * @param localMaterialIds
 */
export function getRuleInfoCampaignCount(
  platform: string, creation: PlatformCreation<VivoConfigData | any>, localMaterialIds: Array<string>
): number {
  if (platform === Platform.VIVO) {
    creation = creation as VivoCreation;
  }

  let method: string = DistributionMode.all;
  let campaignCount: number = 0;

  const projectRuleKey: string = creation.ruleInfo.projectRuleKey;
  if (projectRuleKey === CampaignRuleKey.targeting) {
    method = creation.configData.audience?.audienceConfig.method;
    campaignCount = getCampaignCount(
      creation.configData.audience?.audienceConfig.method,
      creation.configData.audience?.data,
      localMaterialIds
    )
  } else if (projectRuleKey === CampaignRuleKey.creative) {
    method = creation.configData.material?.config.method;
    campaignCount = getCampaignCount(
      creation.configData.material?.config.method,
      creation.configData.material?.data,
      localMaterialIds
    )
  } else if (projectRuleKey === CampaignRuleKey.title) {
    method = creation.configData.titlePackage?.titlePackageConfig.method;
    campaignCount = getCampaignCount(
      creation.configData.titlePackage?.titlePackageConfig.method,
      creation.configData.titlePackage?.data,
      localMaterialIds
    )
  } else {
    campaignCount = creation.ruleInfo.projectCount || 0
  }

  if (method == DistributionMode.all) {
    return campaignCount * localMaterialIds.length
  } else {
    return campaignCount;
  }
}


/**
 * 根据广告配置获取广告个数
 */
export function getRuleInfoAdCount(
  platform: string, creation: PlatformCreation<VivoConfigData | any>, localMaterialIds: Array<string>
): number {
  if (platform === Platform.VIVO) {
    creation = creation as VivoCreation;
  }
  const adRuleKey = creation.ruleInfo.adRuleKey;
  if (adRuleKey === AdRuleKey.creative) {
    return getCampaignCount(
      creation.configData.material?.config.method,
      creation.configData.material?.data,
      localMaterialIds
    )
  } else if (adRuleKey === AdRuleKey.title) {
    return getCampaignCount(
      creation.configData.titlePackage?.titlePackageConfig.method,
      creation.configData.titlePackage?.data,
      localMaterialIds
    )
  } else {
    return creation.ruleInfo.adCount || 0
  }
}


/**
 * 获取计划数量
 * @param method
 * @param data
 * @param advertiserIds
 */
export function getCampaignCount(method: string, data: Map<string, any[]>, advertiserIds: string[]): number {
  if (method === DistributionMode.all) {
    return data.get("0")?.length || 0
  } else {
    let count: number = 0;
    advertiserIds.forEach(
      x => {
        count += data.get(x)?.length || 0
      }
    )
    return count
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
  method: string, data: Map<string, Array<TargetedPackageTypeItem>>, advertiserId: string, index: number
): TargetedPackageTypeItem {
  let dataList: Array<TargetedPackageTypeItem> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return <TargetedPackageTypeItem>dataList[index % dataList.length] || {}
}


/**
 * 获取素材
 * @param method
 * @param data
 * @param advertiserId
 * @param index
 */
export function getMaterial(method: string, data: Map<string, Array<Material>>, advertiserId: string): Array<Material> {
  let dataList: Array<Material> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || []
  }
  return dataList
}


/**
 * 获取标题包
 * @param method
 * @param data
 * @param advertiserId
 * @param index
 */
export function getTiltePackage(method: string, data: Map<string, Array<TitlePackageItem>>, advertiserId: string, index: number): TitlePackageItem {
  let dataList: Array<TitlePackageItem> = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || []
  }
  return <TitlePackageItem>dataList[index % dataList.length] || {}
}
