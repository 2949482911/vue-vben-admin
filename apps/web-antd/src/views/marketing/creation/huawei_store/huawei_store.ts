// 华为创编对象定义

import type { TargetedPackageTypeItem } from "#/api/models";
import type { PageViewItem } from "#/api/models/assert";
// 华为创编对象定义
import type {
  Adgroup,
  AudienceConfigData, Campaign,
  ConfigurationConfig,
  MaterialData,
  MonitoringLinkConfigData,
  PageViewConfigData,
  PlatformCreation, Promotion,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";

import {
  AdGroupRuleKey,
  AdRuleKey,
  CampaignRuleKey,
  DistributionMode,
  Platform
} from "#/constants/enums";
import { renderProjectTitle } from "#/utils/customName";
import {
  getAudience,
  getFlatTitleList,
  getMaterial,
  getMonitoringLink,
  getRuleInfoAdCount,
  getRuleInfoAdCountGroup,
  getRuleInfoCampaignCount,
  getTitleCount,
  type Material,
  type MonitoringLinkType
} from "#/views/marketing/creation/creation";

export const HUAWEI_STORE: string = "0.1";

export interface HuaWeiStoreCreation extends PlatformCreation <HuaWeiStoreConfigData> {
  configurationConfig: ConfigurationConfig;
}

/**
 * HuaWeiStoreConfigData
 * 华为商店的批投参数
 */
export interface HuaWeiStoreConfigData {
  campaign: HuaWeiStoreCampaignData;
  adgroup: HuaWeiStoreAdgroupData;
  promotion: HuaWeiStorePromotionData;
  material: MaterialData;
  audience: AudienceConfigData;
  titlePackage: TitlePackageConfigData;
  pageView: PageViewConfigData;
  monitoringLink: MonitoringLinkConfigData;
  promotionType: PromotionType
}


/**
 * 投放华为的具体类型
 */
export interface PromotionType {
  taskType: string;
  adType: string;
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


/**
 * HuaWeiStoreCreationData
 * 华为商店生成批投数据
 */
export interface HuaWeiStoreCreationData {
  advertiserId: string;
  campaignList: Array<HuaWeiStoreTask>;
  getCampaignCount: () => number;
  // 获取广组告数
  getAdGroupCount: () => number;
  // 获取广告数
  getAdCount: () => number;
}


/**
 * 华为任务对象
 */
export interface HuaWeiStoreTask extends Campaign {
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

  adGroupList: Array<HuaWeiStoreSubTask>;
}


// 华为子任务
export interface HuaWeiStoreSubTask extends Adgroup {
  adgroupId: string;
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
  promotionList: Array<HuaWeiStorePromotion>;
}

// 华为商店广告信息
export interface HuaWeiStorePromotion extends Promotion {
  adId: string;
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
  // 监测链接
  clickMonitorUrl: string;
  viewMonitorUrl: string;
}


/**
 * genPreviewTableData
 * 生成华为商店预览表格数据
 */
export function getPreviewTableData(creationInfo: HuaWeiStoreCreation): Array<HuaWeiStoreCreationData> {
  const adList: Array<HuaWeiStoreCreationData> = [];

  // 遍历账户
  creationInfo.accountInfo.forEach((account, accountIdx) => {
    const advertiserId = account.localAdvertiserId;

    // 当前账户的表格数据
    const tableData: HuaWeiStoreCreationData = {
      advertiserId,
      campaignList: [],
      getCampaignCount(): number {
        return this.campaignList.length;
      },
      getAdGroupCount(): number {
        let count: number = 0;
        this.campaignList.forEach((campaign) => {
          count += campaign.adGroupList.length;
        });
        return count;
      },
      getAdCount(): number {
        let count: number = 0;
        this.campaignList.forEach((campaign) => {
          campaign.adGroupList.forEach((adgroup) => {
            count += adgroup.promotionList.length;
          });
        });
        return count;
      }
    };

    // 获取各层级数量（按标题生成时，对应层级数量 = 标题总数）
    const titlePackageConfig = creationInfo.configData.titlePackage;

    const campaignCount: number =
      creationInfo.ruleInfo.projectRuleKey === CampaignRuleKey.title
        ? getTitleCount(
            titlePackageConfig.config.method,
            titlePackageConfig.data,
            [advertiserId]
          )
        : getRuleInfoCampaignCount(
            Platform.HUAWEI_STORE,
            creationInfo,
            [advertiserId]
          );

    const adGroupCount: number =
      creationInfo.ruleInfo.adGroupRuleKey === AdGroupRuleKey.title
        ? getTitleCount(
            titlePackageConfig.config.method,
            titlePackageConfig.data,
            [advertiserId]
          )
        : getRuleInfoAdCountGroup(
            Platform.HUAWEI_STORE,
            creationInfo,
            [advertiserId]
          );

    const adCount: number =
      creationInfo.ruleInfo.adRuleKey === AdRuleKey.title
        ? getTitleCount(
            titlePackageConfig.config.method,
            titlePackageConfig.data,
            [advertiserId]
          )
        : getRuleInfoAdCount(Platform.HUAWEI_STORE, creationInfo, [advertiserId]);

    // 该账户展开后的全部标题（扁平列表），逐广告轮询取标题
    const flatTitles = getFlatTitleList(
      titlePackageConfig.config.method,
      titlePackageConfig.data,
      advertiserId
    );

    // 子任务（广告组）全局下标：跨任务累计，避免内层下标从 0 重置导致名字重复
    let adGroupGlobalIdx = 0;

    // 遍历生成任务
    for (let campaignIdx = 0; campaignIdx < campaignCount; campaignIdx++) {
      const adGroupList: Array<HuaWeiStoreSubTask> = [];

      // 遍历生成广告组（子任务，下标与外层关联：全局序号）
      for (let adGroupIdx = 0; adGroupIdx < adGroupCount; adGroupIdx++) {
        const globalAdGroupIdx = adGroupGlobalIdx + adGroupIdx;

        // 构建子任务对象
        const audience: TargetedPackageTypeItem = getAudience(
          creationInfo.configData.audience.config.method,
          creationInfo.configData.audience.data,
          advertiserId,
          globalAdGroupIdx
        );
        const adgroup: HuaWeiStoreSubTask = {
          getName(): string {
            return this.subTaskName;
          },
          adgroupId: "",
          subTaskName: renderProjectTitle(
            creationInfo.configData.adgroup.subTaskName,
            globalAdGroupIdx,
            creationInfo.project.projectName
          ),
          subTaskPrice: creationInfo.configData.adgroup.subTaskPrice,
          taskId: creationInfo.configData.campaign.campaignId,
          conversionBehaviorId: creationInfo.configData.adgroup.conversionBehaviorId,
          conversionExcludeBehaviorId: creationInfo.configData.adgroup.conversionExcludeBehaviorId,
          subTaskFollowAppName: creationInfo.configData.adgroup.subTaskFollowAppName,
          subTaskRtaId: creationInfo.configData.adgroup.subTaskRtaId,
          subTaskKey: creationInfo.configData.adgroup.subTaskKey,
          subTaskKeyMatchType: creationInfo.configData.adgroup.subTaskKeyMatchType,
          subTaskUserGroupId: audience.mediaId,
          promotionList: []
        };

        // 遍历生成广告（下标与广告组全局序号关联）
        for (let adIdx = 0; adIdx < adCount; adIdx++) {
          const globalAdIdx = globalAdGroupIdx * adCount + adIdx;

          // 获取素材（平均分配时按 账户 → 任务 → 子任务 → 广告 逐层均分）
          const materialList: Array<Material> = getMaterial(
            creationInfo.configData.material.config.method,
            creationInfo.configData.material.data,
            advertiserId,
            [
              { index: accountIdx, count: creationInfo.accountInfo.length },
              { index: campaignIdx, count: campaignCount },
              { index: adGroupIdx, count: adGroupCount },
              { index: adIdx, count: adCount }
            ]
          );

          // 按全局广告序号轮询取标题
          const title = flatTitles[globalAdIdx % flatTitles.length] ?? '';

          // 获取落地页（华为商店使用 PageViewItem）
          const landingPage: PageViewItem | undefined = getPageViewItem(
            creationInfo.configData.pageView.config.method,
            creationInfo.configData.pageView.data,
            advertiserId
          );

          // 获取监测链接
          const monitoringLink: MonitoringLinkType = getMonitoringLink(
            creationInfo.configData.monitoringLink.config.method,
            creationInfo.configData.monitoringLink.data,
            advertiserId,
            globalAdIdx
          );

          // 构建广告对象
          const promotion: HuaWeiStorePromotion = {
            getName(): string {
              return this.contentTitle;
            },
            adId: "",
            pageType: creationInfo.configData.promotion.pageType,
            pageId: landingPage?.id || "",
            contentTitle: title,
            contentType: creationInfo.configData.promotion.contentType,
            attachment: creationInfo.configData.promotion.attachment,
            slogan: title,
            appDeepLinkUrl: creationInfo.configData.promotion.appDeepLinkUrl,
            httpDeepLinkUrl: creationInfo.configData.promotion.httpDeepLinkUrl,
            landingPageType: creationInfo.configData.promotion.landingPageType,
            landingPageContent: creationInfo.configData.promotion.landingPageContent,
            landingPageObsUrl: creationInfo.configData.promotion.landingPageObsUrl,
            deepLinkUrl: landingPage?.id || "",
            verticalScreenFloatPic: creationInfo.configData.promotion.verticalScreenFloatPic,
            crossScreenFloatPic: creationInfo.configData.promotion.crossScreenFloatPic,
            landingPageQualification: creationInfo.configData.promotion.landingPageQualification,
            materialIdsList: getMaterialIds(materialList, globalAdIdx),
            clickMonitorUrl: monitoringLink.clickLink,
            viewMonitorUrl: monitoringLink.exposureLink
          };

          adgroup.promotionList.push(promotion);
        }

        // 外层累计本任务的子任务数，保证下一个任务的子任务/广告下标连续
        adGroupGlobalIdx++;
        adGroupList.push(adgroup);
      }

      // 构建任务对象
      const campaign: HuaWeiStoreTask = {
        getName(): string {
          return this.taskName;
        },
        campaignId: "",
        appId: creationInfo.configData.campaign.appId,
        isExcludeInstalledApp: creationInfo.configData.campaign.isExcludeInstalledApp,
        taskName: renderProjectTitle(
          creationInfo.configData.campaign.taskName,
          campaignIdx,
          creationInfo.project.projectName
        ),
        budget: creationInfo.configData.campaign.budget,
        startDate: creationInfo.configData.campaign.startDate,
        endDate: creationInfo.configData.campaign.endDate,
        deliveryHours: creationInfo.configData.campaign.deliveryHours,
        regions: creationInfo.configData.campaign.regions,
        isPositiveRegion: creationInfo.configData.campaign.isPositiveRegion,
        attributionMode: creationInfo.configData.campaign.attributionMode,
        impAdMonitorReportUrl: creationInfo.configData.campaign.impAdMonitorReportUrl,
        clickAdMonitorReportUrl: creationInfo.configData.campaign.clickAdMonitorReportUrl,
        campaignInfo: {
          campaignName: creationInfo.configData.campaign.campaignInfo.campaignName,
          buyMode: creationInfo.configData.campaign.campaignInfo.buyMode,
          marketingGoal: creationInfo.configData.campaign.campaignInfo.marketingGoal,
          adNetwork: creationInfo.configData.campaign.campaignInfo.adNetwork,
          type: creationInfo.configData.campaign.campaignInfo.type,
          dailyBudget: creationInfo.configData.campaign.campaignInfo.dailyBudget
        },
        adGroupList
      };

      tableData.campaignList.push(campaign);
    }

    adList.push(tableData);
  });

  return adList;
}

/**
 * 获取素材ID列表
 * @param materialList 索材列表
 * @param index 索引
 */
function getMaterialIds(materialList: Array<Material>, index: number): Array<string> {
  if (!materialList || materialList.length === 0) {
    return [];
  }

  const material = materialList[index % materialList.length];
  if (!material) {
    return [];
  }

  return [
    ...(material.image || []),
    ...(material.video || [])
  ].map((item) => item.localMaterialId);
}

/**
 * 获取落地页（华为商店专用）
 * @param method 分配方式
 * @param data 落地页数据
 * @param advertiserId 账户ID
 */
function getPageViewItem(
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
