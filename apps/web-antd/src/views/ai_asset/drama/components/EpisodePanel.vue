<script lang="ts" setup name="DramaEpisodePanel">
/**
 * 分集页：全项目镜头重新分集。
 *
 * 链路位置：短剧工作台 → 剧情 → 分集 → 本组件。
 * summary 只读；split-preview 只预览；split-apply 写入后以返回 summary 刷新并通知父级切集。
 */
import type { DramaApiError } from '../error';

import type { EpisodeItem } from '#/api/models/ai_asset';
import type {
  EpisodeSegmentPrompt,
  EpisodeShotRange,
  EpisodeSplitApplyRequest,
  EpisodeSplitMessage,
  EpisodeSplitMode,
  EpisodeSplitPreviewResult,
  EpisodeSplitStrategy,
  EpisodeSummaryItem,
} from '#/api/models/ai_asset_episode';

import { computed, ref, watch } from 'vue';

import { VbenLoading } from '@vben/common-ui';

import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Empty,
  InputNumber,
  message,
  Modal,
  Segmented,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetEpisodeApi } from '#/api/core/ai_asset_episode';

import { formatApiError, parseApiError } from '../error';
import { useEpisodeSplitDict } from '../useEpisodeSplitDict';

const props = defineProps<{
  episodeId?: number | string;
  /** 用于展示分集摘要（summary 契约不返回摘要文本） */
  episodes?: EpisodeItem[];
  novelId?: number | string;
}>();

const emit = defineEmits<{
  applied: [summary: EpisodeSummaryItem[]];
  selectEpisode: [episodeId: number | string];
}>();

const { modeOptions, modeReady } = useEpisodeSplitDict();

const STRATEGY_OPTIONS: Array<{
  label: string;
  value: EpisodeSplitStrategy;
}> = [
  { label: '保留并继续', value: 'preserve' },
  { label: '重新划分全部', value: 'redivide' },
];

function isSplitMode(value: string): value is EpisodeSplitMode {
  return value === 'smart' || value === 'even';
}

const mode = ref('smart');
const splitMode = computed<EpisodeSplitMode>(() =>
  isSplitMode(mode.value) ? mode.value : 'smart',
);

watch(
  modeOptions,
  (items) => {
    if (!items.length) {
      return;
    }
    if (items.some((item) => item.value === mode.value)) {
      return;
    }
    const first = items[0]?.value;
    if (first) {
      mode.value = first;
    }
  },
  { immediate: true },
);

const modeValid = computed(() =>
  modeOptions.value.some((item) => item.value === mode.value),
);

const modeLabel = computed(
  () =>
    modeOptions.value.find((item) => item.value === mode.value)?.label ??
    mode.value,
);

const strategy = ref<EpisodeSplitStrategy>('preserve');

const strategyLabel = computed(
  () =>
    STRATEGY_OPTIONS.find((item) => item.value === strategy.value)?.label ??
    strategy.value,
);

/** P6 的 projected 表示“本集已有分镜”，不是 P8 的画布投影 */
function projectedReasonText(item: EpisodeSummaryItem) {
  return item.projectedMessage || item.projectedReason || '';
}

function projectedText(item: EpisodeSummaryItem) {
  return item.projected
    ? '已投影'
    : projectedReasonText(item) || '未投影';
}

const summary = ref<EpisodeSummaryItem[]>([]);
const loading = ref(false);
const loadError = ref<DramaApiError>();
let loadSeq = 0;

async function loadSummary() {
  const seq = ++loadSeq;
  loadError.value = undefined;
  summary.value = [];
  if (!props.novelId) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const items = await aiAssetEpisodeApi.fetchEpisodeSummary(props.novelId);
    if (seq !== loadSeq) {
      return;
    }
    summary.value = items ?? [];
  } catch (error) {
    if (seq !== loadSeq) {
      return;
    }
    loadError.value = parseApiError(error);
  } finally {
    if (seq === loadSeq) {
      loading.value = false;
    }
  }
}

const totalShots = computed(() =>
  summary.value.reduce((total, item) => total + (item.shotCount ?? 0), 0),
);

function hasShotRange(item: { shotRange?: EpisodeShotRange }) {
  const first = item.shotRange?.firstSeq;
  const last = item.shotRange?.lastSeq;
  return (
    (first !== undefined && first !== null) ||
    (last !== undefined && last !== null)
  );
}

