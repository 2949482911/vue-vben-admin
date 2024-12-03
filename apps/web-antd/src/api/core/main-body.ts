import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {
  MainBodyCreateRequest,
  MainBodyItem,
  MainBodyUpdateRequest,
  MainBodySearchRequest
} from "#/api/models/main-body";
import qs from 'qs'

class MainBodyApi extends BaseApi {




  fetchMainList(params: MainBodySearchRequest): Promise<MainBodyItem[]> {
    return requestClient.get<MainBodyItem[]>(this.getServiceUrl("list"), {params});
  }


  fetchMainCreate(params: MainBodyCreateRequest){
      return requestClient.post(this.getServiceUrl("save"), params);
  }

  fetchMainUpdate(params: MainBodyUpdateRequest){
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchMainDisable(ids: string[]){
    return requestClient.get(this.getServiceUrl("disable") , {
      params: {ids : ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchMainEnable(ids: string[]){
    return requestClient.get(this.getServiceUrl("enable") , {
      params: {ids : ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchMainDelete(ids: string[]){
    return requestClient.get(this.getServiceUrl("delete") , {
      params: {ids : ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

}

export const mainBodyApi: MainBodyApi = new MainBodyApi("/sys/main")
