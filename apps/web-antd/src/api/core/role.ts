import { requestClient } from '#/api/request';
import type {
  RoleItem,
  RoleSearchParams,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "#/api/models";
import type {DeleteItem} from "#/api/models/core";
import {BaseApi} from "#/api/core/baseapi";


/**
 *
 */
class RoleApi extends BaseApi {

  constructor(serviceUrl: string) {
    super(serviceUrl);
  }

  /**
   * role list
   * @param params params
   */
  public fetchRoleList(params: RoleSearchParams): Promise<RoleItem[]> {
    return requestClient.get<RoleItem>(this.getServiceUrl("list"), {params})
  }

  /**
   * create role
   * @param params
   */
  public fetchCreateRole(params: CreateRoleRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  /**
   * update
   * @param params
   */
  public fetchUpdateRole(params: UpdateRoleRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  /**
   * delete role
   * @param id
   */
  public fetchDeleteRole(id: string) {
    return requestClient.get(this.getServiceUrl("delete"), {params: {
      id: id
      }})
  }
}

export const roleApi: RoleApi = new RoleApi("/sys/role");

