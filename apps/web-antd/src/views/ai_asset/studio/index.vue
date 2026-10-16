<script lang="ts" setup name="AiAssetStudio">
import type { ChatTaskItem, GalleryTile, RefAsset } from './constants';

/**
 * 创作工作台
 *
 * 两段式布局（对齐即梦）：
 * - 上半：对话式创作（技能 chips + 提示词 + 模型/比例/清晰度/数量 → material/generate；
 *   任务到终态后回查素材地址）
 * - 下半：成品展示区（有真实产物就展示任务产物，还没有就用占位卡片撑版式）
 * 画布式创作沿用原实现，已封装为 CanvasStudio.vue，本期先以禁用分段占位。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Card, CardMeta, Col, message, Row, Segmented } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';
import { useWorkspaceStore } from '#/store';

import { PICKER_PAGE_SIZE, TASK_STATUS_MAP } from '../constants';
import ChatComposer from './components/ChatComposer.vue';
import RefPickerDrawer from './components/RefPickerDrawer.vue';
import {
  IMAGE_SKILL_OPTIONS,
  PLACEHOLDER_WORKS,
  SMART_RATIO,
} from './constants';

const workspaceStore = useWorkspaceStore();

const workspaceName = computed(
  () =>
    workspaceStore.workspaceName || `工作区 #${workspaceStore.workspaceId ?? '-'}`,
);

/** 生成 | 画布（画布本期先禁用占位） */
const MODE_TABS = [
  { label: '生成', value: 'chat' },
  { disabled: true, label: '画布', value: 'canvas' },
];
const mode = ref('chat');

// ==================== 模型库（只取图片类能力） ====================

const models = ref<Array<{ label: string; value: number | string }>>([]);
const modelLabels = ref<Record<string, string>>({});

async function loadModels() {
  const res = await aiModelApi.fetchModelConfigList({ page: 1, pageSize: 500 });
  const usable = (res?.items ?? []).filter(
    (item) => item.status === undefined || item.status === 1,
  );
  const imageModels = usable.filter(
    (item) => !item.capability || ['edit', 'image'].includes(item.capability),
  );
  modelLabels.value = Object.fromEntries(
    imageModels.map((item) => [
      String(item.id),
      `${item.model ?? ''}（${item.provider ?? item.source ?? ''}）`,
    ]),
  );
  models.value = imageModels.map((item) => ({
    label: modelLabels.value[String(item.id)]!,
    value: item.id,
  }));
}

// ==================== 表单 ====================

const prompt = ref('');
const modelId = ref<number | string | undefined>();
const ratio = ref(SMART_RATIO);
const resolution = ref('2K');
const count = ref(1);
const skill = ref('text2img');
const submitting = ref(false);
/** 参考图（图生图 / 图编辑） */
const refs = ref<RefAsset[]>([]);

const [RefPicker, refPickerApi] = useVbenDrawer({
  connectedComponent: RefPickerDrawer,
});

function openRefPicker() {
  refPickerApi.setData({ selected: refs.value });
  refPickerApi.open();
}

function handleRefsConfirm(list: RefAsset[]) {
  refs.value = list;
}

// ==================== 生成记录 / 展示区 ====================

const tasks = ref<ChatTaskItem[]>([]);
let timer: ReturnType<typeof setInterval> | undefined;

/** 展示区数据：有真实任务就展示任务产物，否则用占位卡片撑版式 */
const galleryTiles = computed<GalleryTile[]>(() => {
  if (tasks.value.length === 0) {
    return PLACEHOLDER_WORKS;
  }
  return tasks.value.map((task, index) => ({
    badge:
      task.status === 4
        ? undefined
        : (TASK_STATUS_MAP[task.status]?.label ?? '处理中'),
    cover: task.outputs?.[0],
    description: task.errorMsg
      ? `生成失败：${task.errorMsg}`
      : [
          (task.outputs?.length ?? 0) > 1
            ? `${task.outputs?.length} 张`
            : undefined,
          task.refCount ? `参考图 ${task.refCount} 张` : undefined,
          task.modelLabel,
          task.ratio === SMART_RATIO ? '智能比例' : task.ratio,
          task.resolution,
          task.createTime,
        ]
          .filter(Boolean)
          .join(' · '),
    id: `task-${task.id}`,
    tintIndex: index % 4,
    title: task.prompt,
  }));
});

