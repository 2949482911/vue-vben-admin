import {BaseApi} from "#/api/core/baseapi";
import type {
  OrderItem,
  OrderPrams,
  ReturnOrderItem,
  ReturnOrderParams
} from "#/api/models/media/orders";
import {requestClient} from '#/api/request';


class OrderApi extends BaseApi {
  /**
   * order list
   * @param params
   */
  fetchOrderList(params: OrderPrams) {
    return requestClient.get<OrderItem[]>("list", {params})
  }
}

export const orderApi: OrderApi = new OrderApi("/media/order")


class ReturnOrderApi extends BaseApi {

  /**
   * 退货单
   * @param params
   */
  fetchGetReturnOrderList(params: ReturnOrderParams) {
    return requestClient.get<ReturnOrderItem[]>("order/list", {params})
  }

}

export const returnOrderApi: ReturnOrderApi = new ReturnOrderApi("/media/return")
