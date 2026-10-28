<script lang="ts" setup name="NovelBookWorkbench">
/**
 * 小说创作台：小说 → 分集正文/细纲/剧本 → 分镜 → 资产绑定 → 关键帧/视频 → 成片。
 * 由 novel/index.vue 打开；本组件承载分集编辑、AI 生成、分镜校验、角色/场景补绑与成片合成状态。
 * 主要接口：episode/*（详情、生成、绑定、compose）、storyboard/*、shot/*、novel/asset/graph。
 */
import type {
  EntityExtractResult,
  EpisodeAiIssue,
  EpisodeComposeMissingShot,
  EpisodeComposeStatus,
  EpisodeItem,
  EpisodePlanResponse,
  EpisodeSaveRequest,
  EpisodeVersionItem,
  NovelDetailItem,
  ShotItem,
  StoryboardBatchActiveResult,
  StoryboardBatchMode,
  StoryboardBatchPlan,
  StoryboardBatchPlanItem,
  StoryboardBatchSkippedItem,
  StoryboardBatchTarget,
  StoryboardBindingReport,
  StoryboardIssue,
  StoryboardValidateResult,
} from '#/api/models/ai_asset';
import type { TaskBatchCenterDetailItem } from '#/api/models/marketing';
import type { RefAsset } from '#/views/ai_asset/studio/constants';

import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';

import {
  ArrowLeftOutlined,
  AuditOutlined,
  BranchesOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DiffOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Image,
  Input,
  InputNumber,
  List,
  Menu,
  MenuItem,
  message,
  Modal,
  Popover,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi, taskCenterApi } from '#/api';

import RefPickerDrawer from '../../studio/components/RefPickerDrawer.vue';
import { isExtraCharacter } from '../characterTypes';
import AssetGraphDrawerContent from './AssetGraphDrawer.vue';

const props = defineProps<{
  models: Array<{ label: string; value: number | string }>;
  novelId: number | string;
}>();
const emit = defineEmits<{ back: [] }>();

type TabKey = 'content' | 'script' | 'storyboard' | 'summary';
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

const sceneBindOpen = ref(false);
const sceneBindLoading = ref(false);
const sceneBindSaving = ref(false);
const sceneBindRows = ref<
  Array<{
    assetSceneId?: number | string;
    heading?: string;
    /** false 表示只在分镜里出现、episode.scenes 没有该场 */
    inScript?: boolean;
    location?: string;
    originalSceneId?: number | string;
    sceneSeq: number;
  }>
>([]);
const sceneAssetOptions = ref<Array<{ label: string; value: number | string }>>([]);
/** 当前展开场景下拉的镜头 id */
const scenePickShotId = ref<string>();
/** 场景绑定弹窗里正在新建资产的场次 */
const creatingSceneSeq = ref<number>();

const bindingReport = ref<StoryboardBindingReport>();
const bindingExpanded = ref(false);
const characterBindOpen = ref(false);
const characterBindLoading = ref(false);
const characterBindSaving = ref(false);
const extraBindExpanded = ref(false);
const characterBindRows = ref<
  Array<{
    affected: number;
    characterId?: number | string;
    characterType?: number;
    name: string;
  }>
>([]);
/** 角色资产选项附带 characterType，用于绑定弹窗分组与报告拆分 */
const characterAssetOptions = ref<
  Array<{ characterType?: number; label: string; value: number | string }>
>([]);

// ==================== 成片合成 ====================
const composeStatus = ref<EpisodeComposeStatus>();
const composeSubmitting = ref(false);
const composePreviewOpen = ref(false);
const composeMissingOpen = ref(false);
const composeMissingShots = ref<EpisodeComposeMissingShot[]>([]);
const composePrecheckMessage = ref('');
/** 视频不齐时点击生成成片的确认弹窗，不直接禁用入口 */
const composeGateOpen = ref(false);
const COMPOSE_POLL_INTERVAL = 2000;
const COMPOSE_POLL_MAX_MS = 30 * 60 * 1000;
let composePollTimer: ReturnType<typeof setTimeout> | undefined;
let composePollStartedAt: number | undefined;

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
const memoryLoading = ref(false);
const memoryPending = ref(false);
const memoryStale = ref(false);
const extractLoading = ref(false);
const extractOpen = ref(false);
const extractResult = ref<EntityExtractResult>();

const shots = ref<ShotItem[]>([]);
const shotsLoading = ref(false);
const storyboardGenerating = ref(false);
const shotBind = ref<{ field: 'image' | 'video'; shot: ShotItem }>();
const shotPollers = new Map<string, ReturnType<typeof setTimeout>>();
const validationLoading = ref(false);
const validationOpen = ref(false);
const validationResult = ref<StoryboardValidateResult>();
const validationWarningsOpen = ref(false);
const keyframeGenerating = ref<string>();

// ==================== 分镜批量生成（后端批次任务） ====================
/**
 * 默认走后端批次任务；接口异常需要回退时改为 false，
 * 会切到下方本地执行器（并发 2 逐镜提交），两者不会同时运行。
 */
const USE_SERVER_BATCH = true;
const BATCH_SKIP_REASON_LABELS: Record<string, string> = {
  already_has_image: '已有图片',
  already_has_video: '已有视频',
  blank_unconfirmed: '空镜未确认',
  character_unbound: '角色未绑定',
  generating: '生成中',
  no_keyframe: '缺少关键帧',
  not_person_shot: '非人物镜头',
  not_stale: '无需重生成',
  scene_unbound: '场景未绑定',
};
const BATCH_TASK_OPTION_LABELS: Record<string, string> = {
  ai_shot_keyframe: '批量生成关键帧',
  ai_shot_keyframe_stale: '批量重生成关键帧',
  ai_shot_video: '批量生成视频',
};
/** 批次任务状态（与成片 compose 的 0/1/2/3 完全独立，勿混用） */
const BATCH_STATUS_MAP: Record<number, string> = {
  1: '待处理',
  2: '处理中',
  3: '已完成',
  4: '失败',
};
const BATCH_TASK_POLL_INTERVAL = 3000;

interface BatchTaskState {
  batchTaskStatus: number;
  existing?: boolean;
  failedCount: number;
  items: TaskBatchCenterDetailItem[];
  optionType?: string;
  pendingCount: number;
  progressPercent: number;
  skipped: StoryboardBatchSkippedItem[];
  successCount: number;
  target: StoryboardBatchTarget;
  taskId: number | string;
  totalCount: number;
}

const batchConfirmOpen = ref(false);
const batchPlan = ref<StoryboardBatchPlan>();
const batchTarget = ref<StoryboardBatchTarget>('keyframe');
const batchMode = ref<StoryboardBatchMode>('new');
const batchPlanLoading = ref(false);
const batchPlanLoadingTarget = ref<string>();
const batchSubmitting = ref(false);
const batchShowSkipped = ref(false);
/** 后端批次任务状态：进入分镜页按 active 恢复，提交后按 taskId 轮询 */
const batchTasks = ref<BatchTaskState[]>([]);
const batchTaskTimers = new Map<string, ReturnType<typeof setTimeout>>();
const batchTaskPollFails = new Map<string, number>();
/** 进度面板展开 / 失败明细展开，均按 taskId 记录 */
const batchExpandedIds = ref<string[]>([]);
const batchFailuresExpandedIds = ref<string[]>([]);

// ---- 本地执行器：仅 USE_SERVER_BATCH=false 时使用（备用路径） ----
const localBatchRunning = ref(false);
const localBatchTarget = ref<StoryboardBatchTarget>('keyframe');
const localBatchTotal = ref(0);
const localBatchDone = ref(0);
const localBatchSuccess = ref(0);
const localBatchFailed = ref(0);
const localBatchFailures = ref<
  Array<{ message: string; seq: number; shotId: number | string }>
>([]);
let localBatchToken = 0;

const promptOpen = ref(false);
const promptSaving = ref(false);
const promptForm = reactive({
  camera: '',
  description: '',
  dialogue: '',
  durationSeconds: 0,
  id: '' as number | string,
  imagePrompt: '',
  sceneSeq: 0,
  seq: 0,
  shotType: '',
  videoPrompt: '',
});

const [ShotMaterialDrawer, shotDrawerApi] = useVbenDrawer({
  connectedComponent: RefPickerDrawer,
});

const [AssetGraphDrawer, assetGraphApi] = useVbenDrawer({
  connectedComponent: AssetGraphDrawerContent,
});

function openAssetGraph() {
  assetGraphApi.setData({ novelId: props.novelId });
  assetGraphApi.open();
}

/** 资产图谱内改过角色类型/形象或新建场景后，清空缓存再刷新分镜与报告 */
function onAssetGraphChanged() {
  characterAssetOptions.value = [];
  sceneAssetOptions.value = [];
  void loadStoryboard();
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
  const scripts = episodes.value.filter((item) => item.script).length;
  return { total, scripts, progress: total ? Math.round((scripts / total) * 100) : 0 };
});

const characterBindStat = computed(
  () => bindingReport.value?.characters ?? { bound: 0, total: 0, unmatched: [] },
);
const sceneBindStat = computed(
  () =>
    bindingReport.value?.scenes ?? {
      bound: 0,
      total: 0,
      unmatched: [] as Array<{ heading?: string; sceneSeq: number }>,
    },
);
const bindingComplete = computed(
  () =>
    Boolean(bindingReport.value) &&
    characterBindStat.value.unmatched.length === 0 &&
    sceneBindStat.value.unmatched.length === 0,
);
const unboundNames = computed(
  () => new Set(bindingReport.value?.characters.unmatched ?? []),
);
const bindingMissSummary = computed(() => {
  const parts: string[] = [];
  const names = characterBindStat.value.unmatched;
  if (names.length) {
    parts.push(`角色 ${names.slice(0, 3).join('、')}${names.length > 3 ? '…' : ''}`);
  }
  const scenes = sceneBindStat.value.unmatched;
  if (scenes.length) {
    parts.push(`场景 ${scenes.map((item) => `第${item.sceneSeq}场`).join('、')}`);
  }
  return parts.join('；');
});

/** 角色名 → characterType，来自资产图谱；用于报告兜底拆分与绑定弹窗分组 */
const characterTypeMap = computed(() => {
  const map = new Map<string, number>();
  for (const option of characterAssetOptions.value) {
    if (option.characterType !== undefined) {
      map.set(option.label, option.characterType);
    }
  }
  return map;
});

/**
 * 主角色 / 群演绑定率拆分：
 * 优先使用后端 characters.main/extra；后端未返回时，用资产图谱类型 + 分镜里出现的角色名兜底。
 * 这样群演未绑定不会拉低主角色绑定率，状态条仍按整体未绑数决定颜色。
 */
const characterGroups = computed(() => {
  const report = bindingReport.value;
  if (!report) {
    return undefined;
  }
  // 后端字段可能只给 total/bound，统一补齐 unmatched，避免模板读长度报错
  const normalizeGroup = (group?: {
    bound?: number;
    total?: number;
    unmatched?: string[];
  }) =>
    group
      ? {
          bound: Number(group.bound ?? 0),
          total: Number(group.total ?? 0),
          unmatched: group.unmatched ?? [],
        }
      : undefined;
  if (report.characters.main && report.characters.extra) {
    return {
      extra: normalizeGroup(report.characters.extra)!,
      main: normalizeGroup(report.characters.main)!,
    };
  }
  const unbound = new Set(report.characters.unmatched);
  const names = new Set<string>(report.characters.unmatched);
  for (const shot of shots.value) {
    for (const name of shot.characters ?? []) {
      names.add(name);
    }
  }
  const mainNames: string[] = [];
  const extraNames: string[] = [];
  for (const name of names) {
    if (isExtraCharacter(characterTypeMap.value.get(name))) {
      extraNames.push(name);
    } else {
      mainNames.push(name);
    }
  }
  const group = (list: string[]) => {
    const unmatched = list.filter((name) => unbound.has(name));
    return {
      bound: list.length - unmatched.length,
      total: list.length,
      unmatched,
    };
  };
  return { extra: group(extraNames), main: group(mainNames) };
});
const mainBindStat = computed(
  () => characterGroups.value?.main ?? characterBindStat.value,
);
const extraBindStat = computed(() => characterGroups.value?.extra);
const mainCharacterBindRows = computed(() =>
  characterBindRows.value.filter((row) => !isExtraCharacter(row.characterType)),
);
const extraCharacterBindRows = computed(() =>
  characterBindRows.value.filter((row) => isExtraCharacter(row.characterType)),
);
/** 群演行优先只展示群演资产；后端未回类型时退回全部，避免下拉为空 */
const extraCharacterOptions = computed(() => {
  const list = characterAssetOptions.value.filter((item) =>
    isExtraCharacter(item.characterType),
  );
  return list.length ? list : characterAssetOptions.value;
});
/** 有后端分组或本地角色类型时，状态条才拆「主要角色/群演」；否则退回合并展示 */
const hasCharacterGroups = computed(
  () =>
    Boolean(
      bindingReport.value?.characters.main &&
        bindingReport.value?.characters.extra,
    ) || characterTypeMap.value.size > 0,
);

// 0 排队 / 1 合成中 / 2 成功 / 3 失败（与后端 AiAssetComposeStatusResult 一致）
const COMPOSE_STATUS_MAP: Record<number, { color: string; label: string }> = {
  0: { color: 'orange', label: '排队中' },
  1: { color: 'blue', label: '合成中' },
  2: { color: 'green', label: '已完成' },
  3: { color: 'red', label: '合成失败' },
};
const composeState = computed<{ color?: string; label: string }>(() => {
  const status = composeStatus.value;
  const mapped = status
    ? COMPOSE_STATUS_MAP[Number(status.status)]
    : undefined;
  return mapped ?? { label: '未生成' };
});
/** progress 后端可能返回 0-100 或 0-1，这里统一按百分比展示 */
const composeProgress = computed(() => {
  const raw = Number(composeStatus.value?.progress ?? 0);
  const percent = raw > 0 && raw < 1 ? raw * 100 : raw;
  return Math.min(100, Math.max(0, Math.round(percent)));
});
const composeRunning = computed(() =>
  [0, 1].includes(Number(composeStatus.value?.status ?? -1)),
);
const composeDone = computed(() => composeStatus.value?.status === 2);
const composeFailed = computed(() => composeStatus.value?.status === 3);
/** 有地址才能播放/下载；状态已成功但地址未回时只展示“地址加载中” */
const composePlayable = computed(
  () => composeDone.value && Boolean(composeStatus.value?.finalUrl),
);

/** 前端兜底：没有 videoMaterialId/hasVideo 的镜头视为缺视频 */
const localMissingVideoSeqs = computed(() =>
  shots.value
    .filter((shot) => !shot.videoMaterialId && !shot.hasVideo)
    .map((shot) => Number(shot.seq ?? shot.id)),
);
const composeReady = computed(
  () => shots.value.length > 0 && localMissingVideoSeqs.value.length === 0,
);

const validationErrors = computed(
  () =>
    validationResult.value?.issues.filter(
      (issue) => issue.level === 'error',
    ) ?? [],
);
const validationWarnings = computed(
  () =>
    validationResult.value?.issues.filter(
      (issue) => issue.level !== 'error',
    ) ?? [],
);
/** 一致性≠成片就绪：composeReady 后端未返回时按镜头视频状态兜底 */
const validationComposeReady = computed(() => {
  const value = validationResult.value?.composeReady;
  return typeof value === 'boolean' ? value : composeReady.value;
});
const validationMissingVideoSeqs = computed(() => {
  const value = validationResult.value?.missingVideoSeqs;
  return Array.isArray(value) ? value : localMissingVideoSeqs.value;
});
const missingVideoPreview = computed(() =>
  validationMissingVideoSeqs.value.slice(0, 20),
);
const missingVideoExtra = computed(() =>
  Math.max(0, validationMissingVideoSeqs.value.length - 20),
);

