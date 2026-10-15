import { useAccessStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { aiAssetApi } from '#/api';
import {
  buildWorkspaceMenus,
  parseWorkspaceId,
} from '#/views/ai_asset/workspace/menu';

type AccessMenu = ReturnType<typeof useAccessStore>['accessMenus'][number];

/**
 * 工作区上下文（B 方案：工作区是一级入口）
 *
 * - 当前工作区以**路由**为准（/ai_asset/workspace/:wsId/**），守卫每次导航后同步进来，刷新可还原
 * - 进入工作区 → 左侧菜单换成工作区内部菜单；离开 → 还原后端生成的全局菜单
 * - workspaceId 供 request 拦截器注入 `X-Workspace-Id` 请求头
 */
export const useWorkspaceStore = defineStore('ai-asset-workspace', {
  actions: {
    /** 域外时始终跟随后端菜单快照；域内不动（避免把内部菜单当成全局菜单存下来） */
    snapshotGlobalMenus() {
      if (this.insideDomain) {
        return;
      }
      const menus = useAccessStore().accessMenus as AccessMenu[];
      if (menus.length > 0) {
        this.globalMenus = menus;
      }
    },

    /** 按当前路由同步菜单与工作区上下文 */
    syncByRoute(path: string) {
      const workspaceId = parseWorkspaceId(path);
      this.snapshotGlobalMenus();
      if (workspaceId) {
        this.enter(workspaceId);
      } else {
        this.exit();
      }
    },

    enter(workspaceId: number | string, name?: string) {
      // 同工作区内导航（换内部菜单项）不重建菜单，避免每次跳转都刷新一遍侧边栏/触发多余请求
      const sameWorkspace =
        this.insideDomain && String(this.workspaceId) === String(workspaceId);
      this.workspaceId = workspaceId;
      this.insideDomain = true;
      if (name) {
        this.workspaceName = name;
      }
      if (!sameWorkspace) {
        useAccessStore().setAccessMenus(
          buildWorkspaceMenus(workspaceId) as AccessMenu[],
        );
      }
      if (!this.workspaceName) {
        void this.ensureName();
      }
    },

    exit() {
      this.insideDomain = false;
      this.workspaceId = undefined;
      this.workspaceName = '';
      if (this.globalMenus.length > 0) {
        useAccessStore().setAccessMenus(this.globalMenus);
      }
    },

    /** 刷新/深链进来时没有工作区名，按 workspace/detail 补（接口未就绪时不阻塞） */
    async ensureName() {
      if (this.workspaceName || this.workspaceId === undefined) {
        return;
      }
      try {
        const detail = await aiAssetApi.fetchWorkspaceDetail(this.workspaceId);
        this.workspaceName = detail?.name ?? '';
      } catch {
        this.workspaceName = '';
      }
    },
  },
  state: () => ({
    /** 后端生成的全局菜单快照（退出工作区时还原） */
    globalMenus: [] as AccessMenu[],
    insideDomain: false,
    workspaceId: undefined as number | string | undefined,
    workspaceName: '',
  }),
});
