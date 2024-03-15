import { defHttp } from '@/utils/http/axios';
import {
  LoginParams,
  LoginResultModel,
  GetUserInfoModel,
  ResetPassword,
  RegisterParams,
} from './model/userModel';

import { ErrorMessageMode } from '#/axios';

enum Api {
  Login = 'auth/auth/login',
  GenerateCaptcha = 'auth/auth/generateCaptcha',
  Logout = 'auth/auth/loginOut',
  Register = 'auth/auth/register',
  ResetPassword = 'auth/auth/resetPassword',
  GetUserInfo = 'auth/auth/user/info',
  GetPermCode = '/getPermCode',
  TestRetry = '/testRetry',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo }, { errorMessageMode: 'none' });
}

// export function getPermCode() {
//   return defHttp.get<string[]>({ url: Api.GetPermCode });
// }

export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  );
}

/**
 * 重置密码
 * @param params
 */
export const resetPassword = (params?: ResetPassword) =>
  defHttp.post({ url: Api.ResetPassword, params });

/**
 * 注册账户
 * @param params
 */
export const register = (params?: RegisterParams) =>
  defHttp.post(
    { url: Api.Register, params },
    {
      successMessageMode: 'tip',
    },
  );

/**
 * 获取验证码
 */
export const generateCaptcha = () => defHttp.get({ url: Api.GenerateCaptcha });

// export const getUserInfo = () => defHttp.get({ url: Api.GetUserInfo });
