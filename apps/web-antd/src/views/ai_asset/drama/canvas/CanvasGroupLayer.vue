<script lang="ts" setup name="CanvasGroupLayer">
import type { CanvasGroup } from '#/api/models/ai_asset_canvas';

import { computed, ref } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons-vue';
import { Input, Modal } from 'ant-design-vue';

import { useCanvasGraphStore } from './store';

const props = defineProps<{
  viewport: { x: number; y: number; zoom: number };
}>();

const emit = defineEmits<{ reference: [groupId: string] }>();

const store = useCanvasGraphStore();
const editingId = ref<string>();
const draft = ref('');

const boxes = computed(() =>
  store.groups
    .map((group) => {
      const box = store.groupBounds(group.clientId);
      if (!box) {
        return null;
      }
      return {
        count: store.memberNodes(group.clientId).length,
        group,
        ...box,
      };
    })
    .filter((box): box is NonNullable<typeof box> => Boolean(box)),
);

const layerStyle = computed(() => ({
  transform: `translate(${props.viewport.x}px, ${props.viewport.y}px) scale(${props.viewport.zoom})`,
  transformOrigin: '0 0',
}));

function startEdit(group: CanvasGroup) {
  editingId.value = group.clientId;
  draft.value = group.title;
}

function commit(group: CanvasGroup) {
  const title = draft.value.trim();
  if (title) {
    store.renameGroup(group.clientId, title);
  }
  editingId.value = undefined;
}

function remove(group: CanvasGroup) {
  Modal.confirm({
    title: '删除分组？',
    content: '只删除分组框，组内节点会保留并回到父分组或根层。',
    okText: '删除分组',
    cancelText: '取消',
    onOk: () => store.removeGroup(group.clientId),
  });
}

function toggleReference(group: CanvasGroup) {
  if (store.groupReferenceSource === group.clientId) {
    store.cancelGroupReference();
    return;
  }
  emit('reference', group.clientId);
}
</script>

<template>
  <div class="canvas-group-layer" :style="layerStyle">
    <div
      v-for="box in boxes"
      :key="box.group.clientId"
      class="canvas-group"
      :class="{
        'is-source': store.groupReferenceSource === box.group.clientId,
      }"
      :style="{
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      }"
    >
      <div class="canvas-group__title">
        <span class="canvas-group__name">
          <template v-if="editingId === box.group.clientId">
            <Input
              v-model:value="draft"
              size="small"
              @blur="commit(box.group)"
              @press-enter="commit(box.group)"
            />
          </template>
          <template v-else>
            <span @dblclick="startEdit(box.group)">{{ box.group.title }}</span>
            <button
              class="canvas-group__icon"
              type="button"
              title="重命名分组"
              @click="startEdit(box.group)"
            >
              <EditOutlined />
            </button>
          </template>
        </span>
        <span class="canvas-group__count">{{ box.count }}</span>
        <button
          class="canvas-group__icon"
          type="button"
          :title="
            store.groupReferenceSource === box.group.clientId
              ? '取消引用'
              : '引用组内素材到目标节点'
          "
          @click="toggleReference(box.group)"
        >
          <LinkOutlined />
        </button>
        <button
          class="canvas-group__icon canvas-group__icon--danger"
          type="button"
          title="删除分组"
          @click="remove(box.group)"
        >
          <DeleteOutlined />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-group-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.canvas-group {
  position: absolute;
  pointer-events: none;
  background: hsl(var(--primary) / 3%);
  border: 1px dashed hsl(var(--primary) / 35%);
  border-radius: 14px;

  &.is-source {
    background: hsl(var(--primary) / 8%);
    border-color: hsl(var(--primary) / 70%);
  }

  &__title {
    position: absolute;
    top: -34px;
    left: 12px;
    display: flex;
    gap: 6px;
    align-items: center;
    max-width: calc(100% - 24px);
    padding: 3px 7px;
    color: hsl(var(--foreground));
    pointer-events: auto;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 7px;
  }

  &__name {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__count {
    flex: none;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__icon {
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
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }
  }

  &__icon--danger:hover {
    color: hsl(var(--destructive));
  }
}
</style>
