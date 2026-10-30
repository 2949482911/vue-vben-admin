<script lang="ts" setup name="EpisodeComposeCard">
/**
 * 成片卡片：展示合成状态、比例、烧录字幕开关、需重合成提示与下载/导出。
 * 上游是分镜页，提交与轮询仍由 BookWorkbench 负责；
 * 本组件只处理展示与下载动作，下载统一走成片接口而不是裸 URL。
 */
import type {
  EpisodeComposeMissingShot,
  EpisodeComposeStatus,
} from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import {
  DownloadOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  message,
  Modal,
  Progress,
  Switch,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { downloadErrorText, downloadExportUrl } from '../download';
import {
  COMPOSE_ACTIVE_STATUSES,
  COMPOSE_STATUS,
  COMPOSE_STATUS_META,
} from '../status';

const props = defineProps<{
  aspectRatio?: string;
  burnSubtitles?: boolean;
  episodeId?: number | string;
  episodeSeq?: number;
  hasSegments?: boolean;
  missingSegmentSeqs?: number[];
  missingShotSeqs?: number[];
  missingShots?: EpisodeComposeMissingShot[];
  needsRecompose?: boolean;
  precheckMessage?: string;
  ready?: boolean;
  status?: EpisodeComposeStatus;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  needVideo: [];
  submit: [];
  'update:burnSubtitles': [value: boolean];
}>();

const gateOpen = ref(false);
const missingOpen = ref(false);
const previewOpen = ref(false);
const downloading = ref(false);
const exporting = ref(false);

const statusCode = computed(() => Number(props.status?.status ?? -1));
const state = computed(
  () =>
    COMPOSE_STATUS_META[statusCode.value] ?? {
      color: 'default',
      label: '未生成',
    },
);
const progress = computed(() => {
  const raw = Number(props.status?.progress ?? 0);
  const percent = raw > 0 && raw < 1 ? raw * 100 : raw;
  return Math.min(100, Math.max(0, Math.round(percent)));
});
const running = computed(() =>
  COMPOSE_ACTIVE_STATUSES.includes(statusCode.value),
);
const done = computed(() => statusCode.value === COMPOSE_STATUS.SUCCESS);
const failed = computed(() => statusCode.value === COMPOSE_STATUS.FAILED);
const playable = computed(
  () => done.value && Boolean(props.status?.finalUrl),
);
const needsRecompose = computed(() => Boolean(props.needsRecompose));
const burnSubtitles = computed({
  get: () => props.burnSubtitles ?? true,
  set: (value: boolean) => emit('update:burnSubtitles', value),
});
const missingText = computed(() => {
  if (props.hasSegments) {
    return `缺第 ${(props.missingSegmentSeqs ?? []).join('、')} 段视频`;
  }
  const count = props.missingShotSeqs?.length ?? 0;
  return count
    ? `还有 ${count} 镜没有视频`
    : '素材尚未加载完成或存在缺失视频';
});

watch(
  () => props.episodeId,
  () => {
    gateOpen.value = false;
    missingOpen.value = false;
    previewOpen.value = false;
  },
);
watch(
  () => props.precheckMessage,
  (value) => {
    if (value) {
      missingOpen.value = true;
    }
  },
);
watch(
  () => props.missingShots,
  (value) => {
    if (value?.length) {
      missingOpen.value = true;
    }
  },
);

function handleCompose() {
  if (running.value || props.submitting) {
    return;
  }
  if (!props.ready) {
    gateOpen.value = true;
    return;
  }
  emit('submit');
}

function forceSubmit() {
  gateOpen.value = false;
  missingOpen.value = false;
  emit('submit');
}

function needVideo() {
  gateOpen.value = false;
  missingOpen.value = false;
  emit('needVideo');
}

function openPreview() {
  if (playable.value) {
    previewOpen.value = true;
  }
}

function fileName(suffix: string) {
  return `第${props.episodeSeq ?? props.episodeId ?? ''}集${suffix}`;
}

async function downloadCompose() {
  if (!props.episodeId || downloading.value) {
    return;
  }
  if (!props.status?.finalUrl) {
    message.warning('成片地址未就绪，请稍后刷新状态');
    return;
  }
  downloading.value = true;
  try {
    // 下载地址来自后端 compose/status 的 finalUrl（OSS 文件）
    downloadExportUrl(props.status.finalUrl, fileName('成片.mp4'));
    message.success('已开始下载成片');
  } catch (error: any) {
    message.error(
      downloadErrorText(error, '下载成片失败', '请确认成片已生成且可访问'),
    );
  } finally {
    downloading.value = false;
  }
}

async function exportBundle() {
  if (!props.episodeId || exporting.value) {
    return;
  }
  exporting.value = true;
  try {
    const res = await aiAssetApi.exportEpisodeComposeBundle(props.episodeId);
    downloadExportUrl(
      res?.url,
      res?.fileName || fileName('素材包.zip'),
    );
    message.success('已开始导出素材包（mp4 + srt + 封面）');
  } catch (error: any) {
    message.error(
      downloadErrorText(error, '导出素材包失败', '请确认成片与字幕已生成'),
    );
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <div>
    <div
      class="sb-compose"
      :class="{
        'is-done': done,
        'is-failed': failed,
        'is-stale': needsRecompose,
      }"
    >
      <div class="sb-compose__main">
        <span class="sb-compose__label">成片</span>
        <Tag
          :bordered="false"
          :color="needsRecompose ? 'orange' : state.color"
        >
          {{ needsRecompose ? '需重新合成' : state.label }}
        </Tag>
        <Progress
          v-if="statusCode === COMPOSE_STATUS.RUNNING"
          :percent="progress"
          class="sb-compose__progress"
          size="small"
        />
        <span class="sb-compose__note">
          {{ aspectRatio || '9:16' }} · 烧录后字幕不可编辑，软字幕 srt 仍保留
        </span>
        <span v-if="needsRecompose" class="sb-compose__warn">
          素材已更新，需重新合成
        </span>
        <span v-if="done && !playable" class="sb-compose__note">
          已完成，地址加载中
        </span>
        <span v-if="status?.errorMsg" class="sb-compose__error">
          {{ status.errorMsg }}
        </span>
        <span class="sb-compose__spacer"></span>
        <label class="sb-compose__burn">
          <Switch
            v-model:checked="burnSubtitles"
            :disabled="running || submitting"
            size="small"
          />
          烧录字幕
        </label>
        <Button
          size="small"
          type="primary"
          :disabled="running"
          :loading="submitting || running"
          @click="handleCompose"
        >
          {{
            running
              ? `${state.label}…`
              : failed
                ? '重试'
                : needsRecompose
                  ? '重新合成'
                  : done
                    ? '重新生成成片'
                    : '生成成片'
          }}
        </Button>
      </div>
      <div v-if="needsRecompose" class="sb-compose__stale">
        旧成片仍可预览/下载，但素材已变更，建议重新合成后再导出。
      </div>
    </div>

    <Card
      v-if="done"
      class="sb-final"
      :class="{ 'is-stale': needsRecompose }"
      hoverable
      size="small"
      @click="openPreview"
    >
      <div class="sb-final__cover">
        <video
          v-if="status?.finalUrl"
          :poster="status?.thumbnailUrl"
          :src="status.finalUrl"
          muted
          playsinline
          preload="metadata"
        ></video>
        <div v-else class="sb-final__placeholder">地址加载中</div>
      </div>
      <div class="sb-final__meta">
        <b>
          {{
            needsRecompose
              ? '素材已更新，当前为旧成片'
              : playable
                ? '成片已就绪，点击预览'
                : '已完成，地址加载中'
          }}
        </b>
        <span>
          {{ status?.durationSeconds ? `${status.durationSeconds} 秒` : '时长未知' }}
          <template v-if="status?.resolution"> · {{ status.resolution }}</template>
          · {{ aspectRatio || '9:16' }}
          · 烧录字幕{{ burnSubtitles ? '开' : '关' }}
        </span>
      </div>
      <div class="sb-final__actions" @click.stop>
        <Button size="small" :loading="downloading" @click="downloadCompose">
          <template #icon><DownloadOutlined /></template>
          下载成片
        </Button>
        <Button size="small" :loading="exporting" @click="exportBundle">
          <template #icon><ExportOutlined /></template>
          导出素材包
        </Button>
        <Button
          size="small"
          type="primary"
          :disabled="!playable"
          @click="openPreview"
        >
          预览
        </Button>
      </div>
    </Card>

    <Modal
      v-model:open="previewOpen"
      :footer="null"
      title="成片预览"
      width="860px"
    >
      <video
        v-if="status?.finalUrl"
        class="sb-final-video"
        :poster="status?.thumbnailUrl"
        :src="status.finalUrl"
        autoplay
        controls
        playsinline
      ></video>
    </Modal>

    <Modal
      v-model:open="gateOpen"
      :footer="null"
      title="成片尚未就绪"
      width="520px"
    >
      <p class="compose-gate__text">
        <template v-if="hasSegments">
          段落模式：{{ missingText }}，先去批量生成视频？
        </template>
        <template v-else>
          还有 {{ missingShotSeqs?.length ?? 0 }} 镜没有视频，先去批量生成视频？
        </template>
      </p>
      <p class="nwb-tip">空镜或其他特殊情况可以仍然提交。</p>
      <div class="compose-gate__actions">
        <Button @click="needVideo">去生成</Button>
        <Button type="primary" :loading="submitting" @click="forceSubmit">
          仍然提交
        </Button>
      </div>
    </Modal>

    <Modal
      v-model:open="missingOpen"
      :footer="null"
      title="成片预检未通过"
      width="620px"
    >
      <p v-if="hasSegments" class="nwb-tip">
        段落模式：
        <template v-if="missingSegmentSeqs?.length">
          {{ missingText }}
        </template>
        <template v-else>存在缺失视频的段落</template>
      </p>
      <p v-else-if="precheckMessage" class="nwb-tip">
        {{ precheckMessage }}
      </p>
      <div v-if="!hasSegments && missingShots?.length" class="compose-missing">
        <div
          v-for="item in missingShots"
          :key="item.shotId"
          class="compose-missing__row"
        >
          <b>#{{ item.seq ?? item.shotId }}</b>
          <span>{{ item.reason || '缺少视频，请先生成镜头视频' }}</span>
        </div>
      </div>
      <p v-else-if="!hasSegments && !precheckMessage" class="nwb-tip">
        后端未返回缺失镜头明细，请先检查视频生成状态。
      </p>
      <div class="compose-missing__foot">
        <Button @click="needVideo">去批量生成视频</Button>
        <Button type="primary" @click="missingOpen = false">知道了</Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.sb-compose {
  flex: none;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 12px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &.is-done {
    background: color-mix(in srgb, hsl(var(--success)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--success)) 30%, transparent);
  }

  &.is-failed {
    background: color-mix(in srgb, hsl(var(--destructive)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--destructive)) 30%, transparent);
  }

  &.is-stale {
    background: color-mix(in srgb, hsl(var(--warning)) 8%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--warning)) 40%, transparent);
  }
}

