import type {BilibiliReturnOrder, BilibiliReturnOrderSku} from "#/api/models";

export interface MediaReturnOrderDetailRequest {
  platform: string;
  orderId: string;
  localAccountId: string;
}



export interface MediaReturnOrderDetailResponse<I, S> {
  order: I;
  skus: Array<S>;
}


/**
 * 哔哩哔哩退货单详情
 */
export interface BilibiliReturnOrderDetailResponse extends MediaReturnOrderDetailResponse<BilibiliReturnOrder, BilibiliReturnOrderSku> {

}
