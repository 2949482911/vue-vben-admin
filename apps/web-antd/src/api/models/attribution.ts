import type { BaseItem, PageRequestParams } from "#/api/models/core";


export interface EventConfigPageRequest extends PageRequestParams {
  eventName: string;
  eventDisplayName: string;
  eventType: string;
  eventCategory: string;
  eventValueType: string;
  eventValueRequired: boolean;
  eventCountEnabled: boolean;
  isCallbackEvent: boolean;
  callbackEventType: string;
  isAttributionEvent: boolean;
  isSystem: boolean;
}

/**
 * 事件配置表
 */
export interface EventConfigItem extends BaseItem {
  eventName: string;
  eventDisplayName: string;
  // behavior 行为事件
  // property 属性事件
  eventType: string;
   // STANDARD/CUSTOM
  eventCategory: string;
  //
  eventValueType: string;
  eventValueRequired: boolean;
  eventCountEnabled: boolean;
  isCallbackEvent: boolean;
  callbackEventType: string;
  callbackPriority: number;
  isAttributionEvent: boolean;
  attributionWindowOverride: number;
  isSystem: boolean;
  sortOrder: number;
  attributeIds: Array<number>;
  attributes: Array<EventAttributeItem>;
}


export interface EventAttributePageRequest extends PageRequestParams{
  name: string;
  displayName: string;
  type: string;
  category: string;
  isRequired?: boolean;
  isSystem?: boolean;
}

/**
 * 事件属性
 */
export interface EventAttributeItem extends BaseItem {
  name: string;
  displayName: string;
  type: string;
  category: string;
  isRequired: boolean;
  defaultValue: string;
  validationRegex: string;
  isSystem: boolean;
}


/**
 * 创建事件
 */
export interface CreateEventConfigRequest {
  eventName: string;
  eventDisplayName: string;
  eventType: string;
  eventCategory: string;
  eventValueType: string;
  eventValueRequired: boolean;
  eventCountEnabled: boolean;
  // 关联的属性值ID列表
  attributeIds: Array<number>;
  isCallbackEvent: boolean;
  callbackEventType: string;
  callbackPriority: number;
  isAttributionEvent: boolean;
  attributionWindowOverride: number;
  description: string;
}


export interface UpdateEventConfigRequest extends CreateEventConfigRequest {
  id: string;
}


/**
 * 事件属性
 */
export interface EventAttributeItem extends BaseItem {
  name: string;
  displayName: string;
  type: string;
  category: string;
  isRequired: boolean;
  defaultValue: string;
  validationRegex: string;
  isSystem: boolean;
}


export interface CreateEventAttributeRequest {
  name: string;
  displayName: string;
  // 属性类型 STRING/NUMBER/BOOLEAN/DATE/JSON/MONEY
  type: string;
  // 分类 DEVICE/USER/EVENT/CUSTOM
  category: string;
  isRequired: boolean;
  defaultValue: string;
  isSystem: boolean;
  validationRegex: string;
}


export interface UpdateEventAttributeRequest extends CreateEventAttributeRequest {
  id: string;
}


/**
 * 归因配置表
 */
export interface AttributionConfigPageRequest extends PageRequestParams {
  name: string;
  attributionModel?: string;
  isDefault?: boolean;
}


export interface AttributionConfigItem extends BaseItem {
  name: string;
  eventDisplayName: string;
  attributionModel: string;
  clickLookbackWindow: number;
  exposureLookbackWindow: number;
  ipLookbackWindow: number;
  idMatchPriority: any;
  callbackWindow: number;
  isDefault: boolean;
  description: string;
}


export interface CreateAttributionConfigRequest {
  name: string;
  attributionModel: string;
  clickLookbackWindow: number;
  exposureLookbackWindow: number;
  ipLookbackWindow: number;
  idMatchPriority: any;
  callbackWindow: number;
  isDefault: boolean;
}


export interface UpdateAttributionConfigRequest extends CreateAttributionConfigRequest{
  id: string;
}


/**
 * sdk config
 */
export interface SdkAppConfigListPageRequest extends PageRequestParams {
  projectId: string;
}


export interface SdkAppConfigItem extends BaseItem{
  projectId: string;
  projectName: string;
  projectType: string;
  packageName: string;
  sdkKey: string;
  sdkEnabled: boolean;
  attributionConfigId: string;
  attributionConfigName: string;
  enabledEventIds: Array<number>;
  eventConfigItems: Array<EventConfigItem>;
}


export interface CreateSdkAppRequest {
  projectId: string;
  attributionConfigId: string;
  enabledEventIds: Array<string>;
}


export interface UpdateSdkAppRequest extends CreateSdkAppRequest {
  id: string;
}


