<script lang="ts" setup name="TagDimensionChips">
import type { TagDimension } from '../appearanceTags';

import { computed } from 'vue';

import { message, Tag } from 'ant-design-vue';

import { useAssetTagDicts } from '../useAssetTagDicts';

const props = defineProps<{
  dimensions: TagDimension[];
  modelValue?: Record<string, any>;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>();

const { optionsOf, visible } = useAssetTagDicts();

const selected = computed(() => props.modelValue ?? {});
const shownDimensions = computed(() => visible(props.dimensions));

function isOn(dimension: TagDimension, value: string) {
  const current = selected.value[dimension.key];
  return Array.isArray(current)
    ? current.includes(value)
    : current === value;
}

function toggle(dimension: TagDimension, value: string) {
  const next = { ...selected.value };
  if (dimension.mode === 'single') {
    next[dimension.key] = next[dimension.key] === value ? '' : value;
    emit('update:modelValue', next);
    return;
  }
  const list: string[] = Array.isArray(next[dimension.key])
    ? [...next[dimension.key]]
    : [];
  const index = list.indexOf(value);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    if (dimension.max && list.length >= dimension.max) {
      message.warning(`${dimension.label}最多选 ${dimension.max} 个`);
      return;
    }
    list.push(value);
  }
  next[dimension.key] = list;
  emit('update:modelValue', next);
}

function labelOf(dimension: TagDimension) {
  return dimension.mode === 'multi' && dimension.max
    ? `${dimension.label}（≤${dimension.max}）`
    : dimension.label;
}
</script>

<template>
  <div v-if="shownDimensions.length" class="tag-dims">
    <div v-for="dimension in shownDimensions" :key="dimension.key" class="tag-dim">
      <span class="tag-dim__label">{{ labelOf(dimension) }}</span>
      <div class="tag-dim__chips">
        <Tag
          v-for="option in optionsOf(dimension)"
          :key="option.value"
          class="tag-chip"
          :class="{ 'is-on': isOn(dimension, option.value) }"
          :bordered="false"
          @click="toggle(dimension, option.value)"
        >
          {{ option.label }}
        </Tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tag-dims {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-dim {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.tag-dim__label {
  flex: none;
  width: 78px;
  padding-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.tag-dim__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  padding: 3px 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--accent));
  border: 1px solid transparent;
  border-radius: 999px;

  &:hover {
    color: hsl(var(--foreground));
    border-color: color-mix(in srgb, hsl(var(--primary)) 40%, transparent);
  }

  &.is-on {
    font-weight: 550;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
    border-color: color-mix(in srgb, hsl(var(--primary)) 45%, transparent);
  }
}
</style>
