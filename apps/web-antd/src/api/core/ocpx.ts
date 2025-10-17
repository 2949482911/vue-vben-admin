import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from "#/api/request";
import type {
  BehavioraPlatformPageRequest, CreateBehavioraPlatformRequest,
  CreatePlatformCallbackRequest,
  PlatformcallbackItem,
  PlatformcallbackPageRequest, UpdatePlatformCallbackRequest,
  UpdateBehavioraPlatformRequest
} from "#/api/models";
import type {BehavioraPlatformItem} from "#/api/models/ocpx";


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


class BehavioraPlatformApi extends BaseApi {

  fetchBehavioraPlatformList(params: BehavioraPlatformPageRequest) {
    return requestClient.get<BehavioraPlatformItem[]>(this.getServiceUrl("list"));
  }


  fetchCreateBehavioraPlatform(params: CreateBehavioraPlatformRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }


  fetchUpdateBehavioraPlatform(params: UpdateBehavioraPlatformRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}


export const behavioraPlatformApi = new BehavioraPlatformApi("/platform/platformbehaviora");
