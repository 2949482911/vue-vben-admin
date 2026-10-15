import type { UserInfo } from '@vben/types';

/**
 * 后端菜单归一化：把「AI 资产工作台」整组收敛成单个一级「工作区」
 *
 * B 方案下工作区是一级入口：组内其它页面（创作工作台 / 草稿区 / 任务队列 / 素材库 / 资产）
 * 改成工作区内部菜单（见 views/ai_asset/workspace/menu.ts），不再出现在全局菜单里
 * —— 它们不带 X-Workspace-Id 请求头，留在域外会查空/报错。
 *
 * 目标菜单：概览 / 推广 / 营销 / 工具 / 竞品 / 归因 / 工作区 / 系统。
 * 后端菜单表收口后，删掉 access.ts 里的这次调用即可。
 */
type MenuNode = UserInfo['menu'][number];

/** 兜底路径/组件：后端菜单里找不到工作区列表页时用 */
const WORKSPACE_FALLBACK = {
  component: 'ai_asset/workspace/index',
  name: 'AiAssetWorkspaceEntry',
  path: '/ai_asset/workspace',
};

/** 命中 AI 资产工作台整组（按路径前缀或标题） */
function isAiAssetGroup(node: MenuNode): boolean {
  const path = String(node.path ?? '');
  if (path === '/ai_asset' || path.startsWith('/ai_asset/')) {
    return true;
  }
  if (path === '/ai-asset' || path.startsWith('/ai-asset/')) {
    return true;
  }
  const title = String(node.meta?.title ?? '');
  return title.includes('资产工作台');
}

/** 组内的工作区列表页节点（组件/路径指向 workspace） */
function findWorkspaceLeaf(node: MenuNode): MenuNode | undefined {
  const component = String(node.component ?? '');
  const path = String(node.path ?? '');
  if (component.includes('workspace/index') || /\/workspace$/.test(path)) {
    return node;
  }
  for (const child of node.children ?? []) {
    const found = findWorkspaceLeaf(child);
    if (found) {
      return found;
    }
  }
  return undefined;
}

/** 用找到的列表页节点信息生成一级「工作区」，找不到就用兜底（标题尊重后端返回值） */
function buildWorkspaceEntry(node?: MenuNode): MenuNode {
  const leaf = node ? findWorkspaceLeaf(node) : undefined;
  return {
    component: leaf?.component ?? WORKSPACE_FALLBACK.component,
    meta: { ...(leaf?.meta ?? {}), title: leaf?.meta?.title ?? '工作区' },
    name: leaf?.name ?? WORKSPACE_FALLBACK.name,
    path: leaf?.path ?? WORKSPACE_FALLBACK.path,
  };
}

export function normalizeAiAssetMenu(menus: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = [];
  let placed = false;

  for (const node of menus) {
    if (!isAiAssetGroup(node)) {
      result.push(node);
      continue;
    }
    // 命中整组：只在原位置放一个「工作区」，其余节点全部丢弃
    if (!placed) {
      result.push(buildWorkspaceEntry(node));
      placed = true;
    }
  }

  // 后端菜单里还没有这组节点：兜底造一个，放在「系统」之前
  if (!placed) {
    const entry = buildWorkspaceEntry();
    const systemIndex = result.findIndex((node) =>
      String(node.meta?.title ?? '').includes('系统'),
    );
    if (systemIndex === -1) {
      result.push(entry);
    } else {
      result.splice(systemIndex, 0, entry);
    }
  }

  return result;
}
