import type { Connection } from '@vue-flow/core';

import type { CSSProperties } from 'vue';

import type {
  CanvasBlueprint,
  CanvasGraph,
  CanvasGraphEdge,
  CanvasGraphNode,
  CanvasGroup,
  CanvasNodeKind,
  CanvasSaveRequest,
  CanvasSummary,
} from '#/api/models/ai_asset_canvas';

import { computed, ref } from 'vue';

import { message } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { formatApiError, parseApiError } from '../error';

export interface CanvasFlowNodeData {
  assetId?: null | string;
  body?: null | string;
  clientId: string;
  details?: null | Record<string, unknown>;
  groupClientId?: null | string;
  height: number;
  kind: CanvasNodeKind;
  label: string;
  nodeStatus?: string;
  referenceIds?: Array<number | string>;
  width: number;
}

export interface CanvasFlowNode {
  data: CanvasFlowNodeData;
  id: string;
  position: { x: number; y: number };
  selected?: boolean;
  style?: CSSProperties;
  type: string;
  zIndex?: number;
}

export interface CanvasFlowEdge {
  data?: Record<string, unknown>;
  id: string;
  label?: string;
  source: string;
  sourceHandle?: null | string;
  target: string;
  targetHandle?: null | string;
  type?: string;
}

const KIND_RANK: Record<string, number> = {
  text: 0,
  storyboard: 1,
  workflow: 2,
  prompt: 3,
  shot: 4,
  subcanvas: 5,
  entity: 6,
  scene3d: 6,
  director3d: 6,
  codeVideo: 6,
  timeline: 6,
  character: 6,
  image: 7,
  video: 8,
  audio: 9,
};

const NODE_GAP_X = 48;
const NODE_GAP_Y = 56;
const BLOCK_GAP_Y = 90;
const ORIGIN_X = 80;
const ORIGIN_Y = 80;

