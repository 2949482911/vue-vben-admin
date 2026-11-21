<script lang="ts" setup name="CanvasShotDrawer">
import type { CanvasFlowNode } from './store';

import type {
  StoryboardPromptPreviewResult,
} from '#/api/models/ai_asset_storyboard';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  Alert,
  Button,
  Drawer,
  Image,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
} from 'ant-design-vue';

import { aiAssetStoryboardApi } from '#/api/core/ai_asset_storyboard';

import { formatApiError, parseApiError } from '../error';
import { useCanvasGraphStore } from './store';
import { useCanvasShotMedia } from './useCanvasShotMedia';

const props = defineProps<{
  canvasId?: string;
  mode: 'edit' | 'expand';
  node: CanvasFlowNode;
  shotId: string;
}>();

const emit = defineEmits<{ close: [] }>();

const DIRECTION_KEYS = [
  'lens',
  'composition',
  'lighting',
  'mood',
  'blocking',
  'continuity',
] as const;

type DirectionKey = (typeof DIRECTION_KEYS)[number];

const store = useCanvasGraphStore();
const media = useCanvasShotMedia();
const details = computed<Record<string, unknown>>(
  () => props.node.data.details ?? {},
);
const state = computed(() => media.shotState(props.canvasId, props.shotId));
const status = computed(() => state.value?.status);
const saving = ref(false);
const error = ref('');
const previews = reactive<Record<'image' | 'video', StoryboardPromptPreviewResult | undefined>>({
  image: undefined,
  video: undefined,
});
const previewLoading = ref(false);
const previewError = ref('');

function textOf(key: string) {
  const value = details.value[key];
  return typeof value === 'string' ? value : '';
}

function numberOf(key: string) {
  const value = details.value[key];
  return typeof value === 'number' ? value : undefined;
}

