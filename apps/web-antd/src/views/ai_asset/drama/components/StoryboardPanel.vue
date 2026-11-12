<script lang="ts" setup name="DramaStoryboardPanel">
/**
 * 分镜台：剧情 → 分镜 二级页。
 *
 * 链路位置：短剧工作台 → 剧情 → 分镜 → 本组件。
 * 拆分/提示词/批量配图/列表按后端 v2/storyboard 冻结契约；
 * 镜头十要素编辑复用既有 shot/save（v2 契约未单列保存接口），关键帧/投影状态以列表返回为准。
 * 动作/删除等无契约能力明确 disabled，不伪造成功。
 */
import type { DramaApiError } from '../error';

import type {
  NovelAssetGraph,
  ShotScriptProp,
} from '#/api/models/ai_asset';
import type {
  StoryboardModelItem,
  StoryboardPromptPreviewResult,
  StoryboardPromptPreviewType,
  StoryboardPromptSkillMeta,
  StoryboardSegment,
  StoryboardSegmentPrompt,
  StoryboardShot,
} from '#/api/models/ai_asset_storyboard';
import type { TaskBatchCenterProgressResponse } from '#/api/models/marketing';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

import { VbenLoading } from '@vben/common-ui';

import {
  ApartmentOutlined,
  FileTextOutlined,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Image,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Select,
  Tabs,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { aiAssetStoryboardApi } from '#/api/core/ai_asset_storyboard';

import { formatApiError, parseApiError } from '../error';
import { useAspectRatioDict } from '../useAspectRatioDict';
import { useStoryboardDicts } from '../useStoryboardDicts';

const props = defineProps<{
  episodeId?: number | string;
  /** 项目 ID：用于加载资产图谱，给分镜绑定角色/场景 */
  novelId?: number | string;
  /** 项目级画面比例（v2/project），作为配图默认比例 */
  projectRatio?: string;
  /** 项目级画风；配图统一由 visual-style 注入，只读展示 */
  projectStyle?: string;
}>();

const emit = defineEmits<{
  dirtyChange: [dirty: boolean];
  statsChange: [stats: { segmentCount: number; shotCount: number }];
}>();

const { promptModes, promptReady, splitModes, splitReady } =
  useStoryboardDicts();
const { options: ratioOptions, ready: ratioReady } = useAspectRatioDict();

const splitMode = ref('');
const promptMode = ref('');
const totalDurationSeconds = ref<number>();
const shotCount = ref<number>();
const ratio = ref('');

watch(
  splitModes,
  (items) => {
    if (!splitMode.value && items.length) {
      splitMode.value = items[0]?.value ?? '';
    }
  },
  { immediate: true },
);
watch(
  promptModes,
  (items) => {
    if (!promptMode.value && items.length) {
      promptMode.value = items[0]?.value ?? '';
    }
  },
  { immediate: true },
);
watch(
  ratioOptions,
  (items) => {
    if (!ratio.value && items.length) {
      ratio.value = items[0]?.value ?? '';
    }
  },
  { immediate: true },
);
watch(
  () => props.projectRatio,
  (value) => {
    if (value) {
      ratio.value = value;
    }
  },
  { immediate: true },
);

const segments = ref<StoryboardSegment[]>([]);
const loading = ref(false);
const loadError = ref<DramaApiError>();
const loadedEpisodeKey = ref('');
const currentKey = computed(() => String(props.episodeId ?? ''));
let loadSeq = 0;

const imageRunning = ref(false);

type SegmentTab = 'assets' | 'overview' | 'script' | 'source';

const SEGMENT_TABS: Array<{ label: string; value: SegmentTab }> = [
  { label: '概览', value: 'overview' },
  { label: '剧本', value: 'script' },
  { label: '资产', value: 'assets' },
  { label: '原文', value: 'source' },
];

const expandedSegments = ref<Set<string>>(new Set());
const segmentTabs = ref<Record<string, SegmentTab>>({});

function isSegmentTab(value: unknown): value is SegmentTab {
  return (
    typeof value === 'string' &&
    SEGMENT_TABS.some((item) => item.value === value)
  );
}

function isSegmentExpanded(segmentId: number | string) {
  return expandedSegments.value.has(String(segmentId));
}

function segmentTab(segmentId: number | string) {
  return segmentTabs.value[String(segmentId)] ?? 'overview';
}

function setSegmentTab(segmentId: number | string, value: unknown) {
  if (!isSegmentTab(value)) {
    return;
  }
  segmentTabs.value[String(segmentId)] = value;
}

function editSegment(segmentId: number | string) {
  expandedSegments.value.add(String(segmentId));
  segmentTabs.value[String(segmentId)] = 'script';
}

function collapseSegment(segmentId: number | string) {
  expandedSegments.value.delete(String(segmentId));
}

interface ShotDraftFields {
  blocking: string;
  camera: string;
  characters: string[];
  description: string;
  dialogue: string;
  durationSeconds?: number;
  imagePrompt: string;
  props: ShotScriptProp[];
  sceneSeq?: number;
  shotType: string;
  sound: string;
  transition: string;
}

interface ShotDraft extends ShotDraftFields {
  loaded: ShotDraftFields;
  saveError?: DramaApiError;
  saving: boolean;
}

const drafts = ref<Record<string, ShotDraft>>({});

function fieldsOf(shot: StoryboardShot): ShotDraftFields {
  return {
    blocking: shot.blocking ?? '',
    camera: shot.camera ?? '',
    characters: [...(shot.characters ?? [])],
    description: shot.description ?? '',
    dialogue: shot.dialogue ?? '',
    durationSeconds: shot.durationSeconds,
    imagePrompt: shot.imagePrompt ?? '',
    props: (shot.props ?? []).map((item) => ({ ...item })),
    sceneSeq: shot.sceneSeq,
    shotType: shot.shotType ?? '',
    sound: shot.sound ?? '',
    transition: shot.transition ?? '',
  };
}

function snapshotFields(fields: ShotDraftFields): ShotDraftFields {
  return {
    ...fields,
    characters: [...fields.characters],
    props: fields.props.map((item) => ({ ...item })),
  };
}

function propsSignature(items: ShotScriptProp[]) {
  return items
    .map((item) => `${item.elementId ?? ''}:${item.name}`)
    .join('\u0000');
}

function fieldsEqual(a: ShotDraftFields, b: ShotDraftFields) {
  return (
    a.blocking === b.blocking &&
    a.camera === b.camera &&
    a.characters.join('\u0000') === b.characters.join('\u0000') &&
    a.description === b.description &&
    a.dialogue === b.dialogue &&
    a.durationSeconds === b.durationSeconds &&
    a.imagePrompt === b.imagePrompt &&
    propsSignature(a.props) === propsSignature(b.props) &&
    a.sceneSeq === b.sceneSeq &&
    a.shotType === b.shotType &&
    a.sound === b.sound &&
    a.transition === b.transition
  );
}

function draftFor(shot: StoryboardShot) {
  return drafts.value[String(shot.shotId)];
}

const storyboardDirty = computed(() =>
  Object.values(drafts.value).some((draft) => !fieldsEqual(draft, draft.loaded)),
);

const shotCountTotal = computed(() =>
  segments.value.reduce((total, segment) => total + (segment.shots?.length ?? 0), 0),
);

watch(
  [() => segments.value.length, shotCountTotal],
  ([segmentCount, shotCount]) => {
    emit('statsChange', { segmentCount, shotCount });
  },
  { immediate: true },
);

const characterOptions = computed(() => {
  const names = new Set<string>();
  for (const segment of segments.value) {
    for (const shot of segment.shots ?? []) {
      for (const name of shot.characters ?? []) {
        if (name) {
          names.add(name);
        }
      }
    }
  }
  return [...names].map((name) => ({ label: name, value: name }));
});

const propOptions = computed(() => {
  const names = new Set<string>();
  for (const segment of segments.value) {
    for (const shot of segment.shots ?? []) {
      for (const item of shot.props ?? []) {
        if (item.name) {
          names.add(item.name);
        }
      }
    }
  }
  return [...names].map((name) => ({ label: name, value: name }));
});

function buildDrafts(items: StoryboardSegment[]) {
  const next: Record<string, ShotDraft> = {};
  for (const segment of items) {
    for (const shot of segment.shots ?? []) {
      const fields = fieldsOf(shot);
      next[String(shot.shotId)] = {
        ...fields,
        loaded: snapshotFields(fields),
        saving: false,
      };
    }
  }
  drafts.value = next;
}

async function loadList() {
  const seq = ++loadSeq;
  loadError.value = undefined;
  segments.value = [];
  drafts.value = {};
  promptPreviews.value = {};
  if (!props.episodeId) {
    loadedEpisodeKey.value = '';
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const result = await aiAssetStoryboardApi.fetchStoryboardList(
      props.episodeId,
    );
    if (seq !== loadSeq) {
      return;
    }
    segments.value = result.segments ?? [];
    applyModels(result.models);
    buildDrafts(segments.value);
    loadedEpisodeKey.value = currentKey.value;
  } catch (error) {
    if (seq !== loadSeq) {
      return;
    }
    const info = parseApiError(error);
    loadError.value = info;
    loadedEpisodeKey.value = '';
  } finally {
    if (seq === loadSeq) {
      loading.value = false;
    }
  }
}

function propNames(draft: ShotDraft) {
  return draft.props.map((item) => item.name);
}

function setProps(draft: ShotDraft, names: unknown) {
  if (!Array.isArray(names)) {
    return;
  }
  const nextNames = names.filter(
    (name): name is string => typeof name === 'string',
  );
  draft.props = nextNames.map(
    (name) =>
      draft.props.find((item) => item.name === name) ?? { name },
  );
}

function saveDisabledReason(draft: ShotDraft) {
  if (draft.saving) {
    return '保存中';
  }
  if (imageRunning.value) {
    return '配图任务进行中';
  }
  if (!fieldsEqual(draft, draft.loaded)) {
    return '';
  }
  return '没有修改';
}

async function saveShotDraft(shot: StoryboardShot) {
  const draft = draftFor(shot);
  if (!draft || saveDisabledReason(draft)) {
    return;
  }
  const targetEpisodeId = props.episodeId;
  draft.saving = true;
  draft.saveError = undefined;
  try {
    const result = await aiAssetApi.saveShot({
      camera: draft.camera,
      characters: [...draft.characters],
      config: {
        script: {
          props: draft.props.map((item) => ({ ...item })),
          sound: draft.sound,
          transition: draft.transition,
        },
      },
      description: draft.description,
      dialogue: draft.dialogue,
      durationSeconds: draft.durationSeconds,
      id: shot.shotId,
      imagePrompt: draft.imagePrompt,
      sceneSeq: draft.sceneSeq,
      shotType: draft.shotType,
      direction: { ...(shot.direction ?? {}), blocking: draft.blocking },
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    Object.assign(shot, {
      blocking: draft.blocking,
      camera: draft.camera,
      characters: [...draft.characters],
      description: draft.description,
      dialogue: draft.dialogue,
      durationSeconds: draft.durationSeconds,
      imagePrompt: draft.imagePrompt,
      props: draft.props.map((item) => ({ ...item })),
      sceneSeq: draft.sceneSeq,
      shotType: draft.shotType,
      sound: draft.sound,
      transition: draft.transition,
    });
    draft.loaded = snapshotFields(draft);
    delete promptPreviews.value[String(shot.shotId)];
    if (result?.invalidatedTargets?.length) {
      message.warning('分镜已保存；下游关键帧/视频已失效，请重新生成');
    } else {
      message.success('分镜已保存');
    }
  } catch (error) {
    if (String(props.episodeId) === String(targetEpisodeId)) {
      draft.saveError = parseApiError(error);
    }
  } finally {
    draft.saving = false;
  }
}

const splitDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (!splitReady.value) {
    return '字典未配置 ai_storyboard_split_mode';
  }
  if (!splitMode.value) {
    return '请选择拆分模式';
  }
  if (storyboardDirty.value) {
    return '有未保存的分镜修改，请先保存';
  }
  if (imageRunning.value) {
    return '配图任务进行中';
  }
  if (splitting.value) {
    return '正在拆分';
  }
  if (loading.value) {
    return '分镜加载中';
  }
  return '';
});

const splitting = ref(false);
const splitError = ref<DramaApiError>();

async function splitStoryboard() {
  if (splitDisabledReason.value || !props.episodeId) {
    return;
  }
  const targetEpisodeId = props.episodeId;
  splitting.value = true;
  splitError.value = undefined;
  try {
    const result = await aiAssetStoryboardApi.splitStoryboard({
      episodeId: targetEpisodeId,
      mode: splitMode.value,
      shotCount: shotCount.value,
      totalDurationSeconds: totalDurationSeconds.value,
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    message.success(`已拆分 ${result.segments?.length ?? 0} 个分镜`);
    expandedSegments.value = new Set();
    segmentTabs.value = {};
    await loadList();
  } catch (error) {
    if (String(props.episodeId) === String(targetEpisodeId)) {
      splitError.value = parseApiError(error);
    }
  } finally {
    splitting.value = false;
  }
}

const promptsOpen = ref(false);
const prompts = ref<StoryboardSegmentPrompt[]>([]);
const promptsLoading = ref(false);
const promptsError = ref<DramaApiError>();
const promptRefreshError = ref<DramaApiError>();
const promptHighlight = ref<string>();

const promptDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (loading.value) {
    return '分镜加载中';
  }
  if (!segments.value.length) {
    return '还没有分镜，请先拆分分镜';
  }
  if (splitting.value) {
    return '正在拆分分镜';
  }
  if (!promptReady.value) {
    return '字典未配置 ai_storyboard_prompt_mode';
  }
  if (!promptMode.value) {
    return '请选择提示词模式';
  }
  if (storyboardDirty.value) {
    return '有未保存的分镜修改，请先保存';
  }
  if (promptsLoading.value) {
    return '正在生成提示词';
  }
  return '';
});

const sortedPrompts = computed(() => {
  const list = [...prompts.value];
  if (promptHighlight.value) {
    list.sort((a, b) => {
      const aHit = String(a.segmentId) === promptHighlight.value ? 0 : 1;
      const bHit = String(b.segmentId) === promptHighlight.value ? 0 : 1;
      return aHit - bHit;
    });
  }
  return list;
});

function segmentLabel(segmentId: number | string) {
  const segment = segments.value.find(
    (item) => String(item.segmentId) === String(segmentId),
  );
  return segment ? `分镜 ${segment.seq}` : `段落 #${segmentId}`;
}

interface PromptBlock {
  key: string;
  text: string;
}

/** 只按后端自己的 ▸镜头 标记切块展示；不重排、不压缩、不丢换行 */
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

async function generatePrompts(segmentId?: number | string) {
  if (promptDisabledReason.value || !props.episodeId) {
    return;
  }
  const targetEpisodeId = props.episodeId;
  promptsLoading.value = true;
  promptsError.value = undefined;
  promptRefreshError.value = undefined;
  promptHighlight.value =
    segmentId === undefined ? undefined : String(segmentId);
  promptsOpen.value = true;
  let generated = false;
  try {
    const result = await aiAssetStoryboardApi.generateStoryboardPrompts({
      episodeId: targetEpisodeId,
      mode: promptMode.value,
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    prompts.value = result;
    generated = true;
  } catch (error) {
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    prompts.value = [];
    promptsError.value = parseApiError(error);
  } finally {
    promptsLoading.value = false;
  }
  if (!generated || String(props.episodeId) !== String(targetEpisodeId)) {
    return;
  }
  // 弹层只读编译成功后，原地刷新落库 prompt，再重拉列表让卡片与弹层同版
  try {
    await aiAssetStoryboardApi.refreshStoryboardPrompts(targetEpisodeId);
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    await loadList();
  } catch (error) {
    if (String(props.episodeId) === String(targetEpisodeId)) {
      promptRefreshError.value = parseApiError(error);
    }
  }
}

async function copyPrompt(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('提示词已复制');
  } catch {
    message.error('复制失败');
  }
}

const modelItems = ref<StoryboardModelItem[]>([]);
const modelId = ref<number | string>();

function formatPercent(rate?: null | number) {
  return rate === null || rate === undefined
    ? '—'
    : `${Math.round(rate * 100)}%`;
}

function formatSpeed(seconds?: null | number) {
  if (seconds === null || seconds === undefined) {
    return '—';
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest > 0 ? `${minutes}分${rest}秒` : `${minutes}分`;
}

const models = computed(() =>
  modelItems.value.map((item) => ({
    label: [
      item.model ?? `模型 #${item.modelId}`,
      item.provider ? `（${item.provider}）` : '',
      `成功率 ${formatPercent(item.successRate)} · 速度 ${formatSpeed(item.generateSpeed)}`,
    ]
      .filter(Boolean)
      .join(' '),
    value: item.modelId,
  })),
);

const selectedModel = computed(() =>
  modelItems.value.find(
    (item) => String(item.modelId) === String(modelId.value),
  ),
);

/** 模型指标随 v2/storyboard/list 与 /images 返回，不再单独请求模型配置 */
function applyModels(items?: StoryboardModelItem[]) {
  if (!items) {
    return;
  }
  modelItems.value = items;
  if (
    !items.some(
      (item) => String(item.modelId) === String(modelId.value),
    )
  ) {
    modelId.value = items[0]?.modelId;
  }
}

const imageProgress = ref<TaskBatchCenterProgressResponse>();
const imagesSubmitting = ref(false);
const imagesError = ref<DramaApiError>();
const imageTaskId = ref<number | string>();
let imagePolling = false;
let imageTimer: ReturnType<typeof setInterval> | undefined;

const imageDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (loading.value) {
    return '分镜加载中';
  }
  if (!segments.value.length) {
    return '还没有分镜，请先拆分分镜';
  }
  if (splitting.value) {
    return '正在拆分分镜';
  }
  if (!models.value.length) {
    return '没有可用图片模型';
  }
  if (!modelId.value) {
    return '请选择图片模型';
  }
  if (!ratioReady.value) {
    return '字典未配置 ai_aspect_ratio';
  }
  if (!ratio.value) {
    return '请选择画面比例';
  }
  if (storyboardDirty.value) {
    return '有未保存的分镜修改，请先保存';
  }
  if (imageRunning.value) {
    return '配图任务进行中';
  }
  if (imagesSubmitting.value) {
    return '正在提交';
  }
  return '';
});

const imagePercent = computed(
  () => imageProgress.value?.progressPercent ?? 0,
);

function stopImagePolling() {
  if (imageTimer) {
    clearInterval(imageTimer);
    imageTimer = undefined;
  }
  imageRunning.value = false;
}

async function pollImages(taskId: number | string) {
  if (imagePolling) {
    return;
  }
  imagePolling = true;
  try {
    const progress =
      await aiAssetStoryboardApi.fetchStoryboardImagesProgress(taskId);
    if (String(imageTaskId.value) !== String(taskId)) {
      return;
    }
    imageProgress.value = progress;
    const status = progress?.taskStatus;
    if (status === 3 || status === 4) {
      stopImagePolling();
      const failed = progress?.failedCount ?? 0;
      const dirty = storyboardDirty.value;
      const suffix = dirty ? '；有未保存修改，保存后再刷新查看状态' : '';
      if (status === 4) {
        message.error(
          progress?.errorMsg
            ? `配图任务失败：${progress.errorMsg}${suffix}`
            : `配图任务失败${suffix}`,
        );
      } else if (failed > 0) {
        message.warning(`配图完成，失败 ${failed} 个${suffix}`);
      } else {
        message.success(`配图完成${suffix}`);
      }
      if (!dirty) {
        await loadList();
      }
    }
  } catch (error) {
    stopImagePolling();
    imagesError.value = parseApiError(error);
    message.error(formatApiError(imagesError.value));
  } finally {
    imagePolling = false;
  }
}

function startImagePolling(taskId: number | string) {
  stopImagePolling();
  imageTaskId.value = taskId;
  imageRunning.value = true;
  void pollImages(taskId);
  imageTimer = setInterval(() => void pollImages(taskId), 4000);
}

async function generateImages() {
  if (imageDisabledReason.value || !props.episodeId) {
    return;
  }
  const targetEpisodeId = props.episodeId;
  imagesSubmitting.value = true;
  imagesError.value = undefined;
  try {
    const result = await aiAssetStoryboardApi.generateStoryboardImages({
      episodeId: targetEpisodeId,
      modelId: modelId.value,
      ratio: ratio.value,
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    imageProgress.value = undefined;
    applyModels(result.models);
    startImagePolling(result.taskId);
    message.success('已提交配图任务');
  } catch (error) {
    if (String(props.episodeId) === String(targetEpisodeId)) {
      imagesError.value = parseApiError(error);
    }
  } finally {
    imagesSubmitting.value = false;
  }
}

const refreshDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (loading.value) {
    return '分镜加载中';
  }
  if (storyboardDirty.value) {
    return '有未保存的分镜修改，请先保存';
  }
  return '';
});

function generationMeta(shot: StoryboardShot) {
  const status = shot.generationStatus;
  if (status === 5) {
    return { color: 'error', label: '失败' };
  }
  if (status === 1) {
    return { color: 'processing', label: '生成中' };
  }
  if (status === 2 || status === 3) {
    return { color: 'success', label: '已出图' };
  }
  return { color: 'default', label: '待出图' };
}

function shotImage(shot: StoryboardShot) {
  return (
    shot.imageThumbnailUrl ??
    shot.imageUrl ??
    shot.keyframeThumbnailUrl ??
    shot.keyframeUrl
  );
}

function segmentHasImage(segment: StoryboardSegment) {
  return (segment.shots ?? []).some(
    (shot) =>
      Boolean(shotImage(shot)) ||
      shot.generationStatus === 2 ||
      shot.generationStatus === 3 ||
      shot.keyframeStatus === 2,
  );
}

function segmentStatus(segment: StoryboardSegment) {
  const shots = segment.shots ?? [];
  if (shots.some((shot) => shot.generationStatus === 5)) {
    return { color: 'error', label: '失败' };
  }
  if (shots.some((shot) => shot.generationStatus === 1)) {
    return { color: 'processing', label: '生成中' };
  }
  if (
    shots.length > 0 &&
    shots.every(
      (shot) =>
        Boolean(shotImage(shot)) ||
        shot.generationStatus === 2 ||
        shot.generationStatus === 3,
    )
  ) {
    return { color: 'success', label: '已出图' };
  }
  return { color: 'default', label: '待出图' };
}

function shotDescription(shot: StoryboardShot) {
  return (shot.description ?? '').trim() || '还没写';
}

function shotDynamic(shot: StoryboardShot) {
  return (
    [shot.direction?.lens, shot.direction?.composition]
      .filter((item) => Boolean(item))
      .join(' · ') || '还没写'
  );
}

const SHOT_TYPE_LABELS: Record<string, string> = {
  close: '特写',
  insert: '插入',
  medium: '中近景',
  over_shoulder: '正反打',
  pov: '主观',
  wide: '全景',
};

const CAMERA_LABELS: Record<string, string> = {
  dolly: '移',
  fixed: '固定',
  handheld: '手持',
  move: '移',
  pan: '摇',
  pull: '拉',
  push: '推',
  static: '固定',
  tilt: '摇',
  track: '移',
};

function containsChinese(value: string) {
  return /[\u4E00-\u9FA5]/.test(value);
}

function shotTypeLabel(raw?: string) {
  const value = raw?.trim() ?? '';
  if (!value) {
    return '';
  }
  return (
    SHOT_TYPE_LABELS[value.toLowerCase()] ??
    (containsChinese(value) ? value : '中景')
  );
}

function cameraLabel(raw?: string) {
  const value = raw?.trim() ?? '';
  if (!value) {
    return '';
  }
  return (
    CAMERA_LABELS[value.toLowerCase()] ??
    (containsChinese(value) ? value : '')
  );
}

function shotSeconds(shot: StoryboardShot) {
  return `${shot.durationSeconds ?? 0}秒`;
}

function shotCameraLine(shot: StoryboardShot) {
  return [shotTypeLabel(shot.shotType), cameraLabel(shot.camera), shotSeconds(shot)]
    .filter((item) => Boolean(item))
    .join(' · ');
}

/** 与后端一致：lens 只有包含运镜语义时才当运镜句，焦距等回退 shot.camera */
function shotMovement(shot: StoryboardShot) {
  const lens = shot.direction?.lens?.trim() ?? '';
  if (
    lens &&
    /镜头|机位|运镜|推|拉|摇|移|跟拍|升降|环绕|手持|俯拍|仰拍/.test(lens)
  ) {
    return lens;
  }
  return cameraLabel(shot.camera);
}

/** 原文 Tab：按列表真实镜头字段还原逐镜十要素块，不补写、不重排 */
function shotSourceText(shot: StoryboardShot) {
  const lines = [`▸ 镜头 ${shot.seq ?? '-'}（${shotSeconds(shot)}）`];
  if (shot.transition?.trim()) {
    lines.push(`转场：${shot.transition.trim()}`);
  }
  if (shot.characters?.length) {
    lines.push(shot.characters.join('、'));
  }
  if (shot.sceneSeq !== undefined) {
    lines.push(`空间：第 ${shot.sceneSeq} 场`);
  }
  const props = (shot.props ?? [])
    .map((item) => item.name)
    .filter((name) => Boolean(name));
  if (props.length) {
    lines.push(`道具：${props.join('、')}`);
  }
  lines.push(
    `机位与镜头：${[
      shotTypeLabel(shot.shotType),
      shotMovement(shot),
      shotSeconds(shot),
    ]
      .filter((item) => Boolean(item))
      .join('，')}`,
  );
  if (shot.blocking?.trim()) {
    lines.push(`人物站位：${shot.blocking.trim()}`);
  }
  if (shot.description?.trim()) {
    lines.push(`动作与表情细节：${shot.description.trim()}`);
    lines.push(`镜头画面描述：${shot.description.trim()}`);
  }
  if (shot.imagePrompt?.trim()) {
    lines.push(`画面提示：${shot.imagePrompt.trim()}`);
  }
  if (shot.sound?.trim()) {
    lines.push(`声音：${shot.sound.trim()}`);
  }
  if (shot.dialogue?.trim()) {
    lines.push('对白：', shot.dialogue.trim());
  }
  return lines.join('\n');
}


const PREVIEW_TYPES: Array<{
  label: string;
  type: StoryboardPromptPreviewType;
}> = [
  { label: '图片提示词（实际出图）', type: 'image' },
  { label: '视频提示词（实际生成）', type: 'video' },
];

interface ShotPromptPreviewState {
  error?: DramaApiError;
  image?: StoryboardPromptPreviewResult;
  imageLoading: boolean;
  video?: StoryboardPromptPreviewResult;
  videoLoading: boolean;
}

const promptPreviews = ref<Record<string, ShotPromptPreviewState>>({});

function promptPreviewState(shot: StoryboardShot) {
  return promptPreviews.value[String(shot.shotId)];
}

function ensurePromptPreviewState(shot: StoryboardShot) {
  const key = String(shot.shotId);
  let state = promptPreviews.value[key];
  if (!state) {
    state = { imageLoading: false, videoLoading: false };
    promptPreviews.value[key] = state;
  }
  return state;
}

function isPreviewLoading(
  shot: StoryboardShot,
  type: StoryboardPromptPreviewType,
) {
  const state = promptPreviewState(shot);
  return type === 'image'
    ? Boolean(state?.imageLoading)
    : Boolean(state?.videoLoading);
}

function previewResult(
  shot: StoryboardShot,
  type: StoryboardPromptPreviewType,
) {
  const state = promptPreviewState(shot);
  return type === 'image' ? state?.image : state?.video;
}

function previewPrompt(
  shot: StoryboardShot,
  type: StoryboardPromptPreviewType,
) {
  return previewResult(shot, type)?.prompt ?? '';
}

function skillMetaLabel(meta?: null | StoryboardPromptSkillMeta) {
  if (!meta) {
    return '';
  }
  return [meta.name, meta.type].filter(Boolean).join(' · ');
}

function previewSkill(
  shot: StoryboardShot,
  type: StoryboardPromptPreviewType,
) {
  return skillMetaLabel(previewResult(shot, type)?.skillMeta);
}

async function loadPromptPreview(
  shot: StoryboardShot,
  type: StoryboardPromptPreviewType,
) {
  const state = ensurePromptPreviewState(shot);
  if (type === 'image' ? state.imageLoading : state.videoLoading) {
    return;
  }
  const targetEpisodeId = props.episodeId;
  state.error = undefined;
  if (type === 'image') {
    state.imageLoading = true;
  } else {
    state.videoLoading = true;
  }
  try {
    const result = await aiAssetStoryboardApi.previewStoryboardShotPrompt({
      shotId: shot.shotId,
      type,
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    if (type === 'image') {
      state.image = result;
    } else {
      state.video = result;
    }
  } catch (error) {
    if (String(props.episodeId) === String(targetEpisodeId)) {
      state.error = parseApiError(error);
    }
  } finally {
    if (type === 'image') {
      state.imageLoading = false;
    } else {
      state.videoLoading = false;
    }
  }
}

const assetGraph = ref<NovelAssetGraph>();
const assetGraphLoading = ref(false);

async function loadAssetGraph() {
  assetGraph.value = undefined;
  if (!props.novelId) {
    return;
  }
  assetGraphLoading.value = true;
  try {
    assetGraph.value = await aiAssetApi.fetchNovelAssetGraph(
      props.novelId,
      true,
    );
  } catch {
    assetGraph.value = undefined;
  } finally {
    assetGraphLoading.value = false;
  }
}

const characterAssetOptions = computed(() =>
  (assetGraph.value?.characters ?? []).map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

const sceneAssetOptions = computed(() =>
  (assetGraph.value?.scenes ?? []).map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

function characterAssetName(id: number | string) {
  const character = assetGraph.value?.characters.find(
    (item) => String(item.id) === String(id),
  );
  return character?.name ?? `角色 #${id}`;
}

function sceneAssetName(shot: StoryboardShot) {
  if (shot.sceneName) {
    return shot.sceneName;
  }
  if (
    shot.sceneId === undefined ||
    shot.sceneId === null ||
    shot.sceneId === ''
  ) {
    return '';
  }
  const scene = assetGraph.value?.scenes.find(
    (item) => String(item.id) === String(shot.sceneId),
  );
  return scene?.name ?? `场景 #${shot.sceneId}`;
}

function shotPropLabel(item: ShotScriptProp) {
  return item.elementId === undefined || item.elementId === null
    ? item.name
    : `${item.name} · #${item.elementId}`;
}

const assetSavingIds = ref<Set<string>>(new Set());

function isAssetSaving(shot: StoryboardShot) {
  return assetSavingIds.value.has(String(shot.shotId));
}

function markAssetSaving(shot: StoryboardShot, saving: boolean) {
  const next = new Set(assetSavingIds.value);
  if (saving) {
    next.add(String(shot.shotId));
  } else {
    next.delete(String(shot.shotId));
  }
  assetSavingIds.value = next;
}

const assetDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (!props.novelId) {
    return '缺少项目，无法加载实体';
  }
  if (loading.value) {
    return '分镜加载中';
  }
  if (splitting.value) {
    return '正在拆分分镜';
  }
  if (assetGraphLoading.value) {
    return '资产加载中';
  }
  if (
    !characterAssetOptions.value.length &&
    !sceneAssetOptions.value.length
  ) {
    return '项目暂无角色/场景实体，请先在实体页提取';
  }
  if (storyboardDirty.value) {
    return '有未保存的分镜修改，请先保存';
  }
  if (imageRunning.value) {
    return '配图任务进行中';
  }
  return '';
});

function assetReason(shot: StoryboardShot) {
  return isAssetSaving(shot) ? '保存中' : assetDisabledReason.value;
}

const assetOpen = ref(false);
const assetShot = ref<StoryboardShot>();
const assetCharacterIds = ref<Array<number | string>>([]);
const assetSceneId = ref<number | string>();
const assetSaving = ref(false);
const assetError = ref<DramaApiError>();

function openAssetBind(shot: StoryboardShot) {
  if (assetDisabledReason.value) {
    return;
  }
  assetShot.value = shot;
  assetCharacterIds.value = [...(shot.characterIds ?? [])];
  assetSceneId.value = shot.sceneId ?? undefined;
  assetError.value = undefined;
  assetOpen.value = true;
}

async function saveAssetBind() {
  if (!assetShot.value || assetSaving.value) {
    return;
  }
  const shotId = assetShot.value.shotId;
  const targetEpisodeId = props.episodeId;
  assetSaving.value = true;
  assetError.value = undefined;
  try {
    await aiAssetStoryboardApi.saveStoryboardShotAssets({
      characterIds: [...assetCharacterIds.value],
      sceneId: assetSceneId.value ?? null,
      shotId,
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    assetOpen.value = false;
    message.success('分镜资产已更新');
    await loadList();
  } catch (error) {
    assetError.value = parseApiError(error);
  } finally {
    assetSaving.value = false;
  }
}

interface ShotAssetsPatch {
  characterIds?: Array<number | string>;
  sceneId?: null | number | string;
}

async function updateShotAssets(
  shot: StoryboardShot,
  patch: ShotAssetsPatch,
) {
  if (assetDisabledReason.value || isAssetSaving(shot)) {
    return;
  }
  const targetEpisodeId = props.episodeId;
  markAssetSaving(shot, true);
  try {
    await aiAssetStoryboardApi.saveStoryboardShotAssets({
      shotId: shot.shotId,
      ...patch,
    });
    if (String(props.episodeId) !== String(targetEpisodeId)) {
      return;
    }
    await loadList();
  } catch (error) {
    message.error(formatApiError(parseApiError(error)));
  } finally {
    markAssetSaving(shot, false);
  }
}

function unbindCharacter(shot: StoryboardShot, characterId: number | string) {
  const next = (shot.characterIds ?? []).filter(
    (item) => String(item) !== String(characterId),
  );
  void updateShotAssets(shot, { characterIds: next });
}

function unbindScene(shot: StoryboardShot) {
  void updateShotAssets(shot, { sceneId: null });
}

function confirmGenerateImages() {
  if (imageDisabledReason.value) {
    return;
  }
  Modal.confirm({
    title: '生成画面',
    content:
      '当前 v2 配图接口按整集批量生成，将为全部分镜提交配图任务；是否继续？',
    okText: '继续',
    cancelText: '取消',
    onOk: () => generateImages(),
  });
}

watch(storyboardDirty, (value) => emit('dirtyChange', value), {
  immediate: true,
});

watch(
  currentKey,
  () => {
    loadSeq += 1;
    stopImagePolling();
    imageProgress.value = undefined;
    imageTaskId.value = undefined;
    splitError.value = undefined;
    imagesError.value = undefined;
    promptsOpen.value = false;
    prompts.value = [];
    promptHighlight.value = undefined;
    promptRefreshError.value = undefined;
    segments.value = [];
    drafts.value = {};
    promptPreviews.value = {};
    expandedSegments.value = new Set();
    segmentTabs.value = {};
    loadError.value = undefined;
    loadedEpisodeKey.value = '';
    assetOpen.value = false;
    assetShot.value = undefined;
    if (!props.episodeId) {
      return;
    }
    void loadList();
  },
  { immediate: true },
);

watch(
  () => props.novelId,
  () => {
    assetOpen.value = false;
    assetShot.value = undefined;
    void loadAssetGraph();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopImagePolling();
});
</script>

<template>
  <div class="storyboard-panel">
    <div class="storyboard-next">
      <span class="storyboard-next__text">下一步：生成全部提示词</span>
      <span class="storyboard-next__hint">
        {{ segments.length }} 个分镜 · {{ shotCountTotal }} 个镜头
      </span>
      <span class="storyboard-next__spacer"></span>
      <Tooltip :title="promptDisabledReason">
        <span>
          <Button
            :disabled="Boolean(promptDisabledReason)"
            :loading="promptsLoading"
            size="small"
            type="primary"
            @click="generatePrompts()"
          >
            生成全部提示词
          </Button>
        </span>
      </Tooltip>
    </div>

    <div class="storyboard-actions">
      <Card
        class="storyboard-action-card storyboard-action-card--split"
        :body-style="{ padding: '12px' }"
      >
        <div class="storyboard-action-card__head">
          <span class="storyboard-action-card__icon">
            <ApartmentOutlined />
          </span>
          <div>
            <div class="storyboard-action-card__title">分镜生成</div>
            <div class="storyboard-action-card__hint">
              按模式/时长/镜头数拆分本集分镜
            </div>
          </div>
        </div>
        <div class="storyboard-action-card__field">
          <span>模式</span>
          <Select
            v-model:value="splitMode"
            :disabled="!splitReady || splitting"
            :options="splitModes"
            placeholder="拆分模式"
          />
        </div>
        <div class="storyboard-action-card__field">
          <span>期望总时长（秒）</span>
          <InputNumber
            v-model:value="totalDurationSeconds"
            :min="1"
            :precision="0"
            placeholder="可空"
          />
        </div>
        <div class="storyboard-action-card__field">
          <span>期望镜头数</span>
          <InputNumber
            v-model:value="shotCount"
            :min="1"
            :precision="0"
            placeholder="可空"
          />
        </div>
        <Alert
          v-if="!splitReady"
          message="字典未配置 ai_storyboard_split_mode"
          type="info"
          show-icon
        />
        <Tooltip :title="splitDisabledReason">
          <span>
            <Button
              :disabled="Boolean(splitDisabledReason)"
              :loading="splitting"
              type="primary"
              @click="splitStoryboard"
            >
              拆分分镜
            </Button>
          </span>
        </Tooltip>
        <Alert
          v-if="splitError"
          :message="formatApiError(splitError)"
          :type="splitError.notReady ? 'info' : 'error'"
          show-icon
        />
      </Card>

      <Card
        class="storyboard-action-card storyboard-action-card--prompt"
        :body-style="{ padding: '12px' }"
      >
        <div class="storyboard-action-card__head">
          <span class="storyboard-action-card__icon">
            <FileTextOutlined />
          </span>
          <div>
            <div class="storyboard-action-card__title">提示词生成</div>
            <div class="storyboard-action-card__hint">
              生成后弹层查看每段提示词，可复制
            </div>
          </div>
        </div>
        <div class="storyboard-action-card__field">
          <span>模式</span>
          <Select
            v-model:value="promptMode"
            :disabled="!promptReady || promptsLoading"
            :options="promptModes"
            placeholder="提示词模式"
          />
        </div>
        <Alert
          v-if="!promptReady"
          message="字典未配置 ai_storyboard_prompt_mode"
          type="info"
          show-icon
        />
        <Tooltip :title="promptDisabledReason">
          <span>
            <Button
              :disabled="Boolean(promptDisabledReason)"
              :loading="promptsLoading"
              type="primary"
              @click="generatePrompts()"
            >
              生成全部提示词
            </Button>
          </span>
        </Tooltip>
      </Card>

      <Card
        class="storyboard-action-card storyboard-action-card--image"
        :body-style="{ padding: '12px' }"
      >
        <div class="storyboard-action-card__head">
          <span class="storyboard-action-card__icon">
            <PictureOutlined />
          </span>
          <div>
            <div class="storyboard-action-card__title">图片生成</div>
            <div class="storyboard-action-card__hint">
              为全部镜头批量生成画面
            </div>
          </div>
        </div>
        <div class="storyboard-action-card__field">
          <span>模型</span>
          <Select
            v-model:value="modelId"
            :disabled="!models.length"
            :options="models"
            option-filter-prop="label"
            placeholder="图片模型"
            show-search
          />
        </div>
        <div v-if="selectedModel" class="storyboard-action-card__metrics">
          <span>成功率 {{ formatPercent(selectedModel.successRate) }}</span>
          <span>速度 {{ formatSpeed(selectedModel.generateSpeed) }}</span>
        </div>
        <div class="storyboard-action-card__field">
          <span>画面比例</span>
          <Select
            v-model:value="ratio"
            :disabled="!ratioReady"
            :options="ratioOptions"
            placeholder="画面比例"
          />
        </div>
        <div class="storyboard-action-card__field">
          <span>项目画风</span>
          <Tag :bordered="false" class="storyboard-action-card__style">
            {{ projectStyle || '未设置' }}
          </Tag>
        </div>
        <Alert
          v-if="!ratioReady"
          message="字典未配置 ai_aspect_ratio"
          type="info"
          show-icon
        />
        <Tooltip :title="imageDisabledReason">
          <span>
            <Button
              :disabled="Boolean(imageDisabledReason)"
              :loading="imagesSubmitting"
              type="primary"
              @click="generateImages"
            >
              全部生成配图
            </Button>
          </span>
        </Tooltip>
        <div
          v-if="imageRunning || imageProgress"
          class="storyboard-action-card__progress"
        >
          <div class="storyboard-action-card__counts">
            <span>生成中 {{ imageProgress?.pendingCount ?? 0 }}</span>
            <span>失败 {{ imageProgress?.failedCount ?? 0 }}</span>
            <span>已出图 {{ imageProgress?.successCount ?? 0 }}</span>
          </div>
          <div class="storyboard-action-card__bar">
            <i :style="{ width: `${imagePercent}%` }"></i>
          </div>
          <div class="storyboard-action-card__hint">
            {{ imageProgress?.processedCount ?? 0 }}/{{ imageProgress?.totalCount ?? 0 }}
            · {{ imagePercent }}%
          </div>
        </div>
        <Alert
          v-if="imagesError"
          :message="formatApiError(imagesError)"
          :type="imagesError.notReady ? 'info' : 'error'"
          show-icon
        />
      </Card>
    </div>

    <Card class="storyboard-list" :body-style="{ padding: 0 }">
      <div class="storyboard-list__head">
        <span class="storyboard-list__title">分镜列表</span>
        <span class="storyboard-list__hint">
          {{ segments.length }} 个分镜 · {{ shotCountTotal }} 个镜头
        </span>
        <span class="storyboard-list__spacer"></span>
        <Tooltip :title="refreshDisabledReason">
          <span>
            <Button
              :disabled="Boolean(refreshDisabledReason)"
              :loading="loading"
              size="small"
              @click="loadList"
            >
              <template #icon><ReloadOutlined /></template>
              刷新
            </Button>
          </span>
        </Tooltip>
      </div>

      <div class="storyboard-list__body">
        <Empty
          v-if="!episodeId"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="先选择剧集"
        />
        <Alert
          v-else-if="loadError"
          :message="formatApiError(loadError)"
          :type="loadError.notReady ? 'info' : 'error'"
          show-icon
        >
          <template v-if="loadError.retryable" #action>
            <Button size="small" @click="loadList">重新加载</Button>
          </template>
        </Alert>
        <Empty
          v-else-if="!loading && !segments.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="还没有分镜，先拆分分镜"
        />
        <div v-else class="storyboard-segments">
          <Card
            v-for="segment in segments"
            :key="segment.segmentId"
            class="storyboard-segment"
            :body-style="{ padding: 0 }"
          >
            <div class="storyboard-segment__head">
              <span class="storyboard-segment__title">
                分镜 {{ segment.seq }} ·
                <span
                  class="storyboard-segment__status"
                  :class="`is-${segmentStatus(segment).color}`"
                >
                  {{ segmentStatus(segment).label }}
                </span>
                · {{ segment.durationSeconds ?? 0 }}s
              </span>
              <Tag
                v-if="!segmentHasImage(segment)"
                :bordered="false"
                color="warning"
              >
                尚未绑定画面
              </Tag>
              <span class="storyboard-segment__spacer"></span>
              <Button size="small" @click="editSegment(segment.segmentId)">
                编辑分镜
              </Button>
              <Button
                v-if="isSegmentExpanded(segment.segmentId)"
                size="small"
                type="text"
                @click="collapseSegment(segment.segmentId)"
              >
                收起
              </Button>
              <Tooltip :title="imageDisabledReason">
                <span>
                  <Button
                    :disabled="Boolean(imageDisabledReason)"
                    :loading="imagesSubmitting"
                    size="small"
                    @click="confirmGenerateImages"
                  >
                    <template #icon><PictureOutlined /></template>
                    生成画面
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="待 P9（无生成视频契约）">
                <span>
                  <Button disabled size="small" type="text">生成视频</Button>
                </span>
              </Tooltip>
              <Tooltip title="待 P10（无 3D 预演契约）">
                <span>
                  <Button disabled size="small" type="text">3D 预演</Button>
                </span>
              </Tooltip>
              <Tooltip title="待 P9（无导演台契约）">
                <span>
                  <Button disabled size="small" type="text">
                    在导演台里编辑
                  </Button>
                </span>
              </Tooltip>
            </div>

            <div
              v-if="isSegmentExpanded(segment.segmentId)"
              class="storyboard-segment__expanded"
            >
              <Tabs
                :active-key="segmentTab(segment.segmentId)"
                class="storyboard-segment__tabs"
                size="small"
                @change="(key) => setSegmentTab(segment.segmentId, key)"
              >
                <Tabs.TabPane key="overview" tab="概览">
                  <div
                    v-if="!segment.shots?.length"
                    class="storyboard-tab-empty"
                  >
                    该分镜暂无镜头
                  </div>
                  <div v-else class="storyboard-overview">
                    <div
                      v-for="shot in segment.shots"
                      :key="shot.shotId"
                      class="overview-shot"
                    >
                      <div class="overview-shot__head">
                        <span class="overview-shot__title">
                          ▸ 镜头 {{ shot.seq ?? '-' }}（{{
                            shotSeconds(shot)
                          }}）
                        </span>
                        <span class="overview-shot__characters">
                          <template v-if="shot.characters?.length">
                            <Tag
                              v-for="name in shot.characters"
                              :key="name"
                              :bordered="false"
                            >
                              {{ name }}
                            </Tag>
                          </template>
                          <span v-else class="overview-shot__muted">—</span>
                        </span>
                        <Tag
                          :bordered="false"
                          :color="generationMeta(shot).color"
                        >
                          {{ generationMeta(shot).label }}
                        </Tag>
                      </div>
                      <div class="overview-shot__body">
                        <div class="overview-shot__media">
                          <Image
                            v-if="shotImage(shot)"
                            :src="shotImage(shot)"
                            :preview="{ src: shotImage(shot) }"
                            class="overview-shot__image"
                          />
                          <div v-else class="overview-shot__placeholder">
                            <PictureOutlined />
                            <span>暂无画面</span>
                          </div>
                        </div>
                        <div class="overview-shot__content">
                          <div class="overview-shot__summary">
                            动作与表情细节：{{ shotDescription(shot) }}
                          </div>
                          <div class="overview-shot__bottom">
                            <div class="overview-shot__field">
                              <div class="overview-shot__field-head">
                                <span>画面描述</span>
                                <Button
                                  size="small"
                                  type="text"
                                  @click="editSegment(segment.segmentId)"
                                >
                                  编辑
                                </Button>
                              </div>
                              <b>{{ shotDescription(shot) }}</b>
                            </div>
                            <div class="overview-shot__field">
                              <div class="overview-shot__field-head">
                                <span>镜头动态</span>
                                <Button
                                  size="small"
                                  type="text"
                                  @click="editSegment(segment.segmentId)"
                                >
                                  编辑
                                </Button>
                              </div>
                              <b>{{ shotDynamic(shot) }}</b>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane key="script" tab="剧本">
                  <div
                    v-if="!segment.shots?.length"
                    class="storyboard-tab-empty"
                  >
                    该分镜暂无镜头
                  </div>
                  <div v-else class="storyboard-script">
                    <div
                      v-for="shot in segment.shots"
                      :key="shot.shotId"
                      class="script-shot"
                    >
                      <div class="script-shot__head">
                        <span>镜头 {{ shot.seq ?? '-' }}</span>
                        <span class="overview-shot__muted">
                          {{ shotCameraLine(shot) }}
                        </span>
                        <span class="storyboard-segment__spacer"></span>
                        <Tooltip
                          :title="
                            draftFor(shot)
                              ? saveDisabledReason(draftFor(shot)!)
                              : '镜头草稿未就绪'
                          "
                        >
                          <span>
                            <Button
                              :disabled="
                                !draftFor(shot) ||
                                Boolean(saveDisabledReason(draftFor(shot)!))
                              "
                              :loading="Boolean(draftFor(shot)?.saving)"
                              size="small"
                              type="primary"
                              @click="saveShotDraft(shot)"
                            >
                              保存本镜
                            </Button>
                          </span>
                        </Tooltip>
                      </div>
                      <div v-if="draftFor(shot)" class="script-shot__fields">
                        <div class="script-shot__grid">
                          <label class="shot-editor__field">
                            <span>角色</span>
                            <Select
                              v-model:value="draftFor(shot)!.characters"
                              :options="characterOptions"
                              mode="tags"
                              placeholder="角色名"
                            />
                          </label>
                          <label class="shot-editor__field">
                            <span>空间 / 场次</span>
                            <InputNumber
                              v-model:value="draftFor(shot)!.sceneSeq"
                              :min="1"
                              :precision="0"
                            />
                          </label>
                          <label class="shot-editor__field">
                            <span>道具</span>
                            <Select
                              :options="propOptions"
                              :value="propNames(draftFor(shot)!)"
                              mode="tags"
                              placeholder="道具名"
                              @change="
                                (names) => setProps(draftFor(shot)!, names)
                              "
                            />
                          </label>
                          <label class="shot-editor__field">
                            <span>机位与镜头 · 景别</span>
                            <Input
                              v-model:value="draftFor(shot)!.shotType"
                              placeholder="如 中景"
                            />
                          </label>
                          <label class="shot-editor__field">
                            <span>机位与镜头 · 运镜</span>
                            <Input
                              v-model:value="draftFor(shot)!.camera"
                              placeholder="如 推镜"
                            />
                          </label>
                        </div>
                        <label
                          class="shot-editor__field shot-editor__field--block"
                        >
                          <span>人物站位</span>
                          <Input.TextArea
                            v-model:value="draftFor(shot)!.blocking"
                            :rows="2"
                            placeholder="人物站位/走位"
                          />
                        </label>
                        <label
                          class="shot-editor__field shot-editor__field--block"
                        >
                          <span>镜头画面描述</span>
                          <Input.TextArea
                            v-model:value="draftFor(shot)!.description"
                            :rows="3"
                            placeholder="镜头画面描述（契约 description）"
                          />
                        </label>
                        <label
                          class="shot-editor__field shot-editor__field--block"
                        >
                          <span>图片提示词（拆分落库）</span>
                          <Input.TextArea
                            v-model:value="draftFor(shot)!.imagePrompt"
                            :rows="3"
                            placeholder="画面提示词"
                          />
                        </label>
                        <label
                          class="shot-editor__field shot-editor__field--block"
                        >
                          <span>视频提示词（拆分落库）</span>
                          <Input.TextArea
                            :rows="3"
                            :value="shot.videoPrompt ?? ''"
                            placeholder="暂无"
                            readonly
                          />
                        </label>
                        <div class="script-shot__grid">
                          <label class="shot-editor__field">
                            <span>声音</span>
                            <Input
                              v-model:value="draftFor(shot)!.sound"
                              placeholder="环境音/音效"
                            />
                          </label>
                          <label class="shot-editor__field">
                            <span>转场</span>
                            <Input
                              v-model:value="draftFor(shot)!.transition"
                              placeholder="转场方式"
                            />
                          </label>
                        </div>
                        <label
                          class="shot-editor__field shot-editor__field--block"
                        >
                          <span>对白（角色:台词）</span>
                          <Input.TextArea
                            v-model:value="draftFor(shot)!.dialogue"
                            :rows="2"
                            placeholder="角色: 台词"
                          />
                        </label>

                        <div class="prompt-preview">
                          <div class="prompt-preview__head">
                            <span class="prompt-preview__title">
                              实际生成提示词
                            </span>
                            <Button
                              v-for="item in PREVIEW_TYPES"
                              :key="item.type"
                              :loading="isPreviewLoading(shot, item.type)"
                              size="small"
                              @click="loadPromptPreview(shot, item.type)"
                            >
                              {{
                                item.type === 'image' ? '预览图片' : '预览视频'
                              }}
                            </Button>
                            <span class="overview-shot__muted">
                              只读预览，不落库
                            </span>
                          </div>
                          <Alert
                            v-if="promptPreviewState(shot)?.error"
                            :message="
                              formatApiError(promptPreviewState(shot)!.error!)
                            "
                            :type="
                              promptPreviewState(shot)!.error!.notReady
                                ? 'info'
                                : 'error'
                            "
                            show-icon
                          />
                          <template
                            v-for="item in PREVIEW_TYPES"
                            :key="item.type"
                          >
                            <div
                              v-if="previewResult(shot, item.type)"
                              class="prompt-preview__block"
                            >
                              <div class="prompt-preview__block-head">
                                <span>{{ item.label }}</span>
                                <Button
                                  size="small"
                                  type="text"
                                  @click="
                                    copyPrompt(
                                      previewPrompt(shot, item.type),
                                    )
                                  "
                                >
                                  复制
                                </Button>
                              </div>
                              <pre class="prompt-preview__text">{{
                                previewPrompt(shot, item.type)
                              }}</pre>
                              <span
                                v-if="previewSkill(shot, item.type)"
                                class="prompt-preview__skill"
                              >
                                Skill：{{ previewSkill(shot, item.type) }}
                              </span>
                            </div>
                          </template>
                        </div>

                        <Alert
                          v-if="draftFor(shot)!.saveError"
                          :message="formatApiError(draftFor(shot)!.saveError)"
                          :type="
                            draftFor(shot)!.saveError!.notReady
                              ? 'info'
                              : 'error'
                          "
                          show-icon
                        />
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane key="assets" tab="资产">
                  <div
                    v-if="!segment.shots?.length"
                    class="storyboard-tab-empty"
                  >
                    该分镜暂无镜头
                  </div>
                  <div v-else class="storyboard-assets">
                    <div
                      v-for="shot in segment.shots"
                      :key="shot.shotId"
                      class="asset-shot"
                    >
                      <div class="asset-shot__head">
                        <span>镜头 {{ shot.seq ?? '-' }}</span>
                        <span class="overview-shot__muted">
                          角色（{{ shot.characterIds?.length ?? 0 }}）
                        </span>
                        <span class="storyboard-segment__spacer"></span>
                        <Tooltip :title="assetReason(shot)">
                          <span>
                            <Button
                              :disabled="Boolean(assetReason(shot))"
                              :loading="isAssetSaving(shot)"
                              size="small"
                              @click="openAssetBind(shot)"
                            >
                              绑定资产
                            </Button>
                          </span>
                        </Tooltip>
                      </div>

                      <div class="asset-shot__row">
                        <span class="asset-shot__row-label">角色</span>
                        <div class="asset-shot__tags">
                          <Tag
                            v-for="id in shot.characterIds ?? []"
                            :key="id"
                            :bordered="false"
                            :closable="!isAssetSaving(shot)"
                            color="blue"
                            @close="unbindCharacter(shot, id)"
                          >
                            {{ characterAssetName(id) }}
                          </Tag>
                          <Tag
                            v-if="!shot.characterIds?.length"
                            :bordered="false"
                          >
                            未绑定
                          </Tag>
                          <span
                            v-if="shot.characters?.length"
                            class="asset-shot__aux"
                          >
                            脚本标注：{{ shot.characters.join('、') }}
                          </span>
                        </div>
                      </div>

                      <div class="asset-shot__row">
                        <span class="asset-shot__row-label">场景</span>
                        <div class="asset-shot__tags">
                          <Tag
                            v-if="
                              shot.sceneId !== undefined &&
                              shot.sceneId !== null &&
                              shot.sceneId !== ''
                            "
                            :bordered="false"
                            :closable="!isAssetSaving(shot)"
                            color="green"
                            @close="unbindScene(shot)"
                          >
                            {{ sceneAssetName(shot) }}
                          </Tag>
                          <Tag v-else :bordered="false">待关联</Tag>
                        </div>
                      </div>

                      <div class="asset-shot__row">
                        <span class="asset-shot__row-label">道具</span>
                        <div class="asset-shot__tags">
                          <Tag
                            v-for="item in shot.props ?? []"
                            :key="`${item.elementId ?? ''}-${item.name}`"
                            :bordered="false"
                          >
                            {{ shotPropLabel(item) }}
                          </Tag>
                          <Tag
                            v-if="!shot.props?.length"
                            :bordered="false"
                          >
                            无
                          </Tag>
                        </div>
                      </div>

                      <div class="asset-shot__dimensions">
                        <div
                          v-for="dimension in [
                            '机位与镜头',
                            '人物站位',
                            '镜头画面描述',
                            '画面提示',
                            '声音',
                            '转场',
                          ]"
                          :key="dimension"
                          class="asset-shot__dimension"
                        >
                          <span>{{ dimension }}</span>
                          <Tag :bordered="false">待关联</Tag>
                        </div>
                      </div>
                    </div>
                    <div class="storyboard-assets__hint">
                      角色/场景/道具按项目资产图谱绑定；其余维度暂不提供关联。
                    </div>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane key="source" tab="原文">
                  <div class="storyboard-source">
                    <div
                      v-if="!segment.shots?.length"
                      class="storyboard-tab-empty"
                    >
                      该分镜暂无镜头
                    </div>
                    <div
                      v-for="shot in segment.shots"
                      :key="shot.shotId"
                      class="source-shot"
                    >
                      <div class="source-shot__head">
                        <span>镜头 {{ shot.seq ?? '-' }}</span>
                        <Button
                          size="small"
                          type="text"
                          @click="copyPrompt(shotSourceText(shot))"
                        >
                          复制
                        </Button>
                      </div>
                      <pre class="source-shot__text">{{
                        shotSourceText(shot)
                      }}</pre>
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </div>
          </Card>
        </div>
        <VbenLoading :spinning="loading" class="storyboard-list__loading" />
      </div>
    </Card>

    <Modal
      v-model:open="assetOpen"
      :confirm-loading="assetSaving"
      :ok-button-props="{ disabled: assetSaving }"
      cancel-text="取消"
      ok-text="保存"
      title="绑定镜头资产"
      @ok="saveAssetBind"
    >
      <div class="asset-bind">
        <label class="asset-bind__field">
          <span>角色（可多选）</span>
          <Select
            v-model:value="assetCharacterIds"
            :options="characterAssetOptions"
            mode="multiple"
            placeholder="选择项目角色"
          />
        </label>
        <label class="asset-bind__field">
          <span>场景</span>
          <Select
            v-model:value="assetSceneId"
            :options="sceneAssetOptions"
            allow-clear
            placeholder="选择项目场景"
          />
        </label>
        <div
          v-if="!characterAssetOptions.length && !sceneAssetOptions.length"
          class="asset-bind__hint"
        >
          项目资产图谱暂无角色/场景，请先在实体页提取。
        </div>
        <Alert
          v-if="assetError"
          :message="formatApiError(assetError)"
          :type="assetError.notReady ? 'info' : 'error'"
          show-icon
        />
      </div>
    </Modal>

    <Drawer
      v-model:open="promptsOpen"
      placement="right"
      title="分镜提示词"
      width="860px"
    >
      <div class="prompts">
        <VbenLoading :spinning="promptsLoading" class="prompts__loading" />
        <Alert
          v-if="promptsError"
          :message="formatApiError(promptsError)"
          :type="promptsError.notReady ? 'info' : 'error'"
          show-icon
        />
        <Alert
          v-else-if="promptRefreshError"
          :message="formatApiError(promptRefreshError)"
          :type="promptRefreshError.notReady ? 'info' : 'error'"
          show-icon
        />
        <Empty
          v-else-if="!promptsLoading && !prompts.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="没有生成提示词"
        />
        <List
          v-else
          :data-source="sortedPrompts"
          :split="false"
          class="prompts__list"
        >
          <template #renderItem="{ item }">
            <List.Item class="prompt-item">
              <div class="prompt-item__head">
                <span>{{ segmentLabel(item.segmentId) }}</span>
                <Button
                  size="small"
                  type="text"
                  @click="copyPrompt(item.prompt)"
                >
                  复制整段
                </Button>
              </div>
              <div class="prompt-item__blocks">
                <div
                  v-for="block in splitPromptBlocks(item.prompt)"
                  :key="block.key"
                  class="prompt-block"
                >
                  <div class="prompt-block__head">
                    <span>提示词块</span>
                    <Button
                      size="small"
                      type="text"
                      @click="copyPrompt(block.text)"
                    >
                      复制
                    </Button>
                  </div>
                  <pre class="prompt-block__text">{{ block.text }}</pre>
                </div>
              </div>
            </List.Item>
          </template>
        </List>
      </div>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.storyboard-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.storyboard-next {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card))) 0%,
    hsl(var(--card)) 100%
  );
  border: 1px solid
    color-mix(in srgb, hsl(var(--primary)) 26%, hsl(var(--border)));
  border-radius: 10px;

  &__text {
    font-size: 13px;
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
}

.storyboard-actions {
  display: grid;
  flex: none;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.storyboard-action-card {
  --tint: hsl(var(--primary));
  --tint-fg: hsl(var(--primary-foreground));

  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--tint) 9%, hsl(var(--card))) 0%,
    hsl(var(--card)) 72%
  );
  border: 1px solid color-mix(in srgb, var(--tint) 20%, hsl(var(--border)));
  border-radius: 12px;

  :deep(.ant-card-body) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &--prompt {
    --tint: hsl(var(--success));
    --tint-fg: hsl(var(--success-foreground));
  }

  &--image {
    --tint: hsl(var(--warning));
    --tint-fg: hsl(var(--warning-foreground));
  }

  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 15px;
    color: var(--tint-fg);
    background: var(--tint);
    border-radius: 8px;
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

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    :deep(.ant-select),
    :deep(.ant-input-number) {
      width: 100%;
    }
  }

  &__metrics {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__style {
    width: fit-content;
    margin: 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__counts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__bar {
    height: 5px;
    overflow: hidden;
    background: hsl(var(--accent));
    border-radius: 999px;

    i {
      display: block;
      height: 100%;
      background: var(--tint);
      border-radius: 999px;
      transition: width 0.2s ease;
    }
  }
}

.storyboard-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  &__head {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid hsl(var(--border));
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
    padding: 12px;
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

.storyboard-segments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storyboard-segment {
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    background: color-mix(in srgb, hsl(var(--primary)) 4%, hsl(var(--card)));
    border-bottom: 1px solid hsl(var(--border));

    :deep(.ant-tag) {
      margin: 0;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__status {
    font-weight: 500;

    &.is-success {
      color: hsl(var(--success));
    }

    &.is-processing {
      color: hsl(var(--primary));
    }

    &.is-error {
      color: hsl(var(--destructive));
    }

    &.is-default {
      color: hsl(var(--muted-foreground));
    }
  }

  &__spacer {
    flex: 1;
  }

  &__expanded {
    background: hsl(var(--card));
  }

  &__tabs {
    padding: 0 12px;

    :deep(.ant-tabs-nav) {
      margin-bottom: 8px;
    }

    :deep(.ant-tabs-content-holder) {
      max-height: 520px;
      overflow-y: auto;
    }
  }
}

.storyboard-tab-empty {
  padding: 24px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.storyboard-overview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
}

.overview-shot {
  padding: 10px 12px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__characters {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    :deep(.ant-tag) {
      margin: 0;
    }
  }

  &__muted {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__body {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  &__media {
    flex: none;
    width: 96px;
    height: 64px;
    overflow: hidden;
    border-radius: 8px;
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;

    :deep(.ant-image) {
      display: block;
      width: 100%;
      height: 100%;
    }

    :deep(img) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 64px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--card));
    border-radius: 8px;

    :deep(.anticon) {
      font-size: 20px;
    }
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  &__summary {
    margin-top: 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__bottom {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 0;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    b {
      font-size: 12px;
      font-weight: 400;
      color: hsl(var(--foreground));
    }
  }

  &__field-head {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;

    :deep(.ant-btn) {
      height: auto;
      padding: 0 2px;
      font-size: 12px;
    }
  }
}

.storyboard-script {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
}

.script-shot {
  padding: 10px;
  background: color-mix(in srgb, hsl(var(--primary)) 3%, hsl(var(--card)));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
  }
}

.prompt-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: color-mix(in srgb, hsl(var(--success)) 4%, hsl(var(--card)));
  border: 1px dashed hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  &__block-head {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    :deep(.ant-btn) {
      height: auto;
      padding: 0 2px;
      font-size: 12px;
    }
  }

  &__text {
    max-height: 240px;
    margin: 0;
    overflow: auto;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.7;
    color: hsl(var(--foreground));
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  &__skill {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.shot-editor__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  span {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  :deep(.ant-select),
  :deep(.ant-input-number) {
    width: 100%;
  }
}

.shot-editor__field--block {
  width: 100%;
}

.storyboard-assets {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
}

.asset-shot {
  padding: 10px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    color: hsl(var(--foreground));

    :deep(.ant-tag) {
      margin: 0;
    }
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-top: 8px;
  }

  &__row-label {
    flex: none;
    width: 40px;
    padding-top: 2px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__tags {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;

    :deep(.ant-tag) {
      margin: 0;
    }
  }

  &__aux {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__dimensions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 6px;
    margin-top: 8px;
  }

  &__dimension {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    :deep(.ant-tag) {
      margin: 0;
    }
  }
}

.storyboard-assets__hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.asset-bind {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    :deep(.ant-select) {
      width: 100%;
    }
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.storyboard-source {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  padding-bottom: 12px;
}

.source-shot {
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
    font-size: 13px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__text {
    margin: 0;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.7;
    color: hsl(var(--foreground));
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
}

.prompts {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;

  &__list {
    max-height: 60vh;
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

.prompt-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

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
    gap: 10px;
  }
}

.prompt-block {
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
