import type {CreateRoleRequest, RoleItem, RoleSearchParams, UpdateRoleRequest,} from "#/api/models";

import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';


/**
 *
 */
class RoleApi extends BaseApi {


  /**
   * create role
   * @param params
   */
  public fetchCreateRole(params: CreateRoleRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  /**
   * delete role
   * @param id
   */
  public fetchDeleteRole(id: string) {
    return requestClient.get(this.getServiceUrl("delete"), {params: {
      id
      },
    })
  }

  fetchDisableRole(id: string) {
    return requestClient.get(this.getServiceUrl("disable"), {params: {id}})
  }

  fetchEnableRole(id: string) {
    return requestClient.get(this.getServiceUrl("enable"), {params: {id}})
  }


  /**
   * role list
   * @param params params
   */
  public fetchRoleList(params: RoleSearchParams): Promise<RoleItem[]> {
    return requestClient.get<RoleItem[]>(this.getServiceUrl("list"), {params})
  }

  /**
   * update
   * @param params
   */
  public fetchUpdateRole(params: UpdateRoleRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

}

export const roleApi: RoleApi = new RoleApi("/sys/role");

