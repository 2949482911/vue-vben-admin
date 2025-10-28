import {BaseApi} from "#/api/core/baseapi";
import type {
  AdvertiserItem,
  AdvertiserPageRequest,
  AuthAdvertiserRequest, CreateAdvertiserRequest,
  CreateDeveloperRequest,
  DeveloperItem,
  DeveloperPageRequest, UpdateAdvertiserRequest, UpdateDeveloperRequest
} from "#/api/models/marketing";
import {requestClient} from "#/api/request";
import type {BatchOptions} from "#/api/models/core";


/**
 * 开发者
 */
class DeveloperApi extends BaseApi {
  fetchDeveloperList(params: DeveloperPageRequest) {
    return requestClient.get<DeveloperItem>(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateDeveloper(params: CreateDeveloperRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateDeveloper(params: UpdateDeveloperRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const developerApi = new DeveloperApi("/platform/developer");


/**
 * 账户
 */
class AdvertiserApi extends BaseApi {

  /**
   * 获取授权链接
   * @param params
   */
  fetchAuthUrl(params: AuthAdvertiserRequest) {
    return requestClient.get(this.getServiceUrl("auth_url"), {params: params})
  }

  fetchAdvertiserList(params: AdvertiserPageRequest) {
    return requestClient.get<AdvertiserItem>(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateAdvertiser(params: CreateAdvertiserRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateAdvertiser(params: UpdateAdvertiserRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }


  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

}

export const advertiserApi = new AdvertiserApi("/platform/advertiser");
