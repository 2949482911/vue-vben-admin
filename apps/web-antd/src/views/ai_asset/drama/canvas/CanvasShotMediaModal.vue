<script lang="ts" setup name="CanvasShotMediaModal">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import { Alert, message, Modal, Select, Switch, Tag } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';
import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { formatApiError, parseApiError } from '../error';
import { useCanvasShotMedia } from './useCanvasShotMedia';

const props = defineProps<{
  canvasId?: string;
  nodeLabel: string;
  shotId: string;
  type: 'keyframe' | 'segment-video' | 'video';
}>();

const emit = defineEmits<{ close: [] }>();

const media = useCanvasShotMedia();
const loading = ref(false);
const error = ref('');
const chainNextFirstFrame = ref(true);
type TailFrameSource = 'next-first-frame' | 'none' | 'unknown';
const tailFrameLoading = ref(false);
const tailFrameSource = ref<TailFrameSource>('unknown');
let tailFrameSeq = 0;

const state = computed(() =>
  media.shotState(props.canvasId, props.shotId),
);
const status = computed(() => state.value?.status);
const needStoryboardConfirm = computed(
  () => status.value?.storyboardConfirmed === false,
);
const isVideoGenerate = computed(() => props.type !== 'keyframe');
const canSubmit = computed(
  () =>
    Boolean(props.canvasId) &&
    !loading.value &&
    (!isVideoGenerate.value || videoModelId.value !== undefined),
);
const tailFrameLabel = computed(() => {
  if (tailFrameLoading.value) {
    return '读取中…';
  }
  if (tailFrameSource.value === 'next-first-frame') {
    return '下一镜首帧';
  }
  if (tailFrameSource.value === 'none') {
    return '无';
  }
  return '未知';
});
const actionLabel = computed(() =>
  props.type === 'keyframe'
    ? '重新出图'
    : props.type === 'segment-video'
      ? '生成本段视频'
      : '生成视频',
);
const segmentShotCount = computed(
  () => status.value?.segmentShotCount ?? 0,
);

// ==================== 视频模型 ====================
// 生成视频必须显式传 capability=video 的模型；缺省时后端会回落到项目文本模型（deepseek 等）并报 400。
const videoModelId = ref<number | string>();
const videoModels = ref<Array<{ label: string; value: number | string }>>([]);
const videoModelsLoading = ref(false);
const videoModelsError = ref('');

function toVideoModelOption(item: {
  model?: string;
  modelId: number | string;
  provider?: string;
}) {
  return {
    label: item.provider
      ? `${item.model ?? `模型 #${item.modelId}`}（${item.provider}）`
      : (item.model ?? `模型 #${item.modelId}`),
    value: item.modelId,
  };
}

/** 视频模型候选：Studio 能力注册表优先，空/失败时回落到 capability=video 的模型配置 */
async function loadVideoModels() {
  if (!isVideoGenerate.value) {
    return;
  }
  videoModelsLoading.value = true;
  videoModelsError.value = '';
  let options: Array<{ label: string; value: number | string }> = [];
  try {
    const registry = await aiAssetApi.fetchStudioVideoModels();
    options = (registry ?? [])
      .filter(
        (item) =>
          item.modelId !== undefined &&
          item.modelId !== null &&
          item.configured !== false,
      )
      .map(toVideoModelOption);
  } catch {
    // 注册表未就绪时继续回落模型配置
  }
  if (!options.length) {
    try {
      const page = await aiModelApi.fetchModelConfigList(
        { capability: 'video', page: 1, pageSize: 500 },
        true,
      );
      options = (page?.items ?? [])
        .filter(
          (item) =>
            item.capability === 'video' &&
            item.status !== 9 &&
            item.id !== undefined &&
            item.id !== null,
        )
        .map((item) =>
          toVideoModelOption({
            model: item.model,
            modelId: item.id,
            provider: item.provider ?? item.source,
          }),
        );
    } catch (error) {
      videoModelsError.value = formatApiError(parseApiError(error));
    }
  }
  videoModels.value = options;
  if (
    !options.some(
      (item) => String(item.value) === String(videoModelId.value),
    )
  ) {
    videoModelId.value = options[0]?.value;
  }
  videoModelsLoading.value = false;
}

