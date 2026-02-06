/**
 * 基础元数据接口（通用字段）
 */
interface BaseMeta {
  id: string;
  createdBy: string;
  createTime: string;
  updatedBy: string;
  updateTime: string;
  createUsername?: string;
  updateUsername?: string;
  del: number; // 逻辑删除标记
  status: number;
}

/**
 * 回调详情信息
 */
export interface CallbackInfo extends BaseMeta {
  advertiserId: string;           // 广告主ID
  behavioraPlatformId: string;    // 行为平台ID
  clickId: string;                // 点击ID
  eventStatus: number;            // 事件状态
  eventTime: string;              // 事件时间戳
  eventType: string;              // 事件类型 (如：拉活)
  mainId: string;                 // 主业务ID
  platform: string;               // 平台 (如：kuaishou)
  requestId: string;              // 请求唯一标识
  taskId: string;                 // 任务ID
}

/**
 * 点击详情信息
 */
export interface ClickInfo extends BaseMeta {
  adgroupId: string;              // 广告组ID
  advertiserId: string;           // 广告主ID
  androidId: string | null;
  caid: string | null;
  caid1Md5: string | null;
  caid2Md5: string | null;
  callback: string;               // 回调地址/参数串
  campaignId: string;             // 推广计划ID
  channel: string | null;
  clickId: string;                // 点击ID
  clueToken: string | null;
  creativeId: string;             // 创意ID
  customParams: any | null;       // 自定义参数
  deviceId: string | null;
  extraParams: any | null;        // 额外参数
  idfa: string | null;
  idfaMd5: string | null;
  imei: string | null;
  imeiMd5: string | null;
  ip: string;                     // IP地址
  mac: string | null;
  macMd5: string | null;
  mainId: string;                 // 主业务ID
  model: string | null;           // 机型
  oaid: string;                   // OAID
  ocpxTaskId: string;             // OCPX任务ID
  odidMd5: string | null;
  os: string;                     // 操作系统
  osVersion: string | null;       // 系统版本
  platform: string;               // 媒体平台 (如：honor)
  platformCallbackId: string;     // 平台回调配置ID
  promotionId: string | null;
  reqId: string | null;
  requestId: string;              // 请求唯一标识
  traceTime: string;              // 追踪时间戳
  ua: string | null;              // User Agent
}

/**
 * 完整详情数据结构
 */
interface DataDetail {
  callbackInfo: CallbackInfo;
  clickInfo: ClickInfo;
}
