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
    return requestClient.get<OrderItem[]>(this.getServiceUrl("list"), {params})
  }

  /**
   * order detail
   * @param platform
   * @param orderId
   */
  fetchOrderDetail(platform: string, orderId: string) {
    return requestClient.get(this.getServiceUrl("detail"), {params: {platform, orderId}})
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
