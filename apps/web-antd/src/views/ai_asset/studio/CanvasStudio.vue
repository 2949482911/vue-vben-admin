<script lang="ts" setup name="AiAssetCanvasStudio">
/**
 * 创作工作台 · 画布式创作（工作流画布 / DAG）
 *
 * 左侧「添加节点」→ 画布拖拽连线 → 选中节点后在**节点下方展开配置条**（提示词/模型/画质/规格/数量/生成）
 * → 保存 / 运行 → 节点级进度。接口：workflow/*、material/generate（前缀 /platform/ai_asset）。
 * 画布：@vue-flow/core（自定义节点 FlowNode）。MVP 节点：image / video。
 * 配色走 vben 主题 token（浅色 / 深色自适应）。
 *
 * 页面容器（Page）由 studio/index.vue 提供；本期先封装保留、暂不挂出来。
 */
import type { CharacterItem, SceneItem } from '#/api/models/ai_asset';

import { onBeforeUnmount, onMounted, provide, ref } from 'vue';

import { Controls } from '@vue-flow/controls';
import { useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Button, Empty, Input, message, Select } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';

import { NODE_TYPE_OPTIONS, PICKER_PAGE_SIZE } from '../constants';
import FlowNode from './FlowNode.vue';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

// ==================== 画布 ====================

const { addEdges, addNodes, findNode, getEdges, getNodes, onConnect, setEdges, setNodes } =
  useVueFlow();

onConnect((params) => {
  addEdges([
    {
      id: `e-${Date.now()}`,
      source: params.source,
      sourceHandle: params.sourceHandle ?? 'out',
      target: params.target,
      targetHandle: params.targetHandle ?? 'in',
    },
  ]);
});

/** 节点临时 id：本地自增 Long（会话内唯一，保存原样提交） */
let seq = Date.now();

