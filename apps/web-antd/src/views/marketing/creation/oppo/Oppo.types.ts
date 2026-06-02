import {
  type Adgroup,
  type Campaign,
  getAudience,
  getDeepLink,
  getLandingPage,
  getMaterial,
  getRuleInfoAdCount,
  getRuleInfoAdCountGroup,
  getRuleInfoCampaignCount,
  getTiltePackage,
  // type LocalMaterialData,
  type Material,
  type MaterialData,
  type PlatformCreation,
  type Promotion,
} from '#/views/marketing/creation/creation';
import type { LandingPageData, TargetedPackageTypeItem, TitlePackageItem } from '#/api/models';
import type { BaseItem } from '#/api/models/core';
import { Platform } from '#/constants/enums';
import { renderProjectTitle } from '#/utils/customName';
import type { Ref } from 'vue';

/**
 * vivo 版本常量
 */
export const OPPO_VERSION = '0.1.0';

/**
 * vivo 初始化对象
 */
export interface OppoCreation extends PlatformCreation<OppoConfigData> {}

export interface OppoConfigData {
  campaign: OppoCampaignData;
  adgroup: OppoAdgroupData;
  promotion: OppoPromotionData;
  titlePackage: OppoTitlePackageData;
  audience: OppoAudienceData;
  material: MaterialData; 
  // 投放资质
  advertiserQualification: Map<string, QualificationValue>;
  deepLinkList: OppoDeepLinkData;
  landingPage: OppoLandingPageData;
  // 渠道包
  channelPackage: Map<string, ChannelPackageValue>;
}

/**定义存储的资质信息结构 */
export interface ChannelPackageValue {
  channelPackageId: string;
  channelPackageApkId: string;
  channelPackageName: string;
}

// 广告创意素材组deepLink链接
export interface OppoDeepLinkData {
  deepLinkConfig: OppoDeepLinkDataConfig;
  data: Map<string, Array<string>>;
}

export interface OppoDeepLinkDataConfig {
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
export interface OppoCampaignData {
  // 计划名称
  planName: string;
  // 推广目标
  extensionType: number;
  //是否限制日预算
  dayLimit: number;
  // 日预算（单位：分）
  dayBudget: number;
  //  竞价策略
  deliveryMode: number;
}

/**
 * 广告组数据
 */
export interface OppoAdgroupData {
  // 计划id
  planId: string;
  // 广告组名称
  adGroupName: string;
  // 广告h5落地页链接
  pageUrl: string;
  // 标的物类型
  extensionType: number | null;
  // 推广流量
  extensionFlow: number;
  // 流量场景
  flowScene: number;
  // 推广日限制
  dayLimit: number;
  // 推广开始时间
  beginTime: string;
  // 推广结束时间
  endTime: string;
  // 计费方式
  billingType: number;
  adSearchPremiumKwSaveDTOList: Array<OppoPremium>;
  // 应用id
  appId: string;
  // 下载并打开
  autoOpenFlag: number;
  // 深度ocpc转化出价 竞价策略为最大转化的计划 该参数不需要传
  deepOcpcPrice: string;
  // 深度ocpc转换类型
  deepOcpcType: number;
  // 直达链接
  deepUrl: string;
  // 快应用id
  instantAppId: string;
  // 快应用落地链接
  instantAppUrl: string;
  // 出价类型
  ocpcOptmType: number;
  // 目标转化出价
  ocpcPrice: string;
  // 目标转化类型
  ocpcType: number;
  // 落地页id
  pageId: string;
  // 落地页建站类型
  pageType: number;
  // 基础出价（单位：分）竞价策略为最大转化的计划 该参数不需要传
  price: string;
  // 智能扩量
  smartExpandType: number;
  // 定向id
  targetId: string;
  // 推广时段限制
  timeLimit: number;
  // 推广时段
  timeSet: string;
  // 是否打开快应用并添加到桌面
  linkDeskFlag: number;
  // 小程序类型 
  appletType: number;
  // 广告组 关键词、词包 目标转化出价（单位：分）
  kwOcpcPrice: string;
  // 广告组 关键词、词包 深度转化出价（单位：分）
  kwDeepOcpcPrice: string;
  // 广告组 关键词、词包 目标ROI系数 * 1000000, (0,10]
  kwTargetROI: string;
  // 渠道包
  channelPkgId: string;
  // 是否开启免一阶 1-开启，0-关闭
  defaultSecondStage: number;
  // 广告组目标ROI系数 * 1000000, (0,10] 竞价策略为最大转化的计划 该参数不需要传
  targetROI: string;
  adsDpaProductDTO: OppoProductAdgroupData;
  // 广告类型
  advertiseType: number;
  //流量场景为通知栏时，应用内页的类型，默认值为0，表示不传应用内页，1：INTEND_ACTION，4：ACTIVITY，5：SCHEME_URL
  // 备注：应用内页通过deepUrl参数传值
  pushAppPageType: number;
  // OCPX自动优化开关，0表示未开启，1表示开启
  // 备注：需要和深度ocpc转换类型搭配使用
  ocpxOptimizeSwitch: number;
  // OCPX优化类型，默认值为0：表示不使用
  // 可选项 1：七日留存，2：次留率（优选），3：14日LTV
  // 备注：需要和ocpxOptimizeSwitch搭配使用，仅ocpxOptimizeSwitch=1时可以设置
  ocpxOptimizeType: number;
  // 广告组拓展信息
  extJson:string;
  // 小程序id
  appletId: string;
  // 小程序Path长度
  appletPath: string;
  // 营销目标商品
  marketingObjectiveDTO: MarketingObjectiveDTO;
}
export interface OppoPremium {
  // 行业类目ID(当在添加出价类目词包时必传)
  categoryId: string;
  // 关键词 or 行业类目名称，网页推广-搜索，关键词或词包信息必填
  keyword: string;
  // 匹配类型 1:精准匹配 2:词组匹配 3:模糊匹配
  matchType: number;
  // 出价，必须大于0（单位：分）
  price: string;
  // 来源 2:出价类目词包 5:广告主手动上传(出价词包)
  source: number;
  // 添加自定义词包或禁推词包的词包Id
  kwPackageId: string;
  // 词包类型，1：自定义词包，2：禁推词包
  kwPackageType: number;

