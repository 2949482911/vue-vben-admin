<script lang="ts" setup name="DramaPlotPanel">
/**
 * 剧情面版：左「原文」右「核心情节」（Omniboard 对齐）。
 *
 * 链路位置：短剧工作台 surface=剧情 → 本组件。
 * 读取走 episode/detail；提取走 episode/core-plot/extract；保存复用 episode/save 的局部字段更新。
 * 剧集切换只由父级改 episodeId，本组件负责加载/脏检查提示；错误一律展示后端原文。
 */
import type { DramaApiError } from '../error';

import type { EpisodeItem } from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import { VbenLoading } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  message,
  Select,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { formatApiError, parseApiError } from '../error';

const props = defineProps<{
  episodeId?: number | string;
  episodes: EpisodeItem[];
}>();

const emit = defineEmits<{
  dirtyChange: [dirty: boolean];
  selectEpisode: [id: number | string];
}>();

const loading = ref(false);
const loadError = ref<DramaApiError>();

const contentDraft = ref('');
const summaryDraft = ref('');
const loadedContent = ref('');
const loadedSummary = ref('');

const contentError = ref<DramaApiError>();
const summaryError = ref<DramaApiError>();
const savingContent = ref(false);
const savingSummary = ref(false);
const extracting = ref(false);

/** 防止快速切集时旧请求覆盖新集内容 */
let loadSeq = 0;

const episodeOptions = computed(() =>
  props.episodes.map((item) => ({
    label: `第 ${item.seq ?? '-'} 集 · ${item.title ?? '未命名'}`,
    value: item.id,
  })),
);

const contentDirty = computed(() => contentDraft.value !== loadedContent.value);
const summaryDirty = computed(() => summaryDraft.value !== loadedSummary.value);
const dirty = computed(() => contentDirty.value || summaryDirty.value);

const sourceDisabled = computed(
  () =>
    loading.value ||
    savingContent.value ||
    savingSummary.value ||
    extracting.value,
);

const loadBlocked = computed(
  () => !props.episodeId || loading.value || Boolean(loadError.value),
);

const saveContentDisabled = computed(
  () =>
    loadBlocked.value ||
    savingContent.value ||
    extracting.value ||
    !contentDirty.value,
);

const saveSummaryDisabled = computed(
  () =>
    loadBlocked.value ||
    savingSummary.value ||
    extracting.value ||
    !summaryDirty.value,
);

/** 提取依赖后端已保存的原文，所以有未保存修改时先要求保存 */
const extractDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (loading.value) {
    return '原文加载中';
  }
  if (loadError.value) {
    return '原文加载失败';
  }
  if (savingContent.value) {
    return '原文保存中';
  }
  if (extracting.value) {
    return '正在提取';
  }
  if (contentDirty.value) {
    return '原文有未保存修改，请先保存';
  }
  if (!contentDraft.value.trim()) {
    return '原文为空，无法提取';
  }
  return '';
});

const contentState = computed(() => {
  if (loading.value) {
    return '加载中';
  }
  return `${contentDraft.value.length} 字 · ${contentDirty.value ? '未保存' : '已保存'}`;
});

const summaryState = computed(() => {
  if (loading.value) {
    return '加载中';
  }
  return `${summaryDraft.value.length} 字 · ${summaryDirty.value ? '未保存' : '已保存'}`;
});

function resetDrafts() {
  contentDraft.value = '';
  summaryDraft.value = '';
  loadedContent.value = '';
  loadedSummary.value = '';
}

async function load(id = props.episodeId) {
  const seq = ++loadSeq;
  loadError.value = undefined;
  contentError.value = undefined;
  summaryError.value = undefined;
  resetDrafts();
  if (!id) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const item = await aiAssetApi.fetchEpisodeDetail(id, true);
    if (seq !== loadSeq) {
      return;
    }
    loadedContent.value = item.content ?? '';
    loadedSummary.value = item.summary ?? '';
    contentDraft.value = loadedContent.value;
    summaryDraft.value = loadedSummary.value;
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

async function saveContent() {
  if (!props.episodeId || saveContentDisabled.value) {
    return;
  }
  const targetId = props.episodeId;
  savingContent.value = true;
  contentError.value = undefined;
  try {
    const saved = await aiAssetApi.saveEpisodeFields({
      content: contentDraft.value,
      id: targetId,
    });
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    loadedContent.value = saved?.content ?? contentDraft.value;
    contentDraft.value = loadedContent.value;
    message.success('原文已保存');
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      contentError.value = parseApiError(error);
    }
  } finally {
    savingContent.value = false;
  }
}

async function saveSummary() {
  if (!props.episodeId || saveSummaryDisabled.value) {
    return;
  }
  const targetId = props.episodeId;
  savingSummary.value = true;
  summaryError.value = undefined;
  try {
    const saved = await aiAssetApi.saveEpisodeFields({
      id: targetId,
      summary: summaryDraft.value,
    });
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    loadedSummary.value = saved?.summary ?? summaryDraft.value;
    summaryDraft.value = loadedSummary.value;
    message.success('核心情节已保存');
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      summaryError.value = parseApiError(error);
    }
  } finally {
    savingSummary.value = false;
  }
}