function nodeLabel(type: string) {
  return NODE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function defaultConfig(type: string) {
  return type === 'video'
    ? {
        audio: true,
        count: 1,
        duration: 5,
        modelId: undefined,
        negativePrompt: '',
        prompt: '',
        ratio: '16:9',
        resolution: '1080p',
        skill: 'img2video',
      }
    : {
        background: '',
        count: 1,
        modelId: undefined,
        negativePrompt: '',
        prompt: '',
        quality: '标准画质',
        ratio: '16:9',
        resolution: '2K',
        skill: 'text2img',
      };
}

function addNode(type: string) {
  const id = ++seq;
  addNodes([
    {
      data: {
        config: defaultConfig(type),
        name: `${nodeLabel(type)}节点${getNodes.value.filter((n: any) => n.data?.nodeType === type).length + 1}`,
        nodeType: type,
        status: 1,
      },
      id: String(id),
      position: { x: 120 + Math.random() * 320, y: 80 + Math.random() * 300 },
      type,
    },
  ]);
}

/** 修改节点 config（供 FlowNode 内嵌配置条调用） */
function patchConfig(id: string | undefined, key: string, value: any) {
  if (!id) {
    return;
  }
  const node = findNode(id);
  if (node) {
    node.data = { ...node.data, config: { ...node.data.config, [key]: value } };
  }
}

// ==================== 工作区 / 工作流 ====================
const workspaceOptions = ref<{ label: string; value: number | string }[]>([]);
const workspaceId = ref<number | string | undefined>();

const workflowName = ref('未命名工作流');
const scenario = ref('ecommerce');
const workflowId = ref<null | number | string>(null);

const workflowOptions = ref<{ label: string; value: number | string }[]>([]);
async function loadWorkflowOptions() {
  const res = await aiAssetApi.fetchWorkflowList({ page: 1, pageSize: 200 });
  workflowOptions.value = (res?.items ?? []).map((w) => ({
    label: w.name || `工作流#${w.id}`,
    value: w.id,
  }));
}

async function loadWorkspaces() {
  const res = await aiAssetApi.fetchWorkspaces({
    page: 1,
    pageSize: PICKER_PAGE_SIZE,
  });
  const list = res?.items ?? [];
  workspaceOptions.value = list.map((w) => ({
    label: `${w.name || '工作区'}（main_id=${w.id}）`,
    value: w.id,
  }));
  if (!workspaceId.value && list.length > 0) {
    workspaceId.value = list[0]!.id;
  }
}

// ==================== 保存 / 加载 ====================

function serialize() {
  const nodes = getNodes.value.map((n) => ({
    config: n.data?.config ?? {},
    id: Number(n.id),
    name: n.data?.name ?? '',
    nodeType: n.data?.nodeType ?? 'image',
    posX: Math.round(n.position.x),
    posY: Math.round(n.position.y),
  }));
  const edges = getEdges.value.map((e) => ({
    fromNodeId: Number(e.source),
    fromPort: e.sourceHandle ?? 'out',
    toNodeId: Number(e.target),
    toPort: e.targetHandle ?? 'in',
  }));
  return { edges, nodes };
}

async function handleSave() {
  const { edges, nodes } = serialize();
  if (nodes.length === 0) {
    message.warning('请先添加节点');
    return;
  }
  const id = await aiAssetApi.saveWorkflow({
    edges,
    id: workflowId.value,
    name: workflowName.value,
    nodes,
    scenario: scenario.value,
  });
  workflowId.value = id;
  message.success('已保存');
  await loadWorkflowOptions();
}

async function handleLoad(id: number | string) {
  const [detail, nodes, edges] = await Promise.all([
    aiAssetApi.fetchWorkflowDetail(id),
    aiAssetApi.fetchWorkflowNodes(id),
    aiAssetApi.fetchWorkflowEdges(id),
  ]);
  workflowId.value = detail?.id ?? id;
  workflowName.value = detail?.name ?? '未命名工作流';
  scenario.value = detail?.scenario ?? 'ecommerce';
  setNodes(
    (nodes ?? []).map((n) => ({
      data: {
        config: n.config ?? {},
        name: n.name ?? '',
        nodeType: n.nodeType ?? 'image',
        outputMaterialId: undefined,
        status: 1,
      },
      id: String(n.id),
      position: { x: n.posX ?? 0, y: n.posY ?? 0 },
      type: n.nodeType ?? 'image',
    })),
  );
  setEdges(
    (edges ?? []).map((e, i) => ({
      id: `e-${e.id ?? i}`,
      source: String(e.fromNodeId),
      sourceHandle: e.fromPort ?? 'out',
      target: String(e.toNodeId),
      targetHandle: e.toPort ?? 'in',
    })),
  );
}

function handleNew() {
  workflowId.value = null;
  workflowName.value = '未命名工作流';
  setNodes([]);
  setEdges([]);
}

// ==================== 运行 + 节点级进度 ====================

const running = ref(false);
let pollTimer: null | ReturnType<typeof setInterval> = null;

async function handleRun() {
  if (!workflowId.value) {
    message.warning('请先保存工作流');
    return;
  }
  if (running.value) {
    return;
  }
  running.value = true;
  try {
    const runId = await aiAssetApi.runWorkflow(workflowId.value);
    message.success(`已提交运行（runId=${runId}）`);
    pollTimer = setInterval(() => void pollRun(runId), 2000);
  } catch {
    running.value = false;
  }
}

async function pollRun(runId: number | string) {
  const list = (await aiAssetApi.fetchRunNodes(runId)) ?? [];
  for (const rn of list) {
    const node = findNode(String(rn.nodeId));
    if (node) {
      node.data = {
        ...node.data,
        outputMaterialId: rn.outputMaterialId,
        status: rn.status,
      };
    }
  }
  const done = list.length > 0 && list.every((r) => (r.status ?? 0) >= 3);
  if (done) {
    stopPoll();
    running.value = false;
    message.success('运行完成（产物落草稿区）');
  }
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// ==================== 模型库 / 单节点生成 ====================

const modelOptions = ref<
  Array<{ capability?: string; label: string; value: number | string }>
>([]);

async function loadModels() {
  const res = await aiModelApi.fetchModelConfigList({ page: 1, pageSize: 500 });
  modelOptions.value = (res?.items ?? [])
    .filter((m) => m.status === undefined || m.status === 1)
    .map((m) => ({
      capability: m.capability,
      label: `${m.model ?? ''}（${m.provider ?? m.source ?? ''}）`,
      value: m.id,
    }));
}

/** 按节点类型过滤可用模型：image → image/edit，video → video */
function modelOptionsFor(type?: string) {
  const caps = type === 'video' ? ['video'] : ['image', 'edit'];
  return modelOptions.value.filter(
    (m) => !m.capability || caps.includes(m.capability),
  );
}

const generating = ref(false);
async function generateNode(id: string | undefined) {
  if (!id) {
    return;
  }
  const node = findNode(id);
  const c = node?.data?.config ?? {};
  if (!c.modelId) {
    message.warning('请先为该节点选择模型');
    return;
  }
  generating.value = true;
  try {
    const task = await aiAssetApi.generateMaterial({
      modelId: c.modelId,
      negativePrompt: c.negativePrompt,
      params: {
        audio: c.audio,
        background: c.background,
        duration: c.duration,
        quality: c.quality,
        resolution: c.resolution,
      },
      prompt: c.prompt,
      size: c.ratio,
      skill: c.skill,
    });
    message.success(`已提交生成（任务 #${task?.id ?? '-'}），产物将落草稿区`);
  } finally {
    generating.value = false;
  }
}

/** 画布上下文：供 FlowNode 内嵌配置条读取模型/改配置/触发生成 */
provide('studioCtx', {
  generateNode,
  generating,
  modelOptionsFor,
  patchConfig,
});

// ==================== 资产面板（角色 / 场景，只读参考） ====================
const characters = ref<CharacterItem[]>([]);
const scenes = ref<SceneItem[]>([]);

onMounted(async () => {
  await Promise.all([
    loadWorkflowOptions(),
    loadWorkspaces(),
    loadModels(),
    // 画布左侧资产面板需要全量引用，用大页长一次取回
    aiAssetApi
      .fetchCharacters({ page: 1, pageSize: PICKER_PAGE_SIZE })
      .then((r) => (characters.value = r?.items ?? [])),
    aiAssetApi
      .fetchScenes({ page: 1, pageSize: PICKER_PAGE_SIZE })
      .then((r) => (scenes.value = r?.items ?? [])),
  ]);
});

onBeforeUnmount(stopPoll);
</script>

<template>
  <div class="studio">
      <!-- 顶栏 -->
      <header class="st-top">
        <Input v-model:value="workflowName" class="st-name" />
        <Select
          v-model:value="scenario"
          :options="[
            { label: '电商', value: 'ecommerce' },
            { label: '短剧', value: 'drama' },
            { label: '小游戏', value: 'minigame' },
          ]"
          class="st-scn"
        />
        <Select
          v-model:value="workspaceId"
          :options="workspaceOptions"
          class="st-ws"
          placeholder="工作区"
        />
        <Select
          :options="workflowOptions"
          allow-clear
          class="st-pick"
          placeholder="加载已有工作流"
          @change="(v: any) => v && handleLoad(v)"
        />
        <span class="spacer"></span>
        <Button @click="handleNew">新建</Button>
        <Button @click="handleSave">保存</Button>
        <Button :disabled="!workflowId" :loading="running" type="primary" @click="handleRun">
          ▶ 运行
        </Button>
      </header>

      <div class="st-body">
        <!-- 左：添加节点 + 资产 -->
        <aside class="st-left">
          <div class="lp-hd">添加节点</div>
          <div class="pal">
            <button
              v-for="opt in NODE_TYPE_OPTIONS"
              :key="opt.value"
              class="pal-i"
              :class="{ 'pal-i--on': opt.mvp }"
              :disabled="!opt.mvp"
              :title="opt.mvp ? '' : 'P1'"
              @click="opt.mvp && addNode(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>

          <div class="lp-hd lp-hd--mt">资产</div>
          <div class="asset-block">
            <div class="asset-t">角色</div>
            <div v-for="c in characters.slice(0, 4)" :key="c.id" class="asset">
              <span class="asset-av"></span>{{ c.name || '-' }}
            </div>
            <Empty v-if="characters.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" description="无角色" />
            <div class="asset-t">场景</div>
            <div v-for="s in scenes.slice(0, 4)" :key="s.id" class="asset">
              <span class="asset-av"></span>{{ s.name || '-' }}
            </div>
            <Empty v-if="scenes.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" description="无场景" />
          </div>
        </aside>

        <!-- 中：画布（选中节点在节点下方展开配置条） -->
        <section class="st-canvas">
          <VueFlow :default-viewport="{ x: 0, y: 0, zoom: 1 }" fit-view-on-init>
            <template #node-image="nodeProps">
              <FlowNode v-bind="nodeProps" />
            </template>
            <template #node-video="nodeProps">
              <FlowNode v-bind="nodeProps" />
            </template>
            <Controls />
            <MiniMap />
          </VueFlow>
          <div class="canvas-hint">拖拽节点移动 · 从右侧端口拖到另一节点左侧端口连线 · 点击节点展开配置</div>
        </section>
      </div>
    </div>
</template>

<style scoped lang="scss">
/* 全部走 vben 主题 token：浅色 / 深色自适应 */
.studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.st-top {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.st-name {
  width: 220px;
}

.st-scn {
  width: 110px;
}

.st-ws {
  width: 220px;
}

.st-pick {
  width: 200px;
}

.spacer {
  flex: 1;
}

.st-body {
  display: grid;
  flex: 1;
  grid-template-columns: 200px 1fr;
  min-height: 0;
}

.st-left {
  padding: 12px;
  overflow: auto;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
}

.lp-hd {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.lp-hd--mt {
  margin-top: 16px;
}

.pal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.pal-i {
  padding: 8px 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: not-allowed;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
  opacity: 0.5;
}

.pal-i--on {
  color: hsl(var(--foreground));
  cursor: pointer;
  opacity: 1;
}

.pal-i--on:hover {
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

.asset-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-t {
  margin-top: 6px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.asset {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 6px;
  font-size: 12px;
  color: hsl(var(--foreground));
}

.asset-av {
  width: 18px;
  height: 18px;
  background: hsl(var(--primary) / 18%);
  border-radius: 5px;
}

.st-canvas {
  position: relative;
  min-width: 0;
  background-color: hsl(var(--muted));
  background-image: radial-gradient(
    circle,
    hsl(var(--border)) 1px,
    transparent 1px
  );
  background-size: 22px 22px;
}

.st-canvas :deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

/* 适配主题：连线 / 控件 / 小地图 / 端口 */
.st-canvas :deep(.vue-flow__edge-path) {
  stroke: hsl(var(--primary));
}

.st-canvas :deep(.vue-flow__controls-button) {
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border-color: hsl(var(--border));
}

.st-canvas :deep(.vue-flow__minimap) {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.st-canvas :deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: hsl(var(--card));
  border: 2px solid hsl(var(--primary));
}

.canvas-hint {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 10px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card) / 85%);
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}
</style>
