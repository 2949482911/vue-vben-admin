import {
  type Adgroup,
  type Campaign,
  getAudience,
  getDeepLink,
  getMaterial,
  getRuleInfoAdCount,
  getRuleInfoCampaignCount,
  getTiltePackage,
  type LocalMaterialData,
  type Material,
  type MaterialData,
  type PlatformCreation,
  type Promotion,
} from '#/views/marketing/creation/creation';
import type { TargetedPackageTypeItem, TitlePackageItem } from '#/api/models';
import type { BaseItem } from '#/api/models/core';
import { Platform } from '#/constants/enums';
import { renderProjectTitle } from '#/utils/customName';
import type { Ref } from 'vue';

/**
 * vivo 初始化对象
 */
export interface VivoCreation extends PlatformCreation<VivoConfigData> {}

export interface VivoConfigData {
  campaign: VivoCampaignData;
  adgroup: VivoAdgroupData;
  promotion: VivoPromotionData;
  titlePackage: VivoTitlePackageData;
  audience: VivoAudienceData;
  material: MaterialData;
  // 投放资质
  advertiserQualification: Map<string, QualificationValue>;
  deepLinkList: VivoDeepLinkData;
}

// 广告创意素材组deepLink链接
export interface VivoDeepLinkData {
  deepLinkConfig: VivoDeepLinkDataConfig;
  data: Map<string, Array<string>>;
}

export interface VivoDeepLinkDataConfig {
  method: string;
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
  price: number;
  ocpxPrice: number;
  name: string;
  dailyBudget: number;
  spentType: number | null;
  retrieveType: number;
  ruleAudience: string;
  channelId: number;
  apkId: number;
  secondCvType: number | null;
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
  config: VivoPromotionConfig;
}

export interface VivoPromotionConfig {
  videoMaxCount: number;
  imageMaxCount: number;
  materialNormId: number;
  placeType: number;
  strongReminder: number;
  virtualPositionId: string;
}

/**
 * 标题包
 */
export interface VivoTitlePackageData {
  titlePackageConfig: VivoAudienceDataConfig;
  data: Map<string, Array<TitlePackageItem>>;
}

/**
 * 定向包
 */
