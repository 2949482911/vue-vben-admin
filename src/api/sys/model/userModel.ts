/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  email: string;
  password: string;
}

export interface RoleInfo {
  roleName: string;
  value: string;
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
  roles: RoleInfo[];
  // 用户id
  userId: string | number;

  id: string;
  // 用户名
  username: string;
  // 真实名字
  realName: string;
  // 昵称
  nickName: string;
  // 头像
  avatar: string;
  // 介绍
  desc?: string;
}

export interface ResetPassword {
  oldPassword: string;
  newPassword: string;
  checkPassword: string;
}