async function extractCorePlot() {
  if (!props.episodeId || extractDisabledReason.value) {
    return;
  }
  const targetId = props.episodeId;
  extracting.value = true;
  summaryError.value = undefined;
  try {
    const result = await aiAssetApi.extractEpisodeCorePlot({
      episodeId: targetId,
    });
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    summaryDraft.value = result.corePlot ?? '';
    message.success('核心情节已提取，可编辑后保存');
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      summaryError.value = parseApiError(error);
    }
  } finally {
    extracting.value = false;
  }
}

function onSourceChange(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return;
  }
  if (String(value) === String(props.episodeId)) {
    return;
  }
  emit('selectEpisode', value);
}

watch(
  () => props.episodeId,
  (id) => {
    void load(id);
  },
  { immediate: true },
);

watch(dirty, (value) => emit('dirtyChange', value), { immediate: true });
</script>

<template>
  <div class="plot-panel">
    <Card class="plot-panel__card" :body-style="{ padding: 0 }">
      <div class="plot-panel__head">
        <span class="plot-panel__title">原文</span>
        <Select
          :disabled="sourceDisabled || !episodes.length"
          :options="episodeOptions"
          :value="episodeId"
          class="plot-panel__source"
          option-filter-prop="label"
          placeholder="来源章节"
          show-search
          @change="onSourceChange"
        />
      </div>

      <div class="plot-panel__body">
        <Empty
          v-if="!episodeId"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="先选择剧集"
        />
        <template v-else-if="loadError">
          <Alert
            :message="formatApiError(loadError)"
            :type="loadError.notReady ? 'info' : 'error'"
            show-icon
          >
            <template v-if="loadError.retryable" #action>
              <Button size="small" @click="load(episodeId)">重新加载</Button>
            </template>
          </Alert>
        </template>
        <template v-else>
          <Input.TextArea
            v-model:value="contentDraft"
            :disabled="loading || savingContent"
            :rows="12"
            class="plot-panel__editor"
            placeholder="本章原文"
          />
          <div class="plot-panel__foot">
            <span class="plot-panel__state">{{ contentState }}</span>
            <Button
              :disabled="saveContentDisabled"
              :loading="savingContent"
              size="small"
              type="primary"
              @click="saveContent"
            >
              保存
            </Button>
          </div>
          <Alert
            v-if="contentError"
            :message="formatApiError(contentError)"
            :type="contentError.notReady ? 'info' : 'error'"
            show-icon
          />
        </template>
        <VbenLoading :spinning="loading" class="plot-panel__loading" />
      </div>
    </Card>

    <Card class="plot-panel__card" :body-style="{ padding: 0 }">
      <div class="plot-panel__head">
        <span class="plot-panel__title">核心情节</span>
        <Tooltip :title="extractDisabledReason">
          <span class="plot-panel__extract">
            <Button
              :disabled="Boolean(extractDisabledReason)"
              :loading="extracting"
              size="small"
              @click="extractCorePlot"
            >
              提取核心情节
            </Button>
          </span>
        </Tooltip>
      </div>

      <div class="plot-panel__body">
        <Empty
          v-if="!episodeId"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="先选择剧集"
        />
        <template v-else-if="loadError">
          <Alert
            :message="formatApiError(loadError)"
            :type="loadError.notReady ? 'info' : 'error'"
            show-icon
          >
            <template v-if="loadError.retryable" #action>
              <Button size="small" @click="load(episodeId)">重新加载</Button>
            </template>
          </Alert>
        </template>
        <template v-else>
          <Input.TextArea
            v-model:value="summaryDraft"
            :disabled="loading || savingSummary || extracting"
            :rows="12"
            class="plot-panel__editor"
            placeholder="尚未提取核心情节，可点击右上角提取或直接填写"
          />
          <div class="plot-panel__foot">
            <span class="plot-panel__state">{{ summaryState }}</span>
            <Button
              :disabled="saveSummaryDisabled"
              :loading="savingSummary"
              size="small"
              type="primary"
              @click="saveSummary"
            >
              保存
            </Button>
          </div>
          <Alert
            v-if="summaryError"
            :message="formatApiError(summaryError)"
            :type="summaryError.notReady ? 'info' : 'error'"
            show-icon
          />
        </template>
        <VbenLoading :spinning="loading" class="plot-panel__loading" />
      </div>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.plot-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  height: 100%;
  min-height: 0;

  &__card {
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.ant-card-body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 0;
    }
  }

  &__head {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__source {
    width: 240px;
    margin-left: auto;
  }

  &__extract {
    margin-left: auto;
  }

  &__body {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding: 12px;
    overflow-y: auto;

    :deep(.ant-empty) {
      margin: auto;
    }
  }

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }

  &__editor {
    flex: 1;
    min-height: 0;
    padding: 8px 10px;
    font-size: 14px;
    resize: none;
  }

  &__foot {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  &__state {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
