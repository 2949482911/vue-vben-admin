<script setup lang="ts" name="DpaProductButtonField">
import { type PropType } from 'vue';
import { Button, Tag } from 'ant-design-vue';
import type { BytedanceDpaProductListItem } from '#/api/models/bytedance';

const props = defineProps({
  /** 由 Drawer 的 onOpenChange 动态注入 - 响应式商品信息 */
  dpaContext: {
    type: Object as PropType<{
      selectedProduct: BytedanceDpaProductListItem | null;
    }>,
    default: null,
  },
  /** 由 Drawer 的 onOpenChange 动态注入 - 打开商品选择弹窗 */
  openDpaModal: {
    type: Function as PropType<() => void>,
    default: null,
  },
});

function handleClick() {
  props.openDpaModal?.();
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button type="primary" @click="handleClick">
      {{ dpaContext?.selectedProduct ? '重新选择商品' : '选择投放商品' }}
    </Button>
    <Tag v-if="dpaContext?.selectedProduct" color="blue">
      {{ dpaContext.selectedProduct.name }}
    </Tag>
  </div>
</template>
