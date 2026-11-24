<script lang="ts" setup name="CanvasNodeFrame">
import type { HandleConnectable } from '@vue-flow/core';

import type { CanvasFlowNodeData } from './store';

import { computed, ref, watch } from 'vue';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { Handle, Position } from '@vue-flow/core';
import { Input, message } from 'ant-design-vue';

import { formatApiError, parseApiError } from '../error';
import CanvasShotTakes from './CanvasShotTakes.vue';
import { useCanvasGraphStore } from './store';
import {
  canApproveKeyframe as canApproveShotKeyframe,
  isShotGenerating,
  otherBlockerReason,
  segmentModeBlocker,
  segmentVideoBlockReason,
  shotTakeId,
  shotVideoBlockReason,
  useCanvasShotMedia,
} from './useCanvasShotMedia';

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
const shotGenerating = computed(() => isShotGenerating(shotStatus.value));
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
const keyframeTakeSelected = computed(() =>
  Boolean(shotStatus.value?.keyframeTakes?.some((take) => take.isSelected)),
);
const keyframeApproved = computed(
  () => Boolean(shotMediaState.value?.approved || keyframeTakeSelected.value),
);
const canApproveKeyframe = computed(
  () =>
    canApproveShotKeyframe(shotStatus.value) && !keyframeApproved.value,
);
const segmentBlocker = computed(() => segmentModeBlocker(shotStatus.value));
const segmentMode = computed(() => Boolean(segmentBlocker.value));
const otherBlockReason = computed(() =>
  otherBlockerReason(shotStatus.value),
);
const videoBlockReason = computed(() =>
  segmentMode.value
    ? segmentVideoBlockReason(shotStatus.value)
    : shotVideoBlockReason(shotStatus.value) || otherBlockReason.value,
);
const segmentShotCount = computed(
  () => shotStatus.value?.segmentShotCount ?? 0,
);
const selectingTakeId = ref('');

function requestShotAction(
  type:
    | 'approve'
    | 'edit'
    | 'expand'
    | 'keyframe'
    | 'output-video'
    | 'segment-video'
    | 'video',
) {
  if (shotInfo.value) {
    store.requestShotAction(type, props.id, shotInfo.value.shotId);
  }
}

