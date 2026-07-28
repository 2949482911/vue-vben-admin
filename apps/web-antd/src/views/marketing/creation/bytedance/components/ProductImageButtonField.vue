<script setup lang="ts" name="ProductImageButtonField">
/**
 * 产品主图选择按钮组件
 * - 打开素材选择器（仅图片、多选）
 * - 显示已选图片数量
 * - 实现 v-model：modelValue 为已选图片 ID 数组，由 form 系统管理值
 */
import { computed } from 'vue';
import { Button, Tag } from 'ant-design-vue';

const props = defineProps({
  /** v-model：已选图片 ID 列表（由 form 系统管理） */
  modelValue: {
    type: Array as () => string[],
    default: () => [],
  },
  /** 打开素材选择器回调（由 Drawer 通过 componentProps 注入） */
  openProductImageModal: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

/** 安全的已选数量：防御 modelValue 非数组的情况（如被污染为 string 时不会错误显示数字） */
const safeCount = computed(() => {
  const v = props.modelValue;
  return Array.isArray(v) ? v.length : 0;
});

function handleClick() {
  props.openProductImageModal?.();
}
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    <Button type="primary" @click="handleClick">
      {{ safeCount ? '重新选择主图' : '选择产品主图' }}
    </Button>
    <Tag v-if="safeCount" color="green">
      已选 {{ safeCount }} 张主图
    </Tag>
  </div>
</template>
