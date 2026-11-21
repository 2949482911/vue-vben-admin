<script lang="ts" setup name="CanvasNodeFrame">
import type { HandleConnectable } from '@vue-flow/core';

import type { CanvasFlowNodeData } from './store';

import { computed, ref, watch } from 'vue';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { Handle, Position } from '@vue-flow/core';
import { Input } from 'ant-design-vue';

import { formatApiError } from '../error';
import { useCanvasGraphStore } from './store';
import { useCanvasShotMedia } from './useCanvasShotMedia';

const props = defineProps<{
  connectable: HandleConnectable;
  data: CanvasFlowNodeData;
  id: string;
  selected?: boolean;
}>();

const store = useCanvasGraphStore();
const blueprint = computed(() => store.blueprintOf(props.data.kind));
const editing = ref(false);
const labelDraft = ref(props.data.label);
const bodyDraft = ref(props.data.body ?? '');

watch(
  () => props.data.label,
  (value) => {
    labelDraft.value = value;
  },
);
watch(
  () => props.data.body,
  (value) => {
    bodyDraft.value = value ?? '';
  },
);

const kindLabel = computed(() => blueprint.value?.label ?? props.data.kind);
const isReserved = computed(() =>
  ['codeVideo', 'director3d', 'scene3d', 'timeline'].includes(props.data.kind),
);

function detailText(key: string) {
  const value = props.data.details?.[key];
  return typeof value === 'string' ? value : '';
}

const previewUrl = computed(() => {
  if (props.data.kind === 'image') {
    return detailText('thumbnailUrl') || detailText('materialUrl');
  }
  if (props.data.kind === 'entity' || props.data.kind === 'character') {
    return detailText('refUrl');
  }
  return '';
});

const shotInfo = computed(() => {
  if (props.data.kind !== 'shot') {
    return undefined;
  }
  const details = props.data.details ?? {};
  const shotId = details.shotId;
  if (shotId === undefined || shotId === null || shotId === '') {
    return undefined;
  }
  return {
    characters: Array.isArray(details.characters)
      ? details.characters.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    duration:
      typeof details.durationSeconds === 'number'
        ? details.durationSeconds
        : undefined,
    sceneName:
      typeof details.sceneName === 'string' ? details.sceneName : '',
    shotId: String(shotId),
  };
});

const shotSummary = computed(
  () =>
    props.data.body ||
    detailText('description') ||
    detailText('dialogue') ||
    detailText('imagePrompt'),
);

const shotMedia = useCanvasShotMedia();
const shotMediaState = computed(() =>
  shotInfo.value
    ? shotMedia.shotState(store.canvas?.id, shotInfo.value.shotId)
    : undefined,
);
const shotStatus = computed(() => shotMediaState.value?.status);
const shotGenerating = computed(
  () =>
    shotStatus.value?.generationStatus === 1 ||
    shotStatus.value?.keyframeStatus === 1,
);
const shotElapsed = computed(() =>
  shotInfo.value
    ? shotMedia.elapsedSeconds(store.canvas?.id, shotInfo.value.shotId)
    : 0,
);
const shotMediaError = computed(() =>
  shotMediaState.value?.error
    ? formatApiError(shotMediaState.value.error)
    : '',
);
const keyframeReady = computed(() => {
  const status = shotStatus.value;
  return Boolean(
    status &&
      (status.keyframeUrl ||
        status.keyframeThumbnailUrl ||
        status.keyframeStatus === 2),
  );
});
const canApproveKeyframe = computed(
  () =>
    keyframeReady.value &&
    !shotMediaState.value?.approved &&
    shotStatus.value?.keyframeStatus !== 1,
);
const videoBlockReason = computed(() => {
  const status = shotStatus.value;
  const blocker = status?.blockers?.find((item) =>
    /keyframe.*approv|approv.*keyframe/i.test(
      `${item.code ?? ''}${item.action ?? ''}`,
    ),
  );
  if (blocker) {
    return blocker.message;
  }
  if (status?.keyframeStatus === 1) {
    return '关键帧生成中';
  }
  if (!keyframeReady.value) {
    return '请先生成并审批关键帧';
  }
  return '';
});

function requestShotAction(
  type: 'approve' | 'edit' | 'expand' | 'keyframe' | 'video',
) {
  if (shotInfo.value) {
    store.requestShotAction(type, props.id, shotInfo.value.shotId);
  }
}

watch(
  () => shotInfo.value?.shotId,
  () => {
    if (shotInfo.value) {
      shotMedia.ensureStatus(store.canvas?.id, shotInfo.value.shotId);
    }
  },
  { immediate: true },
);

const canSplit = computed(
  () => Boolean(store.episodeId) && Boolean(props.data.body?.trim()),
);

const splitHint = computed(() => {
  if (!store.episodeId) {
    return '先选择剧集';
  }
  if (!props.data.body?.trim()) {
    return '先填写文本内容';
  }
  return '按文本拆成真实分镜';
});

function requestSplit() {
  store.requestSplit(props.id);
}

function beginEdit() {
  labelDraft.value = props.data.label;
  editing.value = true;
}

