/**
 * 营销卷
 */
import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  CouponCreateRequest,
  CouponItem,
  CouponParams,
  CouponUpdateRequest, DeleteCouponRequest
} from "#/api/models/media/promotion";

class PromotionApi extends BaseApi {

  /**
   * 卷列表
   * @param params
   */
  fetchCouponList(params: CouponParams): Promise<CouponItem[]> {
    return requestClient.get<CouponItem[]>(this.getServiceUrl("/coupon/list"), {params: params});
  }


  fetchCouponCreate(params: CouponCreateRequest) {
    return requestClient.post(this.getServiceUrl("/coupon/create"), params);
  }


  fetchCouponUpdate(params: CouponUpdateRequest) {
    return requestClient.post(this.getServiceUrl("/coupon/update"), params);
  }

  /**
   * 结束优惠卷
   */
  fetchCouponOver(params: DeleteCouponRequest) {
    return requestClient.post(this.getServiceUrl("/coupon/update"), params);
  }

  /**
   * 删除优惠卷
   */
  fetchCouponDelete(params: DeleteCouponRequest) {
    return requestClient.post(this.getServiceUrl("/coupon/delete"), params);
  }

  /**
   * 增长优惠卷
   */
  fetchCouponStockAdd(params: DeleteCouponRequest) {
    return requestClient.post(this.getServiceUrl("/coupon/stock_add"), params);
  }

  
}

export const promotionApi: PromotionApi = new PromotionApi('/media')