/** 预计尾帧来源：只按段列表与下一段首镜状态推算，无法确认时显示未知 */
async function loadTailFrameSource() {
  const seq = ++tailFrameSeq;
  if (props.type !== 'segment-video' || !props.canvasId) {
    tailFrameLoading.value = false;
    tailFrameSource.value = 'unknown';
    return;
  }
  const episodeId = status.value?.episodeId;
  const segmentId = status.value?.segmentId;
  if (!episodeId) {
    tailFrameLoading.value = false;
    tailFrameSource.value = 'unknown';
    return;
  }
  tailFrameLoading.value = true;
  tailFrameSource.value = 'unknown';
  try {
    const segments = await aiAssetApi.fetchEpisodeSegments(episodeId, true);
    if (seq !== tailFrameSeq) {
      return;
    }
    const current = segmentId
      ? segments.find((item) => String(item.id) === String(segmentId))
      : segments.find(
          (item) => Number(item.seq) === Number(status.value?.segmentSeq),
        );
    if (!current) {
      tailFrameSource.value = 'unknown';
      return;
    }
    const next = segments.find(
      (item) => Number(item.seq) === Number(current.seq) + 1,
    );
    if (!next) {
      tailFrameSource.value = 'none';
      return;
    }
    let undetermined = false;
    for (const nextShotId of next.shotIds ?? []) {
      try {
        const nextStatus = await aiAssetCanvasApi.fetchCanvasShotStatus(
          props.canvasId,
          nextShotId,
        );
        if (seq !== tailFrameSeq) {
          return;
        }
        if (nextStatus.keyframeUrl || nextStatus.keyframeThumbnailUrl) {
          tailFrameSource.value = 'next-first-frame';
          return;
        }
      } catch {
        if (seq !== tailFrameSeq) {
          return;
        }
        undetermined = true;
      }
    }
    if (next.firstFrameUrl || next.firstFrameThumbnailUrl) {
      tailFrameSource.value = 'next-first-frame';
      return;
    }
    tailFrameSource.value =
      undetermined || next.firstFrameMaterialId ? 'unknown' : 'none';
  } catch {
    if (seq === tailFrameSeq) {
      tailFrameSource.value = 'unknown';
    }
  } finally {
    if (seq === tailFrameSeq) {
      tailFrameLoading.value = false;
    }
  }
}

watch(
  [
    () => props.type,
    () => props.canvasId,
    () => status.value?.episodeId,
    () => status.value?.segmentId,
  ],
  () => {
    void loadTailFrameSource();
  },
  { immediate: true },
);

onMounted(() => {
  media.ensureStatus(props.canvasId, props.shotId);
  void loadVideoModels();
});

onBeforeUnmount(() => {
  tailFrameSeq += 1;
});

