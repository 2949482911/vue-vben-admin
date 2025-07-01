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

/**
 * 快手order
 */

export interface RechargeAccountExtInfoDTO {
  rechargeAccount: string;
  rechargeAccountType: string;
  rechargeAccountTypeDesc: string;
  desensitiseRechargeAccount: string;
  encryptedRechargeAccount: string;
}

export interface RechargeAccountDTO {
  account: string;
  accountType: number;
  accountTypeDesc: string;
  desensitiseAccount: string;
  encryptedAccount: string;
  accountExt: RechargeAccountExtInfoDTO
}

export interface OrderSellerRoleInfo {
  roleType: number;
  roleId: string;
  roleName: string;
}

export interface GovIndustryPromoInfo {
  areaName: string;
  activityCode: string;
  supplierId: string;
  supplierName: string;
}

export interface CoordinateInfo {
  longitude: string;
  latitude: string;

}

export interface OrderPaymentStepInfo {
  id: string;
  payStepType: number;
  payStepNo: number;
  payStepName: string;
  payStepStatus: number;
  stepPrice: string;
  skuNum: string;
  stepTotalPrice: string;
  discountFee: string;
  expressFee: string;
  paymentFee: string;
  payTime: string;
  payChannelDesc: string;
  startPayTime: string;
  endPayTime: string;
}

export interface LogisticsInfoSerialNumberInfo {
  serialType: Array<number>;
  serialNumberList: Array<string>;
  imeiList: Array<string>;
  serialRequireQuantity: Array<number>;
}

export interface OrderDeliveryInfo {
  maxPackageNum: number;
  enableAppendPackage: boolean;
  totalPackageNum: number;
  deliveryNum: number;
  packageNum: number;
  splitDeliveryOrder: boolean;
  deliveryStatus: number;
  serialNumberInfo: LogisticsInfoSerialNumberInfo
}

export interface OrderNoteInfo {
  createTime: string;
  note: string;
  flagTagCode: string;
  operatorName: string;
}

export interface SubOrderDetailBaseInfo{
  oid: string;
  status: number;
  sendTime: string;
  updateTime: string;
  recvTime: string;
}

export interface SubOrderItemInfo{
  skuId: string;
  relSkuId: string;
  skuDesc: string;
  skuNick: string;
  itemId: string;
  relItemId: string;
  itemTitle: string;
  itemLinkUrl: string;
  itemPicUrl: string;
  num: number;
  originalPrice: string;
  discountFee: string;
  price: string;
  itemType:number;
  itemPrevInfo: OrderItemPrevInfo,

  goodsCode: string;
  warehouseCode: string;
  serviceInfo: ServiceInfo;
  itemExtra: ItemExtra;
}

export interface SubOrderDetail{
  subOrderBaseInfo: SubOrderDetailBaseInfo;
  subOrderItemInfo: SubOrderItemInfo;
  subOrderLogisticsInfo:OrderLogisticsInfo[],
  subOrderDeliveryInfo: SubOrderDeliveryInfo,
  subOrderType: number;
}


// order info
export interface KuaiShouOrder {
  // base info
  oid: string;
  payTime: string;
  buyerImage: string;
  buyerOpenId: string;
  buyerNick: string;
  sellerOpenId: string;
  sellerNick: string;
  expressFee: string;
  discountFee: string;
  totalFee: string;

  status: number;

  sendTime: string;
  refundTime: string;

  createTime: string;
  updateTime: string;

  remark: string;

  theDayOfDeliverGoodsTime: string;
  promiseTimeStampOfDelivery: string;

  activityType: number;
  cpsType: number;
  validPromiseShipmentTimeStamp: string;
  preSale: number;
  recvTime: string;
  coType: number;
  commentStatus: number;
  payType: number;
  riskCode: string;
  payChannel: string;
  sellerDelayPromiseTimeStamp: string;
  priorityDelivery: boolean;
  remindShipmentSign: number;
  remindShipmentTime: string;
  orderSellerRoleInfo: OrderSellerRoleInfo;
  disableDeliveryReasonCode: number[];
  multiplePiecesNo: string;
  allActivityType: number[];
  orderLabels: number[];
  enableSplitDeliveryOrder: boolean;
  allowanceExpressFee: string;
  payChannelDiscount: string;
  tradeInPayAfterPromoAmount: string;
  governmentDiscount: string;
  govIndustryPromoInfo: GovIndustryPromoInfo;
  channel: string;
  privacyInfoAuthTime: string;
  privacyInfoAuthStatus: number;
  carrierId: string;
  carrierType: number;
  platformNewBuyer: boolean;
  shopNewBuyer: boolean;