/** 任务是否仍在执行：1 待处理 / 2 处理中 */
function isBatchTaskRunning(status?: number) {
  return status === 1 || status === 2;
}

const keyframeTaskBusy = computed(() =>
  batchTasks.value.some(
    (task) =>
      task.target === 'keyframe' && isBatchTaskRunning(task.batchTaskStatus),
  ),
);
const videoTaskBusy = computed(() =>
  batchTasks.value.some(
    (task) => task.target === 'video' && isBatchTaskRunning(task.batchTaskStatus),
  ),
);
const keyframeTask = computed(() =>
  batchTasks.value.find(
    (task) =>
      task.target === 'keyframe' && isBatchTaskRunning(task.batchTaskStatus),
  ),
);
const videoTask = computed(() =>
  batchTasks.value.find(
    (task) => task.target === 'video' && isBatchTaskRunning(task.batchTaskStatus),
  ),
);
/** 合并本地备用执行器状态：开关关闭时同样锁住入口与单镜按钮 */
const keyframeBusy = computed(
  () =>
    keyframeTaskBusy.value ||
    (localBatchRunning.value && localBatchTarget.value === 'keyframe'),
);
const videoBusy = computed(
  () =>
    videoTaskBusy.value ||
    (localBatchRunning.value && localBatchTarget.value === 'video'),
);
const localBatchPercent = computed(() =>
  localBatchTotal.value
    ? Math.round((localBatchDone.value / localBatchTotal.value) * 100)
    : 0,
);
const batchTitle = computed(() => {
  const action = batchMode.value === 'stale' ? '批量重生成' : '批量生成';
  return `${action}${batchTarget.value === 'keyframe' ? '关键帧' : '视频'}`;
});
/** 跳过原因聚合：确认框里按原因给出数量，避免 20 条逐条看 */
const batchSkipSummary = computed(() => {
  const counter = new Map<string, number>();
  for (const item of batchPlan.value?.skipped ?? []) {
    counter.set(item.reason, (counter.get(item.reason) ?? 0) + 1);
  }
  return [...counter.entries()].map(([reason, count]) => ({
    count,
    label: BATCH_SKIP_REASON_LABELS[reason] ?? reason,
    reason,
  }));
});
const keyframeEstimate = computed(
  () => localBatchPlan('keyframe', 'new').eligible.length,
);
const videoEstimate = computed(
  () => localBatchPlan('video', 'new').eligible.length,
);
/** 分镜里若带过模型名就展示；没有则明确写默认模型，不猜具体模型 */
const batchModelLabel = computed(() => {
  const config = shots.value.find(
    (shot) => shot.config?.modelName || shot.config?.model,
  )?.config;
  return String(config?.modelName ?? config?.model ?? '默认模型');
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

// ==================== 剧本/批量 ====================
const scriptOpen = ref(false);
const scriptSaving = ref(false);
const scriptDuration = ref(90);
const scriptReq = ref('');
const batchOpen = ref(false);
const batchSaving = ref(false);
const batchCount = ref(2);
const batchReq = ref('');

const ideaOpen = ref(false);
const ideaText = ref('');

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
  try {
    const [detail, page] = await Promise.all([
      aiAssetApi.fetchNovelDetail(props.novelId),
      aiAssetApi.fetchEpisodes({ novelId: props.novelId, page: 1, pageSize: 200 }),
    ]);
    book.value = detail;
    episodes.value = page?.items ?? [];
    const first = episodes.value[0];
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
  memoryStale.value = false;
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
  // 换集后清空上一集的分镜、绑定报告与成片状态，切到分镜页时会自动重新拉取
  shots.value = [];
  bindingReport.value = undefined;
  bindingExpanded.value = false;
  extraBindExpanded.value = false;
  stopComposePoll();
  composePollStartedAt = undefined;
  composeStatus.value = undefined;
  composeMissingShots.value = [];
  stopAllBatchTaskPolls();
  batchTasks.value = [];
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
  }
}

async function selectEpisode(item: EpisodeItem) {
  if (String(item.id) === String(selectedId.value)) {
    return;
  }
  await loadEpisode(item);
  // 当前停留在分镜页时，切集后自动加载新一集的分镜与活动批量任务
  if (tab.value === 'storyboard') {
    await loadStoryboard();
    await loadActiveBatchTasks();
  }
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
  if (key === 'storyboard') {
    await loadStoryboard();
    // 进入分镜页先恢复后端批量任务，有活动任务时直接展示进度
    await loadActiveBatchTasks();
    return;
  }
  if (key === 'script') {
    // 剧本/场次包含在详情里，进入剧本页时重新拉一次最新详情
    await loadEpisode(current);
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
  refreshMemory = false,
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
    if (contentChanged && refreshMemory && !memoryPending.value) {
      void generateMemory(Boolean(episode.value.hasMemory));
    } else if (contentChanged && episode.value.hasMemory) {
      memoryStale.value = true;
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
  shotPollers.forEach((timer) => clearTimeout(timer));
  shotPollers.clear();
  stopComposePoll();
  // 后端批量任务独立运行，页面卸载只停前端轮询
  stopAllBatchTaskPolls();
  // 本地备用执行器卸载后不再继续提交
  localBatchToken += 1;
  clearTimeout(saveTimer);
  if (dirty.value) {
    void saveDraft(false);
  }
  window.removeEventListener('resize', attachEditorMeasure);
  document.removeEventListener('visibilitychange', handlePageVisibilityChange);
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

async function runAi(action: AiAction, instruction?: string) {
  if (!episode.value || !requireModel()) {
    return;
  }
  const selection = getSelection();
  if (action === 'polish' && !selection?.text.trim()) {
    message.warning('先选中要润色的文字');
    return;
  }
  if (!(await saveDraft(false))) {
    return;
  }
  aiLoading.value = action;
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
    await saveDraft(true, {}, true);
  } catch (error: any) {
    message.error(error?.message || 'AI 动作失败');
  } finally {
    aiLoading.value = undefined;
  }
}

function normalizeShotList(payload: any): ShotItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload?.shots)) {
    return payload.shots;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
}

function normalizeBindingReport(raw: any): StoryboardBindingReport | undefined {
  if (!raw?.characters || !raw?.scenes) {
    return undefined;
  }
  return {
    characters: {
      bound: Number(raw.characters.bound ?? 0),
      total: Number(raw.characters.total ?? 0),
      unmatched: Array.isArray(raw.characters.unmatched)
        ? raw.characters.unmatched
        : [],
    },
    scenes: {
      bound: Number(raw.scenes.bound ?? 0),
      total: Number(raw.scenes.total ?? 0),
      unmatched: Array.isArray(raw.scenes.unmatched) ? raw.scenes.unmatched : [],
    },
    shotsMissingCharacter: Array.isArray(raw.shotsMissingCharacter)
      ? raw.shotsMissingCharacter
      : [],
    shotsMissingScene: Array.isArray(raw.shotsMissingScene)
      ? raw.shotsMissingScene
      : [],
  };
}

async function loadBindingReport() {
  const target = episode.value;
  if (!target) {
    return;
  }
  try {
    const res = await aiAssetApi.fetchStoryboardBindingReport(target.id);
    if (String(episode.value?.id) !== String(target.id)) {
      return;
    }
    const normalized = normalizeBindingReport(res);
    if (normalized) {
      bindingReport.value = normalized;
      // 状态条需要角色类型来拆分主角色/群演；失败时不阻塞报告展示
      void ensureCharacterAssets().catch(() => {});
    }
  } catch {
    // 绑定报告接口未就绪时降级：不展示状态条，不影响分镜主流程
  }
}

let storyboardToken = 0;

async function loadStoryboard() {
  const current = episode.value;
  if (!current) {
    return;
  }
  const token = ++storyboardToken;
  shotsLoading.value = true;
  try {
    const res: any = await aiAssetApi.fetchStoryboard(current.id);
    if (token !== storyboardToken) {
      return;
    }
    shots.value = normalizeShotList(res);
    if (shots.value.length === 0) {
      console.warn('[storyboard] list returned empty:', res);
    }
    void loadBindingReport();
    void loadComposeStatus();
    // 场景下拉与镜头卡展示都需要场景资产名；失败不影响分镜主流程
    void ensureSceneAssets().catch(() => {});
  } catch (error: any) {
    if (token === storyboardToken) {
      message.error(error?.message || '加载分镜失败');
    }
  } finally {
    if (token === storyboardToken) {
      shotsLoading.value = false;
    }
  }
}

function stopComposePoll() {
  if (composePollTimer) {
    clearTimeout(composePollTimer);
    composePollTimer = undefined;
  }
}

/**
 * 成片状态入库：成功后若缺少 finalUrl，用 finalMaterialId 回查素材地址。
 * 状态映射：0 排队 / 1 合成中 / 2 成功 / 3 失败。
 */
async function applyComposeStatus(status: EpisodeComposeStatus) {
  composeStatus.value = status;
  if (status.status === 2 && !status.finalUrl) {
    await resolveComposeUrl(status);
  }
}

/**
 * 状态接口尚未回 finalUrl 时，用 finalMaterialId 去素材列表回查存储地址。
 * 素材接口没有单条 detail，成片刚生成通常在列表首屏，先取 200 条按 id 命中；
 * 命中失败则保持「已完成，地址加载中」，不让按钮指向空地址。
 */
async function resolveComposeUrl(status: EpisodeComposeStatus) {
  const fallbackUrl = status.finalUrl ?? episode.value?.finalUrl;
  if (fallbackUrl) {
    composeStatus.value = { ...status, finalUrl: fallbackUrl };
    return;
  }
  const materialId = status.finalMaterialId ?? episode.value?.finalMaterialId;
  if (!materialId) {
    return;
  }
  try {
    const res: any = await aiAssetApi.fetchMaterialList({
      page: 1,
      pageSize: 200,
    });
    const list: any[] = Array.isArray(res)
      ? res
      : (res?.items ?? res?.data ?? []);
    const hit = list.find((item) => String(item.id) === String(materialId));
    const url = hit?.storageUrl ?? hit?.url;
    if (url) {
      composeStatus.value = {
        ...status,
        finalUrl: url,
        thumbnailUrl: status.thumbnailUrl ?? hit.thumbnailUrl,
      };
    }
  } catch {
    // 查询失败保持地址加载中，不影响「已完成」展示
  }
}

/**
 * 成片状态轮询：0/1 每 2s 继续，2/3 停止；
 * 最长 30 分钟，超时提示稍后回看，避免长时间挂后台请求。
 */
function scheduleComposePoll() {
  stopComposePoll();
  if (!composePollStartedAt) {
    composePollStartedAt = Date.now();
  }
  composePollTimer = setTimeout(async () => {
    const target = episode.value;
    if (!target) {
      return;
    }
    if (
      composePollStartedAt &&
      Date.now() - composePollStartedAt > COMPOSE_POLL_MAX_MS
    ) {
      stopComposePoll();
      composePollStartedAt = undefined;
      message.info('合成时间较长，可稍后回来看');
      return;
    }
    try {
      const status = await aiAssetApi.fetchEpisodeComposeStatus(target.id);
      if (String(episode.value?.id) !== String(target.id)) {
        return;
      }
      await applyComposeStatus(status);
      if (composeRunning.value) {
        scheduleComposePoll();
      } else {
        composePollStartedAt = undefined;
      }
    } catch {
      // 状态接口短暂失败时停止轮询，避免无限重试；用户可重新点生成成片
      composePollStartedAt = undefined;
    }
  }, COMPOSE_POLL_INTERVAL);
}

async function loadComposeStatus() {
  const target = episode.value;
  if (!target) {
    return;
  }
  try {
    const status = await aiAssetApi.fetchEpisodeComposeStatus(target.id);
    if (String(episode.value?.id) !== String(target.id)) {
      return;
    }
    await applyComposeStatus(status);
    if (composeRunning.value) {
      scheduleComposePoll();
    }
  } catch {
    // 后端状态接口未就绪时降级：入口仍可点击，仅不展示历史状态
  }
}

/** 预检 400 的缺失镜头可能挂在 error 本体、data 或 response.data，逐层兜底取数组 */
function extractComposeMissingShots(error: any): EpisodeComposeMissingShot[] {
  const candidates = [
    error?.missingShots,
    error?.data?.missingShots,
    error?.data?.data?.missingShots,
    error?.response?.data?.missingShots,
    error?.response?.data?.data?.missingShots,
  ];
  const found = candidates.find((item) => Array.isArray(item));
  return Array.isArray(found) ? found : [];
}

function isComposeBadRequest(error: any) {
  return (
    error?.status === 400 ||
    error?.code === 400 ||
    error?.data?.code === 400 ||
    error?.response?.status === 400
  );
}

/** 成片入口：视频不齐不直接禁用，先让用户选择去补视频或仍然提交 */
function generateCompose() {
  if (!episode.value || composeSubmitting.value || composeRunning.value) {
    return;
  }
  if (!composeReady.value) {
    composeGateOpen.value = true;
    return;
  }
  void submitCompose();
}

async function submitCompose() {
  if (!episode.value || composeSubmitting.value || composeRunning.value) {
    return;
  }
  composeGateOpen.value = false;
  composeMissingOpen.value = false;
  composeMissingShots.value = [];
  composePrecheckMessage.value = '';
  // 清掉上一次失败残留，避免预检失败时仍显示旧“合成失败”
  composeStatus.value = undefined;
  composeSubmitting.value = true;
  try {
    const res = await aiAssetApi.composeEpisode({ episodeId: episode.value.id });
    // 提交后默认按排队中展示；后端若直接回状态则以它为准
    composePollStartedAt = Date.now();
    if (res) {
      await applyComposeStatus(res);
    } else {
      composeStatus.value = { progress: 0, status: 0 };
    }
    message.success('已提交合成');
    if (composeRunning.value) {
      scheduleComposePoll();
    } else {
      composePollStartedAt = undefined;
    }
  } catch (error: any) {
    const missing = extractComposeMissingShots(error);
    // 400 属于预检未通过，不是任务失败；单独展示缺失镜头列表
    if (missing.length || isComposeBadRequest(error)) {
      composeMissingShots.value = missing;
      composePrecheckMessage.value = missing.length
        ? ''
        : error?.message || '存在缺失视频的镜头，请先补齐';
      composeMissingOpen.value = true;
    } else {
      message.error(error?.message || '提交合成失败');
    }
  } finally {
    composeSubmitting.value = false;
  }
}

/** 预检未通过 / 视频不齐时统一跳批量视频 */
function gotoBatchVideoForCompose() {
  composeGateOpen.value = false;
  composeMissingOpen.value = false;
  validationOpen.value = false;
  void openBatch('video', 'new');
}

function goComposeFromValidation() {
  if (!validationComposeReady.value) {
    return;
  }
  validationOpen.value = false;
  generateCompose();
}

/** 只有拿得到成片地址才允许打开预览，避免空地址弹窗 */
function openComposePreview() {
  if (composePlayable.value) {
    composePreviewOpen.value = true;
  }
}

/** 台词按 4 字/秒估算是否超出镜头时长，用于镜头卡提示 */
function dialogueTooLong(shot: ShotItem) {
  const seconds = Number(shot.durationSeconds ?? 0);
  const text = (shot.dialogue ?? '').replace(/\s/g, '');
  return seconds > 0 && text.length > seconds * 4;
}

/** 场景资产选项：asset/graph 只拉一次，镜头卡与按场绑定弹窗共用 */
async function ensureSceneAssets(force = false) {
  if (sceneAssetOptions.value.length && !force) {
    return sceneAssetOptions.value;
  }
  const graph = await aiAssetApi.fetchNovelAssetGraph(props.novelId);
  sceneAssetOptions.value = (graph?.scenes ?? []).map((item) => ({
    label: item.name,
    value: item.id,
  }));
  return sceneAssetOptions.value;
}

function sceneHeading(shot: ShotItem) {
  return sceneOf(shot)?.heading ?? '';
}

function sceneAssetName(sceneId?: number | string) {
  if (sceneId === undefined || sceneId === null) {
    return '';
  }
  return (
    sceneAssetOptions.value.find(
      (item) => String(item.value) === String(sceneId),
    )?.label ?? '已绑定场景'
  );
}

/** 镜头卡场景行：点开才加载场景资产，避免每张卡都请求 */
async function toggleShotScenePick(shot: ShotItem, open: boolean) {
  if (!open) {
    scenePickShotId.value = undefined;
    return;
  }
  try {
    await ensureSceneAssets();
    scenePickShotId.value = String(shot.id);
  } catch (error: any) {
    message.error(error?.message || '加载场景资产失败');
  }
}

/** 单镜场景绑定：只改当前镜头，后端会清 asset_stale */
async function bindShotScene(shot: ShotItem, value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string' && typeof raw !== 'number') {
    return;
  }
  const sceneId = raw;
  if (!episode.value) {
    return;
  }
  try {
    await aiAssetApi.saveShot({
      episodeId: episode.value.id,
      id: shot.id,
      novelId: props.novelId,
      sceneId,
    });
    scenePickShotId.value = undefined;
    await loadStoryboard();
    message.success('场景已绑定到当前镜头；资产已标记需重新生成关键帧');
  } catch (error: any) {
    message.error(error?.message || '绑定场景失败');
  }
}

