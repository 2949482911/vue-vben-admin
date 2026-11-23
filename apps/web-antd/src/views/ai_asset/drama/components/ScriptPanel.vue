<script lang="ts" setup name="DramaScriptPanel">
/**
 * 剧本页：剧情 → 剧本 二级页。
 *
 * 链路位置：短剧工作台 → 剧情 → 剧本 → 本组件。
 * 生成/校验/定稿/分场保存全部走后端既有契约；分镜门禁要求 scenes 非空且 scriptStatus=2，
 * 本页只展示真实状态与后端原文，不伪造场次、不直接改 scriptStatus。
 */
import type { DramaApiError } from '../error';

import type {
  EpisodeItem,
  EpisodeScriptIssue,
  EpisodeScriptValidateResult,
  ScriptScene,
  StudioScriptScenePatch,
} from '#/api/models/ai_asset';
import type { StoryboardModelItem } from '#/api/models/ai_asset_storyboard';

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';

import { VbenLoading } from '@vben/common-ui';

import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { aiAssetStoryboardApi } from '#/api/core/ai_asset_storyboard';
import { aiModelApi } from '#/api/core/ai_model';

import { formatApiError, parseApiError } from '../error';

const props = defineProps<{
  /** 默认目标时长：优先小说 episodeDuration，缺省 60 秒 */
  defaultDuration?: number;
  episodeId?: number | string;
}>();

const emit = defineEmits<{
  /** 剧本内容或状态变化后，通知分镜台刷新门禁提示 */
  scriptChanged: [];
}>();

const ERROR_CODES = new Set([
  'duration_mismatch',
  'duration_missing',
  'scene_action_empty',
  'scene_characters_empty',
  'scene_invalid',
  'scenes_empty',
]);

interface DialogueDraft {
  emotion: string;
  line: string;
  role: string;
}

interface SceneDraft {
  action: string;
  characters: string[];
  dialogue: DialogueDraft[];
  durationSeconds?: number;
  heading: string;
  location: string;
  sceneSeq: number;
  sceneType: string;
  timeOfDay: string;
}

const STATUS_META: Record<
  number,
  { color: string; label: string }
> = {
  0: { color: 'default', label: '未生成' },
  1: { color: 'processing', label: '已生成' },
  2: { color: 'success', label: '已定稿' },
  3: { color: 'warning', label: '已过期' },
};

const episode = ref<EpisodeItem>();
const loading = ref(false);
const loadError = ref<DramaApiError>();
let loadSeq = 0;

const models = ref<StoryboardModelItem[]>([]);
const modelsLoading = ref(false);
const modelsError = ref<DramaApiError>();
const modelId = ref<number | string>();
let modelsSeq = 0;

const durationSeconds = ref<number>(60);
const generating = ref(false);
const generateError = ref<DramaApiError>();
const elapsedSeconds = ref(0);
let elapsedTimer: ReturnType<typeof setInterval> | undefined;

const validating = ref(false);
const validateError = ref<DramaApiError>();
const validateResult = ref<EpisodeScriptValidateResult>();

const finalizing = ref(false);
const finalizeError = ref<DramaApiError>();

const sceneDrawerOpen = ref(false);
const sceneSaving = ref(false);
const sceneSaveError = ref<DramaApiError>();
const sceneDraft = reactive<SceneDraft>({
  action: '',
  characters: [],
  dialogue: [],
  durationSeconds: undefined,
  heading: '',
  location: '',
  sceneSeq: 1,
  sceneType: '',
  timeOfDay: '',
});

const scenes = computed(() => episode.value?.scenes ?? []);
const scriptStatus = computed(() => Number(episode.value?.scriptStatus ?? 0));
const statusMeta = computed(
  () => STATUS_META[scriptStatus.value] ?? STATUS_META[0]!,
);
const totalDuration = computed(() =>
  scenes.value.reduce(
    (sum, scene) => sum + (Number(scene.durationSeconds) || 0),
    0,
  ),
);

const modelOptions = computed(() =>
  models.value.map((item) => ({
    label:
      [item.provider, item.model].filter(Boolean).join(' · ') ||
      `模型 #${item.modelId}`,
    value: item.modelId,
  })),
);

