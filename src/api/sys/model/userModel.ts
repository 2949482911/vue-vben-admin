import { RouteItem } from '@/api/sys/model/menuModel';

/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  email: string;
  password: string;
  code: string;
}

export interface RoleInfo {
  id: string;
  roleType: number;
  name: string;
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  token: string; // token
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  roleVOList: RoleInfo[];
  // 用户id
  userId: string | number;
  id: string;
  // 用户名
  authName: string;
  // 昵称
  nickname: string;
  // 头像
  avatar: string;

  phone: string;

  mainId: string;

  mainName: string;

  orgId: string;
  orgName: string;
  orgCode: string;

  // 用户信息
  menu: Array<RouteItem>;
  marks: Array<string>;
}

export interface ResetPassword {
  oldPassword: string;
  newPassword: string;
  checkPassword: string;
}

/**
 * 注册账户
 */
export interface RegisterParams {
  email: string;
  mainName: string;
  password: string;
  confirmPassword: string;
}