/** 后端 400 文案带「第 N 场」时，定位镜头并自动打开场景下拉 */
async function focusShotSceneByError(error: any) {
  const match = String(error?.message ?? '').match(/第\s*(\d+)\s*场/);
  if (!match) {
    return false;
  }
  const seq = Number(match[1]);
  const shot = shots.value.find((item) => Number(item.sceneSeq) === seq);
  if (!shot) {
    return false;
  }
  await toggleShotScenePick(shot, true);
  message.warning(`请先为第 ${seq} 场的镜头绑定场景`);
  return true;
}

function normalizeEpisodeUnpersisted(value: unknown): Array<number | string> {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return [value as number | string];
}

async function openSceneBind() {
  if (!episode.value) {
    return;
  }
  sceneBindOpen.value = true;
  sceneBindLoading.value = true;
  try {
    await ensureSceneAssets();
    let scenes = episode.value.scenes ?? [];
    if (!scenes.length) {
      const detail = await aiAssetApi.fetchEpisodeDetail(episode.value.id);
      scenes = detail?.scenes ?? [];
    }
    const rows = scenes.map((scene) => ({
      assetSceneId: scene.assetSceneId,
      heading: scene.heading,
      inScript: true,
      location: scene.location,
      originalSceneId: scene.assetSceneId,
      sceneSeq: scene.seq,
    }));
    // 分镜里出现的场次也要能绑；剧本没有的场次标灰提示
    const seqSet = new Set(rows.map((row) => Number(row.sceneSeq)));
    for (const shot of shots.value) {
      const seq = Number(shot.sceneSeq);
      if (!shot.sceneSeq || seqSet.has(seq)) {
        continue;
      }
      seqSet.add(seq);
      rows.push({
        assetSceneId: undefined,
        heading: '',
        inScript: false,
        location: '',
        originalSceneId: undefined,
        sceneSeq: seq,
      });
    }
    sceneBindRows.value = rows.sort((a, b) => a.sceneSeq - b.sceneSeq);
  } catch (error: any) {
    message.error(error?.message || '加载场景绑定失败');
  } finally {
    sceneBindLoading.value = false;
  }
}

async function saveSceneBind(applyToShots = false) {
  if (!episode.value) {
    return;
  }
  const mappings = sceneBindRows.value
    .filter((row) => row.assetSceneId !== undefined && row.assetSceneId !== '')
    .map((row) => ({
      sceneId: row.assetSceneId!,
      sceneSeq: row.sceneSeq,
    }));
  if (!mappings.length) {
    message.warning('请至少绑定一个场次');
    return;
  }
  const changed = sceneBindRows.value.some(
    (row) =>
      row.assetSceneId !== undefined &&
      row.assetSceneId !== '' &&
      String(row.assetSceneId) !== String(row.originalSceneId ?? ''),
  );
  // 按场套用只填空：即使映射没变，只要还有镜头缺场景也允许提交
  const hasUnboundShots = shots.value.some(
    (shot) => shot.sceneSeq && !shot.sceneId,
  );
  if (!changed && !(applyToShots && hasUnboundShots)) {
    sceneBindOpen.value = false;
    message.info('场景绑定无变更');
    return;
  }
  sceneBindSaving.value = true;
  try {
    const res = await aiAssetApi.bindEpisodeScenes({
      applyToShots,
      episodeId: episode.value.id,
      mappings,
    });
    sceneBindOpen.value = false;
    if (applyToShots) {
      await loadStoryboard();
      await loadBindingReport();
      const affected = Number(res?.affectedShots ?? 0);
      message.success(
        affected
          ? `场景已绑定，并已更新 ${affected} 个镜头；资产已标记需重新生成关键帧`
          : '场景已绑定并应用到现有分镜；资产已标记需重新生成关键帧',
      );
    } else {
      await loadEpisode(episode.value);
      await loadStoryboard();
      await loadBindingReport();
      message.success('场景绑定已保存，重新生成分镜后生效');
    }
    const skippedRaw = res?.skippedBoundShots;
    const skipped = Array.isArray(skippedRaw)
      ? skippedRaw.length
      : Number(skippedRaw ?? 0);
    if (skipped > 0) {
      message.warning(
        `已跳过 ${skipped} 个已单独绑定场景的镜头，未被覆盖`,
      );
    }
    const unpersisted = normalizeEpisodeUnpersisted(res?.episodeUnpersisted);
    if (unpersisted.length) {
      message.warning(
        `第 ${unpersisted.join('、')} 场不在剧本中，仅写入了镜头，重新生成分镜后会失效`,
      );
    }
  } catch (error: any) {
    message.error(error?.message || '场景绑定失败');
  } finally {
    sceneBindSaving.value = false;
  }
}

/**
 * 用场次 heading 新建场景资产并自动选中。
 * 场景资产需要带 novelId 才会进入 asset/graph；创建后仍要用户点“保存”才写入绑定。
 */
async function createSceneFromRow(row: {
  assetSceneId?: number | string;
  heading?: string;
  location?: string;
  sceneSeq: number;
}) {
  if (!row.heading) {
    message.warning('该场次缺少标题，无法自动新建');
    return;
  }
  if (creatingSceneSeq.value !== undefined) {
    return;
  }
  creatingSceneSeq.value = row.sceneSeq;
  try {
    const res: any = await aiAssetApi.saveScene({
      location: row.location || row.heading,
      name: row.heading,
      novelId: props.novelId,
    });
    const options = await ensureSceneAssets(true);
    const savedId =
      res?.id ??
      res?.sceneId ??
      (typeof res === 'number' || typeof res === 'string' ? res : undefined) ??
      options.find((item) => item.label === row.heading)?.value;
    if (savedId !== undefined && savedId !== null) {
      row.assetSceneId = savedId;
      message.success('已新建场景资产，点保存写入绑定');
    } else {
      message.success('场景资产已创建，请在下拉中手动选择');
    }
  } catch (error: any) {
    message.error(error?.message || '新建场景资产失败');
  } finally {
    creatingSceneSeq.value = undefined;
  }
}

/** 报告未给出镜头明细时，用当前分镜兜底统计受影响镜头 */
function missingCharacterNames() {
  const names = new Set<string>(bindingReport.value?.characters.unmatched ?? []);
  for (const shot of shots.value) {
    if ((shot.characterIds?.length ?? 0) > 0) {
      continue;
    }
    for (const name of shot.characters ?? []) {
      names.add(name);
    }
  }
  return [...names];
}

function affectedShotCount(name: string) {
  const fromReport =
    bindingReport.value?.shotsMissingCharacter?.filter((row) =>
      row.characters?.includes(name),
    ).length ?? 0;
  if (fromReport > 0) {
    return fromReport;
  }
  return shots.value.filter(
    (shot) =>
      (shot.characterIds?.length ?? 0) === 0 &&
      (shot.characters ?? []).includes(name),
  ).length;
}

/** 本地兜底：按镜头去重，避免一个镜头出现多个角色时重复计数 */
function localAffectedShotCount(names: string[]) {
  const nameSet = new Set(names);
  const fromReport = bindingReport.value?.shotsMissingCharacter?.filter((row) =>
    row.characters?.some((name) => nameSet.has(name)),
  );
  if (fromReport?.length) {
    return new Set(fromReport.map((row) => String(row.shotId))).size;
  }
  return new Set(
    shots.value
      .filter(
        (shot) =>
          (shot.characterIds?.length ?? 0) === 0 &&
          (shot.characters ?? []).some((name) => nameSet.has(name)),
      )
      .map((shot) => String(shot.id)),
  ).size;
}

/** 角色资产图谱只拉一次：绑定弹窗选项、群演分组与报告拆分共用同一份类型数据 */
async function ensureCharacterAssets() {
  if (characterAssetOptions.value.length) {
    return;
  }
  const graph = await aiAssetApi.fetchNovelAssetGraph(props.novelId);
  characterAssetOptions.value = (graph?.characters ?? []).map((item) => ({
    characterType: item.characterType,
    label: item.name,
    value: item.id,
  }));
}

async function openCharacterBind() {
  if (!episode.value) {
    return;
  }
  characterBindOpen.value = true;
  characterBindLoading.value = true;
  extraBindExpanded.value = false;
  try {
    await ensureCharacterAssets();
    const previous = new Map(
      characterBindRows.value.map((row) => [row.name, row.characterId]),
    );
    characterBindRows.value = missingCharacterNames().map((name) => ({
      affected: affectedShotCount(name),
      characterId:
        previous.get(name) ??
        characterAssetOptions.value.find((item) => item.label === name)?.value,
      characterType: characterTypeMap.value.get(name),
      name,
    }));
    if (!characterBindRows.value.length) {
      message.info('当前没有待绑定的角色');
    }
  } catch (error: any) {
    message.error(error?.message || '加载角色资产失败');
  } finally {
    characterBindLoading.value = false;
  }
}

async function saveCharacterBind() {
  if (!episode.value) {
    return;
  }
  // 群演默认折叠：未展开时即使同名预选也不提交，避免用户未确认就绑定
  const rows = extraBindExpanded.value
    ? characterBindRows.value
    : mainCharacterBindRows.value;
  const picked = rows.filter(
    (row) => row.characterId !== undefined && row.characterId !== '',
  );
  if (!picked.length) {
    if (!mainCharacterBindRows.value.length && extraCharacterBindRows.value.length) {
      message.info('群演默认折叠，请先展开群演再选择资产');
    } else {
      message.warning('请至少为一个角色选择资产');
    }
    return;
  }
  const localAffected = localAffectedShotCount(picked.map((row) => row.name));
  characterBindSaving.value = true;
  try {
    const res = await aiAssetApi.bindEpisodeCharacters({
      applyToShots: true,
      episodeId: episode.value.id,
      mappings: picked.map((row) => ({
        characterId: row.characterId!,
        name: row.name,
      })),
    });
    characterBindOpen.value = false;
    await loadStoryboard();
    await loadBindingReport();
    const affected = Number(res?.affectedShots ?? localAffected);
    message.success(
      `已绑定 ${picked.length} 个角色${affected ? `，已更新 ${affected} 个镜头并标记需重新生成关键帧` : ''}`,
    );
  } catch (error: any) {
    message.error(error?.message || '角色绑定失败');
  } finally {
    characterBindSaving.value = false;
  }
}

/** 镜头卡上展示未绑定角色名：无 characterIds 视作全部未绑 */
function unboundNamesOf(shot: ShotItem) {
  const names = shot.characters ?? [];
  if (!names.length) {
    return [];
  }
  if ((shot.characterIds?.length ?? 0) === 0) {
    return names;
  }
  return names.filter((name) => unboundNames.value.has(name));
}

async function generateStoryboard() {
  if (!episode.value || !requireModel()) {
    return;
  }
  storyboardGenerating.value = true;
  try {
    const res = await aiAssetApi.generateStoryboard({
      episodeId: episode.value.id,
      modelId: modelId.value!,
      replace: true,
      requirements: plotDirection.value || undefined,
    });
    storyboardToken += 1;
    shots.value = res?.shots ?? [];
    const binding = normalizeBindingReport(res?.binding);
    if (binding) {
      bindingReport.value = binding;
    } else {
      void loadBindingReport();
    }
    tab.value = 'storyboard';
    const summary = binding
      ? `；角色 ${binding.characters.bound}/${binding.characters.total} 已绑定，场景 ${binding.scenes.bound}/${binding.scenes.total} 已绑定`
      : '';
    const hasMissing =
      (binding?.characters.unmatched.length ?? 0) +
        (binding?.scenes.unmatched.length ?? 0) >
      0;
    if (hasMissing) {
      message.warning(
        `已生成 ${res?.shotCount ?? shots.value.length} 个镜头${summary}；未匹配项可在状态条补绑`,
      );
    } else {
      message.success(
        `已生成 ${res?.shotCount ?? shots.value.length} 个镜头${summary}`,
      );
    }
  } catch (error: any) {
    message.error(error?.message || '生成分镜失败');
  } finally {
    storyboardGenerating.value = false;
  }
}

const SHOT_TYPE_LABEL: Record<string, string> = {
  'close-up': '特写',
  close: '近景',
  establishing: '建立镜头',
  insert: '插入',
  medium: '中景',
  over_shoulder: '过肩',
  pov: '主观',
  wide: '远景',
};

const CAMERA_LABEL: Record<string, string> = {
  dolly: '移动',
  handheld: '手持',
  pan: '摇镜',
  pull: '拉镜',
  push: '推镜',
  static: '固定',
  tilt: '俯仰',
  tracking: '跟拍',
  zoom: '缩放',
};

function shotTypeLabel(value?: string) {
  return value ? (SHOT_TYPE_LABEL[value] ?? value) : '';
}

function cameraLabel(value?: string) {
  return value ? (CAMERA_LABEL[value] ?? value) : '';
}

function sceneOf(shot: ShotItem) {
  if (shot.sceneSeq === undefined || shot.sceneSeq === null) {
    return undefined;
  }
  return episode.value?.scenes?.find(
    (scene) => Number(scene.seq) === Number(shot.sceneSeq),
  );
}

function needsKeyframe(shot: ShotItem) {
  const hasPeople =
    (shot.characterIds?.length ?? 0) > 0 ||
    (shot.characters?.length ?? 0) > 0 ||
    Boolean(shot.dialogue) ||
    shot.blankShot === 0;
  return hasPeople && !shot.imageMaterialId;
}

function isBlankCandidate(shot: ShotItem) {
  return (
    (shot.characterIds?.length ?? 0) === 0 &&
    (shot.characters?.length ?? 0) === 0 &&
    !shot.dialogue
  );
}

function canConvertToPersonShot(shot: ShotItem) {
  return (shot.characterIds?.length ?? 0) > 0;
}

function findShot(id?: number | string) {
  if (id === undefined) {
    return undefined;
  }
  return shots.value.find((item) => String(item.id) === String(id));
}

async function saveShotField(shot: ShotItem, patch: Record<string, any>) {
  if (!episode.value) {
    return;
  }
  try {
    await aiAssetApi.saveShot({
      episodeId: episode.value.id,
      id: shot.id,
      novelId: props.novelId,
      ...patch,
    });
    await loadStoryboard();
    message.success('已保存');
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  }
}

