import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  UserInfo,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { registerWorkspaceRoutes } from '#/router/routes/ai-asset-workspace';
import {useAuthStore} from "#/store";

import { normalizeAiAssetMenu } from './menu-normalize';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  const result = await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      const userStore = useUserStore();
      const authStore = useAuthStore();
      const userInfo = (userStore.userInfo ||
        (await authStore.fetchUserInfo())) as UserInfo;
      // 「AI 资产工作台」整组收敛成一级「工作区」（详见 menu-normalize.ts）
      return normalizeAiAssetMenu(userInfo.menu ?? []);
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });

  // 工作区域内路由（带 :wsId）由前端注册，须在菜单路由生成之后
  if (options.router) {
    registerWorkspaceRoutes(options.router);
  }

  return result;
}

export { generateAccess };
