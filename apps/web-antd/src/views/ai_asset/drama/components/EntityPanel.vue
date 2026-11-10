<script lang="ts" setup name="DramaEntityPanel">
/**
 * 剧情面版 · 实体子页（对标 Omniboard 实体提取）。
 *
 * 链路位置：短剧工作台 → 剧情 → 实体。
 * 读取复用 novel/asset/graph（一次拿到角色/场景/物品与出图状态）；
 * 提取复用 episode/entity/extract；保存复用 character/scene/element save；参考图复用 asset/image/generate。
 * 音色读 voice-library 并绑定；上传走 OSS + material/upload + bind_material；
 * 批量补图走 plan/submit/active/progress。投影画布无契约，一键下载/详细角色图/高级设置按后端未提供契约明确禁用。
 */
import type { DramaApiError } from '../error';

import type {
  AssetImageBatchActiveResult,
  AssetImageBatchPlanResult,
  CharacterRoleArchetypeOption,
  CharacterVoiceOption,
  EntityExtractResult,
  NovelAssetGraph,
  NovelCharacterAsset,
  NovelElementAsset,
  NovelSceneAsset,
} from '#/api/models/ai_asset';
import type { TaskBatchCenterProgressResponse } from '#/api/models/marketing';

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';

import { VbenLoading } from '@vben/common-ui';