function handleIssue(issue: StoryboardIssue) {
  const shot = findShot(issue.shotId);
  if (issue.type === 'character_unresolved') {
    void openCharacterBind();
    return;
  }
  if (['character_no_image', 'character_tags_drift'].includes(issue.type)) {
    openAssetGraph();
    return;
  }
  if (['scene_seq_missing', 'scene_unresolved'].includes(issue.type)) {
    void openSceneBind();
    return;
  }
  if (['scene_no_image', 'scene_tags_drift'].includes(issue.type)) {
    openAssetGraph();
    return;
  }
  if (issue.type === 'blank_unconfirmed' && shot) {
    void saveShotField(shot, { blankShot: 1 });
    return;
  }
  if (issue.type === 'asset_stale' && shot) {
    void generateShotKeyframe(shot);
    return;
  }
  if (['keyframe_missing', 'missing_keyframe'].includes(issue.type) && shot) {
    void generateShotKeyframe(shot);
    return;
  }
  if (issue.type === 'prompt_no_character' && shot) {
    openPrompt(shot);
    return;
  }
  if (issue.type === 'dialogue_too_long' && shot) {
    openPrompt(shot);
    return;
  }
  if (issue.type === 'video_missing') {
    validationOpen.value = false;
    void openBatch('video', 'new');
  }
}

const ISSUE_ACTION_LABELS: Record<string, string> = {
  asset_stale: '重新生成关键帧',
  blank_unconfirmed: '确认空镜',
  character_no_image: '去资产编辑',
  character_tags_drift: '去资产编辑',
  character_unresolved: '补绑角色',
  dialogue_too_long: '编辑提示词',
  keyframe_missing: '生成关键帧',
  prompt_no_character: '编辑提示词',
  scene_no_image: '去资产编辑',
  scene_seq_missing: '补绑场景',
  scene_tags_drift: '去资产编辑',
  scene_unresolved: '补绑场景',
  video_missing: '去生成视频',
};

function issueActionLabel(type: string) {
  return ISSUE_ACTION_LABELS[type] ?? '';
}

/** video_missing 统一文案：第 N 镜缺少视频 */
function issueMessage(issue: StoryboardIssue) {
  if (issue.type === 'video_missing') {
    return `第 ${issue.seq ?? '-'} 镜缺少视频`;
  }
  return issue.message;
}

/** 群演未出图属于提示而非错误，校验面板用灰色标签，避免铺天盖地标红 */
function issueTag(issue: StoryboardIssue) {
  if (issue.type === 'extra_character_no_image') {
    return { color: undefined, text: '提示' };
  }
  return issue.level === 'error'
    ? { color: 'red', text: '错误' }
    : { color: 'orange', text: '警告' };
}

function isKeyframeGenerating(shot: ShotItem) {
  return (
    keyframeGenerating.value === String(shot.id) ||
    (Number(shot.generationStatus) === 1 && !shot.imageMaterialId)
  );
}

/** 单镜关键帧提交：只负责提交/合并/轮询 */
async function submitShotKeyframe(shot: ShotItem) {
  const updated = await aiAssetApi.generateShotImage({
    promptOverride: shot.imagePrompt || undefined,
    shotId: shot.id,
  });
  if (updated) {
    mergeShot(updated);
  }
  stopShotPoll(shot.id);
  shotPollers.set(
    String(shot.id),
    setTimeout(() => void pollShot(shot.id), 2000),
  );
  return updated;
}

async function generateShotKeyframe(shot: ShotItem) {
  if (isKeyframeGenerating(shot)) {
    return;
  }
  if (keyframeBusy.value) {
    message.info('关键帧批量任务进行中，请等待完成');
    return;
  }
  if (shot.sceneSeq && !shot.sceneId) {
    message.warning('请先绑定场景，再生成关键帧');
    void toggleShotScenePick(shot, true);
    return;
  }
  keyframeGenerating.value = String(shot.id);
  try {
    await submitShotKeyframe(shot);
    message.success('关键帧任务已提交');
  } catch (error: any) {
    if (!(await focusShotSceneByError(error))) {
      message.error(error?.message || '生成关键帧失败，请先补齐角色/场景图片');
    }
  } finally {
    keyframeGenerating.value = undefined;
  }
}

/** 单镜视频提交：只负责提交/合并/轮询 */
async function submitShotVideo(shot: ShotItem) {
  const updated = await aiAssetApi.generateShotVideo({
    duration: shot.durationSeconds,
    promptOverride: shot.videoPrompt || undefined,
    shotId: shot.id,
  });
  if (updated) {
    mergeShot(updated);
  }
  stopShotPoll(shot.id);
  shotPollers.set(
    String(shot.id),
    setTimeout(() => void pollShot(shot.id), 2000),
  );
  return updated;
}

/**
 * 批量计划接口未就绪时的本地粗筛：只做明显可判断的规则，
 * 最终 eligibility 以后端计划接口为准，避免与单镜校验漂移。
 */
function localBatchPlan(
  target: StoryboardBatchTarget,
  mode: StoryboardBatchMode,
): StoryboardBatchPlan {
  const eligible: StoryboardBatchPlanItem[] = [];
  const skipped: StoryboardBatchSkippedItem[] = [];
  for (const shot of shots.value) {
    const base = { seq: Number(shot.seq ?? 0), shotId: shot.id };
    // 空镜绝不自动确认：未确认的一律跳过，由用户先手动确认
    if (isBlankCandidate(shot) && shot.blankShot == null) {
      skipped.push({ ...base, reason: 'blank_unconfirmed' });
      continue;
    }
    if (Number(shot.generationStatus) === 1) {
      skipped.push({ ...base, reason: 'generating' });
      continue;
    }
    const unboundCharacter =
      ((shot.characters?.length ?? 0) > 0 || shot.blankShot === 0) &&
      (shot.characterIds?.length ?? 0) === 0;
    if (unboundCharacter) {
      skipped.push({ ...base, reason: 'character_unbound' });
      continue;
    }
    if (shot.sceneSeq && !shot.sceneId) {
      skipped.push({ ...base, reason: 'scene_unbound' });
      continue;
    }
    if (target === 'keyframe') {
      if (mode === 'new' && shot.imageMaterialId) {
        skipped.push({ ...base, reason: 'already_has_image' });
        continue;
      }
      if (mode === 'stale' && !shot.assetsStale) {
        skipped.push({ ...base, reason: 'not_stale' });
        continue;
      }
      eligible.push(base);
      continue;
    }
    if (mode === 'new' && (shot.hasVideo || shot.videoMaterialId)) {
      skipped.push({ ...base, reason: 'already_has_video' });
      continue;
    }
    if (!shot.imageMaterialId) {
      skipped.push({ ...base, reason: 'no_keyframe' });
      continue;
    }
    eligible.push(base);
  }
  return { eligible, mode, skipped, target };
}

/** 后端计划优先；接口未就绪时静默降级本地粗筛（不输出错误日志） */
async function fetchBatchPlan(
  target: StoryboardBatchTarget,
  mode: StoryboardBatchMode,
): Promise<StoryboardBatchPlan> {
  if (!episode.value) {
    return localBatchPlan(target, mode);
  }
  try {
    const res = await aiAssetApi.fetchStoryboardBatchPlan({
      episodeId: episode.value.id,
      mode,
      target,
    });
    if (res && Array.isArray(res.eligible) && Array.isArray(res.skipped)) {
      return res;
    }
  } catch {
    // 计划接口未就绪：直接走本地粗筛，控制台不报错
  }
  return localBatchPlan(target, mode);
}

async function openBatch(
  target: StoryboardBatchTarget,
  mode: StoryboardBatchMode,
) {
  if (!episode.value || batchPlanLoading.value) {
    return;
  }
  batchPlanLoading.value = true;
  batchPlanLoadingTarget.value = `${target}-${mode}`;
  try {
    const plan = await fetchBatchPlan(target, mode);
    if (!plan.eligible.length) {
      message.info(
        `没有需要生成的镜头${plan.skipped.length ? `，跳过 ${plan.skipped.length} 个` : ''}`,
      );
      return;
    }
    batchPlan.value = plan;
    batchTarget.value = target;
    batchMode.value = mode;
    batchShowSkipped.value = false;
    batchConfirmOpen.value = true;
  } finally {
    batchPlanLoading.value = false;
    batchPlanLoadingTarget.value = undefined;
  }
}

function batchTaskOptionLabel(task: BatchTaskState) {
  return (
    BATCH_TASK_OPTION_LABELS[task.optionType ?? ''] ??
    task.optionType ??
    '批量任务'
  );
}

function batchTaskStatusLabel(status?: number) {
  return BATCH_STATUS_MAP[Number(status ?? 0)] ?? '未知';
}

function toBatchTaskState(
  active: StoryboardBatchActiveResult,
  target: StoryboardBatchTarget,
): BatchTaskState {
  return {
    batchTaskStatus: Number(active.taskStatus ?? 1),
    failedCount: Number(active.failedCount ?? 0),
    items: [],
    optionType: active.optionType,
    pendingCount: Number(active.pendingCount ?? 0),
    progressPercent: Number(active.progressPercent ?? 0),
    skipped: [],
    successCount: Number(active.successCount ?? 0),
    target,
    taskId: active.taskId,
    totalCount: Number(active.totalCount ?? 0),
  };
}

function stopBatchTaskPoll(taskId: number | string) {
  const key = String(taskId);
  const timer = batchTaskTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    batchTaskTimers.delete(key);
  }
}

function stopAllBatchTaskPolls() {
  for (const timer of batchTaskTimers.values()) {
    clearTimeout(timer);
  }
  batchTaskTimers.clear();
  batchTaskPollFails.clear();
}

function isBatchPanelExpanded(task: BatchTaskState) {
  return batchExpandedIds.value.includes(String(task.taskId));
}

function toggleBatchPanel(task: BatchTaskState) {
  const key = String(task.taskId);
  batchExpandedIds.value = isBatchPanelExpanded(task)
    ? batchExpandedIds.value.filter((id) => id !== key)
    : [...batchExpandedIds.value, key];
}

function isBatchFailuresExpanded(task: BatchTaskState) {
  return batchFailuresExpandedIds.value.includes(String(task.taskId));
}

function toggleBatchFailures(task: BatchTaskState) {
  const key = String(task.taskId);
  batchFailuresExpandedIds.value = isBatchFailuresExpanded(task)
    ? batchFailuresExpandedIds.value.filter((id) => id !== key)
    : [...batchFailuresExpandedIds.value, key];
}

/** 任务中心明细里 code=0 为成功，非 0 / FAILED 均为失败 */
function batchFailedItems(task: BatchTaskState) {
  return task.items.filter(
    (item) => Number(item.code ?? 0) !== 0 || item.result === 'FAILED',
  );
}

function batchFailureLabel(item: TaskBatchCenterDetailItem) {
  const seq = item.requestParams?.seq ?? item.targetIds?.[0] ?? '-';
  const shotId = item.targetIds?.[0] ?? '-';
  return `第 ${seq} 镜（${shotId}）：${item.message || '未知错误'}`;
}

/** 页面不可见时暂停轮询，回到页面立即补拉一次进行中的任务 */
function handlePageVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    for (const timer of batchTaskTimers.values()) {
      clearTimeout(timer);
    }
    batchTaskTimers.clear();
    return;
  }
  for (const task of batchTasks.value) {
    if (
      isBatchTaskRunning(task.batchTaskStatus) &&
      !batchTaskTimers.has(String(task.taskId))
    ) {
      void pollBatchTaskOnce(task.taskId);
    }
  }
}

/**
 * 后端批次任务进度轮询：3s 一次，taskStatus 3/4 停止并刷新分镜/绑定报告。
 * 任务在后端执行，页面切走/刷新不影响；这里只负责展示。
 */
async function pollBatchTaskOnce(taskId: number | string) {
  const key = String(taskId);
  const currentEpisodeId = episode.value?.id;
  if (!currentEpisodeId) {
    return;
  }
  const index = batchTasks.value.findIndex(
    (task) => String(task.taskId) === key,
  );
  if (index < 0) {
    return;
  }
  try {
    const progress = await taskCenterApi.fetchGetTaskProgress(taskId);
    batchTaskPollFails.delete(key);
    if (String(episode.value?.id) !== String(currentEpisodeId)) {
      return;
    }
    const state = batchTasks.value[index];
    if (!state) {
      return;
    }
    const next: BatchTaskState = {
      ...state,
      batchTaskStatus: Number(progress.taskStatus ?? state.batchTaskStatus),
      failedCount: Number(progress.failedCount ?? state.failedCount),
      items: progress.items ?? state.items,
      optionType: progress.optionType ?? state.optionType,
      pendingCount: Number(progress.pendingCount ?? state.pendingCount),
      progressPercent: Number(
        progress.progressPercent ?? state.progressPercent,
      ),
      successCount: Number(progress.successCount ?? state.successCount),
      totalCount: Number(progress.totalCount ?? state.totalCount),
    };
    batchTasks.value[index] = next;
    if (isBatchTaskRunning(next.batchTaskStatus)) {
      scheduleBatchTaskPoll(taskId);
      return;
    }
    stopBatchTaskPoll(taskId);
    if (next.failedCount > 0) {
      // 有失败时自动展开，避免用户只看到“失败 N 个”
      if (!batchExpandedIds.value.includes(key)) {
        batchExpandedIds.value = [...batchExpandedIds.value, key];
      }
      if (!batchFailuresExpandedIds.value.includes(key)) {
        batchFailuresExpandedIds.value = [...batchFailuresExpandedIds.value, key];
      }
    }
    await loadStoryboard();
    await loadBindingReport();
    if (next.batchTaskStatus === 3) {
      message.success('批量任务已完成');
    } else {
      message.error('批量任务执行失败');
    }
  } catch {
    // 连续失败 5 次后停止，避免网络异常时无限轮询
    const fails = (batchTaskPollFails.get(key) ?? 0) + 1;
    batchTaskPollFails.set(key, fails);
    if (fails <= 5) {
      scheduleBatchTaskPoll(taskId);
    } else {
      message.error('批量任务进度查询失败，请稍后刷新');
    }
  }
}

function scheduleBatchTaskPoll(taskId: number | string) {
  stopBatchTaskPoll(taskId);
  if (document.visibilityState === 'hidden') {
    return;
  }
  batchTaskTimers.set(
    String(taskId),
    setTimeout(() => void pollBatchTaskOnce(taskId), BATCH_TASK_POLL_INTERVAL),
  );
}

/** 进入分镜页恢复：keyframe/video 各查一次活动任务，有则直接展示并轮询 */
async function loadActiveBatchTasks() {
  if (!USE_SERVER_BATCH) {
    return;
  }
  const current = episode.value;
  if (!current) {
    return;
  }
  const targets: StoryboardBatchTarget[] = ['keyframe', 'video'];
  const results = await Promise.allSettled(
    targets.map((target) =>
      aiAssetApi.fetchActiveStoryboardBatch({
        episodeId: current.id,
        target,
      }),
    ),
  );
  if (String(episode.value?.id) !== String(current.id)) {
    return;
  }
  const remote: BatchTaskState[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      remote.push(toBatchTaskState(result.value, targets[index]!));
    }
  });
  // 保留刚提交任务带回来的 skipped 明细，按 taskId 与后端进度合并
  const merged = new Map(
    batchTasks.value.map((task) => [String(task.taskId), task]),
  );
  for (const task of remote) {
    const localTask = merged.get(String(task.taskId));
    merged.set(String(task.taskId), {
      ...task,
      items: localTask?.items ?? task.items,
      skipped: localTask?.skipped ?? [],
    });
  }
  batchTasks.value = [...merged.values()];
  for (const task of remote) {
    if (isBatchTaskRunning(task.batchTaskStatus)) {
      scheduleBatchTaskPoll(task.taskId);
    }
  }
}