async function submit() {
  if (!prompt.value.trim()) {
    message.warning('先描述一下你想生成的素材');
    return;
  }
  if (!modelId.value) {
    message.warning('请选择模型');
    return;
  }
  submitting.value = true;
  try {
    const text = prompt.value.trim();
    const task = await aiAssetApi.generateMaterial({
      modelId: modelId.value,
      params: { count: count.value, resolution: resolution.value },
      prompt: text,
      // 与画布节点同一约定：size 传比例字符串，「智能」则由模型决定
      // 有参考图 → 走图生图（用户切成「修图」则按 edit 提交）
      refImages:
        refs.value.length > 0 ? refs.value.map((item) => item.url) : undefined,
      size: ratio.value === SMART_RATIO ? undefined : ratio.value,
      skill:
        refs.value.length > 0 && skill.value === 'text2img'
          ? 'img2img'
          : skill.value,
    });
    tasks.value.unshift({
      count: count.value,
      createTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      id: task?.id ?? Date.now(),
      modelLabel:
        modelLabels.value[String(modelId.value)] ?? String(modelId.value),
      prompt: text,
      refCount: refs.value.length,
      ratio: ratio.value,
      resolution: resolution.value,
      skill: skill.value,
      status: task?.status ?? 1,
    });
    message.success('已提交生成，产物落草稿区');
    startPolling();
  } finally {
    submitting.value = false;
  }
}

/** 轮询任务状态；到终态后回查素材地址 */
async function poll() {
  if (tasks.value.every((item) => item.status > 3)) {
    stopPolling();
    return;
  }
  const res = await aiAssetApi.fetchTaskList({ page: 1, pageSize: 50 });
  const remoteMap = new Map(
    (res?.items ?? []).map((item) => [String(item.id), item]),
  );
  let needOutputs = false;
  for (const item of tasks.value) {
    const remote = remoteMap.get(String(item.id));
    if (!remote) {
      continue;
    }
    item.status = remote.status ?? item.status;
    item.errorMsg = remote.errorMsg;
    // 多图契约：优先用 materialIds（列表），兼容旧的单个 materialId
    const ids = remote.materialIds?.length
      ? remote.materialIds
      : remote.materialId === undefined
        ? []
        : [remote.materialId];
    if (ids.length > (item.materialIds?.length ?? 0)) {
      item.materialIds = ids;
      needOutputs = true;
    }
  }
  if (needOutputs) {
    await attachOutputs();
  }
}

/** 用产物素材 ID 回查素材地址（生成物是草稿；多图按 id 逐个取） */
async function attachOutputs() {
  const pending = tasks.value.filter(
    (item) =>
      (item.materialIds?.length ?? 0) > (item.outputs?.length ?? 0),
  );
  if (pending.length === 0) {
    return;
  }
  try {
    const res = await aiAssetApi.fetchMaterialList({
      page: 1,
      pageSize: PICKER_PAGE_SIZE,
    });
    const byId = new Map(
      (res?.items ?? []).map((item) => [String(item.id), item]),
    );
    for (const item of pending) {
      const urls = (item.materialIds ?? [])
        .map((id) => {
          const material = byId.get(String(id));
          return material?.thumbnailUrl ?? material?.storageUrl;
        })
        .filter((url): url is string => Boolean(url));
      if (urls.length > 0) {
        item.outputs = urls;
      }
    }
  } catch {
    // 回查失败不影响任务状态展示
  }
}

function startPolling() {
  if (timer) {
    return;
  }
  timer = setInterval(() => {
    void poll();
  }, 3000);
  void poll();
}

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

onMounted(loadModels);
onBeforeUnmount(stopPolling);
</script>

