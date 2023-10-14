import {
  AccountParams,
  DeptListItem,
  MenuParams,
  RoleParams,
  RolePageParams,
  MenuListGetResultModel,
  DeptListGetResultModel,
  AccountListGetResultModel,
  RolePageListGetResultModel,
  RoleListGetResultModel,
  CreateUpdateMenu,
  CreateRole,
  UpdateRole,
} from './model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  AccountList = '/system/getAccountList',
  IsAccountExist = '/system/accountExist',
  DeptList = '/system/getDeptList',
  MenuList = 'sys/menu/list',
  CreateMenu = 'sys/menu/create',
  UpdateMenu = 'sys/menu/update',

  RolePageList = 'sys/role/list',
  RoleDisable = 'sys/role/disable',
  RoleEnable = 'sys/role/enable',
  CreateRole = 'sys/role/save',
  UpdateRole = 'sys/role/update',
  DeleteRole = 'sys/role/delete',

  GetAllRoleList = '/system/getAllRoleList',
}

export const getAccountList = (params: AccountParams) =>
  defHttp.get<AccountListGetResultModel>({ url: Api.AccountList, params });

export const getDeptList = (params?: DeptListItem) =>
  defHttp.get<DeptListGetResultModel>({ url: Api.DeptList, params });

export const getMenuList = (params?: MenuParams) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.MenuList, params });

export const createMenu = (params?: CreateUpdateMenu) =>
  defHttp.post({ url: Api.CreateMenu, params });

export const updateMenu = (params?: CreateUpdateMenu) =>
  defHttp.post({ url: Api.UpdateMenu, params });

export const getRoleListByPage = (params?: RolePageParams) =>
  defHttp.get<RolePageListGetResultModel>({ url: Api.RolePageList, params });

export const createRole = (params?: CreateRole) => defHttp.post({ url: Api.CreateRole, params });

export const updateRole = (params?: UpdateRole) => defHttp.post({ url: Api.UpdateRole, params });

export const deleteRole = (id: string) => defHttp.get({ url: Api.DeleteRole, params: { id: id } });

export const getAllRoleList = (params?: RoleParams) =>
  defHttp.get<RoleListGetResultModel>({ url: Api.GetAllRoleList, params });

export const setRoleDisable = (id: string) => defHttp.get({ url: Api.RoleDisable, params: { id } });

export const setRoleEnbale = (id: string) => defHttp.get({ url: Api.RoleEnable, params: { id } });

export const isAccountExist = (account: string) =>
  defHttp.post({ url: Api.IsAccountExist, params: { account } }, { errorMessageMode: 'none' });
