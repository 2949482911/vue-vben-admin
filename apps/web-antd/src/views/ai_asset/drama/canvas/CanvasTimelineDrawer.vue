<script lang="ts" setup name="CanvasTimelineDrawer">
import type { CanvasFlowNode } from './store';

import type {
  CanvasTimelineComposeStatus,
  CanvasTimelineItem,
} from '#/api/models/ai_asset_canvas';

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';

import {
  CaretRightOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  UpOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue';
import { Alert, Button, Drawer, Empty, message, Modal, Tag } from 'ant-design-vue';

import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { formatApiError, parseApiError } from '../error';
import { useCanvasGraphStore } from './store';

const props = defineProps<{
  canvasId?: string;
  episodeId?: number | string;
  initialAction?: 'compose' | 'preview';
  node: CanvasFlowNode;
}>();

const emit = defineEmits<{ close: [] }>();

const POLL_MS = 5000;
const store = useCanvasGraphStore();
const videoRef = ref<HTMLVideoElement>();
const previewIndex = ref(-1);
const playing = ref(false);
const composeLoading = ref(false);
const composeError = ref('');
const status = ref<CanvasTimelineComposeStatus>();
const now = ref(Date.now());
let pollTimer: ReturnType<typeof setInterval> | undefined;
let clockTimer: ReturnType<typeof setInterval> | undefined;

const details = computed<Record<string, unknown>>(
  () => props.node.data.details ?? {},
);
const items = computed<CanvasTimelineItem[]>(() =>
  Array.isArray(details.value.items)
    ? (details.value.items as CanvasTimelineItem[])
    : [],
);
const totalDuration = computed(() =>
  items.value.reduce(
    (total, item) => total + Number(item.durationSeconds ?? 0),
    0,
  ),
);
const rows = computed(() =>
  items.value.map((item) => {
    const videoNode = store.nodes.find(
      (node) => node.id === item.videoNodeClientId,
    );
    const videoDetails = videoNode?.data.details ?? {};
    return {
      item,
      thumbnailUrl:
        typeof videoDetails.thumbnailUrl === 'string'
          ? videoDetails.thumbnailUrl
          : '',
      url: typeof videoDetails.url === 'string' ? videoDetails.url : '',
    };
  }),
);
const currentUrl = computed(() => rows.value[previewIndex.value]?.url || '');
const storedCompose = computed(() => {
  const value = details.value.compose;
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
});
/** 只认当前时间轴自己的 taskId/planVersion，避免展示本集其他旧成片 */
const appliedStatus = computed(() => {
  const current = status.value;
  const local = storedCompose.value;
  if (!current || !local) {
    return undefined;
  }
  const sameTask =
    local.taskId !== undefined &&
    local.taskId !== null &&
    current.taskId !== undefined &&
    current.taskId !== null &&
    String(local.taskId) === String(current.taskId);
  const samePlan =
    local.planVersion !== undefined &&
    local.planVersion !== null &&
    current.planVersion !== undefined &&
    current.planVersion !== null &&
    String(local.planVersion) === String(current.planVersion);
  return sameTask || samePlan ? current : undefined;
});
const isComposing = computed(() => {
  const value = appliedStatus.value?.composeStatus ?? composeStatus.value;
  return value === 0 || value === 1;
});
const composeStatus = computed(() => {
  const value = details.value.compose;
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  return typeof record.status === 'number' ? record.status : undefined;
});
const finalUrl = computed(() => {
  const fromStatus = appliedStatus.value?.finalUrl;
  if (fromStatus) {
    return fromStatus;
  }
  const value = details.value.compose;
  return value && typeof value === 'object' &&
    typeof (value as Record<string, unknown>).finalUrl === 'string'
    ? String((value as Record<string, unknown>).finalUrl)
    : '';
});
const elapsed = computed(() => {
  const value = details.value.compose;
  if (!value || typeof value !== 'object') {
    return 0;
  }
  const startedAt = (value as Record<string, unknown>).startedAt;
  return typeof startedAt === 'number'
    ? Math.max(0, Math.floor((now.value - startedAt) / 1000))
    : 0;
});

function notReadyText(info: ReturnType<typeof parseApiError>) {
  return info.notReady || /static resource|接口未就绪/i.test(info.message)
    ? '接口未就绪'
    : formatApiError(info);
}

function ensureClock() {
  if (!clockTimer) {
    clockTimer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }
}

function stopClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = undefined;
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
  stopClock();
}

function startPolling() {
  if (pollTimer) {
    return;
  }
  ensureClock();
  pollTimer = setInterval(() => {
    void refreshStatus();
  }, POLL_MS);
}

function composeSnapshot(next: CanvasTimelineComposeStatus) {
  return {
    durationSeconds: next.durationSeconds,
    errorMsg: next.errorMsg,
    finalMaterialId: next.finalMaterialId,
    finalUrl: next.finalUrl,
    planVersion: next.planVersion,
    progress: next.progress,
    segmentCount: next.segmentCount,
    startedAt: (details.value.compose as Record<string, unknown> | undefined)
      ?.startedAt,
    status: next.composeStatus,
    taskId: next.taskId,
  };
}

