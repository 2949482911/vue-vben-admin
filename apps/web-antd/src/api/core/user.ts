import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {DeleteItem} from "#/api/models/core";
import type {
  CreateDataRangeRequest,
  CreateUserRequest, DataRangeItem, DataRangeSearchRequest, OperatorItem, OperatorSearchRequest,
  OrgCreateRequest,
  OrgItem,
  OrgUpdateRequest, SetUserDataRangeRequest, UpdateDataRangeRequest, UpdateUserRequest,
  UserItem,
  UserSearchRequest
} from "#/api/models/users";
import qs from 'qs'

class UserApi extends BaseApi {

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
    return requestClient.get(this.getServiceUrl("disabled"), {params: {id: id}})
  }

  fetchDeleteUser(ids: string[]) {
    return requestClient.get(this.getServiceUrl("delete"),
      {
        params: {ids: ids},
        paramsSerializer: function (params) {
          return qs.stringify(params, {arrayFormat: 'repeat'});
        },
      })
  }

}

class OrgApi extends BaseApi {

  fetchOrgTree(): Promise<OrgModel[]> {
    return requestClient.get<OrgItem[]>(this.getServiceUrl("list"));
  }

  fetchOrgCreate(params: OrgCreateRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  fetchOrgUpdate(params: OrgUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchOrgDisable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("disable"), {
      params: {ids: ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchOrgEnable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("enable"), {
      params: {ids: ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchOrgDelete(ids: string[]) {
    return requestClient.get(this.getServiceUrl("delete"), {
      params: {ids: ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }
}


class DataRangeApi extends BaseApi {


  fetchDataRangeList(params: DataRangeSearchRequest) {
    return requestClient.get<DataRangeItem>(this.getServiceUrl("list"), {params});
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

  fetchDisableDataRange(ids: string[]) {
    return requestClient.get(this.getServiceUrl("disable"),
      {
        params: {ids: ids},
        paramsSerializer: function (params) {
          return qs.stringify(params, {arrayFormat: 'repeat'});
        },
      },
    );
  }

  fetchEnableDataRange(ids: string[]) {
    return requestClient.get(this.getServiceUrl("enable"), {
      params: {ids: ids},
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchSetUserDataRange(params: SetUserDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("sudr"), params)
  }
}


class OperatorApi extends BaseApi {
  constructor(serviceUrl: string) {
    super(serviceUrl);
  }

  fetchNoticeList(params: OperatorSearchRequest): Promise<OperatorItem> {
    return requestClient.get(this.getServiceUrl("list"), {params});
  }
}

export const orgApi: OrgApi = new OrgApi("/sys/org")
export const userApi: UserApi = new UserApi("/sys/user")
export const dataRangeApi: DataRangeApi = new DataRangeApi("/sys/data/range")
export const operatorApi: OperatorApi = new OperatorApi("/sys/operate-log")
