import { BasicPageParams, BasicFetchResult } from '@/api/model/baseModel';

export type AccountParams = BasicPageParams & {
  account?: string;
  nickname?: string;
  [key: string]: any;
};

export type RoleParams = {
  roleName?: string;
  status?: string;
};

export type RolePageParams = BasicPageParams & RoleParams;

export type DeptParams = {
  deptName?: string;
  status?: string;
};

export type MenuParams = {
  menuName?: string;
  status?: string;
};

export interface AccountListItem {
  id: string;
  account: string;
  email: string;
  nickname: string;
  role: number;
  createTime: string;
  remark: string;
  status: number;
}

export interface DeptListItem {
  id: string;
  name: string;
  parentId: string;
  code: string;
  createTime: string;
  status: number;
  children: Array<DeptListItem>;
}

export interface CreateOrg {
  name: string;
  parentId: string;
  code: string;
  status: number;
}

export interface UpdateOrg {
  id: string;
  name: string;
  parentId: string;
  code: string;
  status: number;
}

export interface MenuMeta {
  hideMenu: boolean;
  icon: string;
  title: string;
}

/**
 * 菜单列表
 */
export interface MenuListItem {
  id: string;
  type: number;
  name: string;
  icon: string;
  path: string;
  backendUrl: string;
  mark: string;
  isLogin: number;
  title: string;
  component: string;
  parentId: string;
  sort: number;
  createTime: string;
  meta: MenuMeta;
  children: Array<MenuListItem>;
}

export interface CreateUpdateMenu {
  id: string;
  type: number;
  icon: string;
  path: string;
  backendUrl: string;
  mark: string;
  title: string;
  parentId: number;
  component: string;
  sort: number;
}

export interface RoleListItem {
  id: string;
  name: string;
  roleType: number;
  comment: string;
  status: number;
  createTime: string;
}

export interface CreateRole {
  name: string;
  roleType: number;
  comment: string;
  menuIds: Array<number>;
}

export interface UpdateRole {
  id: string;
  name: string;
  roleType: number;
  comment: string;
  menuIds: Array<number>;
}

export interface CreateMainBody {
  name: string;
}

export interface UpdateMainBody {
  id: string;
  name: string;
  email: string;
  remark: string;
  status: number;
}

/**
 * @description: Request list return value
 */
export type AccountListGetResultModel = BasicFetchResult<AccountListItem>;

export type DeptListGetResultModel = BasicFetchResult<DeptListItem>;

export type MenuListGetResultModel = BasicFetchResult<MenuListItem>;

export type RolePageListGetResultModel = BasicFetchResult<RoleListItem>;

export type RoleListGetResultModel = RoleListItem[];

/*
 * 主体查询参数*/

export type MainBodyParams = {
  name?: string;
  status?: number;
};
export type MainBodyPageParams = BasicPageParams & MainBodyParams;

export interface MainBodyItem {
  id: string;
  name: string;
  status: number;
  email: string;
  createTime: string;
}

// 主体列表
export type MainBodyGetResultModel = BasicFetchResult<MainBodyItem>;

export type DataScopeParams = {
  name?: string;
  status?: number;
};

export type DataScopePageParams = BasicPageParams & DataScopeParams;

/**
 * 数据权限列表返回
 */
export interface DataScopeItem {
  id: string;
  name: string;
  code: string;
  status: number;
  remark: string;
  createdBy: string;
  createTime: string;
  userIds: Array<string>;
  orgIds: Array<string>;
  mainIds: Array<string>;
  updateBy: string;
  updateTime: string;
}

export type DataScopeGetResultModel = BasicFetchResult<DataScopeItem>;

export interface CreateDataScope {
  name: string;
  type: number;
  remark: string;
}

export interface UpdateDataScope {
  id: string;
  name: string;
  type: number;
  remark: string;
}

export interface UpdateAccount {
  id: string;
  nickname: string;
  authName: string;
  phone: string;
  orgId: string;
  roleIds: Array<string>;
  remark: string;
}

export interface CreateAccount {
  nickname: string;
  authName: string;
  phone: string;
  orgId: string;
  roleIds: Array<string>;
  remark: string;
}

export interface UserInfo {
  aegisAuth: any;
  roleList: Array<RoleListItem>;
  menuList: Array<MenuListItem>;
  dataRange: any;
}

/**
 * 修改密码
 */
export interface UpdatePassword {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
