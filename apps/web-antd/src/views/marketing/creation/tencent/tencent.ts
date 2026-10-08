import type {TargetedPackageTypeItem} from "#/api/models";
import type {
  Adgroup,
  AudienceConfigData,
  Campaign,
  ConfigurationConfig,
  Material,
  MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType,
  PlatformCreation,
  ProductData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  CreativeComponentState,
  TencentActionButtonValue,
  TencentBrandValue,
  TencentFloatingZoneValue,
  TencentLabelValue
} from "#/views/marketing/creation/tencent/components/creative_components";

import {AdGroupRuleKey, CampaignRuleKey, Platform} from "#/constants/enums";
import {renderProjectTitle} from "#/utils/customName";
import {
  getAudience,
  getFlatTitleList,
  getMaterial,
  getMonitoringLink,
  getProduct,
  getRuleInfoAdCountGroup,
  getRuleInfoCampaignCount,
  getTitleCount
} from "#/views/marketing/creation/creation";
import {RuleMethod} from "#/views/marketing/creation/creation_enums";
import {ALL_ACCOUNT_KEY, DEFAULT_FLOATING_ZONE_INFO_TYPE, DEFAULT_FLOATING_ZONE_TYPE} from "#/views/marketing/creation/tencent/components/creative_components";


export const TENCENT: string = "0.1";

export interface TencentCreation extends PlatformCreation<TencentConfigData> {
  configurationConfig: ConfigurationConfig;
}

/**
 * 腾讯批投配置对象
 */
export interface TencentConfigData {
  campaign: TencentCampaignData,
  adgroup: TencentAdgroupData,
  material: MaterialData;
  audience: AudienceConfigData;
  titlePackage: TitlePackageConfigData;
  monitoringLink: MonitoringLinkConfigData;
  /** 商品（商品库），商品销售场景使用 */
  product: ProductData;
}


// TencentCampaignData 腾讯计划实体类
export interface TencentCampaignData {
  adgroup_id: number;
  adgroup_name: string;  // 名字
  marketing_goal: string; // 目标
  marketing_sub_goal: string; // 二级目标
  marketing_carrier_type: string; // 营销载体类型
  marketing_carrier_detail: TencentMarketingCarrierDetail; // 营销载体详情
  marketing_carrier_detail_switch?: boolean; // 营销载体详情开关
  begin_date: string; // 开始投放日期
  end_date: string; // 结束投放日期
  first_day_begin_time: string; // 首日开始投放时间
  bid_amount: number;
  optimization_goal: string;
  time_series: string;
  automatic_site_enabled: boolean;
  site_set: Array<string>;
  exploration_strategy: string;
  priority_site_set: Array<string>;
  daily_budget: number;
  scene_spec: TencentSceneSpec;
  scene_spec_switch?: boolean; // 场景定向开关
  user_action_sets: Array<TencentUserActionSets>;
  deep_conversion_spec: TencentDeepConversionSpec;
  deep_conversion_spec_switch?: boolean; // oCPA 深度优化配置开关
  conversion_id: string;
  deep_conversion_behavior_bid: number;
  deep_conversion_worth_rate: number;
  deep_conversion_worth_advanced_rate: number;
  deep_conversion_behavior_advanced_bid: number;
  bid_mode: string;
  auto_acquisition_enabled: boolean;
  auto_acquisition_budget: number;
  smart_bid_type: string;
  smart_cost_cap: number;
  auto_derived_creative_enabled: boolean;
  auto_derived_creative_preference: TencentAutoDerivedCreativePreference;
  auto_derived_creative_preference_switch?: boolean; // 创意增强 MAX 偏好设置开关
  search_expand_targeting_switch: string;
  auto_derived_landing_page_switch: boolean;
  bid_scene: string;
  configured_status: string;
  flow_optimization_enabled: boolean;
  material_package_id: number;
  marketing_asset_id: number;
  marketing_asset_outer_spec: TencentMarketingAssetOuterSpec;
  marketing_asset_outer_spec_switch?: boolean; // 营销资产外部配置开关
  poi_list: Array<string>;
  ecom_pkam_switch: string;
  forward_link_assist: string;
  rta_id: number;
  rta_target_id: string;
  mpa_spec: TencentMpaSpec;
  mpa_spec_switch?: boolean; // MPA配置开关
  cost_constraint_scene: string;
  custom_cost_cap: number;
  feedback_id: number;
  short_play_pay_type: string;
  sell_strategy_id: number;
  dynamic_ad_type: string;
  dca_spec: TencentDcaSpec;
  dca_spec_switch?: boolean; // 动态内容营销配置开关
  dsp_id: number;
  aoi_optimization_strategy: TencentAoiOptimizationStrategy;
  aoi_optimization_strategy_switch?: boolean; // AOI优化策略开关
  cloud_union_spec: TencentCloudUnionSpec;
  cloud_union_spec_switch?: boolean; // 云选开关
  additional_product_spec: TencentAdditionalProductSpec;
  additional_product_spec_switch?: boolean; // 附加产品配置开关
  live_recommend_strategy_enabled: boolean;
  custom_cost_roi_cap: number;
  search_expansion_switch: string;
  adx_realtime_type: string;
  enable_steady_exploration: boolean;
  smart_targeting_mode: string;
  smart_coupon_mode: string;

