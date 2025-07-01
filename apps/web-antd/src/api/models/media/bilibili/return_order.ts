export interface ReturnAddress {
  detail: string;
}

export interface IdName {
  id: string;
  name: string;
}

export interface PostAddr {
  detail: string;
  province: IdName;
  city: IdName;
  area: IdName;
}

export interface ExchangeSkuInfo {
  sku_id: string;
  num: number;
  url: string;
  name: string;
  price: number;
  specDesc: string;
}


export interface ArbitrateInfo {
  arbitrate_id: string;
  arbitrate_status: number;
  arbitrate_status_deadline: string;
  arbitrate_create_time: string;
  arbitrate_update_time: string;
}

export interface ReturnLogistics {
  tracking_no: string;
  company_name: string;
  company_code: string;
  logistics_time: Array<string>;
}

export interface ExchangeLogistics {
  tracking_no: string;
  company_name: string;
  company_code: string;
  logistics_time: Array<string>;
}

export interface LogisticsInfo {
  return_logistics: ReturnLogistics;
  exchange_logistics: ExchangeLogistics;
}

export interface RecordLogsList {
  operator: string;
  time: string;
  text: string;
  images: Array<string>;
  action: string;
  role: number;
  desc_kvs: Array<any>;
}


export interface SkuOrderInfo {
  sku_order_id: string;
  item_quantity: number;
  create_time: string;
  product_name: string;
  product_id: string;
  product_image: string;
  sku_id: string;
  sku_refund_amount: string;
  after_sale_item_num: number;
  price: number;
}

export interface OrderInfo {
  shop_order_id: string;
  sku_order_infos: SkuOrderInfo
}

/**
 * return order detail
 */
export interface BilibiliReturnOrder {
  after_sale_id: string;
  order_id: string;
  after_sale_status: number;
  after_sale_status_text: string;
  refund_type: number;
  refund_type_text: string;
  refund_status: number;
  refund_amount: number;
  refund_post_amount: number;
  apply_time: string;
  update_time: string;
  reason: string;
  after_sale_type: number;
  after_sale_type_text: string;
  reason_remark: string;
  evidence: Array<string>;
  after_sale_apply_count: number;
  return_address: ReturnAddress;
  post_address: PostAddr;
  real_refund_amount: number;
  got_pkg: number;
  status_deadline: string;
  exchange_sku_info: ExchangeSkuInfo;
  part_type: number;
  refund_fail_reason: string;
  apply_role: number;
  refund_time: string;
  return_method: number;
  arbitrate_info: ArbitrateInfo;
  logistics_info: LogisticsInfo;
  record_logs_list: Array<RecordLogsList>;
  order_info: OrderInfo;
}


export interface BilibiliReturnOrderSku{
  after_sale_id: string;
  order_id: string;
  price: number;
  item_quantity: number;
  create_time: string;
  product_name: string;
  product_id: string;
  product_image: string;
  sku_id: string;
  after_sale_item_num: number;
  sku_refund_amount: number;
}
