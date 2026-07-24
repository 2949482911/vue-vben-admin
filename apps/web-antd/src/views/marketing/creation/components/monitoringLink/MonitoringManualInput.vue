<script setup lang="ts" name="MonitoringManualInput">
// 监测链接手动输入组件 - 供后续全媒体批投公用
import type { MonitoringLinkType } from '#/views/marketing/creation/creation';
import { Input, Space } from 'ant-design-vue';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: MonitoringLinkType;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: MonitoringLinkType];
}>();

const clickLink = computed({
  get: () => props.modelValue.clickLink,
  set: (val: string) => {
    emit('update:modelValue', { ...props.modelValue, clickLink: val });
  }
});

const exposureLink = computed({
  get: () => props.modelValue.exposureLink,
  set: (val: string) => {
    emit('update:modelValue', { ...props.modelValue, exposureLink: val });
  }
});
</script>

<template>
  <Space direction="vertical" class="w-full" size="middle">
    <div class="link-item">
      <span class="label">点击链接</span>
      <Input
        v-model:value="clickLink"
        placeholder="请输入点击监测链接"
        allow-clear
      />
    </div>
    <div class="link-item">
      <span class="label">曝光链接</span>
      <Input
        v-model:value="exposureLink"
        placeholder="请输入曝光监测链接"
        allow-clear
      />
    </div>
  </Space>
</template>

<style scoped lang="scss">
.link-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .label {
    flex-shrink: 0;
    width: 70px;
    font-weight: 500;
  }
}
</style>
