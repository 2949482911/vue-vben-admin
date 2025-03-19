import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  District,
  ExpressTemplateCreate,
  ExpressTemplateItem,
  ExpressTemplateParams, ExpressTemplateUpdate,
  SellerAddressCreate,
  SellerAddressItem,
  SellerAddressParams, SellerAddressUpdate
} from "#/api/models/media/logistics";


class LogisticsApi extends BaseApi {
  /**
   * 商家地址
   * @param params
   */
  fetchSellerAddressList(params: SellerAddressParams) : Promise<SellerAddressItem[]> {
    return requestClient.get<SellerAddressItem[]>(this.getServiceUrl("seller/address/list"), {params: params});
  }

  /**
   * 创建地址
   * @param params
   */
  fetchSellerCreateAddress(params: SellerAddressCreate) {
    return requestClient.post(this.getServiceUrl("seller/address/create"), params);
  }

  /**
   * 编辑地址
   * @param params
   */
  fetchSellerAddressUpdate(params: SellerAddressUpdate) {
    return requestClient.post(this.getServiceUrl("seller/address/update"), params);
  }


  /**
   * 运费模板列表
   * @param params
   */
  fetchExpressTemplateList(params: ExpressTemplateParams): Promise<ExpressTemplateItem[]> {
    return requestClient.get<ExpressTemplateItem[]>(this.getServiceUrl("express/template/list"), {params: params});
  }


  fetchExpressTemplateCreate(params: ExpressTemplateCreate) {
    return requestClient.post(this.getServiceUrl("express/template/create"), params);
  }


  fetchExpressTemplateUpdate(params: ExpressTemplateUpdate) {
    return requestClient.post(this.getServiceUrl("express/template/update"), params);
  }

  /**
   * 获取地区树
   */
  fetchDistrictTree():Promise<District[]> {
    return requestClient.get<District[]>(this.getServiceUrl("district/tree"));
  }

}


export const logisticsApi = new LogisticsApi("/media")
