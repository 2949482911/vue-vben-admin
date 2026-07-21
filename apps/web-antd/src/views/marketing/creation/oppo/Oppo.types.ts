import {
  type Adgroup,
  type AudienceConfigData,
  type Campaign,
  type ConfigurationConfig,
  type MaterialData,
  type MonitoringLinkConfigData,
  type PageViewConfigData,
  type PlatformCreation,
  type Promotion,
  type TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type { Ref } from "vue";

/**
 * vivo 版本常量
 */
export const OPPO_VERSION = "0.1.0";

/**
 * vivo 初始化对象
 */
export interface OppoCreation extends PlatformCreation<OppoConfigData> {
  configurationConfig: ConfigurationConfig;
}

export interface OppoConfigData {
  campaign: OppoCampaignData;
  adgroup: OppoAdgroupData;
  promotion: OppoPromotionData;
  titlePackage: TitlePackageConfigData;
  audience: AudienceConfigData;
  material: MaterialData;
  monitoringLink: MonitoringLinkConfigData;
  landingPage: PageViewConfigData;
  deepLinkList: OppoDeepLinkData;
}

// 广告创意素材组deepLink链接
export interface OppoDeepLinkData {
  deepLinkConfig: OppoDeepLinkDataConfig;
  data: Map<string, Array<string>>;
}

export interface OppoDeepLinkDataConfig {
  method: string;
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
  extJson: string;
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
  adPlanId?: number;
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
  status: number;
  playEndUrl: string;
  playBeginUrl: string;
  exposeEndUrl: string;
  videoBgImgId: string;
  videoMatIds: string;
}



/**
 * 批头列表数据
 */
export interface OppoCreationData {
  advertiserId: string;
  campaignList: Array<OppoCampaign>;
  getCampaignCount: () => number;
  // 获取广组告数
  getAdGroupCount: () => number;
  // 获取广告数
  getAdCount: () => number;
}

/**提交审核批投当前账户扁平数组类型 */
export interface OppoCampaign extends Campaign {
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
  adGroupList: Array<OppoAdgroup>;
}


// 广告组
export interface OppoAdgroup extends Adgroup {
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
  price: number;
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
  extJson: string;
  // 小程序id
  appletId: string;
  // 小程序Path长度
  appletPath: string;
  // 营销目标商品
  marketingObjectiveDTO: MarketingObjectiveDTO;
  // 广告列表
  promotionList: Array<OppoPromotion>;
}


export interface OppoPromotion extends Promotion {
  adPlanId?: number;
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
  // 落地页名称（预览使用）
  pageUrlName?: string;
  // deepLink链接（预览使用）
  deepLink?: string;
  // 素材信息
  materialIdsList: Array<string>;
  status: number;
  playEndUrl: string;
  playBeginUrl: string;
  exposeEndUrl: string;
  videoBgImgId: string;
  videoMatIds: string;
}


/**批量修改操作 */
interface UseOppoTableUpdateOptions {
  tableData: Ref<OppoCreationData[]>;
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
  function handleUpdateOriginalData(callback: (accountData: OppoCreationData) => void) {
    // 1. 找到当前操作的账户原始数据
    const currentAccountData = tableData.value.find(
      (item) => item.advertiserId === activeAccountId.value
    );

    if (!currentAccountData) {
      console.warn("未找到当前账户数据");
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
    handleUpdateOriginalData
  };
}