  // Item Info 部分
  skuId: string;
  relSkuId: string;
  skuDesc: string;
  skuNick: string;
  itemId: string;
  relItemId: string;
  itemTitle: string;
  itemLinkUrl: string;
  itemPicUrl: string;
  num: number;
  originalPrice: string;
  orderItemDiscountFee: string;
  price: string;
  itemType: number;
  goodsCode: string;
  warehouseCode: string;
  orderItemId: string;
  goodStoreCode: string;

  // 地址信息部分
  encryptedConsignee: string;
  desensitiseConsignee: string;
  encryptedMobile: string;
  desensitiseMobile: string;
  provinceCode: string;
  province: string;
  cityCode: string;
  city: string;
  districtCode: string;
  district: string;
  townCode: string;
  town: string;
  encryptedAddress: string;
  desensitiseAddress: string;
  rechargeAccount: RechargeAccountDTO;
  coordinateInfo: CoordinateInfo;

  // 阶段详情和发货信息
  orderPaymentStepInfos: OrderPaymentStepInfo[];
  orderDeliveryInfo: OrderDeliveryInfo;
  orderNoteInfo: OrderNoteInfo[];

  //
  subOrderDetail: SubOrderDetail[]
}


export interface OrderItemPrevInfo {
  skuId: string;
  relSkuId: string;
  skuDesc: string;
  skuNick: string;
}

export interface CompensateFake {
  times: number;
  desc: string;
  link: string;

}

export interface ServiceRuleInfoDTO {
  depositRule: string;
  refundRule: string;
  deliverGoodsIntervalTime: string;
  theDayOfDeliverGoodsTime: string;
  saleFlag: boolean;
  promiseDeliveryTime: string;
  deliveryMethod: string;
  supportVerification: number;
  certMerchantCode: string;
  certExpireType: number;
  certStartTime: string;
  certEndTime: string;
  certExpDays: string;
}

export interface ServiceInfo {
  serviceRule: string;
  freight: boolean;
  freightProviderType: number;
  firstOrderGuarantee: boolean;
  instantDelivery: number;
  instantRefund: boolean;
  compensateFake: CompensateFake
  serviceRuleInfo: ServiceRuleInfoDTO
}

export interface CategoryInfo {
  itemCid: string;
  categoryName: string;
  govCategory: string;
  govCategoryCode: string;

}

export interface ItemExtra {
  categoryInfo: CategoryInfo,
  energyLevel: string;
  productNo: string;
  brandName: string;

}

export interface SubOrderDeliveryInfo {
  deliveryNum: number;
  packageNum: number;
  splitDeliveryOrder: boolean;
  deliveryStatus: number;
}

export interface OrderLogisticsInfo {
  expressNo: string;
  expressCode: string;
  logisticsId: string;
}

// sku
export interface KuaiShouOrderSku {
  // base info
  oid: string;
  status: number;
  sendTime: string;
  updateTime: string;
  recvTime: string;

  // Item Info 部分
  skuId: string;
  relSkuId: string;
  skuDesc: string;
  skuNick: string;
  itemId: string;
  relItemId: string;
  itemTitle: string;
  itemLinkUrl: string;
  itemPicUrl: string;
  num: number;
  originalPrice: string;
  discountFee: string;
  price: string;
  itemType: number;
  itemPrevInfo: OrderItemPrevInfo;
  goodsCode: string;
  warehouseCode: string;
  serviceInfo: ServiceInfo;
  itemExtra: ItemExtra;

  // 子订单部分
  subOrderDeliveryInfo: SubOrderDeliveryInfo;
  subOrderType: number;
  orderLogisticsInfo: OrderLogisticsInfo[];
}


export interface OrderDetailRequest {
  platform: string;
  platformOrderId: string;
  localAccountId: string;
}