async function refreshStatus() {
  if (!props.canvasId || !props.episodeId) {
    return;
  }
  try {
    const result = await aiAssetCanvasApi.fetchCanvasTimelineComposeStatus(
      props.canvasId,
      props.episodeId,
    );
    status.value = result;
    composeError.value = '';
    const local = storedCompose.value;
    const matchesCurrent =
      Boolean(local) &&
      ((local?.taskId !== undefined &&
        local?.taskId !== null &&
        String(local.taskId) === String(result.taskId ?? '')) ||
        (local?.planVersion !== undefined &&
          local?.planVersion !== null &&
          String(local.planVersion) === String(result.planVersion ?? '')));
    if (!matchesCurrent) {
      stopPolling();
      return;
    }
    store.setTimelineCompose(props.node.id, composeSnapshot(result));
    if (result.composeStatus === 0 || result.composeStatus === 1) {
      startPolling();
    } else {
      stopPolling();
      await store.flushSave();
    }
  } catch (err) {
    composeError.value = notReadyText(parseApiError(err));
    stopPolling();
  }
}

function compose() {
  const canvasId = props.canvasId;
  const episodeId = props.episodeId;
  if (!canvasId || !episodeId || !items.value.length) {
    return;
  }
  Modal.confirm({
    title: '合成成片？',
    content: [
      `将按当前顺序合成 ${items.value.length} 段视频，总时长 ${Math.round(totalDuration.value)} 秒。`,
      '仅执行 ffmpeg 合成计算，不调用任何生成模型；默认竖屏、烧录字幕、无 BGM。',
    ].join('\n'),
    okText: '合成成片',
    cancelText: '取消',
    onOk: async () => {
      composeLoading.value = true;
      composeError.value = '';
      try {
        const result = await aiAssetCanvasApi.composeCanvasTimeline(
          canvasId,
          {
            burnSubtitles: true,
            confirm: true,
            episodeId,
            resolution: '1080x1920',
            timelineNodeClientId: props.node.id,
          },
        );
        store.setTimelineCompose(props.node.id, {
          durationSeconds: result.durationSeconds,
          planVersion: result.planVersion,
          progress: 0,
          segmentCount: result.segmentCount,
          startedAt: Date.now(),
          status: result.composeStatus ?? 0,
          taskId: result.taskId,
        });
        await store.flushSave();
        startPolling();
        await refreshStatus();
        message.success('合成任务已提交');
      } catch (err) {
        composeError.value = notReadyText(parseApiError(err));
      } finally {
        composeLoading.value = false;
      }
    },
  });
}

function move(index: number, delta: number) {
  store.moveTimelineItem(props.node.id, index, delta);
  void store.flushSave();
}

function remove(index: number) {
  store.removeTimelineItem(props.node.id, index);
  if (previewIndex.value >= index) {
    previewIndex.value = -1;
  }
  void store.flushSave();
}

async function playIndex(index: number) {
  if (index < 0 || index >= rows.value.length || !rows.value[index]?.url) {
    playing.value = false;
    return;
  }
  previewIndex.value = index;
  playing.value = true;
  await nextTick();
  const video = videoRef.value;
  if (video) {
    video.currentTime = 0;
    await video.play().catch(() => {
      playing.value = false;
    });
  }
}

function startPreview() {
  void playIndex(0);
}

function togglePreview() {
  const video = videoRef.value;
  if (!video) {
    startPreview();
    return;
  }
  if (video.paused) {
    playing.value = true;
    void video.play();
  } else {
    playing.value = false;
    video.pause();
  }
}

function replay() {
  void playIndex(0);
}

function onEnded() {
  if (previewIndex.value + 1 < rows.value.length) {
    void playIndex(previewIndex.value + 1);
  } else {
    playing.value = false;
  }
}

function onVisibilityChange() {
  if (document.hidden) {
    stopPolling();
  } else if (isComposing.value) {
    void refreshStatus();
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange);
  void refreshStatus();
  if (props.initialAction === 'preview') {
    startPreview();
  } else if (props.initialAction === 'compose') {
    void nextTick(() => compose());
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  stopPolling();
});
</script>