function rangeText(item: { shotRange?: EpisodeShotRange }) {
  const first = item.shotRange?.firstSeq ?? undefined;
  const last = item.shotRange?.lastSeq ?? undefined;
  if (first === undefined && last === undefined) {
    return '—';
  }
  if (last === undefined || first === last) {
    return String(first ?? last);
  }
  return `${first}-${last}`;
}

function durationText(value?: number) {
  return value === undefined ? '—' : `${value}s`;
}

function sceneCount(value?: number[]) {
  return value?.length ?? 0;
}

function summaryText(item: EpisodeSummaryItem) {
  return (
    props.episodes
      ?.find((episode) => String(episode.id) === String(item.episodeId))
      ?.summary?.trim() ?? ''
  );
}

function isActive(item: EpisodeSummaryItem) {
  return String(props.episodeId) === String(item.episodeId);
}

function selectEpisode(item: EpisodeSummaryItem) {
  emit('selectEpisode', item.episodeId);
}

function messageText(item: EpisodeSplitMessage) {
  return typeof item === 'string' ? item : item.message;
}

function messagesText(items?: EpisodeSplitMessage[]) {
  return (items ?? [])
    .map((item) => messageText(item))
    .filter((item) => Boolean(item))
    .join('；');
}

const splitOpen = ref(false);
const targetEpisodeCount = ref<number>();
const targetDurationSeconds = ref<number>();
const previewLoading = ref(false);
const previewError = ref<DramaApiError>();
const preview = ref<EpisodeSplitPreviewResult>();
const previewOpen = ref(false);
const applyLoading = ref(false);
const applyError = ref<DramaApiError>();
const confirmRedivide = ref(false);
const previewConfirmRedivide = ref(false);

watch(strategy, () => {
  previewError.value = undefined;
  previewConfirmRedivide.value = false;
  applyError.value = undefined;
  confirmRedivide.value = false;
});

const previewBlockers = computed(() => preview.value?.blockers ?? []);

const previewPreserved = computed(
  () => preview.value?.preservedEpisodes ?? [],
);

const previewPreservedSeqs = computed(() =>
  previewPreserved.value.map((item) => item.seq).join('/'),
);

const previewPreservedReason = computed(() => {
  const reasons = [
    ...new Set(
      previewPreserved.value
        .map((item) => item.reason)
        .filter((item): item is string => Boolean(item)),
    ),
  ];
  const readable = reasons.filter((reason) => /[\u4E00-\u9FA5]/.test(reason));
  return readable.join('；') || '有内容/产物';
});

const previewNeedConfirm = computed(
  () => strategy.value === 'redivide' && previewError.value?.status === 409,
);

const splitDisabledReason = computed(() => {
  if (!props.novelId) {
    return '先选择项目';
  }
  if (!modeReady.value) {
    return '字典未配置 ai_episode_split_mode';
  }
  if (!modeValid.value) {
    return '字典模式值不是 smart / even';
  }
  if (loading.value) {
    return '分集加载中';
  }
  return '';
});

const canOpenSplit = computed(
  () => Boolean(props.novelId) && !splitDisabledReason.value,
);

const canPreview = computed(
  () => canOpenSplit.value && !previewLoading.value,
);

const needRedivideConfirm = computed(
  () => strategy.value === 'redivide' && applyError.value?.status === 409,
);

const applyDisabled = computed(
  () =>
    !preview.value ||
    previewBlockers.value.length > 0 ||
    (needRedivideConfirm.value && !confirmRedivide.value),
);

function openSplit() {
  if (!canOpenSplit.value) {
    return;
  }
  previewError.value = undefined;
  previewConfirmRedivide.value = false;
  applyError.value = undefined;
  confirmRedivide.value = false;
  splitOpen.value = true;
}

async function previewSplit() {
  if (!props.novelId || !canPreview.value) {
    return;
  }
  previewLoading.value = true;
  previewError.value = undefined;
  try {
    const result = await aiAssetEpisodeApi.previewEpisodeSplit({
      confirmRedivide: previewConfirmRedivide.value || undefined,
      mode: splitMode.value,
      novelId: props.novelId,
      strategy: strategy.value,
      targetDurationSeconds: targetDurationSeconds.value,
      targetEpisodeCount: targetEpisodeCount.value,
    });
    preview.value = result;
    applyError.value = undefined;
    confirmRedivide.value = false;
    splitOpen.value = false;
    previewOpen.value = true;
  } catch (error) {
    previewError.value = parseApiError(error);
  } finally {
    previewLoading.value = false;
  }
}

