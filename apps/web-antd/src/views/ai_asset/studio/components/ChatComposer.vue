<script lang="ts" setup name="StudioChatComposer">
/**
 * 对话式创作的输入区
 *
 * 技能 chips + 提示词输入 + 参数（模型 / 比例 / 清晰度 / 数量）+ 生成。
 * 输入框外壳样式对齐后台「AI投手」的对话输入：带边框的浮起卡片 + 聚焦高亮 + 圆形发送按钮。
 */
import { SendOutlined } from '@ant-design/icons-vue';
import { Button, Select, Textarea, Tooltip } from 'ant-design-vue';

import { COUNT_OPTIONS, RESOLUTION_OPTIONS } from '../constants';
import RatioPicker from './RatioPicker.vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    models: Array<{ label: string; value: number | string }>;
    skills: Array<{ label: string; value: string }>;
  }>(),
  { loading: false },
);

const emit = defineEmits<{ submit: [] }>();

const count = defineModel<number>('count', { default: 1 });
const modelId = defineModel<number | string | undefined>('modelId');
const prompt = defineModel<string>('prompt', { default: '' });
const ratio = defineModel<string>('ratio', { default: 'smart' });
const resolution = defineModel<string>('resolution', { default: '2K' });
const skill = defineModel<string>('skill', { default: 'text2img' });
</script>

<template>
  <div class="composer">
    <div class="composer__box">
      <Textarea
        v-model:value="prompt"
        :auto-size="{ maxRows: 8, minRows: 3 }"
        :bordered="false"
        class="composer__input"
        placeholder="描述你想生成的素材，例如：25 岁亚洲女性，手拿咖啡杯，浅蓝衬衫，电商口播风格"
        @keydown.enter.exact.prevent="emit('submit')"
      />

      <div class="composer__bar">
        <div class="param">
          <span class="param__label">模型</span>
          <Select
            v-model:value="modelId"
            class="param__control param__control--model"
            option-filter-prop="label"
            :options="props.models"
            placeholder="选择模型"
            show-search
            size="small"
          />
        </div>

        <RatioPicker v-model:value="ratio" />

        <div class="param">
          <span class="param__label">清晰度</span>
          <Select
            v-model:value="resolution"
            class="param__control param__control--sm"
            :options="RESOLUTION_OPTIONS"
            size="small"
          />
        </div>

        <div class="param">
          <span class="param__label">数量</span>
          <Select
            v-model:value="count"
            class="param__control param__control--sm"
            :options="COUNT_OPTIONS"
            size="small"
          />
        </div>

        <span class="composer__tips">Enter 生成 · Shift+Enter 换行</span>

        <Tooltip title="生成">
          <Button
            class="composer__send"
            :disabled="!prompt.trim()"
            :loading="props.loading"
            shape="circle"
            type="primary"
            @click="emit('submit')"
          >
            <template #icon><SendOutlined /></template>
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
        {{ option.label }}
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

/* 技能 chips 在输入框下方（对齐即梦） */
.composer__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.skill-chip {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.skill-chip:hover {
  color: hsl(var(--foreground));
}

.skill-chip.is-on {
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
}

/* 输入外壳：对齐后台「AI投手」的对话输入（带边框浮起卡片 + 聚焦高亮） */
.composer__box {
  padding: 8px 8px 8px 14px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 6%);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.composer__box:focus-within {
  border-color: hsl(var(--primary));
  box-shadow:
    0 0 0 3px hsl(var(--primary) / 12%),
    0 8px 24px hsl(var(--foreground) / 6%);
}

.composer__input {
  padding: 4px 2px 8px;
  font-size: 14px;
  resize: none;

  :deep(textarea) {
    padding: 0;
    background: transparent;
  }
}

.composer__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid hsl(var(--border));
}

.param {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.param__label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.param__control {
  width: 160px;
}

.param__control--sm {
  width: 84px;
}

.param__control--model {
  width: 220px;
}

.composer__tips {
  flex: 1;
  font-size: 12px;
  text-align: right;
  color: hsl(var(--muted-foreground));
  user-select: none;
}

.composer__send {
  flex: none;
}
</style>