async function selectTake(
  take: { id?: number | string; takeId?: number | string },
  kind: 'keyframe' | 'segment-video',
) {
  const id = shotTakeId(take);
  if (!shotInfo.value || !id || !store.canvas?.id) {
    return;
  }
  selectingTakeId.value = String(id);
  try {
    await shotMedia.selectTake(
      store.canvas.id,
      shotInfo.value.shotId,
      id,
      kind,
    );
    message.success(
      kind === 'keyframe' ? '已通过并选用关键帧' : '已通过并选用视频',
    );
  } catch (error) {
    const info = parseApiError(error);
    message.error(
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '接口未就绪'
        : formatApiError(info),
    );
  } finally {
    selectingTakeId.value = '';
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

const selectedSegmentTake = computed(() =>
  shotStatus.value?.segmentTakes?.find((take) => take.isSelected),
);
const canOutputVideo = computed(() =>
  Boolean(shotStatus.value?.segmentVideoUrl && selectedSegmentTake.value),
);

const shotSceneInfo = computed(() =>
  shotInfo.value ? store.shotSceneInfo[shotInfo.value.shotId] : undefined,
);
const shotSceneName = computed(() => shotSceneInfo.value?.assetName || '待关联');
const shotSceneScript = computed(() => {
  const script = shotSceneInfo.value?.scriptName || shotInfo.value?.sceneName || '';
  return script && script !== shotSceneName.value ? script : '';
});
const shotCamera = computed(() => detailText('camera') || '待关联');
const shotTypeLabel = computed(() => detailText('shotType') || '待关联');
const shotStatusChip = computed(() => {
  const status = shotStatus.value;
  if (!status) {
    return { key: 'unknown', label: '状态未知' };
  }
  if (status.generationStatus === 5 || status.keyframeStatus === 5) {
    return { key: 'error', label: '失败' };
  }
  if (isShotGenerating(status)) {
    return { key: 'running', label: '生成中' };
  }
  if (
    status.keyframeUrl ||
    status.keyframeThumbnailUrl ||
    status.keyframeStatus === 2 ||
    status.segmentVideoUrl
  ) {
    return { key: 'ready', label: '关键帧就绪' };
  }
  return { key: 'pending', label: '待出图' };
});

function openSceneLibrary() {
  store.requestWorkspaceFocus('entity');
}

function openShotEditor() {
  requestShotAction('edit');
}

const videoDetails = computed<Record<string, unknown>>(
  () => props.data.details ?? {},
);
const videoUrl = computed(() => {
  const url = videoDetails.value.url || videoDetails.value.materialUrl;
  return typeof url === 'string' ? url : '';
});
const videoThumb = computed(() =>
  typeof videoDetails.value.thumbnailUrl === 'string'
    ? videoDetails.value.thumbnailUrl
    : '',
);
const videoSourceLabel = computed(() => {
  const sourceType = videoDetails.value.sourceType;
  if (sourceType === 'segment_video') {
    const segmentSeq = videoDetails.value.segmentSeq ?? '—';
    const shotSeq =
      videoDetails.value.shotSeq ?? videoDetails.value.shotId ?? '';
    return shotSeq
      ? `段${segmentSeq} · 分镜${shotSeq}`
      : `段${segmentSeq}`;
  }
  if (sourceType === 'upload') {
    return '上传素材';
  }
  return props.data.assetId ? '素材' : '未绑定段视频';
});
const canAddTimeline = computed(
  () =>
    videoDetails.value.sourceType === 'segment_video' &&
    Boolean(videoDetails.value.takeId) &&
    Boolean(videoDetails.value.materialId) &&
    Boolean(videoUrl.value),
);

function requestVideoAction(type: 'preview' | 'replace' | 'upload') {
  store.requestVideoAction(props.id, type);
}

async function addToTimeline() {
  const result = await store.addVideoToTimeline(props.id);
  if (!result) {
    return;
  }
  if (result.duplicate) {
    message.warning('该段已在剪辑条中，不重复加入');
    return;
  }
  if (result.reason) {
    message.warning(result.reason);
    return;
  }
  await store.flushSave();
  if (result.subtitleMissing) {
    message.warning('已加入剪辑条；字幕信息暂未返回，合成以分镜台词为准');
    return;
  }
  message.success('已加入剪辑条');
}

const timelineItems = computed(() => {
  const value = props.data.details?.items;
  return Array.isArray(value)
    ? (value as Array<Record<string, unknown>>)
    : [];
});
const timelineRows = computed(() =>
  timelineItems.value.map((item) => {
    const videoNode = store.nodes.find(
      (node) => node.id === String(item.videoNodeClientId ?? ''),
    );
    return {
      item,
      thumbnailUrl:
        typeof videoNode?.data.details?.thumbnailUrl === 'string'
          ? videoNode.data.details.thumbnailUrl
          : '',
    };
  }),
);
const timelineTotal = computed(() =>
  timelineItems.value.reduce(
    (total, item) => total + Number(item.durationSeconds ?? 0),
    0,
  ),
);
const timelineCompose = computed(() =>
  props.data.details?.compose &&
  typeof props.data.details.compose === 'object'
    ? (props.data.details.compose as Record<string, unknown>)
    : undefined,
);

function moveTimeline(index: number, delta: number) {
  store.moveTimelineItem(props.id, index, delta);
  void store.flushSave();
}

function removeTimeline(index: number) {
  store.removeTimelineItem(props.id, index);
  void store.flushSave();
}

function requestTimelineAction(action: 'compose' | 'open' | 'preview') {
  store.requestTimelineAction(props.id, action);
}

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
          <span>{{ shotSceneName }}</span>
          <span
            v-if="shotSceneScript"
            class="canvas-node__shot-script"
            :title="`脚本场景：${shotSceneScript}`"
          >
            脚本 · {{ shotSceneScript }}
          </span>
          <span v-if="shotGenerating" class="canvas-node__shot-running">
            生成中<span v-if="shotElapsed"> · {{ shotElapsed }}s</span>
          </span>
          <span v-if="keyframeApproved" class="canvas-node__shot-approved">
            关键帧已通过
          </span>
        </div>
        <div v-if="shotStatus?.segmentVideoUrl" class="canvas-node__shot-media">
          <video
            :poster="shotStatus.segmentVideoThumbnailUrl || undefined"
            :src="shotStatus.segmentVideoUrl"
            class="canvas-node__shot-video"
            controls
            preload="metadata"
          ></video>
          <div class="canvas-node__shot-hint">
            本段视频{{ shotStatus.segmentShotCount ? `（${shotStatus.segmentShotCount} 镜）` : '' }}
          </div>
        </div>
        <div v-else-if="shotStatus?.videoUrl" class="canvas-node__shot-media">
          <video
            :poster="shotStatus.videoThumbnailUrl || undefined"
            :src="shotStatus.videoUrl"
            class="canvas-node__shot-video"
            controls
            preload="metadata"
          ></video>
        </div>
        <div
          v-else-if="shotStatus?.segmentVideoThumbnailUrl"
          class="canvas-node__shot-media"
        >
          <img
            :src="shotStatus.segmentVideoThumbnailUrl"
            alt=""
            class="canvas-node__shot-image"
          />
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
        <div class="canvas-node__shot-tags">
          <span
            v-for="name in shotInfo.characters"
            :key="name"
          >{{ name }}</span>
          <button
            class="canvas-node__shot-chip"
            :title="shotSceneScript ? `脚本场景：${shotSceneScript}` : ''"
            type="button"
            @click.stop="openSceneLibrary"
          >
            场景 · {{ shotSceneName }}
          </button>
          <button class="canvas-node__shot-chip" type="button" @click.stop="openShotEditor">
            机位 · {{ shotCamera }}
          </button>
          <button class="canvas-node__shot-chip" type="button" @click.stop="openShotEditor">
            景别 · {{ shotTypeLabel }}
          </button>
          <span
            class="canvas-node__shot-chip"
            :class="`is-${shotStatusChip.key}`"
          >
            {{ shotStatusChip.label }}
          </span>
        </div>
        <CanvasShotTakes
          :selecting-take-id="selectingTakeId"
          :selected-url="shotStatus?.keyframeUrl || shotStatus?.keyframeThumbnailUrl"
          :takes="shotStatus?.keyframeTakes"
          kind="keyframe"
          @select="selectTake($event, 'keyframe')"
        />
        <CanvasShotTakes
          :selecting-take-id="selectingTakeId"
          :selected-url="shotStatus?.segmentVideoUrl || shotStatus?.segmentVideoThumbnailUrl"
          :takes="shotStatus?.segmentTakes"
          kind="segment-video"
          @select="selectTake($event, 'segment-video')"
        />
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
            :title="videoBlockReason || (segmentMode ? '生成本段视频' : '生成真实视频')"
            type="button"
            @click.stop="requestShotAction(segmentMode ? 'segment-video' : 'video')"
          >
            {{ segmentMode ? '生成本段' : '生成视频' }}
          </button>
          <button
            v-if="canApproveKeyframe"
            type="button"
            @click.stop="requestShotAction('approve')"
          >
            审批关键帧
          </button>
          <button
            v-if="canOutputVideo"
            type="button"
            @click.stop="requestShotAction('output-video')"
          >
            输出为视频节点
          </button>
          <button type="button" @click.stop="requestShotAction('edit')">
            编辑
          </button>
          <button type="button" @click.stop="requestShotAction('expand')">
            展开
          </button>
        </div>
        <div v-if="segmentBlocker" class="canvas-node__shot-hint">
          {{ segmentBlocker.message }}
          <template v-if="segmentShotCount">
            （本段 {{ segmentShotCount }} 镜）
          </template>
        </div>
        <div v-if="videoBlockReason" class="canvas-node__shot-hint">
          {{ videoBlockReason }}
        </div>
        <div v-if="shotMediaError" class="canvas-node__shot-error">
          {{ shotMediaError }}
        </div>
      </div>
      <div v-else-if="data.kind === 'timeline'" class="canvas-node__timeline">
        <div class="canvas-node__shot-meta">
          <span>剪辑条 {{ timelineItems.length }} 段</span>
          <span>总时长 {{ Math.round(timelineTotal) }}s</span>
          <span v-if="timelineCompose?.status !== undefined">
            合成 {{ timelineCompose.status }}
          </span>
        </div>
        <div v-if="timelineRows.length" class="canvas-node__timeline-list">
          <div
            v-for="(row, index) in timelineRows"
            :key="String(row.item.videoNodeClientId)"
            class="canvas-node__timeline-item"
          >
            <img
              v-if="row.thumbnailUrl"
              :src="row.thumbnailUrl"
              alt=""
              class="canvas-node__timeline-thumb"
            />
            <div v-else class="canvas-node__timeline-placeholder">无图</div>
            <span class="canvas-node__timeline-seq">
              段{{ row.item.segmentSeq ?? '—' }} ·
              {{ row.item.durationSeconds ?? '—' }}s
            </span>
            <button
              :disabled="index === 0"
              type="button"
              title="上移"
              @click.stop="moveTimeline(index, -1)"
            >
              ↑
            </button>
            <button
              :disabled="index === timelineItems.length - 1"
              type="button"
              title="下移"
              @click.stop="moveTimeline(index, 1)"
            >
              ↓
            </button>
            <button type="button" title="删除" @click.stop="removeTimeline(index)">
              ×
            </button>
          </div>
        </div>
        <div v-else class="canvas-node__placeholder">
          剪辑条为空：从视频节点加入段视频
        </div>
        <div class="canvas-node__shot-actions">
          <button type="button" @click.stop="requestTimelineAction('preview')">
            连续预览
          </button>
          <button type="button" @click.stop="requestTimelineAction('compose')">
            合成成片
          </button>
          <button type="button" @click.stop="requestTimelineAction('open')">
            展开
          </button>
        </div>
        <a
          v-if="typeof timelineCompose?.finalUrl === 'string' && timelineCompose.finalUrl"
          :href="timelineCompose.finalUrl"
          target="_blank"
          rel="noopener"
          class="canvas-node__shot-hint"
        >
          查看成片
        </a>
      </div>
      <div v-else-if="data.kind === 'video'" class="canvas-node__video">
        <video
          v-if="videoUrl"
          :poster="videoThumb || undefined"
          :src="videoUrl"
          class="canvas-node__video-player"
          controls
          preload="metadata"
        ></video>
        <div v-else class="canvas-node__placeholder">未绑定真实段视频</div>
        <div class="canvas-node__shot-meta">
          <span>{{ videoSourceLabel }}</span>
          <span v-if="videoDetails.durationSeconds">
            {{ videoDetails.durationSeconds }}s
          </span>
        </div>
        <div class="canvas-node__shot-actions">
          <button type="button" @click.stop="requestVideoAction('preview')">
            预览
          </button>
          <button type="button" @click.stop="requestVideoAction('replace')">
            替换素材
          </button>
          <button type="button" @click.stop="requestVideoAction('upload')">
            上传
          </button>
          <button
            :disabled="!canAddTimeline"
            :title="canAddTimeline ? '加入剪辑条' : '仅已绑定的段视频可加入剪辑条'"
            type="button"
            @click.stop="addToTimeline"
          >
            加入剪辑条
          </button>
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

  &__shot-approved {
    color: hsl(var(--success));
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

  &__timeline,
  &__video {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    min-height: 0;
  }

  &__timeline-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  &__timeline-item {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 2px 0;

    button {
      flex: none;
      padding: 0 4px;
      color: hsl(var(--muted-foreground));
      cursor: pointer;
      background: transparent;
      border: 0;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
    }
  }

  &__timeline-thumb,
  &__timeline-placeholder {
    flex: none;
    width: 44px;
    height: 28px;
    object-fit: cover;
    border-radius: 4px;
  }

  &__timeline-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
  }

  &__timeline-seq {
    flex: 1;
    font-size: 11px;
    color: hsl(var(--foreground));
  }

  &__video-player {
    flex: 1;
    width: 100%;
    min-height: 0;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }

  &__shot-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__shot-script {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
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

    > span,
    .canvas-node__shot-chip {
      padding: 1px 6px;
      font-size: 11px;
      color: hsl(var(--muted-foreground));
      background: hsl(var(--accent));
      border: 0;
      border-radius: 999px;
    }
  }

  &__shot-chip {
    cursor: pointer;

    &.is-ready {
      color: hsl(var(--success));
    }

    &.is-running {
      color: hsl(var(--primary));
    }

    &.is-error {
      color: hsl(var(--destructive));
    }

    &.is-unknown,
    &.is-pending {
      color: hsl(var(--muted-foreground));
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
