/**穿山甲商品查询 */
export interface CreateSystemMetric {
  page: number,
  pageSize: number,
  appId: string,
  appSecret: string,
  title: string,
  priceMin: number,
  priceMax: number,
  sellNumMin: number,
  sellNumMax: number,
  searchType: number,
  orderType: number,
  cosFeeMin: number,
  cosFeeMax: number,
  cosRatioMin: number,
  cosRatioMax: number,
  activityId: number
}

/**穿山甲商品列表 */
export interface ProductPangolinItem {
  activity_id: number;
  cos_fee: number;
  cos_ratio: number;
  coupon_price: string;
  cover: string;
  detail_url: string;
  ext: string;
  first_cid: string;
  in_stock: boolean;
  is_kol_product: boolean;
  limit_min_sale: boolean;
  post_free: boolean;
  price: string;
  product_id: string;
  sales: string;
  second_cid: string;
  shop_id: string;
  shop_name: string;
  third_cid: string;
  title: string;
}

