// 华为创编对象定义

import type {
  AudienceConfigData,
  ConfigurationConfig,
  MaterialData,
  PlatformCreation,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";

export const HUAWEI_STORE: string = "0.1";

export interface HuaWeiStoreCreation extends PlatformCreation <HuaWeiStoreConfigData> {
  configurationConfig: ConfigurationConfig
}

export interface HuaWeiStoreConfigData {
  campaign: HuaWeiStoreCampaignData;
  adgroup: HuaWeiStoreAdgroupData;
  promotion: HuaWeiStorePromotionData;
  material: MaterialData;
  audience: AudienceConfigData;
  titlePackage: TitlePackageConfigData;
}


export interface HuaWeiStoreCampaignData {
  appId: string;
  /**
   *
   * 仅投安装用户。0：不针对安装情况进行过滤，2：仅投放已安装APP用户
   */
  isExcludeInstalledApp: number;
  taskName: string;
  budget: Number;
  startDate: string;
  endDate: string;
  deliveryHours: Array<HuaWeiStoreDeliveryHours>;
  regions: string;
  isPositiveRegion: string;
  attributionMode: number;
  impAdMonitorReportUrl: string;
  clickAdMonitorReportUrl: string;
  campaignId: string;
  campaignInfo: HuaWeiStoreCampaignInfo;

}

export interface HuaWeiStoreCampaignInfo {
  campaignName: string;
  buyMode: number;
  marketingGoal: number;
  adNetwork: number;
  type: number;
  dailyBudget: number;
  subTasks: Array<HuaWeiStoreCreateSubTask>;
}


export interface HuaWeiStoreCreateSubTask {
  subTaskName: string;
  subTaskPrice: number;
  subTaskUserGroupId: string;
}


export interface HuaWeiStoreDeliveryHours {
  day: string;
  startHMs: string;
  endHMs: string;
}


export interface HuaWeiStoreAdgroupData {
  subTaskName: string;
  subTaskPrice: number;
  taskId: string;
  conversionBehaviorId: string;
  conversionExcludeBehaviorId: string;
  subTaskFollowAppName: string;
  subTaskRtaId: string;
  subTaskKey: string;
  subTaskKeyMatchType: string;
  subTaskUserGroupId: string;
}


export interface HuaWeiStorePromotionData {
  pageType: string;
  pageId: string;
  contentTitle: string;
  contentType: string;
  attachment: string;
  slogan: string;
  appDeepLinkUrl: string;
  httpDeepLinkUrl: string;
  landingPageType: string;
  landingPageContent: string;
  landingPageObsUrl: string;

  deepLinkUrl: string;
  // BrandContent
  verticalScreenFloatPic: string;
  // BrandContent
  crossScreenFloatPic: string;
  // BrandContent
  landingPageQualification: string;
  // 素材ids
  materialIdsList: Array<string>;
}


