import {
  type Adgroup,
  type Campaign,
  getAudience, getMaterial,
  getRuleInfoAdCount,
  getRuleInfoCampaignCount, getTiltePackage, type LocalMaterialData, type Material,
  type MaterialData,
  type PlatformCreation, type Promotion
} from "#/views/marketing/creation/creation";
import type {TargetedPackageTypeItem, TitlePackageItem} from "#/api/models";
import type {BaseItem} from "#/api/models/core";
import {Platform} from "#/constants/enums";
import {renderProjectTitle} from "#/utils/customName";


/**
 * vivo 初始化对象
 */
export interface VivoCreation extends PlatformCreation<VivoConfigData> {

}

export interface VivoConfigData {
  campaign: VivoCampaignData;
  adgroup: VivoAdgroupData;
  promotion: VivoPromotionData;
  titlePackage: VivoTitlePackageData;
  audience: VivoAudienceData
  material: MaterialData
  // 投放滋滋
  advertiserQualification: Map<string, QualificationValue>;
}

/**定义存储的资质信息结构 */ 
export interface QualificationValue {
  qualificationId: string;
  qualificationName: string;
}

/**媒体账户信息结构 */
export interface MediaAccount {
  advertiserName: string;
  localAdvertiserId: string;
}

/**
 * 计划对象
 */
export interface VivoCampaignData {
  name: string;
  adType: number;
  mediaType: number;
  dailyBudget: number;
  campaignType: number;
  pushForm: number;
  pushType: number;
  promotionType: number;
  conversionMonitorType: number;
}

/**
 * 广告组数据
 */
export interface VivoAdgroupData {
  campaignId: number;
  appPackageName: string;
  rpkDeepLink: string;
  webSiteUrl: string;
  h5Code: string;
  h5Type: number | null;
  productUrlType: number;
  appletOriginId: string;
  appletPath: string;
  industry1: string;
  industry2: string;
  advertiseQualificationId?: string;
  wechatFollow: number;
  // audienceInfo: {
  //   region: {
  //     regionCodeList: string[];
  //     stayType: number;
  //   },
  //   sexList: string[];
  //   ageList: string[];
  //   customList: string[];
  //   excludeCustomList: string[];
  //   installedApp: number;
  //   network: number;
  //   interestSet: string[];
  //   androidVersionSet: string[];
  //   phonePriceSet: string[];
  //   phoneSeriesSet: string[];
  //   networkOperatorSet: string[];
  //   installBehavior: {
  //     period: number;
  //     behavior: number;
  //     appCategoryCode: string[];
  //     gameCategoryCode: string[];
  //   };
  //   startBehavior: {
  //     period: number;
  //     behavior: number;
  //     appCategoryCode: string[];
  //     gameCategoryCode: string[];
  //   }
  // },
  startDate: string;
  endDate: string;
  scheduleTime: string;
  chargeType: number | null;
  cvType: string;
  price: string;
  ocpxPrice: string;
  name: string;
  dailyBudget: string;
  spentType: number | null;
  retrieveType: number;
  ruleAudience: string;
  channelId: number;
  apkId: number;
  secondCvType: number;
  secondOcpxPrice: number;
  conversionFilterCycle: number;
  biddingStrategy: number;
  subpackageId: number;
  builtInRpkDeepLink: string;
  // dpaGoodsConfig: {
  //   cpId: number;
  //   categories: Array<{
  //     categoryId: string;
  //     categoryLevel: number;
  //   }>
  // },
  // productSDpa: {
  //   productId: string;
  //   productName: string;
  // }
}

/**
 * 创意创建
 */
export interface VivoPromotionData {
  groupId: string;
  name: string;
  deepLink: string;
  videoAttribution: number;
  pageUrl: string;
  h5Code: string;
  h5Type: number;
  generalSwitch: number;
  config: VivoPromotionConfig
}


export interface VivoPromotionConfig {
  videoMaxCount: number,
  imageMaxCount: number,
  materialNormId: number,
  placeType: number,
  strongReminder: number,
  virtualPositionId: string
}


/**
 * 标题包
 */
export interface VivoTitlePackageData {
  titlePackageConfig: VivoAudienceDataConfig,
  data: Map<string, Array<TitlePackageItem>>
}

/**
 * 定向包
 */
export interface VivoAudienceData {
  audienceConfig: VivoAudienceDataConfig,
  data: Map<string, Array<TargetedPackageTypeItem>>
}


export interface VivoAudienceDataConfig {
  method: string;
}

export interface VivoMaterialLibrary extends BaseItem {
  count: number;
  fileUrl: string;
  name: string;
  parentId: string;
  remark: string;
  type: number;
  selected: boolean;
}


/**
 * vivo 表格数据
 */
export interface VivoTableData {
  advertiserId: string;
  // 计划
  campaignList: Array<VivoCampaign>
  // 计划数量
  getCampaignCount: () => number;
  // 获取广告数
  getAdCount: () => number;
}


