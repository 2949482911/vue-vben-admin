import type {
  AudienceConfigData,
  ConfigurationConfig,
  MaterialData,
  PageViewConfigData,
  PlatformCreation,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';

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

  // -- 投放设置 --
  delivery_mode: string;
  delivery_type: string;

  // -- 投放载体 --
  native_type: string;
  aweme_id: string;
  delivery_medium: string;

  // -- 商品 --
  related_product: StdRelatedProduct;

  // -- 应用相关 --
  download_url: string;
  app_name: string;
  download_type: string;
  download_mode: string;
  quick_app_id: string;
  launch_type: string;
  promotion_type: string;
  subscribe_url: string;
  asset_id: number;

  // -- 优化目标 --
  external_action: string;
  deep_external_action: string;
  game_addiction_id: string;
  paid_switch: number;
  deep_bid_type: string;
  value_optimized_type: string;

  // -- 排期/预算/出价 --
  schedule_type: string;
  start_time: string;
  end_time: string;
  schedule_time: string;
  bid_type: string;
  budget_mode: string;
  budget: number;
  bid: number;
  cpa_bid: number;
  deep_cpabid: number;
  roi_goal: number;
  first_roi_goal: number;
  seven_roi_goal: number;
  pricing: string;
  layer_roi_switch: string;
  search_continue_delivery: string;

  // -- 落地页 --
  landing_page_stay_time: number;
  open_url: string;
  open_url_type: string;
  open_urls: string[];
  ulink_url_type: string;
  ulink_url: string;

  // -- 品牌信息 --
  brand_info: StdBrandInfo;

  // -- 素材信息 --
  project_materials: StdProjectMaterials;

  // -- 定向 --
  audience_type: string;

  // -- 创意设置 --
  source: string;
  is_comment_disable: string;
  ad_download_status: string;

  // -- AIGC / 星广联投 --
  aigc_dynamic_creative_switch: string;
  star_auto_material_addition_switch: string;
  star_auto_delivery_switch: string;
  star_task_id_list: number[];

  // -- 关键词/搜索 --
  keywords: StdKeyword[];
  auto_extend_traffic: string;

  // -- 监测链接 --
  track_url_setting: StdTrackUrlSetting;

  // -- 其他 --
  micro_promotion_type: string;
  micro_app_instance_id: number;
  dpa_adtype: string;
  multi_asset_type: string;
  asset_type: string;
  instance_id: number;
}

export interface StdRelatedProduct {
  product_setting: string;
  product_platform_id: string;
  product_id: string;
  unique_product_id: string;
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
  name: string;
  operation: string;
  landing_type: string;
  marketing_goal: string;
  ad_type: string;
  delivery_type: string;
  delivery_mode: string;
  external_action: string;
  deep_external_action: string;
  bid_type: string;
  budget_mode: string;
  budget: number;
  bid: number;
  pricing: string;
  roi_goal: number;
  schedule_type: string;
  project_materials: StdProjectMaterials;
  related_product: StdRelatedProduct;
  track_url_setting: StdTrackUrlSetting;
  audience: object;
}
