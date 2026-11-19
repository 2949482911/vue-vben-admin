<script lang="ts" setup name="CanvasNodeFrame">
import type { HandleConnectable } from '@vue-flow/core';

import type { CanvasFlowNodeData } from './store';

import { computed, ref, watch } from 'vue';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { Handle, Position } from '@vue-flow/core';
import { Input } from 'ant-design-vue';

import { useCanvasGraphStore } from './store';

const props = defineProps<{
  connectable: HandleConnectable;
  data: CanvasFlowNodeData;
  id: string;
  selected?: boolean;
}>();

const store = useCanvasGraphStore();
const blueprint = computed(() => store.blueprintOf(props.data.kind));
const editing = ref(false);
const labelDraft = ref(props.data.label);
const bodyDraft = ref(props.data.body ?? '');

watch(
  () => props.data.label,
  (value) => {
    labelDraft.value = value;
  },
);
watch(
  () => props.data.body,
  (value) => {
    bodyDraft.value = value ?? '';
  },
);

const kindLabel = computed(() => blueprint.value?.label ?? props.data.kind);
const isReserved = computed(() =>
  ['codeVideo', 'director3d', 'scene3d', 'timeline'].includes(props.data.kind),
);

function detailText(key: string) {
  const value = props.data.details?.[key];
  return typeof value === 'string' ? value : '';
}

const previewUrl = computed(() => {
  if (props.data.kind === 'image') {
    return detailText('thumbnailUrl') || detailText('materialUrl');
  }
  if (props.data.kind === 'entity' || props.data.kind === 'character') {
    return detailText('refUrl');
  }
  return '';
});

function beginEdit() {
  labelDraft.value = props.data.label;
  editing.value = true;
}

function commitLabel() {
  const next = labelDraft.value.trim();
  if (next) {
    store.updateNodeData(props.id, { label: next });
  }
  editing.value = false;
}

function commitBody() {
  store.updateNodeData(props.id, { body: bodyDraft.value });
}

function remove() {
  store.removeNode(props.id);
}

function portStyle(index: number, total: number) {
  return { top: `${((index + 1) / (total + 1)) * 100}%` };
}

function bodyText() {
  if (props.data.body) {
    return props.data.body;
  }
  const materialName = detailText('materialName');
  if (props.data.kind === 'shot') {
    return '分镜节点：等待绑定分镜数据';
  }
  if (props.data.kind === 'entity' || props.data.kind === 'character') {
    const entityName = detailText('entityName');
    if (entityName) {
      const entityType = detailText('entityType');
      const labels: Record<string, string> = {
        character: '角色',
        element: '物品',
        scene: '场景',
      };
      return [
        entityName,
        labels[entityType] ?? entityType,
        props.data.details?.hasImage === true ? '有参考图' : '',
      ]
        .filter(Boolean)
        .join(' · ');
    }
    return '实体节点：等待绑定项目实体';
  }
  if (
    props.data.kind === 'image' ||
    props.data.kind === 'video' ||
    props.data.kind === 'audio'
  ) {
    if (materialName) {
      return `素材：${materialName}`;
    }
    return props.data.assetId
      ? `已绑定素材 #${props.data.assetId}`
      : '未绑定素材';
  }
  if (props.data.kind === 'scene3d') {
    return '3D 导演台 / 白模：P9/P10 接入';
  }
  if (props.data.kind === 'director3d') {
    return 'AI 导演台：P9 接入';
  }
  if (props.data.kind === 'codeVideo') {
    return 'AI 动画台：待接入';
  }
  if (props.data.kind === 'timeline') {
    return '剪辑条：P9/P10 接入';
  }
  return '空节点';
}
</script>

