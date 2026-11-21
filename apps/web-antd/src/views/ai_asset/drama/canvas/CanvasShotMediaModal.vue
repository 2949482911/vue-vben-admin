<script lang="ts" setup name="CanvasShotMediaModal">
import { computed, ref } from 'vue';

import {
  Alert,
  Checkbox,
  message,
  Modal,
  Tag,
} from 'ant-design-vue';

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
const confirmStoryboard = ref(false);

const state = computed(() =>
  media.shotState(props.canvasId, props.shotId),
);
const status = computed(() => state.value?.status);
const needStoryboardConfirm = computed(
  () => status.value?.storyboardConfirmed === false,
);
const canSubmit = computed(
  () =>
    Boolean(props.canvasId) &&
    !loading.value &&
    (!needStoryboardConfirm.value || confirmStoryboard.value),
);
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

async function submit() {
  if (!canSubmit.value || !props.canvasId) {
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await media.triggerGenerate(props.canvasId, props.shotId, props.type, {
      confirmStoryboard: needStoryboardConfirm.value ? true : undefined,
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

    <div v-if="needStoryboardConfirm" class="canvas-shot-media__confirm">
      <Checkbox v-model:checked="confirmStoryboard">
        同时确认本集分镜（storyboardConfirmed=false）
      </Checkbox>
      <div class="canvas-shot-media__hint">
        未勾选不会发送 confirmStoryboard=true。
      </div>
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

.canvas-shot-media__confirm {
  margin: 8px 0;
}

.canvas-shot-media__hint {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.canvas-shot-media__blockers {
  padding-left: 16px;
  margin: 0;
  font-size: 12px;
}
</style>
