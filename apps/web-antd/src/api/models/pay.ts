import type { BaseItem } from '#/api/models/core';

export interface OrderSearchParams {
  orderNo: string;
  orderStatus: number;
}

export interface OrderItem extends BaseItem {
  payId: string;
  thirdOrderNo: string;
  orderNo: string;
  money: number;
  realityMoney: number;
  params: object;
  type: number;
  returnSuccess: boolean;
  payQrCode: string;
  payQcImage: string;
  closeDate: string;
  orderStatus: number;
  responseCode: number;
  responseMessage: string;
}
