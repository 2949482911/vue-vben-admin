<script lang="ts" setup name="AspectRatioPicker">
/**
 * 分镜页画面比例选择器：默认取小说预设，允许当前页临时覆盖。
 * 覆盖值只传给本页生成请求，不写回 novel.aspect_ratio。
 */
import { computed } from 'vue';

import { Select } from 'ant-design-vue';

import { ASPECT_RATIO_OPTIONS } from '../useNovelLifecycle';

const props = defineProps<{ preset?: string }>();
const ratio = defineModel<string>({ default: '9:16' });
const isOverride = computed(
  () => Boolean(props.preset) && ratio.value !== props.preset,
);
</script>

<template>
  <div class="ratio-picker">
    <span>画面比例</span>
    <Select
      v-model:value="ratio"
      :options="ASPECT_RATIO_OPTIONS"
      size="small"
      style="width: 112px"
    />
    <span :class="{ 'is-override': isOverride }">
      {{ isOverride ? `本次覆盖（默认 ${preset}）` : '小说默认' }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.ratio-picker {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  .is-override {
    color: hsl(var(--warning));
  }
}
</style>
