import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from "#/api/request";
import type {
  CreatePlatformCallbackRequest,
  PlatformcallbackItem,
  PlatformcallbackPageRequest, UpdatePlatformCallbackRequest
} from "#/api/models";


class PlatformCallbackApi extends BaseApi {

  fetchPlatformcallbackList(params: PlatformcallbackPageRequest) {
    return requestClient.get<PlatformcallbackItem[]>(this.getServiceUrl("list"), {
      params: params
    });
  }


  fetchPlatformcallbackCreate(params: CreatePlatformCallbackRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }


  fetchPlatformcallbackUpdate(params: UpdatePlatformCallbackRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}

export const platformCallbackApi = new PlatformCallbackApi("/platform/platformcallback");