  // 本地定向包ID 在生成腾讯计划时 后端会去查询 并把定向信息放入
  // 不在生成腾讯计划时放入到计划中的原因是这个json会很大 可能会超出字符串限制
  // local_audience_package_id?: string;
  // 定向包
  targeting?: Object
}

export interface TencentMarketingCarrierDetail {
  marketing_carrier_id: string;
  marketing_sub_carrier_id: string;
  marketing_carrier_name: string;
}


/**
 * 场景定向，ADX 程序化投放不可填写提交。
 */
export interface TencentSceneSpec {
  mobile_union: Array<string>;
  exclude_mobile_union: Array<string>;
  union_position_package: Array<number>;
  exclude_union_position_package: Array<number>;
  tencent_news: Array<string>;
  qbsearch_scene: Array<string>;
  display_scene: Array<string>;
  wechat_search_scene: Array<string>;
  pc_scene: Array<string>;
  wechat_position: Array<number>;
  wechat_channels_scene: Array<number>;
  mobile_union_category: Array<number>;
  wechat_scene: TencentWechatScene;
}


export interface TencentWechatScene {
  official_account_media_category: Array<number>;
  mini_program_and_mini_game: Array<number>;
  pay_scene: Array<number>;
}


export interface TencentUserActionSets {
  type: string;
  id: number;
  data_source_id: number;
}


// TencentDeepConversionSpec
export interface TencentDeepConversionSpec {
  deep_conversion_type: string;
  deep_conversion_behavior_spec: TencentDeepConversionBehaviorSpec;
  deep_conversion_worth_spec: TencentDeepConversionWorthSpec;
  deep_conversion_worth_advanced_spec: TencentDeepConversionWorthAdvancedSpec;
  deep_conversion_behavior_advanced_spec: TencentDeepConversionBehaviorAdvancedSpec;
}

export interface TencentDeepConversionBehaviorSpec {
  goal: string;
  bid_amount: number;
}


export interface TencentDeepConversionWorthSpec {
  goal: string;
  expected_roi: number;
}

export interface TencentDeepConversionWorthAdvancedSpec {
  goal: string;
  expected_roi: number;
}


export interface TencentDeepConversionBehaviorAdvancedSpec {
  goal: string;
  bid_amount: number;
}

export interface TencentAutoDerivedCreativePreference {
  auto_derived_creative_method_type_list: Array<string>;
}


export interface TencentMarketingAssetOuterSpec {
  marketing_target_type: string;
  marketing_asset_outer_id: string;
  marketing_asset_outer_sub_id: string;
  marketing_asset_outer_name: string;
}


export interface TencentMpaSpec {
  product_catalog_id: string;
  recommend_method_ids: Array<number>;
  product_series_id: string;
}

export interface TencentDcaSpec {
  set_id: string;
  recommend_method_ids: Array<number>;
}


