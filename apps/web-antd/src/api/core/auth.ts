import { baseRequestClient, requestClient } from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {UserInfo} from "@vben/types";
import type {RegisterUser} from "#/api/models/users";

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
    return baseRequestClient.get(this.getServiceUrl("loginOut"), {
      withCredentials: true,
    });
  }

  getUserInfoApi() {
    return requestClient.get<UserInfo>(this.getServiceUrl("user/info"));
  }

  register(params: RegisterUser) {
    return requestClient.post(this.getServiceUrl("register"), params);
  }
}

export const authApi: AuthApi = new AuthApi("/auth/auth")
