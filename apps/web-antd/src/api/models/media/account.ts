import type { BaseItem, PageRequestParams } from "#/api/models/core";


export interface MediaOnlineretailersParams extends PageRequestParams {
  name: string;
  developerId: number;
  sellerId: string;
  openId: string;
  sellerName: string;
  platform: string;
}


export interface MediaOnlineretailersItem extends BaseItem {

}
