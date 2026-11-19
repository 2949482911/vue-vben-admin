<script lang="ts" setup name="CanvasEdge">
import type { EdgeProps } from '@vue-flow/core';

import { computed } from 'vue';

import { CloseOutlined } from '@ant-design/icons-vue';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@vue-flow/core';

import { useCanvasGraphStore } from './store';

const props = defineProps<EdgeProps>();

const store = useCanvasGraphStore();

const geometry = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.34,
  }),
);

const path = computed(() => geometry.value[0]);
const labelX = computed(() => geometry.value[1]);
const labelY = computed(() => geometry.value[2]);

const label = computed(() =>
  typeof props.label === 'string' ? props.label : '',
);

function remove() {
  store.removeEdge(props.id);
}
</script>

<template>
  <BaseEdge
    :id="id"
    :marker-end="markerEnd"
    :path="path"
    :label="label || undefined"
    :label-x="labelX"
    :label-y="labelY"
    :label-style="labelStyle"
    :label-show-bg="labelShowBg"
    :label-bg-style="labelBgStyle"
    :label-bg-padding="labelBgPadding"
    :label-bg-border-radius="labelBgBorderRadius"
  />
  <EdgeLabelRenderer v-if="selected">
    <button
      class="canvas-edge__delete nodrag nopan"
      type="button"
      title="删除连线"
      :style="{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
      }"
      @click.stop="remove"
    >
      <CloseOutlined />
    </button>
  </EdgeLabelRenderer>
</template>

<style scoped lang="scss">
.canvas-edge__delete {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 10px;
  color: hsl(var(--destructive));
  pointer-events: all;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  box-shadow: 0 2px 6px hsl(var(--foreground) / 10%);
}
</style>
