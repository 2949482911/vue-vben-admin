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
