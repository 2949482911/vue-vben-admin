import { baseRequestClient, requestClient } from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {UserInfo} from "@vben/types";

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    email?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

class AuthApi extends BaseApi {

  constructor(serviceUrl: string) {
    super(serviceUrl);
  }

  loginApi(data: AuthApi.LoginParams) {
    return requestClient.post<AuthApi.LoginResult>(this.getServiceUrl("login"), data);
  }

  refreshTokenApi() {
    return baseRequestClient.post<AuthApi.RefreshTokenResult>(
      this.getServiceUrl("refresh"),
      {
        withCredentials: true,
      },
    );
  }

  logoutApi() {
    return baseRequestClient.post(this.getServiceUrl("logout"), {
      withCredentials: true,
    });
  }

  getUserInfoApi() {
    return requestClient.get<UserInfo>(this.getServiceUrl("user/info"));
  }
}

export const authApi: AuthApi = new AuthApi("/auth/auth")
