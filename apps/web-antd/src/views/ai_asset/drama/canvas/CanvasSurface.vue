<script lang="ts" setup name="CanvasSurface">
import type { CanvasNodeKind, CanvasSummary } from '#/api/models/ai_asset_canvas';

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import {
  ControlOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Empty,
  Input,
  message,
  Modal,
  Select,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';
import { aiAssetStoryboardApi } from '#/api/core/ai_asset_storyboard';

import { formatApiError, parseApiError } from '../error';
import CanvasAgentPanel from './CanvasAgentPanel.vue';
import CanvasFlow from './CanvasFlow.vue';
import CanvasOutline from './CanvasOutline.vue';
import CanvasShotDrawer from './CanvasShotDrawer.vue';
import CanvasShotMediaModal from './CanvasShotMediaModal.vue';
import CanvasSplitModal from './CanvasSplitModal.vue';
import CanvasTimelineDrawer from './CanvasTimelineDrawer.vue';
import CanvasToolbar from './CanvasToolbar.vue';
import CanvasVideoActionModal from './CanvasVideoActionModal.vue';
import CanvasViewportControls from './CanvasViewportControls.vue';
import CanvasWorkspace from './CanvasWorkspace.vue';
import {
  type CanvasFlowNode,
  type CanvasShotSceneInfo,
  useCanvasGraphStore,
} from './store';
import { useCanvasShotMedia } from './useCanvasShotMedia';

const props = defineProps<{
  episodeId?: number | string;
  novelId?: number | string;
}>();

const emit = defineEmits<{ openPlot: [] }>();

interface CanvasFlowExpose {
  addNodeAtCenter: (
    kind: CanvasNodeKind,
  ) => Promise<CanvasFlowNode | undefined>;
  fitCanvas: () => Promise<void>;
  fitOnNodesReady: () => void;
  focusGroup: (groupClientId: string) => void;
  focusNode: (clientId: string) => void;
  selectNode: (clientId: string) => void;
  toggleMiniMap: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const store = useCanvasGraphStore();
const flowRef = ref<CanvasFlowExpose>();
const canvasList = ref<CanvasSummary[]>([]);
const currentCanvasId = ref<string>();
const loadingList = ref(false);
const listError = ref('');
const syncError = ref('');
const syncing = ref(false);
const renameOpen = ref(false);
const renameValue = ref('');
const renameTarget = ref<CanvasSummary>();
const outlineOpen = ref(false);
const workspaceOpen = ref(false);
const agentOpen = ref(false);
const syncedEpisodeKeys = new Set<string>();
const flowKey = ref(0);
let sceneInfoSeq = 0;
const workspaceFocus = ref<'entity' | 'material'>();
const splitTargetNode = computed(() =>
  store.splitTargetNodeId
    ? store.nodes.find((node) => node.id === store.splitTargetNodeId)
    : undefined,
);
const shotMedia = useCanvasShotMedia();
const mediaAction = ref<{
  nodeId: string;
  shotId: string;
  type: 'keyframe' | 'segment-video' | 'video';
}>();
const drawerAction = ref<{
  mode: 'edit' | 'expand';
  nodeId: string;
  shotId: string;
}>();
const videoAction = ref<{
  nodeId: string;
  type: 'preview' | 'replace' | 'upload';
}>();
const timelineAction = ref<{
  action: 'compose' | 'open' | 'preview';
  nodeId: string;
}>();
const mediaActionNode = computed(() =>
  mediaAction.value
    ? store.nodes.find((node) => node.id === mediaAction.value?.nodeId)
    : undefined,
);
const drawerActionNode = computed(() =>
  drawerAction.value
    ? store.nodes.find((node) => node.id === drawerAction.value?.nodeId)
    : undefined,
);
const videoActionNode = computed(() =>
  videoAction.value
    ? store.nodes.find((node) => node.id === videoAction.value?.nodeId)
    : undefined,
);
const timelineActionNode = computed(() =>
  timelineAction.value
    ? store.nodes.find((node) => node.id === timelineAction.value?.nodeId)
    : undefined,
);

const canvasOptions = computed(() =>
  canvasList.value.map((item) => ({
    label: item.title || '未命名画布',
    value: item.id,
  })),
);

const statusText = computed(() => {
  if (store.conflict) {
    return '版本冲突';
  }
  if (store.saving) {
    return '保存中…';
  }
  if (store.dirty) {
    return '未保存';
  }
  return store.lastSavedAt ? '已保存' : '未保存';
});

function errorText(error: unknown, fallback: string) {
  return formatApiError(parseApiError(error)) || fallback;
}

function storeViewportIsDefault() {
  const viewportValue = store.viewport;
  return (
    Math.abs(Number(viewportValue.x)) < 0.0001 &&
    Math.abs(Number(viewportValue.y)) < 0.0001 &&
    Math.abs(Number(viewportValue.zoom) - 1) < 0.0001
  );
}

async function fitIfViewportDefault() {
  if (!store.nodes.length || !storeViewportIsDefault()) {
    return;
  }
  await nextTick();
  await flowRef.value?.fitCanvas();
}

/** 画布节点只带脚本场景名；用分镜绑定 sceneId + 资产图谱回显绑定资产名 */
async function loadShotSceneInfo() {
  const seq = ++sceneInfoSeq;
  if (!props.novelId || !props.episodeId) {
    store.setShotSceneInfo({});
    return;
  }
  try {
    const [graph, list] = await Promise.all([
      aiAssetApi.fetchNovelAssetGraph(props.novelId, true),
      aiAssetStoryboardApi.fetchStoryboardList(props.episodeId),
    ]);
    if (seq !== sceneInfoSeq) {
      return;
    }
    const sceneNames = new Map<string, string>();
    for (const scene of graph?.scenes ?? []) {
      sceneNames.set(String(scene.id), scene.name);
    }
    const next: Record<string, CanvasShotSceneInfo> = {};
    for (const segment of list?.segments ?? []) {
      for (const shot of segment.shots ?? []) {
        const sceneId = shot.sceneId;
        const assetName =
          sceneId === undefined || sceneId === null || sceneId === ''
            ? '待关联'
            : (sceneNames.get(String(sceneId)) ?? `场景 #${sceneId}`);
        next[String(shot.shotId)] = {
          assetName,
          scriptName: shot.sceneName ?? '',
        };
      }
    }
    store.setShotSceneInfo(next);
  } catch {
    if (seq === sceneInfoSeq) {
      store.setShotSceneInfo({});
    }
  }
}

async function loadList() {
  if (!props.novelId) {
    canvasList.value = [];
    currentCanvasId.value = undefined;
    store.resetGraph();
    return;
  }
  loadingList.value = true;
  listError.value = '';
  try {
    canvasList.value = await aiAssetCanvasApi.fetchCanvasList(props.novelId);
    if (!canvasList.value.length) {
      currentCanvasId.value = undefined;
      store.resetGraph();
      return;
    }
    if (
      !canvasList.value.some((item) => item.id === currentCanvasId.value)
    ) {
      currentCanvasId.value = canvasList.value[0]?.id;
    }
    if (currentCanvasId.value) {
      await store.loadGraph(currentCanvasId.value);
      flowKey.value += 1;
      await nextTick();
      await fitIfViewportDefault();
    }
  } catch (err) {
    listError.value = errorText(err, '画布列表加载失败');
  } finally {
    loadingList.value = false;
  }
}

async function createCanvas() {
  if (!props.novelId) {
    message.warning('先选择项目');
    return;
  }
  try {
    const canvas = await aiAssetCanvasApi.createCanvas({
      novelId: props.novelId,
      title: `画布 ${canvasList.value.length + 1}`,
    });
    canvasList.value = [...canvasList.value, canvas];
    store.resetGraph();
    currentCanvasId.value = canvas.id;
    await store.loadGraph(canvas.id);
    flowKey.value += 1;
    await nextTick();
    await fitIfViewportDefault();
  } catch (err) {
    message.error(errorText(err, '新建画布失败'));
  }
}

async function selectCanvas(value: unknown) {
  const next =
    typeof value === 'string'
      ? value
      : typeof value === 'number'
        ? String(value)
        : undefined;
  if (!next || next === currentCanvasId.value) {
    return;
  }
  store.resetGraph();
  currentCanvasId.value = next;
  await store.loadGraph(next);
  flowKey.value += 1;
  await nextTick();
  await fitIfViewportDefault();
}

function openRename() {
  const current = canvasList.value.find(
    (item) => item.id === currentCanvasId.value,
  );
  if (!current) {
    return;
  }
  renameTarget.value = current;
  renameValue.value = current.title;
  renameOpen.value = true;
}

async function submitRename() {
  if (!renameTarget.value || !renameValue.value.trim()) {
    return;
  }
  try {
    const updated = await aiAssetCanvasApi.renameCanvas(
      renameTarget.value.id,
      renameValue.value.trim(),
    );
    canvasList.value = canvasList.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
    if (store.canvas?.id === updated.id) {
      store.canvas = { ...store.canvas!, title: updated.title };
    }
    renameOpen.value = false;
  } catch (err) {
    message.error(errorText(err, '重命名失败'));
  }
}

function removeCanvas() {
  const current = canvasList.value.find(
    (item) => item.id === currentCanvasId.value,
  );
  if (!current) {
    return;
  }
  Modal.confirm({
    title: '删除画布？',
    content: '只删除当前画布及其节点、连线、分组，不影响项目下的其他画布。',
    okText: '删除画布',
    cancelText: '取消',
    onOk: async () => {
      try {
        await aiAssetCanvasApi.deleteCanvas(current.id);
        await loadList();
        message.success('画布已删除');
      } catch (err) {
        message.error(errorText(err, '删除画布失败'));
      }
    },
  });
}

async function addNode(kind: CanvasNodeKind) {
  await flowRef.value?.addNodeAtCenter(kind);
}

function refresh() {
  void loadList();
}

function locateTarget(payload: { clientId: string; type: 'group' | 'node' }) {
  if (payload.type === 'group') {
    flowRef.value?.focusGroup(payload.clientId);
    return;
  }
  flowRef.value?.focusNode(payload.clientId);
}

function toggleWorkspace() {
  workspaceOpen.value = !workspaceOpen.value;
  if (workspaceOpen.value) {
    workspaceFocus.value = undefined;
    agentOpen.value = false;
  }
}

function closeWorkspace() {
  workspaceOpen.value = false;
  workspaceFocus.value = undefined;
}

function closeOutline() {
  outlineOpen.value = false;
  store.clearOutlineFocus();
}

function toggleOutline() {
  if (outlineOpen.value) {
    closeOutline();
    return;
  }
  store.clearOutlineFocus();
  outlineOpen.value = true;
}

function toggleAgent() {
  agentOpen.value = !agentOpen.value;
  if (agentOpen.value) {
    workspaceOpen.value = false;
  }
}

async function syncEpisode(force = false) {
  const canvasId = store.canvas?.id ?? currentCanvasId.value;
  const targetEpisode = props.episodeId;
  if (!canvasId || !targetEpisode || syncing.value) {
    return;
  }
  const key = `${String(canvasId)}:${String(targetEpisode)}`;
  if (!force && syncedEpisodeKeys.has(key)) {
    return;
  }
  syncedEpisodeKeys.add(key);
  syncing.value = true;
  syncError.value = '';
  try {
    const result = await aiAssetCanvasApi.syncCanvasEpisode(canvasId, {
      episodeId: targetEpisode,
      includeVideos: true,
    });
    const created =
      (result.createdShots?.length ?? 0) +
      (result.createdVideos?.length ?? 0) +
      (result.createdEdges?.length ?? 0) +
      (result.createdGroups?.length ?? 0);
    if (created > 0) {
      await store.loadGraph(canvasId);
      flowKey.value += 1;
      await nextTick();
      flowRef.value?.fitOnNodesReady();
      message.success(`已加载本集节点（新增 ${created} 项）`);
    } else if (force) {
      message.info('本集节点已是最新，无需重复加载');
    }
  } catch (error) {
    const info = parseApiError(error);
    syncError.value =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '同步接口未就绪'
        : formatApiError(info);
  } finally {
    syncing.value = false;
  }
}

function onSurfaceKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && workspaceOpen.value) {
    workspaceOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', onSurfaceKeydown);
});

