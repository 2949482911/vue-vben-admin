import { $t } from '#/locales';

/**
 * 工作区（B 方案：工作区是一级入口）—— 域内路由与内部菜单的唯一口径
 *
 * 进入工作区后左侧换成这里的内部菜单；路径必须是**真实路由**
 * （见 router/routes/ai-asset-workspace.ts），否则面包屑/页签/跳转会断。
 * 菜单文案走 i18n（page.ai_asset.menu.xxx），双语词条在 locales 的 page.json 里。
 */
export const WORKSPACE_BASE_PATH = '/ai_asset/workspace';

/** 工作区内部菜单项（key 同时是子路由 path 段，labelKey 是 i18n 词条） */
export const WORKSPACE_INTERNAL_MENU: Array<{
  activeIcon: string;
  icon: string;
  key: string;
  labelKey: string;
}> = [
  {
    activeIcon: 'lucide:wand-sparkles',
    icon: 'lucide:sparkles',
    key: 'studio',
    labelKey: 'page.ai_asset.menu.studio',
  },
  {
    activeIcon: 'lucide:file-pen-line',
    icon: 'lucide:file-text',
    key: 'draft',
    labelKey: 'page.ai_asset.menu.draft',
  },
  {
    activeIcon: 'lucide:clipboard-check',
    icon: 'lucide:list-checks',
    key: 'queue',
    labelKey: 'page.ai_asset.menu.queue',
  },
  {
    activeIcon: 'lucide:folder',
    icon: 'lucide:folder-open',
    key: 'assets',
    labelKey: 'page.ai_asset.menu.assets',
  },
  {
    activeIcon: 'lucide:book-open-text',
    icon: 'lucide:book-open',
    key: 'novel',
    labelKey: 'page.ai_asset.menu.novel',
  },
  {
    activeIcon: 'lucide:wrench',
    icon: 'lucide:wrench',
    key: 'tools',
    labelKey: 'page.ai_asset.menu.tools',
  },
  {
    activeIcon: 'lucide:user-check',
    icon: 'lucide:user',
    key: 'persona',
    labelKey: 'page.ai_asset.menu.persona',
  },
  {
    activeIcon: 'lucide:settings-2',
    icon: 'lucide:settings',
    key: 'settings',
    labelKey: 'page.ai_asset.menu.settings',
  },
];

/** 域内某个页面的绝对路径 */
export function workspacePagePath(
  workspaceId: number | string,
  key: string,
): string {
  return `${WORKSPACE_BASE_PATH}/${workspaceId}/${key}`;
}

/** 从任意路径解析出工作区 ID（不在域内返回 undefined） */
export function parseWorkspaceId(path: string): string | undefined {
  if (!path.startsWith(`${WORKSPACE_BASE_PATH}/`)) {
    return undefined;
  }
  // /ai_asset/workspace/{wsId}/{page} → 取第一段，别写成 [, wsId]（那会取到第二段的页面 key）
  const [wsId] = path.slice(WORKSPACE_BASE_PATH.length + 1).split('/');
  return wsId || undefined;
}

/**
 * 进入工作区后要替换进左侧菜单的项（MenuRecordRaw 结构，路径带 {workspaceId}）
 *
 * 注意：vben 侧边栏直接渲染菜单项的 `name` 字段（不额外做 i18n），所以这里先翻译。
 */
export function buildWorkspaceMenus(workspaceId: number | string) {
  return WORKSPACE_INTERNAL_MENU.map((item, index) => ({
    activeIcon: item.activeIcon,
    icon: item.icon,
    name: $t(item.labelKey),
    order: index,
    path: workspacePagePath(workspaceId, item.key),
  }));
}
