<script lang="ts" setup name="StudioChatComposer">
import type { RefAsset } from '../constants';

import { computed, watch } from 'vue';

/**
 * 对话式创作的输入区
 *
 * 技能 chips + 提示词输入 + 参数 chip（模型 / 比例 / 清晰度 / 数量）+ 圆形生成按钮。
 * 视觉对齐即梦：柔和大圆角浮起输入卡、参数做成图标化 chip、提示语收进 tooltip。
 */
import {
  ArrowUpOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { Button, Select, Switch, Textarea, Tooltip } from 'ant-design-vue';

import {
  COUNT_OPTIONS,
  MAX_REF_COUNT,
  MAX_VIDEO_REF_COUNT,
  RATIO_OPTIONS,
  RESOLUTION_OPTIONS,
  skillKind,
  SMART_RATIO,
  VIDEO_DURATION_DEFAULT,
  VIDEO_DURATION_OPTIONS,
  VIDEO_RATIO_DEFAULT,
  VIDEO_RATIO_OPTIONS,
  VIDEO_RESOLUTION_DEFAULT,
  VIDEO_RESOLUTION_OPTIONS,
} from '../constants';
import RatioPicker from './RatioPicker.vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    models: Array<{
      capability?: string;
      label: string;
      value: number | string;
    }>;
    /** 迭代目标：仅展示「当前素材」，不参与 refImages */
    iterationTarget?: null | { id: number | string; preview: string };
    skills: Array<{ label: string; value: string }>;
  }>(),
  { iterationTarget: null, loading: false },
);

const emit = defineEmits<{ pick: []; submit: [] }>();

const count = defineModel<number>('count', { default: 1 });
const modelId = defineModel<number | string | undefined>('modelId');
const prompt = defineModel<string>('prompt', { default: '' });
const ratio = defineModel<string>('ratio', { default: 'smart' });
const resolution = defineModel<string>('resolution', { default: '2K' });
const skill = defineModel<string>('skill', { default: 'text2img' });
const duration = defineModel<number>('duration', { default: VIDEO_DURATION_DEFAULT });
const audio = defineModel<boolean>('audio', { default: true });
/** 参考图（图生图 / 图编辑）：由页面持有的抽屉写入 */
const refs = defineModel<RefAsset[]>('refs', { default: () => [] });

const isVideo = computed(() => skillKind(skill.value) === 'video');

/** 视频只能传首帧；文生视频不需要参考图 */
const maxRefs = computed(() =>
  isVideo.value ? MAX_VIDEO_REF_COUNT : MAX_REF_COUNT,
);
const refEnabled = computed(() => skill.value !== 'text2video');

/** 模型按技能类型过滤（视频 → capability=video；图片 → image/edit 或未标注） */
const modelOptions = computed(() =>
  props.models.filter((item) =>
    isVideo.value
      ? item.capability === 'video'
      : !item.capability || ['edit', 'image'].includes(item.capability),
  ),
);

const ratioOptions = computed(() =>
  isVideo.value ? VIDEO_RATIO_OPTIONS : RATIO_OPTIONS,
);
const resolutionOptions = computed(() =>
  isVideo.value ? VIDEO_RESOLUTION_OPTIONS : RESOLUTION_OPTIONS,
);

/** 切图片/视频时重置比例与清晰度（两套取值不通用） */
watch(isVideo, (video) => {
  ratio.value = video ? VIDEO_RATIO_DEFAULT : SMART_RATIO;
  resolution.value = video ? VIDEO_RESOLUTION_DEFAULT : '2K';
  if (refs.value.length > maxRefs.value) {
    refs.value = refs.value.slice(0, maxRefs.value);
  }
});

function removeRef(id: number | string) {
  refs.value = refs.value.filter((item) => String(item.id) !== String(id));
}
</script>

