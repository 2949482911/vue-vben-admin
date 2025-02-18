import { BaseApi } from "#/api/core/baseapi";
import type {
  MediaOnlineretailersItem,
  MediaOnlineretailersParams
} from "#/api/models/media/account";
import {requestClient} from '#/api/request';


/**
 * media account
 */
class MediaAccountApi extends BaseApi {

  fetchMediaOnlineretailersList(params: MediaOnlineretailersParams) {
    return requestClient.get<MediaOnlineretailersItem[]>(this.getServiceUrl("list"), {params})
  }


  /**
   * 授权url
   */
  fetchMediaOnlineretailersAuthUrl(platform: string) {
    return requestClient.get(this.getServiceUrl("auth_url"), {params: {platform: platform}})
  }
}


export const mediaAccountApi: MediaAccountApi = new MediaAccountApi("/media/onlineretailers_account")
