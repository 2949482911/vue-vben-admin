<script lang="ts" setup name="StudioChatComposer">
import type { RefAsset } from '../constants';

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
import { Button, Select, Textarea, Tooltip } from 'ant-design-vue';

import {
  COUNT_OPTIONS,
  MAX_REF_COUNT,
  RESOLUTION_OPTIONS,
} from '../constants';
import RatioPicker from './RatioPicker.vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    models: Array<{ label: string; value: number | string }>;
    skills: Array<{ label: string; value: string }>;
  }>(),
  { loading: false },
);

const emit = defineEmits<{ pick: []; submit: [] }>();

const count = defineModel<number>('count', { default: 1 });
const modelId = defineModel<number | string | undefined>('modelId');
const prompt = defineModel<string>('prompt', { default: '' });
const ratio = defineModel<string>('ratio', { default: 'smart' });
const resolution = defineModel<string>('resolution', { default: '2K' });
const skill = defineModel<string>('skill', { default: 'text2img' });
/** 参考图（图生图 / 图编辑）：由页面持有的抽屉写入 */
const refs = defineModel<RefAsset[]>('refs', { default: () => [] });

function removeRef(id: number | string) {
  refs.value = refs.value.filter((item) => String(item.id) !== String(id));
}
</script>

<template>
  <div class="composer">
    <div class="composer__box">
      <!-- 参考素材：入口 + 已选缩略图（取代即梦的上传位） -->
      <div class="composer__refs">
        <button
          v-if="refs.length < MAX_REF_COUNT"
          class="ref-add"
          type="button"
          @click="emit('pick')"
        >
          <PlusOutlined />
          <span>选择素材</span>
        </button>

        <span v-for="ref in refs" :key="ref.id" class="ref-chip">
          <img :alt="ref.name" :src="ref.url" />
          <button type="button" @click="removeRef(ref.id)">
            <CloseOutlined />
          </button>
        </span>

        <span v-if="refs.length > 0" class="ref-count">
          {{ refs.length }}/{{ MAX_REF_COUNT }}
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
            :options="props.models"
            placeholder="选择模型"
            show-search
          />
        </Tooltip>

        <RatioPicker v-model:value="ratio" />

        <Tooltip title="清晰度">
          <Select
            v-model:value="resolution"
            class="chip"
            :options="RESOLUTION_OPTIONS"
          />
        </Tooltip>

        <Tooltip title="生成数量">
          <Select v-model:value="count" class="chip chip--count" :options="COUNT_OPTIONS" />
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
