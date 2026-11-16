<script lang="ts" setup name="NovelBookWorkbench">
/**
 * 小说创作台：小说 → 分集正文/细纲 → 记忆 / 设定资产 / 导出。
 * 由 novel/index.vue 打开；本组件只承载小说创作域，不再提供剧本/分镜/成片入口。
 * 完结/导出由 useNovelLifecycle + 小说设置组件承载，长记忆由 useNovelMemory 承载，
 * 正文 AI 动作与资产抽取仍走 episode/* 创作域接口。
 */
import type {
  EntityExtractResult,
  EpisodeAiIssue,
  EpisodeItem,
  EpisodePlanResponse,
  EpisodeSaveRequest,
  EpisodeVersionItem,
  NovelDetailItem,
} from '#/api/models/ai_asset';

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';

import {
  ArrowLeftOutlined,
  AuditOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  DiffOutlined,
  ExportOutlined,
  HistoryOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Select,
  Spin,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { MEMORY_STATUS } from '../status';
import { useAiContext } from '../useAiContext';
import { useNovelLifecycle } from '../useNovelLifecycle';
import { useNovelMemory } from '../useNovelMemory';
import AiContextPanel from './AiContextPanel.vue';
import AssetGraphDrawerContent from './AssetGraphDrawer.vue';
import ChapterMemoryDrawer from './ChapterMemoryDrawer.vue';
import NovelMemoryDrawer from './NovelMemoryDrawer.vue';
import NovelSettingsModal from './NovelSettingsModal.vue';

const props = defineProps<{
  models: Array<{ label: string; value: number | string }>;
  novelId: number | string;
}>();
const emit = defineEmits<{ back: [] }>();

const route = useRoute();

type TabKey = 'content' | 'summary';
type AiAction =
  | 'continue'
  | 'detect'
  | 'idea'
  | 'polish'
  | 'proofread'
  | 'review'
  | 'title';

const loading = ref(false);
const book = ref<NovelDetailItem>();
const episodes = ref<EpisodeItem[]>([]);
const selectedId = ref<number | string>();
const episode = ref<EpisodeItem>();
const episodeLoading = ref(false);
const tab = ref<TabKey>('content');
const modelId = ref<number | string>();
const autoExtractAssets = ref(false);


// ==================== 编辑器 ====================
const editorHost = ref<HTMLElement>();
const editorHtml = ref('');
const draft = ref('');
const plotDirection = ref('');
const version = ref<number | undefined>();
const dirty = ref(false);
const saving = ref(false);
const savedAt = ref('');
const aiLoading = ref<AiAction>();
const issues = ref<EpisodeAiIssue[]>([]);

// ==================== 长记忆 / AI 上下文编排（实现见 composables） ====================
const aiContext = useAiContext({
  currentSeq: () => episode.value?.seq,
  episodes,
});
const {
  clear: clearAiContext,
  conflicts: aiConflicts,
  hasHardConflicts: hasAiHardConflicts,
  references: aiReferences,
  staleEpisodes: aiStaleEpisodes,
} = aiContext;
const planContext = useAiContext({
  currentSeq: () => episode.value?.seq,
  episodes,
});
const {
  conflicts: planConflicts,
  hasHardConflicts: hasPlanHardConflicts,
  references: planReferences,
  staleEpisodes: planStaleEpisodes,
} = planContext;
const {
  chapterMemoryOpen,
  currentMemoryTimedOut,
  finalizeChapter,
  finalizing,
  loadMemoryOverview,
  memoryDotClass,
  memoryOverview,
  memoryRebuilding,
  memoryStatusLabel,
  memoryStatusMeta,
  memoryStatusOf,
  novelMemoryOpen,
  onChapterMemoryUpdated,
  onNovelMemoryUpdated,
  openChapterMemory,
  refreshCurrentEpisodeMemoryStatus,
  retryEpisodeMemory,
} = useNovelMemory({
  beforeFinalize: () => saveDraft(false),
  episode,
  episodes,
  hasHardConflicts: hasAiHardConflicts,
  modelId: () => modelId.value,
  novelId: () => props.novelId,
  updateEpisodeRow,
});

const {
  ensureNotFinished,
  exportNovel,
  exporting,
  finishNovel,
  finishing,
  isFinished,
  openSettings,
  saveSettings,
  settingsAspectRatio,
  settingsOpen,
  settingsSaving,
} = useNovelLifecycle({
  book,
  novelId: () => props.novelId,
});


const extractLoading = ref(false);
const extractOpen = ref(false);
const extractResult = ref<EntityExtractResult>();

const [AssetGraphDrawer, assetGraphApi] = useVbenDrawer({
  connectedComponent: AssetGraphDrawerContent,
});


function openAssetGraph() {
  assetGraphApi.setData({ novelId: props.novelId });
  assetGraphApi.open();
}

let lastSavedContent = '';
let saveTimer: ReturnType<typeof setTimeout> | undefined;

// Tiptap 内容区高度：由右侧主面板底部反推，保证正文在编辑器内部滚动
const editorMaxHeight = ref(480);
let editorObserver: ResizeObserver | undefined;
let observedPane: HTMLElement | undefined;

function measureEditorHeight() {
  const host = editorHost.value;
  const pane = host?.closest('.nwb-pane--main') as HTMLElement | null;
  if (!host || !pane) {
    return;
  }
  const toolbar = host.querySelector('.vben-tiptap > div') as HTMLElement | null;
  const toolbarHeight = toolbar?.clientHeight ?? 44;
  // 取面板底部与视口底部的更小值，避免页面本身溢出时编辑区继续被撑高
  const bottom = Math.min(
    pane.getBoundingClientRect().bottom,
    window.innerHeight - 16,
  );
  // 16 编辑器底部留白 + 32 EditorContent 内边距 + 2 边框
  const available = bottom - host.getBoundingClientRect().top - toolbarHeight - 50;
  editorMaxHeight.value = Math.max(240, Math.floor(available));
}

function attachEditorMeasure() {
  const host = editorHost.value;
  if (!host) {
    return;
  }
  const pane = host.closest('.nwb-pane--main') as HTMLElement | null;
  if (pane && pane !== observedPane) {
    editorObserver?.disconnect();
    editorObserver = new ResizeObserver(measureEditorHeight);
    editorObserver.observe(pane);
    observedPane = pane;
  }
  measureEditorHeight();
}

watch([editorHost, tab], attachEditorMeasure, { flush: 'post' });

const wordCount = computed(() => draft.value.replace(/\s/g, '').length);
const readingMinutes = computed(() => Math.max(1, Math.ceil(wordCount.value / 400)));
const targetWords = computed(
  () =>
    book.value?.targetWords ||
    (book.value?.episodeCount || episodes.value.length || 8) *
      (book.value?.wordsPerEpisode || 1500),
);
const bookProgress = computed(() => {
  if (!targetWords.value) {
    return 0;
  }
  return Math.min(100, Math.round(((book.value?.wordCount || 0) / targetWords.value) * 100));
});

const stats = computed(() => {
  const total = episodes.value.length;
  const written = episodes.value.filter((item) => item.content).length;
  return { total, written, progress: total ? Math.round((written / total) * 100) : 0 };
});

// ==================== 章节规划 ====================
const planOpen = ref(false);
const planLoading = ref(false);
const planApplying = ref(false);
const planSummary = ref('');
const planBeats = ref<Array<{ content: string; title: string; type: string }>>([]);

// ==================== 版本 ====================
const versionsOpen = ref(false);
const versionsLoading = ref(false);
const versions = ref<EpisodeVersionItem[]>([]);

// ==================== 批量生成分集 ====================
const batchOpen = ref(false);
const batchSaving = ref(false);
const batchCount = ref(2);
const batchReq = ref('');

const ideaOpen = ref(false);
const ideaText = ref('');

/** 空章续写引导 + 后端上下文提示 */
const continueGuideOpen = ref(false);
const continueGuideInstruction = ref<string>();
const aiHint = ref('');
const aiHistoryEpisodes = ref<Array<number | string>>([]);
const aiContextNotice = computed(() => {
  const parts: string[] = [];
  if (aiHint.value) {
    parts.push(aiHint.value);
  }
  if (aiHistoryEpisodes.value.length) {
    parts.push(`已承接第 ${aiHistoryEpisodes.value.join('、')} 集结尾`);
  }
  return parts.join(' ');
});

watch(
  () => props.models,
  (list) => {
    if (!modelId.value) {
      modelId.value = list[0]?.value;
    }
  },
  { immediate: true },
);

async function load() {
  loading.value = true;
  void loadMemoryOverview();
  try {
    const [detail, page] = await Promise.all([
      aiAssetApi.fetchNovelDetail(props.novelId),
      aiAssetApi.fetchEpisodes({ novelId: props.novelId, page: 1, pageSize: 200 }),
    ]);
    book.value = detail;
    episodes.value = page?.items ?? [];
    const queryEpisodeId = route.query.episodeId;
    const target =
      typeof queryEpisodeId === 'string'
        ? episodes.value.find(
            (item) => String(item.id) === queryEpisodeId,
          )
        : undefined;
    const first = target ?? episodes.value[0];
    selectedId.value = first?.id;
    if (first) {
      await loadEpisode(first);
    }
  } catch (error: any) {
    message.error(error?.message || '加载书籍失败');
  } finally {
    loading.value = false;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
}

function textToHtml(text: string) {
  if (!text) {
    return '';
  }
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function syncEditor() {
  editorHtml.value = textToHtml(draft.value);
}

function syncFromEpisode(item: EpisodeItem) {
  draft.value = item.content || '';
  plotDirection.value = item.plotDirection || '';
  version.value = item.version;
  issues.value = [];
  dirty.value = false;
  savedAt.value = '';
  lastSavedContent = draft.value;
  aiHint.value = '';
  aiHistoryEpisodes.value = [];
  continueGuideOpen.value = false;
  continueGuideInstruction.value = undefined;
  syncEditor();
}

function onEditorChange(payload: { text: string }) {
  draft.value = payload.text;
  onDraftInput();
}

async function loadEpisode(item: EpisodeItem) {
  if (dirty.value) {
    const saved = await saveDraft(false);
    if (!saved) {
      return;
    }
  }
  selectedId.value = item.id;
  episodeLoading.value = true;
  episode.value = item;
  try {
    const detail = await aiAssetApi.fetchEpisodeDetail(item.id);
    if (detail) {
      episode.value = { ...item, ...detail };
      const index = episodes.value.findIndex((row) => String(row.id) === String(item.id));
      if (index >= 0) {
        episodes.value[index] = episode.value;
      }
    }
  } catch {
    // detail 未返回时用列表数据兜底
  } finally {
    syncFromEpisode(episode.value!);
    episodeLoading.value = false;
    // 列表字段先渲染，再拉记忆状态校准本集权威状态
    void refreshCurrentEpisodeMemoryStatus();
  }
}

async function selectEpisode(item: EpisodeItem) {
  if (String(item.id) === String(selectedId.value)) {
    return;
  }
  await loadEpisode(item);
}

async function setTab(value: string) {
  if (tab.value === value) {
    return;
  }
  if (tab.value === 'content' && value !== 'content' && dirty.value) {
    const saved = await saveDraft(false);
    if (!saved) {
      return;
    }
  }
  tab.value = value as TabKey;
  await loadTabResource(tab.value);
}

/** 切换/进入标签页时按需拉取数据，避免必须手动刷新 */
async function loadTabResource(key: TabKey = tab.value) {
  const current = episode.value;
  if (!current) {
    return;
  }
  if (key === 'summary' && !current.summary && !current.beats?.length) {
    await loadEpisode(current);
  }
}

function requireModel() {
  if (!modelId.value) {
    message.warning('还没有可用的文本模型，请先在系统模型管理里配置');
    return false;
  }
  return true;
}

function isConflict(error: any) {
  return (
    error?.code === 409 ||
    error?.data?.code === 409 ||
    String(error?.message || '').includes('409')
  );
}

function updateEpisodeRow(item: EpisodeItem) {
  const index = episodes.value.findIndex((row) => String(row.id) === String(item.id));
  if (index >= 0) {
    episodes.value[index] = { ...episodes.value[index], ...item };
  }
}

async function saveDraft(
  saveVersion = false,
  extra: Partial<EpisodeSaveRequest> = {},
) {
  if (!episode.value) {
    return false;
  }
  if (!dirty.value && !saveVersion && Object.keys(extra).length === 0) {
    return true;
  }
  saving.value = true;
  const previousWords = episode.value.words || 0;
  const contentChanged = draft.value !== lastSavedContent;
  try {
    const payload: EpisodeSaveRequest = {
      id: episode.value.id,
      novelId: props.novelId,
      seq: episode.value.seq,
      title: episode.value.title,
      content: draft.value,
      words: wordCount.value,
      plotDirection: plotDirection.value || undefined,
      version: version.value,
      saveVersion,
      ...extra,
    };
    const result: any = await aiAssetApi.saveEpisode(payload);
    version.value = result?.version ?? version.value;
    episode.value = {
      ...episode.value,
      ...extra,
      content: draft.value,
      words: wordCount.value,
      plotDirection: plotDirection.value,
      version: version.value,
    };
    updateEpisodeRow(episode.value);
    if (book.value) {
      book.value.wordCount =
        (book.value.wordCount || 0) - previousWords + wordCount.value;
    }
    dirty.value = false;
    lastSavedContent = draft.value;
    savedAt.value = new Date().toLocaleTimeString();
    if (
      contentChanged &&
      memoryStatusOf(episode.value) !== MEMORY_STATUS.NONE
    ) {
      // 普通保存只标过期，不自动烧 token；定稿/重建才生成记忆
      episode.value.memoryStatus = MEMORY_STATUS.STALE;
      updateEpisodeRow(episode.value);
    }
    return true;
  } catch (error: any) {
    if (isConflict(error)) {
      Modal.confirm({
        title: '内容已在其他地方更新',
        content: '当前章节已有更新的版本，是否加载最新内容？未保存的修改会丢失。',
        async onOk() {
          if (episode.value) {
            await loadEpisode(episode.value);
          }
        },
      });
    } else {
      message.error(error?.message || '保存失败');
    }
    return false;
  } finally {
    saving.value = false;
  }
}

function onDraftInput() {
  dirty.value = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void saveDraft(false), 1500);
}

onBeforeUnmount(() => {
  clearTimeout(saveTimer);
  if (dirty.value) {
    void saveDraft(false);
  }
  window.removeEventListener('resize', attachEditorMeasure);
  editorObserver?.disconnect();
});

function getSelection() {
  const content = editorHost.value?.querySelector('.vben-tiptap__content');
  const selection = window.getSelection();
  if (!content || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return undefined;
  }
  const range = selection.getRangeAt(0);
  if (!content.contains(range.commonAncestorContainer)) {
    return undefined;
  }
  const prefix = range.cloneRange();
  prefix.selectNodeContents(content);
  prefix.setEnd(range.startContainer, range.startOffset);
  const start = prefix.toString().length;
  const text = selection.toString();
  return { end: start + text.length, start, text };
}

function insertText(text: string) {
  const end = getSelection()?.end ?? draft.value.length;
  const needBreak = end > 0 && !draft.value.slice(0, end).endsWith('\n');
  draft.value = `${draft.value.slice(0, end)}${needBreak ? '\n\n' : ''}${text}${draft.value.slice(end)}`;
  dirty.value = true;
  syncEditor();
}

function replaceSelection(selection: { end: number; start: number }, text: string) {
  draft.value = `${draft.value.slice(0, selection.start)}${text}${draft.value.slice(selection.end)}`;
  dirty.value = true;
  syncEditor();
}

function editorPlainText() {
  return draft.value
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** 第 2 集起、正文为空且没有细纲时，续写前先给一次轻引导 */
function shouldGuideEmptyContinue() {
  return (
    Number(episode.value?.seq ?? 0) > 1 &&
    !editorPlainText() &&
    !episode.value?.summary?.trim() &&
    !(episode.value?.beats?.length)
  );
}

function focusPlanFromContinue() {
  continueGuideOpen.value = false;
  tab.value = 'summary';
  void generatePlan();
}

async function continueAnyway() {
  const instruction = continueGuideInstruction.value;
  continueGuideOpen.value = false;
  await runAi('continue', instruction, true);
}

async function runAi(
  action: AiAction,
  instruction?: string,
  skipContinueGuide = false,
) {
  if (!episode.value) {
    return;
  }
  if (action === 'continue' && !ensureNotFinished('继续续写')) {
    return;
  }
  if (!requireModel()) {
    return;
  }
  const selection = getSelection();
  if (action === 'polish' && !selection?.text.trim()) {
    message.warning('先选中要润色的文字');
    return;
  }
  if (
    action === 'continue' &&
    !skipContinueGuide &&
    shouldGuideEmptyContinue()
  ) {
    continueGuideInstruction.value = instruction;
    continueGuideOpen.value = true;
    return;
  }
  if (!(await saveDraft(false))) {
    return;
  }
  aiLoading.value = action;
  aiHint.value = '';
  aiHistoryEpisodes.value = [];
  clearAiContext();
  try {
    const res = await aiAssetApi.episodeAiAction({
      action,
      episodeId: episode.value.id,
      instruction: instruction || plotDirection.value || undefined,
      modelId: modelId.value!,
      selection: selection?.text ? selection : undefined,
      targetWords: action === 'continue' ? 300 : undefined,
      usePersona: true,
    });
    aiHint.value = res.hint ?? '';
    aiHistoryEpisodes.value = Array.isArray(res.historyEpisodes)
      ? res.historyEpisodes
      : [];
    // aiAction 响应携带 references/conflicts，capture 后 AiContextPanel 立即可见
    aiContext.capture(res);
    if (res.title) {
      episode.value.title = res.title;
      updateEpisodeRow(episode.value);
      await saveDraft(false, { title: res.title });
      message.success('标题已生成');
      return;
    }
    if (res.issues) {
      issues.value = res.issues;
      message.success(`检测完成，共 ${res.issues.length} 条建议`);
      return;
    }
    if (!res.text) {
      return;
    }
    if (action === 'idea') {
      ideaText.value = res.text;
      ideaOpen.value = true;
      return;
    }
    if (action === 'polish' && selection) {
      replaceSelection(selection, res.text);
    } else {
      insertText(res.text);
    }
    await saveDraft(true, {});
  } catch (error: any) {
    message.error(error?.message || 'AI 动作失败');
  } finally {
    aiLoading.value = undefined;
  }
}

async function runExtract() {
  if (!episode.value || !requireModel()) {
    return;
  }
  extractLoading.value = true;
  try {
    const res = await aiAssetApi.extractEpisodeEntities({
      episodeId: episode.value.id,
      modelId: modelId.value!,
      source: 'auto',
    });
    extractResult.value = res;
    extractOpen.value = true;
    const created =
      (res.characters?.filter((item) => item.created).length ?? 0) +
      (res.scenes?.filter((item) => item.created).length ?? 0) +
      (res.elements?.filter((item) => item.created).length ?? 0);
    message.success(`抽取完成，新增 ${created} 个设定`);
  } catch (error: any) {
    message.error(error?.message || '抽取设定失败');
  } finally {
    extractLoading.value = false;
  }
}

function manualSave() {
  return saveDraft(false, {});
}

async function generateContent() {
  if (!episode.value || !requireModel()) {
    return;
  }
  if (dirty.value && !(await saveDraft(false))) {
    return;
  }
  episodeLoading.value = true;
  try {
    const updated = await aiAssetApi.generateEpisodeContent({
      autoExtractAssets: autoExtractAssets.value,
      modelId: modelId.value!,
      episodeId: episode.value.id,
      targetWords: book.value?.wordsPerEpisode || 1500,
    });
    episode.value = { ...episode.value, ...updated };
    updateEpisodeRow(episode.value);
    syncFromEpisode(episode.value);
    message.success(autoExtractAssets.value ? '正文已生成，并已提炼资产' : '正文已生成');
  } catch (error: any) {
    message.error(error?.message || '生成正文失败');
  } finally {
    episodeLoading.value = false;
  }
}

async function generatePlan(optimize = false) {
  if (!episode.value || !requireModel()) {
    return;
  }
  planLoading.value = true;
  try {
    const res: EpisodePlanResponse = await aiAssetApi.generateEpisodePlan({
      episodeId: episode.value.id,
      modelId: modelId.value!,
      persist: false,
      requirements: optimize ? plotDirection.value || '优化本章规划' : undefined,
      usePersona: true,
    });
    planSummary.value = res.summary || '';
    planBeats.value = res.beats || [];
    // 细纲 plan 响应同样携带 references/conflicts
    planContext.capture(res);
    planOpen.value = true;
  } catch (error: any) {
    message.error(error?.message || '生成章节规划失败');
  } finally {
    planLoading.value = false;
  }
}

async function applyPlan() {
  if (hasPlanHardConflicts()) {
    message.warning('存在硬冲突，请先处理后再应用本章规划');
    return;
  }
  planApplying.value = true;
  try {
    const ok = await saveDraft(true, {
      beats: planBeats.value,
      summary: planSummary.value,
    });
    if (ok) {
      if (episode.value) {
        episode.value.summary = planSummary.value;
        episode.value.beats = planBeats.value;
      }
      planOpen.value = false;
      message.success('章节规划已应用');
    }
  } finally {
    planApplying.value = false;
  }
}

async function openVersions() {
  if (!episode.value) {
    return;
  }
  versionsOpen.value = true;
  versionsLoading.value = true;
  try {
    versions.value = (await aiAssetApi.fetchEpisodeVersions(episode.value.id)) ?? [];
  } catch (error: any) {
    message.error(error?.message || '加载历史版本失败');
  } finally {
    versionsLoading.value = false;
  }
}

function restoreVersion(item: EpisodeVersionItem) {
  Modal.confirm({
    title: `恢复到 v${item.versionNo ?? ''}？`,
    content: '恢复前会自动备份当前正文。',
    async onOk() {
      await aiAssetApi.restoreEpisodeVersion(item.id);
      versionsOpen.value = false;
      if (episode.value) {
        await loadEpisode(episode.value);
      }
      message.success('已恢复');
    },
  });
}


/** 生成下一集：复用分集生成弹窗，默认只生成 1 集 */
function openNextEpisode() {
  if (!ensureNotFinished('生成下一集')) {
    return;
  }
  batchCount.value = 1;
  batchOpen.value = true;
}

async function submitBatch() {
  if (!ensureNotFinished('生成新分集') || !requireModel()) {
    return;
  }  batchSaving.value = true;
  clearAiContext();
  try {
    const res = await aiAssetApi.generateEpisodes({
      count: batchCount.value,
      modelId: modelId.value!,
      novelId: props.novelId,
      requirements: batchReq.value || undefined,
    });
    // 新版本响应会带 references/conflicts；旧版本数组保持不展示
    if (!Array.isArray(res)) {
      aiContext.capture(res);
    }
    batchOpen.value = false;
    await load();
    message.success(`已生成 ${batchCount.value} 集分集`);
  } catch (error: any) {
    message.error(error?.message || '生成分集失败');
  } finally {
    batchSaving.value = false;
  }
}

onMounted(() => {
  void load();
  window.addEventListener('resize', attachEditorMeasure);
});
</script>

<template>
  <div class="nwb">
    <Card class="nwb-head-card" :body-style="{ padding: '12px 16px' }">
      <div class="nwb-head">
        <Button type="text" @click="emit('back')">
          <template #icon><ArrowLeftOutlined /></template>
        </Button>
        <div class="nwb-cover">{{ (book?.name || '书').slice(0, 1) }}</div>
        <div class="nwb-title">
          <div class="nwb-title__row">
            <h2>《{{ book?.name || '未命名书籍' }}》</h2>
            <Tag v-if="isFinished" color="green" :bordered="false">
              已完结
            </Tag>
            <Tag v-if="book?.genres?.length" :bordered="false">
              {{ book?.genres?.join(' · ') }}
            </Tag>
          </div>
          <div class="nwb-sub">
            {{ book?.episodeCount || stats.total }} 集 ·
            {{ (book?.wordCount || 0).toLocaleString() }} 字 ·
            {{ book?.episodeDuration || 90 }} 秒 / 集
            <template v-if="isFinished">
              · 已完结 · {{ book?.finishedAt || '完结时间未知' }}
            </template>
          </div>
        </div>
        <div class="nwb-actions">
          <Button @click="openAssetGraph">设定资产</Button>
          <Button @click="openSettings">小说设置</Button>
          <Button @click="novelMemoryOpen = true">全书记忆</Button>
          <Tooltip
            :title="isFinished ? '全书已完结，不能再生成新分集' : undefined"
          >
            <span>
              <Button
                :disabled="isFinished || !episodes.length"
                @click="batchOpen = true"
              >
                <template #icon><PlusOutlined /></template>批量生成分集
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            :title="isFinished ? '全书已完结，不能再生成下一集' : undefined"
          >
            <span>
              <Button :disabled="isFinished" @click="openNextEpisode">
                生成下一集
              </Button>
            </span>
          </Tooltip>
          <Button
            :disabled="isFinished"
            :loading="finishing"
            @click="finishNovel"
          >
            {{ isFinished ? '已完结' : '全书完结' }}
          </Button>
          <Button :loading="exporting" @click="exportNovel">
            <template #icon><ExportOutlined /></template>导出 TXT
          </Button>
        </div>
      </div>
      <div v-if="memoryOverview" class="nwb-memory-bar">
        <span>人物 {{ memoryOverview.characterCount ?? '—' }}</span>
        <span>未回收伏笔 {{ memoryOverview.openForeshadowCount ?? '—' }}</span>
        <span>
          记忆同步至第 {{ memoryOverview.syncedEpisodeSeq ?? '—' }} 章
        </span>
        <Button type="link" size="small" @click="novelMemoryOpen = true">
          查看全书记忆
        </Button>
      </div>
    </Card>

    <div class="nwb-grid">
        <Card class="nwb-pane" :body-style="{ padding: 0 }">
          <div class="nwb-pane__head">
            <span>章节目录</span>
            <span class="muted">{{ stats.total }} 集</span>
          </div>
          <div class="nwb-ep-list">
            <Empty
              v-if="!episodes.length"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="还没有分集"
            />
            <List v-else :data-source="episodes" :split="false">
              <template #renderItem="{ item }">
                <List.Item
                  class="nwb-ep"
                  :class="{ 'is-on': String(item.id) === String(selectedId) }"
                  @click="selectEpisode(item)"
                >
                  <span class="nwb-ep__no">{{ item.seq }}</span>
                  <span class="nwb-ep__text">
                    <b>{{ item.title || '未命名' }}</b>
                    <span :class="{ done: item.content }">
                      {{ item.content ? '正文已写' : '待创作' }}
                    </span>
                  </span>
                  <i
                    class="nwb-mem-dot"
                    :class="memoryDotClass(item)"
                    :title="memoryStatusLabel(item)"
                    @click.stop="retryEpisodeMemory(item)"
                  ></i>
                  <i class="nwb-dot" :class="{ done: item.content }"></i>
                </List.Item>
              </template>
            </List>
          </div>
        </Card>

        <Card class="nwb-pane nwb-pane--main" :body-style="{ padding: 0 }">
          <div class="nwb-tabs">
            <button
              v-for="item in [
                { key: 'content', label: '正文' },
                { key: 'summary', label: '细纲' },
              ]"
              :key="item.key"
              type="button"
              class="nwb-tab"
              :class="{ 'is-on': tab === item.key }"
              @click="setTab(item.key)"
            >
              {{ item.label }}
            </button>
            <span class="spacer"></span>
          </div>

          <div class="nwb-editor-body">
            <div v-if="!episode" class="nwb-empty">
              <b>选择左侧章节开始创作</b>
            </div>

            <div v-else-if="tab === 'content'" class="ed">
              <div class="ed-head">
                <div class="ed-head__title">
                  <h3>第 {{ episode.seq }} 集 · {{ episode.title || '未命名' }}</h3>
                  <span>{{ wordCount.toLocaleString() }} 字 · 预计阅读 {{ readingMinutes }} 分钟</span>
                </div>
                <span class="ed-save" :class="{ dirty }">
                  {{ saving ? '保存中…' : dirty ? '未保存' : savedAt ? `已保存 ${savedAt}` : '已自动保存' }}
                </span>
              </div>

              <div class="ed-direction">
                <span>本章走向</span>
                <Input
                  v-model:value="plotDirection"
                  :maxlength="200"
                  show-count
                  placeholder="轻控制：例如 本集结尾让女主身份暴露（30~200 字）"
                  @blur="saveDraft(false)"
                />
              </div>

              <div class="ed-toolbar">
                <Tooltip
                  :title="isFinished ? '全书已完结，不能继续续写' : undefined"
                >
                  <span>
                    <Button
                      size="small"
                      :disabled="isFinished"
                      :loading="aiLoading === 'continue'"
                      @click="runAi('continue')"
                    >
                      <template #icon><ThunderboltOutlined /></template>AI 续写
                    </Button>
                  </span>
                </Tooltip>
                <Button size="small" :loading="aiLoading === 'polish'" @click="runAi('polish')">
                  <template #icon><DiffOutlined /></template>润色
                </Button>
                <Button size="small" :loading="aiLoading === 'detect'" @click="runAi('detect')">
                  <template #icon><SafetyCertificateOutlined /></template>检测
                </Button>
                <Button size="small" @click="openVersions">
                  <template #icon><HistoryOutlined /></template>历史
                </Button>
                <Button size="small" :loading="aiLoading === 'detect'" @click="runAi('detect', '检查 AI 味和套路化表达')">
                  去 AI 味
                </Button>
                <Button size="small" :loading="aiLoading === 'proofread'" @click="runAi('proofread')">
                  <template #icon><CheckCircleOutlined /></template>校对
                </Button>
                <Button size="small" :loading="aiLoading === 'review'" @click="runAi('review')">
                  <template #icon><AuditOutlined /></template>审校
                </Button>
                <Button size="small" :loading="aiLoading === 'idea'" @click="runAi('idea')">
                  <template #icon><BulbOutlined /></template>想法
                </Button>
                <span class="spacer"></span>
                <span class="ed-autoextract">
                  <Switch v-model:checked="autoExtractAssets" size="small" />
                  顺手提炼资产
                </span>
                <Button
                  size="small"
                  :loading="finalizing"
                  @click="finalizeChapter"
                >
                  定稿本章
                </Button>
                <Button
                  size="small"
                  type="primary"
                  :loading="saving"
                  @click="manualSave"
                >
                  保存
                </Button>
                <Select
                  v-model:value="modelId"
                  :options="models"
                  placeholder="文本模型"
                  size="small"
                  style="width: 160px"
                />
              </div>

              <div v-if="aiContextNotice" class="ed-context-hint">
                {{ aiContextNotice }}
              </div>

              <AiContextPanel
                :conflicts="aiConflicts"
                :references="aiReferences"
                :stale-episodes="aiStaleEpisodes"
              />

              <div ref="editorHost" class="ed-editor">
                <VbenTiptap
                  v-model="editorHtml"
                  :min-height="200"
                  :max-height="editorMaxHeight"
                  :previewable="false"
                  placeholder="开始创作章节内容… 也可以先写一句走向，再点「AI 续写」"
                  @change="onEditorChange"
                />
              </div>

              <div v-if="issues.length" class="ed-issues">
                <div class="ed-issues__hd">
                  <b>检测结果</b>
                  <button type="button" @click="issues = []">清空</button>
                </div>
                <div v-for="(issue, index) in issues" :key="index" class="ed-issue">
                  <Tag :bordered="false">{{ issue.type }}</Tag>
                  <div>
                    <p>{{ issue.message }}</p>
                    <span v-if="issue.suggestion">建议：{{ issue.suggestion }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="tab === 'summary'" class="nwb-doc">
              <h3>分集细纲 · 第 {{ episode.seq }} 集</h3>
              <p class="nwb-summary">{{ episode.summary || '还没有细纲' }}</p>
              <div
                v-for="(beat, index) in episode.beats || []"
                :key="beat.type + index"
                class="nwb-beat"
              >
                <span class="nwb-beat__no">{{ index + 1 }}</span>
                <div>
                  <b>{{ beat.title }}</b>
                  <p>{{ beat.content }}</p>
                </div>
              </div>
            </div>

            <div v-if="episodeLoading" class="nwb-loading">
              <Spin />
            </div>
          </div>
        </Card>

        <div class="nwb-side">
          <Card size="small" class="nwb-card">
            <div class="nwb-card__title">创作进度</div>
            <div class="nwb-ring-row">
              <div class="nwb-ring" :style="{ '--p': stats.progress }">
                <span>{{ stats.progress }}%</span>
              </div>
              <div class="nwb-ring-meta">
                <b>{{ stats.written }} / {{ stats.total }} 集</b>
                <span>正文已完成</span>
              </div>
            </div>
          </Card>

          <Card size="small" class="nwb-card">
            <div class="nwb-card__title">小说属性</div>
            <dl class="nwb-kv">
              <div><dt>总字数</dt><dd>{{ (book?.wordCount || 0).toLocaleString() }}</dd></div>
              <div><dt>章节数</dt><dd>{{ stats.total }}</dd></div>
              <div><dt>目标字数</dt><dd>{{ targetWords.toLocaleString() }}</dd></div>
            </dl>
            <div class="nwb-progress">
              <div class="bar"><i :style="{ width: `${bookProgress}%` }"></i></div>
              <span>{{ bookProgress }}%</span>
            </div>
          </Card>

          <Card v-if="episode" size="small" class="nwb-card">
            <div class="nwb-card__title">
              本章记忆
              <Tag
                :bordered="false"
                :color="memoryStatusMeta(episode)?.color"
              >
                {{ memoryStatusMeta(episode)?.label }}
              </Tag>
              <Button type="link" size="small" @click="openChapterMemory">
                查看 / 校对
              </Button>
            </div>
            <p class="nwb-memory-desc">
              {{
                memoryStatusOf(episode) === MEMORY_STATUS.SUCCESS
                  ? '结构化记忆已就绪，可查看事件、人物状态、伏笔与结尾状态'
                  : memoryStatusOf(episode) === MEMORY_STATUS.STALE
                    ? '正文已修改，记忆已过期；请重建本章记忆'
                    : memoryStatusOf(episode) === MEMORY_STATUS.FAILED
                      ? '记忆生成失败，可手动重建'
                      : '定稿本章后自动生成结构化记忆；普通保存只标记过期，不消耗 token'
              }}
            </p>
            <Button
              v-if="currentMemoryTimedOut"
              size="small"
              :loading="memoryRebuilding"
              @click="retryEpisodeMemory(episode)"
            >
              手动重建
            </Button>
          </Card>

          <Card size="small" class="nwb-card">
            <div class="nwb-card__title"><BulbOutlined /> AI 灵感助手</div>
            <div class="nwb-plan">
              <b>章节规划</b>
              <p>{{ episode?.summary || '暂无章节规划' }}</p>
              <Button
                size="small"
                type="primary"
                :loading="planLoading"
                @click="generatePlan()"
              >
                生成规划
              </Button>
            </div>
            <div class="nwb-quick">
              <Button size="small" :loading="aiLoading === 'title'" @click="runAi('title')">生成标题</Button>
              <Button size="small" :loading="planLoading" @click="generatePlan(true)">重新规划</Button>
              <Button size="small" :loading="aiLoading === 'detect'" @click="runAi('detect', '检查敏感内容')">敏感检测</Button>
              <Button size="small" @click="openVersions">历史版本</Button>
              <Button size="small" :loading="planLoading" @click="generatePlan(true)">优化规划</Button>
              <Button size="small" :loading="aiLoading === 'idea'" @click="runAi('idea')">AI 想法</Button>
            </div>
          </Card>

          <Card size="small" class="nwb-card">
            <div class="nwb-card__title">快捷操作</div>
            <div class="nwb-quick">
              <Button size="small" :loading="episodeLoading" @click="generateContent">整章生成</Button>
              <Button size="small" :loading="extractLoading" @click="runExtract">抽取设定</Button>
            </div>
            <p class="nwb-tip">整章生成会覆盖当前正文，覆盖前自动存 AI 版本。</p>
          </Card>
        </div>
    </div>

    <div v-if="loading" class="nwb-loading">
      <Spin />
    </div>


    <Modal
      v-model:open="batchOpen"
      :confirm-loading="batchSaving"
      title="批量生成分集"
      ok-text="开始生成"
      @ok="submitBatch"
    >
      <div class="nwb-modal">
        <label>
          <span>文本模型</span>
          <Select v-model:value="modelId" :options="models" show-search />
        </label>
        <label>
          <span>生成集数</span>
          <InputNumber v-model:value="batchCount" :min="1" :max="20" />
        </label>
        <label>
          <span>创作要求</span>
          <Input.TextArea
            v-model:value="batchReq"
            :rows="3"
            placeholder="例如：每集结尾留钩子，第 5 集安排身份反转"
          />
        </label>
      </div>
    </Modal>

    <Modal
      v-model:open="planOpen"
      :confirm-loading="planApplying"
      title="章节规划"
      ok-text="应用规划"
      @ok="applyPlan"
    >
      <div class="nwb-modal">
        <AiContextPanel
          flush
          :conflicts="planConflicts"
          :references="planReferences"
          :stale-episodes="planStaleEpisodes"
        />
        <label>
          <span>本章梗概</span>
          <Input.TextArea v-model:value="planSummary" :rows="3" />
        </label>
        <div class="plan-beats">
          <div v-for="(beat, index) in planBeats" :key="index" class="plan-beat">
            <span>{{ index + 1 }}</span>
            <div>
              <b>{{ beat.title }}</b>
              <p>{{ beat.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <Modal v-model:open="versionsOpen" title="历史版本" :footer="null" width="640">
      <Spin :spinning="versionsLoading">
        <div v-if="!versions.length" class="nwb-empty">
          <b>还没有历史版本</b>
          <span>保存时勾选“存版”或使用 AI 动作后会生成</span>
        </div>
        <div v-else class="version-list">
          <div v-for="item in versions" :key="item.id" class="version-row">
            <div>
              <b>v{{ item.versionNo }}</b>
              <Tag :bordered="false">{{ item.source || 'manual' }}</Tag>
              <span>{{ item.words || 0 }} 字 · {{ item.createTime }}</span>
            </div>
            <Button type="link" size="small" @click="restoreVersion(item)">恢复</Button>
          </div>
        </div>
      </Spin>
    </Modal>

    <AssetGraphDrawer />
    <ChapterMemoryDrawer
      v-model:open="chapterMemoryOpen"
      :episode-id="episode?.id"
      :fallback-status="episode ? memoryStatusOf(episode) : undefined"
      :model-id="modelId"
      @updated="onChapterMemoryUpdated"
    />
    <NovelMemoryDrawer
      v-model:open="novelMemoryOpen"
      :episodes="episodes"
      :novel-id="props.novelId"
      @updated="onNovelMemoryUpdated"
    />
    <NovelSettingsModal
      v-model:open="settingsOpen"
      v-model:aspect-ratio="settingsAspectRatio"
      :saving="settingsSaving"
      @save="saveSettings"
    />



    <Modal v-model:open="ideaOpen" title="AI 想法" :footer="null" width="640">
      <AiContextPanel
        flush
        :conflicts="aiConflicts"
        :references="aiReferences"
        :stale-episodes="aiStaleEpisodes"
      />
      <div class="nwb-prose">{{ ideaText }}</div>
    </Modal>

    <Modal
      v-model:open="continueGuideOpen"
      title="本章还没有细纲"
      :footer="null"
      width="560"
    >
      <p class="continue-guide__text">
        本章还没有细纲。先「生成细纲」能让续写更准确地接上一章；也可以直接续写。
      </p>
      <div class="continue-guide__actions">
        <Button @click="focusPlanFromContinue">去生成细纲</Button>
        <Button
          type="primary"
          :loading="aiLoading === 'continue'"
          @click="continueAnyway"
        >
          仍然续写
        </Button>
      </div>
    </Modal>

    <Modal v-model:open="extractOpen" title="抽取设定" :footer="null" width="720">
      <div class="extract">
        <div class="extract-block">
          <b>角色</b>
          <div class="extract-list">
            <Tag v-for="item in extractResult?.characters || []" :key="item.id" :bordered="false">
              {{ item.name }}<span v-if="item.created"> · 新增</span>
            </Tag>
            <span v-if="!extractResult?.characters?.length" class="nwb-tip">无</span>
          </div>
        </div>
        <div class="extract-block">
          <b>场景</b>
          <div class="extract-list">
            <Tag v-for="item in extractResult?.scenes || []" :key="item.id" :bordered="false">
              {{ item.name }}<span v-if="item.created"> · 新增</span>
            </Tag>
            <span v-if="!extractResult?.scenes?.length" class="nwb-tip">无</span>
          </div>
        </div>
        <div class="extract-block">
          <b>道具 / 设定</b>
          <div class="extract-list">
            <Tag v-for="item in extractResult?.elements || []" :key="item.id" :bordered="false">
              {{ item.name }}<span v-if="item.created"> · 新增</span>
            </Tag>
            <span v-if="!extractResult?.elements?.length" class="nwb-tip">无</span>
          </div>
        </div>
        <p class="nwb-tip">抽取结果已写入「素材资产 → 创作素材」，可在那里绑定图片。</p>
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.nwb {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.nwb-loading {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, hsl(var(--card)) 65%, transparent);
}

.nwb-head {
  display: flex;
  flex: none;
  gap: 12px;
  align-items: center;
}

.nwb-cover {
  display: flex;
  flex: none;
  align-items: flex-end;
  width: 42px;
  height: 54px;
  padding: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--c-violet)));
  border-radius: 9px;
}

.nwb-title {
  flex: 1;
  min-width: 0;

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}

.nwb-sub {
  margin-top: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.nwb-actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.nwb-grid {
  display: grid;
  flex: 1;
  grid-template-columns: 236px minmax(0, 1fr) 300px;
  grid-template-rows: minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.nwb-head-card {
  flex: none;
}

.nwb-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  &__head {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 8px;
    font-size: 13px;
    font-weight: 600;
  }
}

.nwb-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
}

.nwb-ep-list {
  flex: 1;
  min-height: 0;
  padding: 0 8px 8px;
  overflow-y: auto;

  :deep(.ant-list-item) {
    padding: 0;
    margin-bottom: 4px;
    border: none;
  }
}

.nwb-ep {
  display: flex;
  gap: 9px;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 8px;
  text-align: left;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 9px;

  &:hover {
    background: hsl(var(--accent));
  }

  &.is-on {
    background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  }

  &__no {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 6px;
  }

  &.is-on &__no {
    color: #fff;
    background: hsl(var(--primary));
  }

  &__text {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      overflow: hidden;
      font-size: 13px;
      font-weight: 550;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      font-size: 11px;
      color: hsl(var(--muted-foreground));

      &.done {
        color: hsl(var(--success));
      }
    }
  }
}

.nwb-dot {
  flex: none;
  width: 6px;
  height: 6px;
  background: hsl(var(--border));
  border-radius: 50%;

  &.done {
    background: hsl(var(--success));
  }
}

.nwb-mem-dot {
  flex: none;
  width: 7px;
  height: 7px;
  cursor: default;
  background: hsl(var(--border));
  border-radius: 50%;

  &.is-1 {
    background: hsl(var(--primary));
  }

  &.is-2 {
    background: hsl(var(--success));
  }

  &.is-3 {
    cursor: pointer;
    background: hsl(var(--warning));
  }

  &.is-4 {
    cursor: pointer;
    background: hsl(var(--destructive));
  }

  &.is-timeout {
    cursor: pointer;
    background: hsl(var(--warning));
  }
}

.nwb-memory-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding-top: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  border-top: 1px dashed hsl(var(--border));
}

