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
  platform: string;
  platformAccountId: string;
  developerId: string;
  name: string;
  sex: number;
  head: string;
  highDefinitionHead: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  putStatus: number;
  authStatus: number;
  sellerId: string;
  sellerName: string;
  openId: string;
  shopId: string;
  shopType: number;
  shopName: string;
  shopScore: number;
  productScore: number;
  logisticsScore: number;
  serviceScore: number;
  afterSalesServiceScore: number;
  contentQualifyScore: number;
}