async function submit() {
  if (!canSubmit.value || !props.canvasId) {
    return;
  }
  if (isVideoGenerate.value && videoModelId.value === undefined) {
    error.value = '没有可用视频模型，无法提交';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await media.triggerGenerate(props.canvasId, props.shotId, props.type, {
      confirmStoryboard: needStoryboardConfirm.value ? true : undefined,
      modelId: isVideoGenerate.value ? videoModelId.value : undefined,
      params:
        props.type === 'segment-video'
          ? { chainNextFirstFrame: chainNextFirstFrame.value }
          : undefined,
      takeCount: 1,
    });
    message.success(
      `${actionLabel.value}已提交，真实生成中；可在节点查看进度`,
    );
    emit('close');
  } catch (err) {
    const info = parseApiError(err);
    error.value =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '接口未就绪'
        : formatApiError(info);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal
    :confirm-loading="loading"
    :mask-closable="!loading"
    :ok-button-props="{ disabled: !canSubmit }"
    :ok-text="actionLabel"
    :open="true"
    cancel-text="取消"
    :title="`${actionLabel}（真实计费）`"
    width="520px"
    @cancel="emit('close')"
    @ok="submit"
  >
    <Alert
      message="将真实调用模型并计费"
      show-icon
      type="warning"
    >
      <template #description>
        <template v-if="type === 'segment-video'">
          将生成本段视频（本段 {{ segmentShotCount || '—' }} 镜），takeCount 1，真实计费；不生成其他段落。
        </template>
        <template v-else>
          本次只为分镜「{{ nodeLabel }}」生成 1 个 take，不批量、不生成其他镜头。
        </template>
      </template>
    </Alert>

    <div class="canvas-shot-media__meta">
      <span>分镜</span>
      <b>#{{ shotId }}</b>
      <Tag :bordered="false">takeCount 1</Tag>
      <Tag :bordered="false">
        关键帧状态 {{ status?.keyframeStatus ?? '—' }}
      </Tag>
    </div>

    <div v-if="isVideoGenerate" class="canvas-shot-media__model">
      <span>视频模型</span>
      <Select
        v-model:value="videoModelId"
        :disabled="videoModelsLoading || !videoModels.length"
        :loading="videoModelsLoading"
        :options="videoModels"
        class="canvas-shot-media__model-select"
        placeholder="选择视频模型"
        size="small"
      />
      <span v-if="videoModelsLoading" class="canvas-shot-media__hint">
        视频模型加载中…
      </span>
      <span
        v-else-if="videoModelsError"
        class="canvas-shot-media__hint is-error"
      >
        {{ videoModelsError }}
      </span>
      <span v-else-if="!videoModels.length" class="canvas-shot-media__hint is-error">
        暂无可用视频模型，无法提交；请先在模型配置中启用 capability=video 的模型
      </span>
    </div>

    <div v-if="type === 'segment-video'" class="canvas-shot-media__chain">
      <div class="canvas-shot-media__chain-row">
        <span>首尾帧衔接</span>
        <Switch v-model:checked="chainNextFirstFrame" size="small" />
      </div>
      <div class="canvas-shot-media__hint">
        尾帧：{{ tailFrameLabel }}
      </div>
      <div class="canvas-shot-media__hint">
        关闭后不使用下一段首帧作为尾帧。
      </div>
    </div>

    <div v-if="needStoryboardConfirm" class="canvas-shot-media__hint">
      本集分镜未确认；本次提交会自动携带 confirmStoryboard=true。
    </div>
    <div v-else-if="status?.storyboardConfirmed" class="canvas-shot-media__hint">
      本集分镜已确认，不会重复确认。
    </div>

    <Alert
      v-if="status?.blockers?.length"
      message="当前存在阻断项"
      show-icon
      type="error"
    >
      <template #description>
        <ul class="canvas-shot-media__blockers">
          <li v-for="(blocker, index) in status.blockers" :key="index">
            {{ blocker.message }}
            <template v-if="blocker.action">（{{ blocker.action }}）</template>
          </li>
        </ul>
      </template>
    </Alert>

    <Alert v-if="error" :message="error" show-icon type="error" />
    <div v-if="loading" class="canvas-shot-media__hint">
      提交中，请勿关闭…
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.canvas-shot-media__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 10px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  b {
    color: hsl(var(--foreground));
  }
}

.canvas-shot-media__chain {
  padding: 8px 10px;
  margin: 10px 0;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.canvas-shot-media__chain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: hsl(var(--foreground));
}

.canvas-shot-media__hint {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.canvas-shot-media__hint.is-error {
  color: hsl(var(--destructive));
}

.canvas-shot-media__model {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  margin: 10px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.canvas-shot-media__model-select {
  min-width: 220px;
}

.canvas-shot-media__blockers {
  padding-left: 16px;
  margin: 0;
  font-size: 12px;
}
</style>