/**
 * 本地备用执行器：仅 USE_SERVER_BATCH=false 时使用。
 * 同步模型不能一次跑完整批，所以并发 2 逐镜提交；单镜失败不中断整批。
 */
async function runLocalBatch(plan: StoryboardBatchPlan) {
  if (!episode.value || localBatchRunning.value) {
    return;
  }
  const token = ++localBatchToken;
  localBatchRunning.value = true;
  localBatchTarget.value = plan.target;
  localBatchTotal.value = plan.eligible.length;
  localBatchDone.value = 0;
  localBatchSuccess.value = 0;
  localBatchFailed.value = 0;
  localBatchFailures.value = [];

  const queue = [...plan.eligible];
  let cursor = 0;
  const runOne = async (item: StoryboardBatchPlanItem) => {
    if (token !== localBatchToken) {
      return;
    }
    const shot = findShot(item.shotId);
    if (!shot) {
      localBatchFailed.value += 1;
      localBatchDone.value += 1;
      localBatchFailures.value.push({
        message: '镜头已不存在，请刷新后重试',
        seq: item.seq,
        shotId: item.shotId,
      });
      return;
    }
    try {
      if (plan.target === 'keyframe') {
        await submitShotKeyframe(shot);
      } else {
        await submitShotVideo(shot);
      }
      if (token === localBatchToken) {
        localBatchSuccess.value += 1;
      }
    } catch (error: any) {
      if (token === localBatchToken) {
        localBatchFailed.value += 1;
        localBatchFailures.value.push({
          message: error?.message || '提交失败',
          seq: item.seq,
          shotId: item.shotId,
        });
      }
    } finally {
      if (token === localBatchToken) {
        localBatchDone.value += 1;
      }
    }
  };
  const worker = async () => {
    while (token === localBatchToken) {
      const item = queue[cursor++];
      if (!item) {
        return;
      }
      await runOne(item);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(2, queue.length) }, () => worker()),
  );
  if (token !== localBatchToken) {
    return;
  }
  localBatchRunning.value = false;
  await loadStoryboard();
  await loadBindingReport();
}

async function submitStoryboardBatch() {
  const plan = batchPlan.value;
  const current = episode.value;
  if (!plan || !current) {
    return;
  }
  if (
    (batchTarget.value === 'keyframe' && keyframeBusy.value) ||
    (batchTarget.value === 'video' && videoBusy.value)
  ) {
    batchConfirmOpen.value = false;
    message.info('该分集已有进行中的批次，已为你打开进度');
    return;
  }
  batchConfirmOpen.value = false;
  if (!USE_SERVER_BATCH) {
    await runLocalBatch(plan);
    return;
  }
  batchSubmitting.value = true;
  try {
    const res = await aiAssetApi.submitStoryboardBatch({
      duration: null,
      episodeId: current.id,
      mode: batchMode.value,
      modelId: null,
      target: batchTarget.value,
    });
    const index = batchTasks.value.findIndex(
      (task) => String(task.taskId) === String(res.taskId),
    );
    const previous = index >= 0 ? batchTasks.value[index] : undefined;
    const next: BatchTaskState = {
      batchTaskStatus: previous?.batchTaskStatus ?? 1,
      existing: res.existing,
      failedCount: previous?.failedCount ?? 0,
      items: previous?.items ?? [],
      optionType: res.optionType,
      pendingCount: res.totalCount,
      progressPercent: previous?.progressPercent ?? 0,
      skipped: res.skipped ?? [],
      successCount: previous?.successCount ?? 0,
      target: res.target,
      taskId: res.taskId,
      totalCount: res.totalCount,
    };
    if (index >= 0) {
      batchTasks.value[index] = next;
    } else {
      batchTasks.value = [...batchTasks.value, next];
    }
    message.success(
      res.existing
        ? '该分集已有进行中的批次，已为你打开进度'
        : '批量任务已提交，可在任务中心查看',
    );
    // 复用旧任务时主动拉一次 active，立即拿到已有计数
    if (res.existing) {
      await loadActiveBatchTasks();
    }
    scheduleBatchTaskPoll(res.taskId);
    await loadStoryboard();
    await loadBindingReport();
  } catch (error: any) {
    message.error(error?.message || '提交批量任务失败');
  } finally {
    batchSubmitting.value = false;
  }
}

function dismissBatchTask(task: BatchTaskState) {
  if (isBatchTaskRunning(task.batchTaskStatus)) {
    return;
  }
  stopBatchTaskPoll(task.taskId);
  batchTasks.value = batchTasks.value.filter(
    (item) => String(item.taskId) !== String(task.taskId),
  );
}

async function runValidation() {
  if (!episode.value) {
    return;
  }
  validationLoading.value = true;
  try {
    validationResult.value = await aiAssetApi.validateStoryboard(
      episode.value.id,
    );
    validationWarningsOpen.value = false;
    validationOpen.value = true;
  } catch (error: any) {
    message.error(error?.message || '一致性校验失败');
  } finally {
    validationLoading.value = false;
  }
}

function promptHasCharacter(shot: ShotItem) {
  const names = [
    ...(shot.characters ?? []),
    ...(sceneOf(shot)?.characters ?? []),
  ].filter(Boolean);
  if (names.length === 0) {
    return true;
  }
  const prompt = shot.videoPrompt ?? '';
  return names.some((name) => prompt.includes(name));
}

function openPrompt(shot: ShotItem) {
  Object.assign(promptForm, {
    camera: shot.camera ?? '',
    description: shot.description ?? '',
    dialogue: shot.dialogue ?? '',
    durationSeconds: shot.durationSeconds ?? 0,
    id: shot.id,
    imagePrompt: shot.imagePrompt ?? '',
    sceneSeq: shot.sceneSeq ?? 0,
    seq: shot.seq ?? 0,
    shotType: shot.shotType ?? '',
    videoPrompt: shot.videoPrompt ?? '',
  });
  promptOpen.value = true;
}

async function savePrompt() {
  if (!episode.value) {
    return;
  }
  promptSaving.value = true;
  try {
    await aiAssetApi.saveShot({
      camera: promptForm.camera || undefined,
      description: promptForm.description || undefined,
      dialogue: promptForm.dialogue || undefined,
      durationSeconds: Number(promptForm.durationSeconds) || undefined,
      episodeId: episode.value.id,
      id: promptForm.id,
      imagePrompt: promptForm.imagePrompt || undefined,
      novelId: props.novelId,
      sceneSeq: promptForm.sceneSeq || undefined,
      seq: promptForm.seq || undefined,
      shotType: promptForm.shotType || undefined,
      videoPrompt: promptForm.videoPrompt || undefined,
    });
    promptOpen.value = false;
    await loadStoryboard();
    message.success('镜头提示词已保存');
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  } finally {
    promptSaving.value = false;
  }
}

function shotStatus(shot: ShotItem) {
  const status = Number(shot.generationStatus ?? 0);
  if (status === 1) return { color: 'blue', label: '视频生成中' };
  if (status === 2) return { color: 'green', label: '有图片' };
  if (status === 3) return { color: 'green', label: '视频完成' };
  if (status === 5) return { color: 'red', label: '生成失败' };
  return { color: 'default', label: '未生成' };
}

function mergeShot(updated: ShotItem) {
  const index = shots.value.findIndex(
    (item) => String(item.id) === String(updated.id),
  );
  if (index >= 0) {
    shots.value[index] = { ...shots.value[index], ...updated };
  }
}

function stopShotPoll(id: number | string) {
  const key = String(id);
  const timer = shotPollers.get(key);
  if (timer) {
    clearTimeout(timer);
    shotPollers.delete(key);
  }
}

async function pollShot(id: number | string) {
  try {
    const detail = await aiAssetApi.fetchShotDetail(id);
    if (detail) {
      mergeShot(detail);
      const status = Number(detail.generationStatus);
      const imagePending =
        detail.imageTaskId != null && !detail.imageMaterialId && status !== 5;
      if (status === 1 || imagePending) {
        shotPollers.set(
          String(id),
          setTimeout(() => void pollShot(id), 3000),
        );
      } else {
        stopShotPoll(id);
      }
    }
  } catch {
    stopShotPoll(id);
  }
}

function openShotBind(shot: ShotItem, field: 'image' | 'video') {
  shotBind.value = { field, shot };
  const currentId = field === 'image' ? shot.imageMaterialId : shot.videoMaterialId;
  shotDrawerApi.setData({
    hint: '选择 1 个素材绑定到当前镜头，确定后立即生效',
    max: 1,
    selected: currentId
      ? [
          {
            description: '',
            id: currentId,
            name: shot.seq ? `镜头 ${shot.seq}` : '镜头',
            url: field === 'image' ? shot.imageThumbnailUrl || shot.imageUrl || '' : shot.videoThumbnailUrl || shot.videoUrl || '',
          },
        ]
      : [],
    sources: ['workspace'],
    title: field === 'image' ? '绑定镜头图片' : '绑定镜头视频',
  });
  shotDrawerApi.open();
}

async function onShotMaterialPicked(refs: RefAsset[]) {
  const target = shotBind.value;
  const picked = refs[0];
  if (!target || !picked) {
    return;
  }
  try {
    await aiAssetApi.bindShotMaterial({
      id: target.shot.id,
      imageMaterialId:
        target.field === 'image'
          ? picked.id
          : target.shot.imageMaterialId ?? null,
      videoMaterialId:
        target.field === 'video'
          ? picked.id
          : target.shot.videoMaterialId ?? null,
    });
    await loadStoryboard();
    message.success('已绑定');
  } catch (error: any) {
    message.error(error?.message || '绑定失败');
  }
}

async function unbindShot(shot: ShotItem, field: 'image' | 'video') {
  try {
    await aiAssetApi.bindShotMaterial({
      id: shot.id,
      imageMaterialId:
        field === 'image' ? null : shot.imageMaterialId ?? null,
      videoMaterialId:
        field === 'video' ? null : shot.videoMaterialId ?? null,
    });
    await loadStoryboard();
    message.success('已解绑');
  } catch (error: any) {
    message.error(error?.message || '解绑失败');
  }
}

async function generateShotVideo(shot: ShotItem) {
  if (Number(shot.generationStatus) === 1) {
    message.info('该镜头视频正在生成中');
    return;
  }
  if (videoBusy.value) {
    message.info('视频批量任务进行中，请等待完成');
    return;
  }
  if (shot.sceneSeq && !shot.sceneId) {
    message.warning('请先绑定场景，再生成视频');
    void toggleShotScenePick(shot, true);
    return;
  }
  if (isBlankCandidate(shot) && shot.blankShot == null) {
    message.warning('空镜镜头需先确认；转人物镜头前请先绑定角色');
    return;
  }
  if (needsKeyframe(shot)) {
    message.warning('人物/台词镜头请先生成关键帧，再生成视频');
    return;
  }
  try {
    await submitShotVideo(shot);
    message.success('视频任务已提交，正在生成');
  } catch (error: any) {
    if (!(await focusShotSceneByError(error))) {
      message.error(error?.message || '视频生成失败');
    }
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
  return saveDraft(false, {}, true);
}

async function generateMemory(force = false) {
  if (!episode.value || memoryLoading.value) {
    return;
  }
  memoryLoading.value = true;
  memoryPending.value = true;
  try {
    const updated = await aiAssetApi.generateEpisodeMemory({
      episodeId: episode.value.id,
      force,
      modelId: modelId.value || undefined,
    });
    if (updated?.memory !== undefined) {
      episode.value = {
        ...episode.value,
        hasMemory: true,
        memory: updated.memory,
      };
      updateEpisodeRow(episode.value);
      memoryStale.value = false;
    }
    if (force) {
      message.success('章节记忆已更新');
    }
  } catch (error: any) {
    if (force) {
      message.error(error?.message || '生成章节记忆失败');
    }
  } finally {
    memoryLoading.value = false;
    memoryPending.value = false;
  }
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
    planOpen.value = true;
  } catch (error: any) {
    message.error(error?.message || '生成章节规划失败');
  } finally {
    planLoading.value = false;
  }
}