function makeClientId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${random}`;
}

export const useCanvasGraphStore = defineStore('aiAssetCanvasGraph', () => {
  const blueprints = ref<Record<string, CanvasBlueprint>>({});
  const canvas = ref<CanvasSummary>();
  const nodes = ref<CanvasFlowNode[]>([]);
  const edges = ref<CanvasFlowEdge[]>([]);
  const groups = ref<CanvasGroup[]>([]);
  const viewport = ref({ x: 0, y: 0, zoom: 1 });
  const selectedNodeIds = ref<string[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const dirty = ref(false);
  const conflict = ref(false);
  const error = ref('');
  const lastSavedAt = ref('');
  const snapToGrid = ref(true);
  const hideEdges = ref(false);
  const initialized = ref(false);
  const groupReferenceSource = ref<string>();

  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let changeSeq = 0;
  let graphEpoch = 0;

  const hasCanvas = computed(() => Boolean(canvas.value));
  const nodeCount = computed(() => nodes.value.length);
  const edgeCount = computed(() => edges.value.length);
  const groupCount = computed(() => groups.value.length);
  const groupReferenceTitle = computed(() => {
    const group = groups.value.find(
      (item) => item.clientId === groupReferenceSource.value,
    );
    return group?.title ?? '';
  });

  function blueprintOf(kind: string): CanvasBlueprint | undefined {
    return blueprints.value[kind];
  }

  function setBlueprints(list: CanvasBlueprint[]) {
    blueprints.value = Object.fromEntries(list.map((item) => [item.kind, item]));
  }

  function cancelScheduledSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = undefined;
    }
  }

  function scheduleSave() {
    cancelScheduledSave();
    saveTimer = setTimeout(() => {
      saveTimer = undefined;
      void saveNow();
    }, 700);
  }

  function applyGraph(graph: CanvasGraph) {
    cancelScheduledSave();
    graphEpoch += 1;
    canvas.value = graph.canvas;
    viewport.value = {
      x: Number(graph.canvas.viewportX ?? 0),
      y: Number(graph.canvas.viewportY ?? 0),
      zoom: Number(graph.canvas.zoom ?? 1),
    };
    groups.value = graph.groups ?? [];
    nodes.value = (graph.nodes ?? []).map(toFlowNode);
    edges.value = (graph.edges ?? []).map(toFlowEdge);
    selectedNodeIds.value = [];
    dirty.value = false;
    conflict.value = false;
    error.value = '';
    groupReferenceSource.value = undefined;
    lastSavedAt.value = new Date().toISOString();
    initialized.value = true;
  }

  function resetGraph() {
    cancelScheduledSave();
    graphEpoch += 1;
    canvas.value = undefined;
    nodes.value = [];
    edges.value = [];
    groups.value = [];
    viewport.value = { x: 0, y: 0, zoom: 1 };
    selectedNodeIds.value = [];
    dirty.value = false;
    conflict.value = false;
    error.value = '';
    lastSavedAt.value = '';
    groupReferenceSource.value = undefined;
    initialized.value = false;
  }

  async function loadBlueprints() {
    setBlueprints(await aiAssetCanvasApi.fetchBlueprints());
  }

  async function loadGraph(canvasId: number | string) {
    if (String(canvas.value?.id ?? '') !== String(canvasId)) {
      resetGraph();
    }
    loading.value = true;
    error.value = '';
    try {
      applyGraph(await aiAssetCanvasApi.fetchCanvas(canvasId));
    } catch (err) {
      error.value = formatApiError(parseApiError(err));
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function toFlowNode(node: CanvasGraphNode): CanvasFlowNode {
    const blueprint = blueprintOf(node.kind);
    const width = node.width || blueprint?.width || 360;
    const height = node.height || blueprint?.height || 260;
    return {
      id: node.clientId,
      type: 'canvas',
      position: { x: Number(node.x ?? 0), y: Number(node.y ?? 0) },
      data: {
        clientId: node.clientId,
        kind: node.kind,
        label: node.label || blueprint?.label || node.kind,
        body: node.body,
        details: node.details,
        assetId: node.assetId,
        referenceIds: node.referenceIds ?? [],
        groupClientId: node.groupClientId,
        nodeStatus: node.nodeStatus || 'ready',
        width,
        height,
      },
      style: { width: `${width}px`, height: `${height}px` },
    };
  }

  function toFlowEdge(edge: CanvasGraphEdge): CanvasFlowEdge {
    return {
      id: edge.clientId,
      source: edge.sourceNodeClientId,
      target: edge.targetNodeClientId,
      sourceHandle: edge.sourcePort,
      targetHandle: edge.targetPort,
      label: edge.label || '引用',
      type: 'canvas',
      data: {
        clientId: edge.clientId,
        referenceType: edge.referenceType || 'uses',
        style: edge.style ?? undefined,
      },
    };
  }

  function markDirty() {
    dirty.value = true;
    changeSeq += 1;
    if (conflict.value) {
      return;
    }
    scheduleSave();
  }

  function touch() {
    markDirty();
  }

  function buildPayload(): CanvasSaveRequest {
    return {
      baseRevision: canvas.value?.revision ?? '0',
      viewport: { ...viewport.value },
      nodes: nodes.value.map((node) => ({
        clientId: node.data.clientId,
        kind: node.data.kind,
        label: node.data.label,
        body: node.data.body,
        details: node.data.details,
        assetId: node.data.assetId ?? undefined,
        referenceIds: node.data.referenceIds ?? [],
        x: node.position.x,
        y: node.position.y,
        width: node.data.width,
        height: node.data.height,
        groupClientId: node.data.groupClientId,
        zIndex: node.zIndex ?? 0,
        nodeStatus: node.data.nodeStatus,
      })),
      edges: edges.value.map((edge) => ({
        clientId: String(edge.data?.clientId ?? edge.id),
        sourceNodeClientId: String(edge.source),
        sourcePort: String(edge.sourceHandle ?? ''),
        targetNodeClientId: String(edge.target),
        targetPort: String(edge.targetHandle ?? ''),
        referenceType: String(edge.data?.referenceType ?? 'uses'),
        label: typeof edge.label === 'string' ? edge.label : '引用',
        style: edge.data?.style as Record<string, unknown> | undefined,
      })),
      groups: groups.value.map((group) => ({
        clientId: group.clientId,
        parentGroupClientId: group.parentGroupClientId ?? null,
        title: group.title,
        color: group.color ?? undefined,
        collapsed: group.collapsed ?? 0,
        sort: group.sort ?? 0,
      })),
    };
  }

  /**
   * 保存是图快照 + revision CAS：成功后只推进 revision，
   * 保存期间产生的新编辑保持 dirty 并补一次保存，避免旧响应覆盖新操作。
   */
  async function saveNow() {
    if (!canvas.value || saving.value) {
      return;
    }
    if (conflict.value) {
      message.warning('画布版本冲突，请刷新后重试');
      return;
    }
    if (!dirty.value) {
      return;
    }
    cancelScheduledSave();
    const targetCanvasId = canvas.value.id;
    const epoch = graphEpoch;
    const seq = changeSeq;
    const payload = buildPayload();
    saving.value = true;
    error.value = '';
    try {
      const saved = await aiAssetCanvasApi.saveCanvas(targetCanvasId, payload);
      if (
        epoch !== graphEpoch ||
        String(canvas.value?.id) !== String(targetCanvasId)
      ) {
        return;
      }
      canvas.value = saved.canvas;
      lastSavedAt.value = new Date().toISOString();
      if (seq === changeSeq) {
        dirty.value = false;
      } else {
        scheduleSave();
      }
    } catch (err) {
      if (epoch !== graphEpoch) {
        return;
      }
      const info = parseApiError(err);
      conflict.value = info.status === 409;
      error.value = formatApiError(info);
      message.error(error.value);
    } finally {
      saving.value = false;
      if (
        dirty.value &&
        !saveTimer &&
        !conflict.value &&
        !error.value
      ) {
        scheduleSave();
      }
    }
  }

  /** 绑定后等待保存真正落库；含保存中的并发请求与二次 dirty */
  async function flushSave() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (!dirty.value && !saving.value) {
        return !conflict.value;
      }
      await saveNow();
      if (!dirty.value && !saving.value) {
        return !conflict.value;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return !dirty.value && !saving.value && !conflict.value;
  }

  function addNode(
    kind: CanvasNodeKind,
    position: { x: number; y: number },
  ): CanvasFlowNode | undefined {
    const blueprint = blueprintOf(kind);
    if (!blueprint) {
      message.warning(`节点蓝图未加载：${kind}`);
      return undefined;
    }
    const clientId = makeClientId('node');
    const node: CanvasFlowNode = {
      id: clientId,
      type: 'canvas',
      position: { ...position },
      data: {
        clientId,
        kind,
        label: blueprint.label,
        body: '',
        details: {},
        referenceIds: [],
        nodeStatus: 'ready',
        width: blueprint.width,
        height: blueprint.height,
      },
      style: { width: `${blueprint.width}px`, height: `${blueprint.height}px` },
    };
    nodes.value = [...nodes.value, node];
    markDirty();
    return node;
  }

  function updateNodeData(id: string, patch: Partial<CanvasFlowNodeData>) {
    const node = nodes.value.find((item) => item.id === id);
    if (!node) {
      return;
    }
    node.data = { ...node.data, ...patch } as CanvasFlowNodeData;
    if (patch.width || patch.height) {
      const width = patch.width ?? node.data.width;
      const height = patch.height ?? node.data.height;
      node.data.width = width;
      node.data.height = height;
      node.style = { ...node.style, width: `${width}px`, height: `${height}px` };
    }
    markDirty();
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter((node) => node.id !== id);
    edges.value = edges.value.filter(
      (edge) => edge.source !== id && edge.target !== id,
    );
    markDirty();
  }

  function isValidConnection(connection: Connection): boolean {
    if (!connection.source || !connection.target) {
      return false;
    }
    if (connection.source === connection.target) {
      return false;
    }
    const source = nodes.value.find((node) => node.id === connection.source);
    const target = nodes.value.find((node) => node.id === connection.target);
    if (!source || !target) {
      return false;
    }
    const sourceBlueprint = blueprintOf(source.data.kind);
    const targetBlueprint = blueprintOf(target.data.kind);
    const sourcePort = sourceBlueprint?.outputs.find(
      (port) => port.id === connection.sourceHandle,
    );
    const targetPort = targetBlueprint?.inputs.find(
      (port) => port.id === connection.targetHandle,
    );
    if (!sourcePort || !targetPort) {
      return false;
    }
    return Boolean(targetPort.accepts?.includes(sourcePort.valueType));
  }

  function hasEdge(
    source: string,
    target: string,
    sourceHandle?: null | string,
    targetHandle?: null | string,
  ) {
    return edges.value.some(
      (edge) =>
        edge.source === source &&
        edge.target === target &&
        edge.sourceHandle === sourceHandle &&
        edge.targetHandle === targetHandle,
    );
  }

  function addConnection(
    source: string,
    target: string,
    sourceHandle?: null | string,
    targetHandle?: null | string,
  ): boolean {
    if (!isValidConnection({ source, target, sourceHandle, targetHandle })) {
      return false;
    }
    if (hasEdge(source, target, sourceHandle, targetHandle)) {
      return false;
    }
    const clientId = makeClientId('edge');
    edges.value = [
      ...edges.value,
      {
        id: clientId,
        source,
        target,
        sourceHandle,
        targetHandle,
        label: '引用',
        type: 'canvas',
        data: { clientId, referenceType: 'uses' },
      },
    ];
    markDirty();
    return true;
  }

  function connect(connection: Connection): boolean {
    if (!isValidConnection(connection)) {
      message.warning('这两个端口不能连接');
      return false;
    }
    return addConnection(
      connection.source,
      connection.target,
      connection.sourceHandle,
      connection.targetHandle,
    );
  }

  function removeEdge(id: string) {
    edges.value = edges.value.filter((edge) => edge.id !== id);
    markDirty();
  }

  function addGroupFromSelection(): CanvasGroup | undefined {
    if (!selectedNodeIds.value.length) {
      message.warning('先选择要分组的节点');
      return undefined;
    }
    const clientId = makeClientId('group');
    const group: CanvasGroup = {
      id: clientId,
      clientId,
      parentGroupClientId: null,
      title: '新建分组',
      color: 'blue',
      collapsed: 0,
      sort: groups.value.length,
    };
    groups.value = [...groups.value, group];
    nodes.value = nodes.value.map((node) =>
      selectedNodeIds.value.includes(node.id)
        ? ({
            ...node,
            data: { ...node.data, groupClientId: clientId },
          } as CanvasFlowNode)
        : node,
    );
    markDirty();
    return group;
  }

  function renameGroup(clientId: string, title: string) {
    groups.value = groups.value.map((group) =>
      group.clientId === clientId ? { ...group, title } : group,
    );
    markDirty();
  }

  function removeGroup(clientId: string) {
    const target = groups.value.find((group) => group.clientId === clientId);
    if (!target) {
      return;
    }
    const parent = target.parentGroupClientId ?? null;
    groups.value = groups.value
      .filter((group) => group.clientId !== clientId)
      .map((group) =>
        group.parentGroupClientId === clientId
          ? { ...group, parentGroupClientId: parent }
          : group,
      );
    nodes.value = nodes.value.map((node) =>
      node.data.groupClientId === clientId
        ? ({
            ...node,
            data: { ...node.data, groupClientId: parent },
          } as CanvasFlowNode)
        : node,
    );
    markDirty();
  }

  /** 分组包含自身与所有后代的 clientId（含循环保护） */
  function groupChainIds(rootClientId: string): string[] {
    const ids = new Set<string>([rootClientId]);
    let added = true;
    while (added) {
      added = false;
      for (const group of groups.value) {
        const parent = group.parentGroupClientId;
        if (parent && ids.has(parent) && !ids.has(group.clientId)) {
          ids.add(group.clientId);
          added = true;
        }
      }
    }
    return [...ids];
  }

  function memberNodes(groupClientId: string): CanvasFlowNode[] {
    const ids = new Set(groupChainIds(groupClientId));
    return nodes.value.filter(
      (node) => node.data.groupClientId && ids.has(node.data.groupClientId),
    );
  }

  function groupBounds(groupClientId: string) {
    const members = memberNodes(groupClientId);
    if (!members.length) {
      return undefined;
    }
    const minX = Math.min(...members.map((node) => node.position.x));
    const minY = Math.min(...members.map((node) => node.position.y));
    const maxX = Math.max(
      ...members.map((node) => node.position.x + node.data.width),
    );
    const maxY = Math.max(
      ...members.map((node) => node.position.y + node.data.height),
    );
    return {
      x: minX - 28,
      y: minY - 42,
      width: maxX - minX + 56,
      height: maxY - minY + 70,
    };
  }

  function beginGroupReference(clientId: string) {
    groupReferenceSource.value = clientId;
  }

  function cancelGroupReference() {
    groupReferenceSource.value = undefined;
  }

  /**
   * 分组引用：按成员输出端口与目标输入端口的兼容规则批量建边；
   * 每个成员最多建一条，返回新建与已存在的数量，由调用方提示。
   */
  function referenceGroupToNode(groupClientId: string, targetNodeId: string) {
    const target = nodes.value.find((node) => node.id === targetNodeId);
    const targetBlueprint = target ? blueprintOf(target.data.kind) : undefined;
    if (!target || !targetBlueprint) {
      return { created: 0, existing: 0 };
    }
    let created = 0;
    let existing = 0;
    for (const member of memberNodes(groupClientId)) {
      if (member.id === targetNodeId) {
        continue;
      }
      const memberBlueprint = blueprintOf(member.data.kind);
      if (!memberBlueprint) {
        continue;
      }
      for (const input of targetBlueprint.inputs) {
        const output = memberBlueprint.outputs.find((port) =>
          input.accepts?.includes(port.valueType),
        );
        if (!output) {
          continue;
        }
        if (hasEdge(member.id, targetNodeId, output.id, input.id)) {
          existing += 1;
          break;
        }
        if (addConnection(member.id, targetNodeId, output.id, input.id)) {
          created += 1;
          break;
        }
      }
    }
    return { created, existing };
  }

  function layoutBlock(block: CanvasFlowNode[], startY: number) {
    const columns = Math.max(1, Math.ceil(Math.sqrt(block.length)));
    let y = startY;
    for (let index = 0; index < block.length; index += columns) {
      const row = block.slice(index, index + columns);
      let x = ORIGIN_X;
      let rowHeight = 0;
      for (const node of row) {
        node.position = { x, y };
        x += node.data.width + NODE_GAP_X;
        rowHeight = Math.max(rowHeight, node.data.height);
      }
      y += rowHeight + NODE_GAP_Y;
    }
    return y;
  }

  /** 自动整理按分组整块排版：组内节点连续放置，分组框保持包住成员 */
  function autoArrange() {
    const groupIds = new Set(groups.value.map((group) => group.clientId));
    const rootGroups = groups.value
      .filter(
        (group) =>
          !group.parentGroupClientId || !groupIds.has(group.parentGroupClientId),
      )
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    const placed = new Set<string>();
    const blocks: CanvasFlowNode[][] = [];
    for (const group of rootGroups) {
      const members = memberNodes(group.clientId).filter(
        (node) => !placed.has(node.id),
      );
      if (!members.length) {
        continue;
      }
      members.forEach((node) => placed.add(node.id));
      blocks.push(members);
    }
    const rest = nodes.value.filter((node) => !placed.has(node.id));
    if (rest.length) {
      blocks.push(rest);
    }
    let cursorY = ORIGIN_Y;
    for (const block of blocks) {
      block.sort((a, b) => {
        const rank =
          (KIND_RANK[a.data.kind] ?? 50) - (KIND_RANK[b.data.kind] ?? 50);
        if (rank !== 0) {
          return rank;
        }
        return a.position.y - b.position.y || a.position.x - b.position.x;
      });
      cursorY = layoutBlock(block, cursorY) + BLOCK_GAP_Y;
    }
    markDirty();
  }

  function setViewport(next: { x: number; y: number; zoom: number }) {
    const current = viewport.value;
    if (
      current.x === next.x &&
      current.y === next.y &&
      current.zoom === next.zoom
    ) {
      return;
    }
    viewport.value = next;
    markDirty();
  }

  function setSelection(selection: string[]) {
    selectedNodeIds.value = selection;
  }

  return {
    addGroupFromSelection,
    addNode,
    applyGraph,
    autoArrange,
    beginGroupReference,
    blueprintOf,
    blueprints,
    buildPayload,
    cancelGroupReference,
    canvas,
    conflict,
    connect,
    dirty,
    edgeCount,
    edges,
    error,
    flushSave,
    groupBounds,
    groupChainIds,
    groupCount,
    groupReferenceSource,
    groupReferenceTitle,
    groups,
    hasCanvas,
    hideEdges,
    initialized,
    isValidConnection,
    lastSavedAt,
    loadBlueprints,
    loadGraph,
    loading,
    memberNodes,
    nodeCount,
    nodes,
    referenceGroupToNode,
    removeEdge,
    removeGroup,
    removeNode,
    renameGroup,
    resetGraph,
    saveNow,
    saving,
    selectedNodeIds,
    setSelection,
    setViewport,
    snapToGrid,
    touch,
    updateNodeData,
    viewport,
  };
});