<template>
  <Page auto-content-height>
    <div class="studio-page">
      <!-- ============ 上半：对话式创作 ============ -->
      <Card class="studio-hero">
        <div class="studio-hero__inner">
          <h2 class="studio-hero__title">你好，今天想要创作什么？</h2>
          <div class="studio-hero__mode">
            <Segmented v-model:value="mode" :options="MODE_TABS" />
          </div>

          <ChatComposer
            v-if="mode === 'chat'"
            v-model:prompt="prompt"
            v-model:model-id="modelId"
            v-model:ratio="ratio"
            v-model:resolution="resolution"
            v-model:count="count"
            v-model:skill="skill"
            v-model:refs="refs"
            :loading="submitting"
            :models="models"
            :skills="IMAGE_SKILL_OPTIONS"
            @pick="openRefPicker"
            @submit="submit"
          />
        </div>
      </Card>

      <!-- ============ 下半：成品展示 ============ -->
      <Card>
        <section class="studio-gallery">
          <div class="studio-gallery__hd">
            <h3>最近生成</h3>
            <span class="studio-gallery__tip">
            当前工作区：<b>{{ workspaceName }}</b> · 产物落草稿，确认后进正式素材库
          </span>
          </div>

          <Row :gutter="[12, 12]">
            <Col
              v-for="(tile, index) in galleryTiles"
              :key="tile.id"
              :lg="6"
              :md="8"
              :sm="12"
              :xs="24"
            >
              <Card class="work-card" hoverable>
                <template #cover>
                  <div
                    class="work-card__cover"
                    :class="`work-card__cover--${tile.tintIndex ?? index % 4}`"
                  >
                    <img v-if="tile.cover" :alt="tile.title" :src="tile.cover" />
                    <span v-else class="work-card__ph">占位图</span>
                    <span v-if="tile.badge" class="work-card__badge">
                    {{ tile.badge }}
                  </span>
                  </div>
                </template>
                <CardMeta :description="tile.description" :title="tile.title" />
              </Card>
            </Col>
          </Row>
        </section>
      </Card>
    </div>

    <RefPicker @confirm="handleRefsConfirm" />
  </Page>
</template>

<style scoped lang="scss">
.studio-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---------- 上半：创作区 ---------- */
.studio-hero {
  :deep(.ant-card-body) {
    padding: 28px 24px 20px;
  }
}

.studio-hero__inner {
  max-width: 880px;
  margin: 0 auto;
}

.studio-hero__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.studio-hero__mode {
  display: flex;
  justify-content: center;
  margin: 14px 0 18px;
}

/* ---------- 下半：成品展示 ---------- */
.studio-gallery__hd {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.studio-gallery__tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  b {
    color: hsl(var(--foreground));
  }
}

.work-card {
  height: 100%;

  :deep(.ant-card-cover) {
    overflow: hidden;
  }

  :deep(.ant-card-body) {
    padding: 10px 12px 12px;
  }
}

.work-card__cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
}

/* 占位块配色：只用主题 token 的浅渐变，浅色/深色都成立 */
.work-card__cover--0 {
  background: linear-gradient(
    135deg,
    hsl(var(--accent)),
    color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--accent)))
  );
}

.work-card__cover--1 {
  background: linear-gradient(
    135deg,
    hsl(var(--accent)),
    color-mix(in srgb, hsl(258 84% 62%) 14%, hsl(var(--accent)))
  );
}

.work-card__cover--2 {
  background: linear-gradient(
    135deg,
    hsl(var(--accent)),
    color-mix(in srgb, hsl(187 78% 38%) 14%, hsl(var(--accent)))
  );
}

.work-card__cover--3 {
  background: linear-gradient(
    135deg,
    hsl(var(--accent)),
    color-mix(in srgb, hsl(var(--success)) 16%, hsl(var(--accent)))
  );
}

.work-card__ph {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.work-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 1px 8px;
  font-size: 12px;
  color: hsl(var(--primary));
  background: rgb(255 255 255 / 88%);
  border-radius: 999px;
}

.work-card :deep(.ant-card-meta-title) {
  margin-bottom: 2px;
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-card :deep(.ant-card-meta-description) {
  font-size: 12px;
  line-height: 1.5;
}
</style>