watch(
  () => store.nodeInfoRequestId,
  (nodeId) => {
    if (!nodeId) {
      return;
    }
    store.clearNodeInfoRequest();
    workspaceFocus.value = undefined;
    workspaceOpen.value = true;
    agentOpen.value = false;
  },
);

watch(
  () => store.workspaceFocusRequest,
  (mode) => {
    if (!mode) {
      return;
    }
    store.clearWorkspaceFocusRequest();
    workspaceFocus.value = mode;
    workspaceOpen.value = true;
    agentOpen.value = false;
  },
);

watch(
  () => store.outlineFocusGroupId,
  (groupId) => {
    if (!groupId) {
      return;
    }
    outlineOpen.value = true;
    nextTick(() => {
      flowRef.value?.focusGroup(groupId);
    });
  },
);

async function handleQuickTool(
  kind: 'entity' | 'material' | 'plot' | 'timeline',
) {
  if (kind === 'plot') {
    emit('openPlot');
    return;
  }
  if (kind === 'material' || kind === 'entity') {
    workspaceFocus.value = kind;
    workspaceOpen.value = true;
    agentOpen.value = false;
    return;
  }
  const existing = store.nodes.find((node) => node.data.kind === 'timeline');
  if (existing) {
    flowRef.value?.selectNode(existing.id);
    store.requestTimelineAction(existing.id, 'open');
    return;
  }
  const created = await flowRef.value?.addNodeAtCenter('timeline');
  const timelineNode =
    created ?? store.nodes.find((node) => node.data.kind === 'timeline');
  if (timelineNode) {
    await store.flushSave();
    flowRef.value?.selectNode(timelineNode.id);
    store.requestTimelineAction(timelineNode.id, 'open');
  }
}

watch(
  () => store.nodeInfoCloseToken,
  () => {
    if (workspaceOpen.value) {
      workspaceOpen.value = false;
    }
  },
);

watch(
  [() => store.canvas?.id, () => props.episodeId, () => store.initialized],
  ([canvasId, episodeId, initialized]) => {
    if (canvasId && episodeId && initialized) {
      void syncEpisode(false);
    }
  },
);

watch(
  () => props.episodeId,
  (value) => {
    store.setEpisodeId(value);
  },
  { immediate: true },
);

watch(
  [() => props.novelId, () => props.episodeId],
  () => {
    void loadShotSceneInfo();
  },
  { immediate: true },
);

watch(
  () => store.splitTargetNodeId,
  (nodeId) => {
    if (!nodeId) {
      return;
    }
    if (!props.episodeId) {
      message.warning('先在顶部选择剧集');
      store.clearSplitRequest();
      return;
    }
    const target = store.nodes.find((node) => node.id === nodeId);
    if (
      !target ||
      target.data.kind !== 'text' ||
      !target.data.body?.trim()
    ) {
      message.warning('请先填写文本节点内容');
      store.clearSplitRequest();
    }
  },
);

function approveShotKeyframe(shotId: string) {
  if (!store.canvas?.id) {
    return;
  }
  const targetCanvas = store.canvas.id;
  Modal.confirm({
    title: '审批关键帧？',
    content: '将把当前关键帧标记为已审批，不重新生成、不生成视频。',
    okText: '审批',
    cancelText: '取消',
    onOk: async () => {
      try {
        await shotMedia.approveKeyframe(targetCanvas, shotId);
        message.success('关键帧已审批');
      } catch (error) {
        const info = parseApiError(error);
        message.error(
          info.notReady || /static resource|接口未就绪/i.test(info.message)
            ? '接口未就绪'
            : formatApiError(info),
        );
      }
    },
  });
}

async function outputVideoNode(nodeId: string, shotId: string) {
  const canvasId = store.canvas?.id;
  if (!canvasId || !props.episodeId) {
    message.warning('先选择剧集');
    return;
  }
  const shotNode = store.nodes.find((node) => node.id === nodeId);
  if (!shotNode) {
    return;
  }
  await shotMedia.refresh(canvasId, shotId);
  const status = shotMedia.shotState(canvasId, shotId)?.status;
  const selectedTake = status?.segmentTakes?.find((take) => take.isSelected);
  if (!status?.segmentVideoUrl || !selectedTake) {
    message.warning('需先通过并选用本段视频');
    return;
  }
  let asset:
    | undefined
    | {
        durationSeconds?: null | number;
        materialId?: null | number | string;
        subtitleText?: null | string;
      };
  try {
    const assets = await aiAssetCanvasApi.fetchCanvasVideoAssets(
      canvasId,
      props.episodeId,
    );
    asset = assets.items.find(
      (item) => String(item.takeId) === String(selectedTake.takeId),
    );
  } catch (error) {
    message.error(errorText(error, '视频产物接口未就绪'));
    return;
  }
  const materialId = selectedTake.materialId ?? asset?.materialId;
  if (!materialId) {
    message.warning('段视频素材信息未就绪，无法建立视频节点');
    return;
  }
  const result = store.createVideoFromSegment({
    durationSeconds: asset?.durationSeconds,
    episodeId: props.episodeId,
    materialId,
    segmentId: status.segmentId,
    segmentSeq: status.segmentSeq,
    shotId,
    shotNodeId: nodeId,
    subtitleText:
      asset?.subtitleText ||
      (typeof shotNode.data.details?.dialogue === 'string'
        ? shotNode.data.details.dialogue
        : '') ||
      (typeof shotNode.data.details?.description === 'string'
        ? shotNode.data.details.description
        : ''),
    takeId: selectedTake.takeId,
    thumbnailUrl: status.segmentVideoThumbnailUrl,
    url: status.segmentVideoUrl,
  });
  if (!result.node) {
    message.error('视频节点创建失败');
    return;
  }
  let edgeEnsured = result.edgeEnsured;
  if (!edgeEnsured) {
    edgeEnsured = store.ensureVideoEdge(nodeId, result.node.id);
  }
  await store.flushSave();
  const edgePersisted = store.edges.some(
    (edge) =>
      edge.source === nodeId &&
      edge.target === result.node?.id &&
      edge.sourceHandle === 'shot' &&
      edge.targetHandle === 'reference',
  );
  if (!edgeEnsured || !edgePersisted) {
    message.error('视频节点已存在，但 shot→video 连线未建立，请重试修复');
  } else if (result.created) {
    message.success('已输出为视频节点');
  } else {
    message.info('该段视频节点已存在，已聚焦');
  }
  flowRef.value?.selectNode(result.node.id);
}

watch(
  () => store.shotActionRequest,
  (request) => {
    if (!request) {
      return;
    }
    store.clearShotAction();
    const node = store.nodes.find(
      (candidate) => candidate.id === request.nodeId,
    );
    if (!node) {
      return;
    }
    if (request.type === 'approve') {
      approveShotKeyframe(request.shotId);
      return;
    }
    if (request.type === 'output-video') {
      void outputVideoNode(request.nodeId, request.shotId);
      return;
    }
    if (
      request.type === 'keyframe' ||
      request.type === 'video' ||
      request.type === 'segment-video'
    ) {
      mediaAction.value = {
        nodeId: request.nodeId,
        shotId: request.shotId,
        type: request.type,
      };
      return;
    }
    drawerAction.value = {
      mode: request.type === 'edit' ? 'edit' : 'expand',
      nodeId: request.nodeId,
      shotId: request.shotId,
    };
  },
);

watch(
  () => store.videoActionRequest,
  (request) => {
    if (!request) {
      return;
    }
    store.clearVideoAction();
    videoAction.value = { nodeId: request.nodeId, type: request.type };
  },
);

watch(
  () => store.timelineActionRequest,
  (request) => {
    if (!request) {
      return;
    }
    store.clearTimelineAction();
    timelineAction.value = {
      action: request.action,
      nodeId: request.nodeId,
    };
  },
);