function commitLabel() {
  const next = labelDraft.value.trim();
  if (next) {
    store.updateNodeData(props.id, { label: next });
  }
  editing.value = false;
}

function commitBody() {
  store.updateNodeData(props.id, { body: bodyDraft.value });
}

function remove() {
  store.removeNode(props.id);
}

function portStyle(index: number, total: number) {
  return { top: `${((index + 1) / (total + 1)) * 100}%` };
}

function bodyText() {
  if (props.data.body) {
    return props.data.body;
  }
  const materialName = detailText('materialName');
  if (props.data.kind === 'shot') {
    return '分镜节点：等待绑定分镜数据';
  }
  if (props.data.kind === 'entity' || props.data.kind === 'character') {
    const entityName = detailText('entityName');
    if (entityName) {
      const entityType = detailText('entityType');
      const labels: Record<string, string> = {
        character: '角色',
        element: '物品',
        scene: '场景',
      };
      return [
        entityName,
        labels[entityType] ?? entityType,
        props.data.details?.hasImage === true ? '有参考图' : '',
      ]
        .filter(Boolean)
        .join(' · ');
    }
    return '实体节点：等待绑定项目实体';
  }
  if (
    props.data.kind === 'image' ||
    props.data.kind === 'video' ||
    props.data.kind === 'audio'
  ) {
    if (materialName) {
      return `素材：${materialName}`;
    }
    return props.data.assetId
      ? `已绑定素材 #${props.data.assetId}`
      : '未绑定素材';
  }
  if (props.data.kind === 'scene3d') {
    return '3D 导演台 / 白模：P9/P10 接入';
  }
  if (props.data.kind === 'director3d') {
    return 'AI 导演台：P9 接入';
  }
  if (props.data.kind === 'codeVideo') {
    return 'AI 动画台：待接入';
  }
  if (props.data.kind === 'timeline') {
    return '剪辑条：P9/P10 接入';
  }
  return '空节点';
}
</script>

