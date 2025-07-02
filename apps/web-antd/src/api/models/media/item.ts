import type {BaseItem, PageRequestParams} from "#/api/models/core";
import type {KuaishouItemDetail, KuaishouItemSku, KuaiShouPushItem} from './kuaishou/kuaishou'


export interface BrandParams extends PageRequestParams {
  platform: string;
  name: string;
  nameEn: string;
}

export interface BrandItem extends BaseItem {
  platform: string;
  name: string;
  nameEn: string;
}


export interface CategoryParams extends PageRequestParams {
  platform: string;
  name: string;
  accountId: string;
}

export interface CategoryTreeParams {
  platform: string;
  accountIds: Array<string>;
}


export interface CategoryItem extends BaseItem {
  platform: string;
  platformCategoryId: string;
  platformCategoryName: string;
  platformCategoryPid: string;
  children: Array<CategoryParams>;
}


/**
 * item
 */

export interface MediaItemParams extends PageRequestParams {
  platform: string;
  title: string;
}


export interface MediaItemItem extends BaseItem {
  platform: string;
  platformItemId: string;
  localAccountId: string;
  relItemId: string;
  platformAccountId: string;
  title: string;
  platformCategoryId: string;
  imageUrls: string;
  purchaseLimit: boolean;
  details: string;
  itemRemark: string;
  payWay: number;
  shortTitle: string;
  sellingPoint: string;
  skus: Array<MediaItemSku>;
  skuCount: number;
}


export interface MediaItemSku extends BaseItem {
  platformItemId: string;
  platformSkuId: string;
  storeId: string;
  relSkuId: string;
  skuStock: string;
  skuSalePrice: number;
  imageUrl: string;
  skuNick: string;
  isValid: boolean;

}

export interface UpdateStock {
  platformSkuId: string
  platformItemId: string;
  localAccountId: string;
  type: number;
  stock: number;

  [key: any]
}

export interface MediaStockChangeRequest {
  platform: string;
  updateItem: Array<UpdateStock>;
}


export interface MediaItemDetailRequest {
  platform: string;
  localAccountId: string;
  platformSkuId: string;
  // not request
  platformSkuName: string;
}


/**
 * media item detail basis
 */
export interface MediaItemDetailResponse<I, S> {
  item: I;
  skus: Array<S>;
}


/**
 * kuaishou item detail
 */
export interface KuaishouItemDetailResponse extends MediaItemDetailResponse <KuaishouItemDetail, KuaishouItemSku> {

}


/**
 * 媒体资质参数
 */
export interface PlatformQualificationParams {
  platform: string;
  platformCategoryId: string;
  localAccountId: string;
}


/**
 * create item
 */
export interface PushItemParamsCreate<T> {
  localAccountId: string;
  items: Array<T>
}


/**
 * 媒体创建商品参数
 */
export interface PlatformItemPushParams {
  platform: string;
  itemList: Array<PushItemParamsCreate>;
}


/**
 * 快手 参数传递
 */
export interface KuaiShouPushItemPrams extends PushItemParamsCreate<KuaiShouPushItem> {
}