const characterOptions = computed(() => {
  const names = new Set<string>();
  for (const scene of scenes.value) {
    for (const name of scene.characters ?? []) {
      if (name) {
        names.add(name);
      }
    }
  }
  return [...names].map((name) => ({ label: name, value: name }));
});

function normalizedDuration(value?: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 15 && number <= 600
    ? Math.round(number)
    : 60;
}

const elapsedText = computed(() => {
  const total = elapsedSeconds.value;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
});

const generateDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (generating.value) {
    return '正在生成剧本';
  }
  if (modelsLoading.value) {
    return '模型加载中';
  }
  if (!modelId.value) {
    return '没有可用模型';
  }
  if (
    !Number.isFinite(Number(durationSeconds.value)) ||
    Number(durationSeconds.value) < 15 ||
    Number(durationSeconds.value) > 600
  ) {
    return '目标时长需在 15–600 秒';
  }
  return '';
});

const validateDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (loading.value) {
    return '剧本加载中';
  }
  if (validating.value || finalizing.value || generating.value) {
    return '正在处理';
  }
  return '';
});

const finalizeDisabledReason = computed(() => {
  if (!props.episodeId) {
    return '先选择剧集';
  }
  if (!scenes.value.length) {
    return '剧本没有场次，请先生成剧本';
  }
  if (scriptStatus.value === 2) {
    return '剧本已定稿';
  }
  if (finalizing.value || generating.value) {
    return '正在处理';
  }
  if (!validateResult.value) {
    return '请先校验剧本';
  }
  if (validationErrors.value.length > 0 || validateResult.value.level === 'error') {
    return '校验存在 error，不能定稿';
  }
  return '';
});

const validationErrors = computed(() => splitValidation().errors);
const validationWarnings = computed(() => splitValidation().warnings);

function issueKey(issue: EpisodeScriptIssue) {
  return [
    issue.code ?? '',
    issue.message,
    issue.sceneSeq ?? issue.seq ?? '',
  ].join('|');
}

function dedupeIssues(items: EpisodeScriptIssue[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = issueKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/** 后端可能返回 issues，也可能分 errors/warnings；无 level 时按门禁 error code 归类 */
function splitValidation() {
  const result = validateResult.value;
  if (!result) {
    return { errors: [] as EpisodeScriptIssue[], warnings: [] as EpisodeScriptIssue[] };
  }
  const issues = result.issues ?? [];
  let errors = result.errors?.length
    ? result.errors
    : issues.filter(
        (item) =>
          item.level === 'error' || ERROR_CODES.has(item.code ?? ''),
      );
  if (result.level === 'error' && errors.length === 0) {
    errors = issues;
  }
  const errorKeys = new Set(errors.map((item) => issueKey(item)));
  const warnings = result.warnings?.length
    ? result.warnings
    : issues.filter((item) => !errorKeys.has(issueKey(item)));
  return {
    errors: dedupeIssues(errors),
    warnings: dedupeIssues(warnings),
  };
}

function issueSceneText(issue: EpisodeScriptIssue) {
  const seq = issue.sceneSeq ?? issue.seq;
  return seq === undefined || seq === null ? '全局' : `第 ${seq} 场`;
}

function stopElapsedTimer() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
    elapsedTimer = undefined;
  }
}

function startElapsedTimer() {
  stopElapsedTimer();
  const startedAt = Date.now();
  elapsedSeconds.value = 0;
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - startedAt) / 1000);
  }, 1000);
}

function applyEpisode(item: EpisodeItem) {
  episode.value = item;
  validateResult.value = undefined;
  validateError.value = undefined;
  finalizeError.value = undefined;
}

