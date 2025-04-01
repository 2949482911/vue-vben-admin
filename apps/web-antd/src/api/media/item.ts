import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  BrandParams,
  BrandItem,
  CategoryParams,
  CategoryItem,
  MediaItemParams,
  MediaItemItem,
  CategoryTreeParams,
  MediaItemDetailRequest,
  MediaItemDetailResponse
} from "#/api/models/media/item";


/**
 * 品牌
 */
class BrandApi extends BaseApi {

  fetchBrandList(params: BrandParams): Promise<BrandItem> {
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
  fetchCategoryList(params: CategoryParams): Promise<CategoryItem> {
    return requestClient.get<CategoryItem[]>(this.getServiceUrl("list"), {params});
  }

  /**
   * get category tree
   * @param params
   */
  fetchCategoryTree(params: CategoryTreeParams) {
    return requestClient.post<CategoryItem[]>(this.getServiceUrl("tree"), params);
  }
}

export const categoryApi = new CategoryApi("/media/category")


/**
 * 商品
 */
class ItemApi extends BaseApi {
  /**
   * 商品
   * @param params
   */
  fetchGetItemList(params: MediaItemParams): Promise<MediaItemItem[]> {
    return requestClient.get<MediaItemItem[]>(this.getServiceUrl("/list"), {params});
  }


  /**
   * 库存
   */
  fetchStockAdd() {

  }

  /**
   * get item detail
   * @param params
   */
  fetchItemDetail(params: MediaItemDetailRequest) {
    return requestClient.get<MediaItemDetailResponse>(this.getServiceUrl("detail"), {params});
  }
}


/**
 * 商品发布
 */
class ItemPushConfigApi extends BaseApi {

  /**
   * 获取类目配置
   */
  fetchCategoryConfig() {

  }
}

export const itemApi = new ItemApi("/media/item")
