<script lang="ts" setup name="CanvasAgentPanel">
import type { DramaApiError } from '../error';

import type {
  CanvasAgentTool,
  CanvasContext,
} from '#/api/models/ai_asset_canvas';

import { computed, ref, watch } from 'vue';

import {
  AimOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  RobotOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Empty,
  message,
  Modal,
  Select,
  Tag,
} from 'ant-design-vue';

import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { formatApiError, parseApiError } from '../error';
import { useCanvasGraphStore } from './store';

const props = defineProps<{
  canvasId?: string;
}>();

const emit = defineEmits<{
  close: [];
  focusNode: [clientId: string];
}>();

const DELETE_ACTIONS = new Set([
  'delete_edge',
  'delete_group',
  'delete_node',
]);

const store = useCanvasGraphStore();
const context = ref<CanvasContext>();
const contextLoading = ref(false);
const contextError = ref<DramaApiError>();
const tools = ref<CanvasAgentTool[]>([]);
const toolsLoading = ref(false);
const toolsError = ref<DramaApiError>();
const actionLoading = ref(false);
const actionError = ref('');

const toolsNotReady = computed(() => {
  const info = toolsError.value;
  if (!info) {
    return false;
  }
  return info.notReady || /static resource|接口未就绪/i.test(info.message);
});

const selectedNodeId = computed(() => store.selectedNodeIds[0] ?? '');
const selectedContextNode = computed(() =>
  context.value?.nodes.find((node) => node.clientId === selectedNodeId.value),
);
const nodeOptions = computed(() =>
  (context.value?.nodes ?? []).map((node) => ({
    label: `${node.label}（${kindLabel(node.kind)}）`,
    value: node.clientId,
  })),
);
const nodeKindEntries = computed(() =>
  Object.entries(context.value?.counts.nodeKinds ?? {}).map(
    ([kind, count]) => ({ count, kind, label: kindLabel(kind) }),
  ),
);
const nodeLabelMap = computed(
  () =>
    new Map(
      (context.value?.nodes ?? []).map((node) => [node.clientId, node.label]),
    ),
);
const groupLabelMap = computed(
  () =>
    new Map(
      (context.value?.groups ?? []).map((group) => [
        group.clientId,
        group.title,
      ]),
    ),
);

function kindLabel(kind?: string) {
  return (kind && store.blueprintOf(kind)?.label) || kind || '—';
}

function hasTool(action: string) {
  return tools.value.some((tool) => tool.action === action);
}

function nonExecutableReason(tool: CanvasAgentTool) {
  if (!tool.write) {
    return '只读工具';
  }
  if (DELETE_ACTIONS.has(tool.action)) {
    return '在下方对象列表执行';
  }
  return '需结构化参数，本轮不提供表单';
}

async function loadContext() {
  if (!props.canvasId) {
    return;
  }
  contextLoading.value = true;
  contextError.value = undefined;
  try {
    context.value = await aiAssetCanvasApi.fetchCanvasContext(props.canvasId);
  } catch (error) {
    context.value = undefined;
    contextError.value = parseApiError(error);
  } finally {
    contextLoading.value = false;
  }
}

async function loadTools() {
  if (!props.canvasId) {
    return;
  }
  toolsLoading.value = true;
  toolsError.value = undefined;
  try {
    tools.value = (await aiAssetCanvasApi.fetchCanvasAgentTools(props.canvasId)) ?? [];
  } catch (error) {
    tools.value = [];
    toolsError.value = parseApiError(error);
  } finally {
    toolsLoading.value = false;
  }
}