async function loadEpisode(id: number | string, resetDuration = true) {
  const seq = ++loadSeq;
  loadError.value = undefined;
  generateError.value = undefined;
  validateError.value = undefined;
  finalizeError.value = undefined;
  validateResult.value = undefined;
  if (resetDuration) {
    durationSeconds.value = normalizedDuration(props.defaultDuration);
  }
  loading.value = true;
  try {
    const item = await aiAssetApi.fetchEpisodeDetail(id, true);
    if (seq !== loadSeq) {
      return;
    }
    episode.value = item;
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

async function loadModels(id: number | string) {
  const seq = ++modelsSeq;
  modelsError.value = undefined;
  models.value = [];
  modelId.value = undefined;
  modelsLoading.value = true;
  try {
    // 分镜列表模型优先；但它可能只返回 image 能力，剧本必须用 text
    let items: StoryboardModelItem[] = [];
    try {
      const result = await aiAssetStoryboardApi.fetchStoryboardList(id);
      if (seq !== modelsSeq) {
        return;
      }
      items = (result.models ?? []).filter(
        (item) => String(item.capability ?? '').toLowerCase() === 'text',
      );
    } catch {
      items = [];
    }
    if (!items.length) {
      const page = await aiModelApi.fetchModelConfigList(
        { page: 1, pageSize: 500 },
        true,
      );
      if (seq !== modelsSeq) {
        return;
      }
      items = (page?.items ?? [])
        .filter((item) => item.status === undefined || item.status === 1)
        .filter(
          (item) => String(item.capability ?? '').toLowerCase() === 'text',
        )
        .map((item) => ({
          capability: 'text',
          model: item.model,
          modelId: item.id,
          provider: item.provider,
        }));
    }
    models.value = items;
    modelId.value = items[0]?.modelId;
  } catch (error) {
    if (seq !== modelsSeq) {
      return;
    }
    modelsError.value = parseApiError(error);
  } finally {
    if (seq === modelsSeq) {
      modelsLoading.value = false;
    }
  }
}

watch(
  () => props.episodeId,
  (id) => {
    sceneDrawerOpen.value = false;
    episode.value = undefined;
    models.value = [];
    modelId.value = undefined;
    loadError.value = undefined;
    modelsError.value = undefined;
    validateResult.value = undefined;
    generateError.value = undefined;
    finalizeError.value = undefined;
    durationSeconds.value = normalizedDuration(props.defaultDuration);
    if (!id) {
      loading.value = false;
      return;
    }
    void Promise.all([loadEpisode(id), loadModels(id)]);
  },
  { immediate: true },
);

watch(
  () => props.defaultDuration,
  (value) => {
    if (!generating.value && !scenes.value.length) {
      durationSeconds.value = normalizedDuration(value);
    }
  },
  { immediate: true },
);

onBeforeUnmount(stopElapsedTimer);

async function generateScript() {
  if (!props.episodeId || generateDisabledReason.value) {
    return;
  }
  const targetId = props.episodeId;
  generating.value = true;
  generateError.value = undefined;
  validateResult.value = undefined;
  startElapsedTimer();
  try {
    const item = await aiAssetApi.generateEpisodeScript({
      durationSeconds: Number(durationSeconds.value),
      episodeId: targetId,
      modelId: modelId.value!,
    });
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    applyEpisode(item);
    emit('scriptChanged');
    if (item.scenes?.length) {
      message.success(`剧本已生成：${item.scenes.length} 场`);
    } else {
      message.warning('剧本已生成，但后端未返回场次；分镜门禁仍会拦截');
    }
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      generateError.value = parseApiError(error);
    }
  } finally {
    if (String(props.episodeId) === String(targetId)) {
      generating.value = false;
    }
    stopElapsedTimer();
  }
}

async function validateScript() {
  if (!props.episodeId || validateDisabledReason.value) {
    return;
  }
  const targetId = props.episodeId;
  validating.value = true;
  validateError.value = undefined;
  try {
    const result = await aiAssetApi.validateEpisodeScript(targetId);
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    validateResult.value = result;
    if (result.scriptStatus !== undefined) {
      episode.value = {
        ...(episode.value ?? ({} as EpisodeItem)),
        scriptStatus: result.scriptStatus,
      };
    }
    if (result.level === 'error') {
      message.error('剧本校验存在 error');
    } else if (result.level === 'warning') {
      message.warning('剧本校验通过，但存在 warning');
    } else {
      message.success('剧本校验通过');
    }
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      validateError.value = parseApiError(error);
    }
  } finally {
    validating.value = false;
  }
}