.sb-compose__main {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.sb-compose__label {
  font-weight: 600;
}

.sb-compose__progress {
  width: 160px;
}

.sb-compose__note,
.sb-compose__burn {
  color: hsl(var(--muted-foreground));
}

.sb-compose__warn {
  color: hsl(var(--warning));
}

.sb-compose__error {
  color: hsl(var(--destructive));
}

.sb-compose__spacer {
  flex: 1;
}

.sb-compose__burn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.sb-compose__stale {
  margin-top: 6px;
  color: hsl(var(--warning));
}

.sb-final {
  flex: none;
  margin-bottom: 10px;
  cursor: pointer;

  :deep(.ant-card-body) {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  &.is-stale {
    border-color: color-mix(in srgb, hsl(var(--warning)) 40%, transparent);
  }
}

.sb-final__cover {
  flex: none;
  width: 96px;
  height: 54px;
  overflow: hidden;
  background: #000;
  border-radius: 6px;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.sb-final__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
}

.sb-final__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;

  b {
    font-size: 13px;
  }

  span {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.sb-final__actions {
  display: flex;
  flex: none;
  gap: 8px;
}

.sb-final-video {
  width: 100%;
  max-height: 70vh;
  background: #000;
  border-radius: 8px;
}

.compose-missing {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}

.compose-gate__text {
  margin: 0 0 8px;
  font-size: 14px;
}

.compose-gate__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.compose-missing__row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  font-size: 12px;
  background: hsl(var(--accent));
  border-radius: 8px;

  b {
    flex: none;
  }

  span {
    flex: 1;
  }
}

.compose-missing__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.nwb-tip {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}
</style>
