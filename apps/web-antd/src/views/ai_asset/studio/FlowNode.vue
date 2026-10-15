<script setup lang="ts" name="FlowNode">
import { computed, inject } from 'vue';

/**
 * 工作流画布 — 自定义节点
 *
 * 供 @vue-flow/core 的 #node-image / #node-video 插槽使用。
 * 选中时在节点下方展开配置条（提示词 / 模型 / 画质 / 规格 / 数量 / 生成）。
 * 配色走 vben 主题 token（浅色 / 深色自适应）。
 */
import { Handle, Position } from '@vue-flow/core';
import { Button, Input, Select } from 'ant-design-vue';

import {
  COUNT_OPTIONS,
  DURATION_OPTIONS,
  NODE_SKILL_OPTIONS,
  QUALITY_OPTIONS,
  RATIO_OPTIONS,
  RESOLUTION_OPTIONS,
  RUN_STATUS_MAP,
} from '../constants';

const props = defineProps<{
  data: {
    config?: Record<string, any>;
    name?: string;
    nodeType?: string;
    outputMaterialId?: number | string;
    /** 1待运行 2运行中 3成功 4失败 */
    status?: number;
  };
  id?: string;
  selected?: boolean;
}>();

/** 画布上下文（由 studio/index.vue provide）：模型列表 / 改配置 / 生成 */
const ctx = inject<any>('studioCtx', null);

const cfg = computed<Record<string, any>>(() => props.data.config ?? {});
const isVideo = computed(() => props.data.nodeType === 'video');
const statusMeta = computed(() =>
  props.data.status ? RUN_STATUS_MAP[props.data.status] : null,
);
const generating = computed(() => !!ctx?.generating?.value);
const models = computed<any[]>(() =>
  ctx?.modelOptionsFor ? ctx.modelOptionsFor(props.data.nodeType) : [],
);

function patch(key: string, value: any) {
  ctx?.patchConfig?.(props.id, key, value);
}
function generate() {
  ctx?.generateNode?.(props.id);
}
</script>

<template>
  <!-- 不能 overflow:hidden：否则会裁掉伸出节点边框的连接端口，导致无法连线 -->
  <div class="flow-node" :class="[{ 'is-sel': selected }, `st-${data.status ?? 1}`]">
    <Handle id="in" :position="Position.Left" type="target" />

    <div class="fn-hd">
      <span class="fn-ic">{{ isVideo ? '▶' : '◱' }}</span>
      <span class="fn-title">{{ data.name }}</span>
      <span v-if="statusMeta" class="fn-badge">{{ statusMeta.label }}</span>
    </div>

    <div class="fn-prev">{{ isVideo ? '视频预览' : '图片预览' }}</div>

    <div class="fn-cap">{{ cfg.prompt || '（未填提示词）' }}</div>

    <div class="fn-out">
      {{ data.outputMaterialId ? `产物素材 #${data.outputMaterialId}` : '输出 →' }}
    </div>

    <!-- 选中：节点下方展开配置条（nodrag：避免操作控件时拖动节点） -->
    <div v-if="selected" class="fn-cfg nodrag">
      <Input.TextArea
        :rows="2"
        size="small"
        :value="cfg.prompt"
        placeholder="描述要生成的画面…"
        @change="(e: any) => patch('prompt', e.target.value)"
      />

      <div class="cfg-row">
        <Select
          size="small"
          :options="NODE_SKILL_OPTIONS"
          :value="cfg.skill"
          @change="(v: any) => patch('skill', v)"
        />
        <Select
          allow-clear
          size="small"
          :options="models"
          placeholder="模型"
          :value="cfg.modelId"
          @change="(v: any) => patch('modelId', v)"
        />
      </div>

      <div class="cfg-row">
        <template v-if="isVideo">
          <Select
            size="small"
            :options="RESOLUTION_OPTIONS"
            :value="cfg.resolution"
            @change="(v: any) => patch('resolution', v)"
          />
          <Select
            size="small"
            :options="DURATION_OPTIONS"
            :value="cfg.duration"
            @change="(v: any) => patch('duration', v)"
          />
        </template>
        <template v-else>
          <Select
            size="small"
            :options="QUALITY_OPTIONS"
            :value="cfg.quality || '标准画质'"
            @change="(v: any) => patch('quality', v)"
          />
          <Select
            size="small"
            :options="RESOLUTION_OPTIONS"
            :value="cfg.resolution"
            @change="(v: any) => patch('resolution', v)"
          />
        </template>
      </div>

      <div class="cfg-row">
        <Select
          size="small"
          :options="RATIO_OPTIONS"
          :value="cfg.ratio"
          @change="(v: any) => patch('ratio', v)"
        />
        <Select
          size="small"
          :options="COUNT_OPTIONS"
          :value="cfg.count ?? 1"
          @change="(v: any) => patch('count', v)"
        />
        <Button
          :loading="generating"
          size="small"
          type="primary"
          @click="generate"
        >
          ✦生成
        </Button>
      </div>
    </div>

    <Handle id="out" :position="Position.Right" type="source" />
  </div>
</template>

<style scoped>
.flow-node {
  width: 220px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 2px);
  box-shadow: 0 6px 18px hsl(var(--foreground) / 6%);
}

.flow-node.is-sel {
  width: 300px;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 12%);
}

.flow-node.st-2 {
  border-color: hsl(var(--primary));
}

.flow-node.st-4 {
  border-color: hsl(var(--destructive));
}

.fn-hd {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid hsl(var(--border));
}

.fn-ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 6px;
}

.fn-title {
  flex: 1;
  font-size: 12.5px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.fn-badge {
  padding: 1px 7px;
  font-size: 10.5px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  border-radius: 999px;
}

.fn-prev {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  border-bottom: 1px solid hsl(var(--border));
}

.fn-cap {
  display: -webkit-box;
  padding: 8px 10px 4px;
  overflow: hidden;
  font-size: 11.5px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.fn-out {
  padding: 0 10px 8px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.fn-cfg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px 10px;
  border-top: 1px solid hsl(var(--border));
}

.cfg-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.cfg-row :deep(.ant-select) {
  flex: 1;
  min-width: 0;
}
</style>
