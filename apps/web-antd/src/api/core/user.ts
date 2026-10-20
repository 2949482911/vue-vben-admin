import type {BatchOptions} from "#/api/models/core";
import type {
  CreateDataRangeRequest,
  CreateUserRequest,
  DataRangeItem,
  DataRangeSearchRequest,
  OperatorItem,
  OperatorSearchRequest,
  OrgCreateRequest,
  OrgItem,
  OrgUpdateRequest,
  SetUserDataRangeRequest,
  UpdateDataRangeRequest,
  UpdatePasswordRequest,
  UpdateUserRequest,
  UserItem,
  UserSearchRequest
} from "#/api/models/users";

import qs from "qs";

import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';

class UserApi extends BaseApi {

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)

  }

  fetchCreateUser(params: CreateUserRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdatePassword(params: UpdatePasswordRequest) {
    return requestClient.post(this.getServiceUrl("updatePassword"), params)
  }


  fetchUpdateUser(params: UpdateUserRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchUserList(params: UserSearchRequest): Promise<UserItem> {
    return requestClient.get<UserItem>(this.getServiceUrl("list"), {params})
  }

}

class OrgApi extends BaseApi {

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

  fetchOrgCreate(params: OrgCreateRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  fetchOrgDelete(ids: string[]) {
    return requestClient.get(this.getServiceUrl("delete"),
      {
        params: {ids},
        paramsSerializer (params) {
          return qs.stringify(params, {arrayFormat: 'repeat'});
        },
      });
  }

  fetchOrgDisable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("disable"), {
      params: {ids},
      paramsSerializer (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchOrgEnable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("enable"), {
      params: {ids},
      paramsSerializer (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchOrgTree(): Promise<OrgItem[]> {
    return requestClient.get<OrgItem[]>(this.getServiceUrl("list"));
  }

  fetchOrgUpdate(params: OrgUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}


class DataRangeApi extends BaseApi {


  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

  fetchCreateDataRange(params: CreateDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchDataRangeList(params: DataRangeSearchRequest) {
    return requestClient.get<DataRangeItem>(this.getServiceUrl("list"), {params});
  }

  fetchDeleteDataRange(id: string) {
    return requestClient.post(this.getServiceUrl("delete"), {params: {id}});
  }

  fetchDisableDataRange(ids: string[]) {
    return requestClient.get(this.getServiceUrl("disable"),
      {
        params: {ids},
        paramsSerializer (params) {
          return qs.stringify(params, {arrayFormat: 'repeat'});
        },
      },
    );
  }

  fetchEnableDataRange(ids: string[]) {
    return requestClient.get(this.getServiceUrl("enable"), {
      params: {ids},
      paramsSerializer (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'});
      },
    });
  }

  fetchSetUserDataRange(params: SetUserDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("sudr"), params)
  }

  fetchUpdateDataRange(params: UpdateDataRangeRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}


class OperatorApi extends BaseApi {

  fetchNoticeList(params: OperatorSearchRequest): Promise<OperatorItem> {
    return requestClient.get(this.getServiceUrl("list"), {params});
  }
}

export const orgApi: OrgApi = new OrgApi("/sys/org")
export const userApi: UserApi = new UserApi("/sys/user")
export const dataRangeApi: DataRangeApi = new DataRangeApi("/sys/data/range")
export const operatorApi: OperatorApi = new OperatorApi("/sys/operator")
