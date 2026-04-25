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

