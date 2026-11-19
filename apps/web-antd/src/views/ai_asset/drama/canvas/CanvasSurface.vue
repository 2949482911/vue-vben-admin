<script lang="ts" setup name="CanvasSurface">
import type { CanvasNodeKind, CanvasSummary } from '#/api/models/ai_asset_canvas';

import {
  computed,
  ref,
  watch,
} from 'vue';

import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
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

import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { formatApiError, parseApiError } from '../error';
import CanvasFlow from './CanvasFlow.vue';
import CanvasOutline from './CanvasOutline.vue';
import CanvasToolbar from './CanvasToolbar.vue';
import CanvasViewportControls from './CanvasViewportControls.vue';
import { useCanvasGraphStore } from './store';

const props = defineProps<{
  novelId?: number | string;
}>();

interface CanvasFlowExpose {
  addNodeAtCenter: (kind: CanvasNodeKind) => Promise<void>;
  fitCanvas: () => Promise<void>;
  focusGroup: (groupClientId: string) => void;
  focusNode: (clientId: string) => void;
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
const renameOpen = ref(false);
const renameValue = ref('');
const renameTarget = ref<CanvasSummary>();
const outlineOpen = ref(false);

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
    currentCanvasId.value = canvas.id;
    await store.loadGraph(canvas.id);
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
  currentCanvasId.value = next;
  await store.loadGraph(next);
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

watch(
  () => props.novelId,
  async () => {
    canvasList.value = [];
    currentCanvasId.value = undefined;
    listError.value = '';
    outlineOpen.value = false;
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
        @click="outlineOpen = !outlineOpen"
      >
        <UnorderedListOutlined />
        索引
      </Button>
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
      <CanvasFlow ref="flowRef" />
      <CanvasToolbar @add="addNode" />
      <CanvasOutline
        v-if="outlineOpen"
        @close="outlineOpen = false"
        @locate="locateTarget"
      />
      <CanvasViewportControls
        @fit="flowRef?.fitCanvas()"
        @toggle-mini-map="flowRef?.toggleMiniMap()"
        @zoom-in="flowRef?.zoomIn()"
        @zoom-out="flowRef?.zoomOut()"
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
    position: relative;
    flex: 1;
    min-height: 0;
  }
}
</style>
