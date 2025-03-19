import type {BaseItem, PageRequestParams} from "#/api/models/core";

export interface SellerAddressParams extends PageRequestParams {
  platform: string;
  accountId: string;
}


/**
 * 详细地址
 */
export interface MediaSellerAddressDetail {
  consignee: string;
  mobile: string;
  provinceCode: string;
  province: string;
  cityCode: string;
  city: string;
  districtCode: string;
  district: string;
  address: string;
  town: string;
  townCode: string;
  addressMetaVersion: string;
}

/**
 * 销售地址
 */
export interface SellerAddressItem extends BaseItem {
  platform: string;
  platformAddressId: string;
  accountId: string;
  sellerId: string;
  addressStatus: number;
  defaultAddress: boolean;
  addressType: number;
  sourceType: number;
  mediaSellerAddressDetail: MediaSellerAddressDetail;
}


export interface SellerAddressCreate {
  platform: string;
  accountId: string;
  sellerAddress: MediaSellerAddressDetail;
  defaultAddress: boolean;
  addressType: number;
}


export interface SellerAddressUpdate extends SellerAddressCreate{
  id: string;
}


/**
 * 运费模板
 */
export interface ExpressTemplateParams extends PageRequestParams {
  platform: string;
  name: string
}

export interface ExpressTemplateItem extends BaseItem {
  platform: string;
  name: string;
  accountId: string;
  sellerId: string;
  platformExpressTemplateId: string;
  calType: number;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
}



export interface ExpressTemplateCreate {
  platform: string;
  accountId: string;
  sendProvinceCode: string;
  sendProvinceName: string;
  sendTime: number;
  sendCityName: string;
  calType: string;
  name: string;
  sourceType: string;
  sendCityCode: string;
  config: string;
  sendDistrictCode: string;
  sendDistrictName: string;
}


export interface ExpressTemplateUpdate extends ExpressTemplateCreate{
  id: string;
}


/**
 * 行政地区
 */
export interface District extends BaseItem {
  code: string;
  name: string;
  parentId: string;
  version: string;
  children: Array<District>;
}

