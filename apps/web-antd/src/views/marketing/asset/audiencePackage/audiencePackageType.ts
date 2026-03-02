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
  // 定向核心配置
  config?:{
    sexList?:number[];
    ageList?:number[];
    interestSet?:number[];
    installedApp?:number;
    androidVersionSet?:number[];
    phonePriceSet?:number[];
    network?:number;
    phoneSeriesSet?:number[];
    networkOperatorSet?:string;
    region?: {
      regionCodeList?: number[];
      stayType?: number;
    },
    installBehavior?: {
      period?: number;
      behavior?: number;
    },
    startBehavior?: {
      period?: number;
      behavior?: number;
    },
  }
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
