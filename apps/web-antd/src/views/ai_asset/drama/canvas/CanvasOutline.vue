<script lang="ts" setup name="CanvasOutline">
import type { CanvasFlowNode } from './store';

import { computed, ref, watch } from 'vue';

import {
  AimOutlined,
  CloseOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { Input, Modal, Segmented, Tag } from 'ant-design-vue';

import { useCanvasGraphStore } from './store';

type OutlineScope = 'all' | 'group' | 'node';

const props = defineProps<{ focusGroupClientId?: string }>();

const emit = defineEmits<{
  close: [];
  locate: [payload: { clientId: string; type: 'group' | 'node' }];
}>();

const store = useCanvasGraphStore();
const keyword = ref('');
const scope = ref<OutlineScope>('all');

watch(
  () => props.focusGroupClientId,
  (groupId) => {
    if (!groupId) {
      return;
    }
    const group = store.groups.find((item) => item.clientId === groupId);
    if (group) {
      keyword.value = group.title;
      scope.value = 'group';
    }
  },
  { immediate: true },
);

const SCOPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '节点', value: 'node' },
  { label: '分组', value: 'group' },
];

const query = computed(() => keyword.value.trim().toLowerCase());

const nodeRows = computed(() => {
  if (scope.value === 'group') {
    return [];
  }
  return store.nodes.filter((node) => {
    if (!query.value) {
      return true;
    }
    return [
      node.data.label,
      node.data.body ?? '',
      node.data.kind,
      store.blueprintOf(node.data.kind)?.label ?? '',
      groupTitleOf(node),
    ].some((text) => text.toLowerCase().includes(query.value));
  });
});

const groupRows = computed(() => {
  if (scope.value === 'node') {
    return [];
  }
  return store.groups.filter(
    (group) =>
      !query.value || group.title.toLowerCase().includes(query.value),
  );
});

const total = computed(() => nodeRows.value.length + groupRows.value.length);

function groupTitleOf(node: CanvasFlowNode) {
  const group = store.groups.find(
    (item) => item.clientId === node.data.groupClientId,
  );
  return group?.title ?? '';
}

function parentTitleOf(parentGroupClientId?: null | string) {
  if (!parentGroupClientId) {
    return '';
  }
  return (
    store.groups.find((group) => group.clientId === parentGroupClientId)?.title ??
    ''
  );
}

function removeEmptyGroup(clientId: string) {
  Modal.confirm({
    title: '删除空分组？',
    content: '分组内没有节点，删除后不可恢复。',
    okText: '删除',
    cancelText: '取消',
    onOk: () => store.removeGroup(clientId),
  });
}
</script>

<template>
  <aside class="canvas-outline" aria-label="画布索引">
    <div class="canvas-outline__head">
      <span class="canvas-outline__title">画布索引</span>
      <span class="canvas-outline__count">{{ total }}</span>
      <span class="canvas-outline__spacer"></span>
      <button
        class="canvas-outline__close"
        type="button"
        title="关闭索引"
        @click="emit('close')"
      >
        <CloseOutlined />
      </button>
    </div>

    <div class="canvas-outline__filters">
      <Input
        v-model:value="keyword"
        allow-clear
        placeholder="搜索节点/分组"
        size="small"
      >
        <template #prefix><SearchOutlined /></template>
      </Input>
      <Segmented
        v-model:value="scope"
        :options="SCOPE_OPTIONS"
        block
        size="small"
      />
    </div>

    <div class="canvas-outline__body">
      <template v-if="groupRows.length">
        <div class="canvas-outline__section">分组 {{ groupRows.length }}</div>
        <div
          v-for="group in groupRows"
          :key="group.clientId"
          class="canvas-outline__row"
          :class="{
            'is-focused': group.clientId === props.focusGroupClientId,
          }"
        >
          <button
            class="canvas-outline__main"
            type="button"
            :disabled="!store.memberNodes(group.clientId).length"
            @click="emit('locate', { clientId: group.clientId, type: 'group' })"
          >
            <AimOutlined class="canvas-outline__icon" />
            <span class="canvas-outline__name">{{ group.title }}</span>
            <Tag :bordered="false">
              {{ store.memberNodes(group.clientId).length }}
            </Tag>
          </button>
          <span
            v-if="parentTitleOf(group.parentGroupClientId)"
            class="canvas-outline__meta"
          >
            父组：{{ parentTitleOf(group.parentGroupClientId) }}
          </span>
          <button
            v-if="!store.memberNodes(group.clientId).length"
            class="canvas-outline__action"
            type="button"
            title="删除空分组"
            @click="removeEmptyGroup(group.clientId)"
          >
            <DeleteOutlined />
          </button>
        </div>
      </template>

      <template v-if="nodeRows.length">
        <div class="canvas-outline__section">节点 {{ nodeRows.length }}</div>
        <div
          v-for="node in nodeRows"
          :key="node.id"
          class="canvas-outline__row"
        >
          <button
            class="canvas-outline__main"
            type="button"
            @click="emit('locate', { clientId: node.id, type: 'node' })"
          >
            <AimOutlined class="canvas-outline__icon" />
            <span class="canvas-outline__name">{{ node.data.label }}</span>
          </button>
          <span class="canvas-outline__meta">
            {{ store.blueprintOf(node.data.kind)?.label ?? node.data.kind }}
            <template v-if="groupTitleOf(node)">
              · {{ groupTitleOf(node) }}
            </template>
          </span>
        </div>
      </template>

      <div v-if="!total" class="canvas-outline__empty">
        {{ store.nodes.length || store.groups.length ? '没有匹配的节点或分组' : '画布为空' }}
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.canvas-outline {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  width: 280px;
  max-height: calc(100% - 24px);
  background: hsl(var(--card) / 96%);
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 12px 32px hsl(var(--foreground) / 12%);
  backdrop-filter: blur(12px);

  &__head {
    display: flex;
    flex: none;
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

  &__count {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
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

  &__filters {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 6px 8px 8px;
    overflow-y: auto;
  }

  &__section {
    padding: 6px 4px 2px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 6px;
    align-items: center;
    padding: 4px 4px 6px;
    border-radius: 6px;

    &:hover {
      background: hsl(var(--accent));
    }

    &.is-focused {
      outline: 1px solid hsl(var(--primary) / 45%);
      background: hsl(var(--primary) / 8%);
    }
  }

  &__main {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
    padding: 0;
    font-size: 12px;
    color: hsl(var(--foreground));
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;

    &:disabled {
      cursor: default;
      opacity: 0.55;
    }
  }

  &__icon {
    flex: none;
    color: hsl(var(--muted-foreground));
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    flex-basis: 100%;
    padding-left: 20px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__action {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 4px;

    &:hover {
      color: hsl(var(--destructive));
      background: hsl(var(--accent));
    }
  }

  &__empty {
    padding: 16px 8px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    text-align: center;
  }
}
</style>