import {
  AppstoreOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  PlusOutlined,
  SoundOutlined,
  SyncOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Empty,
  Image,
  Input,
  List,
  message,
  Modal,
  Radio,
  Segmented,
  Select,
  Tag,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';

import { useAssetUpload } from '../../useAssetUpload';
import { formatApiError, parseApiError } from '../error';

type BatchRowStatus = 'failed' | 'generating' | 'success';
type EntityType = 'character' | 'element' | 'scene';
type ExtractMode = 'detail' | 'fast';
type StateFilter = 'all' | 'failed' | 'generating' | 'missing' | 'noDescription';
type TypeFilter = 'all' | EntityType;

/** 一行的编辑态 + 保存所需的原始字段（保存时原样带回，避免覆盖形象/提示词等） */
interface EntityRow {
  alias: string;
  appearance?: string;
  appearanceTags?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  avatarUrl?: string;
  characterType?: number;
  consistencyAnchor?: Record<string, unknown>;
  description: string;
  elementType?: string;
  failed: boolean;
  generating: boolean;
  hasImage: boolean;
  id: number | string;
  imageUrl?: string;
  loadedAlias: string;
  loadedDescription: string;
  loadedName: string;
  location?: string;
  name: string;
  prompt?: string;
  saveError?: DramaApiError;
  saving: boolean;
  sceneTags?: Record<string, unknown>;
  type: EntityType;
  uploading: boolean;
  visualPrompt?: string;
  voiceId?: string;
  voiceLabel?: string;
}

const props = defineProps<{
  active: boolean;
  episodeId?: number | string;
  /** 从工作流实体卡跳转时，定位到具体实体 */
  focusEntityId?: number | string;
  /** 从工作流实体卡跳转时，定位到对应分组 */
  focusType?: EntityType;
  novelId?: number | string;
}>();

const emit = defineEmits<{ dirtyChange: [dirty: boolean] }>();

const MODE_OPTIONS: Array<{ label: string; value: ExtractMode }> = [
  { label: '快速', value: 'fast' },
  { label: '详细', value: 'detail' },
];

const CREATE_TYPES: Array<{ label: string; value: EntityType }> = [
  { label: '角色', value: 'character' },
  { label: '场景', value: 'scene' },
  { label: '物品', value: 'element' },
];

const TYPE_FILTERS: Array<{ label: string; value: TypeFilter }> = [
  { label: '全部', value: 'all' },
  { label: '角色', value: 'character' },
  { label: '场景', value: 'scene' },
  { label: '物品', value: 'element' },
];

const STATE_FILTERS: Array<{ label: string; value: StateFilter }> = [
  { label: '全部状态', value: 'all' },
  { label: '缺图', value: 'missing' },
  { label: '生成中', value: 'generating' },
  { label: '失败', value: 'failed' },
  { label: '缺描述', value: 'noDescription' },
];

const TYPE_LABELS: Record<EntityType, string> = {
  character: '角色',
  element: '物品',
  scene: '场景',
};

const BATCH_SKIP_LABELS: Record<string, string> = {
  already_has_image: '已有参考图',
  asset_not_found: '资产不存在',
  extra_not_required: '群演/功能性角色无需补图',
};

const rows = ref<EntityRow[]>([]);
const loading = ref(false);
const loadError = ref<DramaApiError>();
const loadedKey = ref('');

const models = ref<Array<{ label: string; value: number | string }>>([]);
const modelsLoading = ref(false);
const modelsError = ref('');
const modelId = ref<number | string>();
const mode = ref<ExtractMode>('fast');

const extracting = ref(false);
const actionError = ref<DramaApiError>();

const typeFilter = ref<TypeFilter>('all');
const stateFilter = ref<StateFilter>('all');

watch(
  () => props.focusType,
  (value) => {
    if (value) {
      typeFilter.value = value;
    }
  },
  { immediate: true },
);

watch(
  [() => props.focusEntityId, () => rows.value.length, typeFilter],
  async ([entityId]) => {
    if (!entityId) {
      return;
    }
    const target = rows.value.find(
      (row) => String(row.id) === String(entityId),
    );
    if (
      target &&
      typeFilter.value !== 'all' &&
      typeFilter.value !== target.type
    ) {
      typeFilter.value = target.type;
    }
    await nextTick();
    document
      .querySelector(`[data-entity-id="${String(entityId)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
  { immediate: true },
);

const voiceOpen = ref(false);
const voiceRow = ref<EntityRow>();
const voiceOptions = ref<CharacterVoiceOption[]>([]);
const voiceLoading = ref(false);
const voiceSaving = ref(false);
const voiceError = ref<DramaApiError>();
const voiceSelected = ref<string>();

const createOpen = ref(false);
const creating = ref(false);
const createError = ref<DramaApiError>();
const createForm = reactive<{
  alias: string;
  description: string;
  name: string;
  type: EntityType;
}>({
  alias: '',
  description: '',
  name: '',
  type: 'character',
});

const { upload: uploadAsset } = useAssetUpload();

const archetypeOpen = ref(false);
const archetypeSelected = ref<string>();
const archetypes = ref<CharacterRoleArchetypeOption[]>([]);
const archetypesLoading = ref(false);
const archetypesError = ref<DramaApiError>();

const batchOpen = ref(false);
const batchPlan = ref<AssetImageBatchPlanResult>();
const batchPlanLoading = ref(false);
const batchPlanError = ref<DramaApiError>();
const batchSubmitting = ref(false);
const batchSubmitError = ref<DramaApiError>();
const batchActive = ref<AssetImageBatchActiveResult | null>();
const batchProgress = ref<TaskBatchCenterProgressResponse>();
const batchRunning = ref(false);
const batchTaskId = ref<number | string>();
const batchStatusMap = ref<Record<string, BatchRowStatus>>({});

let batchTargets = new Set<string>();
let batchTimer: ReturnType<typeof setInterval> | undefined;
let batchPolling = false;

/** 资产图谱按小说维度返回；切集不重新拉实体，提取后再刷新 */
const currentKey = computed(() => String(props.novelId ?? ''));

let loadSeq = 0;

function batchKey(assetType: string, assetId: number | string) {
  return `${assetType}:${assetId}`;
}

function batchTypeLabel(assetType?: string) {
  if (!assetType) {
    return '资产';
  }
  return TYPE_LABELS[assetType as EntityType] ?? assetType;
}

function batchSkipLabel(reason?: string) {
  if (!reason) {
    return '';
  }
  return BATCH_SKIP_LABELS[reason] ?? reason;
}

function rowBatchStatus(row: EntityRow) {
  return batchStatusMap.value[batchKey(row.type, row.id)];
}

function rowIsGenerating(row: EntityRow) {
  return row.generating || rowBatchStatus(row) === 'generating';
}

function rowIsFailed(row: EntityRow) {
  return row.failed || rowBatchStatus(row) === 'failed';
}

const stats = computed(() => {
  let character = 0;
  let element = 0;
  let scene = 0;
  let withImage = 0;
  for (const row of rows.value) {
    if (row.type === 'character') {
      character += 1;
    } else if (row.type === 'scene') {
      scene += 1;
    } else {
      element += 1;
    }
    if (row.hasImage) {
      withImage += 1;
    }
  }
  return {
    character,
    element,
    scene,
    total: rows.value.length,
    withImage,
  };
});

const imagePercent = computed(() =>
  stats.value.total
    ? Math.round((stats.value.withImage * 100) / stats.value.total)
    : 0,
);

/** 批次统计全部来自 active/progress，不用点击生成时的会话内标记 */
const batchStats = computed(() => {
  const progress = batchProgress.value;
  const active = batchActive.value;
  const failed = Object.values(batchStatusMap.value).filter(
    (status) => status === 'failed',
  ).length;
  const total = progress?.totalCount ?? active?.totalCount ?? 0;
  const success = progress?.successCount ?? active?.successCount ?? 0;
  const pending = batchRunning.value
    ? (progress?.pendingCount ?? active?.pendingCount ?? 0)
    : 0;
  const percent = progress?.progressPercent ?? active?.progressPercent ?? 0;
  return { failed, pending, percent, success, total };
});

const batchOkText = computed(() =>
  batchPlan.value?.eligible.length
    ? `确认生成 ${batchPlan.value.eligible.length} 个`
    : '确认生成',
);

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    if (typeFilter.value !== 'all' && row.type !== typeFilter.value) {
      return false;
    }
    switch (stateFilter.value) {
      case 'failed': {
        return rowIsFailed(row);
      }
      case 'generating': {
        return rowIsGenerating(row);
      }
      case 'missing': {
        return !row.hasImage;
      }
      case 'noDescription': {
        return !row.description.trim();
      }
      default: {
        return true;
      }
    }
  }),
);

const rowsDirty = computed(() =>
  rows.value.some((row) =>
    row.name !== row.loadedName ||
    row.alias !== row.loadedAlias ||
    row.description !== row.loadedDescription,
  ),
);

const extractDisabledReason = computed(() => {
  if (!props.novelId) {
    return '先选择项目';
  }
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (loading.value) {
    return '实体列表加载中';
  }
  if (loadError.value) {
    return '实体列表加载失败';
  }
  if (modelsLoading.value) {
    return '模型加载中';
  }
  if (!modelId.value) {
    return modelsError.value ? '模型列表加载失败' : '没有可用文本模型';
  }
  if (extracting.value) {
    return '正在提取';
  }
  if (rowsDirty.value) {
    return '有未保存修改，请先保存';
  }
  return '';
});

const voiceDisabledReason = computed(() => {
  if (!voiceRow.value) {
    return '未选择角色';
  }
  if (voiceLoading.value) {
    return '音色库加载中';
  }
  if (voiceError.value) {
    return '音色库未就绪';
  }
  if (!voiceOptions.value.length) {
    return '音色库未返回选项';
  }
  if (
    !voiceSelected.value ||
    !voiceOptions.value.some((item) => item.id === voiceSelected.value)
  ) {
    return '请选择音色';
  }
  if (voiceSaving.value) {
    return '绑定中';
  }
  return '';
});

const createDisabledReason = computed(() => {
  if (!props.novelId) {
    return '先选择项目';
  }
  if (loading.value) {
    return '实体列表加载中';
  }
  if (loadError.value) {
    return '实体列表加载失败';
  }
  if (rowsDirty.value) {
    return '有未保存修改，请先保存';
  }
  if (creating.value) {
    return '正在创建';
  }
  return '';
});

const archetypeDisabledReason = computed(() => {
  if (archetypesLoading.value) {
    return '角色原型加载中';
  }
  if (archetypesError.value) {
    return formatApiError(archetypesError.value);
  }
  if (!archetypes.value.length) {
    return '字典未配置 ai_role_archetype';
  }
  return createDisabledReason.value;
});

const batchDisabledReason = computed(() => {
  if (!props.novelId) {
    return '先选择项目';
  }
  if (loading.value) {
    return '实体列表加载中';
  }
  if (loadError.value) {
    return '实体列表加载失败';
  }
  if (rowsDirty.value) {
    return '有未保存修改，请先保存';
  }
  if (batchRunning.value) {
    return '补图批次进行中';
  }
  if (batchPlanLoading.value) {
    return '正在生成补图计划';
  }
  return '';
});

function readAlias(attributes?: Record<string, unknown>): string {
  const alias = attributes?.alias;
  return typeof alias === 'string' ? alias : '';
}

/** 别名暂存现有 attributes.alias（three 类资产都支持 attributes），保存时保留其它属性 */
function withAlias(
  attributes: Record<string, unknown> | undefined,
  alias: string,
): Record<string, unknown> | undefined {
  const next: Record<string, unknown> = { ...(attributes ?? {}) };
  const trimmed = alias.trim();
  if (trimmed) {
    next.alias = trimmed;
  } else {
    delete next.alias;
  }
  return Object.keys(next).length ? next : undefined;
}

function imageOf(item: {
  avatarUrl?: string;
  hasImage?: boolean;
  materialThumbnailUrl?: string;
  materialUrl?: string;
  refUrl?: string;
}) {
  return (
    item.materialUrl ??
    item.avatarUrl ??
    item.refUrl ??
    item.materialThumbnailUrl
  );
}

function characterRow(item: NovelCharacterAsset): EntityRow {
  const imageUrl = imageOf(item);
  const alias = readAlias(item.attributes);
  return {
    alias,
    appearance: item.appearance,
    appearanceTags: item.appearanceTags,
    attributes: item.attributes,
    avatarUrl: item.avatarUrl,
    characterType: item.characterType,
    consistencyAnchor: item.consistencyAnchor,
    description: item.description ?? '',
    failed: false,
    generating: false,
    hasImage: item.hasImage ?? Boolean(imageUrl),
    id: item.id,
    imageUrl,
    loadedAlias: alias,
    loadedDescription: item.description ?? '',
    loadedName: item.name ?? '',
    name: item.name ?? '',
    prompt: item.prompt,
    saving: false,
    type: 'character',
    uploading: false,
    visualPrompt: item.visualPrompt,
  };
}

function sceneRow(item: NovelSceneAsset): EntityRow {
  const imageUrl = imageOf(item);
  const alias = readAlias(item.attributes);
  return {
    alias,
    attributes: item.attributes,
    description: item.description ?? '',
    failed: false,
    generating: false,
    hasImage: item.hasImage ?? Boolean(imageUrl),
    id: item.id,
    imageUrl,
    loadedAlias: alias,
    loadedDescription: item.description ?? '',
    loadedName: item.name ?? '',
    location: item.location,
    name: item.name ?? '',
    saving: false,
    sceneTags: item.sceneTags,
    type: 'scene',
    uploading: false,
    visualPrompt: item.visualPrompt,
  };
}

function elementRow(item: NovelElementAsset): EntityRow {
  const imageUrl = imageOf(item);
  const alias = readAlias(item.attributes);
  return {
    alias,
    attributes: item.attributes,
    description: item.description ?? '',
    elementType: item.elementType,
    failed: false,
    generating: false,
    hasImage: item.hasImage ?? Boolean(imageUrl),
    id: item.id,
    imageUrl,
    loadedAlias: alias,
    loadedDescription: item.description ?? '',
    loadedName: item.name ?? '',
    name: item.name ?? '',
    saving: false,
    type: 'element',
    uploading: false,
    visualPrompt: item.visualPrompt,
  };
}

function buildRows(graph: NovelAssetGraph): EntityRow[] {
  return [
    ...(graph.characters ?? []).map(characterRow),
    ...(graph.scenes ?? []).map(sceneRow),
    ...(graph.elements ?? []).map(elementRow),
  ];
}

async function load() {
  const seq = ++loadSeq;
  loadError.value = undefined;
  actionError.value = undefined;
  rows.value = [];
  if (!props.novelId) {
    loadedKey.value = currentKey.value;
    return;
  }
  loading.value = true;
  try {
    const graph = await aiAssetApi.fetchNovelAssetGraph(props.novelId, true);
    if (seq !== loadSeq) {
      return;
    }
    rows.value = buildRows(graph);
    loadedKey.value = currentKey.value;
  } catch (error) {
    if (seq !== loadSeq) {
      return;
    }
    rows.value = [];
    loadError.value = parseApiError(error);
  } finally {
    if (seq === loadSeq) {
      loading.value = false;
    }
  }
}

async function loadModels() {
  modelsLoading.value = true;
  modelsError.value = '';
  try {
    const res = await aiModelApi.fetchModelConfigList(
      { page: 1, pageSize: 500 },
      true,
    );
    const usable = (res?.items ?? []).filter(
      (item) => item.status === undefined || item.status === 1,
    );
    models.value = usable
      .filter((item) => item.capability === 'text')
      .map((item) => ({
        label: `${item.model ?? ''}（${item.provider ?? item.source ?? ''}）`,
        value: item.id,
      }));
    if (!modelId.value && models.value.length) {
      modelId.value = models.value[0]?.value;
    }
  } catch (error) {
    models.value = [];
    modelsError.value = formatApiError(parseApiError(error));
  } finally {
    modelsLoading.value = false;
  }
}

async function extract() {
  if (extractDisabledReason.value || !props.episodeId) {
    return;
  }
  extracting.value = true;
  actionError.value = undefined;
  try {
    const result: EntityExtractResult =
      await aiAssetApi.extractEpisodeEntities(
        {
          episodeId: props.episodeId,
          mode: mode.value,
          modelId: modelId.value,
          source: 'auto',
        },
        true,
      );
    const created = [
      ...(result.characters ?? []),
      ...(result.scenes ?? []),
      ...(result.elements ?? []),
    ].filter((item) => item.created).length;
    message.success(`提取完成，新增 ${created} 个实体`);
    await load();
  } catch (error) {
    actionError.value = parseApiError(error);
  } finally {
    extracting.value = false;
  }
}

function rowDirty(row: EntityRow) {
  return (
    row.name !== row.loadedName ||
    row.alias !== row.loadedAlias ||
    row.description !== row.loadedDescription
  );
}

function saveDisabledReason(row: EntityRow) {
  if (row.saving) {
    return '保存中';
  }
  if (!row.name.trim()) {
    return '名称不能为空';
  }
  if (!rowDirty(row)) {
    return '没有修改';
  }
  return '';
}

async function saveRow(row: EntityRow) {
  if (saveDisabledReason(row) || !props.novelId) {
    return;
  }
  row.saving = true;
  row.saveError = undefined;
  // 先在本地去空白再请求；保存期间用户继续编辑的内容不能被成功回包覆盖
  row.name = row.name.trim();
  row.alias = row.alias.trim();
  row.description = row.description.trim();
  const name = row.name;
  const alias = row.alias;
  const description = row.description;
  try {
    const attributes = withAlias(row.attributes, alias);
    if (row.type === 'character') {
      await aiAssetApi.saveCharacter(
        {
          appearance: row.appearance,
          appearanceTags: row.appearanceTags,
          attributes,
          avatarUrl: row.avatarUrl,
          characterType: row.characterType,
          consistencyAnchor: row.consistencyAnchor,
          description: description || undefined,
          id: row.id,
          name,
          novelId: props.novelId,
          prompt: row.prompt,
          visualPrompt: row.visualPrompt,
        },
        true,
      );
    } else if (row.type === 'scene') {
      await aiAssetApi.saveScene(
        {
          attributes,
          description: description || undefined,
          id: row.id,
          location: row.location,
          name,
          novelId: props.novelId,
          sceneTags: row.sceneTags,
          visualPrompt: row.visualPrompt,
        },
        true,
      );
    } else {
      await aiAssetApi.saveElement(
        {
          attributes,
          description: description || undefined,
          elementType: row.elementType ?? 'other',
          id: row.id,
          name,
          novelId: props.novelId,
        },
        true,
      );
    }
    row.attributes = attributes;
    row.loadedName = name;
    row.loadedAlias = alias;
    row.loadedDescription = description;
    message.success('实体已保存');
  } catch (error) {
    row.saveError = parseApiError(error);
  } finally {
    row.saving = false;
  }
}

function generateDisabledReason(row: EntityRow) {
  if (rowIsGenerating(row)) {
    return '生成中';
  }
  if (rowDirty(row)) {
    return '请先保存修改';
  }
  if (!row.description.trim()) {
    return '请先补全描述';
  }
  return '';
}

async function generateImage(row: EntityRow) {
  if (generateDisabledReason(row)) {
    return;
  }
  row.generating = true;
  row.failed = false;
  delete batchStatusMap.value[batchKey(row.type, row.id)];
  try {
    const result = await aiAssetApi.generateAssetImage(
      {
        assetId: row.id,
        assetType: row.type,
      },
      true,
    );
    if (result.url) {
      row.imageUrl = result.url;
    }
    row.hasImage = result.hasImage ?? (Boolean(result.url) || row.hasImage);
    if (!row.hasImage) {
      row.failed = true;
    }
    if (row.hasImage) {
      delete batchStatusMap.value[batchKey(row.type, row.id)];
      message.success('参考图已生成');
    } else {
      message.warning('生成完成但后端未返回图片');
    }
  } catch (error) {
    row.failed = true;
    message.error(formatApiError(parseApiError(error)));
  } finally {
    row.generating = false;
  }
}

async function loadVoiceOptions() {
  voiceLoading.value = true;
  voiceError.value = undefined;
  try {
    const list = await aiAssetApi.fetchVoiceLibrary();
    voiceOptions.value = list ?? [];
    if (
      voiceSelected.value &&
      !voiceOptions.value.some((item) => item.id === voiceSelected.value)
    ) {
      voiceSelected.value = undefined;
    }
  } catch (error) {
    voiceOptions.value = [];
    voiceError.value = parseApiError(error);
  } finally {
    voiceLoading.value = false;
  }
}

function openVoice(row: EntityRow) {
  if (row.type !== 'character') {
    return;
  }
  voiceRow.value = row;
  voiceSelected.value = row.voiceId;
  voiceError.value = undefined;
  voiceOpen.value = true;
  void loadVoiceOptions();
}

async function submitVoice() {
  const row = voiceRow.value;
  const option = voiceOptions.value.find(
    (item) => item.id === voiceSelected.value,
  );
  if (!row || !option || voiceDisabledReason.value) {
    return;
  }
  voiceSaving.value = true;
  voiceError.value = undefined;
  try {
    const result = await aiAssetApi.bindCharacterVoice(row.id, {
      id: option.id,
      label: option.label,
    });
    const target = rows.value.find(
      (item) =>
        item.type === 'character' && String(item.id) === String(row.id),
    );
    if (target) {
      target.voiceId = result.id ?? option.id;
      target.voiceLabel = result.label ?? option.label;
    }
    message.success('音色已绑定');
    voiceOpen.value = false;
  } catch (error) {
    voiceError.value = parseApiError(error);
  } finally {
    voiceSaving.value = false;
  }
}

function openCreate(prefill?: { name?: string; type?: EntityType }) {
  if (createDisabledReason.value) {
    return;
  }
  createError.value = undefined;
  Object.assign(createForm, {
    alias: '',
    description: '',
    name: prefill?.name ?? '',
    type: prefill?.type ?? 'character',
  });
  createOpen.value = true;
}

async function submitCreate() {
  if (!props.novelId || !createForm.name.trim() || creating.value) {
    return;
  }
  creating.value = true;
  createError.value = undefined;
  try {
    const name = createForm.name.trim();
    const description = createForm.description.trim();
    const alias = createForm.alias.trim();
    const attributes = alias ? { alias } : undefined;
    if (createForm.type === 'character') {
      await aiAssetApi.saveCharacter(
        {
          attributes,
          description: description || undefined,
          name,
          novelId: props.novelId,
        },
        true,
      );
    } else if (createForm.type === 'scene') {
      await aiAssetApi.saveScene(
        {
          attributes,
          description: description || undefined,
          name,
          novelId: props.novelId,
        },
        true,
      );
    } else {
      await aiAssetApi.saveElement(
        {
          attributes,
          description: description || undefined,
          elementType: 'other',
          name,
          novelId: props.novelId,
        },
        true,
      );
    }
    message.success('实体已创建');
    createOpen.value = false;
    typeFilter.value = 'all';
    stateFilter.value = 'all';
    await load();
  } catch (error) {
    createError.value = parseApiError(error);
  } finally {
    creating.value = false;
  }
}

async function loadArchetypes() {
  archetypesLoading.value = true;
  archetypesError.value = undefined;
  try {
    archetypes.value = await aiAssetApi.fetchRoleArchetypes();
  } catch (error) {
    archetypes.value = [];
    archetypesError.value = parseApiError(error);
  } finally {
    archetypesLoading.value = false;
  }
}

async function openArchetype() {
  if (archetypeDisabledReason.value) {
    return;
  }
  archetypeSelected.value = undefined;
  archetypeOpen.value = true;
  await loadArchetypes();
}

function useArchetype() {
  const option = archetypes.value.find(
    (item) => item.value === archetypeSelected.value,
  );
  if (!option) {
    return;
  }
  if (createDisabledReason.value) {
    message.warning(createDisabledReason.value);
    return;
  }
  archetypeOpen.value = false;
  openCreate({ name: option.label, type: 'character' });
}

async function readImageSize(file: File) {
  if (typeof createImageBitmap !== 'function') {
    return undefined;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const size = { height: bitmap.height, width: bitmap.width };
    bitmap.close();
    return size;
  } catch {
    return undefined;
  }
}

async function uploadEntityImage(row: EntityRow, file: File) {
  if (row.uploading) {
    return;
  }
  row.uploading = true;
  try {
    const size = await readImageSize(file);
    const storageUrl = await uploadAsset(file);
    const material = await aiAssetApi.uploadMaterial(
      {
        fileSize: file.size,
        format: size ? (size.width >= size.height ? 1 : 2) : undefined,
        height: size?.height,
        materialType: 'image',
        name: file.name,
        remark: `实体参考图：${row.name || file.name}`,
        storageUrl,
        thumbnailUrl: storageUrl,
        width: size?.width,
      },
      true,
    );
    if (!material?.id) {
      throw new Error('素材登记未返回 materialId');
    }
    if (row.type === 'character') {
      await aiAssetApi.bindCharacterMaterial(
        { id: row.id, materialId: material.id },
        true,
      );
    } else if (row.type === 'scene') {
      await aiAssetApi.bindSceneMaterial(
        { id: row.id, materialId: material.id },
        true,
      );
    } else {
      await aiAssetApi.bindElementMaterial(
        { id: row.id, materialId: material.id },
        true,
      );
    }
    row.imageUrl = material.storageUrl ?? storageUrl;
    row.hasImage = true;
    row.failed = false;
    delete batchStatusMap.value[batchKey(row.type, row.id)];
    message.success('参考图已上传并绑定');
  } catch (error) {
    message.error(formatApiError(parseApiError(error)));
  } finally {
    row.uploading = false;
  }
}

function beforeEntityUpload(row: EntityRow, file: File) {
  if (file.type && !file.type.startsWith('image/')) {
    message.warning('请选择图片文件');
    return false;
  }
  void uploadEntityImage(row, file);
  return false;
}

async function loadBatchPlan() {
  if (!props.novelId) {
    return;
  }
  batchPlanLoading.value = true;
  batchPlanError.value = undefined;
  batchSubmitError.value = undefined;
  try {
    batchPlan.value = await aiAssetApi.fetchAssetImageBatchPlan(
      props.novelId,
      true,
    );
  } catch (error) {
    batchPlan.value = undefined;
    batchPlanError.value = parseApiError(error);
  } finally {
    batchPlanLoading.value = false;
  }
}

async function openBatch() {
  if (batchDisabledReason.value) {
    return;
  }
  batchOpen.value = true;
  batchPlan.value = undefined;
  batchSubmitError.value = undefined;
  await loadBatchPlan();
}

async function submitBatch() {
  const plan = batchPlan.value;
  if (!props.novelId || !plan?.eligible.length || batchSubmitting.value) {
    return;
  }
  batchSubmitting.value = true;
  batchSubmitError.value = undefined;
  try {
    const assets = plan.eligible.map((item) => ({
      assetId: item.assetId,
      assetType: item.assetType,
    }));
    const result = await aiAssetApi.submitAssetImageBatch({
      assets,
      novelId: props.novelId,
    });
    batchOpen.value = false;
    batchStatusMap.value = {};
    batchProgress.value = undefined;
    batchActive.value = undefined;
    batchTargets = new Set(
      assets.map((item) => batchKey(item.assetType, item.assetId)),
    );
    // 后端提交时会重新过滤计划，被跳过的资产不再标记为生成中
    for (const item of result.skipped ?? []) {
      batchTargets.delete(batchKey(item.assetType, item.assetId));
    }
    startBatchPolling(result.taskId);
    if (result.existing) {
      message.info('已有补图批次，继续跟踪进度');
    } else {
      const skipped = result.skipped?.length ?? 0;
      message.success(
        `已提交 ${result.totalCount} 个资产补图${skipped ? `，跳过 ${skipped} 个` : ''}`,
      );
    }
  } catch (error) {
    batchSubmitError.value = parseApiError(error);
  } finally {
    batchSubmitting.value = false;
  }
}

function applyBatchStatus(
  progress: TaskBatchCenterProgressResponse | undefined,
  running: boolean,
) {
  const next: Record<string, BatchRowStatus> = {};
  for (const item of progress?.items ?? []) {
    const assetId = item.assetId ?? item.targetIds?.[0];
    const assetType = item.assetType;
    if (assetId === undefined || !assetType) {
      continue;
    }
    const key = batchKey(assetType, assetId);
    if (
      item.result === 'FAILED' ||
      (typeof item.code === 'number' && item.code !== 0)
    ) {
      next[key] = 'failed';
    } else if (item.result === 'SUCCESS') {
      next[key] = 'success';
    }
  }
  if (running) {
    for (const key of batchTargets) {
      if (!next[key]) {
        next[key] = 'generating';
      }
    }
  }
  batchStatusMap.value = next;
  for (const row of rows.value) {
    if (next[batchKey(row.type, row.id)] === 'success') {
      row.failed = false;
    }
  }
}

async function refreshBatchImages() {
  if (!props.novelId) {
    return;
  }
  const graph = await aiAssetApi.fetchNovelAssetGraph(props.novelId, true);
  const images = new Map<string, { hasImage: boolean; imageUrl?: string }>();
  for (const item of graph.characters ?? []) {
    const imageUrl = imageOf(item);
    images.set(batchKey('character', item.id), {
      hasImage: item.hasImage ?? Boolean(imageUrl),
      imageUrl,
    });
  }
  for (const item of graph.scenes ?? []) {
    const imageUrl = imageOf(item);
    images.set(batchKey('scene', item.id), {
      hasImage: item.hasImage ?? Boolean(imageUrl),
      imageUrl,
    });
  }
  for (const item of graph.elements ?? []) {
    const imageUrl = imageOf(item);
    images.set(batchKey('element', item.id), {
      hasImage: item.hasImage ?? Boolean(imageUrl),
      imageUrl,
    });
  }
  for (const row of rows.value) {
    const image = images.get(batchKey(row.type, row.id));
    if (!image) {
      continue;
    }
    row.hasImage = image.hasImage;
    row.imageUrl = image.imageUrl;
    if (image.hasImage) {
      row.failed = false;
      delete batchStatusMap.value[batchKey(row.type, row.id)];
    }
  }
}

function stopBatchPolling() {
  if (batchTimer) {
    clearInterval(batchTimer);
    batchTimer = undefined;
  }
  batchRunning.value = false;
}

function startBatchPolling(taskId: number | string) {
  if (batchTimer && String(batchTaskId.value) === String(taskId)) {
    return;
  }
  stopBatchPolling();
  batchTaskId.value = taskId;
  batchRunning.value = true;
  void pollBatch(taskId);
  batchTimer = setInterval(() => void pollBatch(taskId), 4000);
}

async function pollBatch(taskId: number | string) {
  if (batchPolling || !props.novelId) {
    return;
  }
  batchPolling = true;
  try {
    const [progress, active] = await Promise.all([
      aiAssetApi.fetchAssetImageBatchProgress(taskId, 1, 500, true),
      aiAssetApi.fetchAssetImageBatchActive(props.novelId),
    ]);
    if (String(batchTaskId.value) !== String(taskId)) {
      return;
    }
    if (progress) {
      batchProgress.value = progress;
    }
    if (active?.taskId) {
      batchActive.value = active;
    }
    const status = progress?.taskStatus ?? active?.taskStatus;
    if (status === 3 || status === 4) {
      stopBatchPolling();
      applyBatchStatus(progress, false);
      let refreshError: DramaApiError | undefined;
      try {
        await refreshBatchImages();
      } catch (error) {
        refreshError = parseApiError(error);
      }
      batchStatusMap.value = Object.fromEntries(
        Object.entries(batchStatusMap.value).filter(
          ([, value]) => value === 'failed',
        ),
      );
      if (refreshError) {
        message.error(
          `补图完成，但刷新参考图失败：${formatApiError(refreshError)}`,
        );
      } else if (status === 4) {
        message.error(
          progress?.errorMsg
            ? `补图批次失败：${progress.errorMsg}`
            : '补图批次失败',
        );
      } else {
        const failed =
          progress?.failedCount ??
          Object.values(batchStatusMap.value).filter(
            (value) => value === 'failed',
          ).length;
        if (failed > 0) {
          message.warning(`补图完成，失败 ${failed} 个`);
        } else {
          message.success('补图完成');
        }
      }
    } else {
      batchRunning.value = true;
      applyBatchStatus(progress, true);
    }
  } catch (error) {
    stopBatchPolling();
    message.error(formatApiError(parseApiError(error)));
  } finally {
    batchPolling = false;
  }
}

async function resumeBatch() {
  if (!props.novelId) {
    return;
  }
  try {
    const active = await aiAssetApi.fetchAssetImageBatchActive(props.novelId);
    if (!active?.taskId) {
      return;
    }
    batchActive.value = active;
    const running = active.taskStatus === 1 || active.taskStatus === 2;
    if (!running) {
      return;
    }
    const plan = await aiAssetApi
      .fetchAssetImageBatchPlan(props.novelId, true)
      .catch(() => undefined);
    if (plan) {
      batchTargets = new Set(
        plan.eligible.map((item) =>
          batchKey(item.assetType, item.assetId),
        ),
      );
    }
    startBatchPolling(active.taskId);
  } catch {
    // 后台恢复活动批次失败不打断页面
  }
}

/** 父级已确认丢弃（切集/切项目）时，把编辑态回滚到已保存值，避免隐藏的脏数据残留 */
function discardDrafts() {
  for (const row of rows.value) {
    row.name = row.loadedName;
    row.alias = row.loadedAlias;
    row.description = row.loadedDescription;
    row.saveError = undefined;
  }
}

watch(() => props.episodeId, discardDrafts);
watch(currentKey, discardDrafts);

// 切项目时清掉上一本书的补图批次状态，等新项目 active 恢复
watch(currentKey, () => {
  stopBatchPolling();
  batchActive.value = undefined;
  batchProgress.value = undefined;
  batchTaskId.value = undefined;
  batchStatusMap.value = {};
  batchTargets = new Set();
});

watch(
  [() => props.active, currentKey],
  ([active]) => {
    if (!active) {
      return;
    }
    void resumeBatch();
    if (!props.novelId) {
      rows.value = [];
      loadError.value = undefined;
      loadedKey.value = currentKey.value;
      return;
    }
    if (loadedKey.value === currentKey.value) {
      return;
    }
    void load();
  },
  { immediate: true },
);

watch(rowsDirty, (value) => emit('dirtyChange', value), { immediate: true });

onMounted(() => {
  void loadModels();
  void loadArchetypes();
});

onBeforeUnmount(() => {
  stopBatchPolling();
});
</script>

<template>
  <div class="entity-panel">
    <Card class="entity-panel__toolbar" :body-style="{ padding: '12px' }">
      <div class="entity-panel__head">
        <span class="entity-panel__head-icon"><TeamOutlined /></span>
        <div class="entity-panel__head-text">
          <div class="entity-panel__heading">实体提取</div>
          <div class="entity-panel__subheading">
            从本集原文提取角色 / 场景 / 物品，生成参考图并绑定音色
          </div>
        </div>
        <span class="entity-panel__spacer"></span>
        <Tooltip :title="createDisabledReason">
          <span>
            <Button
              :disabled="Boolean(createDisabledReason)"
              @click="openCreate()"
            >
              <template #icon><PlusOutlined /></template>
              新建实体
            </Button>
          </span>
        </Tooltip>
        <Tooltip :title="archetypeDisabledReason">
          <span>
            <Button
              :disabled="Boolean(archetypeDisabledReason)"
              @click="openArchetype"
            >
              <template #icon><UserOutlined /></template>
              AI 角色
            </Button>
          </span>
        </Tooltip>
      </div>

      <div class="entity-panel__bar">
        <span class="entity-panel__label">模式</span>
        <Segmented v-model:value="mode" :options="MODE_OPTIONS" size="small" />
        <span class="entity-panel__label">模型</span>
        <Select
          v-model:value="modelId"
          :disabled="modelsLoading || !models.length"
          :loading="modelsLoading"
          :options="models"
          class="entity-panel__model"
          option-filter-prop="label"
          placeholder="提取模型"
          show-search
        />
        <Tag :bordered="false" class="entity-panel__ratio-tag">
          <PictureOutlined />
          比例 1:1
        </Tag>
        <Tooltip :title="extractDisabledReason">
          <span>
            <Button
              :disabled="Boolean(extractDisabledReason)"
              :loading="extracting"
              size="small"
              type="primary"
              @click="extract"
            >
              <template #icon><ThunderboltOutlined /></template>
              提取实体
            </Button>
          </span>
        </Tooltip>
        <span class="entity-panel__spacer"></span>
        <Tag
          v-if="batchRunning"
          :bordered="false"
          class="entity-panel__batch-tag"
          color="processing"
        >
          <SyncOutlined spin />
          补图 {{ batchStats.success }}/{{ batchStats.total }} ·
          {{ batchStats.percent }}%
        </Tag>
        <Tooltip :title="batchDisabledReason">
          <span>
            <Button
              :disabled="Boolean(batchDisabledReason)"
              size="small"
              @click="openBatch"
            >
              <template #icon><PictureOutlined /></template>
              全部生成参考图
            </Button>
          </span>
        </Tooltip>
        <span
          v-if="modelsError"
          class="entity-panel__hint entity-panel__hint--error"
        >
          {{ modelsError }}
        </span>
      </div>

      <div class="entity-panel__bar entity-panel__bar--secondary">
        <span class="entity-panel__group-label">更多能力</span>
        <Tooltip title="后端未提供生成参数契约">
          <span>
            <Button disabled size="small" type="text">
              详细角色图·无生成参数契约
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="后端未提供生成参数契约">
          <span>
            <Button disabled size="small" type="text">
              高级设置·无生成参数契约
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="后端未提供下载契约">
          <span>
            <Button disabled size="small" type="text">
              一键下载·后端未提供下载契约
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="待接入">
          <span>
            <Button disabled size="small" type="text">
              投影到画布·待接入
            </Button>
          </span>
        </Tooltip>
        <span class="entity-panel__spacer"></span>
        <span class="entity-panel__hint">上传 / 补图 / 音色已接入</span>
      </div>

      <Alert
        v-if="actionError"
        :message="formatApiError(actionError)"
        :type="actionError.notReady ? 'info' : 'error'"
        show-icon
      />
    </Card>

    <Card class="entity-panel__main" :body-style="{ padding: 0 }">
      <div class="entity-panel__summary">
        <div class="entity-panel__stats">
          <div class="entity-panel__stat entity-panel__stat--total">
            <span class="entity-panel__stat-icon"><DatabaseOutlined /></span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">实体总数</span>
              <b class="entity-panel__stat-value">{{ stats.total }}</b>
            </span>
          </div>
          <div class="entity-panel__stat entity-panel__stat--character">
            <span class="entity-panel__stat-icon"><UserOutlined /></span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">角色</span>
              <b class="entity-panel__stat-value">{{ stats.character }}</b>
            </span>
          </div>
          <div class="entity-panel__stat entity-panel__stat--scene">
            <span class="entity-panel__stat-icon"><EnvironmentOutlined /></span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">场景</span>
              <b class="entity-panel__stat-value">{{ stats.scene }}</b>
            </span>
          </div>
          <div class="entity-panel__stat entity-panel__stat--element">
            <span class="entity-panel__stat-icon"><AppstoreOutlined /></span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">物品</span>
              <b class="entity-panel__stat-value">{{ stats.element }}</b>
            </span>
          </div>
          <div class="entity-panel__stat entity-panel__stat--generating">
            <span class="entity-panel__stat-icon">
              <SyncOutlined :spin="batchStats.pending > 0" />
            </span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">生成中</span>
              <b class="entity-panel__stat-value">
                {{ batchStats.pending }}
              </b>
            </span>
          </div>
          <div class="entity-panel__stat entity-panel__stat--failed">
            <span class="entity-panel__stat-icon"><WarningOutlined /></span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">失败</span>
              <b class="entity-panel__stat-value">{{ batchStats.failed }}</b>
            </span>
          </div>
          <div class="entity-panel__stat entity-panel__stat--done">
            <span class="entity-panel__stat-icon"><PictureOutlined /></span>
            <span class="entity-panel__stat-body">
              <span class="entity-panel__stat-label">已出图</span>
              <b class="entity-panel__stat-value">
                {{ stats.withImage }}/{{ stats.total }}
              </b>
              <span class="entity-panel__stat-bar">
                <i :style="{ width: `${imagePercent}%` }"></i>
              </span>
            </span>
          </div>
        </div>
        <div class="entity-panel__filters">
          <span class="entity-panel__filter-label">类型</span>
          <Segmented
            v-model:value="typeFilter"
            :options="TYPE_FILTERS"
            size="small"
          />
          <span class="entity-panel__filter-label">状态</span>
          <Segmented
            v-model:value="stateFilter"
            :options="STATE_FILTERS"
            size="small"
          />
        </div>
      </div>

      <div class="entity-panel__list">
        <Empty
          v-if="!novelId || !episodeId"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="先选择项目与剧集"
        />
        <template v-else-if="loadError">
          <Alert
            :message="formatApiError(loadError)"
            :type="loadError.notReady ? 'info' : 'error'"
            show-icon
          >
            <template v-if="loadError.retryable" #action>
              <Button size="small" @click="load">重新加载</Button>
            </template>
          </Alert>
        </template>
        <Empty
          v-else-if="!rows.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="还没有实体，先提取或新建"
        />
        <Empty
          v-else-if="!filteredRows.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="没有符合条件的实体"
        />
        <div v-else class="entity-panel__grid">
          <Card
            v-for="row in filteredRows"
            :key="`${row.type}:${row.id}`"
            class="entity-card"
            :class="[
              `entity-card--${row.type}`,
              {
                'is-focused':
                  String(focusEntityId) === String(row.id),
              },
            ]"
            :body-style="{ padding: 0 }"
            :data-entity-id="row.id"
            size="small"
          >
            <div class="entity-card__cover">
              <Image
                v-if="row.imageUrl"
                :src="row.imageUrl"
                :preview="{ src: row.imageUrl }"
                class="entity-card__cover-image"
              />
              <div v-else class="entity-card__cover-empty">
                <UserOutlined v-if="row.type === 'character'" />
                <EnvironmentOutlined v-else-if="row.type === 'scene'" />
                <AppstoreOutlined v-else />
                <span class="entity-card__cover-text">待出图</span>
              </div>
              <div class="entity-card__cover-badges">
                <span class="entity-card__type-pill">
                  <UserOutlined v-if="row.type === 'character'" />
                  <EnvironmentOutlined v-else-if="row.type === 'scene'" />
                  <AppstoreOutlined v-else />
                  {{ TYPE_LABELS[row.type] }}
                </span>
                <span
                  class="entity-card__count-pill"
                  :class="{ 'is-empty': !row.hasImage }"
                >
                  <PictureOutlined />
                  参考图 {{ row.hasImage ? 1 : 0 }} 张
                </span>
              </div>
            </div>

            <div class="entity-card__body">
              <div
                v-if="
                  !row.hasImage ||
                  !row.description.trim() ||
                  rowIsGenerating(row) ||
                  rowIsFailed(row) ||
                  row.voiceLabel
                "
                class="entity-card__status"
              >
                <Tag v-if="!row.hasImage" color="warning">缺图</Tag>
                <Tag v-if="!row.description.trim()">缺描述</Tag>
                <Tag v-if="rowIsGenerating(row)" color="processing">
                  生成中
                </Tag>
                <Tag v-if="rowIsFailed(row)" color="error">失败</Tag>
                <Tag v-if="row.voiceLabel" color="blue">
                  <SoundOutlined />
                  {{ row.voiceLabel }}
                </Tag>
              </div>

              <div class="entity-card__fields">
                <label class="entity-card__field">
                  <span class="entity-card__field-label">名称</span>
                  <Input
                    v-model:value="row.name"
                    placeholder="名称"
                    size="small"
                  />
                </label>
                <label class="entity-card__field">
                  <span class="entity-card__field-label">别名</span>
                  <Input
                    v-model:value="row.alias"
                    placeholder="别名（可空）"
                    size="small"
                  />
                </label>
              </div>

              <label class="entity-card__field entity-card__field--block">
                <span class="entity-card__field-label">描述</span>
                <Input.TextArea
                  v-model:value="row.description"
                  :rows="3"
                  placeholder="用于生成参考图的描述"
                />
              </label>

              <div class="entity-card__actions">
                <Tooltip :title="saveDisabledReason(row)">
                  <span>
                    <Button
                      :disabled="Boolean(saveDisabledReason(row))"
                      :loading="row.saving"
                      size="small"
                      type="primary"
                      @click="saveRow(row)"
                    >
                      保存
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip :title="generateDisabledReason(row)">
                  <span>
                    <Button
                      :disabled="Boolean(generateDisabledReason(row))"
                      :loading="row.generating"
                      size="small"
                      @click="generateImage(row)"
                    >
                      <template #icon><PictureOutlined /></template>
                      {{ row.hasImage ? '重新生成' : '生成参考图' }}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  :title="row.type === 'character' ? '' : '音色仅角色可绑定'"
                >
                  <span>
                    <Button
                      :disabled="row.type !== 'character'"
                      size="small"
                      @click="openVoice(row)"
                    >
                      <template #icon><SoundOutlined /></template>
                      {{ row.voiceLabel ? '更换音色' : '绑定音色' }}
                    </Button>
                  </span>
                </Tooltip>
                <span class="entity-card__actions-spacer"></span>
                <Upload
                  :before-upload="(file) => beforeEntityUpload(row, file)"
                  :show-upload-list="false"
                  accept="image/*"
                >
                  <Button
                    :disabled="row.uploading || rowIsGenerating(row)"
                    :loading="row.uploading"
                    size="small"
                    type="text"
                  >
                    <template #icon><UploadOutlined /></template>
                    上传图片
                  </Button>
                </Upload>
              </div>

              <Alert
                v-if="row.saveError"
                :message="formatApiError(row.saveError)"
                :type="row.saveError.notReady ? 'info' : 'error'"
                show-icon
              />
            </div>
          </Card>
        </div>
        <VbenLoading :spinning="loading" class="entity-panel__loading" />
      </div>
    </Card>

    <Modal
      v-model:open="createOpen"
      :confirm-loading="creating"
      :ok-button-props="{ disabled: !createForm.name.trim() }"
      cancel-text="取消"
      ok-text="创建"
      :title="`新建${TYPE_LABELS[createForm.type]}`"
      @ok="submitCreate"
    >
      <div class="entity-create">
        <div class="entity-create__row">
          <span class="entity-create__label">类型</span>
          <Radio.Group
            v-model:value="createForm.type"
            :options="CREATE_TYPES"
          />
        </div>
        <div class="entity-create__row">
          <span class="entity-create__label">名称</span>
          <Input v-model:value="createForm.name" placeholder="必填" />
        </div>
        <div class="entity-create__row">
          <span class="entity-create__label">别名</span>
          <Input v-model:value="createForm.alias" placeholder="可空" />
        </div>
        <div class="entity-create__row entity-create__row--column">
          <span class="entity-create__label">描述</span>
          <Input.TextArea
            v-model:value="createForm.description"
            :rows="4"
            placeholder="角色 / 场景 / 物品描述"
          />
        </div>
        <Alert
          v-if="createError"
          :message="formatApiError(createError)"
          :type="createError.notReady ? 'info' : 'error'"
          show-icon
        />
      </div>
    </Modal>

    <Modal
      v-model:open="voiceOpen"
      :confirm-loading="voiceSaving"
      :ok-button-props="{ disabled: Boolean(voiceDisabledReason) }"
      cancel-text="取消"
      ok-text="绑定"
      title="绑定音色"
      @ok="submitVoice"
    >
      <div class="voice">
        <Alert
          v-if="voiceError"
          :message="formatApiError(voiceError)"
          :type="voiceError.notReady ? 'info' : 'error'"
          show-icon
        >
          <template v-if="voiceError.retryable" #action>
            <Button size="small" @click="loadVoiceOptions">重新加载</Button>
          </template>
        </Alert>
        <Alert
          v-else-if="!voiceLoading && !voiceOptions.length"
          message="音色库未返回选项"
          type="info"
          show-icon
        />
        <Radio.Group v-if="voiceOptions.length" v-model:value="voiceSelected">
          <Radio
            v-for="option in voiceOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </Radio>
        </Radio.Group>
        <div class="voice__hint">
          当前：{{ voiceRow?.voiceLabel || '—' }}；选项来自后端 voice-library
        </div>
        <VbenLoading :spinning="voiceLoading" class="voice__loading" />
      </div>
    </Modal>

    <Modal
      v-model:open="archetypeOpen"
      :confirm-loading="archetypesLoading"
      :ok-button-props="{ disabled: !archetypeSelected }"
      cancel-text="取消"
      ok-text="使用原型"
      title="AI 角色"
      @ok="useArchetype"
    >
      <div class="archetype">
        <Alert
          v-if="archetypesError"
          :message="formatApiError(archetypesError)"
          :type="archetypesError.notReady ? 'info' : 'error'"
          show-icon
        >
          <template v-if="archetypesError.retryable" #action>
            <Button size="small" @click="loadArchetypes">重新加载</Button>
          </template>
        </Alert>
        <Empty
          v-else-if="!archetypesLoading && !archetypes.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="字典未配置 ai_role_archetype"
        />
        <Radio.Group
          v-else
          v-model:value="archetypeSelected"
          class="archetype__options"
        >
          <Radio
            v-for="item in archetypes"
            :key="item.value"
            :value="item.value"
            class="archetype__option"
          >
            <span class="archetype__label">{{ item.label }}</span>
            <span class="archetype__value">{{ item.value }}</span>
          </Radio>
        </Radio.Group>
        <div class="archetype__hint">
          选择原型后进入新建角色，名称自动填入原型名称，描述可继续补充。
        </div>
        <VbenLoading
          :spinning="archetypesLoading"
          class="archetype__loading"
        />
      </div>
    </Modal>

    <Modal
      v-model:open="batchOpen"
      :confirm-loading="batchSubmitting"
      :ok-button-props="{
        disabled:
          batchPlanLoading ||
          Boolean(batchPlanError) ||
          batchSubmitting ||
          !batchPlan?.eligible.length,
      }"
      :ok-text="batchOkText"
      cancel-text="取消"
      title="全部生成参考图"
      @ok="submitBatch"
    >
      <div class="batch-plan">
        <Alert
          v-if="batchPlanError"
          :message="formatApiError(batchPlanError)"
          :type="batchPlanError.notReady ? 'info' : 'error'"
          show-icon
        >
          <template v-if="batchPlanError.retryable" #action>
            <Button size="small" @click="loadBatchPlan">重新加载</Button>
          </template>
        </Alert>
        <template v-else-if="batchPlan">
          <div class="batch-plan__summary">
            <Tag color="processing">
              可生成 {{ batchPlan.eligible.length }}
            </Tag>
            <Tag>跳过 {{ batchPlan.skipped.length }}</Tag>
            <span class="entity-panel__hint">
              按项目全部缺图实体补图，已有参考图的会跳过
            </span>
          </div>
          <Empty
            v-if="!batchPlan.eligible.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="当前没有需要补图的实体"
          />
          <template v-else>
            <div class="batch-plan__title">将生成</div>
            <List
              :data-source="batchPlan.eligible"
              :split="false"
              class="batch-plan__list"
              size="small"
            >
              <template #renderItem="{ item }">
                <List.Item class="batch-plan__row">
                  <Tag :bordered="false">
                    {{ batchTypeLabel(item.assetType) }}
                  </Tag>
                  <span>{{ item.name || `资产 #${item.assetId}` }}</span>
                </List.Item>
              </template>
            </List>
          </template>
          <template v-if="batchPlan.skipped.length">
            <div class="batch-plan__title">跳过</div>
            <List
              :data-source="batchPlan.skipped"
              :split="false"
              class="batch-plan__list"
              size="small"
            >
              <template #renderItem="{ item }">
                <List.Item class="batch-plan__row">
                  <Tag :bordered="false">
                    {{ batchTypeLabel(item.assetType) }}
                  </Tag>
                  <span>{{ item.name || `资产 #${item.assetId}` }}</span>
                  <span class="batch-plan__reason">
                    {{ batchSkipLabel(item.reason) }}
                  </span>
                </List.Item>
              </template>
            </List>
          </template>
        </template>
        <Alert
          v-if="batchSubmitError"
          :message="formatApiError(batchSubmitError)"
          :type="batchSubmitError.notReady ? 'info' : 'error'"
          show-icon
        />
        <VbenLoading
          :spinning="batchPlanLoading"
          class="batch-plan__loading"
        />
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.entity-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;

  &__toolbar {
    flex: none;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 0% 0%,
        color-mix(in srgb, hsl(var(--primary)) 10%, transparent) 0%,
        transparent 44%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, hsl(var(--primary)) 4%, hsl(var(--card))) 0%,
        hsl(var(--card)) 58%
      );
    border: 1px solid
      color-mix(in srgb, hsl(var(--primary)) 16%, hsl(var(--border)));

    :deep(.ant-card-body) {
      padding: 12px;
    }
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__head-icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 18px;
    color: hsl(var(--primary-foreground));
    background: linear-gradient(
      135deg,
      hsl(var(--primary)) 0%,
      color-mix(in srgb, hsl(var(--primary)) 70%, hsl(var(--success))) 100%
    );
    border-radius: 10px;
    box-shadow: 0 6px 16px
      color-mix(in srgb, hsl(var(--primary)) 22%, transparent);
  }

  &__head-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__heading {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__subheading {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 10px;
  }

  &__bar--secondary {
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px dashed
      color-mix(in srgb, hsl(var(--border)) 80%, transparent);
  }

  &__label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__model {
    width: 220px;
  }

  &__spacer {
    flex: 1;
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__hint--error {
    color: hsl(var(--destructive));
  }

  &__ratio-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    margin: 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: color-mix(in srgb, hsl(var(--primary)) 8%, hsl(var(--card)));
    border: 1px solid
      color-mix(in srgb, hsl(var(--primary)) 14%, hsl(var(--border)));
    border-radius: 999px;
  }

  &__group-label {
    font-size: 12px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  &__batch-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    margin: 0;
    font-size: 12px;
  }

  &__main {
    display: flex;
    flex: 1;
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

  &__summary {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__stat {
    --tint: hsl(var(--primary));
    --tint-fg: hsl(var(--primary-foreground));

    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 112px;
    padding: 8px 12px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tint) 12%, hsl(var(--card))) 0%,
      hsl(var(--card)) 82%
    );
    border: 1px solid
      color-mix(in srgb, var(--tint) 20%, hsl(var(--border)));
    border-radius: 10px;
  }

  &__stat--scene {
    --tint: hsl(var(--success));
    --tint-fg: hsl(var(--success-foreground));
  }

  &__stat--element {
    --tint: hsl(var(--warning));
    --tint-fg: hsl(var(--warning-foreground));
  }

  &__stat--generating {
    --tint: hsl(var(--primary));
    --tint-fg: hsl(var(--primary-foreground));
  }

  &__stat--failed {
    --tint: hsl(var(--destructive));
    --tint-fg: hsl(var(--destructive-foreground));
  }

  &__stat--done {
    --tint: hsl(var(--success));
    --tint-fg: hsl(var(--success-foreground));

    min-width: 168px;
  }

  &__stat-icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    color: var(--tint-fg);
    background: var(--tint);
    border-radius: 8px;
    box-shadow: 0 4px 10px
      color-mix(in srgb, var(--tint) 28%, transparent);
  }

  &__stat-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  &__stat-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__stat-value {
    font-size: 18px;
    line-height: 1.2;
    color: hsl(var(--foreground));
  }

  &__stat-bar {
    display: block;
    width: 100%;
    height: 4px;
    margin-top: 2px;
    overflow: hidden;
    background: hsl(var(--accent));
    border-radius: 999px;

    i {
      display: block;
      height: 100%;
      background: hsl(var(--success));
      border-radius: 999px;
      transition: width 0.2s ease;
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed hsl(var(--border));

    :deep(.ant-segmented) {
      background-color: hsl(var(--accent));
    }

    :deep(.ant-segmented-item-selected) {
      color: hsl(var(--primary));
      background: color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card)));
      box-shadow: none;
    }
  }

  &__filter-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__list {
    position: relative;
    flex: 1;
    min-height: 0;
    padding: 12px;
    overflow-y: auto;
    background: color-mix(in srgb, hsl(var(--primary)) 2%, hsl(var(--card)));

    :deep(.ant-empty) {
      margin: auto;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 14px;
  }

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }
}

