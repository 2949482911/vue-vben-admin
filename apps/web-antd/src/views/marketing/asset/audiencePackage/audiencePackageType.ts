import type { VivoV2AudienceInfo } from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { Platform } from '#/constants/enums';
import { ACTIVE_PLATFORM } from '#/constants/locales';

/**
 * 定向包可选平台（在通用媒体平台基础上追加 vivo2.0，避免影响其他模块共用的 ACTIVE_PLATFORM）
 */
export const AUDIENCE_PLATFORM_OPTIONS = [
  ...ACTIVE_PLATFORM,
  { label: 'vivo新版', value: Platform.VIVO_NEW },
];

/**
 * 定向人群配置详情
 */
export interface AdConfig {
  id: string;
  name: string;
  platform: string;
  platformAdvertiserId: string;
  platformAdvertiserName: string;
  localAdvertiserId: string;
  remark: string;
  status: number;
  type?: string;
  createTime: string;
  createUsername: string;
  createdBy: string;
  updateTime: string;
  updateUsername: string;
  updatedBy: string;
  _X_ROW_KEY?: string;
}

export interface AdVivoConfig extends AdConfig {
  config?: {
    sexList?: number[];
    ageList?: number[];
    interestSet?: number[];
    installedApp?: number;
    androidVersionSet?: number[];
    phonePriceSet?: number[];
    network?: number;
    phoneSeriesSet?: number[];
    networkOperatorSet?: string;
    region?: {
      regionCodeList?: number[];
      stayType?: number;
    };
    installBehavior?: {
      period?: number;
      behavior?: number;
    };
    startBehavior?: {
      period?: number;
      behavior?: number;
    };
  };
}

export interface AdVivoV2Config extends AdConfig {
  /** vivo2.0 定向配置（对应接口 audienceInfo，字段结构见 creation/vivo_v2/vivo_v2.ts） */
  config?: VivoV2AudienceInfo;
}

export interface AdBytedanceConfig extends AdConfig {
  config?: {
    name?: string;
    description?: string;
    landing_type?: string;
    marketing_goal?: string;
    delivery_range?: string;
    ad_type?: string;
    retargeting_tags?: number[];
    retargeting_tags_exclude?: number[];
    gender?: string;
    age?: string[];
    android_osv?: string;
    ios_osv?: string;
    harmony_osv?: string;
    carrier?: string[];
    carrier_region_optimize?: string;
    ac?: string[];
    device_brand?: string[];
    platform?: string[];
    auto_extend_targets?: string[];
    launch_price?: number[];
    interest_action_mode?: string;
    action_days?: number;
    action_categories?: number[];
    action_words?: number[];
    interest_categories?: number[];
    interest_words?: number[];
    district?: string;
    region_version?: string;
    city?: number[];
    location_type?: string;
    superior_popularity_type?: string;
    flow_package?: number[];
    exclude_flow_package?: number[];
    hide_if_converted?: string;
    converted_time_duration?: string;
    filter_event?: string[];
    device_type?: string[];
    geolocation?: Array<{
      name: string;
      long: number;
      lat: number;
      radius: number;
    }>;
    aweme_fans_numbers?: number[];
    filter_aweme_abnormal_active?: number;
    filter_aweme_fans_count?: number;
    filter_own_aweme_fans?: number;
    aweme_fan_accounts?: number[];
    aweme_fan_categories?: number[];
    aweme_fan_behaviors?: string[];
    aweme_fan_time_scope?: string;
    hide_if_exists?: number;
  };
}

export interface AdBytedanceStdConfig extends AdConfig {
  config?: {
    gender?: string;
    age?: string[];
    district?: string;
    geolocation?: Array<{
      radius: number;
      name: string;
      long: number;
      lat: number;
    }>;
    region_version?: string;
    city?: number[];
    location_type?: string;
    region_recommend?: string;
    android_osv?: string;
    ios_osv?: string;
    harmony_osv?: string;
    hide_if_converted?: string;
    hide_if_exists?: string;
    retargeting_tags_include?: number[];
    retargeting_tags_exclude?: number[];
    converted_time_duration?: string;
    platform?: string[];
    interest_action_mode?: string;
    interest_categories?: number[];
    interest_words?: number[];
    action_days?: number;
    action_categories?: number[];
    action_words?: number[];
    filter_own_aweme_fans?: string;
    ac?: string[];
    launch_price?: number[];
    smart_extend?: string;
    device_brand?: string[];
    device_type?: string[];
    superior_popularity_type?: string;
    flow_package?: number[];
    exclude_flow_package?: number[];
    auto_extend_targets?: string[];
    dpa_rta_switch?: string;
    rta_id?: number;
    dpa_rta_recommend_type?: string;
  };
}

export interface AdOppoConfig extends AdConfig {
  config?: {
    delStatus: number;
    region: number[];
    mobileModel: number[];
    sex: number;
    ageNew: number[] | string;
    network: number[] | string;
    installAppList: number[];
    preInstallAppList: number[];
    unPreInstallAppList: number[];
    notInstallAppList: number[];
    permanentRegion: number[];
    appActive: number[] | string;
    appNotActive: number[] | string;
    interestTagsV2: number[];
    unionAppId: number[];
    unionAppIdRe: number[];
    immutable: number;
    type: number;
    audience: string;
    pTargetId: number;
    oppAudienceId: number;
    appActiveDays: number;
    appNotActiveDays: number;
    audienceCount: number;
    imeiType: number;
    yesterdayInstalledApp: number[];
    weatherCode: number[];
    installedNeverActiveAppList: number[];
    filterConvertedAd: number;
    appUninstallDays: number;
    neverInstallAppList: number[];
    promoteAppInstall: string;
    appActiveAndOr: number;
    appNotActiveAndOr: number;
    historyNeverActiveAppList: string;
    historyNeverActiveAndOr: number;
    audienceIds: string;
    oppAudienceIds: string;
  };
}