<template>
  <Drawer
    :open="true"
    title="剪辑条"
    width="620px"
    @close="emit('close')"
  >
    <div class="canvas-timeline">
      <div class="canvas-timeline__head">
        <span>片段 {{ items.length }}</span>
        <Tag :bordered="false">总时长 {{ Math.round(totalDuration) }}s</Tag>
        <span class="canvas-timeline__spacer"></span>
        <Button size="small" @click="refreshStatus">
          <template #icon><ReloadOutlined /></template>
          刷新状态
        </Button>
        <Button
          :disabled="!items.length"
          :loading="composeLoading"
          size="small"
          type="primary"
          @click="compose"
        >
          合成成片
        </Button>
      </div>

      <div v-if="!items.length">
        <Empty
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="剪辑条为空：从视频节点加入段视频"
        />
      </div>
      <div v-else class="canvas-timeline__list">
        <div
          v-for="(row, index) in rows"
          :key="row.item.videoNodeClientId"
          class="canvas-timeline__item"
          :class="{ 'is-play': previewIndex === index }"
        >
          <img
            v-if="row.thumbnailUrl"
            :src="row.thumbnailUrl"
            alt=""
            class="canvas-timeline__thumb"
          />
          <div v-else class="canvas-timeline__thumb is-empty">
            <VideoCameraOutlined />
          </div>
          <div class="canvas-timeline__main">
            <b>段{{ row.item.segmentSeq ?? '—' }}</b>
            <span>
              {{ row.item.durationSeconds ?? '—' }}s · {{ row.item.subtitleText || '无字幕' }}
            </span>
          </div>
          <Button
            :disabled="index === 0"
            size="small"
            type="text"
            title="上移"
            @click="move(index, -1)"
          >
            <template #icon><UpOutlined /></template>
          </Button>
          <Button
            :disabled="index === items.length - 1"
            size="small"
            type="text"
            title="下移"
            @click="move(index, 1)"
          >
            <template #icon><DownOutlined /></template>
          </Button>
          <Button size="small" type="text" title="播放此段" @click="playIndex(index)">
            <template #icon><CaretRightOutlined /></template>
          </Button>
          <Button danger size="small" type="text" title="删除" @click="remove(index)">
            <template #icon><DeleteOutlined /></template>
          </Button>
        </div>
      </div>

      <div class="canvas-timeline__preview">
        <div class="canvas-timeline__preview-head">
          <span>连续预览</span>
          <Button size="small" @click="togglePreview">
            <template #icon>
              <PauseCircleOutlined v-if="playing" />
              <CaretRightOutlined v-else />
            </template>
            {{ playing ? '暂停' : '播放' }}
          </Button>
          <Button size="small" @click="replay">重播</Button>
          <span class="canvas-timeline__muted">
            {{ previewIndex >= 0 ? `第 ${previewIndex + 1} 段` : '未开始' }}
          </span>
        </div>
        <video
          v-if="currentUrl"
          ref="videoRef"
          :src="currentUrl"
          class="canvas-timeline__player"
          controls
          preload="metadata"
          @ended="onEnded"
        ></video>
        <div v-else class="canvas-timeline__muted">
          点击片段或播放开始连续预览
        </div>
      </div>

      <div class="canvas-timeline__compose">
        <div class="canvas-timeline__preview-head">
          <span>合成状态</span>
          <Tag :bordered="false">
            {{ appliedStatus?.composeStatus ?? composeStatus ?? '—' }}
          </Tag>
          <span
            v-if="appliedStatus?.progress !== undefined"
            class="canvas-timeline__muted"
          >
            进度 {{ appliedStatus.progress }}%
          </span>
          <span v-if="isComposing && elapsed" class="canvas-timeline__muted">
            已等待 {{ elapsed }}s
          </span>
        </div>
        <Alert
          v-if="composeError || appliedStatus?.errorMsg"
          :message="composeError || appliedStatus?.errorMsg || ''"
          show-icon
          type="error"
        />
        <Alert
          v-if="appliedStatus?.blockers?.length"
          message="合成存在阻断项"
          show-icon
          type="error"
        >
          <template #description>
            <ul class="canvas-timeline__blockers">
              <li
                v-for="(blocker, index) in appliedStatus.blockers"
                :key="index"
              >
                {{ blocker.message }}
                <template v-if="blocker.action">（{{ blocker.action }}）</template>
              </li>
            </ul>
          </template>
        </Alert>
        <video
          v-if="finalUrl"
          :src="finalUrl"
          class="canvas-timeline__player"
          controls
          preload="metadata"
        ></video>
        <a v-if="finalUrl" :href="finalUrl" download target="_blank" rel="noopener">
          <DownloadOutlined /> 下载成片
        </a>
      </div>

      <Alert
        message="合成阶段只执行 ffmpeg 拼接与字幕烧录，不调用生成模型"
        show-icon
        type="info"
      />
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.canvas-timeline {
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

  &__spacer {
    flex: 1;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__item {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 4px;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;

    &.is-play {
      border-color: hsl(var(--primary));
    }
  }

  &__thumb {
    flex: none;
    width: 72px;
    height: 44px;
    object-fit: cover;
    border-radius: 6px;

    &.is-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: hsl(var(--muted-foreground));
      background: hsl(var(--accent));
    }
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      color: hsl(var(--muted-foreground));
      white-space: nowrap;
    }
  }

  &__preview,
  &__compose {
    padding: 8px;
    background: hsl(var(--accent));
    border-radius: 8px;
  }

  &__preview-head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }

  &__player {
    width: 100%;
    max-height: 320px;
    border-radius: 8px;
  }

  &__muted {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__blockers {
    padding-left: 16px;
    margin: 0;
  }
}
</style>