export interface VivoAudienceData {
  audienceConfig: VivoAudienceDataConfig;
  data: Map<string, Array<TargetedPackageTypeItem>>;
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
  campaignList: Array<VivoCampaign>;
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
  adgroupList: Array<VivoAdgroup>;
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
  price: number;
  ocpxPrice: number;
  name: string;
  dailyBudget: number;
  spentType: number | null;
  retrieveType: number;
  ruleAudience: string;
  channelId: number;
  apkId: number;
  secondCvType: number | null;
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
  materialIds: Array<string>;
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

/**广告资质类型 */
export interface AdvertisingQualificationType {
  advertiseQualificationId: string; // 资质ID: "385831"
  appCnName: string; // 应用名称: "京东-又好又便宜"
  productName: string; // 包名: "com.jingdong.app.mall"
  industry1: number; // 一级行业分类ID
  industry1Name: string; // 一级行业名称: "电商"
  industry2: number; // 二级行业分类ID
  industry2Name: string; // 二级行业名称: "综合电商平台"
  state: number; // 状态: 1
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
  qualificationValidDate: string; // 有效期
  productType: number; // 产品类型
  // ... 其他可选字段
  icpCaseNumber?: string;
  icpDomainName?: string;
  productDescription?: string;
}

/**提交审核批投当前账户扁平数组类型 */
export interface CampaignData {
  exposureLink?: string;
  clickLink?: string;
  deepLink?: string;
  pIdx?: number;
  adGroupIdx: number;
  advertiserId?: string;
  campaignAdType?: number;
  campaignBudget?: number;
  campaignIdx: number;
  campaignMediaType?: number;
  campaignName?: string;
  campaignState?: string;
  creativeCount?: number;
  displayCreativePushTitle?: string;
  displayCreativeSubTitle?: string;
  displayCreativeTitle?: string;
  errorMsg?: string;
  groupDailyBudget?: number;
  groupName?: string;
  groupOcpxPrice?: number | string;
  groupPrice?: number;
  promoName?: string;
  rowCampaignId?: string;
  rowGroupId?: string;
  rowPromoId?: string;
  submitIndex: number;
  _X_ROW_KEY?: string;
}

/**
 * 生成vivo广告table数据
 */
export function getVivoTableData(creationInfo: VivoCreation): Array<VivoTableData> {
  // 先从账户开始
  const vivoTableData: Array<VivoTableData> = [];
  creationInfo.accountInfo.forEach((account) => {
    // 当前用户广告数据
    const tableData: VivoTableData = {
      advertiserId: account.localAdvertiserId,
      campaignList: [],
      getCampaignCount: function (): number {
        return this.campaignList.length;
      },
      getAdCount: function (): number {
        let count: number = 0;
        this.campaignList.forEach((campaign) => {
          campaign.adgroupList.forEach((adgroup) => {
            count += adgroup.promotionList.length;
          });
        });
        return count;
      },
    };
    // 计划对应
    // 获取计划数量
    const campaignCount: number = getRuleInfoCampaignCount(creationInfo.platform, creationInfo, [
      account.localAdvertiserId,
    ]);

    // 遍历生成广告组
    for (let i = 0; i < campaignCount; i++) {
      //  广告组
      const adgroup: VivoAdgroup = {
        getName: function (): string {
          return this.name;
        },
        adgroupId: '',
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
        advertiseQualificationId:
          creationInfo.configData.advertiserQualification.get(account.localAdvertiserId)
            ?.qualificationId || '',
        wechatFollow: creationInfo.configData.adgroup.wechatFollow,
        startDate: creationInfo.configData.adgroup.startDate,
        endDate: creationInfo.configData.adgroup.endDate,
        scheduleTime: creationInfo.configData.adgroup.scheduleTime,
        chargeType: creationInfo.configData.adgroup.chargeType,
        cvType: creationInfo.configData.adgroup.cvType,
        price: creationInfo.configData.adgroup.price * 100000,
        ocpxPrice: creationInfo.configData.adgroup.ocpxPrice * 100000,
        name: renderProjectTitle(creationInfo.configData.adgroup.name, i),
        dailyBudget:
          creationInfo.configData.adgroup.dailyBudget === -1
            ? -1
            : creationInfo.configData.adgroup.dailyBudget * 100000,
        spentType: creationInfo.configData.adgroup.spentType,
        retrieveType: creationInfo.configData.adgroup.retrieveType,
        ruleAudience: creationInfo.configData.adgroup.ruleAudience,
        channelId: creationInfo.configData.adgroup.channelId,
        apkId: creationInfo.configData.adgroup.apkId,
        secondCvType: creationInfo.configData.adgroup.secondCvType,
        secondOcpxPrice: creationInfo.configData.adgroup.secondOcpxPrice * 100000,
        conversionFilterCycle: creationInfo.configData.adgroup.conversionFilterCycle,
        biddingStrategy: creationInfo.configData.adgroup.biddingStrategy,
        subpackageId: creationInfo.configData.adgroup.subpackageId,
        builtInRpkDeepLink: creationInfo.configData.adgroup.builtInRpkDeepLink,
        promotionList: [],
      };

      // 生成广告
      const adCount: number = getRuleInfoAdCount(Platform.VIVO, creationInfo, [
        account.localAdvertiserId,
      ]);
      // 生成广告
      for (let k = 0; k < adCount; k++) {
        const materialList: Array<Material> = getMaterial(
          creationInfo.configData.material.config.method,
          creationInfo.configData.material.data,
          account.localAdvertiserId,
        );
        // 本地素材ID
        const materialIdsList: Array<string> = [];
        const creativeList: Array<VivoCreative> = [];
        // 根据广告个数循环获取创意 超过广告个数的创意则舍弃
        // todo 是否支持1条广告内多创意
        const material: Material = materialList[k % materialList.length] || {
          image: [],
          video: [],
          isExpanded: false,
          active: '',
        };

        const title: TitlePackageItem = getTiltePackage(
          creationInfo.configData.titlePackage.titlePackageConfig.method,
          creationInfo.configData.titlePackage.data,
          account.localAdvertiserId,
          k,
        );

        const deepLink: string = getDeepLink(
          creationInfo.configData.deepLinkList.deepLinkConfig.method,
          creationInfo.configData.deepLinkList.data,
          account.localAdvertiserId,
        );

        const newMaterialList: Array<LocalMaterialData> = [...material.video, ...material.image];

        // 图片
        newMaterialList.forEach((material) => {
          materialIdsList.push(material.localMaterialId);
          // 添加创意
          creativeList.push({
            placeType: creationInfo.configData.promotion.config.placeType,
            materialNormId: creationInfo.configData.promotion.config.materialNormId,
            virtualPositionId: creationInfo.configData.promotion.config.virtualPositionId,
            title: title.title,
            subTitle: Array.isArray(title.config?.subTitle) ? title.config.subTitle[0] || '' : '',
            pushSubTitle: Array.isArray(title.config?.pushSubTitle)
              ? title.config.pushSubTitle[0] || ''
              : '',
            imgsCode: '',
            videoCode: '',
            strongReminder: creationInfo.configData.promotion.config.strongReminder,
          });
        });

        // 广告
        adgroup.promotionList.push({
          adgroupId: '',
          name: renderProjectTitle(creationInfo.configData.promotion.name, k),
          deepLink: deepLink,
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
          },
        });
      }

      // 广告组
      const adgroupList: Array<VivoAdgroup> = [adgroup];

      // 广告组加到计划内
      tableData.campaignList.push({
        adType: creationInfo.configData.campaign.adType,
        adgroupList: adgroupList,
        campaignId: '',
        dailyBudget:
          creationInfo.configData.campaign.dailyBudget === -1
            ? -1
            : creationInfo.configData.campaign.dailyBudget * 100000,
        mediaType: creationInfo.configData.campaign.mediaType,
        name: renderProjectTitle(creationInfo.configData.campaign.name, i),
        getName: function () {
          return this.name;
        },
      });
    }

    vivoTableData.push(tableData);
  });

