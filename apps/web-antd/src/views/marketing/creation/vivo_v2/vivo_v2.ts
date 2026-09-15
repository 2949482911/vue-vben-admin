import type {
  AudienceConfigData,
  Campaign,
  ConfigurationConfig,
  Material,
  MaterialData,
  MonitoringLinkConfigData,
  PageViewConfigData,
  PlatformCreation,
  Promotion,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";

import { Platform } from "#/constants/enums";
import { renderProjectTitle } from "#/utils/customName";
import {
  getAudience,
  getLandingPage,
  getMaterial,
  getRuleInfoAdCount,
  getRuleInfoCampaignCount,
  getTiltePackage
} from "#/views/marketing/creation/creation";

/**
 * vivo 2.0 版本常量
 */
export const VIVO_V2_VERSION = "0.1.0";

/**
 * 金额换算：vivo2.0 接口金额单位为毫分（1 元 = 100000 毫分），表单以「元」填写
 */
export const VIVO_V2_MONEY_RATE = 100_000;

// ==================== 计划对象（openapi/v1/ad/plan/addPlan） ====================

/** 流量选择（mediaDisplayOption） */
export interface VivoV2MediaFormat {
  /** 媒体类型：0-应用商店；1-非应用商店；2-广告联盟 */
  mediaType: number;
  /** 展现形式，详见枚举「新版广告展现形式」 */
  placeType: number[];
}

export interface VivoV2MediaDisplayOption {
  /** 自动选择：0-关闭；1-开启。开启时 mediaFormat 无需传值 */
  autoSelect: number;
  /** 选择流量 */
  mediaFormat: VivoV2MediaFormat[];
}

/** 推广链接（promotionLink），推广目标为普通网址时必填 */
export interface VivoV2PromotionLink {
  /** 普通网址 */
  webSiteUrl: string;
  /** h5详情页来源：2-第三方落地页；3-悟空建站；4-自定义H5；6-金桔猫；7-一叶智能；12-商品URL */
  h5Type: null | number;
  /** h5详情页ID或编码 */
  h5Code: string;
}

/** 投放场景（deliveryScene） */
export interface VivoV2DeliveryScene {
  /** 投放场景：0-常规投放；1-最大转化投放 */
  type: number;
  /** 出价策略：1-尽量花完预算；2-控制成本上限（最大转化投放场景使用） */
  nobidBiddingStrategy: null | number;
  /** 目标成本上限（元） */
  costCeiling: number;
}

/** 地域定向 */
export interface VivoV2Region {
  /** 行政区划代码列表（数据来源：待接入查询接口，先手工填写） */
  regionCodeList: Array<number | string>;
  /** 停留类型：1-常驻；2-当前 */
  stayType: null | number;
}

/** 安装行为 / 启动行为 */
export interface VivoV2Behavior {
  /** 时间范围：安装行为 30/180/365；启动行为 -1/7/30/365 */
  period: null | number;
  /** 行为：安装行为 3-安装；启动行为 1-启动；2-未启动 */
  behavior: null | number;
  /** 应用分类id（与游戏分类合计最多 200 个，数据来源：待接入查询接口） */
  appCategoryCode: Array<number | string>;
  /** 游戏分类id（数据来源：待接入查询接口） */
  gameCategoryCode: Array<number | string>;
}

/** 定向信息（audienceInfo） */
export interface VivoV2AudienceInfo {
  region: VivoV2Region;
  /** 用户性别（数据来源：基础人群定向标签接口，先手工填写） */
  sexList: Array<number | string>;
  /** 用户年龄（数据来源：基础人群定向标签接口，先手工填写） */
  ageList: Array<number | string>;
  /** 安装定向：1-不限；2-未安装；3-已安装 */
  installedApp: null | number;
  /** 定向人群（人群包id，数据来源：人群包列表接口） */
  customList: Array<number | string>;
  /** 排除人群（人群包id，数据来源：人群包列表接口） */
  excludeCustomList: Array<number | string>;
  installBehavior: VivoV2Behavior;
  startBehavior: VivoV2Behavior;
  /** 兴趣行为：系统优选只传 -1 */
  interestSet: Array<number | string>;
  /** 网络环境：1-不限；2-WIFI；3-移动网络 */
  network: null | number;
  androidVersionSet: Array<number | string>;
  phonePriceSet: Array<number | string>;
  phoneSeriesSet: Array<number | string>;
  networkOperatorSet: Array<number | string>;
}

/** 搜索提词 */
export interface VivoV2SearchWord {
  /** 关键词 */
  word: string;
  /** 关键词出价（元） */
  price: number;
  /** 匹配方式：1-智能匹配；2-精准匹配；3-短语匹配；4-宽泛匹配 */
  matchType: null | number;
  /** 词来源：1-用户添加；2-优质词；3-热门词；4-竞品词 */
  source: null | number;
}

/**
 * 计划对象（ad/plan/addPlan）
 *
 * 说明：金额字段表单以「元」填写，生成预览/提交时乘以 {@link VIVO_V2_MONEY_RATE} 转毫分
 */
export interface VivoV2PlanData {
  /** 计划名称，长度不得超过 200，不可重复 */
  name: string;
  /** 推广目标：1-普通网址；2-应用推广；3-动态商品；8-快应用/快游戏；9-游戏预约；11-小程序 */
  adType: number;
  mediaDisplayOption: VivoV2MediaDisplayOption;
  /** 通投智选：0-关闭；1-广告主开启 */
  generalSwitch: number;
  /** 应用智投：0-普通投放；1-应用智投 */
  intelAdType: number;
  /** 商品ID（数据来源：商品查询接口） */
  productId: string;
  /** 广告投放资质ID（数据来源：可投放app查询/资质列表接口） */
  advertiseQualificationId: string;
  /** 渠道包ID（数据来源：渠道包列表接口） */
  channelId: string;
  /** 渠道包可用APKID */
  apkId: string;
  promotionLink: VivoV2PromotionLink;
  /** 快应用deepLink地址 */
  rpkDeepLink: string;
  /** 小程序id（数据来源：白名单接口） */
  appletOriginId: string;
  /** 小程序页面路径 */
  appletPath: string;
  /** 智能分包ID（数据来源：智能分包列表接口） */
  subpackageId: string;
  /** 微信一键关注：0-未开启；1-开启 */
  wechatFollow: number;
  /** 出价方式：1-CPM；2-CPC；4-CPD；6-按万次唤醒出价；99-按转化目标出价 */
  chargeType: null | number;
  /** 出价（元），按转化目标出价时代表优化目标出价 */
  price: number;
  /** 优化目标（数据来源：新版可用优化目标查询接口） */
  cvType: null | number;
  /** 深度优化目标出价（元） */
  secondOcpxPrice: number;
  /** 深度优化目标（数据来源：新版可用优化目标查询接口） */
  secondCvType: null | number;
  /** 内置快应用deepLink */
  builtInRpkDeepLink: string;
  /** 出价策略：0-稳定拿量；1-优先拿量 */
  biddingStrategy: number;
  /** 投放类型：1-快速投放；2-匀速投放 */
  spentType: null | number;
  deliveryScene: VivoV2DeliveryScene;
  audienceInfo: VivoV2AudienceInfo;
  /** 投放开始日期 yyyy-MM-dd */
  startDate: string;
  /** 投放结束日期 yyyy-MM-dd */
  endDate: string;
  /** 投放时段（168 位 0/1 字符串） */
  scheduleTime: string;
  /** 计划预算（元），-1 代表不限 */
  dailyBudget: number;
  /** 选词模式：1-搜索提词；2-优选词包 */
  wordChoiceModel: null | number;
  /** 自动拓词：0-关闭；1-开启 */
  autoExtension: number;
  /** 搜索提词列表 */
  searchWordList: VivoV2SearchWord[];
  /** 关键词包ID（星词管家词包） */
  wordPackageId: string;
  /** 通知形式：0-通知栏；2-情景唤醒 */
  pushForm: number;
  /** 广告计划类型：0-展示广告；2-通知广告 */
  appearType: number;
}

// ==================== 广告对象（openapi/v1/ad/ad/add） ====================

/** 定制应用详情页/落地页 */
export interface VivoV2AdLandingPage {
  /** URL地址 */
  pageUrl: string;
  /** h5详情页ID或编码 */
  h5Code: string;
  /** h5详情页来源：2-自定义URL/定制URL；3-悟空建站；4-自定义H5；12-商品URL */
  h5Type: null | number;
}

/** 标题 */
export interface VivoV2AdTitle {
  title: string;
  /** 标题是否商店优先：0-否；1-是 */
  isStoreFirst: number;
}

/** 视频素材 */
export interface VivoV2AdVideo {
  videoCode: string;
  previewImgCode: string;
}

/**
 * 广告对象（ad/ad/add）
 *
 * 说明：接口另需 planId（计划ID，必填），由计划创建接口返回结果回填，不属于批创表单配置项
 */
export interface VivoV2AdData {
  /** 广告名称，同一计划下不可重复 */
  name: string;
  /** 推广名称，2-10 个字符，不能是纯数字、纯符号 */
  promotionContent: string;
  /** 头像素材code（256*256，jpg/jpeg/png，≤50KB） */
  avatarCode: string;
  landingPage: VivoV2AdLandingPage;
  /** DeepLink */
  deepLink: string;
  /** 曝光监测地址 */
  viewMonitorUrl: string;
  /** 点击监测地址 */
  clickMonitorUrl: string;
  /** 情景唤醒监测地址 */
  wakeupMonitorUrl: string;
  /** 创建方式：0-普通创建；2-模板推送 */
  creativeSupplyType: number;
  /** 标题列表 */
  titleList: VivoV2AdTitle[];
  /** 图片素材 */
  imgsCodeList: string[];
  /** 视频素材 */
  videoList: VivoV2AdVideo[];
}

// ==================== 批创配置数据 ====================

/** 投放资质（数据来源：待接入查询接口） */
export interface VivoV2QualificationValue {
  qualificationId: string;
  qualificationName: string;
}

/** 渠道包（数据来源：待接入查询接口） */
export interface VivoV2ChannelPackageValue {
  channelPackageId: string;
  channelPackageApkId: string;
  channelPackageName: string;
}

export interface VivoV2ConfigData {
  /** 计划 */
  campaign: VivoV2PlanData;
  /** 广告 */
  ad: VivoV2AdData;
  /** 定向包 */
  audience: AudienceConfigData;
  /** 素材 */
  material: MaterialData;
  /** 标题包 */
  titlePackage: TitlePackageConfigData;
  /** 落地页 */
  landingPage: PageViewConfigData;
  /** 监测链接 */
  monitoringLink: MonitoringLinkConfigData;
  /** 投放资质（按账户维度） */
  qualification: Map<string, VivoV2QualificationValue>;
  /** 渠道包（按账户维度） */
  channelPackage: Map<string, VivoV2ChannelPackageValue>;
}

/**
 * vivo 2.0 创建信息
 */
export interface VivoV2Creation extends PlatformCreation<VivoV2ConfigData> {
  configurationConfig: ConfigurationConfig;
}

// ==================== 预览数据 ====================

/** 预览-计划 */
export interface VivoV2Plan extends Campaign {
  name: string;
  adType: number;
  chargeType: null | number;
  price: number;
  dailyBudget: number;
  spentType: null | number;
  startDate: string;
  endDate: string;
  scheduleTime: string;
  audienceInfo: any;
  adList: VivoV2Ad[];
}

/** 预览-广告 */
export interface VivoV2Ad extends Promotion {
  name: string;
  promotionContent: string;
  deepLink: string;
  pageUrl: string;
  h5Code: string;
  h5Type: null | number;
  viewMonitorUrl: string;
  clickMonitorUrl: string;
  material: Material | undefined;
  title: string;
  imgsCodeList: string[];
  videoList: VivoV2AdVideo[];
}

/** 预览-账户维度数据 */
export interface VivoV2TableData {
  advertiserId: string;
  campaignList: VivoV2Plan[];
  /** 计划数量 */
  getCampaignCount: () => number;
  /** 广告数量 */
  getAdCount: () => number;
}

/**
 * 生成 vivo2.0 预览数据（账户 -> 计划 -> 广告）
 *
 * 数量由配置区「生成规则」决定，计划/广告的取值为表单配置值，
 * 名称按「前缀 + 序号」规则生成，素材/标题包/落地页按序号循环取值
 */
export function getVivoV2TableData(creationInfo: VivoV2Creation): Array<VivoV2TableData> {
  const tableDataList: Array<VivoV2TableData> = [];
  const { configData } = creationInfo;

  creationInfo.accountInfo.forEach((account, accountIdx) => {
    const advertiserId = account.localAdvertiserId;
    const tableData: VivoV2TableData = {
      advertiserId,
      campaignList: [],
      getCampaignCount(): number {
        return this.campaignList.length;
      },
      getAdCount(): number {
        let count = 0;
        this.campaignList.forEach((plan) => {
          count += plan.adList.length;
        });
        return count;
      }
    };

    const campaignCount: number = getRuleInfoCampaignCount(creationInfo.platform, creationInfo, [
      advertiserId
    ]);
    const adCount: number = getRuleInfoAdCount(creationInfo.platform, creationInfo, [advertiserId]);

    // 广告全局下标：跨计划累计，避免内层下标从 0 重置导致名字重复
    let adGlobalIdx = 0;

    for (let i = 0; i < campaignCount; i++) {
      const plan: VivoV2Plan = {
        ...configData.campaign,
        getName(): string {
          return this.name;
        },
        name: renderProjectTitle(configData.campaign.name, i, creationInfo.project.projectName),
        price: configData.campaign.price * VIVO_V2_MONEY_RATE,
        secondOcpxPrice: configData.campaign.secondOcpxPrice * VIVO_V2_MONEY_RATE,
        dailyBudget:
          configData.campaign.dailyBudget === -1
            ? -1
            : configData.campaign.dailyBudget * VIVO_V2_MONEY_RATE,
        deliveryScene: {
          ...configData.campaign.deliveryScene,
          costCeiling: configData.campaign.deliveryScene.costCeiling * VIVO_V2_MONEY_RATE
        },
        audienceInfo: getAudience(
          configData.audience.config.method,
          configData.audience.data,
          advertiserId,
          i
        ).config,
        adList: []
      } as VivoV2Plan;

      for (let k = 0; k < adCount; k++) {
        const adIdx = adGlobalIdx + k;
        // 素材（平均分配时按 账户 → 计划 → 广告 逐层均分）
        const materialList: Array<Material> = getMaterial(
          configData.material.config.method,
          configData.material.data,
          advertiserId,
          [
            { index: accountIdx, count: creationInfo.accountInfo.length },
            { index: i, count: campaignCount },
            { index: k, count: adCount }
          ]
        );
        const material =
          materialList.length > 0 ? materialList[adIdx % materialList.length] : undefined;
        const titlePackage = getTiltePackage(
          configData.titlePackage.config.method,
          configData.titlePackage.data,
          advertiserId,
          adIdx
        );
        const landingPage = getLandingPage(
          configData.landingPage.config.method,
          configData.landingPage.data,
          advertiserId
        );

        plan.adList.push({
          getName(): string {
            return this.name;
          },
          name: renderProjectTitle(configData.ad.name, adIdx, creationInfo.project.projectName),
          promotionContent: configData.ad.promotionContent,
          deepLink: configData.ad.deepLink,
          pageUrl: landingPage?.config?.pageUrl || configData.ad.landingPage.pageUrl,
          h5Code: landingPage?.config?.h5Code || configData.ad.landingPage.h5Code,
          h5Type: configData.ad.landingPage.h5Type,
          viewMonitorUrl: configData.ad.viewMonitorUrl,
          clickMonitorUrl: configData.ad.clickMonitorUrl,
          material,
          title: titlePackage?.title || "",
          imgsCodeList: configData.ad.imgsCodeList,
          videoList: configData.ad.videoList
        } as VivoV2Ad);
      }

      adGlobalIdx += adCount;
      tableData.campaignList.push(plan);
    }

    tableDataList.push(tableData);
  });

  return tableDataList;
}

/**
 * 生成 vivo2.0 批创空配置（页面初始化 / 切换模板时复用）
 */
export function defaultVivoV2ConfigData(): VivoV2ConfigData {
  return {
    campaign: {
      name: "",
      adType: 2,
      mediaDisplayOption: {
        autoSelect: 1,
        mediaFormat: [{ mediaType: 0, placeType: [] }]
      },
      generalSwitch: 0,
      intelAdType: 0,
      productId: "",
      advertiseQualificationId: "",
      channelId: "",
      apkId: "",
      promotionLink: {
        webSiteUrl: "",
        h5Type: null,
        h5Code: ""
      },
      rpkDeepLink: "",
      appletOriginId: "",
      appletPath: "",
      subpackageId: "",
      wechatFollow: 0,
      chargeType: null,
      price: 0,
      cvType: null,
      secondOcpxPrice: 0,
      secondCvType: null,
      builtInRpkDeepLink: "",
      biddingStrategy: 0,
      spentType: null,
      deliveryScene: {
        type: 0,
        nobidBiddingStrategy: null,
        costCeiling: 0
      },
      audienceInfo: {
        region: { regionCodeList: [], stayType: null },
        sexList: [],
        ageList: [],
        installedApp: null,
        customList: [],
        excludeCustomList: [],
        installBehavior: {
          period: null,
          behavior: null,
          appCategoryCode: [],
          gameCategoryCode: []
        },
        startBehavior: {
          period: null,
          behavior: null,
          appCategoryCode: [],
          gameCategoryCode: []
        },
        interestSet: [],
        network: null,
        androidVersionSet: [],
        phonePriceSet: [],
        phoneSeriesSet: [],
        networkOperatorSet: []
      },
      startDate: "",
      endDate: "",
      scheduleTime: "",
      dailyBudget: -1,
      wordChoiceModel: null,
      autoExtension: 0,
      searchWordList: [],
      wordPackageId: "",
      pushForm: 0,
      appearType: 0
    },
    ad: {
      name: "",
      promotionContent: "",
      avatarCode: "",
      landingPage: { pageUrl: "", h5Code: "", h5Type: null },
      deepLink: "",
      viewMonitorUrl: "",
      clickMonitorUrl: "",
      wakeupMonitorUrl: "",
      creativeSupplyType: 0,
      titleList: [{ title: "", isStoreFirst: 0 }],
      imgsCodeList: [],
      videoList: [{ videoCode: "", previewImgCode: "" }]
    },
    audience: {
      config: { method: "all" },
      data: new Map()
    },
    material: {
      config: { method: "all" },
      data: new Map()
    },
    titlePackage: {
      config: { method: "all" },
      data: new Map()
    },
    landingPage: {
      config: { method: "all" },
      data: new Map()
    },
    monitoringLink: {
      config: { method: "all" },
      linkType: "manual",
      data: new Map()
    },
    qualification: new Map<string, VivoV2QualificationValue>(),
    channelPackage: new Map<string, VivoV2ChannelPackageValue>()
  };
}

/**
 * 生成 vivo2.0 批创初始化对象
 */
export function defaultVivoV2Creation(): VivoV2Creation {
  return {
    platform: Platform.VIVO,
    version: VIVO_V2_VERSION,
    project: {
      projectId: "",
      projectName: "",
      packageName: "",
      icon: "",
      appId: ""
    },
    accountInfo: [],
    configData: defaultVivoV2ConfigData(),
    ruleInfo: {
      projectRuleKey: "targeting",
      projectCount: 1,
      adGroupRuleKey: "targeting",
      adGroupCount: 1,
      adRuleKey: "creative",
      adCount: 1,
      creativeRuleKey: "none",
      creativeCount: 0
    },
    monitoringLink: {
      clickLink: "",
      exposureLink: "",
      monitorLink: "",
      linkModeType: "manual",
      allocateType: "all",
      ocpxTaskId: ""
    },
    configurationConfig: {
      platform: Platform.VIVO,
      template: "base_template"
    }
  };
}
