<script lang="ts" setup name="CanvasSplitModal">
import type { CanvasFlowNode } from './store';

import type { CanvasSplitShot } from '#/api/models/ai_asset_canvas';

import { computed, ref, watch } from 'vue';

import {
  Alert,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  Tag,
} from 'ant-design-vue';

import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { formatApiError, parseApiError } from '../error';
import { useStoryboardDicts } from '../useStoryboardDicts';
import { useCanvasGraphStore } from './store';

const props = defineProps<{
  canvasId?: string;
  episodeId?: number | string;
  node: CanvasFlowNode;
}>();

const emit = defineEmits<{ close: [] }>();

const store = useCanvasGraphStore();
const { splitModes, splitReady } = useStoryboardDicts();
const mode = ref('');
const shotCount = ref<number>();
const totalDurationSeconds = ref<number>();
const replace = ref(false);
const loading = ref(false);
const error = ref('');

const textBody = computed(() => props.node.data.body?.trim() ?? '');
const canSubmit = computed(
  () =>
    Boolean(props.canvasId) &&
    Boolean(props.episodeId) &&
    Boolean(mode.value) &&
    Boolean(textBody.value) &&
    !loading.value,
);

watch(
  splitModes,
  (options) => {
    if (!mode.value && options.length) {
      mode.value = options[0]?.value ?? '';
    }
  },
  { immediate: true },
);