export interface TencentAoiOptimizationStrategy {
  aoi_optimization_strategy_enabled: boolean;
  aoi_id_list: Array<number>;
}


export interface TencentCloudUnionSpec {
  roi_goal: string;
  expected_roi: number;

}

export interface TencentAdditionalProductSpec {
  product_catalog_id: string;
  product_outer_id: string;
}


// TencentAdgroupData tencent adgroup 实体类
export interface TencentAdgroupData {
  adgroup_id: number;
  dynamic_creative_name: string;
  creative_template_id: string;
  delivery_mode: string;
  dynamic_creative_type: string;
  impression_tracking_url: string;
  click_tracking_url: string;
  page_track_url: string;
  auto_derived_program_creative_switch: boolean;
  configured_status: string;
  site_set_validate_model: string;
  creative_components: TencentCreativeComponent;
  program_creative_info_switch: boolean;
  program_creative_info: TencentProgramCreativeInfo;

  /**
   * 以下为「商品销售 + 商品库 + 页面跳转」场景的创意内联取值。
   * 这些字段不属于 dynamic_creatives/add 的入参，会在生成创意组件时被组装进
   * creative_components 的 description / wechat_channels / main_jump_info，不会直接提交给媒体。
   */
  /** 创意描述文案 */
  description_content?: string;
  /** 视频号名称（投放含视频号版位时使用） */
  wechat_channels_username?: string;
  /** 落地页微信小程序 id，与 mini_program_path 同时填写才生成主跳转组件 */
  mini_program_id?: string;
  /** 落地页微信小程序路径 */
  mini_program_path?: string;

  /**
   * 以下为创意组件的配置（品牌形象 / 行动按钮 / 标签）。
   * 一个字段承载整个组件：开关、分配方式（全部相同 / 分账户匹配）、按账户的配置都在对象里，
   * 提交时由 buildCreativeComponents 按当前账户取出，组装进 creative_components。
   */
  /** 品牌形象组件，对应 creative_components.brand */
  brand_config?: CreativeComponentState<TencentBrandValue>;
  /** 行动按钮组件，对应 creative_components.action_button */
  action_button_config?: CreativeComponentState<TencentActionButtonValue>;
  /** 标签组件，对应 creative_components.label */
  label_config?: CreativeComponentState<TencentLabelValue>;
  /** 浮层卡片组件，对应 creative_components.floating_zone */
  floating_zone_config?: CreativeComponentState<TencentFloatingZoneValue>;
}

/**
 * 微信小程序落地页结构，对应 jump_info 的 page_spec.wechat_mini_program_spec
 */
export interface TencentWechatMiniProgramSpec {
  mini_program_id: string;
  mini_program_path: string;
}

/**
 * 创意组件集合（creative_components）
 * dynamic_creatives/add 里它是 struct（对象）而不是数组：以组件类型为 key，每组的 value 是
 * 「同结构数组」，数组项为 { component_id, value, is_deleted }。
 * 哪些组件可用、value 里要哪些字段，由 creative_template_id 对应的创意形式决定。
 */
export interface TencentCreativeComponent {
  title: Array<TencentComponent>;
  description: Array<TencentComponent>;
  image: Array<TencentComponent>;
  image_list: Array<TencentComponent>;
  video: Array<TencentComponent>;
  brand: Array<TencentComponent>;
  consult: Array<TencentComponent>;
  phone: Array<TencentComponent>;
  form: Array<TencentComponent>;
  action_button: Array<TencentComponent>;
  chosen_button: Array<TencentComponent>;
  label: Array<TencentComponent>;
  show_data: Array<TencentComponent>;
  marketing_pendant: Array<TencentComponent>;
  app_gift_pack_code: Array<TencentComponent>;
  shop_image: Array<TencentComponent>;
  count_down: Array<TencentComponent>;
  barrage: Array<TencentComponent>;
  floating_zone: Array<TencentComponent>;
  text_link: Array<TencentComponent>;
  end_page: Array<TencentComponent>;
  living_desc: Array<TencentComponent>;
  wechat_channels: Array<TencentComponent>;
  short_video: Array<TencentComponent>;
  element_story: Array<TencentComponent>;
  wxgame_playable_page: Array<TencentComponent>;
  main_jump_info: Array<TencentComponent>;
  app_promotion_video: Array<TencentComponent>;
  video_showcase: Array<TencentComponent>;
  image_showcase: Array<TencentComponent>;
  social_skill: Array<TencentComponent>;
  mini_card_link: Array<TencentComponent>;
  floating_zone_list: Array<TencentComponent>;
  video_channels_content: Array<TencentComponent>;
  audio: Array<TencentComponent>;
  wxgame_direct_page: Array<TencentComponent>;
  video_list: Array<TencentComponent>;
  doctor_card: Array<TencentComponent>;
  channels_live_feed: Array<TencentComponent>;
}


