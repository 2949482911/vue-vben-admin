<script lang="ts" setup name="StoryboardGenerateButton">
/**
 * 生成分镜按钮：剧本未定稿或校验有误时置灰，并通过 Tooltip 说明原因。
 * 上游是创作台头部与分镜工具栏，两处共用同一门禁文案。
 */
import { PlayCircleOutlined } from '@ant-design/icons-vue';
import { Button, Tooltip } from 'ant-design-vue';

const props = defineProps<{
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  reason?: string;
  size?: 'middle' | 'small';
}>();
const emit = defineEmits<{ blocked: []; click: [] }>();

function handleClick() {
  if (props.disabled) {
    emit('blocked');
    return;
  }
  emit('click');
}
</script>

<template>
  <Tooltip :title="disabled ? reason : undefined">
    <span class="storyboard-generate">
      <Button
        :aria-disabled="disabled"
        :class="{ 'is-gated': disabled }"
        :loading="loading"
        :size="size || 'middle'"
        @click="handleClick"
      >
        <template #icon><PlayCircleOutlined /></template>{{ label || '生成分镜' }}
      </Button>
    </span>
  </Tooltip>
</template>

<style scoped lang="scss">
.storyboard-generate {
  display: inline-flex;
}

.is-gated {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