function collectShots(shots?: CanvasSplitShot[]): CanvasSplitShot[] {
  const seen = new Set<string>();
  return (shots ?? []).filter((shot) => {
    const key = String(shot.shotId ?? '');
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function shotSummary(shot: CanvasSplitShot) {
  return [shot.description, shot.dialogue]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 240);
}

function shotDetails(shot: CanvasSplitShot) {
  return {
    shotId: shot.shotId,
    episodeId: props.episodeId,
    seq: shot.seq,
    durationSeconds: shot.durationSeconds,
    direction: shot.direction ?? undefined,
    imagePrompt: shot.imagePrompt ?? '',
    videoPrompt: shot.videoPrompt ?? '',
    characters: shot.characters ?? [],
    characterIds: shot.characterIds ?? [],
    sceneId: shot.sceneId,
    sceneName: shot.sceneName ?? '',
    sceneSeq: shot.sceneSeq,
    shotType: shot.shotType,
    camera: shot.camera,
    description: shot.description,
    dialogue: shot.dialogue,
  };
}

/** 用接口返回的真实 shots 新建 shot 节点，并建立 text.text → shot.reference */
function createShotNodes(shots: CanvasSplitShot[]) {
  const blueprint = store.blueprintOf('shot');
  if (!blueprint) {
    error.value = 'shot 节点蓝图未加载，无法创建节点';
    return 0;
  }
  const existingShotIds = new Set(
    store.nodes
      .filter((node) => node.data.kind === 'shot')
      .map((node) => String(node.data.details?.shotId ?? ''))
      .filter(Boolean),
  );
  const textNode =
    store.nodes.find((item) => item.id === props.node.id) ?? props.node;
  let created = 0;
  for (const shot of shots) {
    const shotId = String(shot.shotId ?? '');
    if (!shotId || existingShotIds.has(shotId)) {
      continue;
    }
    const createdNode = store.addNode('shot', {
      x: textNode.position.x + textNode.data.width + 80,
      y: textNode.position.y + created * (blueprint.height + 40),
    });
    if (!createdNode) {
      continue;
    }
    store.updateNodeData(createdNode.id, {
      label: `分镜${shot.seq ?? created + 1}`,
      body: shotSummary(shot),
      details: shotDetails(shot),
    });
    store.connect({
      source: props.node.id,
      target: createdNode.id,
      sourceHandle: 'text',
      targetHandle: 'reference',
    });
    created += 1;
  }
  return created;
}

async function submit() {
  if (!canSubmit.value || !props.canvasId || !props.episodeId) {
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const savedBeforeSplit = await store.flushSave();
    if (!savedBeforeSplit) {
      error.value = store.conflict
        ? '画布版本冲突：请刷新后重试'
        : store.error || '文本节点保存失败，暂不拆分';
      return;
    }
    const result = await aiAssetCanvasApi.splitCanvasStoryboard(
      props.canvasId,
      {
        episodeId: props.episodeId,
        mode: mode.value,
        replace: replace.value,
        shotCount: shotCount.value,
        textNodeClientId: props.node.id,
        totalDurationSeconds: totalDurationSeconds.value,
      },
    );
    const shots = collectShots(result?.shots);
    if (!shots.length) {
      error.value = '接口未返回真实分镜，未创建任何节点';
      return;
    }
    const created = createShotNodes(shots);
    if (!created) {
      emit('close');
      message.info('本次分镜已在画布中，无需重复创建');
      return;
    }
    const saved = await store.flushSave();
    if (!saved) {
      error.value = store.conflict
        ? '画布版本冲突：请刷新后重试'
        : store.error || '画布保存失败，请重试';
      return;
    }
    await store.loadGraph(props.canvasId).catch(() => undefined);
    message.success(`已创建 ${created} 个真实分镜节点`);
    emit('close');
  } catch (err) {
    const info = parseApiError(err);
    error.value =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '拆分接口未就绪'
        : formatApiError(info);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal
    :cancel-button-props="{ disabled: loading }"
    :confirm-loading="loading"
    :mask-closable="!loading"
    :ok-button-props="{ disabled: !canSubmit }"
    :open="true"
    cancel-text="取消"
    ok-text="开始拆分"
    title="拆成分镜"
    width="560px"
    @cancel="emit('close')"
    @ok="submit"
  >
    <Alert
      v-if="!splitReady"
      message="拆分模式字典未配置（ai_storyboard_split_mode）"
      show-icon
      type="warning"
    />

    <div class="canvas-split__meta">
      <span>目标剧集</span>
      <b>{{ episodeId ? `剧集 ID ${episodeId}` : '未选择剧集' }}</b>
      <Tag :bordered="false">{{ node.data.label }}</Tag>
    </div>

    <div class="canvas-split__body">{{ textBody || '文本节点内容为空' }}</div>

    <div class="canvas-split__field">
      <span>拆分模式</span>
      <Select
        v-model:value="mode"
        :disabled="!splitReady"
        :options="splitModes"
        placeholder="选择拆分模式"
        size="small"
      />
    </div>

    <div class="canvas-split__row">
      <label class="canvas-split__field">
        <span>镜头数</span>
        <InputNumber
          v-model:value="shotCount"
          :min="1"
          :precision="0"
          placeholder="可选"
          size="small"
        />
      </label>
      <label class="canvas-split__field">
        <span>总时长（秒）</span>
        <InputNumber
          v-model:value="totalDurationSeconds"
          :min="1"
          :precision="0"
          placeholder="可选"
          size="small"
        />
      </label>
    </div>

    <div class="canvas-split__field canvas-split__field--inline">
      <span>覆盖本集现有分镜</span>
      <Switch v-model:checked="replace" size="small" />
      <Tag :bordered="false" :color="replace ? 'error' : 'default'">
        {{ replace ? '开启' : '关闭' }}
      </Tag>
    </div>
    <Alert
      v-if="replace"
      message="覆盖本集现有分镜：原分镜会被替换，请确认后再拆分"
      show-icon
      type="warning"
    />

    <Alert
      v-if="error"
      :message="error"
      show-icon
      type="error"
    />
  </Modal>
</template>

<style scoped lang="scss">
.canvas-split__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 8px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  b {
    color: hsl(var(--foreground));
  }
}

.canvas-split__body {
  display: -webkit-box;
  max-height: 90px;
  margin-bottom: 10px;
  overflow: hidden;
  -webkit-line-clamp: 4;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--foreground));
  -webkit-box-orient: vertical;
}

.canvas-split__row {
  display: flex;
  gap: 12px;
}

.canvas-split__field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  :deep(.ant-select),
  :deep(.ant-input-number) {
    width: 100%;
  }
}

.canvas-split__field--inline {
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
</style>
