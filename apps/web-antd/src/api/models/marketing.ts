import type {BaseItem, PageRequestParams} from "#/api/models/core";


/**
 * 账户请求
 */
export interface AdvertiserPageRequest extends PageRequestParams {
  advertiserId: string;
  advertiserName: string;
}


/**
 * 账户列表
 */
export interface AdvertiserItem extends BaseItem {
  platform: string;
  advertiserId: string;
  advertiserName: string;
  roleType: string;
  remark: string;
  platformRemark: string;
  putStatue: number;
  platformStatus: string;
  balance: number;
  dailyBudget: number;
  companyName: string;
  platformAuditState: string;
}



export interface CreateAdvertiserRequest {

}


export interface UpdateAdvertiserRequest extends CreateAdvertiserRequest{

}
/**
 * 账户授权请求iD
 */
export interface AuthAdvertiserRequest {
  platform: string;
}


/**
 * 开发者
 */


export interface DeveloperPageRequest extends PageRequestParams {
  platform: string;
  name: string;
}

export interface DeveloperItem extends BaseItem {
  platform: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  remark: string,
  authCount: string
}


export interface CreateDeveloperRequest {
  platform: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  remark: string,
}

export interface UpdateDeveloperRequest extends CreateDeveloperRequest {
  id: string;
}
