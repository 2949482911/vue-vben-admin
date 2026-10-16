import { useAccessStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { aiAssetApi } from '#/api';
import { PICKER_PAGE_SIZE } from '#/views/ai_asset/constants';
import {
  buildWorkspaceMenus,
  parseWorkspaceId,
} from '#/views/ai_asset/workspace/menu';

type AccessMenu = ReturnType<typeof useAccessStore>['accessMenus'][number];

/** 工作区下拉选项 */
export interface WorkspaceOption {
  label: string;
  value: number | string;
}

/**
 * 工作区上下文（B 方案：工作区是一级入口）
 *
 * - 当前工作区以**路由**为准（/ai_asset/workspace/:wsId/**），守卫每次导航后同步进来，刷新可还原
 * - 进入工作区 → 左侧菜单换成工作区内部菜单；离开 → 还原后端生成的全局菜单
 * - workspaceId 供 request 拦截器注入 `X-Workspace-Id` 请求头
 *
 * 注意：vben 的 LayoutContent 用 `:key="getTabKey(route)"` 渲染路由组件，路径一变域布局就会重挂载，
 * 所以工作区列表这种「一次就够」的数据放在 store 里缓存，别放在组件 onMounted 里。
 */
export const useWorkspaceStore = defineStore('ai-asset-workspace', {
  actions: {
    /** 工作区下拉选项：只请求一次（`force` 用于新建工作区后刷新） */
    async loadWorkspaceOptions(force = false) {
      if (this.optionsLoaded && !force) {
        return;
      }
      try {
        const res = await aiAssetApi.fetchWorkspaces({
          page: 1,
          pageSize: PICKER_PAGE_SIZE,
        });
        this.setWorkspaceOptions(res?.items ?? []);
      } catch {
        this.options = [];
      }
    },

    /** 用已有的工作区列表直接建缓存（工作区列表页加载后同步，避免域内再请求一次） */
    setWorkspaceOptions(items: Array<{ id: number | string; name?: string }>) {
      this.options = items.map((item) => ({
        label: item.name || `工作区 #${item.id}`,
        value: item.id,
      }));
      this.optionsLoaded = true;
    },

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
    /** 工作区下拉选项（缓存，切换/重挂载不再重复请求） */
    options: [] as WorkspaceOption[],
    optionsLoaded: false,
    workspaceId: undefined as number | string | undefined,
    workspaceName: '',
  }),
});
