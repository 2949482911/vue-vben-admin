import type {
  AudienceConfigData,
  ConfigurationConfig,
  MaterialData,
  MonitoringLinkConfigData,
  PlatformCreation,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";


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