  // 
}
// 商品广告
export interface OppoProductAdgroupData {
  // 商品广告类型
  dpaProductType: number;
  // 商品广告-商品库id
  dpaProductLibraryId: number;
  // 商品id列表
  dpaProductIdList: Array<string>;
}
// 营销目标商品
export interface MarketingObjectiveDTO {
  // 营销目标商品库类型，固定为3
  dpaProductType: number;
  // 	营销目标商品库id
  dpaProductLibraryId: string;
  // 	营销目标商品id
  dpaProductIdList: Array<number>;
}
/**
 * 创意创建
 */
export interface OppoPromotionData {
  // 广告组id
  adGroupId: string;
  // 广告组名称
  adName: string;
  // 统一规格id 
  globalSpecId: number;
  // 广告来源
  adSource: number;
  // 品牌背景logo
  brandLogoImgId: string;
  // 品牌名称
  brandName: string;
  // 按钮文案
  buttonTxt: string;
  // 广告文案
  copywriter: string;
  // 文案id
  copywriterId: string;
  // 下载监测链接
  downloadUrl: string;
  // 是否开启了衍生 0否 1是
  dynamicCr: number;
  // 曝光监测链接
  exposeUrl: string;
  // 视频封面图
  videoImgId: string;
  // 图片素材id
  imgMatIds: number[];
  // 点击链接
  clickUrl: string;
  config: OPPOPromotionConfig;
}
export interface OPPOPromotionConfig {
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
export interface OppoTitlePackageData {
  titlePackageConfig: OppoAudienceDataConfig;
  data: Map<string, Array<TitlePackageItem>>;
}

/**
 * 定向包
 */
export interface OppoAudienceData {
  audienceConfig: OppoAudienceDataConfig;
  data: Map<string, Array<TargetedPackageTypeItem>>;
}

/**
 * 落地页
 */
export interface OppoLandingPageData {
  landingPageConfig: OppoAudienceDataConfig;
  data: Map<string, Array<LandingPageData>>;
}

export interface OppoAudienceDataConfig {
  method: string;
}

export interface OppoMaterialLibrary extends BaseItem {
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
export interface OppoTableData {
  advertiserId: string;
  // 计划
  campaignList: Array<OppoCampaign>;
  // 计划数量
  getCampaignCount: () => number;
  // 获取广组告数
  getAdGroupCount: () => number;
  // 获取广告数
  getAdCount: () => number;
}

// 计划
export interface OppoCampaign extends Campaign {
  campaignId: string;
  name: string;
  adType: number;
  mediaType: number;
  dailyBudget: number;
  adgroupList: Array<OppoAdgroup>;
}

// 广告组
export interface OppoAdgroup extends Adgroup {
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
  channelId: string;
  apkId: string;
  secondCvType: number | null;
  secondOcpxPrice: number;
  conversionFilterCycle: number;
  biddingStrategy: number;
  subpackageId: number;
  builtInRpkDeepLink: string;