async function applySplit() {
  if (!props.novelId || !preview.value || applyDisabled.value) {
    return;
  }
  const request: EpisodeSplitApplyRequest = {
    confirmRedivide:
      confirmRedivide.value || previewConfirmRedivide.value || undefined,
    mode: splitMode.value,
    novelId: props.novelId,
    strategy: strategy.value,
    targetDurationSeconds: targetDurationSeconds.value,
    targetEpisodeCount: targetEpisodeCount.value,
  };
  applyLoading.value = true;
  applyError.value = undefined;
  try {
    const result = await aiAssetEpisodeApi.applyEpisodeSplit(request);
    summary.value = result.summary ?? result.episodes ?? [];
    const warnings = messagesText(result.warnings);
    if (warnings) {
      message.warning(warnings);
    }
    previewOpen.value = false;
    splitOpen.value = false;
    preview.value = undefined;
    confirmRedivide.value = false;
    previewConfirmRedivide.value = false;
    const total = result.totalEpisodes;
    const preserved = result.preservedEpisodes;
    if (total === undefined) {
      message.success('划分已应用');
    } else if (!preserved) {
      message.success(`已应用：共 ${total} 集`);
    } else {
      const preservedCount = preserved.length;
      const createdCount = Math.max(total - preservedCount, 0);
      message.success(
        `已应用：新划分 ${createdCount} 集 + 保留 ${preservedCount} 个有内容旧集 = 共 ${total} 集`,
      );
    }
    emit('applied', summary.value);
  } catch (error) {
    applyError.value = parseApiError(error);
    if (applyError.value.status === 409) {
      confirmRedivide.value = false;
    }
  } finally {
    applyLoading.value = false;
  }
}

function backToSplitConfig() {
  previewOpen.value = false;
  splitOpen.value = true;
  applyError.value = undefined;
  confirmRedivide.value = false;
}

const promptsOpen = ref(false);
const promptsLoading = ref(false);
const promptsError = ref<DramaApiError>();
const prompts = ref<EpisodeSegmentPrompt[]>([]);
const promptsEpisode = ref<EpisodeSummaryItem>();
let promptsSeq = 0;

const promptsTitle = computed(() => {
  const item = promptsEpisode.value;
  if (!item) {
    return '本集提示词';
  }
  return `第 ${item.seq} 集 · ${item.title || '未命名'}`;
});

async function openEpisodePrompts(item: EpisodeSummaryItem) {
  const seq = ++promptsSeq;
  promptsEpisode.value = item;
  prompts.value = [];
  promptsError.value = undefined;
  promptsLoading.value = true;
  promptsOpen.value = true;
  try {
    const result = await aiAssetEpisodeApi.generateEpisodePrompts(
      item.episodeId,
    );
    if (seq !== promptsSeq) {
      return;
    }
    prompts.value = result ?? [];
  } catch (error) {
    if (seq !== promptsSeq) {
      return;
    }
    promptsError.value = parseApiError(error);
  } finally {
    if (seq === promptsSeq) {
      promptsLoading.value = false;
    }
  }
}

interface PromptBlock {
  key: string;
  text: string;
}

/** 只按后端自己的 ▸镜头 标记切块展示；不重排、不压缩 */
function splitPromptBlocks(prompt: string): PromptBlock[] {
  const text = prompt ?? '';
  const lines = text.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (/^\s*▸\s*镜头/.test(line)) {
      if (current.length) {
        blocks.push(current.join('\n'));
        current = [];
      }
    }
    current.push(line);
  }
  if (current.length) {
    blocks.push(current.join('\n'));
  }
  return blocks
    .filter((block) => block.length > 0)
    .map((block, index) => ({ key: String(index), text: block }));
}

async function copyPrompt(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('提示词已复制');
  } catch {
    message.error('复制失败');
  }
}

watch(
  () => props.novelId,
  () => {
    splitOpen.value = false;
    previewOpen.value = false;
    preview.value = undefined;
    previewError.value = undefined;
    applyError.value = undefined;
    confirmRedivide.value = false;
    previewConfirmRedivide.value = false;
    promptsOpen.value = false;
    prompts.value = [];
    promptsEpisode.value = undefined;
    void loadSummary();
  },
  { immediate: true },
);
</script>