.nwb-tabs {
  display: flex;
  flex: none;
  gap: 4px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid hsl(var(--border));
}

.spacer {
  flex: 1;
}

.muted {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.nwb-tab {
  height: 30px;
  padding: 0 11px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 8px;

  &.is-on {
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
  }
}

/* 主编辑面板的 Spin 也要传递 flex 高度 */
.nwb-editor-body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

/* ==================== 编辑器 ==================== */
.ed {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.ed-head {
  display: flex;
  flex: none;
  gap: 12px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 14px 24px 6px;

  &__title {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }
  }
}

.ed-save {
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  &.dirty {
    color: hsl(var(--warning));
  }
}

.ed-direction {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
  padding: 6px 24px 2px;

  > span {
    flex: none;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.ed-autoextract {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.continue-guide__text {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.7;
}

.continue-guide__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ed-toolbar {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 10px 24px;
  border-bottom: 1px solid hsl(var(--border));
}

.ed-context-hint {
  flex: none;
  padding: 6px 10px;
  margin: 8px 24px 0;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--warning));
  background: color-mix(in srgb, hsl(var(--warning)) 10%, transparent);
  border-radius: 6px;
}

.ed-editor {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 0 20px 16px;
  overflow: hidden;

  :deep(.vben-tiptap) {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-height: 0;
  }

  /* 可用高度由 max-height 控制（见 measureEditorHeight），正文在 Tiptap 内部滚动 */
  :deep(.vben-tiptap__content) {
    font-size: 15px;
    line-height: 2;
  }
}

.ed-issues {
  flex: none;
  max-height: 180px;
  padding: 10px 24px 14px;
  overflow-y: auto;
  border-top: 1px solid hsl(var(--border));

  &__hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 12px;

    button {
      font-size: 12px;
      color: hsl(var(--primary));
      cursor: pointer;
      background: none;
      border: none;
    }
  }
}

.ed-issue {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.6;

  p {
    margin: 0;
  }

  span {
    color: hsl(var(--muted-foreground));
  }
}

.nwb-doc {
  flex: 1;
  min-height: 0;
  padding: 20px 28px 28px;
  overflow-y: auto;

  h3 {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 700;
  }
}

.nwb-prose {
  margin-top: 12px;
  font-size: 15px;
  line-height: 2;
  white-space: pre-wrap;
}

.nwb-summary {
  margin: 8px 0 14px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.nwb-beat {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  background: hsl(var(--accent));
  border-radius: 11px;

  &__no {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--primary));
    background: hsl(var(--card));
    border-radius: 7px;
  }

  b {
    font-size: 13px;
  }

  p {
    margin: 2px 0 0;
    font-size: 12px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
  }
}

