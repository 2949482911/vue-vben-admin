import type {
  AudienceConfigData,
  AwemeConfigData,
  ConfigurationConfig,
  MaterialData, MonitoringLinkConfigData,
  PageViewConfigData,
  PlatformCreation,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";

export const BYTEDANCE_STD: string = '0.1';

/**
 * 巨量智擎版批投创建数据
 *
 * 智擎版是单层结构，只有项目层级，无广告组/广告/创意层级
 * 所有配置（素材、定向、品牌等）均在项目参数中
 * API: POST /open_api/v3.0/std_project/create/
 */
export interface StdCreation extends PlatformCreation<StdConfigData> {
  configurationConfig: ConfigurationConfig;
}

/**
 * 智擎版配置数据 —— 单层结构
 */
export interface StdConfigData {
  project: StdProjectData;
  material: MaterialData;
  audience: AudienceConfigData;
  titlePackage: TitlePackageConfigData;
  landingPage: PageViewConfigData;
  monitoringLink: MonitoringLinkConfigData;
  // 抖音号配置（仅 App 模板 native_type=AWEME 时启用）
  awemeConfig: AwemeConfigData;
}

/**
 * 智擎版标准项目数据
 *
 * 对应 API std_project/create 参数，整合了原 campaign + promotion 的字段
 */
export interface StdProjectData {
  operation: string;
  name: string;

  // -- 基础参数 --
  ad_type: string;
  landing_type: string;
  marketing_goal: string;
  app_promotion_type: string;
  game_addiction_id: string;
  external_action: string;
  unique_product_id: number;
  delivery_medium: string;
  native_type: string;
  app_name: string;
  product_platform_id: string;
  subscribe_url: string;
  download_url: string;
  deep_external_action: string;
  product_id: string;
  asset_id: string;
  deep_bid_type: string;
  aweme_id: string;
  delivery_mode: string;
  schedule_type: string;
  start_time: string;
  end_time: string;
  schedule_time: string;
  search_continue_delivery: string;
  bid_type: string;
  budget_mode: string;
  budget: number;
  bid: number;
  cpa_bid: number;
  deep_cpabid: number;
  roi_goal: number;
  first_roi_goal: number;
  pricing: string;
  download_type: string;
  launch_type: string;
  download_mode: string;
  audience_type: string;
  blue_flow_keyword_name: Array<string>;
  // -- 监测链接 --
  track_url_setting: StdTrackUrlSetting;
  // -- 关键词/搜索 --
  keywords: StdKeyword[];
  auto_extend_traffic: string;
  quick_app_id: string;
  promotion_type: string;
  star_task_id_list: number[];
  is_comment_disable: string;
  // -- AIGC / 星广联投 --
  aigc_dynamic_creative_switch: string;
  audience: Object;
  project_materials: StdProjectMaterials;
  brand_info: StdBrandInfo;
  delivery_type: string;
  multi_delivery_medium: string;
  shop_platform: string;
  live_duration: number;
  seven_roi_goal: number;
  layer_roi_switch: string;
  landing_page_stay_time: number;
  // -- 其他 --
  micro_promotion_type: string;
  micro_app_instance_id: number;
  dpa_adtype: string;
  multi_asset_type: string;
  asset_type: string;
  instance_id: number;
}


export interface StdKeyword {
  word: string;
  bid_type: string;
  match_type: string;
  bid: number;
}

export interface StdBrandInfo {
  yuntu_category_id: number;
  cdp_brand_id: number;
  ecom_brand_id: number;
  brand_name_id: number;
  cdp_brand_name: string;
  sub_brand_names: string[];
  sub_brand_name_ids: string[];
}

/**
 * 智擎版项目素材信息
 * 对应 API 的 project_materials 字段
 */
export interface StdProjectMaterials {
  local_video_material_list: string[];
  local_image_material_list: string[];
  video_material_list: StdVideoMaterial[];
  image_material_list: StdImageMaterial[];
  title_material_list: StdTitleMaterial[];
  carousel_material_list: StdCarouselMaterial[];
  trial_play_material_list: StdTrialPlayMaterial[];
  instant_play_material_list: StdInstantPlayMaterial[];
  source: string;
  // 产品信息
  product_info: StdProductInfo;

  // 锚点与组件
  anchor_related_type: string;
  anchor_material_list: StdAnchorMaterial[];
  component_material_list: StdComponentMaterial[];

  // 落地页链接
  external_url_material_list: string[];
  web_url_material_list: string[];
  open_url: string;
  open_urls: string[];
  ulink: string;
  ulink_type: string;
  mini_program_info: StdMiniProgramInfo;
  playlet_series_url_list: string[];

  // 其他
  original_video_title: string;
  dynamic_creative_switch: string;
  advanced_dc_settings: string[];
  call_to_action_buttons: string[];
  intelligent_generation: string;
  params_type: string;
  external_url_field: string;
  external_url_params: string;
  open_url_type: string;
  open_url_field: string;
  open_url_params: string;
}

export interface StdVideoMaterial {
  video_id: string;
  video_cover_id: string;
  image_mode: string;
  video_template_type: string;
  video_task_ids: string[];
  item_id: string;
  video_hp_visibility: string;
  guide_video_id: string;
}

export interface StdImageMaterial {
  image_mode: string;
  image_id: string;
}

export interface StdTitleMaterial {
  title: string;
  word_list: number[];
}

export interface StdCarouselMaterial {
  carousel_id: number;
  item_id: number;
  video_hp_visibility: string;
}

export interface StdTrialPlayMaterial {
  app_play_uri: string;
  guide_video_id: string;
}

export interface StdInstantPlayMaterial {
  app_play_uri: string;
}

export interface StdProductInfo {
  titles: string[];
  image_ids: string[];
  selling_points: string[];
  local_material_image_ids: string[];
}

export interface StdAnchorMaterial {
  anchor_type: string;
  anchor_id: number;
}

export interface StdComponentMaterial {
  component_id: number;
}

export interface StdMiniProgramInfo {
  app_id: string;
  start_path: string;
  params: string;
  url: string;
  urls: string[];
  auto: Array<{ app_id: string; start_path: string; params: string }>;
}

export interface StdTrackUrlSetting {
  track_url_type: string;
  track_url_group_id: number;
  track_url: string[];
  action_track_url: string[];
  active_track_url: string[];
  video_play_effective_track_url: string[];
  video_play_done_track_url: string[];
  video_play_first_track_url: string[];
  send_type: string;
}

// ==================== 预览区数据类型 ====================

/** 根据账户分组的数据 */
export interface StdCreationData {
  advertiserId: string;
  projectList: StdProject[];
  getProjectCount: () => number;
}

/** 预览区项目（单层） */
export interface StdProject {
  getName: () => string;

  operation: string;
  name: string;

  // -- 基础参数 --
  ad_type: string;
  landing_type: string;
  marketing_goal: string;
  app_promotion_type: string;
  game_addiction_id: string;
  external_action: string;
  unique_product_id: number;
  delivery_medium: string;
  native_type: string;
  app_name: string;
  product_platform_id: string;
  subscribe_url: string;
  download_url: string;
  deep_external_action: string;
  product_id: string;
  asset_id: string;
  deep_bid_type: string;
  aweme_id: string;
  delivery_mode: string;
  schedule_type: string;
  start_time: string;
  end_time: string;
  schedule_time: string;
  search_continue_delivery: string;
  bid_type: string;
  budget_mode: string;
  budget: number;
  bid: number;
  cpa_bid: number;
  deep_cpabid: number;
  roi_goal: number;
  first_roi_goal: number;
  pricing: string;
  download_type: string;
  launch_type: string;
  download_mode: string;
  audience_type: string;
  blue_flow_keyword_name: Array<string>;
  // -- 监测链接 --
  track_url_setting: StdTrackUrlSetting;
  // -- 关键词/搜索 --
  keywords: StdKeyword[];
  auto_extend_traffic: string;
  quick_app_id: string;
  promotion_type: string;
  star_task_id_list: number[];
  is_comment_disable: string;
  // -- AIGC / 星广联投 --
  aigc_dynamic_creative_switch: string;
  audience: Object;
  project_materials: StdProjectMaterials;
  brand_info: StdBrandInfo;
  delivery_type: string;
  multi_delivery_medium: string;
  shop_platform: string;
  live_duration: number;
  seven_roi_goal: number;
  layer_roi_switch: string;
  landing_page_stay_time: number;
  // -- 其他 --
  micro_promotion_type: string;
  micro_app_instance_id: number;
  dpa_adtype: string;
  multi_asset_type: string;
  asset_type: string;
  instance_id: number;
}
