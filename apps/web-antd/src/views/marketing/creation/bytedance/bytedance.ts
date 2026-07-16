import type {
  AudienceConfigData,
  ConfigurationConfig,
  MaterialData, MonitoringLinkConfigData,
  PlatformCreation, TitlePackageConfigData
} from "#/views/marketing/creation/creation";

export const BYTEDANCE: string = "0.1";


export interface BytedanceCreation extends PlatformCreation<BytedanceConfigData> {
  configurationConfig: ConfigurationConfig;

}


/**
 *  bytedance config data
 */
export interface BytedanceConfigData {
  campaign: BytedanceCampaignData;
  promotion: BytedancePromotionData;
  material: MaterialData;
  audience: AudienceConfigData;
  titlePackage: TitlePackageConfigData;
  monitoringLink: MonitoringLinkConfigData;
}


/**
 * 项目
 *
 * https://open.oceanengine.com/labels/7/docs/1740868093375503?origin=left_nav
 */
export interface BytedanceCampaignData {
  operation: string;
  delivery_mode: string;
  landing_type: string;
  app_promotion_type: string;
  marketing_goal: string;
  ad_type: string;
  delivery_type: string;
  name: string;
  budget_group_id: number;
  aigc_dynamic_creative_switch: boolean;
  star_task_id: number;
  star_auto_material_addition_switch: string;
  star_auto_delivery_switch: string;


  // 搜索类关键词
  keywords: Array<BytedanceCampaignKeyword>;
  auto_extend_traffic: string;
  related_product: BytedanceRelatedProduct;


  // 营销产品与投放载体
  download_url: string;
  app_name: string;
  download_type: string;
  download_mode: string;
  quick_app_id: string;
  launch_type: string;
  promotion_type: string;
  open_url_type: string;
  open_url_params: string;
  open_url_field: string;
  open_url: string;
  ulink_url_type: string;
  ulink_url: string;
  subscribe_url: string;
  asset_type: string;
  multi_asset_type: string;
  micro_promotion_type: string;
  dpa_adtype: string;
  micro_app_instance_id: number;
  native_setting: BytedanceNativeSetting;


  // 优化目标
  optimize_goal: BytedanceOptimizeGoal;
  value_optimized_type: string;
  landing_page_stay_time: number;
  yuntu_5a_brand_id: string;
  yuntu_5a_brand_main_industry_id: string;

  // 投放版位

  delivery_range: BytedanceDeliveryRange;
  // 用户定向
  audience: object;
  // 排期、预算、出价
  delivery_setting: BytedanceDeliverySetting;
  // 监测链接
  track_url_setting: {
    track_url_type: string;
    track_url_group_id: number;
    track_url: Array<string>;
    action_track_url: Array<string>;
    active_track_url: Array<string>;
    video_play_effective_track_url: Array<string>;
    video_play_done_track_url: Array<string>;
    video_play_first_track_url: Array<string>;
    send_type: string;
  };
}


export interface BytedanceCampaignKeyword {
  word: string;
  bid_type: string;
  match_type: string;
  bid: number;
}


// 商品
export interface BytedanceRelatedProduct {
  product_setting: string;
  product_platform_id: string;
  product_id: string;
  unique_product_id: string;
  // todo 商品库
  // products:
}


export interface BytedanceNativeSetting {
  aweme_id: string;
}


// 优化目标
export interface BytedanceOptimizeGoal {
  asset_ids: Array<number>;
  external_action: string;
  game_addiction_id: string;
  paid_switch: number;
  deep_external_action: string;

}


export interface BytedanceDeliveryRange {
  inventory_catalog: string;
  inventory_type: Array<string>;
  union_video_type: string;
}


export interface BytedanceDeliverySetting {
  schedule_type: string;
  start_time: string;
  end_time: string;
  schedule_time: string;
  live_duration: number;
  filter_night_switch: string;
  deep_bid_type: string;
  bid_type: string;
  project_custom: string;
  bid: number;
  budget_mode: string;
  budget: number;
  pricing: string;
  cpa_bid: number;
  deep_cpabid: number;
  roi_goal: number;
  layer_roi_switch: string;
  first_roi_goal: number;
  seven_roi_goal: number;
  budget_optimize_switch: string;
  search_continue_delivery: string;

}


/**
 * 广告
 */
export interface BytedancePromotionData {
  project_id: string;
  name: string;
  operation: string;

  // DPA素材
  promotion_dpa_materials: BytedancePromotionDPAMaterials;


  // 直播素材与营销素材组合
  materials_type: string;
  promotion_related_product: Array<BytedancePromotionPromotion_related_product>;
  promotion_related_product_materials: Array<BytedancePromotionRelated_product_material>;

  // 原生单元设置
  native_setting: BytedancePromotionNativeSetting;

  // 创意设置
  source: string;
  is_comment_disable: string;
  ad_download_status: string;
  brand_info: BytedancePromotionBrand_info;

  // 单元预算与出价
  budget_mode: string;
  budget: number;
  bid: number;
  cpa_bid: number;
  deep_cpabid: number;
  roi_goal: number;
  first_roi_goal: number;
  union_bid_ratio: number;
  shop_multi_roi_goals: Array<BytedancePromotion_shop_multi_roi_goals>;
  // 七日内留存天数，单位：天取值范围[0.01，7.00]，仅支持最多2位小数。仅当满足以下条件时
  // 7d_retention 真实的字段名字
  sevend_retention: number;


  // 搜索流量
  auto_extend_traffic: string;
  keywords: Array<BytedancePromotionKeywords>;
}

export interface BytedancePromotionDPAMaterials {
  video_material_list: Array<BytedancePromotionVideo_material_list>;
  image_material_list: Array<BytedancePromotionImage_material_list>;
  params_type: string;
  external_url_field: string;
  external_url_material_list: Array<string>;
  external_url_params: string;
  web_url_material_list: Array<string>;
  open_url_type: string;
  open_url_field: string;
  open_url_params: string;
  open_url: string;
  product_info: BytedancePromotionProduct_info;
  call_to_action_buttons: Array<string>;
  dynamic_creative_switch: string;
  advanced_dc_settings: Array<string>;
}


export interface BytedancePromotionVideo_material_list {
  video_id: string;
  video_cover_id: string;
  image_mode: string;
  video_template_type: string;
  video_task_ids: Array<string>;
}


// 图片素材
export interface BytedancePromotionImage_material_list {
  image_mode: string;
  images: Array<BytedancePromotionImage>;
}

export interface BytedancePromotionImage {
  image_id: string;
  template_id: number;
  template_data_list: Array<{
    background_image_id: string;
  }>;
}


export interface BytedancePromotionProduct_info {
  product_name_type: string;
  product_image_type: string;
  product_selling_point_type: string;
  product_name_fields: Array<string>;
  product_image_fields: Array<string>;
  product_selling_point_fields: Array<string>;
  titles: Array<string>;
  image_ids: Array<string>;
  selling_points: Array<string>;

}


// 直播素材与营销素材组合
export interface BytedancePromotionPromotion_related_product {
  unique_product_id: string;
  video_material_list: Array<BytedancePromotionRelated_product_video>;
  image_material_list: Array<BytedancePromotionRelated_product_image>;
  title_material_list: Array<BytedancePromotionRelated_product_title>;
  external_url_material_list: Array<string>;
  call_to_action_buttons: Array<string>;
  component_material_list: Array<BytedancePromotionRelated_product_component>;
  anchor_material_list: Array<BytedancePromotionRelated_product_anchor>;

  open_url: string;
  ulink_url: string;
  anchor_related_type: string;
  intelligent_generation: string;
}

export interface BytedancePromotionRelated_product_video {
  image_mode: string;
  video_id: string;
  video_cover_id: string;
  item_id: string;
  video_hp_visibility: string;
}


export interface BytedancePromotionRelated_product_image {
  image_mode: string;
  images: Array<{
    image_id: string;
  }>;
}

export interface BytedancePromotionRelated_product_title {
  title: string;
  word_list: Array<number>;
}


export interface BytedancePromotionRelated_product_component {
  component_id: string;
}


export interface BytedancePromotionRelated_product_anchor {
  anchor_id: string;
  anchor_type: string;
}

