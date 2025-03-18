import { BaseApi } from "#/api/core/baseapi";
import type {
  MediaOnlineretailersItem,
  MediaOnlineretailersParams
} from "#/api/models/media/account";
import {requestClient} from '#/api/request';
import type {BatchOptions} from "#/api/models/core";
import {qs} from 'qs';

/**
 * media account
 */
class MediaAccountApi extends BaseApi {

  fetchMediaOnlineretailersList(params: MediaOnlineretailersParams) {
    return requestClient.get<MediaOnlineretailersItem[]>(this.getServiceUrl("list"), {params})
  }

  fetchAllMediaOnlineretailers(platform: string, page: number = 1, pageSize: number = 1000) {
    return requestClient.get<MediaOnlineretailersItem[]>(this.getServiceUrl("list"), {
      params: {
        platform,
        page,
        pageSize,
      }
    })
  }

  /**
   * 授权url
   */
  fetchMediaOnlineretailersAuthUrl(platform: string) {
    return requestClient.get(this.getServiceUrl("auth_url"), {params: {platform: platform}})
  }

  /**
   * 批量操作
   * @param params
   */
  fetchMediaOnlineretailersBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}


export const mediaAccountApi: MediaAccountApi = new MediaAccountApi("/media/onlineretailers_account")
