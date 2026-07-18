import type {BasicRole, BasicUserInfo} from '@vben-core/typings/src/basic';

import {acceptHMRUpdate, defineStore} from 'pinia';

interface BasicUserInfo {
  [key: string]: any;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

interface AccessState {
  roles: BasicRole[];
  /**
   * 用户信息
   */
  userInfo: null | BasicUserInfo;
  /**
   * 用户角色
   */
  userRoles: string[];
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: null | BasicUserInfo) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      const roles: BasicRole[] = userInfo?.roleVOList ?? [];
      this.setUserRoles(roles);
    },
    setUserRoles(roles: BasicRole[]) {
      roles.forEach((role) => {
        this.userRoles.push(role.roleType);
      });
      this.roles = roles;
    },
  },
  state: (): AccessState => ({
    userInfo: null,
    userRoles: [],
    roles: [],
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
