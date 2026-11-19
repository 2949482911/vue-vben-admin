<script lang="ts" setup name="CanvasToolbar">
import type {
  CanvasBlueprint,
  CanvasNodeKind,
} from '#/api/models/ai_asset_canvas';

import { computed, ref } from 'vue';

import {
  AppstoreOutlined,
  GroupOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { Tooltip } from 'ant-design-vue';

import { useCanvasGraphStore } from './store';

const emit = defineEmits<{
  add: [kind: CanvasNodeKind];
}>();

const store = useCanvasGraphStore();
const menuOpen = ref(false);

const QUICK_KINDS: CanvasNodeKind[] = [
  'text',
  'image',
  'video',
  'audio',
  'shot',
  'entity',
  'character',
  'director3d',
  'codeVideo',
  'timeline',
  'storyboard',
  'prompt',
  'workflow',
  'scene3d',
  'subcanvas',
];

const quickBlueprints = computed(() =>
  QUICK_KINDS.map((kind) => store.blueprintOf(kind)).filter(
    (item): item is CanvasBlueprint => Boolean(item),
  ),
);

function selectKind(kind: CanvasNodeKind) {
  menuOpen.value = false;
  emit('add', kind);
}

function createGroup() {
  store.addGroupFromSelection();
}
</script>

<template>
  <aside class="canvas-toolbar" aria-label="画布工具栏">
    <div class="canvas-toolbar__add-zone">
      <Tooltip placement="right" title="添加节点">
        <button
          class="canvas-toolbar__button canvas-toolbar__button--primary"
          type="button"
          @click="menuOpen = !menuOpen"
        >
          <PlusOutlined />
        </button>
      </Tooltip>
      <div v-if="menuOpen" class="canvas-toolbar__menu">
        <button
          v-for="blueprint in quickBlueprints"
          :key="blueprint.kind"
          class="canvas-toolbar__menu-item"
          type="button"
          @click="selectKind(blueprint.kind)"
        >
          <AppstoreOutlined />
          <span>{{ blueprint.label }}</span>
          <small>{{ blueprint.kind }}</small>
        </button>
        <div v-if="!quickBlueprints.length" class="canvas-toolbar__menu-empty">
          节点蓝图未加载
        </div>
      </div>
    </div>

    <div class="canvas-toolbar__group">
      <Tooltip placement="right" title="选中节点建组">
        <button class="canvas-toolbar__button" type="button" @click="createGroup">
          <GroupOutlined />
        </button>
      </Tooltip>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.canvas-toolbar {
  position: absolute;
  top: 50%;
  left: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: hsl(var(--card) / 92%);
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 8%);
  backdrop-filter: blur(12px);
  transform: translateY(-50%);

  &__add-zone {
    position: relative;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 10px;

    &:hover {
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }
  }

  &__button--primary {
    color: hsl(var(--primary-foreground));
    background: hsl(var(--primary));

    &:hover {
      color: hsl(var(--primary-foreground));
      background: hsl(var(--primary) / 90%);
    }
  }

  &__group {
    padding-top: 8px;
    border-top: 1px solid hsl(var(--border));
  }

  &__menu {
    position: absolute;
    top: 0;
    left: 48px;
    width: 220px;
    max-height: 360px;
    padding: 6px;
    overflow-y: auto;
    background: hsl(var(--popover));
    border: 1px solid hsl(var(--border));
    border-radius: 10px;
    box-shadow: 0 12px 32px hsl(var(--foreground) / 12%);
  }

  &__menu-item {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 7px 8px;
    font-size: 12px;
    color: hsl(var(--foreground));
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 7px;

    &:hover {
      background: hsl(var(--accent));
    }

    small {
      margin-left: auto;
      color: hsl(var(--muted-foreground));
    }
  }

  &__menu-empty {
    padding: 10px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
