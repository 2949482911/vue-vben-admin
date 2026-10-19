<script lang="ts" setup name="AiAssetStudio">
import type {
  ChatOutput,
  ChatTaskItem,
  GalleryTile,
  RefAsset,
} from './constants';

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
import { useRoute } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Card, CardMeta, Col, message, Row, Segmented } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';
import { useWorkspaceStore } from '#/store';

import { PICKER_PAGE_SIZE, TASK_STATUS_MAP } from '../constants';
import ChatComposer from './components/ChatComposer.vue';
import RefPickerDrawer from './components/RefPickerDrawer.vue';
import ResultDrawer from './components/ResultDrawer.vue';
import {
  CHAT_SKILL_OPTIONS,
  PLACEHOLDER_WORKS,
  skillKind,
  SMART_RATIO,
  VIDEO_DURATION_DEFAULT,
} from './constants';

const route = useRoute();
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
  modelLabels.value = Object.fromEntries(
    usable.map((item) => [
      String(item.id),
      `${item.model ?? ''}（${item.provider ?? item.source ?? ''}）`,
    ]),
  );
  models.value = usable.map((item) => ({
    capability: item.capability,
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
const duration = ref(VIDEO_DURATION_DEFAULT);
const audio = ref(true);
const skill = ref('text2img');
const submitting = ref(false);
/** 参考图（图生图 / 图编辑） */
const refs = ref<RefAsset[]>([]);

const [RefPicker, refPickerApi] = useVbenDrawer({
  connectedComponent: RefPickerDrawer,
});

/** 迭代目标：重新编辑时带回 materialId，下一次生成即产生新版本 */
const iterationTarget = ref<null | { id: number | string; preview: string }>(null);

const [Result, resultApi] = useVbenDrawer({
  connectedComponent: ResultDrawer,
});

function openResult(task: ChatTaskItem, index = 0) {
  resultApi.setData({ index, task });
  resultApi.open();
}

function cancelIteration() {
  iterationTarget.value = null;
}

/** 用任务卡参数回填输入框（兜底） */
function applyTaskParams(task: ChatTaskItem) {
  prompt.value = task.prompt;
  if (task.modelId !== undefined) {
    modelId.value = task.modelId;
  }
  ratio.value = task.ratio;
  resolution.value = task.resolution;
  count.value = task.count;
  skill.value = task.skill;
  if (task.duration !== undefined) {
    duration.value = task.duration;
  }
  if (task.audio !== undefined) {
    audio.value = task.audio;
  }
  refs.value = (task.refImages ?? []).map((url, index) => ({
    id: `task-ref-${index}`,
    name: `参考图 ${index + 1}`,
    url,
  }));
}

/** 用最近一次任务的 skill + paramsSnapshot 回填（比任务卡更准） */
function applySnapshot(
  skillType?: string,
  snapshot?: null | Record<string, any>,
) {
  if (skillType) {
    skill.value = skillType;
  }
  if (!snapshot) {
    return;
  }
  if (snapshot.prompt) {
    prompt.value = String(snapshot.prompt);
  }
  if (snapshot.modelId !== undefined) {
    modelId.value = snapshot.modelId;
  }
  if (snapshot.ratio || snapshot.size) {
    ratio.value = String(snapshot.ratio ?? snapshot.size);
  }
  if (snapshot.resolution) {
    resolution.value = String(snapshot.resolution);
  }
  if (snapshot.count) {
    count.value = Number(snapshot.count) || count.value;
  }
  if (Array.isArray(snapshot.refImages)) {
    refs.value = snapshot.refImages.map((url: string, index: number) => ({
      id: `task-ref-${index}`,
      name: `参考图 ${index + 1}`,
      url,
    }));
  }
}

/**
 * 按 materialId 回填参数并进入「迭代」状态（草稿区「重新编辑」与结果抽屉共用）
 *
 * - 先立即记下迭代目标，避免异步取参期间点生成漏带 materialId
 * - 参数优先取该素材最近一次任务（task/list?materialId=），保留原 skill
 */
async function reeditByMaterialId(
  materialId: number | string,
  fallback?: ChatTaskItem,
) {
  const output = fallback?.outputs?.find(
    (item) => String(item.materialId) === String(materialId),
  );
  iterationTarget.value = { id: materialId, preview: output?.url ?? '' };

  if (fallback) {
    applyTaskParams(fallback);
  }

  try {
    const res = await aiAssetApi.fetchTaskList({
      materialId,
      page: 1,
      pageSize: 1,
    });
    const latest = res?.items?.[0];
    if (latest) {
      applySnapshot(latest.skill, latest.paramsSnapshot);
    }
  } catch {
    // 取不到最近任务就用兜底参数
  }
}

/** 结果抽屉「重新编辑」 */
function handleReedit(task: ChatTaskItem, materialId: number | string) {
  void reeditByMaterialId(materialId, task);
}

/** 再次生成：同参数 + 新 requestId（不带 materialId，出全新一版） */
async function handleRegenerate(task: ChatTaskItem) {
  applyTaskParams(task);
  iterationTarget.value = null;
  await submit();
}

/** 确认入库后刷新产物状态 */
function handleConfirmed() {
  void attachOutputs(true);
}

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
    cover: task.outputs?.[0]?.url,
    covers: (task.outputs ?? []).slice(0, 4).map((output) => output.url),
    isVideo: task.outputs?.[0]?.materialType === 'video',
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
    task,
    tintIndex: index % 4,
    title: task.prompt,
  }));
});

function newRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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
      // 每次点击都必须换新的 requestId（否则会被后端幂等命中，拿回旧任务）
      requestId: newRequestId(),
      // 迭代：带 materialId 会基于该素材出新版本
      materialId: iterationTarget.value?.id,
      modelId: modelId.value,
      params:
        skillKind(skill.value) === 'video'
          ? { audio: audio.value, count: 1, duration: duration.value, resolution: resolution.value }
          : { count: count.value, resolution: resolution.value },
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
      modelId: modelId.value,
      modelLabel:
        modelLabels.value[String(modelId.value)] ?? String(modelId.value),
      prompt: text,
      refCount: refs.value.length,
      refImages: refs.value.map((item) => item.url),
      duration: duration.value,
      audio: audio.value,
      ratio: ratio.value,
      resolution: resolution.value,
      skill: skill.value,
      status: task?.status ?? 1,
    });
    message.success('已提交生成，产物落草稿区');
    iterationTarget.value = null;
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
async function attachOutputs(force = false) {
  const pending = tasks.value.filter(
    (item) =>
      (item.materialIds?.length ?? 0) > 0 &&
      (force || (item.materialIds?.length ?? 0) > (item.outputs?.length ?? 0)),
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
      const outputs: ChatOutput[] = [];
      for (const id of item.materialIds ?? []) {
        const material = byId.get(String(id));
        const url = material?.thumbnailUrl ?? material?.storageUrl;
        if (url) {
          outputs.push({
            cover: material?.thumbnailUrl,
            duration: material?.videoDuration,
            materialId: id,
            materialType: material?.materialType,
            status: material?.status,
            url,
          });
        }
      }
      if (outputs.length > 0) {
        item.outputs = outputs;
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

onMounted(async () => {
  await loadModels();
  // 从草稿区「重新编辑」跳转过来时带 ?materialId=（保留在 URL 里：
  // 清 query 会改变 fullPath，vben 按 key 渲染路由视图会整页重挂载、把输入状态冲掉）
  const materialId = route.query.materialId;
  if (typeof materialId === 'string' && materialId) {
    await reeditByMaterialId(materialId);
  }
});
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

          <div v-if="iterationTarget" class="studio-hero__iter">
            <img v-if="iterationTarget.preview" alt="参考" :src="iterationTarget.preview" />
            <span>将基于该素材生成新版本（v{{ 'N+1' }}）</span>
            <button type="button" @click="cancelIteration">取消迭代</button>
          </div>

          <ChatComposer
            v-if="mode === 'chat'"
            v-model:prompt="prompt"
            v-model:model-id="modelId"
            v-model:ratio="ratio"
            v-model:resolution="resolution"
            v-model:count="count"
            v-model:duration="duration"
            v-model:audio="audio"
            v-model:skill="skill"
            v-model:refs="refs"
            :loading="submitting"
            :models="models"
            :skills="CHAT_SKILL_OPTIONS"
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
              <Card
                class="work-card"
                hoverable
                @click="tile.task ? openResult(tile.task) : undefined"
              >
                <template #cover>
                  <div
                    class="work-card__cover"
                    :class="`work-card__cover--${tile.tintIndex ?? index % 4}`"
                  >
                    <div
                      v-if="tile.covers?.length"
                      class="work-grid"
                      :class="`work-grid--${Math.min(tile.covers.length, 4)}`"
                    >
                      <template v-for="url in tile.covers" :key="url">
                        <video
                          v-if="tile.isVideo"
                          muted
                          playsinline
                          preload="metadata"
                          :src="url"
                        ></video>
                        <img v-else :alt="tile.title" :src="url" />
                      </template>
                    </div>
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
    <Result
      @confirm="handleConfirmed"
      @reedit="handleReedit"
      @regenerate="handleRegenerate"
    />
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

/* 迭代提示（重新编辑后、下一次生成前） */
.studio-hero__iter {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: color-mix(in srgb, hsl(var(--primary)) 8%, transparent);
  border: 1px solid color-mix(in srgb, hsl(var(--primary)) 25%, transparent);
  border-radius: 10px;

  img {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 6px;
  }

  button {
    margin-left: auto;
    font-size: 12px;
    color: hsl(var(--primary));
    cursor: pointer;
    background: none;
    border: none;
  }
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

.work-grid {
  display: grid;
  width: 100%;
  height: 150px;
  gap: 2px;
}

.work-grid--1 {
  grid-template-columns: 1fr;
}

.work-grid--2 {
  grid-template-columns: repeat(2, 1fr);
}

.work-grid--3,
.work-grid--4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.work-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