// 计划
export interface VivoCampaign extends Campaign {
  campaignId: string;
  name: string;
  adType: number;
  mediaType: number;
  dailyBudget: number;
  adgroupList: Array<VivoAdgroup>
}


// 广告组
export interface VivoAdgroup extends Adgroup {
  adgroupId: string;
  audienceInfo: any;
  appPackageName: string;
  rpkDeepLink: string;
  webSiteUrl: string;
  h5Code: string;
  h5Type: number | null;
  productUrlType: number;
  appletOriginId: string;
  appletPath: string;
  industry1: string;
  industry2: string;
  advertiseQualificationId: string;
  wechatFollow: number;
  startDate: string;
  endDate: string;
  scheduleTime: string;
  chargeType: number | null;
  cvType: string;
  price: string;
  ocpxPrice: string;
  name: string;
  dailyBudget: string;
  spentType: number | null;
  retrieveType: number;
  ruleAudience: string;
  channelId: number;
  apkId: number;
  secondCvType: number;
  secondOcpxPrice: number;
  conversionFilterCycle: number;
  biddingStrategy: number;
  subpackageId: number;
  builtInRpkDeepLink: string;

  // 广告
  promotionList: Array<VivoPromotion>;
}


/**
 * 广告
 */
export interface VivoPromotion extends Promotion {
  adgroupId: string;
  name: string;
  deepLink: string;
  videoAttribution: number;
  pageUrl: string;
  h5Code: string;
  h5Type: number;
  generalSwitch: number;
  creativeList: Array<VivoCreative>;
  // 本地素材ID
  materialIds: Array<string>
  viewMonitorUrl: string;
  clickMonitorUrl: string;
  /** 提交状态（本地前端维护） */
  state?: string;
  /** 报错原因（本地前端维护） */
  msg?: string;
}


/**
 * 创意
 */
export interface VivoCreative {
  placeType: number;
  materialNormId: number;
  virtualPositionId: string;
  title: string;
  subTitle: string;
  pushSubTitle: string;
  imgsCode: string;
  videoCode: string;
  strongReminder: number;
}

/**
 * 审核表格返回计划
 */
export interface VivoCampaignResp extends BatchReturnBasics {
  campaignId: string;
}

/**
 * 审核表格返回广告
 */
export interface VivoAdGroupResp extends BatchReturnBasics {
  adgroupId: string;
  campaignId: string;
}

/**
 * 审核表格返回广告创意
 */
export interface VivoPromotionResp extends BatchReturnBasics {
  adgroupId: string;
  campaignId: string;
  promotionId: string;
}

export interface BatchReturnBasics {
  code: number;
  index: number;
  message: string;
  requestId: string;
}

/**
 * 生成vivo广告table数据
 */
