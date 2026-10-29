<script lang="ts" setup name="ContinuousPreviewModal">
/**
 * 连续片段预览：不等全部生成/Airflow 成片，先把已生成的段落或镜头按顺序连播，
 * 用于判断前后是否连贯。纯前端 video 连播，不调生成接口、不写库、不产生新素材。
 * 缺失视频的段/镜直接跳过，并在进度条标红。
 */
import type { SegmentItem, ShotItem } from '#/api/models/ai_asset';

import { computed, nextTick, ref, watch } from 'vue';

import { Button, message, Modal } from 'ant-design-vue';

const props = defineProps<{
  flatView: boolean;
  /** 场次范围；不传表示当前集全部 */
  scopeSceneSeq?: number;
  segments: SegmentItem[];
  shots: ShotItem[];
}>();

const open = defineModel<boolean>('open', { default: false });

interface PreviewItem {
  key: string;
  kind: 'segment' | 'shot';
  label: string;
  sceneSeq: number;
  seq: number;
  videoUrl?: string;
}

const shellRef = ref<HTMLElement>();
const videoRef = ref<HTMLVideoElement>();
const currentIndex = ref(0);
const playing = ref(false);

function shotsOfSegment(segment: SegmentItem) {
  const ids = new Set((segment.shotIds ?? []).map((id) => String(id)));
  const list = ids.size
    ? props.shots.filter((shot) => ids.has(String(shot.id)))
    : props.shots.filter(
        (shot) => String(shot.segmentId ?? '') === String(segment.id),
      );
  return [...list].sort((a, b) => Number(a.seq ?? 0) - Number(b.seq ?? 0));
}

/** 顺序与当前视图一致：段落视图按 segment.seq，单镜段/平铺按 shot.seq */
const playlist = computed<PreviewItem[]>(() => {
  const inScope = (sceneSeq?: number) =>
    props.scopeSceneSeq === undefined ||
    Number(sceneSeq) === Number(props.scopeSceneSeq);
  if (!props.flatView && props.segments.length) {
    const list = [...props.segments]
      .filter((segment) => inScope(segment.sceneSeq))
      .sort(
        (a, b) =>
          Number(a.sceneSeq) - Number(b.sceneSeq) ||
          Number(a.seq) - Number(b.seq),
      );
    const items: PreviewItem[] = [];
    for (const segment of list) {
      if (segment.generationMode === 'shot') {
        for (const shot of shotsOfSegment(segment)) {
          items.push({
            key: `shot-${shot.id}`,
            kind: 'shot',
            label: `第 ${shot.seq ?? shot.id} 镜`,
            sceneSeq: Number(shot.sceneSeq ?? segment.sceneSeq),
            seq: Number(shot.seq ?? 0),
            videoUrl: shot.videoUrl,
          });
        }
      } else {
        items.push({
          key: `segment-${segment.id}`,
          kind: 'segment',
          label: `第 ${segment.seq} 段`,
          sceneSeq: Number(segment.sceneSeq),
          seq: Number(segment.seq),
          videoUrl: segment.videoUrl,
        });
      }
    }
    return items;
  }
  return [...props.shots]
    .filter((shot) => inScope(shot.sceneSeq))
    .sort(
      (a, b) =>
        Number(a.sceneSeq ?? 0) - Number(b.sceneSeq ?? 0) ||
        Number(a.seq ?? 0) - Number(b.seq ?? 0),
    )
    .map((shot) => ({
      key: `shot-${shot.id}`,
      kind: 'shot',
      label: `第 ${shot.seq ?? shot.id} 镜`,
      sceneSeq: Number(shot.sceneSeq ?? 0),
      seq: Number(shot.seq ?? 0),
      videoUrl: shot.videoUrl,
    }));
});

const current = computed(() => playlist.value[currentIndex.value]);
const missingCount = computed(
  () => playlist.value.filter((item) => !item.videoUrl).length,
);
const title = computed(() =>
  props.scopeSceneSeq
    ? `连续预览 · 第 ${props.scopeSceneSeq} 场`
    : '连续预览 · 本集',
);

function reportSkipped(labels: string[]) {
  if (!labels.length) {
    return;
  }
  const head = labels[0]!;
  message.info(
    labels.length === 1
      ? `${head}未生成，已跳过`
      : `${head} 等 ${labels.length} 个片段未生成，已跳过`,
  );
}

function playIndex(index: number) {
  const list = playlist.value;
  if (!list.length) {
    return;
  }
  let cursor = Math.max(0, index);
  const skipped: string[] = [];
  while (cursor < list.length && !list[cursor]?.videoUrl) {
    skipped.push(list[cursor]!.label);
    cursor += 1;
  }
  reportSkipped(skipped);
  if (cursor >= list.length) {
    playing.value = false;
    message.info('后面没有已生成的视频');
    return;
  }
  currentIndex.value = cursor;
  playing.value = true;
  void nextTick(() => {
    videoRef.value?.play().catch(() => {
      playing.value = false;
    });
  });
}