async function finalizeScript() {
  if (!props.episodeId || finalizeDisabledReason.value) {
    return;
  }
  const targetId = props.episodeId;
  finalizing.value = true;
  finalizeError.value = undefined;
  try {
    const result = await aiAssetApi.finalizeEpisodeScript({
      episodeId: targetId,
    });
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    let detail: EpisodeItem | undefined;
    try {
      detail = await aiAssetApi.fetchEpisodeDetail(targetId, true);
    } catch {
      detail = undefined;
    }
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    episode.value = detail ?? {
      ...(episode.value ?? ({} as EpisodeItem)),
      scriptStatus: result.scriptStatus ?? 2,
    };
    validateResult.value = undefined;
    emit('scriptChanged');
    message.success(
      `剧本已定稿：${result.sceneCount ?? detail?.scenes?.length ?? 0} 场`,
    );
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      finalizeError.value = parseApiError(error);
    }
  } finally {
    finalizing.value = false;
  }
}

function openScene(scene: ScriptScene) {
  sceneSaveError.value = undefined;
  sceneDraft.sceneSeq = scene.seq;
  sceneDraft.heading = scene.heading ?? '';
  sceneDraft.sceneType = scene.sceneType ?? '';
  sceneDraft.location = scene.location ?? '';
  sceneDraft.timeOfDay = scene.timeOfDay ?? '';
  sceneDraft.characters = [...(scene.characters ?? [])];
  sceneDraft.action = scene.action ?? '';
  sceneDraft.durationSeconds = scene.durationSeconds;
  sceneDraft.dialogue = (scene.dialogue ?? []).map((item) => ({
    emotion: item.emotion ?? '',
    line: item.line ?? '',
    role: item.role ?? '',
  }));
  sceneDrawerOpen.value = true;
}

function addDialogue() {
  sceneDraft.dialogue.push({ emotion: '', line: '', role: '' });
}

function removeDialogue(index: number) {
  sceneDraft.dialogue.splice(index, 1);
}

async function saveScene() {
  if (!props.episodeId || sceneSaving.value) {
    return;
  }
  const targetId = props.episodeId;
  const patch: StudioScriptScenePatch = {
    action: sceneDraft.action.trim(),
    characters: sceneDraft.characters
      .map((name) => name.trim())
      .filter(Boolean),
    dialogue: sceneDraft.dialogue
      .map((item) => ({
        emotion: item.emotion.trim() || undefined,
        line: item.line.trim(),
        role: item.role.trim(),
      }))
      .filter((item) => item.line || item.role),
    durationSeconds: Number(sceneDraft.durationSeconds) || 0,
    heading: sceneDraft.heading.trim(),
    location: sceneDraft.location.trim(),
    sceneType: sceneDraft.sceneType.trim(),
    timeOfDay: sceneDraft.timeOfDay.trim(),
  };
  sceneSaving.value = true;
  sceneSaveError.value = undefined;
  try {
    const saved = await aiAssetApi.saveStudioScriptScene({
      episodeId: targetId,
      scene: patch,
      sceneSeq: sceneDraft.sceneSeq,
    });
    if (String(props.episodeId) !== String(targetId)) {
      return;
    }
    applyEpisode(saved);
    sceneDrawerOpen.value = false;
    emit('scriptChanged');
    message.success('场次已保存；剧本已过期，请重新校验并定稿');
  } catch (error) {
    if (String(props.episodeId) === String(targetId)) {
      sceneSaveError.value = parseApiError(error);
    }
  } finally {
    sceneSaving.value = false;
  }
}
</script>

