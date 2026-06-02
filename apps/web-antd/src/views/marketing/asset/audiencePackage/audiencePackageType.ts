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
