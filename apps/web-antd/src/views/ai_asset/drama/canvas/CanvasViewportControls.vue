<script lang="ts" setup name="CanvasViewportControls">
import { computed } from 'vue';

import {
  BorderOutlined,
  CompressOutlined,
  EyeInvisibleOutlined,
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue';
import { Button, Popover, Tooltip } from 'ant-design-vue';

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
    <Tooltip title="框选模式（关闭时左键拖动平移）">
      <Button
        size="small"
        :type="store.boxSelectMode ? 'primary' : 'default'"
        @click="store.toggleBoxSelectMode()"
      >
        框选
      </Button>
    </Tooltip>
    <Tooltip title="自动整理">
      <Button size="small" @click="store.autoArrange()">整理</Button>
    </Tooltip>
    <Popover placement="topRight" trigger="click">
      <template #title>画布操作</template>
      <template #content>
        <ul class="canvas-help">
          <li>左键拖空白：平移画布</li>
          <li>空格 + 拖动：平移画布</li>
          <li>中键拖动：平移画布</li>
          <li>滚轮：缩放</li>
          <li>开启“框选”后拖动：框选节点</li>
          <li>Ctrl/⌘ + 点击：多选节点</li>
          <li>点击节点：打开右侧信息面板</li>
          <li>点空白 / Esc：关闭信息面板</li>
          <li>双击节点标题：重命名</li>
        </ul>
      </template>
      <Button size="small" title="画布帮助">
        <QuestionCircleOutlined />
      </Button>
    </Popover>
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

.canvas-help {
  padding-left: 16px;
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
}
</style>
