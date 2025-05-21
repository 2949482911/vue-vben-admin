import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {OrderReportParams, OrderReportResponse} from "#/api/models/media/report";

// order report api
class OrderReportApi extends BaseApi {

  /**
   * order report
   * @param params
   */
  fetchOrderReport(params: OrderReportParams): Promise<OrderReportResponse> {
    return requestClient.post(this.getServiceUrl("order"), params)
  }
}

export const orderReportApi = new OrderReportApi("/media/report");
