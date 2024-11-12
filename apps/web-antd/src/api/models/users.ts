import type {BaseItem, PageRequestParams} from "#/api/models/core";


export interface OrgItem  extends BaseItem{
  name: string;
  code: string;
  parentId: string;
  children: OrgItem[];
}

export interface OrgCreateRequest {
  id: string;
  name: string;
  parentId: string;
}

export interface OrgUpdateRequest extends OrgCreateRequest{}


export interface UserSearchRequest extends PageRequestParams{
  nickname: string;
  orgId: string;
}


export interface UserItem extends BaseItem {
  orgId: string;
  avatar: string;
  nickname: string;
  authName: string;
  phone: string;
  qq: string;
  email: string;
  sex: number;
  roleIds: string[];
}


export interface CreateUserRequest {
  id: string;
  orgId: string;
  nickname: string;
  authName: string;
  phone: string;
  qq: string;
  email: string;
  sex: number;
  roleIds: string[];
}
export interface UpdateUserRequest extends CreateUserRequest{}



export interface DataRangeSearchRequest extends PageRequestParams{
  name: string;
}

export interface DataRangeItem extends BaseItem {
  name: string;
  code: string;
  type: number;
  remark: string;
}

export interface CreateDataRangeRequest {
  id: string;
  name: string;
  type: number;
  remark: string;
}

export interface UpdateDataRangeRequest extends CreateDataRangeRequest{}

export interface SetUserDataRangeRequest {
  userId: string;
  dataRangeId: string;
}