  // 广告
  promotionList: Array<OppoPromotion>;
}

/**
 * 广告
 */
export interface OppoPromotion extends Promotion {
  adgroupId: string;
  name: string;
  deepLink: string;
  videoAttribution: number;
  pageUrl: string;
  pageUrlName?: string;
  h5Code: string;
  h5Type: number;
  generalSwitch: number;
  creativeList: Array<OppoCreative>;
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
export interface OppoCreative {
  placeType: number;
  materialNormId: number;
  virtualPositionId: string;
  title: string;
  subTitle: string;
  pushSubTitle: string;
  imgsCode: string;
  videoCode: string;
  appName: string;
  strongReminder: number;
  materialIdsList: Array<string>;
}

/**
 * 审核表格返回计划
 */
export interface OppoCampaignResp extends BatchReturnBasics {
  campaignId: string;
}

/**
 * 审核表格返回广告
 */
export interface OppoAdGroupResp extends BatchReturnBasics {
  adgroupId: string;
  campaignId: string;
}

/**
 * 审核表格返回广告创意
 */
export interface OppoPromotionResp extends BatchReturnBasics {
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

/**渠道包类型 */
export interface channelPackageInfo {
  id: string;
  apkId: string;
  appId: string;
  appName: string;
  appPackage: string;
  name: string;
  version: string;
  versionCode: string;
  showState: number;
  deleted: number;
  createTime: string;
  modifyTime: string;
}

/**提交审核批投当前账户扁平数组类型 */
export interface CampaignData {
  exposureLink?: string;
  pageUrlName?: string;
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
export function getOppoTableData(creationInfo: OppoCreation): Array<OppoTableData> {
  const creativeLength: number = creationInfo.configData.material.data.get('0')?.length || 0;
  const ruleType: string = creationInfo.ruleInfo.adRuleKey;
  // 先从账户开始
  const vivoTableData: Array<OppoTableData> = [];
  creationInfo.accountInfo.forEach((account) => {
    // 当前用户广告数据
    const tableData: OppoTableData = {
      advertiserId: account.localAdvertiserId,
      campaignList: [],
      getCampaignCount: function (): number {
        return this.campaignList.length;
      },
      getAdGroupCount: function (): number {
        let count: number = 0;
        this.campaignList.forEach((campaign) => {
          count += campaign.adgroupList.length;
        });
        return count;
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

    // 生成广告组
    const adGroupCount: number = getRuleInfoAdCountGroup(Platform.OPPO, creationInfo, [
      account.localAdvertiserId,
    ]);

    // 遍历生成广告组
    for (let i = 0; i < campaignCount; i++) {
      const adgroupList: Array<OppoAdgroup> = [];
      // 生成广告组
      for (let f = 0; f < adGroupCount; f++) {
        const adgroup: OppoAdgroup = {
          getName: function (): string {
            return this.name;
          },
          adgroupId: '',
          appPackageName: creationInfo.project.packageName,
          audienceInfo: getAudience(
            creationInfo.configData.audience.audienceConfig.method,
            creationInfo.configData.audience.data,
            account.localAdvertiserId,
            f,
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
          name: renderProjectTitle(creationInfo.configData.adgroup.name, f),
          dailyBudget:
            creationInfo.configData.adgroup.dailyBudget === -1
              ? -1
              : creationInfo.configData.adgroup.dailyBudget * 100000,
          spentType: creationInfo.configData.adgroup.spentType,
          retrieveType: creationInfo.configData.adgroup.retrieveType,
          ruleAudience: creationInfo.configData.adgroup.ruleAudience,
          channelId:
            creationInfo.configData.channelPackage.get(account.localAdvertiserId)
              ?.channelPackageId || '',
          apkId:
            creationInfo.configData.channelPackage.get(account.localAdvertiserId)
              ?.channelPackageApkId || '',
          secondCvType: creationInfo.configData.adgroup.secondCvType,
          secondOcpxPrice: creationInfo.configData.adgroup.secondOcpxPrice * 100000,
          conversionFilterCycle: creationInfo.configData.adgroup.conversionFilterCycle,
          biddingStrategy: creationInfo.configData.adgroup.biddingStrategy,
          subpackageId: creationInfo.configData.adgroup.subpackageId,
          builtInRpkDeepLink: creationInfo.configData.adgroup.builtInRpkDeepLink,
          promotionList: [],
        };
        // 生成广告
        const adCount: number = getRuleInfoAdCount(Platform.OPPO, creationInfo, [
          account.localAdvertiserId,
        ]);

        for (let k = 0; k < adCount; k++) {
          const materialList: Array<Material> = getMaterial(
            creationInfo.configData.material.config.method,
            creationInfo.configData.material.data,
            account.localAdvertiserId,
          );
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

          const landingPage: LandingPageData | undefined = getLandingPage(
            creationInfo.configData.landingPage.landingPageConfig.method,
            creationInfo.configData.landingPage.data,
            account.localAdvertiserId,
          );
          // 本地素材ID
          const creativeList: Array<OppoCreative> = [];
          if (ruleType !== 'creative') {
            for (let j = 0; j < creativeLength; j++) {
              // 添加创意
              creativeList.push({
                appName: creationInfo.project.projectName,
                placeType: creationInfo.configData.promotion.config.placeType,
                materialNormId: creationInfo.configData.promotion.config.materialNormId,
                virtualPositionId: creationInfo.configData.promotion.config.virtualPositionId,
                title: title.title,
                subTitle: creationInfo.configData.campaign.mediaType === 2 ? title.title : '', //当媒体类型是广告联盟需要subTitle
                pushSubTitle: Array.isArray(title.config?.pushSubTitle)
                  ? title.config.pushSubTitle[0] || ''
                  : '',
                imgsCode: '',
                videoCode: '',
                strongReminder: creationInfo.configData.promotion.config.strongReminder,
                materialIdsList: [
                  ...(materialList[j]?.image ?? []),
                  ...(materialList[j]?.video ?? []),
                ].map((item) => item.localMaterialId),
              });
            }
          } else {
            creativeList.push({
              appName: creationInfo.project.projectName,
              placeType: creationInfo.configData.promotion.config.placeType,
              materialNormId: creationInfo.configData.promotion.config.materialNormId,
              virtualPositionId: creationInfo.configData.promotion.config.virtualPositionId,
              title: title.title,
              subTitle: creationInfo.configData.campaign.mediaType === 2 ? title.title : '', //当媒体类型是广告联盟需要subTitle
              pushSubTitle: Array.isArray(title.config?.pushSubTitle)
                ? title.config.pushSubTitle[0] || ''
                : '',
              imgsCode: '',
              videoCode: '',
              strongReminder: creationInfo.configData.promotion.config.strongReminder,
              materialIdsList: [
                ...(materialList[k]?.image ?? []),
                ...(materialList[k]?.video ?? []),
              ].map((item) => item.localMaterialId),
            });
          }

          // 广告
          adgroup.promotionList.push({
            adgroupId: '',
            name: renderProjectTitle(creationInfo.configData.promotion.name, k),
            deepLink: deepLink,
            videoAttribution: creationInfo.configData.promotion.videoAttribution,
            pageUrl: landingPage?.config.pageUrl || '',
            pageUrlName: landingPage?.name || '',
            h5Code: creationInfo.configData.promotion.h5Code,
            h5Type: creationInfo.configData.promotion.h5Type,
            generalSwitch: creationInfo.configData.promotion.generalSwitch,
            creativeList: creativeList,
            viewMonitorUrl: creationInfo.monitoringLink.exposureLink,
            clickMonitorUrl: creationInfo.monitoringLink.clickLink,
            getName: function () {
              return this.name;
            },
          });
        }
        // 必须在生成完该组下的所有广告后，再把 adgroup 推入 adgroupList
        adgroupList.push(adgroup);
      }
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
interface UseOppoTableUpdateOptions {
  tableData: Ref<OppoTableData[]>;
  activeAccountId: Ref<string>;
  gridApi: any;
  flattenFn: (campaignList: OppoCampaign[], advertiserId: string) => any[];
}

/**批量修改操作 */
export function useOppoTableUpdate(options: UseOppoTableUpdateOptions) {
  const { tableData, activeAccountId, gridApi, flattenFn } = options;

  /**
   * 核心更新方法：修改原始嵌套数据并同步刷新 UI
   * @param callback 具体的业务修改逻辑
   */
  function handleUpdateOriginalData(callback: (accountData: OppoTableData) => void) {
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
