<script lang="ts" setup name="CanvasViewportControls">
import { computed } from 'vue';

import {
  BorderOutlined,
  CompressOutlined,
  EyeInvisibleOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { Button, Tooltip } from 'ant-design-vue';

import { useCanvasGraphStore } from './store';

const emit = defineEmits<{
  fit: [];
  toggleMiniMap: [];
  zoomIn: [];
  zoomOut: [];
}>();

const store = useCanvasGraphStore();
const zoomLabel = computed(() => `${Math.round(store.viewport.zoom * 100)}%`);
</script>

<template>
  <div class="canvas-viewport-controls">
    <Tooltip title="适应画布">
      <Button size="small" @click="emit('fit')">
        <CompressOutlined />
      </Button>
    </Tooltip>
    <Tooltip title="放大">
      <Button size="small" @click="emit('zoomIn')">
        <PlusOutlined />
      </Button>
    </Tooltip>
    <Tooltip title="缩小">
      <Button size="small" @click="emit('zoomOut')">
        <MinusOutlined />
      </Button>
    </Tooltip>
    <span class="canvas-viewport-controls__zoom">{{ zoomLabel }}</span>
    <Tooltip title="小地图">
      <Button size="small" @click="emit('toggleMiniMap')">
        <BorderOutlined />
      </Button>
    </Tooltip>
    <Tooltip title="隐藏连线">
      <Button
        size="small"
        :type="store.hideEdges ? 'primary' : 'default'"
        @click="store.hideEdges = !store.hideEdges"
      >
        <EyeInvisibleOutlined />
      </Button>
    </Tooltip>
    <Tooltip title="网格吸附">
      <Button
        size="small"
        :type="store.snapToGrid ? 'primary' : 'default'"
        @click="store.snapToGrid = !store.snapToGrid"
      >
        网格
      </Button>
    </Tooltip>
    <Tooltip title="自动整理">
      <Button size="small" @click="store.autoArrange()">整理</Button>
    </Tooltip>
  </div>
</template>

<style scoped lang="scss">
.canvas-viewport-controls {
  position: absolute;
  bottom: 14px;
  left: 14px;
  z-index: 6;
  display: flex;
  gap: 3px;
  align-items: center;
  padding: 6px;
  background: hsl(var(--card) / 92%);
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 8%);
  backdrop-filter: blur(12px);

  &__zoom {
    min-width: 46px;
    padding: 0 4px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    text-align: center;
  }
}
</style>