export function getVivoTableData(
  creationInfo: VivoCreation
): Array<VivoTableData> {
  // const cloneInfo: VivoCreation = JSON.parse(JSON.stringify(creationInfo));
  // 先从账户开始
  const vivoTableData: Array<VivoTableData> = [];
  creationInfo.accountInfo.forEach(account => {
    // 当前用户广告数据
    const tableData: VivoTableData = {
      advertiserId: account.localAdvertiserId,
      campaignList: [],
      getCampaignCount: function (): number {
        return this.campaignList.length;
      },
      getAdCount: function (): number {
        let count: number = 0;
        this.campaignList.forEach(
          campaign => {
            campaign.adgroupList.forEach(
              adgroup => {
                count += adgroup.promotionList.length;
              }
            )
          }
        )
        return count;
      }
    }
    // 计划对应
    // 获取计划数量
    const campaignCount: number = getRuleInfoCampaignCount(
      creationInfo.platform, creationInfo, [account.localAdvertiserId]
    )

    // 遍历生成广告组
    for (let i = 0; i < campaignCount; i++) {
      //  广告组
      const adgroup: VivoAdgroup = {
        getName: function (): string {
          return this.name;
        },
        adgroupId: "",
        appPackageName: creationInfo.project.packageName,
        audienceInfo: getAudience(
          creationInfo.configData.audience.audienceConfig.method,
          creationInfo.configData.audience.data,
          account.localAdvertiserId,
          i,
        ).config,
        rpkDeepLink: creationInfo.configData.adgroup.rpkDeepLink,
        webSiteUrl: creationInfo.configData.adgroup.webSiteUrl,
        h5Code: creationInfo.configData.adgroup.h5Code,
        h5Type: creationInfo.configData.adgroup.h5Type,
        productUrlType: creationInfo.configData.adgroup.productUrlType,
        appletOriginId: creationInfo.configData.adgroup.appletOriginId,
        appletPath: creationInfo.configData.adgroup.appletPath,
        industry1: creationInfo.configData.adgroup.industry1,
        industry2: creationInfo.configData.adgroup.industry2,
        advertiseQualificationId: creationInfo.configData.advertiserQualification.get(account.localAdvertiserId)?.qualificationId || '',
        // advertiseQualificationId: creationInfo.configData.adgroup.advertiseQualificationId,
        wechatFollow: creationInfo.configData.adgroup.wechatFollow,
        startDate: creationInfo.configData.adgroup.startDate,
        endDate: creationInfo.configData.adgroup.endDate,
        scheduleTime: creationInfo.configData.adgroup.scheduleTime,
        chargeType: creationInfo.configData.adgroup.chargeType,
        cvType: creationInfo.configData.adgroup.cvType,
        price: creationInfo.configData.adgroup.price,
        ocpxPrice: creationInfo.configData.adgroup.ocpxPrice,
        // name: creationInfo.configData.adgroup.name,
        name: renderProjectTitle(creationInfo.configData.adgroup.name, i),
        dailyBudget: creationInfo.configData.adgroup.dailyBudget,
        spentType: creationInfo.configData.adgroup.spentType,
        retrieveType: creationInfo.configData.adgroup.retrieveType,
        ruleAudience: creationInfo.configData.adgroup.ruleAudience,
        channelId: creationInfo.configData.adgroup.channelId,
        apkId: creationInfo.configData.adgroup.apkId,
        secondCvType: creationInfo.configData.adgroup.secondCvType,
        secondOcpxPrice: creationInfo.configData.adgroup.secondOcpxPrice,
        conversionFilterCycle: creationInfo.configData.adgroup.conversionFilterCycle,
        biddingStrategy: creationInfo.configData.adgroup.biddingStrategy,
        subpackageId: creationInfo.configData.adgroup.subpackageId,
        builtInRpkDeepLink: creationInfo.configData.adgroup.builtInRpkDeepLink,
        promotionList: []
      };


      // 生成广告
      const adCount: number = getRuleInfoAdCount(
        Platform.VIVO, creationInfo, [account.localAdvertiserId]
      )
      // 生成广告
      for (let k = 0; k < adCount; k++) {
        const materialList: Array<Material> = getMaterial(
          creationInfo.configData.material.config.method,
          creationInfo.configData.material.data,
          account.localAdvertiserId,
        )
        // 本地素材ID
        const materialIdsList: Array<string> = [];
        const creativeList: Array<VivoCreative> = [];
        // 根据广告个数循环获取创意 超过广告个数的创意则舍弃
        // todo 是否支持1条广告内多创意
        const material: Material = materialList[k % materialList.length] || {
          image: [],
          video: [],
          isExpanded: false,
          active: ""
        }

        const title: TitlePackageItem = getTiltePackage(
          creationInfo.configData.titlePackage.titlePackageConfig.method,
          creationInfo.configData.titlePackage.data,
          account.localAdvertiserId,
          k
        )

        const newMaterialList: Array<LocalMaterialData> = [
          ...material.video, ...material.image
        ]

        // 图片
        newMaterialList.forEach(material => {
          materialIdsList.push(material.localMaterialId);
          // 添加创意
          creativeList.push({
            placeType: creationInfo.configData.promotion.config.placeType,
            materialNormId: creationInfo.configData.promotion.config.materialNormId,
            virtualPositionId: creationInfo.configData.promotion.config.virtualPositionId,
            title: title.title,
            subTitle: Array.isArray(title.config?.subTitle)
              ? title.config.subTitle[0] || ""
              : "",
            pushSubTitle: Array.isArray(title.config?.pushSubTitle)
              ? title.config.pushSubTitle[0] || ""
              : "",
            imgsCode: "",
            videoCode: "",
            strongReminder: creationInfo.configData.promotion.config.strongReminder
          })
        })

        // 广告
        adgroup.promotionList.push({
          adgroupId: "",
          // name: creationInfo.configData.promotion.name,
          name: renderProjectTitle(creationInfo.configData.promotion.name, k),
          deepLink: creationInfo.configData.promotion.deepLink,
          videoAttribution: creationInfo.configData.promotion.videoAttribution,
          pageUrl: creationInfo.configData.promotion.pageUrl,
          h5Code: creationInfo.configData.promotion.h5Code,
          h5Type: creationInfo.configData.promotion.h5Type,
          generalSwitch: creationInfo.configData.promotion.generalSwitch,
          creativeList: creativeList,
          materialIds: materialIdsList,
          viewMonitorUrl: creationInfo.monitoringLink.exposureLink,
          clickMonitorUrl: creationInfo.monitoringLink.clickLink,
          getName: function () {
            return this.name;
          }
        })
      }


      // 广告组
      const adgroupList: Array<VivoAdgroup> = [
        adgroup
      ];

      // 广告组加到计划内
      tableData.campaignList.push(
        {
          adType: creationInfo.configData.campaign.adType,
          adgroupList: adgroupList,
          campaignId: "",
          dailyBudget: creationInfo.configData.campaign.dailyBudget,
          mediaType: creationInfo.configData.campaign.mediaType,
          // name: creationInfo.configData.campaign.name,
          name: renderProjectTitle(creationInfo.configData.campaign.name, i),
          getName: function () {
            return this.name
          }
        }
      )
    }

    vivoTableData.push(tableData);
  })

  return vivoTableData;
}