<template>
  <article
    class="canvas-node"
    :class="[`canvas-node--${data.kind}`, { 'is-selected': selected, 'is-reserved': isReserved }]"
  >
    <Handle
      v-for="(port, index) in blueprint?.inputs ?? []"
      :id="port.id"
      :key="`in-${port.id}`"
      :connectable="connectable"
      :position="Position.Left"
      :style="portStyle(index, blueprint?.inputs.length ?? 1)"
      :title="`${port.label}（${port.id}）`"
      class="canvas-node__handle canvas-node__handle--in"
      type="target"
    />
    <Handle
      v-for="(port, index) in blueprint?.outputs ?? []"
      :id="port.id"
      :key="`out-${port.id}`"
      :connectable="connectable"
      :position="Position.Right"
      :style="portStyle(index, blueprint?.outputs.length ?? 1)"
      :title="`${port.label}（${port.id}）`"
      class="canvas-node__handle canvas-node__handle--out"
      type="source"
    />

    <header class="canvas-node__header">
      <span class="canvas-node__kind">{{ kindLabel }}</span>
      <template v-if="editing">
        <Input
          v-model:value="labelDraft"
          size="small"
          class="canvas-node__label-input nodrag nopan"
          @blur="commitLabel"
          @press-enter="commitLabel"
        />
      </template>
      <template v-else>
        <span class="canvas-node__label" @dblclick="beginEdit">{{ data.label }}</span>
        <button
          class="canvas-node__icon"
          type="button"
          title="重命名"
          @click="beginEdit"
        >
          <EditOutlined />
        </button>
      </template>
      <span class="canvas-node__spacer"></span>
      <button
        class="canvas-node__icon canvas-node__icon--danger"
        type="button"
        title="删除节点"
        @click="remove"
      >
        <DeleteOutlined />
      </button>
    </header>

    <div class="canvas-node__body">
      <textarea
        v-if="data.kind === 'text' || data.kind === 'prompt' || data.kind === 'storyboard' || data.kind === 'workflow'"
        v-model="bodyDraft"
        class="canvas-node__textarea nodrag"
        placeholder="输入文本 / 脚本 / 提示词"
        @blur="commitBody"
      ></textarea>
      <div v-else-if="!previewUrl" class="canvas-node__placeholder">
        {{ bodyText() }}
      </div>
      <div v-else class="canvas-node__media">
        <img :src="previewUrl" alt="" class="canvas-node__preview" />
        <div class="canvas-node__media-caption">{{ bodyText() }}</div>
      </div>
    </div>

    <footer class="canvas-node__footer">
      <span>{{ data.nodeStatus || 'ready' }}</span>
      <span v-if="data.groupClientId">分组</span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.canvas-node {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 6%);

  &.is-selected {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 18%), 0 8px 24px hsl(var(--foreground) / 8%);
  }

  &.is-reserved {
    background: hsl(var(--accent));
  }

  &__header {
    display: flex;
    flex: none;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__kind {
    flex: none;
    padding: 2px 6px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 999px;
  }

  &__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__label-input {
    width: 150px;
  }

  &__spacer {
    flex: 1;
  }

  &__icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 5px;

    &:hover {
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }
  }

  &__icon--danger:hover {
    color: hsl(var(--destructive));
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 10px;
  }

  &__textarea {
    width: 100%;
    height: 100%;
    padding: 0;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--foreground));
    resize: none;
    outline: 0;
    background: transparent;
    border: 0;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    text-align: center;
    background: hsl(var(--accent));
    border-radius: 8px;
  }

  &__media {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    min-height: 0;
  }

  &__preview {
    flex: 1;
    width: 100%;
    min-height: 0;
    object-fit: cover;
    border-radius: 8px;
  }

  &__media-caption {
    flex: none;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }

  &__footer {
    display: flex;
    flex: none;
    gap: 8px;
    padding: 5px 10px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    border-top: 1px solid hsl(var(--border));
  }

  &__handle {
    z-index: 2;
    width: 12px;
    height: 12px;
    background: hsl(var(--background));
    border: 2px solid hsl(var(--primary));
    border-radius: 50%;
  }

  &__handle--in {
    left: 0;
  }

  &__handle--out {
    right: 0;
  }
}
</style>
