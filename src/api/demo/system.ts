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
  CreateOrg,
  UpdateOrg,
  MainBodyPageParams,
  CreateMainBody,
  UpdateMainBody,
  MainBodyGetResultModel,
  DataScopePageParams,
  DataScopeGetResultModel,
  CreateDataScope,
  UpdateDataScope,
} from './model/systemModel';
import { defHttp } from '/@/utils/http/axios';
import qs from 'qs';

enum Api {
  AccountList = 'sys/user/list',

  IsAccountExist = '/system/accountExist',
  DeptList = 'sys/org/list',
  CreateOrg = 'sys/org/save',
  UpdateOrg = 'sys/org/update',
  DisableOrg = 'sys/org/disable',
  EnableOrg = 'sys/org/enable',
  DeleteOrg = 'sys/org/delete',

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

  GetMainBodyList = 'sys/main/list',
  CreateMainBody = 'sys/main/save',
  UpdateMainBody = 'sys/main/update',
  InfoMainBody = 'sys/main/body',
  EnableMainBody = 'sys/main/enable',
  DisableMainBody = 'sys/main/disable',
  DeleteMainBody = 'sys/main/delete',
  SelectMainBody = 'sys/main/select',
  GetByIdtMainBody = 'sys/main/getById',

  // 数据权限
  GetDataScopeByPage = 'sys/data/range/list',
  CreateDataScope = 'sys/data/range/create',
  UpdateDataScope = 'sys/data/range/update',
  DeleteDataScope = 'sys/data/range/delete',
  EnableDataScope = 'sys/data/range/enable',
  DisableDataScope = 'sys/data/range/disable',
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

export const setRoleEnable = (id: string) => defHttp.get({ url: Api.RoleEnable, params: { id } });

export const isAccountExist = (account: string) =>
  defHttp.post({ url: Api.IsAccountExist, params: { account } }, { errorMessageMode: 'none' });

export const createOrg = (params?: CreateOrg) => defHttp.post({ url: Api.CreateOrg, params });

export const updateOrg = (params?: UpdateOrg) => defHttp.post({ url: Api.UpdateOrg, params });

export const enbaleOrg = (ids: Array<string>) =>
  defHttp.post({ url: Api.EnableOrg, params: { ids: ids } });

export const disableOrg = (ids: Array<string>) =>
  defHttp.post({ url: Api.DisableOrg, params: { ids: ids } });

export const deleteOrg = (ids: Array<string>) =>
  defHttp.post({ url: Api.DeleteOrg, params: { ids: ids } });

// 主体管理器

export const getMainBodyByPage = (params?: MainBodyPageParams) =>
  defHttp.get<MainBodyGetResultModel>({ url: Api.GetMainBodyList, params });

export const createMainBody = (params?: CreateMainBody) =>
  defHttp.post({ url: Api.CreateMainBody, params });

export const updateMainBody = (params?: UpdateMainBody) =>
  defHttp.post({ url: Api.UpdateMainBody, params });

export const enableMainBody = (id: string) =>
  defHttp.get({
    url: Api.EnableMainBody,
    params: { ids: [id] },
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

export const disableMainBody = (id: string) =>
  defHttp.get({
    url: Api.DisableMainBody,
    params: { ids: [id] },
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

export const selectMainBody = () => defHttp.get({ url: Api.SelectMainBody });

export const deleteMainBody = (ids: Array<string>) =>
  defHttp.get({ url: Api.DeleteMainBody, params: { ids: ids } });

export const getDataScopeByPage = (params?: DataScopePageParams) =>
  defHttp.get<DataScopeGetResultModel>({ url: Api.GetDataScopeByPage, params });

export const createDataScope = (params?: CreateDataScope) =>
  defHttp.post({ url: Api.CreateDataScope, params });

export const updateDataScope = (params?: UpdateDataScope) =>
  defHttp.post({ url: Api.UpdateDataScope, params });

export const deleteDataScope = (id: string) =>
  defHttp.get({
    url: Api.DeleteDataScope,
    params: { ids: [id] },
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

export const enableDataScope = (id: string) =>
  defHttp.get({
    url: Api.EnableDataScope,
    params: { ids: [id] },
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

export const disableDataScope = (id: string) =>
  defHttp.get({
    url: Api.DisableDataScope,
    params: { ids: [id] },
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
