import type {BaseItem, PageRequestParams} from '#/api/models/core';

// callback page request
export interface PlatformcallbackPageRequest extends PageRequestParams {
  name?: string;
  platform?: string;
}

// callback platform list
export interface PlatformcallbackItem extends BaseItem {
  name: string;
  platform: string;
  config: Map<string, any>;
  remark: string;
  behaviorType: string;
  behaviorTypeMoel: string;
  behaviorTypeName: string;
  onlyClick: boolean;
}

export interface CreatePlatformCallbackRequest {
  name: string;
  platform: string;
  config: Map<string, any>;
  remark: string;
  onlyClick: boolean;
}

export interface UpdatePlatformCallbackRequest
  extends CreatePlatformCallbackRequest {
  id: string;
}

// 转化媒体配置
export interface BehavioraPlatformItem extends BaseItem {
  platform: string;
  name: string;
  config: Map<string, any>;
  remark: string;
  model: string;
  ocpxPlatformMatchList: Array<OcpxPlatformMatch>;
  simulate: boolean;
}

// 转化匹配列表
export interface OcpxPlatformMatch extends BaseItem {
  platform: string;
  behavioraPlatformId: string;
  advertiserId: string;
  campaignId: string;
  adgroupId: string;
  promotionId: string;
  creativeId: string;
  behavioraPlatform: string;
  matchId: string;
}

export interface BehavioraPlatformPageRequest extends PageRequestParams {
  name?: string;
  platform?: string;
}

// 创建转化配置
export interface CreateBehavioraPlatformRequest {
  platform: string;
  name: string;
  model: string;
  config: Map<string, any>;
  ocpxPlatformMatches: Array<OcpxPlatformMatch>;
  matchField: string;
  remark: string;
  simulate: boolean;
}

// 编辑转化配置
export interface UpdateBehavioraPlatformRequest
  extends CreateBehavioraPlatformRequest {
  id: string;
}

// ocpx task

export interface OpcxTaskPageRequest extends PageRequestParams {
  name?: string;
  platform?: string;
}

export interface OcpxTaskItem extends BaseItem {
  name: string;
  platform: string;
  description: string;
  taskState: number;
  callbackRate: number;
  behavioraPlatformIds: Array<number>;
  platformCallbackIds: Array<number>;
  hadClick: boolean;
}

// ocpx task create request instance params
export interface CreateOcpxTaskRequest {
  platform: string;
  name: string;
  description: string;
  behavioraPlatformIds: Array<number>;
  taskState: number;
  callbackRate: number;
  platformCallbackIds: Array<number>;
}

export interface UpdateOcpxTaskRequest extends CreateOcpxTaskRequest {
  id: string;
}

/**
 * 点击练级
 */
export interface ClickMonitorResponse {
  url: string;
  name: string;
  ocpxTaskId: string;
  platformCallbackId: string;
  platform: string;
}

export interface OcpxBehavioracallbackRecordPageRequest
  extends PageRequestParams {
  ocpxTaskId: string;
}

// ocpx 执行 任务记录
export interface OcpxBehavioracallbackRecordItem extends BaseItem {
  taskId: string;
  behavioraPlatformId: string;
  behavioraPlatformName: string;
  platformCallbackId: string;
  platformCallbackName: string;
  requestPrams: Map<string, any>;
  respCode: number;
  respMsg: string;
  respData: Map<string, any>;
  success: boolean;
  clickId: string;
  requestId: string;
}

// 转化请求记录
export interface OcpxBehaviorRecordItem extends BaseItem {
  taskId: string;
  behavioraPlatformId: string;
  behavioraPlatformName: string;
  platformCallbackId: string;
  platformCallbackName: string;
  clickId: string;
  requestId: string;
  respCode: number;
  respMsg: string;
  respData: Map<string, any>;
  requestSuccess: boolean;
}


/**
 * 回传媒体事件类型
 */
export interface PlatformCallbackBehaviorTypeItem {
  label: string;
  value: string;
}


/**
 * 回调测试
 */
export interface TestCallbackRequest {
  ocpxTaskId: string;
  platformCallbackId: string;
  behaviorType: string;
}
