<script lang="ts" setup name="NovelBookWorkbench">
import type {
  EntityExtractResult,
  EpisodeAiIssue,
  EpisodeItem,
  EpisodePlanResponse,
  EpisodeSaveRequest,
  EpisodeVersionItem,
  NovelDetailItem,
  ShotItem,
  StoryboardIssue,
  StoryboardValidateResult,
} from '#/api/models/ai_asset';
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
  Empty,
  Image,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import RefPickerDrawer from '../../studio/components/RefPickerDrawer.vue';
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
const sceneBindRows = ref<Array<{ assetSceneId?: number | string; heading?: string; sceneSeq: number }>>([]);
const sceneAssetOptions = ref<Array<{ label: string; value: number | string }>>([]);

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
const keyframeGenerating = ref<string>();

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
  // 换集后清空上一集的分镜，切到分镜页时会自动重新拉取
  shots.value = [];
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
  // 当前停留在分镜页时，切集后自动加载新一集的分镜
  if (tab.value === 'storyboard') {
    await loadStoryboard();
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

async function openSceneBind() {
  if (!episode.value) {
    return;
  }
  sceneBindOpen.value = true;
  sceneBindLoading.value = true;
  try {
    if (!sceneAssetOptions.value.length) {
      const graph = await aiAssetApi.fetchNovelAssetGraph(props.novelId);
      sceneAssetOptions.value = (graph?.scenes ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      }));
    }
    let scenes = episode.value.scenes ?? [];
    if (!scenes.length) {
      const detail = await aiAssetApi.fetchEpisodeDetail(episode.value.id);
      scenes = detail?.scenes ?? [];
    }
    sceneBindRows.value = scenes.map((scene) => ({
      assetSceneId: scene.assetSceneId,
      heading: scene.heading,
      sceneSeq: scene.seq,
    }));
  } catch (error: any) {
    message.error(error?.message || '加载场景绑定失败');
  } finally {
    sceneBindLoading.value = false;
  }
}

