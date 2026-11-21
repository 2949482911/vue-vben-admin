<script lang="ts" setup name="CanvasShotTakes">
import type { CanvasShotTake } from '#/api/models/ai_asset_canvas';

import { computed } from 'vue';

import { Button, Tag } from 'ant-design-vue';

import { shotTakeId } from './useCanvasShotMedia';

const props = defineProps<{
  kind: 'keyframe' | 'segment-video';
  selectedUrl?: null | string;
  selectingTakeId?: string;
  takes?: CanvasShotTake[];
}>();

const emit = defineEmits<{ select: [take: CanvasShotTake] }>();

const label = computed(() =>
  props.kind === 'keyframe' ? '关键帧 take' : '本段视频 take',
);

function takeId(take: CanvasShotTake) {
  return shotTakeId(take);
}

function isFailed(take: CanvasShotTake) {
  return Boolean(take.errorMsg) || take.takeStatus === 5 || take.status === 5;
}

function isSelected(take: CanvasShotTake) {
  if (take.isSelected) {
    return true;
  }
  const url = take.url || take.thumbnailUrl || '';
  return Boolean(url && props.selectedUrl && url === props.selectedUrl);
}

function canSelect(take: CanvasShotTake) {
  return Boolean(takeId(take)) && Boolean(take.url) && !isFailed(take);
}
</script>

<template>
  <div v-if="takes?.length" class="canvas-shot-takes">
    <div class="canvas-shot-takes__title">{{ label }}</div>
    <div class="canvas-shot-takes__list">
      <div
        v-for="(take, index) in takes"
        :key="String(takeId(take) ?? index)"
        class="canvas-shot-takes__item"
      >
        <img
          v-if="take.thumbnailUrl || take.url"
          :src="take.thumbnailUrl || take.url || ''"
          alt=""
          class="canvas-shot-takes__thumb"
        />
        <div v-else class="canvas-shot-takes__placeholder">无预览</div>
        <div class="canvas-shot-takes__meta">
          <span>take {{ index + 1 }}</span>
          <Tag v-if="isSelected(take)" :bordered="false" color="success">
            已选用
          </Tag>
        </div>
        <div v-if="take.errorMsg" class="canvas-shot-takes__error">
          {{ take.errorMsg }}
        </div>
        <Button
          v-else
          :disabled="!canSelect(take) || Boolean(selectingTakeId) || isSelected(take)"
          :loading="selectingTakeId === String(takeId(take))"
          size="small"
          @click.stop="emit('select', take)"
        >
          选用{{ kind === 'keyframe' ? '此图' : '视频' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-shot-takes {
  margin: 4px 0;
  font-size: 11px;

  &__title {
    margin-bottom: 4px;
    color: hsl(var(--muted-foreground));
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 96px;
    padding: 4px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;
  }

  &__thumb,
  &__placeholder {
    width: 100%;
    height: 54px;
    object-fit: cover;
    border-radius: 4px;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
  }

  &__meta {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
    color: hsl(var(--muted-foreground));
  }

  &__error {
    font-size: 10px;
    color: hsl(var(--destructive));
    word-break: break-all;
  }
}
</style>