async function runAction(
  tool: CanvasAgentTool,
  extra: { clientId?: string },
) {
  if (!props.canvasId || actionLoading.value) {
    return;
  }
  actionLoading.value = true;
  actionError.value = '';
  try {
    const saved = await store.flushSave();
    if (!saved) {
      actionError.value = store.conflict
        ? '画布版本冲突：请刷新画布后重试'
        : store.error || '画布保存失败，暂不执行 Agent 动作';
      return;
    }
    const result = await aiAssetCanvasApi.runCanvasAgentAction(props.canvasId, {
      action: tool.action,
      baseRevision: store.canvas?.revision ?? '0',
      ...extra,
    });
    if (result?.canvas && Array.isArray(result.nodes)) {
      store.applyGraph(result);
    } else {
      await store.loadGraph(props.canvasId);
    }
    await loadContext();
    message.success(`已执行：${tool.action}`);
  } catch (error) {
    const info = parseApiError(error);
    actionError.value =
      info.status === 409
        ? '画布版本冲突：请刷新画布后重试'
        : formatApiError(info);
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(tool: string, extra: { clientId: string }, target: string) {
  const item = tools.value.find((candidate) => candidate.action === tool);
  if (!item) {
    return;
  }
  Modal.confirm({
    title: '确认执行画布写操作？',
    content: `将执行 ${tool}：${target}。只修改画布结构，不生成媒体。`,
    okText: '确认执行',
    cancelText: '取消',
    onOk: () => runAction(item, extra),
  });
}

function deleteSelectedNode() {
  const node = selectedContextNode.value;
  if (!node) {
    return;
  }
  confirmDelete('delete_node', { clientId: node.clientId }, `节点「${node.label}」`);
}

function deleteEdge(edge: CanvasContext['edges'][number]) {
  const source = nodeLabelMap.value.get(edge.sourceNodeClientId) ?? edge.sourceNodeClientId;
  const target = nodeLabelMap.value.get(edge.targetNodeClientId) ?? edge.targetNodeClientId;
  confirmDelete('delete_edge', { clientId: edge.clientId }, `连线「${source}.${edge.sourcePort} → ${target}.${edge.targetPort}」`);
}

function deleteGroup(group: CanvasContext['groups'][number]) {
  confirmDelete('delete_group', { clientId: group.clientId }, `分组「${group.title}」`);
}

function autoArrange() {
  Modal.confirm({
    title: '自动整理画布？',
    content: '将移动节点位置并自动保存，不改变分组成员与连线。',
    okText: '整理并保存',
    cancelText: '取消',
    onOk: async () => {
      store.autoArrange();
      const saved = await store.flushSave();
      if (saved) {
        message.success('画布已整理');
      }
    },
  });
}

function selectContextNode(value: unknown) {
  if (typeof value === 'string') {
    emit('focusNode', value);
  }
}

watch(
  () => props.canvasId,
  () => {
    void loadContext();
    void loadTools();
  },
  { immediate: true },
);
</script>

<template>
  <aside class="canvas-agent" aria-label="Canvas Agent">
    <div class="canvas-agent__head">
      <RobotOutlined class="canvas-agent__icon" />
      <span class="canvas-agent__title">Canvas Agent</span>
      <Tag :bordered="false" color="blue">手动确认</Tag>
      <span class="canvas-agent__spacer"></span>
      <Button
        :disabled="!canvasId"
        :loading="contextLoading"
        size="small"
        type="text"
        title="刷新上下文与工具"
        @click="loadContext(); loadTools()"
      >
        <template #icon><ReloadOutlined /></template>
      </Button>
      <button
        class="canvas-agent__close"
        type="button"
        title="收起 Agent"
        @click="emit('close')"
      >
        <CloseOutlined />
      </button>
    </div>

    <div class="canvas-agent__body">
      <Alert
        v-if="contextError"
        :message="formatApiError(contextError)"
        :type="contextError.notReady ? 'info' : 'error'"
        show-icon
      />
      <div v-else-if="contextLoading" class="canvas-agent__hint">
        画布上下文加载中…
      </div>
      <template v-else-if="context">
        <section class="canvas-agent__section">
          <div class="canvas-agent__section-title">画布上下文</div>
          <div class="canvas-agent__canvas">
            <b>{{ context.canvas.title }}</b>
            <span>rev {{ context.canvas.revision }}</span>
          </div>
          <div class="canvas-agent__counts">
            <span>节点 {{ context.counts.nodes }}</span>
            <span>连线 {{ context.counts.edges }}</span>
            <span>分组 {{ context.counts.groups }}</span>
          </div>
          <div v-if="nodeKindEntries.length" class="canvas-agent__kinds">
            <Tag
              v-for="entry in nodeKindEntries"
              :key="entry.kind"
              :bordered="false"
            >
              {{ entry.label }} {{ entry.count }}
            </Tag>
          </div>
        </section>

        <section class="canvas-agent__section">
          <div class="canvas-agent__section-title">选中节点</div>
          <Select
            :options="nodeOptions"
            :value="selectedNodeId || undefined"
            allow-clear
            placeholder="选择画布节点"
            size="small"
            @change="selectContextNode"
          />
          <div v-if="selectedContextNode" class="canvas-agent__selected">
            <div class="canvas-agent__selected-head">
              <b>{{ selectedContextNode.label }}</b>
              <Tag :bordered="false">
                {{ kindLabel(selectedContextNode.kind) }}
              </Tag>
              <Tag :bordered="false" color="processing">
                {{ selectedContextNode.nodeStatus || '—' }}
              </Tag>
            </div>
            <div v-if="selectedContextNode.groupClientId" class="canvas-agent__meta">
              分组：{{
                groupLabelMap.get(selectedContextNode.groupClientId) ??
                selectedContextNode.groupClientId
              }}
            </div>
            <div class="canvas-agent__ports">
              <span>
                入：
                {{
                  selectedContextNode.inputs
                    .map((port) => port.label || port.id)
                    .join('、') || '无'
                }}
              </span>
              <span>
                出：
                {{
                  selectedContextNode.outputs
                    .map((port) => port.label || port.id)
                    .join('、') || '无'
                }}
              </span>
            </div>
            <Button
              v-if="hasTool('delete_node')"
              :disabled="actionLoading"
              danger
              size="small"
              @click="deleteSelectedNode"
            >
              <template #icon><DeleteOutlined /></template>
              删除节点（手动确认）
            </Button>
          </div>
          <div
            v-else-if="selectedNodeId"
            class="canvas-agent__hint"
          >
            选中节点不在已保存上下文中，可能尚未保存。
          </div>
          <div v-else class="canvas-agent__hint">
            在画布或上方选择器中选择节点。
          </div>
        </section>

        <section v-if="context.groups.length" class="canvas-agent__section">
          <div class="canvas-agent__section-title">
            分组 {{ context.groups.length }}
          </div>
          <div class="canvas-agent__list">
            <div
              v-for="group in context.groups"
              :key="group.clientId"
              class="canvas-agent__row"
            >
              <span class="canvas-agent__row-main">{{ group.title }}</span>
              <span class="canvas-agent__meta">
                {{ group.nodeCount }} 节点 · {{ group.childGroupCount }} 子组
                <template v-if="group.parentGroupClientId">
                  · 父组：{{
                    groupLabelMap.get(group.parentGroupClientId) ??
                    group.parentGroupClientId
                  }}
                </template>
              </span>
              <Button
                v-if="hasTool('delete_group')"
                :disabled="actionLoading"
                danger
                size="small"
                type="text"
                title="删除分组"
                @click="deleteGroup(group)"
              >
                <template #icon><DeleteOutlined /></template>
              </Button>
            </div>
          </div>
        </section>

        <section v-if="context.edges.length" class="canvas-agent__section">
          <div class="canvas-agent__section-title">
            连线 {{ context.edges.length }}
          </div>
          <div class="canvas-agent__list">
            <div
              v-for="edge in context.edges"
              :key="edge.clientId"
              class="canvas-agent__row"
            >
              <span class="canvas-agent__row-main">
                {{ nodeLabelMap.get(edge.sourceNodeClientId) ?? edge.sourceNodeClientId }}.{{ edge.sourcePort }}
                →
                {{ nodeLabelMap.get(edge.targetNodeClientId) ?? edge.targetNodeClientId }}.{{ edge.targetPort }}
              </span>
              <span class="canvas-agent__meta">{{ edge.label || edge.referenceType || '引用' }}</span>
              <Button
                v-if="hasTool('delete_edge')"
                :disabled="actionLoading"
                danger
                size="small"
                type="text"
                title="删除连线"
                @click="deleteEdge(edge)"
              >
                <template #icon><DeleteOutlined /></template>
              </Button>
            </div>
          </div>
        </section>

        <section class="canvas-agent__section">
          <div class="canvas-agent__section-title">本地动作</div>
          <div class="canvas-agent__actions">
            <Button size="small" @click="loadContext">
              <template #icon><ReloadOutlined /></template>
              加载上下文
            </Button>
            <Button size="small" @click="autoArrange">
              <template #icon><AimOutlined /></template>
              自动整理（确认后保存）
            </Button>
          </div>
        </section>

        <section class="canvas-agent__section">
          <div class="canvas-agent__section-title">Agent 工具</div>
          <div v-if="toolsLoading" class="canvas-agent__hint">
            工具加载中…
          </div>
          <Alert
            v-else-if="toolsError"
            :message="
              toolsNotReady
                ? 'Agent 工具待后端（接口未就绪）'
                : formatApiError(toolsError)
            "
            :type="toolsNotReady ? 'info' : 'error'"
            show-icon
          />
          <Empty
            v-else-if="!tools.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="后端未注册可用的确定性工具"
          />
          <div v-else class="canvas-agent__list">
            <div
              v-for="tool in tools"
              :key="tool.action"
              class="canvas-agent__tool"
            >
              <div class="canvas-agent__row">
                <b class="canvas-agent__row-main">{{ tool.action }}</b>
                <Tag :bordered="false" :color="tool.write ? 'orange' : 'default'">
                  {{ tool.write ? '写' : '读' }}
                </Tag>
              </div>
              <div v-if="tool.description" class="canvas-agent__meta">
                {{ tool.description }}
              </div>
              <div v-if="tool.params?.length" class="canvas-agent__meta">
                参数：{{ tool.params.map((param) => param.name).join('、') }}
              </div>
              <div class="canvas-agent__meta">{{ nonExecutableReason(tool) }}</div>
            </div>
          </div>
          <div class="canvas-agent__hint">
            本轮只接确定性工具；不提供对话生成，不会自动生成媒体。
          </div>
        </section>
      </template>
      <Empty
        v-else
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="暂无画布上下文"
      />
    </div>

    <Alert
      v-if="actionError"
      class="canvas-agent__action-error"
      :message="actionError"
      type="error"
      show-icon
    />
  </aside>
</template>

<style scoped lang="scss">
.canvas-agent {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 340px;
  height: 100%;
  overflow: hidden;
  background: hsl(var(--card));
  border-left: 1px solid hsl(var(--border));

  &__head {
    display: flex;
    flex: none;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__icon {
    color: hsl(var(--primary));
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 4px;

    &:hover {
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 10px;
    overflow-y: auto;
  }

  &__section {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid hsl(var(--border));

    &:last-child {
      margin-bottom: 0;
      border-bottom: 0;
    }
  }

  &__section-title {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__canvas {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: 12px;
    color: hsl(var(--foreground));

    span {
      font-size: 11px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__counts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__kinds {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  &__selected {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: hsl(var(--foreground));
  }

  &__selected-head {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  &__meta {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__ports {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__hint {
    margin-top: 6px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 220px;
    overflow-y: auto;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 6px;
    align-items: center;
    padding: 3px 4px;
    font-size: 12px;
    color: hsl(var(--foreground));
    border-radius: 6px;

    &:hover {
      background: hsl(var(--accent));
    }
  }

  &__row-main {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tool {
    padding: 4px;
    border-bottom: 1px dashed hsl(var(--border));

    &:last-child {
      border-bottom: 0;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__action-error {
    flex: none;
    margin: 0 10px 10px;
  }
}
</style>
