import type { RouteRecordStringComponent } from './vue-router';

interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

interface BasicRole {
  id: string;
  name: string;
  roleType: number;
}

interface BasicMeta {
  hideChildrenInMenu: boolean;
  hideMenu: boolean;
  icon: string;
  orderNo: number;
  title: string;
}

interface BasicMenu {
  children: BasicMenu[];
  component: string;
  icon: string;
  id: string;
  meta: BasicMeta;
  name: string;
  parent_id: number;
  path: string;
  redirect: string;
  sort: number;
  title: string;
  type: number;
}

interface BasicUserInfo {
  authName: string;
  /**
   * 头像
   */
  avatar: string;
  mainAdmin: boolean;
  mainId: string;
  mainName: string;

  marks: string[];
  maxRoleCode: number;
  menu: RouteRecordStringComponent[];
  nickname: string;
  orgCode: string;
  orgId: string;
  orgName: string;
  phone: string;
  /**
   * 用户昵称
   */
  realName: string;
  roleIdList: string[];
  /**
   * 用户角色
   */
  roles?: string[];
  roleVOList: BasicRole[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

type ClassType = Array<object | string> | object | string;

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption };
