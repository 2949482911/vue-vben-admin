<script lang="ts" setup name="CanvasFlow">
import type { Connection } from '@vue-flow/core';

import type { CanvasFlowEdge } from './store';

import type { CanvasNodeKind } from '#/api/models/ai_asset_canvas';

import {
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import { Background } from '@vue-flow/background';
import { useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';

import CanvasEdge from './CanvasEdge.vue';
import CanvasGroupLayer from './CanvasGroupLayer.vue';
import CanvasNodeFrame from './CanvasNodeFrame.vue';
import { useCanvasGraphStore } from './store';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/minimap/dist/style.css';

const store = useCanvasGraphStore();
const { edges, nodes } = storeToRefs(store);
const nodeTypes: Record<string, any> = { canvas: markRaw(CanvasNodeFrame) };
const edgeTypes: Record<string, any> = { canvas: markRaw(CanvasEdge) };
const flowEdges = ref<CanvasFlowEdge[]>([]);
let nodesReady = false;
const wrapper = ref<HTMLElement>();
const showMiniMap = ref(false);

const {
  addSelectedNodes,
  findNode,
  fitBounds,
  fitView,
  getNodes,
  getSelectedNodes,
  removeSelectedNodes,
  screenToFlowCoordinate,
  setCenter,
  setViewport,
  viewport: flowViewport,
  zoomIn,
  zoomOut,
} = useVueFlow();

const edgeOptions = {
  type: 'canvas',
  labelShowBg: true,
  labelStyle: {
    fill: 'hsl(var(--muted-foreground))',
    fontSize: '11px',
  },
  labelBgStyle: {
    fill: 'hsl(var(--background))',
  },
  labelBgPadding: [4, 2] as [number, number],
  labelBgBorderRadius: 4,
};

const isEmpty = computed(() => nodes.value.length === 0);
const viewportTransform = computed(() => ({ ...flowViewport.value }));

function isDefaultViewport(viewportValue: {
  x: number;
  y: number;
  zoom: number;
}) {
  return (
    Math.abs(Number(viewportValue.x)) < 0.0001 &&
    Math.abs(Number(viewportValue.y)) < 0.0001 &&
    Math.abs(Number(viewportValue.zoom) - 1) < 0.0001
  );
}

function viewportContainsAllNodes(viewportValue: {
  x: number;
  y: number;
  zoom: number;
}) {
  if (!store.nodes.length) {
    return true;
  }
  const rect = wrapper.value?.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  const zoom = Number(viewportValue.zoom) || 1;
  const visible = {
    x: -viewportValue.x / zoom,
    y: -viewportValue.y / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom,
  };
  const minX = Math.min(...store.nodes.map((node) => node.position.x));
  const minY = Math.min(...store.nodes.map((node) => node.position.y));
  const maxX = Math.max(
    ...store.nodes.map((node) => node.position.x + node.data.width),
  );
  const maxY = Math.max(
    ...store.nodes.map((node) => node.position.y + node.data.height),
  );
  return (
    minX >= visible.x &&
    minY >= visible.y &&
    maxX <= visible.x + visible.width &&
    maxY <= visible.y + visible.height
  );
}

let pendingSavedViewport = { x: 0, y: 0, zoom: 1 };
let viewportRestored = false;
let viewportCheckDone = false;

const MIN_FIT_ZOOM = 0.09;
const MAX_FIT_ZOOM = 3.07;

/** 基于 store 坐标确定性 fit，避免 onlyRenderVisibleElements 隐藏节点导致 fitView 失效 */
async function fitToNodes() {
  const rect = wrapper.value?.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  const candidates = store.nodes.filter(
    (node) =>
      String(node.data.kind) !== 'group' &&
      Number(node.data.width) > 0 &&
      Number(node.data.height) > 0,
  );
  if (!candidates.length) {
    return false;
  }
  const minX = Math.min(...candidates.map((node) => node.position.x));
  const minY = Math.min(...candidates.map((node) => node.position.y));
  const maxX = Math.max(
    ...candidates.map((node) => node.position.x + node.data.width),
  );
  const maxY = Math.max(
    ...candidates.map((node) => node.position.y + node.data.height),
  );
  const boundsWidth = Math.max(1, maxX - minX);
  const boundsHeight = Math.max(1, maxY - minY);
  const padding = 0.2 * Math.min(rect.width, rect.height);
  const rawZoom = Math.min(
    (rect.width - padding * 2) / boundsWidth,
    (rect.height - padding * 2) / boundsHeight,
  );
  const zoom = Math.min(
    MAX_FIT_ZOOM,
    Math.max(MIN_FIT_ZOOM, Number.isFinite(rawZoom) ? rawZoom : 1),
  );
  const x = (rect.width - boundsWidth * zoom) / 2 - minX * zoom;
  const y = (rect.height - boundsHeight * zoom) / 2 - minY * zoom;
  await setViewport({ x, y, zoom });
  store.setViewport({ x, y, zoom });
  return true;
}

async function autoFitAndSave() {
  const fitted = await fitToNodes();
  if (!fitted) {
    await fitView({ padding: 0.2 });
    store.setViewport({ ...flowViewport.value });
  }
}

/** 默认视口或非全包含就 fit；节点未测量造成 fit 空转时重试 */
async function runViewportCheck(
  saved: { x: number; y: number; zoom: number },
  attempt = 0,
) {
  if (viewportCheckDone || !viewportRestored || !nodesReady) {
    return;
  }
  if (!store.nodes.length) {
    viewportCheckDone = true;
    return;
  }
  const needsFit =
    isDefaultViewport(saved) || !viewportContainsAllNodes(saved);
  if (!needsFit) {
    viewportCheckDone = true;
    return;
  }
  // fitToNodes 只用 store 中的 data.width/height，不依赖 VueFlow dimensions
  await autoFitAndSave();
  const applied = flowViewport.value;
  const appliedDefault = isDefaultViewport(applied);
  const allContained = viewportContainsAllNodes(applied);
  if ((appliedDefault || !allContained) && attempt < 20) {
    setTimeout(() => {
      void runViewportCheck(saved, attempt + 1);
    }, 200);
    return;
  }
  viewportCheckDone = true;
}

function scheduleViewportCheck(delay = 150) {
  setTimeout(() => {
    void runViewportCheck(pendingSavedViewport);
  }, delay);
}

/** 先恢复保存视口；nodesReady 后统一执行 fit 判定 */
async function restoreViewport() {
  await nextTick();
  if (!store.initialized) {
    return;
  }
  pendingSavedViewport = { ...store.viewport };
  await setViewport(pendingSavedViewport);
  viewportRestored = true;
  viewportCheckDone = false;
  if (nodesReady) {
    scheduleViewportCheck();
  } else {
    // 兜底：就绪事件/轮询可能延迟，稍后仍会由 handleNodesReady 触发
    scheduleViewportCheck(300);
    scheduleViewportCheck(800);
  }
}

let fitWhenNodesReady = false;

function syncFlowEdges() {
  flowEdges.value = edges.value.map((edge) => ({ ...edge }));
}

watch(edges, () => {
  if (nodesReady) {
    syncFlowEdges();
  }
});

watch(
  () => nodes.value.length,
  (length) => {
    if (!length) {
      nodesReady = false;
      flowEdges.value = [];
    } else {
      startReadyPolling();
    }
  },
);

let readyTimer: ReturnType<typeof setInterval> | undefined;

function stopReadyPolling() {
  if (readyTimer) {
    clearInterval(readyTimer);
    readyTimer = undefined;
  }
}

function domNodeCount() {
  return wrapper.value?.querySelectorAll('.vue-flow__node').length ?? 0;
}

function nodesLookReady() {
  if (!store.nodes.length) {
    return false;
  }
  const domCount = domNodeCount();
  if (domCount === store.nodes.length) {
    return true;
  }
  const graphCount = getNodes.value.length;
  return graphCount === store.nodes.length && domCount > 0;
}

function maybeFitDefaultViewport() {
  if (!store.nodes.length) {
    return;
  }
  if (
    isDefaultViewport(store.viewport) ||
    isDefaultViewport(flowViewport.value)
  ) {
    void fitToNodes();
  }
}

function handleNodesReady() {
  const firstReady = !nodesReady;
  if (firstReady) {
    nodesReady = true;
    stopReadyPolling();
    syncFlowEdges();
  }
  // 无条件兜底：默认视口/identity 直接 self-fit，不依赖恢复标记
  maybeFitDefaultViewport();
  if (viewportRestored) {
    // 默认视口且 fit 未生效时，允许 nodes-ready 再次触发 fit
    if (
      isDefaultViewport(store.viewport) &&
      isDefaultViewport(flowViewport.value)
    ) {
      viewportCheckDone = false;
    }
    scheduleViewportCheck(firstReady ? 150 : 60);
  } else {
    setTimeout(() => {
      if (viewportRestored) {
        scheduleViewportCheck();
      }
    }, 200);
  }
  if (fitWhenNodesReady) {
    fitWhenNodesReady = false;
    requestAnimationFrame(() => {
      void autoFitAndSave();
    });
  }
}

/** nodes-initialized 可能早于监听/不触发：50ms 轮询最多 2s 兜底 */
function startReadyPolling() {
  if (nodesReady) {
    return;
  }
  stopReadyPolling();
  let attempts = 0;
  readyTimer = setInterval(() => {
    attempts += 1;
    if (nodesLookReady()) {
      handleNodesReady();
      return;
    }
    if (attempts >= 40) {
      stopReadyPolling();
    }
  }, 50);
}

function onNodesInitialized() {
  handleNodesReady();
}

/** sync 新增节点后：等节点测量完成再 fitView；300ms 兜底 */
function fitOnNodesReady() {
  fitWhenNodesReady = true;
  setTimeout(() => {
    if (!fitWhenNodesReady) {
      return;
    }
    fitWhenNodesReady = false;
    if (store.nodes.length) {
      syncFlowEdges();
      void autoFitAndSave();
    }
  }, 300);
}

watch(
  () => store.canvas?.id,
  () => {
    startReadyPolling();
    void restoreViewport();
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  startReadyPolling();
});

function onConnect(connection: Connection) {
  store.connect(connection);
}

function syncSelection() {
  const ids = getSelectedNodes.value.map((node) => node.id);
  store.setSelection(ids);
}

function onSelectionEnd() {
  syncSelection();
}

function onEdgeClick() {
  store.setSelection([]);
}

function onMoveEnd() {
  store.setViewport({ ...flowViewport.value });
}

function onNodeDragStop() {
  store.touch();
}

function onPaneClick() {
  store.setSelection([]);
  store.clearNodeInfoRequest();
  store.requestNodeInfoClose();
  store.cancelGroupReference();
}

function onNodeClick(payload: { node: { id: string } }) {
  syncSelection();
  if (!store.selectedNodeIds.includes(payload.node.id)) {
    store.setSelection([payload.node.id]);
  }
  const source = store.groupReferenceSource;
  if (!source) {
    store.requestNodeInfo(payload.node.id);
    return;
  }
  const created = store.referenceGroupToNode(source, payload.node.id);
  store.cancelGroupReference();
  if (created.created > 0) {
    message.success(`已引用组内 ${created.created} 个素材`);
  } else if (created.existing > 0) {
    message.info('组内素材已引用到该节点');
  } else {
    message.warning('组内没有与该节点端口兼容的素材');
  }
}

function onGroupReference(groupId: string) {
  store.beginGroupReference(groupId);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && store.groupReferenceSource) {
    store.cancelGroupReference();
  }
}

async function addNodeAtCenter(kind: CanvasNodeKind) {
  const rect = wrapper.value?.getBoundingClientRect();
  const position = rect
    ? screenToFlowCoordinate({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    : { x: 120, y: 120 };
  return store.addNode(kind, position);
}

async function fitCanvas() {
  const fitted = await fitToNodes();
  if (!fitted) {
    await fitView({ padding: 0.2 });
  }
}

function focusNode(clientId: string) {
  const node = nodes.value.find((item) => item.id === clientId);
  if (!node) {
    return;
  }
  void setCenter(
    node.position.x + node.data.width / 2,
    node.position.y + node.data.height / 2,
    { duration: 300, zoom: Math.max(flowViewport.value.zoom, 0.65) },
  );
}

function focusGroup(groupClientId: string) {
  const bounds = store.groupBounds(groupClientId);
  if (!bounds) {
    return;
  }
  void fitBounds(bounds, { duration: 300, padding: 0.2 });
}

/** Agent/索引等外部入口选中节点：同步 Vue Flow 选中态并定位 */
function selectNode(clientId: string) {
  const target = findNode(clientId);
  if (!target) {
    return;
  }
  removeSelectedNodes(getSelectedNodes.value);
  addSelectedNodes([target]);
  store.setSelection([clientId]);
  focusNode(clientId);
}

function toggleMiniMap() {
  showMiniMap.value = !showMiniMap.value;
}

onBeforeUnmount(() => {
  stopReadyPolling();
  window.removeEventListener('keydown', onKeyDown);
});

defineExpose({
  addNodeAtCenter,
  fitCanvas,
  fitOnNodesReady,
  focusGroup,
  focusNode,
  selectNode,
  toggleMiniMap,
  zoomIn,
  zoomOut,
});
</script>

<template>
  <div
    ref="wrapper"
    class="canvas-flow"
    :class="{ 'is-hide-edges': store.hideEdges }"
  >
    <VueFlow
      :edges="flowEdges"
      v-model:nodes="nodes"
      :default-edge-options="edgeOptions"
      :delete-key-code="null"
      :edge-types="edgeTypes"
      :is-valid-connection="store.isValidConnection"
      :max-zoom="3.07"
      :min-zoom="0.09"
      :node-types="nodeTypes"
      :only-render-visible-elements="true"
      pan-activation-key-code="Space"
      :pan-on-drag="!store.boxSelectMode"
      :selection-on-drag="store.boxSelectMode"
      :snap-grid="[16, 16]"
      :snap-to-grid="store.snapToGrid"
      @connect="onConnect"
      @edge-click="onEdgeClick"
      @move-end="onMoveEnd"
      @node-click="onNodeClick"
      @node-drag-stop="onNodeDragStop"
      @nodes-initialized="onNodesInitialized"
      @pane-click="onPaneClick"
      @selection-end="onSelectionEnd"
    >
      <Background :gap="20" :size="1.2" pattern-color="hsl(var(--border))" />
      <MiniMap
        v-if="showMiniMap"
        :node-color="() => 'hsl(var(--primary))'"
        :pannable="true"
        :zoomable="true"
      />
    </VueFlow>

    <CanvasGroupLayer
      :viewport="viewportTransform"
      @reference="onGroupReference"
    />

    <div v-if="store.groupReferenceSource" class="canvas-flow__hint">
      <span>
        点击目标节点：把「{{ store.groupReferenceTitle }}」组内兼容素材引用过去
      </span>
      <button type="button" @click="store.cancelGroupReference()">取消</button>
    </div>

    <div v-if="isEmpty" class="canvas-flow__empty">
      <div class="canvas-flow__empty-title">画布是空的</div>
      <div class="canvas-flow__empty-hint">
        从左侧「添加节点」开始，或等待分镜/实体数据接入
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-flow {
  position: relative;
  width: 100%;
  height: 100%;

  :deep(.vue-flow) {
    width: 100%;
    height: 100%;
    background: hsl(var(--background));
  }

  :deep(.vue-flow__edge-path) {
    stroke: hsl(var(--muted-foreground));
    stroke-width: 2;
  }

  :deep(.vue-flow__edge.selected .vue-flow__edge-path) {
    stroke: hsl(var(--primary));
    stroke-width: 3;
  }

  &.is-hide-edges :deep(.vue-flow__edges) {
    opacity: 0;
  }

  &__hint {
    position: absolute;
    top: 12px;
    left: 50%;
    z-index: 7;
    display: flex;
    gap: 10px;
    align-items: center;
    max-width: 80%;
    padding: 6px 10px;
    font-size: 12px;
    color: hsl(var(--foreground));
    background: hsl(var(--card));
    border: 1px solid hsl(var(--primary) / 45%);
    border-radius: 8px;
    box-shadow: 0 8px 24px hsl(var(--foreground) / 10%);
    transform: translateX(-50%);

    button {
      flex: none;
      padding: 0;
      font-size: 12px;
      color: hsl(var(--primary));
      cursor: pointer;
      background: transparent;
      border: 0;
    }
  }

  &__empty {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    text-align: center;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  &__empty-title {
    font-size: 15px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__empty-hint {
    margin-top: 6px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
