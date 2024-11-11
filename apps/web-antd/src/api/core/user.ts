import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {DeleteItem} from "#/api/models/core";
import type {OrgCreateRequest, OrgItem, OrgUpdateRequest} from "#/api/models/users";

class UserApi extends BaseApi {

  constructor(serviceUrl: string) {
    super(serviceUrl);
  }


}



class OrgApi extends BaseApi {
  constructor(serviceUrl: string) {
    super(serviceUrl);
  }

  fetchOrgTree(): Promise<OrgModel[]> {
    return requestClient.get<OrgItem[]>(this.getServiceUrl("list"));
  }

  fetchOrgCreate(params: OrgCreateRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  fetchOrgUpdate(params: OrgUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchOrgDisable (ids: DeleteItem) {
    return requestClient.post(this.getServiceUrl("disable"), ids);
  }

  fetchOrgEnable(ids: DeleteItem) {
    return requestClient.post(this.getServiceUrl("enable"), ids);
  }

  fetchOrgDelete(ids: DeleteItem) {
    return requestClient.post(this.getServiceUrl("delete"), ids);
  }
}


export const orgApi: OrgApi = new OrgApi("/sys/org")
