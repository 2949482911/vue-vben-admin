import { BaseApi } from "#/api/core/baseapi";
import {requestClient} from '#/api/request';

import type {
  BytedanceAwemeAuthListRequest,
  BytedanceDpaProductAvailablesItem,
  BytedanceDpaProductAvailablesRequest,
  BytedanceDpaProductListItem,
  BytedanceDpaProductListRequest,
  BytedanceEventManagerOptimizedGoalGetGoal,
  BytedanceOptimizedGoalRequest, BytedanceToolsAwemeAuthListList
} from "#/api/models/bytedance";


/**
 * 巨量引擎广告API
 */
class BytedanceAdvertisementApi extends BaseApi {


  /**
   * 获取账户可用的优化目标
   */
  fetchOptimizedGoalList(data: BytedanceOptimizedGoalRequest) {
    return requestClient.post<Array<BytedanceEventManagerOptimizedGoalGetGoal>>(this.getServiceUrl("goal_list"), data);
  }


  /**
   * 获取授权的抖音账户
   * @param data
   */
  fetchAewmeAuthList(data: BytedanceAwemeAuthListRequest) {
    return requestClient.post<Array<BytedanceToolsAwemeAuthListList>>(this.getServiceUrl("aweme_list"), data);
  }


  /**
   * 获取商品库列表
   */
  fetchDpaProductAvailables(data: BytedanceDpaProductAvailablesRequest) {
    return requestClient.post<Array<BytedanceDpaProductAvailablesItem>>(this.getServiceUrl("dpa_product_availables"), data);
  }

  /**
   * 获取商品库中的商品列表
   */
  fetchDpaProductList(data: BytedanceDpaProductListRequest) {
    return requestClient.post<Array<BytedanceDpaProductListItem>>(this.getServiceUrl("dpa_product_list"), data);
  }
}


export const bytedanceAdvertisementApi: BytedanceAdvertisementApi = new BytedanceAdvertisementApi("/platform/bytedance_advertisement");
