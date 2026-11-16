import type { ProductConfigData } from '../bytedance_std/bytedance';

import type {
  AudienceConfigData,
  AwemeConfigData,
  ConfigurationConfig,
  MaterialData,
  PageViewConfigData,
  PlatformCreation,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';

/** 全域批投版本标识（仅用于策略组/展示区分） */
export const BYTEDANCE_UNIT = '0.1';

/**
 * 巨量引擎-全域批投创建数据
 *
 * 单层结构：只有项目层级；素材/标题/短剧链接/产品信息全部内嵌在项目参数中。
 * API: POST /open_api/v3.0/uni_project/create/
 */
export interface UnitCreation extends PlatformCreation<UnitConfigData> {
  configurationConfig: ConfigurationConfig;
}

export interface UnitConfigData {
  project: UnitProjectCreateRequest;
  material: MaterialData;
  titlePackage: TitlePackageConfigData;
  // 落地页：短剧专辑链接从落地页选择
  landingPage: PageViewConfigData;
  // 定向包：audience 配置直接进入项目 audience
  audience: AudienceConfigData;
  // 抖音号：全域投放载体
  awemeConfig: AwemeConfigData;
  // 产品配置：产品名称/卖点/行动号召/主图，写入项目 product_info
  productConfig: ProductConfigData;
}

/** 关联产品投放参数 */
export interface UnitRelatedProduct {
  /** 商品库 ID，营销产品=剧目时必填 */
  product_platform_id: number;
  /** 商品 ID，营销产品=剧目时必填，单次最多一个 */
  product_id: number;
}

/** 投放商品选择结果（仅前端回显，提交前剔除） */
export interface UnitSelectedProduct {
  product_platform_id: number;
  product_id: number;
  name?: string;
  title?: string;
  image_url?: string;
}

export interface UnitGeolocation {
  /** 地点名称 */
  name?: string;
  /** 经度（文档字段名为 long） */
  long?: number;
  /** 纬度 */
  lat?: number;
  /** 半径，单位米，取值 3000-30000 */
  radius?: number;
}

/** 定向设置（与文档 audience 结构一致） */
export interface UnitAudience {
  /** 地域类型：BUSINESS_DISTRICT / REGION / NONE */
  district?: string;
  /** 地图点位，district=BUSINESS_DISTRICT 时填写 */
  geolocation?: UnitGeolocation[];
  /** 行政区域版本号，当前仅支持 2.3.2 */
  region_version?: string;
  /** 行政区域 ID 列表，district=REGION 时必填 */
  city?: number[];
  /** 位置类型：CURRENT / HOME / TRAVEL / ALL */
  location_type?: string;
  /** 性别：GENDER_FEMALE / GENDER_MALE / NONE */
  gender?: string;
  /** 年龄区间 */
  age?: string[];
  /** 平台：ANDROID / IOS / HARMONY */
  platform?: string[];
  /** 过滤已转化用户 */
  hide_if_converted?: string;
  /** 过滤时间范围 */
  converted_time_duration?: string;
  /** 排除人群包 ID 列表 */
  retargeting_tags_exclude?: number[];
}

/** 内部广告主信息 */
export interface UnitInternalAdvertiserInfo {
  /** 配量/换量/内广/售卖/补量 */
  classify?: string;
  resource_entry_number?: string;
  item_number?: string;
  advertising_volume?: number;
}

/** 品牌信息，仅关联云图的客户可填写 */
export interface UnitBrandInfo {
  yuntu_category_id?: number;
  cdp_brand_id?: number;
  ecom_brand_id?: number;
  brand_name_id?: number;
  cdp_brand_name?: string;
  sub_brand_names?: string[];
  sub_brand_name_ids?: string[];
}

/** 视频素材 */
export interface UnitVideoMaterial {
  /** CREATIVE_IMAGE_MODE_VIDEO_VERTICAL 竖版 / CREATIVE_IMAGE_MODE_VIDEO 横版 */
  image_mode?: string;
  video_id?: string;
  video_cover_id?: string;
  /** 抖音短视频 ID，仅 aweme_id 传入时有效 */
  item_id?: number;
  /** ALWAYS_VISIBLE / HIDE_VIDEO_ON_HP */
  video_hp_visibility?: string;
  /** 本地视频素材 ID，上传后追加到 video_material_list */
  local_video_material_list?: string[];
  /** 本地图片素材 ID，上传后追加到 product_info.image_ids */
  local_image_material_list?: string[];
}

/** 短剧专辑链接 */
export interface UnitPlayletSeriesUrlInfo {
  /** IAA / IAP */
  playlet_series_url_type?: string;
  playlet_series_url?: string;
}

/** 标题素材 */
export interface UnitTitleMaterial {
  title: string;
}

/** 产品信息 */
export interface UnitProductInfo {
  /** 产品名称，字数 1-20，数组上限 1 */
  titles?: string[];
  /** 产品主图，108*108，上限 10 */
  image_ids?: string[];
  /** 本地产品主图素材 ID，上传后追加到 image_ids */
  local_images_ids?: string[];
  /** 产品卖点，字数 6-9，上限 10 */
  selling_points?: string[];
}

/**
 * 全域投放项目创建参数（逐字对齐官方文档 / BytedanceUniProjectCreateRequest）
 */
export interface UnitProjectCreateRequest {
  /** 项目名称，长度 1-50 个字 */
  name: string;
  /** 营销产品，当前仅支持 ALBUM（剧目） */
  delivery_product: string;
  related_product?: UnitRelatedProduct;
  /** 抖音号 ID；投放载体为抖音号时必填 */
  aweme_id?: string;
  /** 项目预算，单位元，取值 [300, 9999999.99] */
  budget: number;
  /** ROI 系数，取值 [0, 5] */
  uni_roi_goal: number;
  /** 投放变现模式：IAP / IAA_AND_IAP */
  monetization_mode: string;
  /** 投放时间类型：SCHEDULE_FROM_NOW / SCHEDULE_START_END */
  schedule_type: string;
  /** 投放起始时间，精确到天，如 2017-01-01 */
  start_time?: string;
  /** 投放结束时间，精确到天，如 2017-01-01 */
  end_time?: string;
  /** 投放时段，48*7 位 0/1 字符串 */
  schedule_time?: string;
  /** AIGC 动态创意开关：ON / OFF，不传默认 ON */
  aigc_dynamic_creative_switch?: string;
  audience?: UnitAudience;
  internal_advertiser_info?: UnitInternalAdvertiserInfo;
  brand_info?: UnitBrandInfo;
  /** 自定义抖音名称 */
  source?: string;
  /** 视频素材，单剧目创建时最多 200 个 */
  video_material_list?: UnitVideoMaterial[];
  /** 短剧专辑链接 */
  playlet_series_url_info?: UnitPlayletSeriesUrlInfo[];
  /** 标题素材，单剧目最多 100 个 */
  title_material_list?: UnitTitleMaterial[];
  product_info?: UnitProductInfo;
  /** 行动号召文案，数组上限 10 */
  call_to_action_buttons?: string[];
  /** 海外流量拓展开关：ON / OFF */
  going_global_switch?: string;
  /** 出海预算 */
  going_global_budget?: number;
  /** 出海 ROI 系数 */
  going_global_roi_goal?: number;

  // ===== 批投侧字段（不提交媒体）=====
  /** 已有项目 ID */
  projectId?: number | string;
  /** 已选商品展示信息（仅前端回显，提交前剔除） */
  selectedProduct?: UnitSelectedProduct;
}

/** 预览区项目 */
export interface UnitProject extends UnitProjectCreateRequest {
  getName: () => string;
}

export interface UnitCreationData {
  advertiserId: string;
  projectList: UnitProject[];
  getProjectCount: () => number;
}