function directionSource() {
  const value = details.value.direction;
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

const direction = reactive<Record<DirectionKey, string>>(
  Object.fromEntries(
    DIRECTION_KEYS.map((key) => {
      const value = directionSource()[key];
      return [key, typeof value === 'string' ? value : ''];
    }),
  ) as Record<DirectionKey, string>,
);

const form = reactive({
  camera: textOf('camera'),
  characters: Array.isArray(details.value.characters)
    ? details.value.characters.filter(
        (item): item is string => typeof item === 'string',
      )
    : [],
  description: textOf('description'),
  dialogue: textOf('dialogue'),
  imagePrompt: textOf('imagePrompt'),
  sceneName: textOf('sceneName'),
  sceneSeq: numberOf('sceneSeq'),
  shotType: textOf('shotType'),
  videoPrompt: textOf('videoPrompt'),
});

const canSave = computed(
  () => Boolean(props.canvasId) && !saving.value,
);

function blockerTexts() {
  return status.value?.blockers ?? [];
}

async function loadPromptPreviews() {
  previewLoading.value = true;
  previewError.value = '';
  try {
    const [image, video] = await Promise.all([
      aiAssetStoryboardApi.previewStoryboardShotPrompt({
        shotId: props.shotId,
        type: 'image',
      }),
      aiAssetStoryboardApi.previewStoryboardShotPrompt({
        shotId: props.shotId,
        type: 'video',
      }),
    ]);
    previews.image = image;
    previews.video = video;
  } catch (err) {
    const info = parseApiError(err);
    previewError.value =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '提示词预览接口未就绪'
        : formatApiError(info);
  } finally {
    previewLoading.value = false;
  }
}

async function save() {
  if (!canSave.value || !props.canvasId) {
    return;
  }
  saving.value = true;
  error.value = '';
  try {
    const payload = {
      camera: form.camera,
      characters: form.characters,
      description: form.description,
      dialogue: form.dialogue,
      direction: Object.fromEntries(
        DIRECTION_KEYS.map((key) => [key, direction[key]]).filter(
          ([, value]) => Boolean(value),
        ),
      ),
      imagePrompt: form.imagePrompt,
      sceneName: form.sceneName,
      sceneSeq: form.sceneSeq,
      shotType: form.shotType,
      videoPrompt: form.videoPrompt,
    };
    const latest = await media.saveShot(
      props.canvasId,
      props.shotId,
      payload,
    );
    media.setStatus(props.canvasId, props.shotId, latest);
    store.updateNodeData(props.node.id, {
      body: [form.description, form.dialogue]
        .filter((item) => item.trim())
        .join(' ')
        .slice(0, 240),
      details: {
        ...details.value,
        ...payload,
        direction: payload.direction,
      },
    });
    const saved = await store.flushSave();
    if (!saved) {
      error.value = store.conflict
        ? '画布版本冲突：请刷新后重试'
        : store.error || '画布保存失败，请重试';
      return;
    }
    await media.refresh(props.canvasId, props.shotId);
    message.success('分镜已保存');
    emit('close');
  } catch (err) {
    const info = parseApiError(err);
    error.value =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '保存接口未就绪'
        : formatApiError(info);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  media.ensureStatus(props.canvasId, props.shotId);
  void loadPromptPreviews();
});
</script>

<template>
  <Drawer
    :open="true"
    :title="mode === 'edit' ? '编辑分镜' : '分镜详情'"
    width="560px"
    @close="emit('close')"
  >
    <div class="canvas-shot-drawer">
      <div class="canvas-shot-drawer__head">
        <b>{{ node.data.label }}</b>
        <Tag :bordered="false">#{{ shotId }}</Tag>
        <Tag :bordered="false">
          分镜状态 {{ status?.generationStatus ?? '—' }}
        </Tag>
        <Tag :bordered="false">
          关键帧 {{ status?.keyframeStatus ?? '—' }}
        </Tag>
      </div>

      <Alert
        v-if="status?.blockers?.length"
        message="当前存在阻断项"
        show-icon
        type="error"
      >
        <template #description>
          <ul class="canvas-shot-drawer__blockers">
            <li v-for="(blocker, index) in blockerTexts()" :key="index">
              {{ blocker.message }}
              <template v-if="blocker.action">（{{ blocker.action }}）</template>
            </li>
          </ul>
        </template>
      </Alert>

      <div v-if="status?.keyframeThumbnailUrl || status?.keyframeUrl" class="canvas-shot-drawer__media">
        <Image
          :src="status.keyframeThumbnailUrl || status.keyframeUrl || ''"
          :preview="{ src: status.keyframeUrl || status.keyframeThumbnailUrl || undefined }"
        />
      </div>
      <video
        v-if="status?.videoUrl"
        :poster="status.videoThumbnailUrl || undefined"
        :src="status.videoUrl"
        class="canvas-shot-drawer__video"
        controls
        preload="metadata"
      ></video>

      <template v-if="mode === 'edit'">
        <label class="canvas-shot-drawer__field">
          <span>画面描述</span>
          <Input.TextArea v-model:value="form.description" :rows="2" />
        </label>
        <label class="canvas-shot-drawer__field">
          <span>台词</span>
          <Input.TextArea v-model:value="form.dialogue" :rows="2" />
        </label>
        <label class="canvas-shot-drawer__field">
          <span>角色</span>
          <Select
            v-model:value="form.characters"
            mode="tags"
            placeholder="角色名"
          />
        </label>
        <div class="canvas-shot-drawer__row">
          <label class="canvas-shot-drawer__field">
            <span>场景</span>
            <Input v-model:value="form.sceneName" placeholder="场景名" />
          </label>
          <label class="canvas-shot-drawer__field">
            <span>场次</span>
            <InputNumber v-model:value="form.sceneSeq" :min="1" :precision="0" />
          </label>
        </div>
        <div class="canvas-shot-drawer__row">
          <label class="canvas-shot-drawer__field">
            <span>机位</span>
            <Input v-model:value="form.camera" />
          </label>
          <label class="canvas-shot-drawer__field">
            <span>景别</span>
            <Input v-model:value="form.shotType" />
          </label>
        </div>
        <div class="canvas-shot-drawer__grid">
          <label
            v-for="key in DIRECTION_KEYS"
            :key="key"
            class="canvas-shot-drawer__field"
          >
            <span>{{ key }}</span>
            <Input v-model:value="direction[key]" />
          </label>
        </div>
        <label class="canvas-shot-drawer__field">
          <span>出图提示词</span>
          <Input.TextArea v-model:value="form.imagePrompt" :rows="3" />
        </label>
        <label class="canvas-shot-drawer__field">
          <span>视频提示词</span>
          <Input.TextArea v-model:value="form.videoPrompt" :rows="3" />
        </label>
      </template>

      <template v-else>
        <div class="canvas-shot-drawer__readonly">
          <div><span>画面描述</span><b>{{ form.description || '—' }}</b></div>
          <div><span>台词</span><b>{{ form.dialogue || '—' }}</b></div>
          <div><span>角色</span><b>{{ form.characters.join('、') || '—' }}</b></div>
          <div><span>场景</span><b>{{ form.sceneName || '—' }}</b></div>
          <div><span>场次</span><b>{{ form.sceneSeq ?? '—' }}</b></div>
          <div><span>机位 / 景别</span><b>{{ [form.camera, form.shotType].filter(Boolean).join(' / ') || '—' }}</b></div>
          <div
            v-for="key in DIRECTION_KEYS"
            :key="`detail-${key}`"
          >
            <span>{{ key }}</span><b>{{ direction[key] || '—' }}</b>
          </div>
          <div><span>角色实体</span><b>{{ (details.characterIds as Array<number | string> | undefined)?.join('、') || '—' }}</b></div>
          <div><span>场景实体</span><b>{{ details.sceneId ?? '—' }}</b></div>
        </div>
      </template>

      <div class="canvas-shot-drawer__preview">
        <div class="canvas-shot-drawer__preview-title">
          实际生成提示词（只读）
        </div>
        <div v-if="previewLoading" class="canvas-shot-drawer__hint">
          提示词加载中…
        </div>
        <Alert
          v-else-if="previewError"
          :message="previewError"
          show-icon
          type="info"
        />
        <template v-else>
          <div class="canvas-shot-drawer__preview-block">
            <span>出图</span>
            <pre>{{ previews.image?.prompt || '—' }}</pre>
          </div>
          <div class="canvas-shot-drawer__preview-block">
            <span>视频</span>
            <pre>{{ previews.video?.prompt || '—' }}</pre>
          </div>
        </template>
      </div>

      <Alert v-if="error" :message="error" show-icon type="error" />

      <div v-if="mode === 'edit'" class="canvas-shot-drawer__actions">
        <Button @click="emit('close')">取消</Button>
        <Button
          :disabled="!canSave"
          :loading="saving"
          type="primary"
          @click="save"
        >
          保存分镜
        </Button>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.canvas-shot-drawer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  &__blockers {
    padding-left: 16px;
    margin: 0;
  }

  &__media {
    max-height: 180px;
    overflow: hidden;
    border-radius: 8px;

    :deep(img) {
      width: 100%;
      max-height: 180px;
      object-fit: cover;
    }
  }

  &__video {
    width: 100%;
    max-height: 200px;
    border-radius: 8px;
  }

  &__field {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    color: hsl(var(--muted-foreground));
  }

  &__row {
    display: flex;
    gap: 10px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  &__readonly {
    display: flex;
    flex-direction: column;
    gap: 4px;

    div {
      display: flex;
      gap: 8px;
    }

    span {
      flex: none;
      width: 70px;
      color: hsl(var(--muted-foreground));
    }

    b {
      font-weight: 500;
      color: hsl(var(--foreground));
    }
  }

  &__preview {
    padding: 8px;
    background: hsl(var(--accent));
    border-radius: 8px;
  }

  &__preview-title {
    margin-bottom: 6px;
    font-weight: 600;
  }

  &__preview-block {
    margin-bottom: 6px;

    span {
      color: hsl(var(--muted-foreground));
    }

    pre {
      margin: 2px 0 0;
      font-size: 11px;
      line-height: 1.5;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }

  &__hint {
    color: hsl(var(--muted-foreground));
  }

  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
