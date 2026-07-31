export interface BytedanceOptimizedGoalRequest {
  advertiserId: Array<string>;
  landing_type: string;
  ad_type: string;
  asset_type: string;
}


export interface BytedanceEventManagerOptimizedGoalGetGoal {
  optimization_name: string;
  asset_types: Array<string>;
  history_back: boolean;
  twenty_four_hour_back: boolean;
  external_action: string;
  value_type: string;
  need_app_force: boolean;
  deep_goals: Array<BytedanceEventManagerOptimizedDeepGoal>;
}

export interface BytedanceEventManagerOptimizedDeepGoal {
  history_back: boolean;
  optimization_name: string;
  twenty_four_hour_back: boolean;
  deep_external_action: string;
  asset_types: Array<string>;
}


export interface BytedanceAwemeAuthListRequest {
  advertiserId: Array<string>;
}


export interface BytedanceToolsAwemeAuthListList {
  auth_scenarios: string;
  auth_type: string;
  aweme_id: string;
  aweme_name: string;
  aweme_user_type: string;
  auth_status: string;
  sub_status: string;
  start_time: string;
  share_type: string;
  end_time: string;
  open_id: string;
  has_video_hp_visibility_limit: boolean;
  warning_types: Array<string>;
  warning_content: Array<string>;
  aweme_cancel_note: string;
  aweme_cancel_reason: string;
  note: string;
}


export interface BytedanceDpaProductAvailablesRequest {
  advertiserId: Array<string>;
}

/** 商品库信息 */
export interface BytedanceDpaProductAvailablesItem {
  platform_id: number;
  name: string;
  product_industry: string;
  account_id: string;
  account_type: string;
}

export interface BytedanceDpaProductListRequest {
  advertiserId: Array<string>;
  productPlatformId: number;
  page?: number;
  pageSize?: number;
}

/** 商品列表项 - 字段与后端 BytedanceDpaProductListResponse.BytedanceDpaProductListItem 完全对齐 (snake_case) */
export interface BytedanceDpaProductListItem {
  platform_id: number;
  product_id: number;
  name: string;
  title: string;
  description: string;
  image_url: string;
  image_urls: Array<BytedanceDpaProductImageUrlItem>;
  online_time: number;
  offline_time: number;
  status: number;
  audit_status: number;
  audit_reasons: Array<BytedanceDpaProductAuditReason>;
  stock: number;
  first_category: string;
  sub_category: string;
  third_category: string;
  first_category_id: string;
  sub_category_id: string;
  third_category_id: string;
  landing_info: BytedanceDpaProductLandingInfo;
  brand_info: BytedanceDpaProductBrandInfo;
  shop_keeper_info: BytedanceDpaProductShopKeeperInfo;
  address: string;
  price_info: BytedanceDpaProductPriceInfo;
  outer_id: string;
  titles: Array<string>;
  feature: string;
  mark: number;
  bought: number;
  comments: number;
  tags: Array<string>;
  spu_id: string;
  video: string;
  has_video: number;
  province: Array<string>;
  city: Array<string>;
  age: Array<number>;
  label: Array<string>;
  videos: Array<BytedanceDpaProductVideoItem>;
  profession: BytedanceDpaProductProfession;
}

export interface BytedanceDpaProductImageUrlItem {
  url: string;
}

export interface BytedanceDpaProductAuditReason {
  audit_reason: string;
}

export interface BytedanceDpaProductLandingInfo {
  target_url: string;
  target_url_mobile: string;
  target_url_android_app: string;
  target_url_ios_app: string;
  target_url_universal_link: string;
}

export interface BytedanceDpaProductBrandInfo {
  brand_id: string;
  brand_name: string;
  en_brand: string;
  brand_logo: string;
  brand_url: string;
  brand_url_mobile: string;
  brand_url_android_app: string;
  brand_url_ios_app: string;
  brand_url_universal_link: string;
}

export interface BytedanceDpaProductShopKeeperInfo {
  shop_keeper_id: string;
  shop_keeper_name: string;
  shop_keeper_url: string;
  shop_keeper_url_mobile: string;
  shop_keeper_url_android_app: string;
  shop_keeper_url_ios_app: string;
  shop_keeper_url_universal_link: string;
}

export interface BytedanceDpaProductPriceInfo {
  value: number;
  price_unit: string;
  saving: number;
  discount: number;
  price: number;
  sales_promotion: string;
  down_payment: string;
  mortgage: string;
  daily_mortgage: string;
}

export interface BytedanceDpaProductVideoItem {
  url: string;
  template_id: string;
}

export interface BytedanceDpaProductProfession {
  platform: string;
  chapter: string;
  novel_length: string;
  novel_gender: string;
  novel_author: string;
  novel_star: string;
  novel_type: string;
  start_pay_chapter: string;
  min_pay_money: string;
  acc_pay_people: string;
  acc_pay_money: string;
  name: string;
  copyright_owner: string;
  playlet_gender: string;
  playlet_num: number;
  playlet_duration: number;
  start_pay_playlet: number;
  price: number;
  year_of_vip: string;
  half_year_of_vip: string;
  max_charge: number;
  min_charge: number;
  recommended_charge: number;
}


export interface BytedanceDpaClueProductListRequest {
  advertiserId: Array<Number>;
  filtering: {
    product_ids?: Array<Number>;
    category_ids?: Array<Number>;
    product_name?: string;
    audit_status?: Array<string>;
    category_name: string;
    completion_status: Array<string>;
    product_id_or_name_search: string;
    statuses: Array<string>;
    rels: Array<string>;
  };
}

/**
 * 商品
 */
export interface BytedanceDpaClueProduct {
  product_id: string;
  name: string;
  title: string;
  outer_id: string;
  description: string;
  online_time: string;
  offline_time: string;
  image_url: string;
  status: string;
  audit_status: string;
  completion_status: string;
  images_url: Array<{ url: string }>;
  videos: Array<{ url: string, template_id: string }>;
  landing_info: {
    target_url: string;
    target_url_mobile: string;
    target_url_android_app: string;
    target_url_ios_app: string;
    target_url_universal_link: string;
  };
}