<template>
  <div class="composer">
    <div class="composer__box">
      <!-- 参考素材：入口 + 已选缩略图（取代即梦的上传位） -->
      <div class="composer__refs">
        <!-- 迭代目标：当前正在编辑的素材（只展示，不当作参考图提交） -->
        <span
          v-if="props.iterationTarget"
          class="ref-chip ref-chip--target"
          :title="`当前素材 #${props.iterationTarget.id}`"
        >
          <img
            v-if="props.iterationTarget.preview"
            alt="当前素材"
            :src="props.iterationTarget.preview"
          />
          <i class="ref-chip__tag">当前</i>
        </span>

        <button
          v-if="refEnabled && refs.length < maxRefs"
          class="ref-add"
          type="button"
          @click="emit('pick')"
        >
          <PlusOutlined />
          <span>{{ isVideo ? '选择首帧' : '选择素材' }}</span>
        </button>

        <span v-for="ref in refs" :key="ref.id" class="ref-chip">
          <img :alt="ref.name" :src="ref.url" />
          <button type="button" @click="removeRef(ref.id)">
            <CloseOutlined />
          </button>
        </span>

        <span v-if="refs.length > 0" class="ref-count">
          {{ refs.length }}/{{ maxRefs }}
        </span>
      </div>

      <Textarea
        v-model:value="prompt"
        :auto-size="{ maxRows: 8, minRows: 3 }"
        :bordered="false"
        class="composer__input"
        placeholder="描述你想生成的素材，例如：25 岁亚洲女性，手拿咖啡杯，浅蓝衬衫，电商口播风格"
        @keydown.enter.exact.prevent="emit('submit')"
      />

      <div class="composer__bar">
        <Tooltip title="模型">
          <Select
            v-model:value="modelId"
            class="chip chip--model"
            option-filter-prop="label"
            :options="modelOptions"
            placeholder="选择模型"
            show-search
          />
        </Tooltip>

        <RatioPicker v-model:value="ratio" :options="ratioOptions" />

        <Tooltip title="清晰度">
          <Select
            v-model:value="resolution"
            class="chip"
            :options="resolutionOptions"
          />
        </Tooltip>

        <Tooltip :title="isVideo ? '生成时长' : '生成数量'">
          <Select
            v-if="isVideo"
            v-model:value="duration"
            class="chip chip--count"
            :options="VIDEO_DURATION_OPTIONS"
          />
          <Select
            v-else
            v-model:value="count"
            class="chip chip--count"
            :options="COUNT_OPTIONS"
          />
        </Tooltip>

        <Tooltip v-if="isVideo" title="是否生成音频">
          <span class="composer__audio">
            <span>音频</span>
            <Switch v-model:checked="audio" size="small" />
          </span>
        </Tooltip>

        <Tooltip title="生成（Enter 生成 · Shift+Enter 换行）">
          <Button
            class="composer__send"
            :disabled="!prompt.trim()"
            :loading="props.loading"
            shape="circle"
            type="primary"
            @click="emit('submit')"
          >
            <template #icon><ArrowUpOutlined /></template>
          </Button>
        </Tooltip>
      </div>
    </div>

    <div class="composer__skills">
      <button
        v-for="option in props.skills"
        :key="option.value"
        class="skill-chip"
        :class="{ 'is-on': option.value === skill }"
        type="button"
        @click="skill = option.value"
      >
        <span class="skill-chip__slash">/</span>{{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.composer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 技能 chips 在输入框下方（对齐即梦：/ 开头、圆角胶囊） */
.composer__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.skill-chip {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.skill-chip__slash {
  opacity: 0.45;
}

.skill-chip:hover {
  color: hsl(var(--primary));
  border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
}

.skill-chip.is-on {
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
}

/* 参考素材行：入口 + 缩略图 */
.composer__refs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.ref-add {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 1px dashed hsl(var(--border));
  border-radius: 8px;

  &:hover {
    color: hsl(var(--primary));
    border-color: color-mix(in srgb, hsl(var(--primary)) 45%, transparent);
  }
}

.ref-chip {
  position: relative;
  display: block;
  width: 64px;
  height: 64px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  button {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 9px;
    color: #fff;
    cursor: pointer;
    background: rgb(0 0 0 / 55%);
    border: none;
    border-radius: 50%;
  }
}

.composer__audio {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.ref-chip--target {
  outline: 2px solid color-mix(in srgb, hsl(var(--primary)) 55%, transparent);
  outline-offset: 1px;
  border-radius: 8px;
}

.ref-chip__tag {
  position: absolute;
  bottom: -6px;
  left: 50%;
  padding: 0 6px;
  font-size: 10px;
  font-style: normal;
  line-height: 14px;
  color: #fff;
  white-space: nowrap;
  background: hsl(var(--primary));
  border-radius: 999px;
  transform: translateX(-50%);
}

.ref-count {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 输入外壳：柔和大圆角 + 轻浮起阴影，聚焦时主色光圈（对齐即梦的柔和观感） */
.composer__box {
  padding: 14px 14px 10px 16px;
  background: hsl(var(--card));
  border: 1px solid color-mix(in srgb, hsl(var(--border)) 70%, transparent);
  border-radius: 20px;
  box-shadow: 0 12px 32px -14px hsl(var(--foreground) / 22%);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.composer__box:focus-within {
  border-color: color-mix(in srgb, hsl(var(--primary)) 55%, transparent);
  box-shadow:
    0 0 0 4px hsl(var(--primary) / 8%),
    0 12px 32px -14px hsl(var(--foreground) / 22%);
}

.composer__input {
  padding: 0 0 6px;
  font-size: 14px;
  line-height: 1.7;
  resize: none;

  :deep(textarea) {
    padding: 0;
    background: transparent;
  }
}

/* 参数行：不再有分隔线，靠留白分区（像即梦那样"浮"在输入卡底部） */
.composer__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-top: 2px;
}

/* 参数 chip：无边框、hover 浅底，内部 Select 完全透明 */
.chip {
  padding: 0 4px;
  border-radius: 999px;
  transition: background 0.15s ease;

  &:hover {
    background: hsl(var(--accent));
  }

  :deep(.ant-select-selector) {
    height: 28px;
    padding: 0 6px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.ant-select-selection-item),
  :deep(.ant-select-selection-placeholder) {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  :deep(.ant-select-arrow) {
    color: hsl(var(--muted-foreground));
  }
}

.chip--model {
  max-width: 260px;

  :deep(.ant-select-selection-item) {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.chip--count {
  :deep(.ant-select-selection-item) {
    min-width: 14px;
    text-align: center;
  }
}

.composer__send {
  flex: none;
  margin-left: auto;
}
</style>