  return vivoTableData;
}

/**批量修改操作 */
interface UseVivoTableUpdateOptions {
  tableData: Ref<VivoTableData[]>;
  activeAccountId: Ref<string>;
  gridApi: any;
  flattenFn: (campaignList: VivoCampaign[], advertiserId: string) => any[];
}

/**批量修改操作 */
export function useVivoTableUpdate(options: UseVivoTableUpdateOptions) {
  const { tableData, activeAccountId, gridApi, flattenFn } = options;

  /**
   * 核心更新方法：修改原始嵌套数据并同步刷新 UI
   * @param callback 具体的业务修改逻辑
   */
  function handleUpdateOriginalData(callback: (accountData: VivoTableData) => void) {
    // 1. 找到当前操作的账户原始数据
    const currentAccountData = tableData.value.find(
      (item) => item.advertiserId === activeAccountId.value,
    );

    if (!currentAccountData) {
      console.warn('未找到当前账户数据');
      return;
    }

    // 2. 执行传入的业务逻辑
    callback(currentAccountData);

    // 3. 刷新 UI
    const $grid = gridApi.grid;
    if ($grid) {
      const flattened = flattenFn(currentAccountData.campaignList, currentAccountData.advertiserId);
      $grid.loadData(flattened);
    }
  }

  return {
    handleUpdateOriginalData,
  };
}
