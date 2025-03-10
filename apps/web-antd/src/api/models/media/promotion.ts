import type {BaseItem, PageRequestParams} from "#/api/models/core";

export interface CouponParams extends PageRequestParams {
  platform: string;
}


export interface CouponItem extends BaseItem {
  platform: string;
  platformCouponId: string;
  localAccountId: string;
  platformAccountId: string;
  name: string;
  validStartTime: string;
  outerUniqueKey: string;
  itemIds: Array<string>;
  fixedValidityTime: string;
  receiveChannel: string;
  reduceAmount: number;
  receiveStartTime: string;
  threshold: string;
  couponTargetType: number;
  extInfo: string;
  validityType: number;
  validEndTime: string;
  receiveEndTime: string;
  totalStock: number;
  receivePerLimit: number;
  couponFrontType: number;
  mediaStatus: number;
  couponCirculation: number;
  couponReceiveNum: number;
  usedCouponOrderPayAmt: number;
  couponReceiveUserCnt: number;
  couponUsedNum: number;
  couponUsedUserCnt: number;
  usedCouponAmt: number;
  usedCouponOrderRealPayAmt: number;
}


export interface CouponCreateRequest {
  accountId: string;
  platform: string;
  name: string;
  itemIds: Array<string>;
  validStartTime: string;
  fixedValidityTime: string;
  receiveChannel: string;
  reduceAmount: number;
  receiveStartTime: string;
  threshold: number;
  couponTargetType: number;
  extInfo: string;
  validityType: number;
  validEndTime: string;
  receiveEndTime: string;
  totalStock: number;
  receivePerLimit: number;
  couponFrontType: number;
}

export interface CouponUpdateRequest extends CouponCreateRequest{
  id: string;
}

/**
 * 批量
 */
export interface MediaAccountDeleteCoupon {
  accountId: string;
  couponId: string;
  incrementNum: number;
}

export interface DeleteCouponRequest {
  platform: string;
  mediaAccountDeleteCoupons: MediaAccountDeleteCoupon
}
