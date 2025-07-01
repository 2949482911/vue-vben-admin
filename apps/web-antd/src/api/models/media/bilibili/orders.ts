import type {IdName} from "#/api/models";

export interface BilibiliOrderDetail {
  order: BilibiliOrder;
  skus: Array<BilibiliOrderSku>;
}

export interface BilibiliOrder {
  order_id: string;
  order_level: number;
  order_type: number;
  order_status: number;
  pay_time: string;
  ship_time: string;
  finish_time: string;
  create_time: string;
  update_time: string;
  cancel_reason: string;
  buyer_words: string;
  order_mark_list: string;
  shop_flag: number;
  pay_type: number;
  channel_payment_no: string;
  order_amount: number;
  pay_amount: number;
  post_amount: number;
  modify_amount: number;
  promotion_amount: number;
  post_tel: string;
  post_receiver: string;
  post_addr: {
    province: IdName,
    city: IdName,
    town: IdName,
    detail: string;
  };
  send_time: string;
  logistics_info: Array<{
    tracking_no: string;
    company: string;
    company_name: string;
    product_info: Array<{
      sku_id: string;
      product_count: number;
      sku_order_id: string;
    }>
  }>;
  post_origin_amount: number;
  tax_amount: number;
  merge_relation_id: string;
  open_id: string;
  uname: string;
  up_id: string;
  up_name: string;
  confirm_status: string;
  user_id_info: {
    encrypt_id_card_no: string;
    encrypt_id_card_name: string;
    phone_no: string;
  }
}


export interface BilibiliOrderSku {
  order_id: string;
  parent_order_id: string;
  goods_price: number;
  order_level: number;
  order_type: number;
  order_status: number;
  pay_time: string;
  finish_time: string;
  create_time: string;
  update_time: string;
  cancel_reason: string;
  author_id: string;
  author_name: string;
  promotion_amount: number;
  exp_ship_time: string;
  goods_type: number;
  product_id: string;
  sku_id: string;
  spec: string;
  cate_id: string;
  origin_amount: number;
  item_num: number;
  sum_amount: number;
  promotion_detail: {
    promotion_info_List: Array<{
      discount_info: {
        discount_type: number;
        coupon_type: number;
        discount_id: number;
        discount_name: string;
        discount_amount: number;
        discount_origin_amount: number;
        step: number;
        target_scene_id: number;
        coupon_id: number;
      };
      settle_info: {
        ratio_type: number;
        suppler_activity_id: string;
        coupon_settle_type: number;
        crystal_num: number;
        reduction_magic_stone: number;
        show_name: string;
        activity_merged: number;
        layer: number;
      }
    }>;

  };
  product_pic: string;
  is_comment: number;
  product_name: string;
  post_amount: number;
  after_sale_info: {
    refund_status: number;
  };
  relation_order: {
    relation_order_id: string;
  };
  receive_type: number;
  product_id_str: string;
  account_list: {
    account_info: Array<{
      account_name: string;
      account_type: string;
      account_id: string;
    }>;
  };
  tax_amount: number;
  order_phase_list: Array<{
    phase_order_id: string;
    total_phase: number;
    current_phase: number;
    pay_success: boolean;
    sku_order_id: string;
    phase_pay_type: string;
    phase_pay_time: string;
    channel_payment_no: number;
    phase_pay_amount: number;
    current_phase_status_desc: string;
  }>;
  shop_code: string;
}