function playPrevious() {
  const list = playlist.value;
  if (!list.length) {
    return;
  }
  let cursor = currentIndex.value - 1;
  const skipped: string[] = [];
  while (cursor >= 0 && !list[cursor]?.videoUrl) {
    skipped.push(list[cursor]!.label);
    cursor -= 1;
  }
  reportSkipped(skipped);
  if (cursor < 0) {
    message.info('前面没有已生成的视频');
    return;
  }
  currentIndex.value = cursor;
  playing.value = true;
  void nextTick(() => {
    videoRef.value?.play().catch(() => {
      playing.value = false;
    });
  });
}

function togglePlay() {
  const element = videoRef.value;
  if (!current.value?.videoUrl || !element) {
    playIndex(currentIndex.value);
    return;
  }
  if (element.paused) {
    void element.play();
    playing.value = true;
  } else {
    element.pause();
    playing.value = false;
  }
}

function playNext() {
  playIndex(currentIndex.value + 1);
}

function onEnded() {
  playNext();
}

function restart() {
  playIndex(0);
}

function startCurrent() {
  playIndex(currentIndex.value);
}

function requestFullscreen() {
  void shellRef.value?.requestFullscreen?.();
}

watch(
  () => open.value,
  (value) => {
    if (value) {
      currentIndex.value = 0;
      playing.value = false;
      return;
    }
    videoRef.value?.pause();
    playing.value = false;
  },
);

watch(
  () => playlist.value.length,
  (length) => {
    if (currentIndex.value >= length) {
      currentIndex.value = Math.max(0, length - 1);
    }
  },
);
</script>

<template>
  <Modal
    v-model:open="open"
    :footer="null"
    :title="title"
    destroy-on-close
    width="920px"
  >
    <div ref="shellRef" class="cp">
      <div class="cp-stage">
        <video
          v-if="current?.videoUrl"
          ref="videoRef"
          :src="current.videoUrl"
          playsinline
          preload="metadata"
          @click="togglePlay"
          @ended="onEnded"
          @pause="playing = false"
          @play="playing = true"
        ></video>
        <div v-else class="cp-empty">
          <b>{{ current?.label || '没有可预览的片段' }}</b>
          <span>该片段还没有视频，播放时会自动跳过</span>
        </div>
      </div>

      <div class="cp-progress">
        <button
          v-for="(item, index) in playlist"
          :key="item.key"
          type="button"
          class="cp-progress__item"
          :class="{
            'is-active': index === currentIndex,
            'is-missing': !item.videoUrl,
          }"
          :title="`${item.label}${item.videoUrl ? '' : '（未生成）'}`"
          @click="playIndex(index)"
        ></button>
      </div>

      <div class="cp-meta">
        <span>
          当前第 {{ playlist.length ? currentIndex + 1 : 0 }}/{{ playlist.length }}
          段
        </span>
        <span v-if="current">{{ current.label }}</span>
        <span v-if="missingCount" class="cp-meta__missing">
          缺失 {{ missingCount }} 段
        </span>
      </div>

      <div class="cp-controls">
        <Button size="small" @click="restart">从头开始</Button>
        <Button size="small" @click="startCurrent">从当前段开始</Button>
        <Button size="small" @click="playPrevious">上一段</Button>
        <Button size="small" type="primary" @click="togglePlay">
          {{ playing ? '暂停' : '播放' }}
        </Button>
        <Button size="small" @click="playNext">下一段</Button>
        <Button size="small" @click="requestFullscreen">全屏</Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.cp {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cp-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 460px;
  overflow: hidden;
  background: #000;
  border-radius: 8px;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    cursor: pointer;
  }
}

.cp-empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  color: hsl(var(--muted-foreground));

  b {
    font-size: 14px;
    color: #fff;
  }

  span {
    font-size: 12px;
  }
}

.cp-progress {
  display: flex;
  gap: 4px;
  width: 100%;
}

.cp-progress__item {
  flex: 1;
  height: 6px;
  padding: 0;
  cursor: pointer;
  background: hsl(var(--success));
  border: none;
  border-radius: 3px;
  opacity: 0.55;

  &.is-missing {
    background: hsl(var(--destructive));
    opacity: 0.8;
  }

  &.is-active {
    opacity: 1;
    outline: 2px solid hsl(var(--primary));
    outline-offset: 1px;
  }
}

.cp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.cp-meta__missing {
  color: hsl(var(--destructive));
}

.cp-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
</style>
