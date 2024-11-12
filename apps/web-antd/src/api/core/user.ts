import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {DeleteItem} from "#/api/models/core";
import type {
  CreateDataRangeRequest,
  CreateUserRequest, DataRangeSearchRequest,
  OrgCreateRequest,
  OrgItem,
  OrgUpdateRequest, SetUserDataRangeRequest, UpdateDataRangeRequest, UpdateUserRequest,
  UserItem,
  UserSearchRequest
} from "#/api/models/users";

class UserApi extends BaseApi {

  constructor(serviceUrl: string) {
    super(serviceUrl);
  }

  fetchUserList(params: UserSearchRequest): Promise<UserItem> {
    return requestClient.get<UserItem>(this.getServiceUrl("list"), {params})
  }

  fetchCreateUser(params: CreateUserRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateUser(params: UpdateUserRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchEnableUser(id: string) {
    return requestClient.get(this.getServiceUrl("enable"), {params: {id: id}})
  }

  fetchDisableUser(id: string) {
    return requestClient.get(this.getServiceUrl("disable"), {params: {id: id}})
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


class DataRangeApi extends BaseApi {
  constructor(serviceUrl: string) {
    super(serviceUrl);
  }

  fetchDataRangeList(params: DataRangeSearchRequest){
    return requestClient.get<DataRangeSearchRequest>(this.getServiceUrl("list"), {params});
  }

  fetchCreateDataRange(params: CreateDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateDataRange(params: UpdateDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchDeleteDataRange(id: string) {
    return requestClient.post(this.getServiceUrl("delete"), {params: {id: id}});
  }

  fetchDisableDataRange(id: string) {
    return requestClient.post(this.getServiceUrl("disable"), id, {params: {id: id}});
  }

  fetchEnableDataRange(id: string) {
    return requestClient.post(this.getServiceUrl("enable"), id, {params: {id: id}});
  }


  fetchSetUserDataRange(params: SetUserDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("sudr"), params)
  }
}


export const orgApi: OrgApi = new OrgApi("/sys/org")
export const userApi: UserApi = new UserApi("/sys/user")
export const dataRangeApi: DataRangeApi = new DataRangeApi("/sys/data/range")
