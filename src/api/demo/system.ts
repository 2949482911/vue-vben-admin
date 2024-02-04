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
  UpdateAccount,
  CreateAccount,
  UserInfo,
  UpdatePassword,
  GetOperateLogParams,
} from './model/systemModel';
import qs from 'qs';
import { defHttp } from '@/utils/http/axios';
import {
  CreateNotice,
  NoticeItemList,
  NoticePageParams,
  UpdateNotice,
} from '@/api/demo/model/notice';
import { BatchOptions } from '@/api/model/baseModel';

enum Api {
  AccountList = 'sys/user/list',
  UpdateAccount = 'sys/user/update',
  CreateAccount = 'sys/user/create',
  EnableAccount = 'sys/user/enable',
  DisableAccount = 'sys/user/disabled',
  UserInfo = 'sys/user/info',
  UpdatePassword = 'sys/user/updatePassword',

  IsAccountExist = 'sys/user/isAccountExist',
  DeptList = 'sys/org/list',
  CreateOrg = 'sys/org/save',
  UpdateOrg = 'sys/org/update',
  DisableOrg = 'sys/org/disable',
  EnableOrg = 'sys/org/enable',
  DeleteOrg = 'sys/org/delete',

  MenuList = 'sys/menu/list',
  CreateMenu = 'sys/menu/create',
  UpdateMenu = 'sys/menu/update',
  DeleteMenu = 'sys/menu/delete',

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
  SelectDataRange = 'sys/data/range/select',

  // 操作日志
  OperateLogList = 'sys/operate-log/list',

  // 公告
  NoticeList = 'sys/notice/list',
  NoticeReadList = 'sys/notice/read_list',
  NoticeCreate = 'sys/notice/create',
  NoticeUpdate = 'sys/notice/update',
  NoticeBatchOptions = 'sys/notice/batch_options',
}

export const getAccountList = (params: AccountParams) =>
  defHttp.get<AccountListGetResultModel>({ url: Api.AccountList, params });

/**
 * 修改密码
 * @param params
 */
export const updatePassword = (params: UpdatePassword) =>
  defHttp.post(
    {
      url: Api.UpdatePassword,
      params,
    },
    {
      successMessageMode: 'tip',
    },
  );

export const getDeptList = (params?: DeptListItem) =>
  defHttp.get<DeptListGetResultModel>({ url: Api.DeptList, params });

export const getMenuList = (params?: MenuParams) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.MenuList, params });

export const createMenu = (params?: CreateUpdateMenu) =>
  defHttp.post(
    { url: Api.CreateMenu, params },
    {
      successMessageMode: 'tip',
    },
  );

