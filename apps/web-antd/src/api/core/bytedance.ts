import { BaseApi } from "#/api/core/baseapi";
import { requestClient } from "#/api/request";

import type {
  BytedanceAssetsRequest,
  BytedanceAwemeAuthListRequest,
  BytedanceDpaClueProduct,
  BytedanceDpaClueProductListRequest,
  BytedanceDpaProductAvailablesItem,
  BytedanceDpaProductAvailablesRequest,
  BytedanceDpaProductListItem,
  BytedanceDpaProductListRequest,
  BytedanceEventAllAssetsList,
  BytedanceEventManagerOptimizedGoalGetGoal,
  BytedanceOptimizedGoalRequest,
  BytedanceToolsAwemeAuthListList
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


  /**
   * 升级版商品获取
   * @param data
   */
  fetchBytedanceDpaClueProduct(data: BytedanceDpaClueProductListRequest) {
    return requestClient.post<Array<BytedanceDpaClueProduct>>(this.getServiceUrl("dpa_clue_product_list"), data);
  }


  /**
   * 获取资产列表
   * @param data
   */
  fetchBytedanceAssertsList(data: BytedanceAssetsRequest) {
    return requestClient.post<Array<BytedanceEventAllAssetsList>>(this.getServiceUrl("assets_list"), data);
  }
}


export const bytedanceAdvertisementApi: BytedanceAdvertisementApi = new BytedanceAdvertisementApi("/platform/bytedance_advertisement");