.entity-card {
  --tint: hsl(var(--primary));
  --tint-fg: hsl(var(--primary-foreground));

  position: relative;
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid color-mix(in srgb, var(--tint) 20%, hsl(var(--border)));
  border-radius: 12px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &.is-focused {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px
      color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--tint) 34%, hsl(var(--border)));
    box-shadow: 0 12px 28px color-mix(in srgb, var(--tint) 16%, transparent);
    transform: translateY(-2px);
  }

  &--character {
    --tint: hsl(var(--primary));
    --tint-fg: hsl(var(--primary-foreground));
  }

  &--scene {
    --tint: hsl(var(--success));
    --tint-fg: hsl(var(--success-foreground));
  }

  &--element {
    --tint: hsl(var(--warning));
    --tint-fg: hsl(var(--warning-foreground));
  }

  :deep(.ant-card-body) {
    padding: 0;
  }

  &__cover {
    position: relative;
    height: 128px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 18% 12%,
        color-mix(in srgb, var(--tint) 32%, transparent) 0%,
        transparent 52%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--tint) 18%, hsl(var(--card))) 0%,
        color-mix(in srgb, var(--tint) 5%, hsl(var(--card))) 100%
      );
  }

  &__cover-image {
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
      object-position: center top;
    }
  }

  &__cover-empty {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;

    :deep(.anticon) {
      font-size: 28px;
      color: var(--tint);
    }
  }

  &__cover-text {
    color: hsl(var(--muted-foreground));
  }

  &__cover-badges {
    position: absolute;
    right: 8px;
    bottom: 8px;
    left: 8px;
    z-index: 2;
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
  }

  &__type-pill,
  &__count-pill {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    line-height: 18px;
    background: color-mix(in srgb, hsl(var(--card)) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--tint) 22%, transparent);
    border-radius: 999px;
    backdrop-filter: blur(6px);
  }

  &__type-pill {
    font-weight: 500;
    color: hsl(var(--foreground));

    :deep(.anticon) {
      color: var(--tint);
    }
  }

  &__count-pill {
    color: hsl(var(--muted-foreground));
    border-color: color-mix(in srgb, hsl(var(--border)) 70%, transparent);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  &__status {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    :deep(.ant-tag) {
      margin: 0;
    }
  }

  &__fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__field-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__field--block {
    width: 100%;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding-top: 2px;
  }

  &__actions-spacer {
    flex: 1;
  }
}

.voice {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 80px;

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }

  :deep(.ant-radio-wrapper) {
    margin-right: 16px;
  }
}

.archetype {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;

  &__options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__option {
    display: flex;
    padding: 8px 10px;
    margin: 0;
    background: hsl(var(--accent));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;

    :deep(.ant-radio) {
      align-self: flex-start;
    }
  }

  &__label {
    display: block;
    font-size: 14px;
    color: hsl(var(--foreground));
  }

  &__value {
    display: block;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }
}

.batch-plan {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 140px;

  &__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  &__title {
    font-size: 12px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  &__list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 4px 8px;
    font-size: 12px;
  }

  &__reason {
    color: hsl(var(--muted-foreground));
  }

  &__loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    min-height: 0;
    pointer-events: none;
  }
}

.entity-create {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__row--column {
    flex-direction: column;
    align-items: stretch;
  }

  &__label {
    flex: none;
    width: 48px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