/**
 * 空创意组件集合
 * 没有素材/未配置时也要保持对象结构，各组件类型留空数组（媒体侧允许长度 0）
 */
export function createEmptyCreativeComponents(): TencentCreativeComponent {
  return {
    title: [],
    description: [],
    image: [],
    image_list: [],
    video: [],
    brand: [],
    consult: [],
    phone: [],
    form: [],
    action_button: [],
    chosen_button: [],
    label: [],
    show_data: [],
    marketing_pendant: [],
    app_gift_pack_code: [],
    shop_image: [],
    count_down: [],
    barrage: [],
    floating_zone: [],
    text_link: [],
    end_page: [],
    living_desc: [],
    wechat_channels: [],
    short_video: [],
    element_story: [],
    wxgame_playable_page: [],
    main_jump_info: [],
    app_promotion_video: [],
    video_showcase: [],
    image_showcase: [],
    social_skill: [],
    mini_card_link: [],
    floating_zone_list: [],
    video_channels_content: [],
    audio: [],
    wxgame_direct_page: [],
    video_list: [],
    doctor_card: [],
    channels_live_feed: []
  };
}


export interface TencentComponent {
  component_id: number;
  is_deleted: boolean;
  // 内联组件取值：既有扁平结构（{content: "..."}），也有嵌套结构（jump_info.page_spec），所以不能限定为 string
  value: Map<string, any>;
  // 本地素材ids
  materialIdsList: Array<string>;
}


export interface TencentProgramCreativeInfo {
  material_derive_id: number;
  bid_mode: string;
  derive_version: string;
  material_derive_info: TencentMaterialDeriveInfo;
}


export interface TencentMaterialDeriveInfo {
  original_material_id_list: Array<string>;
  original_adcreative_template_id_list: Array<number>;
  original_cover_image_id: string;
  derive_data_list: Array<TencentDeriveData>;
}


export interface TencentDeriveData {
  derive_template_id: number;
  derive_adcreative_template_id_list: Array<number>;
  material_derive_preview_id: number;
  creative_elements_usage: TencentCreativeElementsUsage;
}


export interface TencentCreativeElementsUsage {
  use_description_element: boolean;
}


/**
 * 腾讯批投数据
 */
export interface TencentCreationData {
  advertiserId: string;
  campaignList: Array<TencentCampaign>;

  getCampaignCount: () => number;
  // 获取广组告数
  getAdGroupCount: () => number;
}