<template>
  <article
    class="canvas-node"
    :class="[`canvas-node--${data.kind}`, { 'is-selected': selected, 'is-reserved': isReserved }]"
  >
    <Handle
      v-for="(port, index) in blueprint?.inputs ?? []"
      :id="port.id"
      :key="`in-${port.id}`"
      :connectable="connectable"
      :position="Position.Left"
      :style="portStyle(index, blueprint?.inputs.length ?? 1)"
      :title="`${port.label}（${port.id}）`"
      class="canvas-node__handle canvas-node__handle--in"
      type="target"
    />
    <Handle
      v-for="(port, index) in blueprint?.outputs ?? []"
      :id="port.id"
      :key="`out-${port.id}`"
      :connectable="connectable"
      :position="Position.Right"
      :style="portStyle(index, blueprint?.outputs.length ?? 1)"
      :title="`${port.label}（${port.id}）`"
      class="canvas-node__handle canvas-node__handle--out"
      type="source"
    />

    <header class="canvas-node__header">
      <span class="canvas-node__kind">{{ kindLabel }}</span>
      <template v-if="editing">
        <Input
          v-model:value="labelDraft"
          size="small"
          class="canvas-node__label-input nodrag nopan"
          @blur="commitLabel"
          @press-enter="commitLabel"
        />
      </template>
      <template v-else>
        <span class="canvas-node__label" @dblclick="beginEdit">{{ data.label }}</span>
        <button
          class="canvas-node__icon"
          type="button"
          title="重命名"
          @click="beginEdit"
        >
          <EditOutlined />
        </button>
      </template>
      <span class="canvas-node__spacer"></span>
      <button
        class="canvas-node__icon canvas-node__icon--danger"
        type="button"
        title="删除节点"
        @click="remove"
      >
        <DeleteOutlined />
      </button>
    </header>

    <div class="canvas-node__body">
      <textarea
        v-if="data.kind === 'text' || data.kind === 'prompt' || data.kind === 'storyboard' || data.kind === 'workflow'"
        v-model="bodyDraft"
        class="canvas-node__textarea nodrag"
        placeholder="输入文本 / 脚本 / 提示词"
        @blur="commitBody"
      ></textarea>
      <div v-else-if="shotInfo" class="canvas-node__shot">
        <div class="canvas-node__shot-meta">
          <span>分镜 #{{ shotInfo.shotId }}</span>
          <span v-if="shotInfo.duration !== undefined">
            {{ shotInfo.duration }}s
          </span>
          <span v-if="shotInfo.sceneName">{{ shotInfo.sceneName }}</span>
          <span v-if="shotGenerating" class="canvas-node__shot-running">
            生成中<span v-if="shotElapsed"> · {{ shotElapsed }}s</span>
          </span>
        </div>
        <div v-if="shotStatus?.videoUrl" class="canvas-node__shot-media">
          <video
            :poster="shotStatus.videoThumbnailUrl || undefined"
            :src="shotStatus.videoUrl"
            class="canvas-node__shot-video"
            controls
            preload="metadata"
          ></video>
        </div>
        <div
          v-else-if="shotStatus?.keyframeThumbnailUrl || shotStatus?.keyframeUrl"
          class="canvas-node__shot-media"
        >
          <img
            :src="shotStatus.keyframeThumbnailUrl || shotStatus.keyframeUrl || ''"
            alt=""
            class="canvas-node__shot-image"
          />
        </div>
        <div class="canvas-node__shot-body">
          {{ shotSummary || '已绑定分镜，暂无摘要' }}
        </div>
        <div v-if="shotInfo.characters.length" class="canvas-node__shot-tags">
          <span v-for="name in shotInfo.characters" :key="name">{{ name }}</span>
        </div>
        <div class="canvas-node__shot-actions">
          <button
            :disabled="shotGenerating"
            type="button"
            @click.stop="requestShotAction('keyframe')"
          >
            重新出图
          </button>
          <button
            :disabled="Boolean(videoBlockReason) || shotGenerating"
            :title="videoBlockReason || '生成真实视频'"
            type="button"
            @click.stop="requestShotAction('video')"
          >
            生成视频
          </button>
          <button
            v-if="canApproveKeyframe"
            type="button"
            @click.stop="requestShotAction('approve')"
          >
            审批关键帧
          </button>
          <button type="button" @click.stop="requestShotAction('edit')">
            编辑
          </button>
          <button type="button" @click.stop="requestShotAction('expand')">
            展开
          </button>
        </div>
        <div v-if="videoBlockReason" class="canvas-node__shot-hint">
          {{ videoBlockReason }}
        </div>
        <div v-if="shotMediaError" class="canvas-node__shot-error">
          {{ shotMediaError }}
        </div>
      </div>
      <div v-else-if="!previewUrl" class="canvas-node__placeholder">
        {{ bodyText() }}
      </div>
      <div v-else class="canvas-node__media">
        <img :src="previewUrl" alt="" class="canvas-node__preview" />
        <div class="canvas-node__media-caption">{{ bodyText() }}</div>
      </div>
    </div>

    <footer class="canvas-node__footer">
      <span>{{ data.nodeStatus || 'ready' }}</span>
      <span v-if="data.groupClientId">分组</span>
      <span class="canvas-node__spacer"></span>
      <button
        v-if="data.kind === 'text'"
        class="canvas-node__split"
        :disabled="!canSplit"
        :title="splitHint"
        type="button"
        @click.stop="requestSplit"
      >
        拆成分镜
      </button>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.canvas-node {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 6%);

  &.is-selected {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 18%), 0 8px 24px hsl(var(--foreground) / 8%);
  }

  &.is-reserved {
    background: hsl(var(--accent));
  }

  &__header {
    display: flex;
    flex: none;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__kind {
    flex: none;
    padding: 2px 6px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 999px;
  }

  &__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__label-input {
    width: 150px;
  }

  &__spacer {
    flex: 1;
  }

  &__icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 5px;

    &:hover {
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }
  }

  &__icon--danger:hover {
    color: hsl(var(--destructive));
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 10px;
  }

  &__textarea {
    width: 100%;
    height: 100%;
    padding: 0;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--foreground));
    resize: none;
    outline: 0;
    background: transparent;
    border: 0;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    text-align: center;
    background: hsl(var(--accent));
    border-radius: 8px;
  }

  &__media {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    min-height: 0;
  }

  &__preview {
    flex: 1;
    width: 100%;
    min-height: 0;
    object-fit: cover;
    border-radius: 8px;
  }

  &__media-caption {
    flex: none;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }

  &__footer {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    padding: 5px 10px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    border-top: 1px solid hsl(var(--border));
  }

  &__split {
    flex: none;
    padding: 0;
    font-size: 11px;
    color: hsl(var(--primary));
    cursor: pointer;
    background: transparent;
    border: 0;

    &:disabled {
      color: hsl(var(--muted-foreground));
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      text-decoration: underline;
    }
  }

  &__shot {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    min-height: 0;
  }

  &__shot-media {
    flex: none;
    width: 100%;
    max-height: 150px;
    overflow: hidden;
    border-radius: 8px;
  }

  &__shot-image,
  &__shot-video {
    display: block;
    width: 100%;
    max-height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }

  &__shot-running {
    color: hsl(var(--primary));
  }

  &__shot-actions {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    gap: 8px;

    button {
      padding: 0;
      font-size: 11px;
      color: hsl(var(--primary));
      cursor: pointer;
      background: transparent;
      border: 0;

      &:disabled {
        color: hsl(var(--muted-foreground));
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        text-decoration: underline;
      }
    }
  }

  &__shot-hint {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__shot-error {
    font-size: 11px;
    color: hsl(var(--destructive));
  }

  &__shot-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__shot-body {
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--foreground));
  }

  &__shot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    span {
      padding: 1px 6px;
      font-size: 11px;
      color: hsl(var(--muted-foreground));
      background: hsl(var(--accent));
      border-radius: 999px;
    }
  }

  &__handle {
    z-index: 2;
    width: 12px;
    height: 12px;
    background: hsl(var(--background));
    border: 2px solid hsl(var(--primary));
    border-radius: 50%;
  }

  &__handle--in {
    left: 0;
  }

  &__handle--out {
    right: 0;
  }
}
</style>