<template>
  <div class="script-panel">
    <Card class="script-panel__toolbar" :body-style="{ padding: '12px' }">
      <div class="script-panel__row">
        <span class="script-panel__title">
          <FileTextOutlined />
          剧本
        </span>
        <Tag :bordered="false" :color="statusMeta.color">
          {{ statusMeta.label }}
        </Tag>
        <span class="script-panel__hint">
          {{ scenes.length }} 场 · 总时长 {{ totalDuration }}s
        </span>
        <span class="script-panel__spacer"></span>
        <span class="script-panel__label">模型</span>
        <Select
          v-model:value="modelId"
          :disabled="modelsLoading || !models.length || generating"
          :loading="modelsLoading"
          :options="modelOptions"
          class="script-panel__model"
          option-filter-prop="label"
          placeholder="剧本模型"
          show-search
        />
        <span class="script-panel__label">目标时长</span>
        <InputNumber
          v-model:value="durationSeconds"
          :disabled="generating"
          :max="600"
          :min="15"
          :precision="0"
          class="script-panel__duration"
        />
        <span class="script-panel__unit">秒</span>
        <Tooltip :title="generateDisabledReason">
          <span>
            <Button
              :disabled="Boolean(generateDisabledReason)"
              :loading="generating"
              type="primary"
              @click="generateScript"
            >
              生成剧本
            </Button>
          </span>
        </Tooltip>
        <span v-if="generating" class="script-panel__elapsed">
          生成中 · {{ elapsedText }}
        </span>
      </div>

      <div class="script-panel__row script-panel__row--secondary">
        <Tooltip :title="validateDisabledReason">
          <span>
            <Button
              :disabled="Boolean(validateDisabledReason)"
              :loading="validating"
              size="small"
              @click="validateScript"
            >
              校验
            </Button>
          </span>
        </Tooltip>
        <Tooltip :title="finalizeDisabledReason">
          <span>
            <Button
              :disabled="Boolean(finalizeDisabledReason)"
              :loading="finalizing"
              size="small"
              type="primary"
              @click="finalizeScript"
            >
              定稿
            </Button>
          </span>
        </Tooltip>
        <span
          v-if="scriptStatus === 3"
          class="script-panel__state script-panel__state--warning"
        >
          剧本已过期，请重新校验并定稿
        </span>
        <span
          v-else-if="scriptStatus === 2"
          class="script-panel__state script-panel__state--ok"
        >
          已定稿，分镜门禁已放行
        </span>
        <span
          v-else-if="scriptStatus === 1"
          class="script-panel__state"
        >
          已生成，需校验并定稿后才能生成分镜
        </span>
        <span v-else class="script-panel__state">
          未生成，生成并定稿后才能拆分分镜
        </span>
      </div>

      <Alert
        v-if="modelsError"
        :message="formatApiError(modelsError)"
        type="warning"
        show-icon
      />
      <Alert
        v-else-if="!modelsLoading && !models.length"
        message="分镜列表接口未返回可用剧本模型"
        type="warning"
        show-icon
      />
      <Alert
        v-if="loadError"
        :message="formatApiError(loadError)"
        :type="loadError.notReady ? 'info' : 'error'"
        show-icon
      />
      <Alert
        v-if="generateError"
        :message="formatApiError(generateError)"
        :type="generateError.notReady ? 'info' : 'error'"
        show-icon
      />
      <Alert
        v-if="finalizeError"
        :message="formatApiError(finalizeError)"
        :type="finalizeError.notReady ? 'info' : 'error'"
        show-icon
      />
    </Card>

    <Card
      v-if="validateResult || validateError"
      class="script-panel__validation"
      :body-style="{ padding: '12px' }"
    >
      <div class="script-panel__section-head">
        <span class="script-panel__section-title">校验结果</span>
        <Tag v-if="validationErrors.length" color="error">
          {{ validationErrors.length }} error
        </Tag>
        <Tag v-if="validationWarnings.length" color="warning">
          {{ validationWarnings.length }} warning
        </Tag>
        <Tag
          v-if="!validationErrors.length && !validationWarnings.length"
          color="success"
        >
          通过
        </Tag>
      </div>
      <Alert
        v-if="validateError"
        :message="formatApiError(validateError)"
        :type="validateError.notReady ? 'info' : 'error'"
        show-icon
      />
      <div v-if="validationErrors.length" class="script-panel__issues">
        <div
          v-for="issue in validationErrors"
          :key="`error:${issueKey(issue)}`"
          class="script-panel__issue"
        >
          <Tag color="error">error</Tag>
          <span class="script-panel__issue-scene">
            {{ issueSceneText(issue) }}
          </span>
          <span>{{ issue.message }}</span>
        </div>
      </div>
      <div v-if="validationWarnings.length" class="script-panel__issues">
        <div
          v-for="issue in validationWarnings"
          :key="`warning:${issueKey(issue)}`"
          class="script-panel__issue"
        >
          <Tag color="warning">warning</Tag>
          <span class="script-panel__issue-scene">
            {{ issueSceneText(issue) }}
          </span>
          <span>{{ issue.message }}</span>
        </div>
      </div>
      <Alert
        v-if="
          validateResult &&
          !validationErrors.length &&
          !validationWarnings.length
        "
        message="校验通过，可执行定稿"
        type="success"
        show-icon
      />
    </Card>

    <Card class="script-panel__main" :body-style="{ padding: 0 }">
      <div class="script-panel__section-head script-panel__section-head--main">
        <span class="script-panel__section-title">场次</span>
        <span class="script-panel__hint">
          {{ scenes.length }} 场 · 总时长 {{ totalDuration }}s
        </span>
      </div>
      <div class="script-panel__body">
        <VbenLoading
          :spinning="loading"
          class="script-panel__loading"
        />
        <Empty
          v-if="!episodeId"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="先选择剧集"
        />
        <Empty
          v-else-if="!loading && !loadError && !scenes.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="先生成剧本"
        >
          <template #description>
            还没有场次，先生成剧本，再校验并定稿
          </template>
        </Empty>
        <div v-else class="script-panel__scenes">
          <Card
            v-for="scene in scenes"
            :key="scene.seq"
            class="script-panel__scene"
            :body-style="{ padding: '12px' }"
            size="small"
          >
            <div class="script-panel__scene-head">
              <Tag color="blue">第 {{ scene.seq }} 场</Tag>
              <span class="script-panel__scene-heading">
                {{ scene.heading || '未命名场次' }}
              </span>
              <span class="script-panel__scene-meta">
                {{
                  [scene.location, scene.timeOfDay, scene.sceneType]
                    .filter(Boolean)
                    .join(' · ') || '场地/时间未填写'
                }}
              </span>
              <span class="script-panel__spacer"></span>
              <Tag>{{ scene.durationSeconds ?? 0 }}s</Tag>
              <Button size="small" @click="openScene(scene)">
                <template #icon><EditOutlined /></template>
                编辑场次
              </Button>
            </div>

            <div
              v-if="scene.characters?.length"
              class="script-panel__characters"
            >
              <Tag
                v-for="name in scene.characters"
                :key="name"
                :bordered="false"
              >
                {{ name }}
              </Tag>
            </div>
            <div v-else class="script-panel__muted">未填写人物</div>

            <p class="script-panel__action">
              {{ scene.action || '未填写动作描述' }}
            </p>

            <div
              v-if="scene.dialogue?.length"
              class="script-panel__dialogue"
            >
              <div
                v-for="(line, index) in scene.dialogue"
                :key="index"
                class="script-panel__dialogue-row"
              >
                <span class="script-panel__dialogue-role">
                  {{ line.role || '未署名' }}
                  <template v-if="line.emotion">（{{ line.emotion }}）</template>
                </span>
                <span>{{ line.line }}</span>
              </div>
            </div>
            <div v-else class="script-panel__muted">本场无对白</div>
          </Card>
        </div>
      </div>
    </Card>

    <Drawer
      v-model:open="sceneDrawerOpen"
      :title="`编辑第 ${sceneDraft.sceneSeq} 场`"
      placement="right"
      width="620px"
    >
      <div class="scene-editor">
        <label class="scene-editor__field">
          <span>标题</span>
          <Input v-model:value="sceneDraft.heading" placeholder="场次标题" />
        </label>
        <div class="scene-editor__grid">
          <label class="scene-editor__field">
            <span>场次类型</span>
            <Input
              v-model:value="sceneDraft.sceneType"
              placeholder="如 日戏 / 夜戏"
            />
          </label>
          <label class="scene-editor__field">
            <span>地点</span>
            <Input
              v-model:value="sceneDraft.location"
              placeholder="地点"
            />
          </label>
          <label class="scene-editor__field">
            <span>时间</span>
            <Input
              v-model:value="sceneDraft.timeOfDay"
              placeholder="如 夜 / 清晨"
            />
          </label>
          <label class="scene-editor__field">
            <span>时长（秒）</span>
            <InputNumber
              v-model:value="sceneDraft.durationSeconds"
              :max="600"
              :min="0"
              :precision="0"
            />
          </label>
        </div>
        <label class="scene-editor__field">
          <span>人物</span>
          <Select
            v-model:value="sceneDraft.characters"
            :options="characterOptions"
            mode="tags"
            placeholder="输入或选择人物"
          />
        </label>
        <label class="scene-editor__field">
          <span>动作描述</span>
          <Input.TextArea
            v-model:value="sceneDraft.action"
            :rows="4"
            placeholder="场次动作与画面"
          />
        </label>

        <div class="scene-editor__block">
          <div class="scene-editor__block-head">
            <span>对白</span>
            <Button size="small" type="dashed" @click="addDialogue">
              <template #icon><PlusOutlined /></template>
              添加对白
            </Button>
          </div>
          <div
            v-for="(line, index) in sceneDraft.dialogue"
            :key="index"
            class="scene-editor__dialogue"
          >
            <Input
              v-model:value="line.role"
              placeholder="角色"
              class="scene-editor__dialogue-role"
            />
            <Input
              v-model:value="line.emotion"
              placeholder="情绪"
              class="scene-editor__dialogue-emotion"
            />
            <Input
              v-model:value="line.line"
              placeholder="台词"
              class="scene-editor__dialogue-line"
            />
            <Button
              danger
              size="small"
              type="text"
              @click="removeDialogue(index)"
            >
              <template #icon><DeleteOutlined /></template>
            </Button>
          </div>
          <div
            v-if="!sceneDraft.dialogue.length"
            class="scene-editor__muted"
          >
            暂无对白
          </div>
        </div>

        <Alert
          v-if="sceneSaveError"
          :message="formatApiError(sceneSaveError)"
          :type="sceneSaveError.notReady ? 'info' : 'error'"
          show-icon
        />

        <div class="scene-editor__actions">
          <Button @click="sceneDrawerOpen = false">取消</Button>
          <Button
            :loading="sceneSaving"
            type="primary"
            @click="saveScene"
          >
            保存场次
          </Button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.script-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;

  &__toolbar,
  &__validation {
    flex: none;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    &--secondary {
      margin-top: 8px;
    }
  }

  &__title {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__label {
    margin-left: 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__model {
    width: 260px;
  }

  &__duration {
    width: 120px;
  }

  &__unit {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__elapsed {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__state {
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    &--warning {
      color: hsl(var(--warning-foreground));
    }

    &--ok {
      color: hsl(var(--success-foreground));
    }
  }

  &__section-head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 0 0 8px;

    &--main {
      padding: 12px;
      border-bottom: 1px solid hsl(var(--border));
    }
  }

  &__section-title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__issues {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  &__issue {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 13px;
    color: hsl(var(--foreground));
  }

  &__issue-scene {
    flex: none;
    font-weight: 600;
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
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

  &__scenes {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__scene {
    border: 1px solid hsl(var(--border));
    border-radius: 10px;
  }

  &__scene-head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__scene-heading {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__scene-meta {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__characters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  &__muted {
    margin-top: 8px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__action {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: hsl(var(--foreground));
    white-space: pre-wrap;
  }

  &__dialogue {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px dashed hsl(var(--border));
  }

  &__dialogue-row {
    display: flex;
    gap: 8px;
    font-size: 13px;
    line-height: 1.5;
    color: hsl(var(--foreground));
  }

  &__dialogue-role {
    flex: none;
    font-weight: 600;
    color: hsl(var(--primary));
  }
}

.scene-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__dialogue {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  &__dialogue-role {
    width: 110px;
  }

  &__dialogue-emotion {
    width: 110px;
  }

  &__dialogue-line {
    flex: 1;
  }

  &__muted {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid hsl(var(--border));
  }
}
</style>
