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

function viewportShowsNodes(
  viewportValue: { x: number; y: number; zoom: number },
) {
  if (!store.nodes.length) {
    return true;
  }
  if (
    viewportValue.x === 0 &&
    viewportValue.y === 0 &&
    Number(viewportValue.zoom) === 1
  ) {
    return false;
  }
  const rect = wrapper.value?.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return true;
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
  // 只有全部节点都在视口内才保留；部分可见（含默认 0,0,1）都重 fit
  return (
    minX >= visible.x &&
    minY >= visible.y &&
    maxX <= visible.x + visible.width &&
    maxY <= visible.y + visible.height
  );
}

let pendingViewportCheck = false;
let pendingSavedViewport = { x: 0, y: 0, zoom: 1 };

async function autoFitAndSave() {
  await fitView({ padding: 0.2 });
  store.setViewport({ ...flowViewport.value });
}

async function applyViewportCheck(saved: { x: number; y: number; zoom: number }) {
  await nextTick();
  if (!store.nodes.length) {
    return;
  }
  if (!viewportShowsNodes(saved)) {
    await autoFitAndSave();
  }
}

/** 先恢复保存视口；等节点完成测量后再判断是否需要 fitView */
async function restoreViewport() {
  await nextTick();
  if (!store.initialized) {
    return;
  }
  pendingSavedViewport = { ...store.viewport };
  await setViewport(pendingSavedViewport);
  pendingViewportCheck = true;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!pendingViewportCheck) {
      return;
    }
    if (wrapper.value?.querySelector('.vue-flow__node')) {
      pendingViewportCheck = false;
      // 等 ResizeObserver 写入节点尺寸后再判断/适配
      await new Promise((resolve) => setTimeout(resolve, 250));
      await applyViewportCheck(pendingSavedViewport);
      return;
    }
  }
  if (pendingViewportCheck) {
    pendingViewportCheck = false;
    await applyViewportCheck(pendingSavedViewport);
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

function handleNodesReady() {
  if (nodesReady) {
    return;
  }
  nodesReady = true;
  stopReadyPolling();
  syncFlowEdges();
  if (pendingViewportCheck) {
    pendingViewportCheck = false;
    requestAnimationFrame(() => {
      void applyViewportCheck(pendingSavedViewport);
    });
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
  store.addNode(kind, position);
}

async function fitCanvas() {
  await fitView({ padding: 0.2 });
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
