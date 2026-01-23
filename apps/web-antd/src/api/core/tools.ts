import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from "#/api/request";
import type {CreateSystemMetric} from "#/api/models/tools";

/**
 * 穿山甲商品
 */
class PangolinApi extends BaseApi {
  fetchPangolinProducts(params: CreateSystemMetric) {
    return requestClient.post(this.getServiceUrl("csjp/product/search"), params)
  }
}

export const pangolinApi = new PangolinApi("/csjp");
