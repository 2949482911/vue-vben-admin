<script setup lang="ts" name="DpaProductModal">
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import DpaProductSelector from './DpaProductSelector.vue';
import type { BytedanceDpaProductListItem } from '#/api/models/bytedance';

/** 已选商品（组件内部状态） */
const selectedProduct = ref<BytedanceDpaProductListItem | null>(null);

/** 弹窗初始化数据 */
const modalAdvertiserIds = ref<string[]>([]);
const modalInitialProduct = ref<BytedanceDpaProductListItem | null>(null);

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() || {};
      modalAdvertiserIds.value = data.advertiserIds || [];
      modalInitialProduct.value = data.initialProduct || null;
      selectedProduct.value = data.initialProduct || null;
    }
  },
  async onConfirm() {
    modalApi.setData({ selectedProduct: selectedProduct.value });
    modalApi.close();
  },
  onCancel() {
    modalApi.close();
  },
});

function handleProductSelected(product: BytedanceDpaProductListItem | null) {
  selectedProduct.value = product;
}
</script>

<template>
  <Modal title="选择投放商品" class="w-[700px]">
    <DpaProductSelector
      :advertiser-ids="modalAdvertiserIds"
      :initial-selected-product="modalInitialProduct"
      @product-selected="handleProductSelected"
    />
  </Modal>
</template>