// TencentCampaign 腾讯计划
export interface TencentCampaign extends Campaign {
  adgroup_id: number;
  adgroup_name: string;  // 名字
  marketing_goal: string; // 目标
  marketing_sub_goal: string; // 二级目标
  marketing_carrier_type: string; // 营销载体类型
  marketing_carrier_detail: TencentMarketingCarrierDetail; // 营销载体详情
  marketing_carrier_detail_switch?: boolean; // 营销载体详情开关
  begin_date: string; // 开始投放日期
  end_date: string; // 结束投放日期
  first_day_begin_time: string; // 首日开始投放时间
  bid_amount: number;
  optimization_goal: string;
  time_series: string;
  automatic_site_enabled: boolean;
  site_set: Array<string>;
  exploration_strategy: string;
  priority_site_set: Array<string>;
  daily_budget: number;
  scene_spec: TencentSceneSpec;
  scene_spec_switch?: boolean; // 场景定向开关
  user_action_sets: Array<TencentUserActionSets>;
  deep_conversion_spec: TencentDeepConversionSpec;
  deep_conversion_spec_switch?: boolean; // oCPA 深度优化配置开关
  conversion_id: string;
  deep_conversion_behavior_bid: number;
  deep_conversion_worth_rate: number;
  deep_conversion_worth_advanced_rate: number;
  deep_conversion_behavior_advanced_bid: number;
  bid_mode: string;
  auto_acquisition_enabled: boolean;
  auto_acquisition_budget: number;
  smart_bid_type: string;
  smart_cost_cap: number;
  auto_derived_creative_enabled: boolean;
  auto_derived_creative_preference: TencentAutoDerivedCreativePreference;
  auto_derived_creative_preference_switch?: boolean; // 创意增强 MAX 偏好设置开关
  search_expand_targeting_switch: string;
  auto_derived_landing_page_switch: boolean;
  bid_scene: string;
  configured_status: string;
  flow_optimization_enabled: boolean;
  material_package_id: number;
  marketing_asset_id: number;
  marketing_asset_outer_spec: TencentMarketingAssetOuterSpec;
  marketing_asset_outer_spec_switch?: boolean; // 营销资产外部配置开关
  poi_list: Array<string>;
  ecom_pkam_switch: string;
  forward_link_assist: string;
  rta_id: number;
  rta_target_id: string;
  mpa_spec: TencentMpaSpec;
  mpa_spec_switch?: boolean; // MPA配置开关
  cost_constraint_scene: string;
  custom_cost_cap: number;
  feedback_id: number;
  short_play_pay_type: string;
  sell_strategy_id: number;
  dynamic_ad_type: string;
  dca_spec: TencentDcaSpec;
  dca_spec_switch?: boolean; // 动态内容营销配置开关
  dsp_id: number;
  aoi_optimization_strategy: TencentAoiOptimizationStrategy;
  aoi_optimization_strategy_switch?: boolean; // AOI优化策略开关
  cloud_union_spec: TencentCloudUnionSpec;
  cloud_union_spec_switch?: boolean; // 云选开关
  additional_product_spec: TencentAdditionalProductSpec;
  additional_product_spec_switch?: boolean; // 附加产品配置开关
  live_recommend_strategy_enabled: boolean;
  custom_cost_roi_cap: number;
  search_expansion_switch: string;
  adx_realtime_type: string;
  enable_steady_exploration: boolean;
  smart_targeting_mode: string;
  smart_coupon_mode: string;
  // 定向包（从定向中获取）
  targeting?: Object;
  adGroupList: Array<TencentAdgroup>;
}


export interface TencentAdgroup extends Adgroup {
  adgroup_id: number;
  dynamic_creative_name: string;
  creative_template_id: string;
  delivery_mode: string;
  dynamic_creative_type: string;
  impression_tracking_url: string;
  click_tracking_url: string;
  page_track_url: string;
  auto_derived_program_creative_switch: boolean;
  configured_status: string;
  site_set_validate_model: string;
  creative_components: TencentCreativeComponent;
  program_creative_info_switch: boolean;
  program_creative_info: TencentProgramCreativeInfo;
}


/**
 * getPreviewTableData tencent table data
 * 生成腾讯批投预览数据
 * @param createInfo
 * @returns
 */
