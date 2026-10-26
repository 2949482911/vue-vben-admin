<script lang="ts" setup name="SegTabs">
/**
 * 分段控件（胶囊样式 + 可选计数）
 *
 * 「素材库 / 资产」页面级切换与库内筛选（全部/图片/视频/音频、角色/场景/分集）共用。
 * antd Segmented 无法承载「选中态白底计数徽标」的原型样式，故独立实现。
 */
const props = withDefaults(
  defineProps<{
    modelValue: any;
    options: Array<{ count?: number; label: string; value: any }>;
    size?: 'md' | 'sm';
  }>(),
  { size: 'md' },
);

const emit = defineEmits<{ 'update:modelValue': [value: any] }>();
</script>

<template>
  <div class="seg-tabs" :class="`seg-tabs--${props.size}`" role="tablist">
    <button
      v-for="option in props.options"
      :key="option.value"
      :aria-selected="option.value === props.modelValue"
      class="seg"
      :class="{ 'is-active': option.value === props.modelValue }"
      role="tab"
      type="button"
      @click="emit('update:modelValue', option.value)"
    >
      <span>{{ option.label }}</span>
      <span v-if="option.count !== undefined" class="seg-count">
        {{ option.count }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.seg-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 11px;
}

.seg-tabs--sm {
  border-radius: 999px;
}

.seg {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 8px;
}

.seg-tabs--sm .seg {
  border-radius: 999px;
}

.seg:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--accent));
}

.seg.is-active {
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(187 78% 38%));
}

.seg-count {
  display: inline-flex;
  align-items: center;
  height: 17px;
  padding: 0 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  border-radius: 999px;
}

.seg.is-active .seg-count {
  color: hsl(var(--primary));
  background: rgb(255 255 255 / 88%);
}
</style>
