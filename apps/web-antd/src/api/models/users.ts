import type {BaseItem, PageRequestParams} from "#/api/models/core";
import type {RoleItem} from "#/api/models/role";

export interface RegisterUser {
  email: string;
  password: string;
  confirmPassword: string;
  mainName: string
}

/**
 * 组织信息
 */
export interface OrgItem extends BaseItem {
  name: string;
  code: string;
  parentId: string;
  children: OrgItem[];
}

/**
 *
 */
export interface OrgCreateRequest {
  id: string;
  name: string;
  parentId: string;
}

/**
 *
 */
export interface OrgUpdateRequest extends OrgCreateRequest {
  m: string;
}

/**
 *
 */
export interface UserSearchRequest extends PageRequestParams {
  nickname?: string;
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
  roleList: RoleItem[],
}

/**
 *
 */
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

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 *
 */
export interface UpdateUserRequest extends CreateUserRequest {
  m: string;
}


/**
 *
 */
export interface DataRangeSearchRequest extends PageRequestParams {
  name: string;
}

/**
 *
 */
export interface DataRangeItem extends BaseItem {
  name: string;
  code: string;
  type: number;
  remark: string;
}

/**
 *
 */
export interface CreateDataRangeRequest {
  name: string;
  type: number;
  remark: string;
}

/**
 *
 */
export interface UpdateDataRangeRequest extends CreateDataRangeRequest {
  id: string;
}

/**
 *
 */
export interface SetUserDataRangeRequest {
  userId: string;
  dataRangeId: string;
}

export interface OperatorSearchRequest extends PageRequestParams {
  m: string;
}

export interface OperatorItem extends BaseItem {
  url: string;
  params: string;
  operateUserId: string;
}

export interface FlowableProcessSearchRequest extends PageRequestParams{
  name: string;
  processType: string;
}


export interface FlowableProcessItem extends BaseItem {
  name: string;
  processType:string;
  processStatus:number;
  remark:number;
}

export interface CreateFlowableProcess {
  id: string;
  name: string;
  remark: string;
  processType: string;
  processFileUrl: string;
}
