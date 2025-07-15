import type {MediaOrderDetailResponse} from "#/api/models";

export interface RedNoteOrder {
  orderId: string;
  orderType: number;
  orderStatus: number;
  orderAfterSalesStatus: number;
  cancelStatus: number;
  createdTime: string;
  paidTime: string;
  updateTime: string;
  deliveryTime: string;
  cancelTime: string;
  finishTime: string;
  promiseLastDeliveryTime: string;
  planInfoId: string;
  planInfoName: string;
  receiverCountryId: string;
  receiverCountryName: string;
  receiverProvinceId: string;
  receiverProvinceName: string;
  receiverCityId: string;
  receiverCityName: string;
  receiverDistrictId: string;
  receiverDistrictName: string;
  customerRemark: string;
  sellerRemark: string;
  sellerRemarkFlag: number;
  presaleDeliveryStartTime: string;
  presaleDeliveryEndTime: string;
  originalOrderId: string;
  totalNetWeightAmount: number;
  orderAmount: number;
  totalPayAmount: number;
  totalShippingFree: number;
  unpack: boolean;
  expressTrackingNo: string;
  expressCompanyCode: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  openAddressId: string;
  boundExtendInfo: any; // 替换为实际DTO类型
  transferExtendInfo: any; // 替换为实际DTO类型
  simpleDeliveryOrderList: {
    deliveryOrderIndex: number;
    status: number;
    expressTrackingNo: string;
    expressCompanyCode: string;
    itemIdList: string[];
    skuIdList: string[];
  }[]; // 替换为实际DTO类型
  logistics: string;
  totalDepositAmount: number;
  totalMerchantDiscount: number;
  totalRedDiscount: number;
  merchantActualReceiveAmount: number;
  totalChangePriceAmount: number;
  paymentType: number;
  whcode: string;
  userId: string;
  orderTagList: string[];
  logisticsMode: number;
  customsCode: string;
  outPromotionAmount: number;
  outTradeNo: string;
  subsidySupplierId: string;
  subsidySupplierName: string;
}


export interface RedNoteOrderSku {
  skuId: string;
  name: string;
  itemId: string;
  ipq: number;
  originalPrice: number;
  price: number;
  stock: number;
  logisticsPlanId: string;
  whcode: string;
  priceType: number;
  erpCode: string;
  variants: {
    id: string;
    name: string;
    value: string;
    valueId: string;
  }[]; // 替换为 FlsSkuDetail.VariantV3 的具体类型
  deliveryTime: any; // 替换为 FlsSkuDetail.DeliveryTimeV3 的具体类型
  specImage: string;
  barcode: string;
  rowNumber: number;
  logisticsName: string;
  buyable: boolean;
  updateTime: Date;
  createTime: Date;
  isGift: boolean;
  deliveryFlag: number;
  unionItemDetails: {
    id: string;
    name: string;
    scSkuCode: string;
    barcode: string;
    ipq: number;
    erpCode: string;
    ratio: number;
  } [];
}


/**
 * 订单详情
 */
export interface RedNoteOrderItemDetail extends MediaOrderDetailResponse<RedNoteOrder, RedNoteOrderSku>{

}
