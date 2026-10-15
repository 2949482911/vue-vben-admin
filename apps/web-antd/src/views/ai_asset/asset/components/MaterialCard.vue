<script lang="ts" setup name="MaterialCard">
/**
 * 素材卡片
 *
 * 缩略图 + 类型徽标 + 勾选 + 悬浮操作（下载/删除），下方为名称与元信息。
 * 素材名与展示规格均由后端字段派生，见 constants.ts 的 materialDisplayName。
 */
import type { MaterialItem } from '#/api/models/ai_asset';

import { computed } from 'vue';

import {
  DeleteOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  PlayCircleOutlined,
  SoundOutlined,
} from '@ant-design/icons-vue';
import { Checkbox, Tooltip } from 'ant-design-vue';

import {
  MATERIAL_STATUS_MAP,
  MATERIAL_TYPE_MAP,
  materialDisplayName,
} from '../../constants';

const props = withDefaults(
  defineProps<{ item: MaterialItem; selected?: boolean }>(),
  { selected: false },
);

const emit = defineEmits<{
  download: [];
  remove: [];
  toggle: [];
}>();

const TYPE_ICON: Record<string, any> = {
  audio: SoundOutlined,
  image: FileImageOutlined,
  text: FileOutlined,
  video: PlayCircleOutlined,
};

const typeKey = computed(() => props.item.materialType ?? 'text');
const typeIcon = computed(() => TYPE_ICON[typeKey.value] ?? FileOutlined);
const typeLabel = computed(
  () => MATERIAL_TYPE_MAP[typeKey.value] ?? typeKey.value,
);

const displayName = computed(() => materialDisplayName(props.item));

/** 图片类素材展示缩略图，其余类型展示类型图标 */
const thumbUrl = computed(() =>
  props.item.materialType === 'image'
    ? (props.item.thumbnailUrl ?? props.item.storageUrl)
    : '',
);

const statusLabel = computed(
  () => MATERIAL_STATUS_MAP[props.item.status ?? 1]?.label ?? '-',
);

const specs = computed(() =>
  Object.entries(props.item.mediaSpec ?? {})
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${String(v)}`),
);
</script>

<template>
  <article class="media-card" :class="{ 'is-on': props.selected }">
    <div class="media-thumb">
      <span class="type-badge" :class="`type-badge--${typeKey}`">
        <component :is="typeIcon" />
        {{ typeLabel }}
      </span>

      <img
        v-if="thumbUrl"
        :alt="displayName"
        class="thumb-img"
        :src="thumbUrl"
      />
      <component :is="typeIcon" v-else class="thumb-ph" />

      <Checkbox
        class="media-check"
        :checked="props.selected"
        @change="emit('toggle')"
        @click.stop
      />

      <div class="media-hover">
        <Tooltip title="下载">
          <button
            class="hover-btn"
            type="button"
            @click.stop="emit('download')"
          >
            <DownloadOutlined />
          </button>
        </Tooltip>
        <Tooltip title="删除">
          <button
            class="hover-btn"
            type="button"
            @click.stop="emit('remove')"
          >
            <DeleteOutlined />
          </button>
        </Tooltip>
      </div>
    </div>

    <div class="media-body">
      <div class="media-name" :title="displayName">{{ displayName }}</div>
      <div class="media-meta">
        <span class="media-tag" :class="`media-tag--${props.item.status ?? 1}`">
          {{ statusLabel }}
        </span>
        <template v-for="(spec, index) in specs" :key="spec">
          <span v-if="index > 0" class="dot">·</span>
          <span>{{ spec }}</span>
        </template>
      </div>
      <div class="media-meta">
        <span v-if="props.item.remark" class="media-remark" :title="props.item.remark">
          {{ props.item.remark }}
        </span>
        <span v-if="props.item.remark" class="dot">·</span>
        <span>{{ props.item.createTime || '-' }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.media-card {
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.media-card:hover {
  border-color: color-mix(in srgb, hsl(var(--primary)) 34%, transparent);
  box-shadow:
    0 1px 2px hsl(var(--foreground) / 4%),
    0 8px 24px hsl(var(--foreground) / 6%);
  transform: translateY(-2px);
}

.media-card.is-on {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px color-mix(in srgb, hsl(var(--primary)) 16%, transparent);
}

.media-thumb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  background: linear-gradient(
    135deg,
    hsl(var(--accent)),
    color-mix(in srgb, hsl(var(--primary)) 8%, hsl(var(--accent)))
  );
}

.type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  font-size: 12px;
  color: #fff;
  border-radius: 6px;
}

.type-badge--image {
  background: hsl(var(--primary));
}

.type-badge--video {
  background: hsl(258 84% 62%);
}

.type-badge--audio {
  background: hsl(187 78% 38%);
}

.type-badge--text {
  background: hsl(var(--muted-foreground));
}

.thumb-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.thumb-ph {
  font-size: 30px;
  color: hsl(var(--muted-foreground));
}

.media-check {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  margin: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.media-card:hover .media-check,
.media-card.is-on .media-check {
  opacity: 1;
}

.media-hover {
  position: absolute;
  inset: auto 0 0;
  z-index: 2;
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  padding: 8px;
  opacity: 0;
  background: linear-gradient(0deg, rgb(0 0 0 / 45%), transparent);
  transition: opacity 0.15s ease;
}

.media-card:hover .media-hover {
  opacity: 1;
}

.hover-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #fff;
  cursor: pointer;
  background: rgb(255 255 255 / 18%);
  border: none;
  border-radius: 9px;
}

.hover-btn:hover {
  background: rgb(255 255 255 / 30%);
}

.media-body {
  padding: 10px 12px 12px;
}

.media-name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.media-meta .dot {
  opacity: 0.5;
}

.media-remark {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-tag {
  padding: 1px 6px;
  font-size: 12px;
  border-radius: 5px;
}

.media-tag--1 {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
}

.media-tag--2 {
  color: hsl(var(--success));
  background: color-mix(in srgb, hsl(var(--success)) 13%, transparent);
}
</style>
