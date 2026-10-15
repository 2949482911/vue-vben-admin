<script lang="ts" setup name="StudioRatioPicker">
/**
 * 比例选择器（对话式创作参数 chips 之一）
 *
 * 胶囊按钮 + 浮层网格（对齐即梦：智能 / 1:1 / 3:4 / 16:9 …），每个比例带等比小方块预览。
 */
import { computed, ref } from 'vue';

import { Popover } from 'ant-design-vue';

import { RATIO_OPTIONS, SMART_RATIO } from '../constants';

const props = defineProps<{ value: string }>();
const emit = defineEmits<{ 'update:value': [value: string] }>();

const open = ref(false);

const currentLabel = computed(
  () =>
    RATIO_OPTIONS.find((option) => option.value === props.value)?.label ??
    props.value,
);

function boxStyle(value: string) {
  if (value === SMART_RATIO) {
    return { borderRadius: '3px' };
  }
  const [w, h] = value.split(':').map(Number);
  const max = 18;
  if (!w || !h) {
    return {};
  }
  return w >= h
    ? { height: `${Math.round((h / w) * max)}px`, width: `${max}px` }
    : { height: `${max}px`, width: `${Math.round((w / h) * max)}px` };
}

function pick(value: string) {
  open.value = false;
  emit('update:value', value);
}
</script>

<template>
  <Popover v-model:open="open" placement="topLeft" trigger="click">
    <button class="param-chip" type="button">
      <span class="param-chip__label">比例</span>
      <b>{{ currentLabel }}</b>
    </button>

    <template #content>
      <div class="ratio-grid">
        <button
          v-for="option in RATIO_OPTIONS"
          :key="option.value"
          class="ratio-item"
          :class="{ 'is-on': option.value === props.value }"
          type="button"
          @click="pick(option.value)"
        >
          <span class="ratio-item__box">
            <i :style="boxStyle(option.value)"></i>
          </span>
          <span>{{ option.label }}</span>
        </button>
      </div>
    </template>
  </Popover>
</template>

<style scoped lang="scss">
.param-chip {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.param-chip:hover {
  border-color: color-mix(in srgb, hsl(var(--primary)) 40%, transparent);
}

.param-chip__label {
  color: hsl(var(--muted-foreground));
}

.ratio-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  min-width: 320px;
}

.ratio-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 8px 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 1px solid transparent;
  border-radius: 8px;
}

.ratio-item:hover {
  background: hsl(var(--accent));
}

.ratio-item.is-on {
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
}

.ratio-item__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.ratio-item__box i {
  display: block;
  border: 1.5px solid currentColor;
  border-radius: 2px;
}
</style>