.nwb-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: hsl(var(--muted-foreground));

  b {
    font-size: 14px;
    color: hsl(var(--foreground));
  }
}

.nwb-card {
  flex: none;

  &__title {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
  }
}

.nwb-ring-row {
  display: flex;
  gap: 14px;
  align-items: center;
}

.nwb-ring {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  background: conic-gradient(
    hsl(var(--primary)) calc(var(--p) * 1%),
    hsl(var(--muted)) 0
  );
  border-radius: 50%;

  &::before {
    position: absolute;
    width: 50px;
    height: 50px;
    content: '';
    background: hsl(var(--card));
    border-radius: 50%;
  }

  span {
    position: relative;
    z-index: 1;
    font-size: 14px;
    font-weight: 700;
  }
}

.nwb-ring-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  b {
    font-size: 14px;
    color: hsl(var(--foreground));
  }
}

.nwb-kv {
  margin: 0;

  div {
    display: flex;
    gap: 12px;
    padding: 5px 0;
    font-size: 12px;
    border-bottom: 1px dashed hsl(var(--border));

    &:last-child {
      border-bottom: none;
    }
  }

  dt {
    flex: none;
    width: 54px;
    color: hsl(var(--muted-foreground));
  }

  dd {
    margin: 0;
  }
}

.nwb-progress {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;

  .bar {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: hsl(var(--muted));
    border-radius: 999px;

    i {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--c-cyan)));
    }
  }

  span {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.nwb-plan {
  padding: 10px 12px;
  margin-bottom: 10px;
  background: hsl(var(--accent));
  border-radius: 10px;

  b {
    font-size: 12px;
  }

  p {
    display: -webkit-box;
    margin: 4px 0 8px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}

.nwb-quick {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;

  :deep(.ant-btn) {
    justify-content: center;
    width: 100%;
    font-size: 12px;
  }
}

.nwb-memory-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.nwb-card__title :deep(.ant-btn) {
  margin-left: auto;
  font-size: 12px;
}

.nwb-tip {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

.nwb-modal {
  display: flex;
  flex-direction: column;
  gap: 14px;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
  }
}

.plan-beats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.plan-beat {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 9px;

  > span {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 600;
    color: hsl(var(--primary));
    background: hsl(var(--card));
    border-radius: 6px;
  }

  b {
    font-size: 13px;
  }

  p {
    margin: 2px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }
}

.extract {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.extract-block {
  b {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
  }
}

.extract-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 9px;

  b {
    margin-right: 8px;
  }

  span {
    margin-left: 8px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}


</style>
