import type {BaseItem, PageRequestParams} from "#/api/models/core";

// dsp查询列表参数
export interface DspPageRequest extends PageRequestParams {
  name?: string;
}
// dsp创建
export interface DspItem extends BaseItem {
  name?: string;
  platform?: string;
  api?: string;
  apiVersion?: string;
  qpsLimit?: number;
  weight?: number;
  remark?: string;
}
export interface DspUpdateItem extends DspItem {
  id: string;
}
// rtb查询列表参数
export interface RtbPageRequest extends PageRequestParams {
  name?: string;
}
// rtb创建
export interface RtbItem extends BaseItem {
  name?: string;
  platform?: string;
  remark?: string;
}
export interface RtbUpdateItem extends RtbItem {
  id: string;
}
export interface CampaignPageRequest extends PageRequestParams {
  name?: string;
}
// rtb创建
export interface CampaignItem extends BaseItem {
  name?: string;
  daypartingConfig?: string;
  dailyBudget?: number;
  totalBudget?: number;
  spentToday?: string;
  spentTotal?: string;
  qpsLimit?: number;
  currentQps?: string;
  pacingType?: string;
  pacingRate?: number;
  priority?: number;
  tmaxMs?: number;
}
export interface CampaignUpdateItem extends CampaignItem {
  id: string;
}
// push计划创建
export interface PushCampaignItem extends BaseItem {
  name: string;
  requestId?: string;
  targetType?: number;
  sendNum?: number;
  audience: AudienceType;
  plan: PlanType;
  material?: MaterialType;
  materialStyle?: MaterialStyleType;
  options?: OptionsType;
  targetClientId?: string;
  rtaCfgId?: string;
  isTestCampaign?: number;
  conversionReportId: string;
  sendTiming: number;
  eventNames: string[];
  appGroupId: string;
  excludeOneself:number;
  fullSend: boolean;
  excludeFistActiveAudience: boolean

}
interface AudienceType {
  type?: number;
  tagSet?: TagCatalogType[];
}
interface PlanType {
  time?: TimeType[];
  noDisturbEnable?: number;
}
interface MaterialType {
  title: string;
  body?: string;
  summary?: string;
  imageUrl?: string;
  imageId?: string;
  actionType?: number;
  intent?: string;
  action?: string;
  data?: string;
  buttons: ButtonType[];
}
interface MaterialStyleType {
  advancedStyle?: AdvancedStyleType;
  smallIcon?: SmallIconType;
  displayMode?: number;
  foldType?: number;
}
interface OptionsType {
  conversionReportFlag?: number;
  biTag?: string;
  rtaMode?: number;
  preinstallVoucher?: number;
  commonVoucher: number;
  appVoucher: number;
  notifyId: number;
}
interface TagCatalogType {
  name: string;
  tags: Array<string>;
}
interface TimeType {
  start: number;
  end: number;
}
interface ButtonType {
  name: string;
  actionType: number;
  intentType: number;
  intent: string;
  data: string;
}
interface AdvancedStyleType {
  color: string;
  backgroundImageId: string;
  transparentBackgroundImageId: string;
  colorMode: number;
  bigImageId: string;
}

interface SmallIconType {
  type: number;
  imageId: string;
  iconPath: string;
  iconUrl: string;
}
export interface PushCampaignPageRequest extends PageRequestParams {
  name: string;
  platform: string;
}
