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
  MediaItemDetailResponse, MediaStockChangeRequest, PlatformQualificationParams
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
    return requestClient.get<MediaItemItem[]>(this.getServiceUrl("list"), {params});
  }


  /**
   * 库存
   */
  fetchStockAdd(params: MediaStockChangeRequest) {
    return requestClient.post(this.getServiceUrl("stock_add"), params)
  }

  /**
   * get item detail
   * @param params
   */
  fetchItemDetail(params: MediaItemDetailRequest) {
    return requestClient.get<MediaItemDetailResponse>(this.getServiceUrl("detail"), {params});
  }
}

export const itemApi = new ItemApi("/media/item")

/**
 * 商品发布
 */
class ItemPushConfigApi extends BaseApi {

  /**
   * 获取资质配置
   */
  fetchPlatformQualificationConfig(params: PlatformQualificationParams) {
    return requestClient.get<any>(this.getServiceUrl("qualification/config"), {params});
  }

  /**
   * 类目配置
   * @param params
   */
  fetchPlatformCategoryConfig(params: PlatformQualificationParams) {
    return requestClient.get<any>(this.getServiceUrl("category/config"), {params});
  }
}



export const itemPushConfigApi = new ItemPushConfigApi("/media/push_item_base_config")