export function getPreviewTableData(createInfo: TencentCreation): Array<TencentCreationData> {
  const adList: Array<TencentCreationData> = [];

  // 遍历账户
  createInfo.accountInfo.forEach((account, accountIdx) => {
    const advertiserId = account.localAdvertiserId;

    // 当前账户的表格数据
    const tableData: TencentCreationData = {
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
      }
    };

    // 获取各层级数量（按标题生成时，对应层级数量 = 标题总数）
    const titlePackageConfig = createInfo.configData.titlePackage;

    const campaignCount: number =
      createInfo.ruleInfo.projectRuleKey === CampaignRuleKey.title
        ? getTitleCount(
            titlePackageConfig.config.method,
            titlePackageConfig.data,
            [advertiserId]
          )
        : getRuleInfoCampaignCount(Platform.TENCENT, createInfo, [advertiserId]);

    const adGroupCount: number =
      createInfo.ruleInfo.adGroupRuleKey === AdGroupRuleKey.title
        ? getTitleCount(
            titlePackageConfig.config.method,
            titlePackageConfig.data,
            [advertiserId]
          )
        : getRuleInfoAdCountGroup(Platform.TENCENT, createInfo, [advertiserId]);

    // 该账户展开后的全部标题（扁平列表），逐广告组轮询取标题
    const flatTitles = getFlatTitleList(
      titlePackageConfig.config.method,
      titlePackageConfig.data,
      advertiserId
    );

    // 广告组全局下标：跨计划累计，避免每个计划内下标从 0 重置导致名字重复
    let adGroupGlobalIdx = 0;

    // 遍历生成计划
    for (let campaignIdx = 0; campaignIdx < campaignCount; campaignIdx++) {
      // 获取定向包（用于计划层级）
      const audience: TargetedPackageTypeItem = getAudience(
        createInfo.configData.audience.config.method,
        createInfo.configData.audience.data,
        advertiserId,
        campaignIdx
      );

      // 商品（商品库）：按分配方式（全部相同 / 按账户分配）取当前账户、当前下标对应的商品
      const { product, productCatalogId } = getProduct(
        createInfo.configData.product?.config?.method ?? "",
        createInfo.configData.product?.data ?? new Map(),
        advertiserId,
        campaignIdx
      );

      // 构建计划对象
      const campaign: TencentCampaign = {
        ...createInfo.configData.campaign,
        getName(): string {
          return this.adgroup_name;
        },
        adgroup_id: 0,
        adgroup_name: renderProjectTitle(
          createInfo.configData.campaign.adgroup_name,
          campaignIdx,
          createInfo.project.projectName
        ),
        // 从定向包的 config 属性获取 targeting（config 可能是 JSON 字符串，需要解析）
        targeting: audience.config ? audience.config : {},
        // 外投商品：选择器里配了商品就用它覆盖，否则沿用表单里填的
        // marketing_asset_outer_id 是商品库 id（product_catalog_id）
        // marketing_asset_outer_sub_id 才是商品 id（product_outer_id）
        marketing_asset_outer_spec: {
          ...createInfo.configData.campaign.marketing_asset_outer_spec,
          marketing_asset_outer_id:
            productCatalogId
            || createInfo.configData.campaign.marketing_asset_outer_spec.marketing_asset_outer_id,
          marketing_asset_outer_sub_id:
            product?.product_outer_id
            || createInfo.configData.campaign.marketing_asset_outer_spec.marketing_asset_outer_sub_id,
          marketing_asset_outer_name:
            product?.product_name
            || createInfo.configData.campaign.marketing_asset_outer_spec.marketing_asset_outer_name
        },
        adGroupList: []
      };

      // 遍历生成广告组（下标与外层关联：全局序号）
      for (let adGroupIdx = 0; adGroupIdx < adGroupCount; adGroupIdx++) {
        const globalAdGroupIdx = adGroupGlobalIdx + adGroupIdx;

        // 获取素材（平均分配时按 账户 → 计划 → 广告组 逐层均分）
        const materialList: Array<Material> = getMaterial(
          createInfo.configData.material.config.method,
          createInfo.configData.material.data,
          advertiserId,
          [
            { index: accountIdx, count: createInfo.accountInfo.length },
            { index: campaignIdx, count: campaignCount },
            { index: adGroupIdx, count: adGroupCount }
          ]
        );

        // 按全局广告组序号轮询取标题
        const title = flatTitles[globalAdGroupIdx % flatTitles.length] ?? '';

        // 获取监测链接
        const monitoringLink: MonitoringLinkType = getMonitoringLink(
          createInfo.configData.monitoringLink.config.method,
          createInfo.configData.monitoringLink.data,
          advertiserId,
          globalAdGroupIdx
        );

        // 构建广告组对象
        const adgroup: TencentAdgroup = {
          ...createInfo.configData.adgroup,
          getName(): string {
            return this.dynamic_creative_name;
          },
          adgroup_id: 0,
          dynamic_creative_name: renderProjectTitle(
            createInfo.configData.adgroup.dynamic_creative_name,
            globalAdGroupIdx,
            createInfo.project.projectName
          ),
          // 点击监测链接
          click_tracking_url: monitoringLink.clickLink || "",
          // 曝光监测链接
          impression_tracking_url: monitoringLink.exposureLink || "",
          // 处理创意组件
          creative_components: buildCreativeComponents(
            materialList,
            globalAdGroupIdx,
            title,
            createInfo.configData.adgroup,
            advertiserId
          )
        };
        campaign.adGroupList.push(adgroup);
      }
      // 外层累计本计划的广告组数，保证下一个计划的广告组下标连续
      adGroupGlobalIdx += adGroupCount;
      tableData.campaignList.push(campaign);
    }

    adList.push(tableData);
  });

  return adList;
}

