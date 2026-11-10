import type { WorkflowBlocker } from '#/api/models/ai_asset_workflow';

export type EntityGroup = 'character' | 'element' | 'scene';

export type NavigateTarget =
  | 'entities'
  | 'episodes'
  | 'script'
  | 'storyboard'
  | 'style';

export interface NavigatePayload {
  entityId?: number | string;
  entityName?: string;
  group?: EntityGroup;
  target: NavigateTarget;
}

export const ACTIVE_STATUSES = new Set([
  'confirmed',
  'needsdecision',
  'pending',
  'pendingconfirm',
  'running',
  'waitingconfirm',
]);

export function normalizeKey(value?: string) {
  return String(value ?? '')
    .replaceAll(/[-_\s]/g, '')
    .toLowerCase();
}

export function isActiveStatus(value?: string) {
  return ACTIVE_STATUSES.has(normalizeKey(value));
}

/** 后端 currentStage 使用 stage.code，不能按前端旧 key 映射 */
export function stageLabel(value?: string) {
  const labels: Record<string, string> = {
    assetview: '三视图',
    entity: '实体',
    storyboardimage: '分镜图',
    storyboardprompt: '分镜与提示词',
    style: '风格',
    video: '视频',
  };
  return labels[normalizeKey(value)] ?? value ?? '';
}

export function taskStatusMeta(value?: string) {
  switch (normalizeKey(value)) {
    case 'cancelled': {
      return { color: 'default', label: '已取消' };
    }
    case 'completed': {
      return { color: 'success', label: '完成' };
    }
    case 'confirmed': {
      return { color: 'processing', label: '已确认' };
    }
    case 'failed': {
      return { color: 'error', label: '失败' };
    }
    case 'needsdecision': {
      return { color: 'warning', label: '需要你决定' };
    }
    case 'running': {
      return { color: 'processing', label: '执行中' };
    }
    case 'pendingconfirm':
    case 'waitingconfirm':
    case 'pending': {
      return { color: 'default', label: '待确认' };
    }
    default: {
      return { color: 'default', label: value || '—' };
    }
  }
}

export function sectionStatusMeta(value?: string) {
  switch (normalizeKey(value)) {
    case 'completed':
    case 'ready':
    case 'succeeded':
    case 'success': {
      return { color: 'success', label: '已就绪' };
    }
    case 'partial': {
      return { color: 'warning', label: '部分就绪' };
    }
    case 'failed':
    case 'error': {
      return { color: 'error', label: '失败' };
    }
    case 'reused': {
      return { color: 'blue', label: '复用' };
    }
    case 'running': {
      return { color: 'processing', label: '生成中' };
    }
    case 'skipped': {
      return { color: 'default', label: '已跳过' };
    }
    default: {
      return { color: 'default', label: '待生成' };
    }
  }
}

export function entityStatusMeta(value?: string) {
  switch (normalizeKey(value)) {
    case 'ready':
    case 'succeeded':
    case 'completed': {
      return { color: 'success', label: '已生成' };
    }
    case 'failed':
    case 'error': {
      return { color: 'error', label: '失败' };
    }
    case 'reused': {
      return { color: 'blue', label: '复用' };
    }
    case 'running': {
      return { color: 'processing', label: '生成中' };
    }
    default: {
      return { color: 'default', label: '待生成' };
    }
  }
}

/** 阻断项的可操作提示；不本地计算段，只提示用户调整上限 */
export function blockerHint(blocker: WorkflowBlocker) {
  const code = normalizeKey(blocker.code);
  const action = normalizeKey(blocker.action);
  if (
    code === 'segmentscopeexceeded' ||
    action === 'segmentscopeexceeded'
  ) {
    return '提高镜头上限';
  }
  return '';
}

/** 后端 blocker action → 页面深链 */
export function blockerNavigate(
  blocker: WorkflowBlocker,
): NavigateTarget | undefined {
  switch (normalizeKey(blocker.action)) {
    case 'gostoryboard': {
      return 'storyboard';
    }
    case 'goproject': {
      return 'style';
    }
    case 'goassets': {
      return 'entities';
    }
    default: {
      return undefined;
    }
  }
}