// 直播素材与营销素材组合
export interface BytedancePromotionRelated_product_material {
  original_video_title: string;
  video_material_list: Array<BytedancePromotionRelated_product_material_video>;
  image_material_list: Array<BytedancePromotionRelated_product_material_image>;
  text_abstract_list: Array<BytedancePromotionRelated_product_material_text_abstract>;
  title_material_list: Array<BytedancePromotionRelated_product_material_title>;
  playlet_series_url_list: Array<string>;
  product_info: BytedancePromotionRelated_product_materialProduct_info;
  decoration_material: BytetedancePromotionRelated_product_material_decoration;

  anchor_material_list: Array<BytedancePromotionRelated_product_material_product_anchor>;
  component_material_list: Array<BytedancePromotionRelated_product_material_component>;
  external_url_material_list: Array<string>;
  mini_program_info: BytedancePromotionRelated_product_material_mini_program;
  open_url: string;
  open_urls: Array<string>;
  ulink: string;
  ulink_type: string;
  web_url_material_list: Array<string>;
  blue_flow_material_recommend: string;
  carousel_material_list: Array<BytedancePromotionRelated_product_material_carousel>;
  trial_play_material_list: Array<BytedancePromotionRelated_product_material_trial_play>;
  instant_play_material_list: Array<BytedancePromotionRelated_product_material_instant_play>;

  dynamic_creative_switch: string;
  advanced_dc_settings: Array<string>;
  call_to_action_buttons: Array<string>;
  intelligent_generation: string;
  plant_grass_search_word_material: Array<BytedancePromotionRelated_product_material_plant_grass_search_word>;
}


export interface BytedancePromotionRelated_product_material_video {
  image_mode: string;
  video_id: string;
  video_cover_id: string;
  item_id: number;
  video_hp_visibility: string;
  guide_video_id: string;

}


export interface BytedancePromotionRelated_product_material_image {
  image_mode: string;
  images: Array<{
    image_id: string;
  }>;
}


export interface BytedancePromotionRelated_product_material_text_abstract {
  abstract_text: string;
  word_list: Array<number>;
  bidword_list: Array<{
    default_word: string;
  }>;
}


export interface BytedancePromotionRelated_product_material_title {
  title: string;
  bidword_list: Array<{
    default_word: string;

  }>;
  word_list: Array<number>;
}


export interface BytedancePromotionRelated_product_materialProduct_info {
  titles: Array<string>;
  image_ids: Array<string>;
  selling_points: Array<string>;
}


export interface BytetedancePromotionRelated_product_material_decoration {
  image_mode: string;
  activity_id: string;
}


export interface BytedancePromotionRelated_product_material_product_anchor {
  anchor_type: string;
  anchor_id: string;
}


export interface BytedancePromotionRelated_product_material_component {
  component_id: string;
}


export interface BytedancePromotionRelated_product_material_mini_program {
  url: string;
  app_id: string;
  start_path: string;
  params: string;
  urls: Array<string>;
  auto: Array<{
    app_id: string;
    start_path: string;
    params: string;

  }>;
}


export interface BytedancePromotionRelated_product_material_carousel {
  carousel_id: string;
  item_id: number;
  video_hp_visibility: string;

}

export interface BytedancePromotionRelated_product_material_trial_play {
  app_play_uri: string;
  guide_video_id: string;
}


export interface BytedancePromotionRelated_product_material_instant_play {
  app_play_uri: string;
}

export interface BytedancePromotionRelated_product_material_plant_grass_search_word {
  search_word: string;
}

export interface BytedancePromotionNativeSetting {
  aweme_setting_type: string;
  aweme_id: string;
  aweme_ids: Array<string>;
  anchor_related_type: string;
}


export interface BytedancePromotionBrand_info {
  yuntu_category_id: number;
  cdp_brand_id: number;
  ecom_brand_id: number;
  brand_name_id: number;
  cdp_brand_name: string;
  sub_brand_names: Array<string>;
  sub_brand_name_ids: Array<string>;
}


/**
 * 电商平台多ROI系数，指引流电商多平台投放ROI系数及平台信息，可按照电商平台分别确定ROI系数，分平台调控出价，白名单开放。list长度最长为4
 */
export interface BytedancePromotion_shop_multi_roi_goals {
  roi_goal: number;
  shop_platform: string;
}


export interface BytedancePromotionKeywords {
  // 搜索流量
  word: string;
  match_type: string;
  bid: number;
}
