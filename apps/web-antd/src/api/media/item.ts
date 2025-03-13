import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  BrandParams,
  BrandItem,
  CategoryParams,
  CategoryItem,
  MediaItemParams, MediaItemItem
} from "#/api/models/media/item";


/**
 * 品牌
 */
class BrandApi extends BaseApi {

  fetchBrandList(params: BrandParams): Promise<BrandItem>{
    return requestClient.get<BrandItem[]>(this.getServiceUrl("/list"), {
      params
    })
  }
}

export const brandApi = new BrandApi("/media/brand")


/**
 * 分类
 */
class CategoryApi extends BaseApi {
  fetchCategoryList(params: CategoryParams) : Promise<CategoryItem> {
    return requestClient.get<CategoryItem[]>(this.getServiceUrl("list"), {params});
  }
}

export const categoryApi = new CategoryApi("/media/category")


/**
 * 商品
 */
class ItemApi extends BaseApi {
  fetchGetItemList(params: MediaItemParams) : Promise<MediaItemItem[]> {
    return requestClient.get<MediaItemItem[]>(this.getServiceUrl("/list"), {params});
  }
}

export const itemApi = new ItemApi("/media/item")
