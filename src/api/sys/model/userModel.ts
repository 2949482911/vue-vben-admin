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

  // 用户信息
  aegisAuth: AegisAuth;
  role: Array<Role>;
  menu: Array<Menu>;
}

/**
 * 用户信息
 */
export interface AegisAuth {
  id: string;
  nickName: string;
}

/**
 * 角色
 */
export interface Role {
  id: string;
  name: string;
}

/**
 *  user`s menu
 */
export interface Menu {
  id: string;
  name: string;
}

export interface ResetPassword {
  oldPassword: string;
  newPassword: string;
  checkPassword: string;
}
