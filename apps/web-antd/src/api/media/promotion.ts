/**
 * 营销卷
 */
import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
    CouponCreateRequest,
    CouponItem,
    CouponParams,
    CouponUpdateRequest, CrowdItem, CrowdParams, DeleteCouponRequest
} from "#/api/models/media/promotion";

class CouponApi extends BaseApi {

    /**
     * 卷列表
     * @param params
     */
    fetchCouponList(params: CouponParams): Promise<CouponItem[]> {
        return requestClient.get<CouponItem[]>(this.getServiceUrl("list"), {params: params});
    }


    fetchCouponCreate(params: CouponCreateRequest) {
        return requestClient.post(this.getServiceUrl("create"), params);
    }


    fetchCouponUpdate(params: CouponUpdateRequest) {
        return requestClient.post(this.getServiceUrl("update"), params);
    }

    /**
     * 结束优惠卷
     */
    fetchCouponOver(params: DeleteCouponRequest) {
        return requestClient.post(this.getServiceUrl("update"), params);
    }

    /**
     * 删除优惠卷
     */
    fetchCouponDelete(params: DeleteCouponRequest) {
        return requestClient.post(this.getServiceUrl("delete"), params);
    }

    /**
     * 增长优惠卷
     */
    fetchCouponStockAdd(params: DeleteCouponRequest) {
        return requestClient.post(this.getServiceUrl("stock_add"), params);
    }

}

export const couponApi: CouponApi = new CouponApi('/media/coupon')


/**
 * 人群包
 */
class CrowdApi extends BaseApi {

    /**
     * 卷列表
     * @param params
     */
    fetchCrowdList(params: CrowdParams): Promise<CrowdItem[]> {
        return requestClient.get<CrowdItem[]>(this.getServiceUrl("list"), {params: params});
    }

}

export const crowdApi: CrowdApi = new CrowdApi('/media/crowd')