async function saveSceneBind() {
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
  sceneBindSaving.value = true;
  try {
    await aiAssetApi.bindEpisodeScenes({
      episodeId: episode.value.id,
      mappings,
    });
    sceneBindOpen.value = false;
    await loadEpisode(episode.value);
    message.success('场景已绑定，请重新生成分镜');
  } catch (error: any) {
    message.error(error?.message || '场景绑定失败');
  } finally {
    sceneBindSaving.value = false;
  }
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
    tab.value = 'storyboard';
    message.success(`已生成 ${res?.shotCount ?? shots.value.length} 个镜头`);
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

function sceneLabel(shot: ShotItem) {
  const scene = sceneOf(shot);
  return scene ? `场景 ${scene.seq} · ${scene.heading}` : '';
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
  if (
    ['character_no_image', 'character_tags_drift', 'character_unresolved'].includes(issue.type)
  ) {
    openAssetGraph();
    return;
  }
  if (['scene_no_image', 'scene_tags_drift', 'scene_unresolved'].includes(issue.type)) {
    void openSceneBind();
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
  }
}

const ISSUE_ACTION_LABELS: Record<string, string> = {
  asset_stale: '重新生成关键帧',
  blank_unconfirmed: '确认空镜',
  character_no_image: '去资产编辑',
  character_tags_drift: '去资产编辑',
  character_unresolved: '去资产编辑',
  keyframe_missing: '生成关键帧',
  scene_no_image: '去绑定场景',
  scene_tags_drift: '去绑定场景',
  scene_unresolved: '去绑定场景',
};

function issueActionLabel(type: string) {
  return ISSUE_ACTION_LABELS[type] ?? '';
}

function isKeyframeGenerating(shot: ShotItem) {
  return (
    keyframeGenerating.value === String(shot.id) ||
    (Number(shot.generationStatus) === 1 && !shot.imageMaterialId)
  );
}

async function generateShotKeyframe(shot: ShotItem) {
  if (isKeyframeGenerating(shot)) {
    return;
  }
  keyframeGenerating.value = String(shot.id);
  try {
    const updated = await aiAssetApi.generateShotImage({
      promptOverride: shot.imagePrompt || undefined,
      shotId: shot.id,
    });
    if (updated) {
      mergeShot(updated);
    }
    message.success('关键帧任务已提交');
    stopShotPoll(shot.id);
    shotPollers.set(
      String(shot.id),
      setTimeout(() => void pollShot(shot.id), 2000),
    );
  } catch (error: any) {
    message.error(error?.message || '生成关键帧失败，请先补齐角色/场景图片');
  } finally {
    keyframeGenerating.value = undefined;
  }
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
  if (isBlankCandidate(shot) && shot.blankShot == null) {
    message.warning('空镜镜头需先确认；转人物镜头前请先绑定角色');
    return;
  }
  if (needsKeyframe(shot)) {
    message.warning('人物/台词镜头请先生成关键帧，再生成视频');
    return;
  }
  try {
    const updated = await aiAssetApi.generateShotVideo({
      duration: shot.durationSeconds,
      promptOverride: shot.videoPrompt || undefined,
      shotId: shot.id,
    });
    if (updated) {
      mergeShot(updated);
    }
    message.success('视频任务已提交，正在生成');
    stopShotPoll(shot.id);
    shotPollers.set(
      String(shot.id),
      setTimeout(() => void pollShot(shot.id), 2000),
    );
  } catch (error: any) {
    message.error(error?.message || '视频生成失败');
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
                    旧分镜请点「重新生成」以套用人物/场景上下文
                  </span>
                </div>
                <div class="sb-head__actions">
                  <Button size="small" :loading="sceneBindLoading" @click="openSceneBind">
                    场景绑定
                  </Button>
                  <Button size="small" :loading="validationLoading" @click="runValidation">
                    一致性校验
                  </Button>
                  <Button size="small" :loading="shotsLoading" @click="loadStoryboard">
                    刷新
                  </Button>
                  <Button size="small" :loading="storyboardGenerating" @click="generateStoryboard">
                    <template #icon><PlayCircleOutlined /></template>
                    {{ shots.length ? '重新生成' : '生成分镜' }}
                  </Button>
                </div>
              </div>

              <div class="sb-body">
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
                                v-if="
                                  (shot.characters?.length ?? 0) > 0 &&
                                  (shot.characterIds?.length ?? 0) === 0
                                "
                                :bordered="false"
                                color="red"
                              >
                                角色未关联资产
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
                              <span v-if="sceneLabel(shot)" class="sb-shot__scene">
                                <EnvironmentOutlined />
                                {{ sceneLabel(shot) }}
                              </span>
                              <Space wrap :size="4" class="sb-actions">
                                <Button
                                  type="link"
                                  size="small"
                                  @click="openShotBind(shot, 'image')"
                                >
                                  {{ shot.hasImage ? '更换图片' : '绑定图片' }}
                                </Button>
                                <Button
                                  v-if="shot.hasImage"
                                  type="link"
                                  size="small"
                                  @click="unbindShot(shot, 'image')"
                                >
                                  解绑图片
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  @click="openShotBind(shot, 'video')"
                                >
                                  {{ shot.hasVideo ? '更换视频' : '绑定视频' }}
                                </Button>
                                <Button
                                  v-if="shot.hasVideo"
                                  type="link"
                                  size="small"
                                  @click="unbindShot(shot, 'video')"
                                >
                                  解绑视频
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  @click="openPrompt(shot)"
                                >
                                  编辑提示词
                                </Button>
                                <Button
                                  v-if="isBlankCandidate(shot) && shot.blankShot == null"
                                  type="link"
                                  size="small"
                                  @click="saveShotField(shot, { blankShot: 1 })"
                                >
                                  确认空镜
                                </Button>
                                <Button
                                  v-if="isBlankCandidate(shot) && shot.blankShot === 1"
                                  type="link"
                                  size="small"
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
                                <Button
                                  v-if="shot.assetsStale"
                                  type="link"
                                  size="small"
                                  @click="generateShotKeyframe(shot)"
                                >
                                  重新生成关键帧
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  :disabled="isKeyframeGenerating(shot)"
                                  :loading="isKeyframeGenerating(shot)"
                                  @click="generateShotKeyframe(shot)"
                                >
                                  {{ shot.imageMaterialId ? '重新生成关键帧' : '生成关键帧' }}
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  :disabled="
                                    Number(shot.generationStatus) === 1 ||
                                    needsKeyframe(shot)
                                  "
                                  :loading="Number(shot.generationStatus) === 1"
                                  @click="generateShotVideo(shot)"
                                >
                                  {{ Number(shot.generationStatus) === 1 ? '生成中…' : shot.hasVideo ? '重新生成视频' : '生成视频' }}
                                </Button>
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
    <AssetGraphDrawer @success="loadStoryboard" />

    <Modal
      v-model:open="sceneBindOpen"
      :confirm-loading="sceneBindSaving"
      title="场景绑定"
      ok-text="保存绑定"
      width="720px"
      @ok="saveSceneBind"
    >
      <Spin :spinning="sceneBindLoading">
        <div v-if="sceneBindRows.length" class="scene-bind">
          <div v-for="row in sceneBindRows" :key="row.sceneSeq" class="scene-bind__row">
            <span class="scene-bind__seq">第 {{ row.sceneSeq }} 场</span>
            <span class="scene-bind__heading">{{ row.heading || '未命名场景' }}</span>
            <Select
              v-model:value="row.assetSceneId"
              allow-clear
              placeholder="选择场景资产"
              style="width: 240px"
              :options="sceneAssetOptions"
            />
          </div>
        </div>
        <Empty v-else description="当前分集还没有场景，先生成剧本" />
        <p class="nwb-tip">
          绑定会写入 episode.scenes[].assetSceneId；保存后请重新生成分镜以应用场景资产。
        </p>
      </Spin>
    </Modal>

    <Modal
      v-model:open="validationOpen"
      :footer="null"
      title="分镜一致性校验"
      width="760px"
    >
      <div v-if="validationResult" class="validate">
        <div
          class="validate-summary"
          :class="{ 'is-pass': validationResult.passed }"
        >
          <span>
            {{ validationResult.passed ? '校验通过，可以批量生成' : `发现 ${validationResult.issues.length} 个问题` }}
          </span>
          <Button
            v-if="!validationResult.passed"
            size="small"
            type="primary"
            ghost
            @click="validationOpen = false; openAssetGraph()"
          >
            去补齐资产
          </Button>
        </div>
        <div v-if="validationResult.issues.length" class="validate-list">
          <div
            v-for="(issue, index) in validationResult.issues"
            :key="`${issue.type}-${index}`"
            class="validate-item"
          >
            <Tag
              :bordered="false"
              :color="issue.level === 'error' ? 'red' : 'orange'"
            >
              {{ issue.level === 'error' ? '错误' : '警告' }}
            </Tag>
            <div>
              <b v-if="issue.seq">#{{ issue.seq }}</b>
              <span>{{ issue.message }}</span>
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

.validate-summary {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 13px;
  color: hsl(var(--destructive));
  background: color-mix(in srgb, hsl(var(--destructive)) 8%, transparent);
  border-radius: 9px;

  &.is-pass {
    color: hsl(var(--success));
    background: color-mix(in srgb, hsl(var(--success)) 10%, transparent);
  }
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

.sb-head__actions {
  display: flex;
  gap: 8px;
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
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  margin-top: 2px;
  border-top: 1px dashed hsl(var(--border));
}

.sb-shot__scene {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.sb-actions {
  margin-left: auto;

  :deep(.ant-btn) {
    padding: 0 6px;
    font-size: 12px;
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
