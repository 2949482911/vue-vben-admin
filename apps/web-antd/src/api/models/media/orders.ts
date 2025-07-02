import type {PageRequestParams} from "#/api/models/core";


export interface OrderPrams extends PageRequestParams {
  platform: string;
  platformOrderNo: string;
  platformOrderId: string;
  orderType: number;
  orderStatus: number;
  payType: number;
}


export interface OrderItem {
  localAccountId: string;
  accountId: string;
  platform: string;
  platformOrderId: string;
  platformOrderNo: string;
  payTime: string;
  buyerOpenId: string;
  buyerNickname: string;
  expressFee: number;
  discountFee: number;
  orderStatus: number;
  orderType: number;
  orderLevel: number;
  sendTime: string;
  refundTime: string;
  finishTime: string;
  orderCreateTime: string;
  orderUpdateTime: string;
  buyerRemark: string;
  payType: number;
  remindShipmentSign: number;
  cancelReason: string;
  orderAmount: number;
  payAmount: number;
  postAmount: number;
  modifyAmount: number;
  promotionAmount: number;
}


export interface ReturnOrderParams extends PageRequestParams {
  platformSkuId: string;
  platform: string;
}

export interface ReturnOrderItem {
  localAccountId: string;
  accountId: string;
  platform: string;
  platformRefundId: string;
  handlingWay: number;
  negotiateStatus: number;
  refundFee: number;
  platformSkuId: string;
  refundReason: number;
  returnStatus: number;
  buyerId: string;
  refundType: number;
  refundDesc: string;
  submitTime: string;
  relItemId: string;
}


export interface OrderDetailRequest {
  platform: string;
  platformOrderId: string;
  localAccountId: string;
}


/**
 * 媒体订单详情
 */
export interface MediaOrderDetailResponse<I, S> {
  order: I;
  skus: Array<S>;
}
