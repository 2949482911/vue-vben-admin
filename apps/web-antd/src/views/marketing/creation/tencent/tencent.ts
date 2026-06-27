import type {
  Adgroup,
  AudienceConfigData,
  Campaign,
  ConfigurationConfig,
  MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType,
  PlatformCreation,
  TitlePackageConfigData,
  Material
} from "#/views/marketing/creation/creation";
import {DistributionMode} from "#/constants/enums";
import {renderProjectTitle} from "#/utils/customName";
import {
  getRuleInfoCampaignCount,
  getRuleInfoAdCountGroup,
  getAudience,
  getMaterial,
  getTiltePackage
} from "#/views/marketing/creation/creation";
import {Platform} from "#/constants/enums";
import type {TargetedPackageTypeItem, TitlePackageItem} from "#/api/models";


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
  creative_components: Array<TencentCreativeComponent>;
  program_creative_info_switch: boolean;
  program_creative_info: TencentProgramCreativeInfo;
}

// 创意组件
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


export interface TencentComponent {
  component_id: number;
  is_deleted: boolean;
  value: Map<string, string>;
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
  creative_components: Array<TencentCreativeComponent>;
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
  createInfo.accountInfo.forEach((account) => {
    const advertiserId = account.localAdvertiserId;

    // 当前账户的表格数据
    const tableData: TencentCreationData = {
      advertiserId: advertiserId,
      campaignList: [],
      getCampaignCount: function(): number {
        return this.campaignList.length;
      },
      getAdGroupCount: function(): number {
        let count: number = 0;
        this.campaignList.forEach((campaign) => {
          count += campaign.adGroupList.length;
        });
        return count;
      }
    };

    // 获取计划数量（根据规则配置）
    const campaignCount: number = getRuleInfoCampaignCount(
      Platform.TENCENT,
      createInfo,
      [advertiserId]
    );

    // 获取广告组数量（根据规则配置）
    const adGroupCount: number = getRuleInfoAdCountGroup(
      Platform.TENCENT,
      createInfo,
      [advertiserId]
    );

    // 遍历生成计划
    for (let campaignIdx = 0; campaignIdx < campaignCount; campaignIdx++) {
      // 获取定向包（用于计划层级）
      const audience: TargetedPackageTypeItem = getAudience(
        createInfo.configData.audience.config.method,
        createInfo.configData.audience.data,
        advertiserId,
        campaignIdx
      );

      // 构建计划对象
      const campaign: TencentCampaign = {
        ...createInfo.configData.campaign,
        getName: function(): string {
          return this.adgroup_name;
        },
        adgroup_id: 0,
        adgroup_name: renderProjectTitle(
          createInfo.configData.campaign.adgroup_name,
          campaignIdx
        ),
        // 从定向包的 config 属性获取 targeting（config 可能是 JSON 字符串，需要解析）
        targeting: audience.config ? audience.config : {},
        adGroupList: []
      };

      // 遍历生成广告组
      for (let adGroupIdx = 0; adGroupIdx < adGroupCount; adGroupIdx++) {
        // 获取素材
        const materialList: Array<Material> = getMaterial(
          createInfo.configData.material.config.method,
          createInfo.configData.material.data,
          advertiserId
        );

        // 获取标题包
        const titlePackage: TitlePackageItem = getTiltePackage(
          createInfo.configData.titlePackage.config.method,
          createInfo.configData.titlePackage.data,
          advertiserId,
          adGroupIdx
        );

        // 获取监测链接
        const monitoringLink: MonitoringLinkType = getMonitoringLink(
          createInfo.configData.monitoringLink.config.method,
          createInfo.configData.monitoringLink.data,
          advertiserId,
          adGroupIdx
        );

        // 构建广告组对象
        const adgroup: TencentAdgroup = {
          ...createInfo.configData.adgroup,
          getName: function(): string {
            return this.dynamic_creative_name;
          },
          adgroup_id: 0,
          dynamic_creative_name: renderProjectTitle(
            createInfo.configData.adgroup.dynamic_creative_name,
            adGroupIdx
          ),
          // 点击监测链接
          click_tracking_url: monitoringLink.clickLink || "",
          // 曝光监测链接
          impression_tracking_url: monitoringLink.exposureLink || "",
          // 处理创意组件
          creative_components: buildCreativeComponents(
            materialList,
            adGroupIdx,
            titlePackage
          )
        };
        campaign.adGroupList.push(adgroup);
      }
      tableData.campaignList.push(campaign);
    }

    adList.push(tableData);
  });

  return adList;
}

/**
 * 构建创意组件
 * @param materialList 素材列表
 * @param index 索引
 * @param titlePackage 标题包
 */
function buildCreativeComponents(
  materialList: Array<Material>,
  index: number,
  titlePackage: TitlePackageItem
): Array<TencentCreativeComponent> {
  if (!materialList || materialList.length === 0) {
    return [];
  }

  const material = materialList[index % materialList.length];
  if (!material) {
    return [];
  }

  // 构建创意组件对象
  const creativeComponent: TencentCreativeComponent = {
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

  // 添加标题组件
  if (titlePackage.title) {
    creativeComponent.title.push({
      component_id: 0,
      is_deleted: false,
      value: new Map([["content", titlePackage.title]]),
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

  return [creativeComponent];
}

/**
 * 获取监测链接
 * @param method 分配方式
 * @param data 监测链接数据
 * @param advertiserId 账户ID
 * @param index 索引
 */
function getMonitoringLink(
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
  return dataList[index % dataList.length] || {
    clickLink: "",
    exposureLink: "",
    monitorLink: "",
    linkModeType: "",
    allocateType: "",
    ocpxTaskId: ""
  };
}