export const deleteMenu = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.DeleteMenu,
      params: {
        ids: ids,
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const updateMenu = (params?: CreateUpdateMenu) =>
  defHttp.post(
    { url: Api.UpdateMenu, params },
    {
      successMessageMode: 'tip',
    },
  );

export const getRoleListByPage = (params?: RolePageParams) =>
  defHttp.get<RolePageListGetResultModel>({ url: Api.RolePageList, params });

export const createRole = (params?: CreateRole) =>
  defHttp.post(
    { url: Api.CreateRole, params },
    {
      successMessageMode: 'tip',
    },
  );

export const updateRole = (params?: UpdateRole) =>
  defHttp.post(
    { url: Api.UpdateRole, params },
    {
      successMessageMode: 'tip',
    },
  );

export const deleteRole = (id: string) =>
  defHttp.get(
    { url: Api.DeleteRole, params: { id: id } },
    {
      successMessageMode: 'tip',
    },
  );

export const getAllRoleList = (params?: RoleParams) =>
  defHttp.get<RoleListGetResultModel>({ url: Api.GetAllRoleList, params });

export const setRoleDisable = (id: string) =>
  defHttp.get(
    { url: Api.RoleDisable, params: { id } },
    {
      successMessageMode: 'tip',
    },
  );

export const setRoleEnable = (id: string) =>
  defHttp.get(
    { url: Api.RoleEnable, params: { id } },
    {
      successMessageMode: 'tip',
    },
  );

export const isAccountExist = (account: string) =>
  defHttp.get(
    { url: Api.IsAccountExist, params: { username: account } },
    { errorMessageMode: 'none' },
  );

export const createOrg = (params?: CreateOrg) =>
  defHttp.post(
    { url: Api.CreateOrg, params },
    {
      successMessageMode: 'tip',
    },
  );

export const updateOrg = (params?: UpdateOrg) =>
  defHttp.post(
    { url: Api.UpdateOrg, params },
    {
      successMessageMode: 'tip',
    },
  );

export const enbaleOrg = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.EnableOrg,
      params: { ids: ids },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const disableOrg = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.DisableOrg,
      params: { ids: ids },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const deleteOrg = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.DeleteOrg,
      params: { ids: ids },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

// 主体管理器

export const getMainBodyByPage = (params?: MainBodyPageParams) =>
  defHttp.get<MainBodyGetResultModel>({ url: Api.GetMainBodyList, params });

export const createMainBody = (params?: CreateMainBody) =>
  defHttp.post(
    { url: Api.CreateMainBody, params },
    {
      successMessageMode: 'tip',
    },
  );

export const updateMainBody = (params?: UpdateMainBody) =>
  defHttp.post(
    { url: Api.UpdateMainBody, params },
    {
      successMessageMode: 'tip',
    },
  );

export const enableMainBody = (id: string) =>
  defHttp.get(
    {
      url: Api.EnableMainBody,
      params: { ids: [id] },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const disableMainBody = (id: string) =>
  defHttp.get(
    {
      url: Api.DisableMainBody,
      params: { ids: [id] },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const selectMainBody = () => defHttp.get({ url: Api.SelectMainBody });

export const deleteMainBody = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.DeleteMainBody,
      params: { ids: ids },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const getDataScopeByPage = (params?: DataScopePageParams) =>
  defHttp.get<DataScopeGetResultModel>({ url: Api.GetDataScopeByPage, params });

export const createDataScope = (params?: CreateDataScope) =>
  defHttp.post(
    { url: Api.CreateDataScope, params },
    {
      successMessageMode: 'tip',
    },
  );

export const updateDataScope = (params?: UpdateDataScope) =>
  defHttp.post(
    { url: Api.UpdateDataScope, params },
    {
      successMessageMode: 'tip',
    },
  );

export const deleteDataScope = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.DeleteDataScope,
      params: { ids: ids },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const enableDataScope = (ids: Array<string>) =>
  defHttp.get(
    {
      url: Api.EnableDataScope,
      params: { ids: ids },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const disableDataScope = (ids: Array<string>) =>
  defHttp.get({
    url: Api.DisableDataScope,
    params: { ids: ids },
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

export const selectDataRange = () =>
  defHttp.get({
    url: Api.SelectDataRange,
  });

export const updateAccount = (params?: UpdateAccount) =>
  defHttp.post(
    { url: Api.UpdateAccount, params },
    {
      successMessageMode: 'tip',
    },
  );

export const createAccount = (params?: CreateAccount) =>
  defHttp.post(
    { url: Api.CreateAccount, params },
    {
      successMessageMode: 'tip',
    },
  );

export const disableAccount = (id: string) =>
  defHttp.get(
    {
      url: Api.DisableAccount,
      params: { ids: [id] },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

export const enableAccount = (id: string) =>
  defHttp.get(
    {
      url: Api.EnableAccount,
      params: { ids: [id] },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
    {
      successMessageMode: 'tip',
    },
  );

/**
 * 用户详情
 * @param id
 */
export const userInfo = (id: string) =>
  defHttp.get<UserInfo>({
    url: Api.UserInfo,
    params: { id: id },
  });

export const getOperateLogList = (params: GetOperateLogParams) =>
  defHttp.get({
    url: Api.OperateLogList,
    params,
  });

export const getNoticeList = (params: NoticePageParams) =>
  defHttp.get<NoticeItemList>({
    url: Api.NoticeList,
    params,
  });

export const actionCreateNotice = (params: CreateNotice) =>
  defHttp.post(
    {
      url: Api.NoticeCreate,
      params: params,
    },
    {
      successMessageMode: 'tip',
    },
  );

export const actionUpdateNotice = (params: UpdateNotice) =>
  defHttp.post(
    {
      url: Api.NoticeUpdate,
      params: params,
    },
    {
      successMessageMode: 'tip',
    },
  );

export const actionNoticeBatchOptions = (params: BatchOptions) =>
  defHttp.post({
    url: Api.NoticeBatchOptions,
    params,
  });

export const getNoticeReadList = (params: NoticePageParams) =>
  defHttp.get<NoticeItemList>({
    url: Api.NoticeReadList,
    params,
  });
