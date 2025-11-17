import type {BaseItem, PageRequestParams} from "#/api/models/core";

export interface RoleSearchParams extends PageRequestParams{
  name: string;
  roleType: number;
}

export interface RoleItem extends BaseItem{
  name: string;
  roleType: number;
  comment: string;
  isSystem: number;
}


export interface CreateRoleRequest {
  id: string;
  name: string;
  roleType: number;
  comment: string;
  menuIds: string[]
}


export interface UpdateRoleRequest extends CreateRoleRequest{
    id: string
}
