import type {BaseItem, PageRequestParams} from "#/api/models/core";


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
  platform: string;
  platformItemId;
  platformAccountId;

}

export interface MediaStockChangeRequest {
  platform: string;
  updateItem: Array<UpdateStock>;
}


export interface MediaItemDetailRequest {
  platform: string;
  localAccountId: string;
  platformItemId: string;
}


export interface MediaItemDetailResponse {
  item: any;
  skus: Array<any>;
}

