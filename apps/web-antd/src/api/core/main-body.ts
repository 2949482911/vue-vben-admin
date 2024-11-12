import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {
  MainBodyCreateRequest,
  MainBodyItem,
  MainBodyUpdateRequest,
  MainBodySearchRequest
} from "#/api/models/main-body";


class MainBodyApi extends BaseApi {

  constructor(serviceUser: string) {
    super(serviceUser);
  }


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
    return requestClient.get("disable" , {
      params: {ids : ids}
    });
  }

  fetchMainEnable(ids: string[]){
    return requestClient.get("enable" , {
      params: {ids : ids}
    });
  }

  fetchMainDelete(ids: string[]){
    return requestClient.get("enable" , {
      params: {ids : ids}
    });
  }

}

export const mainBodyApi: MainBodyApi = new MainBodyApi("/sys/main")