<template>
  <div class="episode-panel">
    <div class="episode-panel__head">
      <span class="episode-panel__title">分集</span>
      <span class="episode-panel__hint">
        {{ summary.length }} 集 · 共 {{ totalShots }} 镜
      </span>
      <Segmented
        v-model:value="mode"
        :disabled="!modeReady"
        :options="modeOptions"
        size="small"
      />
      <span class="episode-panel__spacer"></span>
      <Tooltip :title="splitDisabledReason">
        <span>
          <Button
            :disabled="!canOpenSplit"
            type="primary"
            @click="openSplit"
          >
            划分分集
          </Button>
        </span>
      </Tooltip>
      <Button :loading="loading" size="small" @click="loadSummary">
        刷新
      </Button>
    </div>

    <Alert
      v-if="!modeReady"
      message="字典未配置 ai_episode_split_mode"
      type="info"
      show-icon
    />

    <div class="episode-panel__body">
      <VbenLoading :spinning="loading" class="episode-panel__loading" />
      <Alert
        v-if="loadError"
        :message="formatApiError(loadError)"
        :type="loadError.notReady ? 'info' : 'error'"
        show-icon
      >
        <template v-if="loadError.retryable" #action>
          <Button size="small" @click="loadSummary">重新加载</Button>
        </template>
      </Alert>
      <Empty
        v-else-if="!loading && !summary.length"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="还没有分集，先划分分集"
      />
      <div v-else class="episode-list">
        <div
          v-for="item in summary"
          :key="item.episodeId"
          class="episode-card"
          :class="{ 'is-active': isActive(item) }"
          tabindex="0"
          @click="selectEpisode(item)"
          @keydown.enter="selectEpisode(item)"
        >
          <div class="episode-card__head">
            <span class="episode-card__title">
              第 {{ item.seq }} 集 · {{ item.title || '未命名' }}
            </span>
            <Tooltip :title="projectedText(item)">
              <Tag
                :bordered="false"
                :color="item.projected ? 'success' : 'default'"
              >
                {{ item.projected ? '已投影' : '未投影' }}
              </Tag>
            </Tooltip>
            <span class="episode-card__spacer"></span>
            <Button
              size="small"
              @click.stop="openEpisodePrompts(item)"
            >
              生成本集提示词
            </Button>
          </div>
          <div class="episode-card__meta">
            <span v-if="hasShotRange(item)">
              第 {{ rangeText(item) }} 镜
            </span>
            <span v-else>暂无分镜</span>
            <span>{{ durationText(item.durationSeconds) }}</span>
            <span>{{ sceneCount(item.sceneSeqs) }} 场次</span>
          </div>
          <div
            v-if="!item.projected && projectedReasonText(item)"
            class="episode-card__reason"
          >
            {{ projectedReasonText(item) }}
          </div>
          <p v-if="summaryText(item)" class="episode-card__summary">
            {{ summaryText(item) }}
          </p>
        </div>
      </div>
    </div>

    <Modal
      v-model:open="splitOpen"
      :footer="null"
      title="划分分集"
      width="560px"
    >
      <div class="episode-split">
        <div class="episode-split__row">
          <span class="episode-split__label">模式</span>
          <span>{{ modeLabel }}</span>
        </div>
        <div class="episode-split__row">
          <span class="episode-split__label">策略</span>
          <Segmented
            v-model:value="strategy"
            :options="STRATEGY_OPTIONS"
            size="small"
          />
        </div>
        <div class="episode-split__grid">
          <label class="episode-split__field">
            <span>目标集数</span>
            <InputNumber
              v-model:value="targetEpisodeCount"
              :min="1"
              :precision="0"
              placeholder="按故事来定"
            />
          </label>
          <label class="episode-split__field">
            <span>目标总时长（秒）</span>
            <InputNumber
              v-model:value="targetDurationSeconds"
              :min="1"
              :precision="0"
              placeholder="不设上限"
            />
          </label>
        </div>
        <Alert
          v-if="strategy === 'redivide' && summary.length"
          message="重新划分会重排全项目镜头；已完成分集可能触发二次确认"
          type="warning"
          show-icon
        />
        <Alert
          v-if="previewError"
          :message="formatApiError(previewError)"
          :type="previewError.notReady ? 'info' : 'error'"
          show-icon
        />
        <Checkbox
          v-if="previewNeedConfirm"
          v-model:checked="previewConfirmRedivide"
        >
          我已确认重新划分全部分集
        </Checkbox>
        <div class="episode-split__actions">
          <Button @click="splitOpen = false">取消</Button>
          <Button
            :disabled="
              !canPreview ||
              (previewNeedConfirm && !previewConfirmRedivide)
            "
            :loading="previewLoading"
            type="primary"
            @click="previewSplit"
          >
            生成预览
          </Button>
        </div>
      </div>
    </Modal>

    <Modal
      v-model:open="previewOpen"
      :footer="null"
      title="划分预览"
      width="760px"
    >
      <div v-if="preview" class="episode-preview">
        <div class="episode-preview__summary">
          <span>模式：{{ modeLabel }}</span>
          <span>策略：{{ strategyLabel }}</span>
          <span>
            旧 {{ summary.length }} 集 → 新
            {{ preview.proposedEpisodes.length }} 集
          </span>
          <span>总镜头 {{ preview.totalShots }}</span>
        </div>

        <div
          v-if="previewPreserved.length"
          class="episode-preview__preserved"
        >
          将保留的旧集：第 {{ previewPreservedSeqs }} 集（{{
            previewPreservedReason
          }}）
        </div>

        <Alert
          v-if="previewBlockers.length"
          message="存在阻断项，无法应用"
          type="error"
          show-icon
        >
          <template #description>
            <ul class="episode-preview__blockers">
              <li
                v-for="(blocker, index) in previewBlockers"
                :key="index"
              >
                {{ messageText(blocker) }}
              </li>
            </ul>
          </template>
        </Alert>

        <div class="episode-preview__list">
          <div
            v-for="item in preview.proposedEpisodes"
            :key="item.seq"
            class="episode-preview__row"
          >
            <span class="episode-preview__title">
              第 {{ item.seq }} 集
              <template v-if="item.title"> · {{ item.title }}</template>
            </span>
            <span>第 {{ rangeText(item) }} 镜</span>
            <span>{{ durationText(item.durationSeconds) }}</span>
            <span>{{ sceneCount(item.sceneSeqs) }} 场次</span>
          </div>
        </div>

        <Alert
          v-if="applyError"
          :message="formatApiError(applyError)"
          :type="
            applyError.status === 409
              ? 'warning'
              : applyError.notReady
                ? 'info'
                : 'error'
          "
          show-icon
        />

        <Checkbox v-if="needRedivideConfirm" v-model:checked="confirmRedivide">
          我已确认重新划分全部分集
        </Checkbox>

        <div class="episode-preview__actions">
          <Button @click="backToSplitConfig">返回修改</Button>
          <Button
            :disabled="applyDisabled"
            :loading="applyLoading"
            type="primary"
            @click="applySplit"
          >
            确认应用
          </Button>
        </div>
      </div>
    </Modal>

    <Drawer
      v-model:open="promptsOpen"
      placement="right"
      :title="promptsTitle"
      width="860px"
    >
      <div class="episode-prompts">
        <VbenLoading
          :spinning="promptsLoading"
          class="episode-prompts__loading"
        />
        <Alert
          v-if="promptsError"
          :message="formatApiError(promptsError)"
          :type="promptsError.notReady ? 'info' : 'error'"
          show-icon
        />
        <Empty
          v-else-if="!promptsLoading && !prompts.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="没有生成提示词"
        />
        <div v-else class="episode-prompts__list">
          <div
            v-for="item in prompts"
            :key="item.segmentId"
            class="episode-prompt-item"
          >
            <div class="episode-prompt-item__head">
              <span>分镜 {{ item.seq }}</span>
              <Button
                size="small"
                type="text"
                @click="copyPrompt(item.prompt)"
              >
                复制整段
              </Button>
            </div>
            <div class="episode-prompt-item__blocks">
              <div
                v-for="block in splitPromptBlocks(item.prompt)"
                :key="block.key"
                class="episode-prompt-block"
              >
                <div class="episode-prompt-block__head">
                  <span>十要素块</span>
                  <Button
                    size="small"
                    type="text"
                    @click="copyPrompt(block.text)"
                  >
                    复制
                  </Button>
                </div>
                <pre class="episode-prompt-block__text">{{ block.text }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.episode-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;

  &__head {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__body {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }
}

.episode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.episode-card {
  padding: 10px 12px;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;

  &:focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: -2px;
  }

  &.is-active {
    background: color-mix(in srgb, hsl(var(--primary)) 5%, hsl(var(--card)));
    border-color: color-mix(
      in srgb,
      hsl(var(--primary)) 45%,
      hsl(var(--border))
    );
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    :deep(.ant-tag) {
      margin: 0;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__reason {
    margin-top: 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__summary {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }
}

.episode-split {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__label {
    width: 48px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    :deep(.ant-input-number) {
      width: 100%;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

.episode-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__preserved {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__blockers {
    padding-left: 18px;
    margin: 0;
    font-size: 12px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 320px;
    overflow-y: auto;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    gap: 10px;
    align-items: center;
    padding: 8px 10px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  &__title {
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

.episode-prompts {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.episode-prompt-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__blocks {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.episode-prompt-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__text {
    margin: 0;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    color: hsl(var(--foreground));
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
}
</style>
