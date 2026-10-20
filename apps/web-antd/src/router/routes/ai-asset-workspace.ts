import type { Router, RouteRecordRaw } from 'vue-router';

import {
  WORKSPACE_BASE_PATH,
  WORKSPACE_INTERNAL_MENU,
} from '#/views/ai_asset/workspace/menu';

/**
 * 工作区（B 方案）域内路由：/ai_asset/workspace/:wsId/{studio,draft,queue,assets,settings}
 *
 * 为什么在前端注册：`accessMode: 'backend'` 下路由**只由后端菜单生成**
 * （见 packages/utils/src/helpers/generate-routes-backend.ts），本地 router/routes/modules 不参与生成；
 * 而「进入工作区换内部菜单」要求内部菜单项是带 :wsId 的真实路由。
 * 这里把它们注册到布局根路由 Root 下，做法与 vben generateAccessible 内部一致。
 *
 * 注意：域内页设了 hideInTab（不堆页签），因此**没有 vben 的 keep-alive 页面缓存**
 * （vben 的 KeepAlive :include 来自页签列表，见 packages/effects/layouts/src/basic/content/content.vue）：
 * 切内部菜单会重新挂载并重新拉数据。要让它们被缓存，就得让域内页进页签（去掉 hideInTab）。
 */
const WORKSPACE_DOMAIN_NAME = 'AiAssetWorkspaceDomain';

const PAGE_COMPONENTS: Record<string, RouteRecordRaw['component']> = {
  studio: () => import('#/views/ai_asset/studio/index.vue'),
  draft: () => import('#/views/ai_asset/drafts/index.vue'),
  queue: () => import('#/views/ai_asset/tasks/index.vue'),
  assets: () => import('#/views/ai_asset/workspace/assets.vue'),
  novel: () => import('#/views/ai_asset/novel/index.vue'),
  settings: () => import('#/views/ai_asset/workspace/settings.vue'),
};

/** 菜单项 key → 页面组件（与 vben 生成路由时同款兜底：找不到就 404 页） */
function pageComponent(key: string): NonNullable<RouteRecordRaw['component']> {
  return (
    PAGE_COMPONENTS[key] ??
    (() => import('#/views/_core/fallback/not-found.vue'))
  );
}

const workspaceDomainRoute: RouteRecordRaw = {
  children: WORKSPACE_INTERNAL_MENU.map((item) => ({
    component: pageComponent(item.key),
    // 域内页不进页签/面包屑（内部菜单，由工作区导航自己承载；否则每次进工作区都堆一个页签）
    meta: {
      activeIcon: item.activeIcon,
      hideInBreadcrumb: true,
      hideInTab: true,
      icon: item.icon,
      title: item.labelKey,
    },
    name: `AiAssetWs_${item.key}`,
    path: item.key,
  })),
  component: () => import('#/views/ai_asset/workspace/layout.vue'),
  meta: { hideInBreadcrumb: true, hideInTab: true, title: '工作区' },
  name: WORKSPACE_DOMAIN_NAME,
  path: `${WORKSPACE_BASE_PATH}/:wsId`,
  // 进入工作区默认落在「创作工作台」
  redirect: (to) => `${WORKSPACE_BASE_PATH}/${String(to.params.wsId)}/studio`,
};

/**
 * 把域内路由挂到布局根路由下（须在 generateAccessible 之后调用，重复调用无副作用）
 */
export function registerWorkspaceRoutes(router: Router) {
  if (router.hasRoute(WORKSPACE_DOMAIN_NAME)) {
    return;
  }
  // 与 vben 内部一致：根路由来自 getRoutes()（此时路由表已生成）
  const root = router
    .getRoutes()
    .find((record) => record.name === 'Root' && record.path === '/');
  if (!root || !root.name) {
    return;
  }
  root.children?.push(workspaceDomainRoute);
  router.removeRoute(root.name);
  router.addRoute(root);
}

export { WORKSPACE_DOMAIN_NAME };