async function applyPlan() {
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

function openScript() {
  if (!episode.value) {
    return;
  }
  scriptDuration.value = book.value?.episodeDuration || 90;
  scriptReq.value = '';
  scriptOpen.value = true;
}

async function submitScript() {
  if (!episode.value || !requireModel()) {
    return;
  }
  scriptSaving.value = true;
  try {
    const updated = await aiAssetApi.generateEpisodeScript({
      autoExtractAssets: autoExtractAssets.value,
      modelId: modelId.value!,
      episodeId: episode.value.id,
      durationSeconds: scriptDuration.value,
      requirements: scriptReq.value || undefined,
    });
    episode.value = { ...episode.value, ...updated };
    updateEpisodeRow(episode.value);
    tab.value = 'script';
    scriptOpen.value = false;
    message.success(autoExtractAssets.value ? '剧本已生成，并已提炼资产' : '剧本已生成');
  } catch (error: any) {
    message.error(error?.message || '生成剧本失败');
  } finally {
    scriptSaving.value = false;
  }
}

async function submitBatch() {
  if (!requireModel()) {
    return;
  }
  batchSaving.value = true;
  try {
    await aiAssetApi.generateEpisodes({
      count: batchCount.value,
      modelId: modelId.value!,
      novelId: props.novelId,
      requirements: batchReq.value || undefined,
    });
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
  document.addEventListener('visibilitychange', handlePageVisibilityChange);
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
            <Tag v-if="book?.genres?.length" :bordered="false">
              {{ book?.genres?.join(' · ') }}
            </Tag>
          </div>
          <div class="nwb-sub">
            {{ book?.episodeCount || stats.total }} 集 ·
            {{ (book?.wordCount || 0).toLocaleString() }} 字 ·
            {{ book?.episodeDuration || 90 }} 秒 / 集
          </div>
        </div>
        <div class="nwb-actions">
          <Button @click="openAssetGraph">设定资产</Button>
          <Button :disabled="!episodes.length" @click="batchOpen = true">
            <template #icon><PlusOutlined /></template>批量生成分集
          </Button>
          <Button :loading="storyboardGenerating" @click="generateStoryboard">
            <template #icon><PlayCircleOutlined /></template>生成分镜
          </Button>
          <Button @click="message.info('导出在前端实现，待接入')">
            <template #icon><ExportOutlined /></template>导出
          </Button>
        </div>
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
                    <span :class="{ done: item.script }">
                      {{ item.script ? '剧本已生成' : item.content ? '正文已写' : '待创作' }}
                    </span>
                  </span>
                  <i class="nwb-dot" :class="{ done: item.script }"></i>
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
                { key: 'script', label: '剧本' },
                { key: 'storyboard', label: '分镜' },
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
            <Button
              v-if="episode && tab === 'script'"
              size="small"
              :loading="extractLoading"
              @click="runExtract"
            >
              <template #icon><BranchesOutlined /></template>抽取设定
            </Button>
            <Button
              v-if="episode && tab === 'script'"
              size="small"
              :loading="episodeLoading"
              @click="openScript"
            >
              生成剧本
            </Button>
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
                <Button size="small" :loading="aiLoading === 'continue'" @click="runAi('continue')">
                  <template #icon><ThunderboltOutlined /></template>AI 续写
                </Button>
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

            <div v-else-if="tab === 'storyboard'" class="nwb-doc sb">
              <div class="sb-head">
                <div>
                  <h3>分镜 · 第 {{ episode.seq }} 集</h3>
                  <span class="nwb-tip">
                    按 scenes → script → content → summary 生成，共 {{ shots.length }} 个镜头；
                    生成时自动匹配人物/场景资产，未匹配项可在下方状态条补绑（无需重新生成）
                  </span>
                </div>
                <div class="sb-head__actions">
                  <Button size="small" :loading="characterBindLoading" @click="openCharacterBind">
                    角色绑定
                  </Button>
                  <Button size="small" :loading="sceneBindLoading" @click="openSceneBind">
                    场景绑定
                  </Button>
                  <Button size="small" :loading="validationLoading" @click="runValidation">
                    一致性校验
                  </Button>
                  <Button size="small" :loading="shotsLoading" @click="loadStoryboard">
                    刷新
                  </Button>
                  <span class="sb-batch-entry">
                    <Button
                      size="small"
                      :disabled="batchPlanLoading || keyframeBusy"
                      :loading="batchPlanLoadingTarget === 'keyframe-new'"
                      @click="openBatch('keyframe', 'new')"
                    >
                      {{
                        keyframeTask
                          ? `关键帧 ${keyframeTask.successCount + keyframeTask.failedCount}/${keyframeTask.totalCount}`
                          : '批量关键帧'
                      }}
                    </Button>
                    <em>{{ batchModelLabel }} · 约 {{ keyframeEstimate }} 镜</em>
                  </span>
                  <span class="sb-batch-entry">
                    <Button
                      size="small"
                      :disabled="batchPlanLoading || videoBusy"
                      :loading="batchPlanLoadingTarget === 'video-new'"
                      @click="openBatch('video', 'new')"
                    >
                      {{
                        videoTask
                          ? `视频 ${videoTask.successCount + videoTask.failedCount}/${videoTask.totalCount}`
                          : '批量视频'
                      }}
                    </Button>
                    <em>{{ batchModelLabel }} · 约 {{ videoEstimate }} 镜</em>
                  </span>
                  <Dropdown
                    :disabled="batchPlanLoading || keyframeBusy"
                    :trigger="['click']"
                  >
                    <Button size="small">
                      批量重生成
                      <DownOutlined />
                    </Button>
                    <template #overlay>
                      <Menu>
                        <MenuItem @click="openBatch('keyframe', 'stale')">
                          关键帧（资产已更新）
                        </MenuItem>
                      </Menu>
                    </template>
                  </Dropdown>
                  <Button size="small" :loading="storyboardGenerating" @click="generateStoryboard">
                    <template #icon><PlayCircleOutlined /></template>
                    {{ shots.length ? '重新生成' : '生成分镜' }}
                  </Button>
                </div>
              </div>

              <!-- 后端批次任务进度：离开页面任务继续跑，这里只展示不提供假停止 -->
              <div
                v-for="task in batchTasks"
                :key="task.taskId"
                class="sb-batch"
                :class="{
                  'is-done': task.batchTaskStatus === 3,
                  'is-failed': task.batchTaskStatus === 4,
                }"
              >
                <div class="sb-batch__row">
                  <span class="sb-batch__text">
                    {{ batchTaskOptionLabel(task) }} ·
                    {{ batchTaskStatusLabel(task.batchTaskStatus) }}
                    <b>{{ task.successCount + task.failedCount }}/{{ task.totalCount }}</b>
                  </span>
                  <Button
                    type="link"
                    size="small"
                    @click="toggleBatchPanel(task)"
                  >
                    {{ isBatchPanelExpanded(task) ? '收起进度' : '展开进度' }}
                  </Button>
                  <Button
                    v-if="!isBatchTaskRunning(task.batchTaskStatus)"
                    size="small"
                    @click="dismissBatchTask(task)"
                  >
                    关闭
                  </Button>
                </div>
                <div
                  v-if="isBatchTaskRunning(task.batchTaskStatus)"
                  class="sb-batch__hint"
                >
                  任务在后台执行，可关闭页面，完成后可在任务中心查看
                </div>
                <div
                  v-if="isBatchPanelExpanded(task)"
                  class="sb-batch__detail"
                >
                  <Progress
                    :percent="task.progressPercent"
                    :show-info="false"
                    class="sb-batch__progress"
                    size="small"
                  />
                  <span class="sb-batch__meta">
                    成功 {{ task.successCount }} · 失败 {{ task.failedCount }} · 待处理
                    {{ task.pendingCount }}
                    <template v-if="task.skipped.length">
                      · 跳过 {{ task.skipped.length }}
                    </template>
                  </span>
                  <div v-if="task.failedCount > 0" class="sb-batch__failures">
                    <Button
                      type="link"
                      size="small"
                      @click="toggleBatchFailures(task)"
                    >
                      {{ isBatchFailuresExpanded(task) ? '收起失败明细' : `失败明细（${task.failedCount}）` }}
                    </Button>
                    <div
                      v-if="isBatchFailuresExpanded(task)"
                      class="batch-failures"
                    >
                      <div
                        v-for="(item, index) in batchFailedItems(task)"
                        :key="`${item.id ?? index}`"
                        class="batch-failure"
                      >
                        {{ batchFailureLabel(item) }}
                      </div>
                      <div
                        v-if="!batchFailedItems(task).length"
                        class="batch-failure"
                      >
                        失败明细暂未返回，可在任务中心查看
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 本地备用执行器：仅 USE_SERVER_BATCH=false 时出现 -->
              <div
                v-if="!USE_SERVER_BATCH && (localBatchRunning || localBatchDone > 0)"
                class="sb-batch"
              >
                <span class="sb-batch__text">
                  本地备用生成 ·
                  {{ localBatchTarget === 'keyframe' ? '关键帧' : '视频' }}
                  <b>{{ localBatchDone }}/{{ localBatchTotal }}</b>
                </span>
                <Progress
                  :percent="localBatchPercent"
                  :show-info="false"
                  class="sb-batch__progress"
                  size="small"
                />
                <span class="sb-batch__meta">
                  成功 {{ localBatchSuccess }} · 失败 {{ localBatchFailed }}
                </span>
                <div
                  v-if="localBatchFailures.length"
                  class="batch-failures"
                >
                  <div
                    v-for="item in localBatchFailures"
                    :key="item.shotId"
                    class="batch-failure"
                  >
                    第 {{ item.seq }} 镜（{{ item.shotId }}）：{{ item.message }}
                  </div>
                </div>
              </div>

              <!-- 成片入口与状态：纯拼接版本，和「生成分镜」互不改动 -->
              <div
                class="sb-compose"
                :class="{ 'is-done': composeDone, 'is-failed': composeFailed }"
              >
                <div class="sb-compose__main">
                  <span class="sb-compose__label">成片</span>
                  <Tag :bordered="false" :color="composeState.color">
                    {{ composeState.label }}
                  </Tag>
                  <Progress
                    v-if="composeStatus?.status === 1"
                    :percent="composeProgress"
                    class="sb-compose__progress"
                    size="small"
                  />
                  <span class="sb-compose__note">
                    当前版本为纯拼接，不含字幕与配音
                  </span>
                  <span v-if="composeDone && !composePlayable" class="sb-compose__note">
                    已完成，地址加载中
                  </span>
                  <span v-if="composeStatus?.errorMsg" class="sb-compose__error">
                    {{ composeStatus.errorMsg }}
                  </span>
                  <span class="sb-compose__spacer"></span>
                  <Button
                    size="small"
                    type="primary"
                    :disabled="composeRunning"
                    :loading="composeSubmitting || composeRunning"
                    @click="generateCompose"
                  >
                    {{
                      composeRunning
                        ? `${composeState.label}…`
                        : composeFailed
                          ? '重试'
                          : composeDone
                            ? '重新生成成片'
                            : '生成成片'
                    }}
                  </Button>
                </div>
              </div>

              <Card
                v-if="composeDone"
                class="sb-final"
                hoverable
                size="small"
                @click="openComposePreview"
              >
                <div class="sb-final__cover">
                  <video
                    v-if="composeStatus?.finalUrl"
                    :poster="composeStatus?.thumbnailUrl"
                    :src="composeStatus.finalUrl"
                    muted
                    playsinline
                    preload="metadata"
                  ></video>
                  <div v-else class="sb-final__placeholder">地址加载中</div>
                </div>
                <div class="sb-final__meta">
                  <b>
                    {{
                      composePlayable
                        ? '成片已就绪，点击预览'
                        : '已完成，地址加载中'
                    }}
                  </b>
                  <span>
                    {{
                      composeStatus?.durationSeconds
                        ? `${composeStatus.durationSeconds} 秒`
                        : '时长未知'
                    }}
                    <template v-if="composeStatus?.resolution">
                      · {{ composeStatus.resolution }}
                    </template>
                  </span>
                </div>
                <div
                  v-if="composePlayable"
                  class="sb-final__actions"
                  @click.stop
                >
                  <a
                    :href="composeStatus?.finalUrl"
                    download
                    rel="noopener"
                    target="_blank"
                  >
                    <Button size="small">
                      <template #icon><DownloadOutlined /></template>
                      下载
                    </Button>
                  </a>
                  <Button size="small" type="primary" @click="composePreviewOpen = true">
                    预览
                  </Button>
                </div>
              </Card>

              <div class="sb-body">
                <div
                  v-if="bindingReport"
                  class="sb-bind"
                  :class="bindingComplete ? 'is-ok' : 'is-warn'"
                >
                  <div class="sb-bind__main">
                    <CheckCircleOutlined v-if="bindingComplete" class="sb-bind__icon" />
                    <SafetyCertificateOutlined v-else class="sb-bind__icon" />
                    <span class="sb-bind__stat">
                      <span>
                        {{ hasCharacterGroups ? '主要角色' : '角色' }}
                        <b>{{ mainBindStat.bound }}/{{ mainBindStat.total }}</b> 已绑定
                      </span>
                      <span v-if="extraBindStat && extraBindStat.total > 0">
                        群演 <b>{{ extraBindStat.bound }}/{{ extraBindStat.total }}</b> 已绑定
                      </span>
                      <span>
                        场景 <b>{{ sceneBindStat.bound }}/{{ sceneBindStat.total }}</b> 已绑定
                      </span>
                    </span>
                    <span v-if="bindingMissSummary" class="sb-bind__miss">
                      未绑定：{{ bindingMissSummary }}
                    </span>
                    <Button
                      type="link"
                      size="small"
                      @click="bindingExpanded = !bindingExpanded"
                    >
                      {{ bindingExpanded ? '收起名单' : '未匹配名单' }}
                    </Button>
                    <span class="sb-bind__spacer"></span>
                    <Button
                      v-if="characterBindStat.unmatched.length"
                      size="small"
                      @click="openCharacterBind"
                    >
                      补绑角色
                    </Button>
                    <Button
                      v-if="sceneBindStat.unmatched.length"
                      size="small"
                      @click="openSceneBind"
                    >
                      补绑场景
                    </Button>
                  </div>
                  <div v-if="bindingExpanded" class="sb-bind__detail">
                    <div v-if="mainBindStat.unmatched.length">
                      <b>主要角色未匹配：</b>{{ mainBindStat.unmatched.join('、') }}
                    </div>
                    <div v-if="extraBindStat?.unmatched.length">
                      <b>群演未匹配：</b>{{ extraBindStat.unmatched.join('、') }}
                    </div>
                    <div v-if="sceneBindStat.unmatched.length">
                      <b>场景未匹配：</b>
                      {{
                        sceneBindStat.unmatched
                          .map((item) => `第 ${item.sceneSeq} 场${item.heading ? ` · ${item.heading}` : ''}`)
                          .join('；')
                      }}
                    </div>
                    <div v-if="bindingComplete">全部角色与场景均已绑定</div>
                  </div>
                </div>
                <Empty
                  v-if="shots.length === 0"
                  :image="Empty.PRESENTED_IMAGE_SIMPLE"
                  description="还没有分镜；已生成但列表为空时点「刷新」"
                />
                <List v-else :data-source="shots" :split="false" class="sb-list">
                  <template #renderItem="{ item: shot }">
                    <List.Item class="sb-item">
                      <Card size="small" class="sb-shot">
                        <div class="sb-shot__layout">
                          <div class="sb-shot__main">
                            <div class="sb-shot__hd">
                              <span class="sb-shot__no">#{{ shot.seq }}</span>
                              <Tag v-if="shot.shotType" :bordered="false" color="blue">
                                {{ shotTypeLabel(shot.shotType) }}
                              </Tag>
                              <Tag v-if="shot.camera" :bordered="false" color="purple">
                                {{ cameraLabel(shot.camera) }}
                              </Tag>
                              <Tag :bordered="false">
                                <ClockCircleOutlined class="mr-1" />
                                {{ shot.durationSeconds || 0 }}s
                              </Tag>
                              <Tag :bordered="false" :color="shotStatus(shot).color">
                                {{ shotStatus(shot).label }}
                              </Tag>
                              <Tag
                                v-if="!promptHasCharacter(shot)"
                                :bordered="false"
                                color="orange"
                              >
                                提示词缺少角色，建议重新生成
                              </Tag>
                              <Tag
                                v-if="unboundNamesOf(shot).length"
                                :bordered="false"
                                color="red"
                              >
                                未绑定：{{ unboundNamesOf(shot).join('、') }}
                              </Tag>
                              <Tag
                                v-if="shot.sceneSeq && !shot.sceneId"
                                :bordered="false"
                                color="red"
                              >
                                场景未匹配
                              </Tag>
                              <Tag
                                v-if="needsKeyframe(shot)"
                                :bordered="false"
                                color="orange"
                              >
                                缺关键帧
                              </Tag>
                              <Tag
                                v-if="
                                  shot.blankShot === 1 ||
                                  (isBlankCandidate(shot) && shot.blankShot !== 0)
                                "
                                :bordered="false"
                                :color="shot.blankShot === 1 ? 'green' : 'orange'"
                              >
                                {{
                                  shot.blankShot === 1 ? '空镜 · 已确认' : '空镜 · 自动'
                                }}
                              </Tag>
                              <Tag
                                v-if="dialogueTooLong(shot)"
                                :bordered="false"
                                color="orange"
                              >
                                台词超出镜头时长
                              </Tag>
                              <Tag
                                v-if="shot.assetsStale"
                                :bordered="false"
                                color="orange"
                              >
                                资产已更新
                              </Tag>
                            </div>

                            <p class="sb-shot__desc">{{ shot.description }}</p>

                            <div v-if="shot.dialogue" class="sb-quote">
                              <span class="sb-quote__label">台词</span>
                              <p>{{ shot.dialogue }}</p>
                            </div>

                            <div
                              v-if="shot.imagePrompt || shot.videoPrompt"
                              class="sb-prompts"
                            >
                              <div v-if="shot.imagePrompt" class="sb-prompt">
                                <span class="sb-prompt__label">画面</span>
                                <p>{{ shot.imagePrompt }}</p>
                              </div>
                              <div v-if="shot.videoPrompt" class="sb-prompt">
                                <span class="sb-prompt__label">视频</span>
                                <p>{{ shot.videoPrompt }}</p>
                              </div>
                            </div>

                            <div class="sb-shot__footer">
                              <Popover
                                v-if="shot.sceneSeq"
                                :open="scenePickShotId === String(shot.id)"
                                placement="topLeft"
                                trigger="click"
                                @open-change="(open) => toggleShotScenePick(shot, open)"
                              >
                                <template #content>
                                  <div class="shot-scene-pick">
                                    <Select
                                      :options="sceneAssetOptions"
                                      :value="shot.sceneId"
                                      option-filter-prop="label"
                                      placeholder="选择场景资产"
                                      show-search
                                      style="width: 240px"
                                      @change="(value) => bindShotScene(shot, value)"
                                    />
                                    <p class="nwb-tip">
                                      只修改当前镜头，不影响同场其他镜头。
                                    </p>
                                  </div>
                                </template>
                                <button
                                  type="button"
                                  class="sb-shot__scene"
                                  :class="{ 'is-missing': !shot.sceneId }"
                                >
                                  <EnvironmentOutlined />
                                  <template v-if="shot.sceneId">
                                    场景 {{ shot.sceneSeq }}
                                    <template v-if="sceneHeading(shot)">
                                      · {{ sceneHeading(shot) }}
                                    </template>
                                    · {{ sceneAssetName(shot.sceneId) }}
                                    <em>更换</em>
                                  </template>
                                  <template v-else>
                                    场景 {{ shot.sceneSeq }} · 未绑定场景 · 去绑定
                                  </template>
                                </button>
                              </Popover>
                              <Space wrap :size="[8, 8]" class="sb-actions">
                                <Space.Compact size="small">
                                  <Button
                                    class="sb-btn--image"
                                    @click="openShotBind(shot, 'image')"
                                  >
                                    <PictureOutlined />
                                    {{ shot.hasImage ? '更换图片' : '绑定图片' }}
                                  </Button>
                                  <Button
                                    v-if="shot.hasImage"
                                    danger
                                    @click="unbindShot(shot, 'image')"
                                  >
                                    解绑
                                  </Button>
                                </Space.Compact>

                                <Space.Compact size="small">
                                  <Button
                                    class="sb-btn--video"
                                    @click="openShotBind(shot, 'video')"
                                  >
                                    <VideoCameraOutlined />
                                    {{ shot.hasVideo ? '更换视频' : '绑定视频' }}
                                  </Button>
                                  <Button
                                    v-if="shot.hasVideo"
                                    danger
                                    @click="unbindShot(shot, 'video')"
                                  >
                                    解绑
                                  </Button>
                                </Space.Compact>

                                <Space.Compact size="small">
                                  <Button
                                    class="sb-btn--keyframe"
                                    :disabled="
                                      isKeyframeGenerating(shot) ||
                                      keyframeBusy
                                    "
                                    :loading="isKeyframeGenerating(shot)"
                                    @click="generateShotKeyframe(shot)"
                                  >
                                    <ThunderboltOutlined />
                                    {{ shot.imageMaterialId ? '重新生成关键帧' : '生成关键帧' }}
                                  </Button>
                                  <Button
                                    type="primary"
                                    :disabled="
                                      Number(shot.generationStatus) === 1 ||
                                      needsKeyframe(shot) ||
                                      videoBusy
                                    "
                                    :loading="Number(shot.generationStatus) === 1"
                                    @click="generateShotVideo(shot)"
                                  >
                                    <PlayCircleOutlined />
                                    {{ Number(shot.generationStatus) === 1 ? '生成中…' : shot.hasVideo ? '重新生成视频' : '生成视频' }}
                                  </Button>
                                </Space.Compact>

                                <Space.Compact size="small">
                                  <Button @click="openPrompt(shot)">
                                    <EditOutlined />
                                    提示词
                                  </Button>
                                  <Button
                                    v-if="
                                      isBlankCandidate(shot) &&
                                      shot.blankShot == null
                                    "
                                    @click="saveShotField(shot, { blankShot: 1 })"
                                  >
                                    确认空镜
                                  </Button>
                                  <Button
                                    v-if="
                                      isBlankCandidate(shot) &&
                                      shot.blankShot === 1
                                    "
                                    :disabled="!canConvertToPersonShot(shot)"
                                    :title="
                                      canConvertToPersonShot(shot)
                                        ? ''
                                        : '先绑定角色后才能转人物镜头'
                                    "
                                    @click="saveShotField(shot, { blankShot: 0 })"
                                  >
                                    转人物镜头
                                  </Button>
                                </Space.Compact>
                              </Space>
                            </div>
                          </div>

                          <div class="sb-shot__media">
                            <div class="sb-media">
                              <Tag class="sb-media__tag" :bordered="false">图片</Tag>
                              <Image
                                v-if="shot.imageThumbnailUrl || shot.imageUrl"
                                class="sb-media__img"
                                :preview="{ src: shot.imageUrl || shot.imageThumbnailUrl }"
                                :src="shot.imageThumbnailUrl || shot.imageUrl"
                              />
                              <div v-else class="sb-media__ph">
                                <PictureOutlined />
                                <span>暂无图片</span>
                              </div>
                            </div>
                            <div class="sb-media">
                              <Tag class="sb-media__tag" :bordered="false">视频</Tag>
                              <video
                                v-if="shot.videoUrl"
                                :src="shot.videoUrl"
                                controls
                                muted
                                playsinline
                                preload="metadata"
                              ></video>
                              <Image
                                v-else-if="shot.videoThumbnailUrl"
                                class="sb-media__img"
                                :preview="{ src: shot.videoThumbnailUrl }"
                                :src="shot.videoThumbnailUrl"
                              />
                              <div v-else class="sb-media__ph">
                                <VideoCameraOutlined />
                                <span>{{ shotStatus(shot).label }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  </template>
                </List>
                <div v-if="shotsLoading" class="nwb-loading">
                  <Spin />
                </div>
              </div>
            </div>

            <div v-else class="nwb-doc">
              <h3>剧本 · 第 {{ episode.seq }} 集</h3>
              <template v-if="episode.scenes?.length">
                <div v-for="scene in episode.scenes" :key="scene.seq" class="nwb-scene">
                  <div class="nwb-scene__hd">
                    <PlayCircleOutlined /> {{ scene.heading }}
                  </div>
                  <div
                    v-for="(line, index) in scene.dialogue || []"
                    :key="index"
                    class="nwb-line"
                  >
                    <span>{{ line.role }}</span>
                    <b>{{ line.line }}</b>
                  </div>
                  <p v-if="scene.action" class="nwb-action">{{ scene.action }}</p>
                </div>
              </template>
              <div v-else-if="episode.script" class="nwb-prose">
                {{ episode.script }}
              </div>
              <div v-else class="nwb-empty">
                <b>这一集还没有剧本</b>
                <span>按正文和细纲生成，可指定时长与创作要求</span>
                <Button type="primary" @click="openScript">生成剧本</Button>
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
                <b>{{ stats.scripts }} / {{ stats.total }} 集</b>
                <span>剧本已生成</span>
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
              <Tag v-if="memoryStale" color="orange" :bordered="false">正文有修改待刷新</Tag>
              <Button
                type="link"
                size="small"
                :loading="memoryLoading"
                @click="generateMemory(true)"
              >
                重新生成
              </Button>
            </div>
            <p class="nwb-memory">
              {{
                episode.memory ||
                '点「保存」压缩本章关键事件、人物变化与未解伏笔（自动保存不会触发）'
              }}
            </p>
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
              <Button size="small" @click="openScript">生成剧本</Button>
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
      v-model:open="scriptOpen"
      :confirm-loading="scriptSaving"
      title="生成剧本"
      ok-text="开始生成"
      @ok="submitScript"
    >
      <div class="nwb-modal">
        <label>
          <span>文本模型</span>
          <Select v-model:value="modelId" :options="models" show-search />
        </label>
        <label>
          <span>单集时长</span>
          <Select
            v-model:value="scriptDuration"
            :options="[
              { label: '60 秒', value: 60 },
              { label: '90 秒', value: 90 },
              { label: '120 秒', value: 120 },
            ]"
          />
        </label>
        <label class="nwb-modal__switch">
          <span>顺手提炼资产</span>
          <Switch v-model:checked="autoExtractAssets" />
        </label>
        <label>
          <span>创作要求</span>
          <Input.TextArea
            v-model:value="scriptReq"
            :rows="3"
            placeholder="例如：开场 10 秒内抛出冲突，结尾留反转钩子"
          />
        </label>
        <div class="nwb-context">
          <b><FileTextOutlined /> 前情摘要</b>
          <p>{{ episode?.summary || '暂无' }}</p>
        </div>
      </div>
    </Modal>

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

    <ShotMaterialDrawer @confirm="onShotMaterialPicked" />
    <AssetGraphDrawer @success="onAssetGraphChanged" />

    <Modal
      v-model:open="sceneBindOpen"
      title="场景绑定"
      width="720px"
    >
      <Spin :spinning="sceneBindLoading">
        <p class="nwb-tip">
          按场绑定时，只会填充尚未绑定场景的镜头；已单独绑定的镜头不会被修改。
        </p>
        <div v-if="sceneBindRows.length" class="scene-bind">
          <div v-for="row in sceneBindRows" :key="row.sceneSeq" class="scene-bind__row">
            <span class="scene-bind__seq">第 {{ row.sceneSeq }} 场</span>
            <span class="scene-bind__heading">{{ row.heading || '未命名场景' }}</span>
            <Tag v-if="row.inScript === false" :bordered="false">剧本无此场</Tag>
            <Select
              v-model:value="row.assetSceneId"
              allow-clear
              show-search
              option-filter-prop="label"
              placeholder="选择场景资产"
              style="width: 220px"
              :options="sceneAssetOptions"
            />
            <Button
              v-if="!row.assetSceneId"
              type="link"
              size="small"
              :disabled="!row.heading || creatingSceneSeq !== undefined"
              :loading="creatingSceneSeq === row.sceneSeq"
              :title="row.heading ? '' : '该场次缺少标题，无法自动新建'"
              @click="createSceneFromRow(row)"
            >
              新建场景
            </Button>
            <span v-if="!row.heading" class="scene-bind__hint">缺少标题</span>
          </div>
        </div>
        <Empty v-else description="当前分集还没有场景，先生成剧本" />
        <p class="nwb-tip">
          「保存并应用到现有分镜」会立即更新已生成镜头的场景资产，无需重新生成；「仅保存绑定」只写入本集场次，重新生成分镜后生效。绑定后镜头会标记「资产已更新」，需要重新生成关键帧。
        </p>
      </Spin>
      <template #footer>
        <Button @click="sceneBindOpen = false">取消</Button>
        <Button :loading="sceneBindSaving" @click="saveSceneBind(false)">
          仅保存绑定
        </Button>
        <Button type="primary" :loading="sceneBindSaving" @click="saveSceneBind(true)">
          保存并应用到现有分镜
        </Button>
      </template>
    </Modal>

    <Modal
      v-model:open="characterBindOpen"
      :confirm-loading="characterBindSaving"
      title="角色绑定"
      ok-text="保存并应用到现有分镜"
      width="680px"
      @ok="saveCharacterBind"
    >
      <Spin :spinning="characterBindLoading">
        <div v-if="mainCharacterBindRows.length" class="scene-bind">
          <div v-for="row in mainCharacterBindRows" :key="row.name" class="scene-bind__row">
            <span class="scene-bind__name">{{ row.name }}</span>
            <span class="scene-bind__hint">{{ row.affected }} 个镜头</span>
            <Select
              v-model:value="row.characterId"
              allow-clear
              show-search
              option-filter-prop="label"
              placeholder="选择角色资产"
              style="width: 240px"
              :options="characterAssetOptions"
            />
          </div>
        </div>
        <div v-if="extraCharacterBindRows.length" class="bind-extra">
          <Button
            type="link"
            size="small"
            @click="extraBindExpanded = !extraBindExpanded"
          >
            {{
              extraBindExpanded
                ? '收起群演'
                : `群演 ${extraCharacterBindRows.length} · 展开绑定`
            }}
          </Button>
          <span class="bind-extra__hint">群演默认折叠，展开后才参与本次绑定</span>
          <div v-if="extraBindExpanded" class="scene-bind">
            <div
              v-for="row in extraCharacterBindRows"
              :key="row.name"
              class="scene-bind__row"
            >
              <span class="scene-bind__name">{{ row.name }}</span>
              <span class="scene-bind__hint">{{ row.affected }} 个镜头</span>
              <Select
                v-model:value="row.characterId"
                allow-clear
                show-search
                option-filter-prop="label"
                placeholder="选择群演资产"
                style="width: 240px"
                :options="extraCharacterOptions"
              />
            </div>
          </div>
        </div>
        <Empty
          v-if="!characterBindRows.length"
          description="当前没有待绑定的角色"
        />
        <p class="nwb-tip">
          保存后会直接更新已生成分镜的角色关联，无需重新生成；未选择资产的角色保持不变。
        </p>
      </Spin>
    </Modal>

    <Modal
      v-model:open="batchConfirmOpen"
      :confirm-loading="batchSubmitting"
      :title="batchTitle"
      ok-text="提交任务"
      width="640px"
      @ok="submitStoryboardBatch"
    >
      <div class="batch-confirm">
        <p class="batch-confirm__count">
          本次将生成
          <b>{{ batchPlan?.eligible.length || 0 }}</b> 个镜头；跳过
          <b>{{ batchPlan?.skipped.length || 0 }}</b> 个。
        </p>
        <p
          v-if="(batchPlan?.eligible.length || 0) > 20"
          class="batch-confirm__warn"
        >
          数量较多，预计耗时较长，建议确认无误后执行。
        </p>
        <Button
          v-if="batchPlan?.skipped.length"
          type="link"
          size="small"
          @click="batchShowSkipped = !batchShowSkipped"
        >
          {{ batchShowSkipped ? '收起跳过原因' : '查看跳过原因' }}
        </Button>
        <div v-if="batchShowSkipped" class="batch-skip">
          <div
            v-for="item in batchSkipSummary"
            :key="item.reason"
            class="batch-skip__row"
          >
            <span>{{ item.label }}</span>
            <b>{{ item.count }}</b>
          </div>
          <p class="nwb-tip">空镜不会自动确认；请先手动确认空镜后再跑批量。</p>
        </div>
        <p class="nwb-tip">
          {{
            USE_SERVER_BATCH
              ? '提交后由后端批次任务执行，离开页面也会继续；同类型已有任务会直接复用，进度可在任务中心查看。'
              : '当前为本地备用执行路径（USE_SERVER_BATCH=false）：并发 2 逐镜提交，离开页面会中断。'
          }}
        </p>
      </div>
    </Modal>

    <Modal
      v-model:open="composePreviewOpen"
      :footer="null"
      title="成片预览"
      width="860px"
    >
      <video
        v-if="composeStatus?.finalUrl"
        class="sb-final-video"
        :poster="composeStatus?.thumbnailUrl"
        :src="composeStatus.finalUrl"
        controls
        autoplay
        playsinline
      ></video>
    </Modal>

    <Modal
      v-model:open="composeGateOpen"
      :footer="null"
      title="成片尚未就绪"
      width="520px"
    >
      <p class="compose-gate__text">
        还有 <b>{{ localMissingVideoSeqs.length }}</b> 镜没有视频，先去批量生成视频？
      </p>
      <p class="nwb-tip">空镜或其他特殊情况可以仍然提交。</p>
      <div class="compose-gate__actions">
        <Button @click="gotoBatchVideoForCompose">去生成</Button>
        <Button
          type="primary"
          :loading="composeSubmitting"
          @click="submitCompose"
        >
          仍然提交
        </Button>
      </div>
    </Modal>

    <Modal
      v-model:open="composeMissingOpen"
      :footer="null"
      title="成片预检未通过"
      width="620px"
    >
      <p v-if="composePrecheckMessage" class="nwb-tip">
        {{ composePrecheckMessage }}
      </p>
      <div v-if="composeMissingShots.length" class="compose-missing">
        <div
          v-for="item in composeMissingShots"
          :key="item.shotId"
          class="compose-missing__row"
        >
          <b>#{{ item.seq ?? item.shotId }}</b>
          <span>{{ item.reason || '缺少视频，请先生成镜头视频' }}</span>
        </div>
      </div>
      <p v-else class="nwb-tip">后端未返回缺失镜头明细，请先检查视频生成状态。</p>
      <div class="compose-missing__foot">
        <Button @click="gotoBatchVideoForCompose">去批量生成视频</Button>
        <Button type="primary" @click="composeMissingOpen = false">
          知道了
        </Button>
      </div>
    </Modal>

    <Modal
      v-model:open="validationOpen"
      :footer="null"
      title="分镜一致性校验"
      width="760px"
    >
      <div v-if="validationResult" class="validate">
        <div class="validate-status">
          <div class="validate-status__row">
            <span class="validate-status__label">一致性</span>
            <b :class="validationErrors.length ? 'is-bad' : 'is-good'">
              {{
                validationErrors.length
                  ? `发现 ${validationErrors.length} 个阻断问题`
                  : '已通过'
              }}
            </b>
          </div>
          <div class="validate-status__row">
            <span class="validate-status__label">成片就绪</span>
            <Tag
              :bordered="false"
              :color="validationComposeReady ? 'green' : 'orange'"
            >
              {{
                validationComposeReady
                  ? '已就绪（全部镜头有视频）'
                  : `未就绪，缺视频 ${validationMissingVideoSeqs.length} 镜`
              }}
            </Tag>
          </div>
          <div
            v-if="!validationComposeReady"
            class="validate-status__missing"
          >
            <template v-if="validationMissingVideoSeqs.length">
              缺视频镜头：第 {{ missingVideoPreview.join('、') }} 镜
              <template v-if="missingVideoExtra">
                等 {{ missingVideoExtra }} 镜
              </template>
            </template>
            <template v-else>镜头视频未齐，请先批量生成视频</template>
          </div>
          <div class="validate-status__actions">
            <Button
              v-if="validationErrors.length"
              size="small"
              type="primary"
              ghost
              @click="validationOpen = false; openAssetGraph()"
            >
              去补齐资产
            </Button>
            <Button
              v-if="!validationComposeReady"
              size="small"
              @click="gotoBatchVideoForCompose"
            >
              去批量生成视频
            </Button>
            <Button
              size="small"
              type="primary"
              :disabled="!validationComposeReady"
              @click="goComposeFromValidation"
            >
              去成片
            </Button>
          </div>
        </div>

        <div v-if="validationErrors.length" class="validate-list">
          <div
            v-for="(issue, index) in validationErrors"
            :key="`${issue.type}-${index}`"
            class="validate-item"
          >
            <Tag :bordered="false" :color="issueTag(issue).color">
              {{ issueTag(issue).text }}
            </Tag>
            <div>
              <b v-if="issue.seq">#{{ issue.seq }}</b>
              <span>{{ issueMessage(issue) }}</span>
              <p v-if="issue.characters?.length">
                角色：{{ issue.characters.join('、') }}
              </p>
            </div>
            <Button
              v-if="issueActionLabel(issue.type)"
              type="link"
              size="small"
              @click="validationOpen = false; handleIssue(issue)"
            >
              {{ issueActionLabel(issue.type) }}
            </Button>
          </div>
        </div>

        <div v-if="validationWarnings.length" class="validate-warnings">
          <Button
            type="link"
            size="small"
            @click="validationWarningsOpen = !validationWarningsOpen"
          >
            {{
              validationWarningsOpen
                ? '收起警告'
                : `警告 ${validationWarnings.length} 条（默认折叠）`
            }}
          </Button>
          <div v-if="validationWarningsOpen" class="validate-list">
            <div
              v-for="(issue, index) in validationWarnings"
              :key="`${issue.type}-${index}`"
              class="validate-item"
            >
              <Tag :bordered="false" :color="issueTag(issue).color">
                {{ issueTag(issue).text }}
              </Tag>
              <div>
                <b v-if="issue.seq">#{{ issue.seq }}</b>
                <span>{{ issueMessage(issue) }}</span>
                <p v-if="issue.characters?.length">
                  角色：{{ issue.characters.join('、') }}
                </p>
              </div>
              <Button
                v-if="issueActionLabel(issue.type)"
                type="link"
                size="small"
                @click="validationOpen = false; handleIssue(issue)"
              >
                {{ issueActionLabel(issue.type) }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <Modal
      v-model:open="promptOpen"
      :confirm-loading="promptSaving"
      title="编辑镜头提示词"
      ok-text="保存"
      width="720px"
      @ok="savePrompt"
    >
      <div class="nwb-modal">
        <div class="ed-direction">
          <span>场景</span>
          <Input
            :value="`第 ${promptForm.sceneSeq || '-'} 场 · ${promptForm.shotType || ''} · ${promptForm.camera || ''}`"
            disabled
          />
        </div>
        <label>
          <span>画面描述</span>
          <Input.TextArea v-model:value="promptForm.description" :rows="2" />
        </label>
        <label>
          <span>台词</span>
          <Input v-model:value="promptForm.dialogue" />
        </label>
        <label>
          <span>图片提示词</span>
          <Input.TextArea v-model:value="promptForm.imagePrompt" :rows="3" />
        </label>
        <label>
          <span>视频提示词</span>
          <Input.TextArea v-model:value="promptForm.videoPrompt" :rows="4" />
        </label>
        <label>
          <span>时长（秒）</span>
          <InputNumber v-model:value="promptForm.durationSeconds" :min="2" :max="30" />
        </label>
        <p class="nwb-tip">
          视频提示词建议写清：人物 + 动作 + 场景 + 运镜；生成视频时会直接使用这里的 videoPrompt。
        </p>
      </div>
    </Modal>

    <Modal v-model:open="ideaOpen" title="AI 想法" :footer="null" width="640">
      <div class="nwb-prose">{{ ideaText }}</div>
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
  gap: 8px;
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

.nwb-modal__switch {
  flex-direction: row !important;
  align-items: center;
  justify-content: space-between;
}

.scene-bind {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.scene-bind__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  background: hsl(var(--accent));
  border-radius: 8px;
}

.scene-bind__seq {
  flex: none;
  font-size: 12px;
  font-weight: 600;
}

.scene-bind__heading {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-bind__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-bind__hint {
  flex: none;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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

.nwb-scene {
  margin-top: 16px;

  &__hd {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
    border-radius: 6px;
  }
}

.nwb-line {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.8;

  span {
    flex: none;
    width: 56px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    text-align: right;
  }
}

.nwb-action {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: hsl(var(--muted-foreground));
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

.nwb-memory {
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

.nwb-context {
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 10px;

  b {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
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

.validate {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 560px;
  overflow-y: auto;
}

.validate-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 9px;
}

.validate-status__row {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
}

.validate-status__label {
  flex: none;
  width: 60px;
  color: hsl(var(--muted-foreground));
}

.validate-status__row .is-good {
  color: hsl(var(--success));
}

.validate-status__row .is-bad {
  color: hsl(var(--destructive));
}

.validate-status__missing {
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--warning));
}

.validate-status__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.validate-warnings {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.validate-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validate-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.6;
  background: hsl(var(--accent));
  border-radius: 8px;

  p {
    margin: 2px 0 0;
    color: hsl(var(--muted-foreground));
  }
}

.sb {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}

.sb-head {
  display: flex;
  flex: none;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sb-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sb-bind {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 12px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &.is-warn {
    background: color-mix(in srgb, hsl(var(--warning)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--warning)) 35%, transparent);
  }

  &.is-ok {
    background: color-mix(in srgb, hsl(var(--success)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--success)) 30%, transparent);
  }
}

.sb-bind__main {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.sb-bind__icon {
  color: hsl(var(--warning));
}

.sb-bind.is-ok .sb-bind__icon {
  color: hsl(var(--success));
}

.sb-bind__stat b {
  font-weight: 600;
}

.sb-bind__stat {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.sb-bind__miss {
  color: hsl(var(--destructive));
}

.sb-bind__spacer {
  flex: 1;
}

.sb-bind__detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 6px;
  margin-top: 6px;
  border-top: 1px dashed hsl(var(--border));

  b {
    font-weight: 600;
  }
}

.sb-compose {
  flex: none;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 12px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &.is-done {
    background: color-mix(in srgb, hsl(var(--success)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--success)) 30%, transparent);
  }

  &.is-failed {
    background: color-mix(in srgb, hsl(var(--destructive)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--destructive)) 30%, transparent);
  }
}

.sb-compose__main {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.sb-compose__label {
  font-weight: 600;
}

.sb-compose__progress {
  width: 160px;
}

.sb-compose__note {
  color: hsl(var(--muted-foreground));
}

.sb-compose__error {
  color: hsl(var(--destructive));
}

.sb-compose__spacer {
  flex: 1;
}

.sb-final {
  flex: none;
  margin-bottom: 10px;
  cursor: pointer;

  :deep(.ant-card-body) {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }
}

.sb-final__cover {
  flex: none;
  width: 96px;
  height: 54px;
  overflow: hidden;
  background: #000;
  border-radius: 6px;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.sb-final__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
}

.sb-final__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;

  b {
    font-size: 13px;
  }

  span {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.sb-final__actions {
  display: flex;
  flex: none;
  gap: 8px;
}

.sb-final-video {
  width: 100%;
  max-height: 70vh;
  background: #000;
  border-radius: 8px;
}

.compose-missing {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}

.compose-gate__text {
  margin: 0 0 8px;
  font-size: 14px;

  b {
    font-size: 18px;
  }
}

.compose-gate__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.compose-missing__row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  font-size: 12px;
  background: hsl(var(--accent));
  border-radius: 8px;

  b {
    flex: none;
  }

  span {
    flex: 1;
  }
}

.compose-missing__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.bind-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed hsl(var(--border));
}

.bind-extra__hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.sb-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.sb-batch-entry {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;

  em {
    font-size: 11px;
    font-style: normal;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }
}

.sb-batch {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 10px;
  background: color-mix(in srgb, hsl(var(--primary)) 7%, hsl(var(--background)));
  border: 1px solid color-mix(in srgb, hsl(var(--primary)) 28%, transparent);
  border-radius: 8px;

  &.is-done {
    background: color-mix(in srgb, hsl(var(--success)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--success)) 30%, transparent);
  }

  &.is-failed {
    background: color-mix(in srgb, hsl(var(--destructive)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--destructive)) 30%, transparent);
  }
}

.sb-batch__text {
  font-size: 12px;
  font-weight: 600;
}

.sb-batch__text b {
  margin-left: 2px;
  font-size: 13px;
}

.sb-batch__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.sb-batch__hint {
  width: 100%;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.sb-batch__detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding-top: 6px;
  border-top: 1px dashed hsl(var(--border));
}

.sb-batch__failures {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.batch-failures {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 6px 8px;
  background: hsl(var(--accent));
  border-radius: 6px;
}

.batch-failure {
  font-size: 12px;
  color: hsl(var(--destructive));
}

.sb-batch__progress {
  width: 200px;
}

.sb-batch__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.batch-confirm__count {
  margin: 0 0 8px;
  font-size: 14px;

  b {
    font-size: 16px;
  }
}

.batch-confirm__warn {
  padding: 6px 10px;
  margin: 0 0 8px;
  font-size: 12px;
  color: hsl(var(--warning));
  background: color-mix(in srgb, hsl(var(--warning)) 10%, transparent);
  border-radius: 6px;
}

.batch-skip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  margin-top: 4px;
  background: hsl(var(--accent));
  border-radius: 8px;
}

.batch-skip__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.sb-list {
  :deep(.ant-list-item) {
    padding: 0;
    border: none;
  }
}

.sb-item {
  margin-bottom: 10px;
}

.sb-shot {
  width: 100%;
  overflow: hidden;
  border-radius: 12px;

  :deep(.ant-card-body) {
    padding: 0;
  }
}

.sb-shot__layout {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
}

.sb-shot__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.sb-shot__hd {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;

  :deep(.ant-tag) {
    margin: 0;
  }
}

.sb-shot__no {
  margin-right: 2px;
  font-size: 16px;
  font-weight: 700;
  color: hsl(var(--primary));
  font-variant-numeric: tabular-nums;
}

.sb-shot__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.75;
}

.sb-quote {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  background: color-mix(in srgb, hsl(var(--primary)) 6%, transparent);
  border-radius: 8px;

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: hsl(var(--primary));
  }
}