/**
 * 取某个创意组件配置在当前账户下的那一份
 * 全部相同取 "0"，分账户匹配取该账户自己的；未开启或没配返回 undefined，不产出该组件
 */
function pickComponentValue<T>(
  config: CreativeComponentState<T> | undefined,
  advertiserId: string
): T | undefined {
  if (!config?.enabled) {
    return undefined;
  }
  const key =
    config.method === RuleMethod.ACCOUNT ? advertiserId : ALL_ACCOUNT_KEY;
  return config.data?.[key];
}

/**
 * 构建创意组件
 * creative_components 是对象（struct），按组件类型分组，不是组件数组
 * @param materialList 素材列表
 * @param index 索引
 * @param title 标题
 * @param config 动态创意配置，用于取场景化的内联组件取值（描述/视频号/小程序落地页）
 * @param advertiserId 当前投放账户 id，用于取分账户匹配的创意组件配置
 */
function buildCreativeComponents(
  materialList: Array<Material>,
  index: number,
  title: string,
  config: TencentAdgroupData,
  advertiserId: string
): TencentCreativeComponent {
  if (!materialList || materialList.length === 0) {
    return createEmptyCreativeComponents();
  }

  const material = materialList[index % materialList.length];
  if (!material) {
    return createEmptyCreativeComponents();
  }

  // 构建创意组件对象：以组件类型为 key，值为同结构数组
  const creativeComponent = createEmptyCreativeComponents();

  // 添加标题组件
  if (title) {
    creativeComponent.title.push({
      component_id: 0,
      is_deleted: false,
      value: new Map([["content", title]]),
      materialIdsList: []
    });
  }

  // 添加图片组件
  const images = material.image || [];
  if (images.length > 0) {
    images.forEach((img) => {
      creativeComponent.image.push({
        component_id: 0,
        is_deleted: false,
        value: new Map(),
        materialIdsList: [img.localMaterialId]
      });
    });
  }

  // 添加视频组件
  const videos = material.video || [];
  if (videos.length > 0) {
    videos.forEach((video) => {
      creativeComponent.video.push({
        component_id: 0,
        is_deleted: false,
        value: new Map(),
        materialIdsList: [video.localMaterialId]
      });
    });
  }

  // 描述文案：内联 value，不引用创意组件库
  if (config.description_content) {
    creativeComponent.description.push({
      component_id: 0,
      is_deleted: false,
      value: new Map([["content", config.description_content]]),
      materialIdsList: []
    });
  }

  // 视频号：投放含视频号版位时，品牌形象需要用视频号，否则创意在视频号版位无法播放
  if (config.wechat_channels_username) {
    creativeComponent.wechat_channels.push({
      component_id: 0,
      is_deleted: false,
      value: new Map<string, any>([
        ["finder_object_visibility", false],
        ["username", config.wechat_channels_username]
      ]),
      materialIdsList: []
    });
  }

  // 主跳转（落地页）：页面跳转载体的落地页由创意侧决定，这里按微信小程序生成
  if (config.mini_program_id && config.mini_program_path) {
    creativeComponent.main_jump_info.push({
      component_id: 0,
      is_deleted: false,
      value: new Map([
        [
          "jump_info",
          {
            page_type: "PAGE_TYPE_WECHAT_MINI_PROGRAM",
            page_spec: {
              wechat_mini_program_spec: {
                mini_program_id: config.mini_program_id,
                mini_program_path: config.mini_program_path
              }
            }
          }
        ]
      ]),
      materialIdsList: []
    });
  }

  // 品牌形象组件：品牌名称走 value，品牌图片走 materialIdsList
  // （后端按 materialIdsList 上传图片，再把返回的 brand_image_id 填进 value）
  const brand = pickComponentValue(config.brand_config, advertiserId);
  const brandMaterialIds = brand?.materialIdsList ?? [];
  if (brand?.brand_name || brandMaterialIds.length > 0) {
    const value = new Map<string, any>();
    if (brand?.brand_name) {
      value.set("brand_name", brand.brand_name);
    }
    creativeComponent.brand.push({
      component_id: 0,
      is_deleted: false,
      value,
      materialIdsList: brandMaterialIds
    });
  }

  // 行动按钮组件：只提交填了的字段，空字符串会让媒体校验失败
  const actionButton = pickComponentValue(
    config.action_button_config,
    advertiserId
  );
  if (actionButton) {
    const value = new Map<string, any>();
    if (actionButton.button_text) {
      value.set("button_text", actionButton.button_text);
    }
    if (actionButton.mini_program_button_text) {
      value.set("mini_program_button_text", actionButton.mini_program_button_text);
    }
    if (actionButton.jump_info) {
      value.set("jump_info", actionButton.jump_info);
    }
    if (value.size > 0) {
      creativeComponent.action_button.push({
        component_id: 0,
        is_deleted: false,
        value,
        materialIdsList: []
      });
    }
  }

  // 标签组件：value 是 { list: [{ content, type, display_content }] }，只提交填了内容的标签
  const label = pickComponentValue(config.label_config, advertiserId);
  const labelList = (label?.list ?? [])
    .filter((item) => item?.content?.trim())
    .map((item) => {
      const detail: Record<string, any> = {
        content: item.content,
        type: item.type
      };
      if (item.display_content) {
        detail.display_content = item.display_content;
      }
      return detail;
    });
  if (labelList.length > 0) {
    creativeComponent.label.push({
      component_id: 0,
      is_deleted: false,
      value: new Map<string, any>([["list", labelList]]),
      materialIdsList: []
    });
  }

  // 浮层卡片组件：面板开关即 floating_zone_switch
  // 图片只提交 materialIdsList，由后端按 floating_zone_type 上传并回填
  // floating_zone_image_id / floating_zone_single_image_id
  const floatingZone = pickComponentValue(
    config.floating_zone_config,
    advertiserId
  );
  if (floatingZone) {
    const value = new Map<string, any>([
      [
        "floating_zone_info_type",
        floatingZone.floating_zone_info_type || DEFAULT_FLOATING_ZONE_INFO_TYPE
      ],
      ["floating_zone_switch", true],
      [
        "floating_zone_type",
        floatingZone.floating_zone_type || DEFAULT_FLOATING_ZONE_TYPE
      ]
    ]);

    if (floatingZone.floating_zone_name) {
      value.set("floating_zone_name", floatingZone.floating_zone_name);
    }
    if (floatingZone.floating_zone_desc) {
      value.set("floating_zone_desc", floatingZone.floating_zone_desc);
    }
    if (floatingZone.floating_zone_button_text) {
      value.set(
        "floating_zone_button_text",
        floatingZone.floating_zone_button_text
      );
    }
    if (floatingZone.button_base_text) {
      value.set("button_base_text", floatingZone.button_base_text);
    }
    if (floatingZone.floating_zone_show_app_property_switch) {
      value.set("floating_zone_show_app_property_switch", true);
    }

    creativeComponent.floating_zone.push({
      component_id: 0,
      is_deleted: false,
      value,
      materialIdsList: floatingZone.materialIdsList ?? []
    });
  }

  return creativeComponent;
}

