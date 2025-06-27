/**
 * b站商品详情
 */
import type {MediaItemDetailResponse} from "#/api/models";

export interface AfterSaleService {
  supply_day_return_selector: string;
}

export interface BilibiliValues {
  value_name: string;
}

export interface SpecValues {
  property_name: string;
  values: Array<BilibiliValues>;
}

export interface SpecInfo {
  spec_values: Array<SpecValues>
}


export interface BilibiliItem {
  product_id: string;
  category_leaf_id: string;
  name: string;
  pic: Array<string>;
  description: Array<string>;
  text_description: string;
  freight_id: string;
  delivery_delay_day: string;
  presell_type: number;
  limit_per_buyer: number;
  product_format: string;
  after_sale_service: AfterSaleService,
  spec_info: SpecInfo,
  status: number;
  recycling_status: number;
  create_time: string;
  update_time: string;
  delivery_time: string;
  sale_step: number;

}

export interface SellProperties {
  property_name: string;
  value_name: string;
}

export interface BilibiliItemSku {
  sku_id: string;
  stock_num: number;
  price: number;
  code: string;
  sell_properties: Array<SellProperties>
}


// 商品详情返回
export interface BilibiliItemDetailResponse extends MediaItemDetailResponse <BilibiliItem, BilibiliItemSku> {

}