watch(
  () => store.canvas?.id,
  () => {
    mediaAction.value = undefined;
    drawerAction.value = undefined;
    videoAction.value = undefined;
    timelineAction.value = undefined;
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onSurfaceKeydown);
  shotMedia.stopAllShotPolling();
});

watch(
  () => props.novelId,
  async () => {
    canvasList.value = [];
    currentCanvasId.value = undefined;
    listError.value = '';
    outlineOpen.value = false;
    workspaceOpen.value = false;
    agentOpen.value = false;
    store.resetGraph();
    await store.loadBlueprints().catch(() => undefined);
    await loadList();
  },
  { immediate: true },
);
</script>

<template>
  <div class="canvas-surface">
    <div class="canvas-surface__topbar">
      <span class="canvas-surface__title">画布</span>
      <span class="canvas-surface__episode">
        {{ episodeId ? `剧集 ID ${episodeId}` : '未选择剧集' }}
      </span>
      <Select
        v-if="canvasList.length"
        :options="canvasOptions"
        :value="currentCanvasId"
        class="canvas-surface__select"
        placeholder="选择画布"
        @change="selectCanvas"
      />
      <Button size="small" :loading="loadingList" @click="refresh">
        <ReloadOutlined />
      </Button>
      <Button size="small" :disabled="!novelId" @click="createCanvas">
        <PlusOutlined />
        新建画布
      </Button>
      <Button
        size="small"
        :disabled="!currentCanvasId"
        @click="openRename"
      >
        重命名
      </Button>
      <Button
        size="small"
        danger
        :disabled="!currentCanvasId"
        @click="removeCanvas"
      >
        <DeleteOutlined />
      </Button>
      <Button
        size="small"
        :disabled="!currentCanvasId"
        @click="toggleOutline"
      >
        <UnorderedListOutlined />
        索引
      </Button>
      <Button
        size="small"
        :disabled="!currentCanvasId"
        :type="workspaceOpen ? 'primary' : 'default'"
        @click="toggleWorkspace"
      >
        <ControlOutlined />
        工作区
      </Button>
      <Button
        size="small"
        :disabled="!currentCanvasId"
        :type="agentOpen ? 'primary' : 'default'"
        @click="toggleAgent"
      >
        <RobotOutlined />
        Agent
      </Button>
      <Button
        :disabled="!currentCanvasId || !episodeId || syncing"
        :loading="syncing"
        size="small"
        @click="syncEpisode(true)"
      >
        加载本集节点
      </Button>
      <span v-if="syncing" class="canvas-surface__episode">
        正在加载本集节点…
      </span>
      <Tag
        v-else-if="syncError"
        :bordered="false"
        :color="syncError === '同步接口未就绪' ? 'default' : 'error'"
        :title="syncError"
      >
        {{ syncError }}
      </Tag>
      <span class="canvas-surface__spacer"></span>
      <Tag
        :color="
          store.conflict ? 'error' : store.dirty ? 'warning' : 'success'
        "
        :bordered="false"
      >
        {{ statusText }}
      </Tag>
      <Button
        size="small"
        :disabled="
          !store.dirty || store.saving || store.conflict
        "
        :loading="store.saving"
        @click="store.saveNow()"
      >
        保存
      </Button>
    </div>

    <Alert
      v-if="listError || store.error"
      class="canvas-surface__alert"
      :message="
        store.conflict
          ? '画布版本冲突：请刷新后重试，当前修改不会覆盖服务端版本'
          : listError || store.error
      "
      type="error"
      show-icon
    />


    <div v-if="!novelId" class="canvas-surface__empty">
      <Empty description="先选择项目，再打开画布" />
    </div>
    <div v-else-if="loadingList" class="canvas-surface__empty">
      <Empty description="画布加载中…" />
    </div>
    <div v-else-if="!canvasList.length" class="canvas-surface__empty">
      <Empty description="这个项目还没有画布">
        <Button type="primary" @click="createCanvas">新建画布</Button>
      </Empty>
    </div>
    <div v-else class="canvas-surface__main">
      <div class="canvas-surface__stage">
        <CanvasFlow :key="flowKey" ref="flowRef" />
        <CanvasToolbar @add="addNode" @quick="handleQuickTool" />
        <CanvasOutline
          v-if="outlineOpen"
          :focus-group-client-id="store.outlineFocusGroupId"
          @close="closeOutline"
          @locate="locateTarget"
        />
        <CanvasViewportControls
          @fit="flowRef?.fitCanvas()"
          @toggle-mini-map="flowRef?.toggleMiniMap()"
          @zoom-in="flowRef?.zoomIn()"
          @zoom-out="flowRef?.zoomOut()"
        />
      </div>
      <CanvasWorkspace
        v-if="workspaceOpen"
        :focus-mode="workspaceFocus"
        :novel-id="novelId"
        @close="closeWorkspace"
      />
      <CanvasAgentPanel
        v-else-if="agentOpen"
        :canvas-id="currentCanvasId"
        @close="agentOpen = false"
        @focus-node="flowRef?.selectNode($event)"
      />
    </div>

    <Modal
      v-model:open="renameOpen"
      title="重命名画布"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitRename"
    >
      <Input v-model:value="renameValue" placeholder="画布名称" />
    </Modal>

    <CanvasSplitModal
      v-if="splitTargetNode && episodeId"
      :canvas-id="currentCanvasId"
      :episode-id="episodeId"
      :node="splitTargetNode"
      @close="store.clearSplitRequest()"
    />

    <CanvasShotMediaModal
      v-if="mediaAction && mediaActionNode"
      :canvas-id="currentCanvasId"
      :node-label="mediaActionNode.data.label"
      :shot-id="mediaAction.shotId"
      :type="mediaAction.type"
      @close="mediaAction = undefined"
    />

    <CanvasShotDrawer
      v-if="drawerAction && drawerActionNode"
      :canvas-id="currentCanvasId"
      :mode="drawerAction.mode"
      :node="drawerActionNode"
      :shot-id="drawerAction.shotId"
      @close="drawerAction = undefined"
    />

    <CanvasVideoActionModal
      v-if="videoAction && videoActionNode"
      :canvas-id="currentCanvasId"
      :episode-id="episodeId"
      :node="videoActionNode"
      :type="videoAction.type"
      @close="videoAction = undefined"
    />

    <CanvasTimelineDrawer
      v-if="timelineAction && timelineActionNode"
      :canvas-id="currentCanvasId"
      :episode-id="episodeId"
      :initial-action="
        timelineAction.action === 'compose'
          ? 'compose'
          : timelineAction.action === 'preview'
            ? 'preview'
            : undefined
      "
      :node="timelineActionNode"
      @close="timelineAction = undefined"
    />
  </div>
</template>

<style scoped lang="scss">
.canvas-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;

  &__topbar {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__episode {
    padding: 1px 6px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 999px;
  }

  &__select {
    width: 190px;
  }

  &__spacer {
    flex: 1;
  }

  &__alert {
    flex: none;
    margin: 8px 10px 0;
  }

  &__empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 320px;
  }

  &__main {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  &__stage {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
}
</style>