.sb-quote__label {
  flex: none;
  padding: 0 7px;
  font-size: 11px;
  line-height: 20px;
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 12%, transparent);
  border-radius: 6px;
}

.sb-prompts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sb-prompt {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  background: hsl(var(--accent) / 55%);
  border-radius: 8px;

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
  }
}

.sb-prompt__label {
  flex: none;
  padding: 0 7px;
  font-size: 11px;
  line-height: 20px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card));
  border-radius: 6px;
}

.sb-shot__footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding-top: 8px;
  margin-top: 2px;
  border-top: 1px dashed hsl(var(--border));
}

.sb-shot__scene {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 3px 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 1px dashed transparent;
  border-radius: 6px;

  &:hover {
    color: hsl(var(--primary));
    background: hsl(var(--accent));
    border-color: hsl(var(--border));
  }

  &.is-missing {
    color: hsl(var(--warning));
    background: color-mix(in srgb, hsl(var(--warning)) 8%, transparent);
    border-color: color-mix(in srgb, hsl(var(--warning)) 35%, transparent);
  }

  em {
    font-size: 11px;
    font-style: normal;
    opacity: 0.8;
  }
}

.shot-scene-pick {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sb-actions {
  align-self: flex-start;

  :deep(.ant-btn) {
    font-size: 12px;
  }

  :deep(.anticon) {
    margin-right: 4px;
  }

  :deep(.sb-btn--image) {
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 8%, transparent);
    border-color: color-mix(in srgb, hsl(var(--primary)) 38%, transparent);

    &:hover {
      color: hsl(var(--primary));
      background: color-mix(in srgb, hsl(var(--primary)) 14%, transparent);
      border-color: hsl(var(--primary));
    }
  }

  :deep(.sb-btn--video) {
    color: color-mix(in srgb, hsl(var(--success)) 58%, hsl(var(--foreground)));
    background: color-mix(in srgb, hsl(var(--success)) 10%, transparent);
    border-color: color-mix(in srgb, hsl(var(--success)) 38%, transparent);

    &:hover {
      color: color-mix(in srgb, hsl(var(--success)) 48%, hsl(var(--foreground)));
      background: color-mix(in srgb, hsl(var(--success)) 16%, transparent);
      border-color: hsl(var(--success));
    }
  }

  :deep(.sb-btn--keyframe) {
    color: color-mix(in srgb, hsl(var(--warning)) 48%, hsl(var(--foreground)));
    background: color-mix(in srgb, hsl(var(--warning)) 12%, transparent);
    border-color: color-mix(in srgb, hsl(var(--warning)) 42%, transparent);

    &:hover {
      color: color-mix(in srgb, hsl(var(--warning)) 38%, hsl(var(--foreground)));
      background: color-mix(in srgb, hsl(var(--warning)) 18%, transparent);
      border-color: hsl(var(--warning));
    }

    &[disabled] {
      color: hsl(var(--muted-foreground));
      background: hsl(var(--muted));
      border-color: hsl(var(--border));
    }
  }
}

.sb-shot__media {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 10px;
  width: 216px;
}

.sb-media {
  position: relative;
  display: flex;
  aspect-ratio: 16 / 9;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  border-radius: 10px;

  :deep(.ant-image) {
    display: block;
    width: 100%;
    height: 100%;
  }

  img,
  video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.sb-media__tag {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  margin: 0;
  font-size: 11px;
  color: #fff;
  background: rgb(0 0 0 / 45%);
  border: none;
}

.sb-media__ph {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  font-size: 12px;

  :deep(.anticon) {
    font-size: 20px;
    opacity: 0.6;
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

@media (width <= 1200px) {
  .sb-shot__layout {
    flex-direction: column;
  }

  .sb-shot__media {
    flex-direction: row;
    width: 100%;
  }

  .sb-media {
    flex: 1;
  }
}
</style>
