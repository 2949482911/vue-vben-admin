<script setup lang="ts" name="UnitProductButtonField">
import type { UnitSelectedProduct } from '../bytedance';

/**
 * 全域项目-投放商品选择
 *
 * 复用巨量 DPA 商品选择器（在线商品库/商品接口），选择结果以字符串 ID 对象回写表单，
 * 用于项目参数和 JSON 回显；提交前由 convertToPreviewData 转换为 related_product。
 */
import type { BytedanceDpaProductListItem } from '#/api/models/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Button, message, Space, Tag } from 'ant-design-vue';

import DpaProductSelector
  from '#/views/marketing/creation/bytedance/components/DpaProductSelector.vue';

const props = defineProps<{
  /** 账户信息在表单打开后仍会变化，用 getter 保证抽屉拿到最新值 */
  getAccountInfo?: () => AccountInfo[];
  modelValue?: null | UnitSelectedProduct;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: null | UnitSelectedProduct];
}>();

type PickedProductIds = {
  product_id: string;
  product_platform_id: string;
  unique_product_id: string;
};

const selected = computed(() => props.modelValue ?? null);

const displayLabel = computed(() => {
  const value = selected.value;
  if (!value) {
    return '';
  }
  return value.name || value.title || `商品 ${value.product_id}`;
});

const displayIds = computed(() => {
  const value = selected.value;
  if (!value) {
    return '';
  }
  return `商品库 ${value.product_platform_id} / 商品 ${value.product_id}`;
});

const accountIds = computed(() =>
  (props.getAccountInfo?.() ?? [])
    .map((account) => account.localAdvertiserId)
    .filter(Boolean),
);

const drawerOpen = ref(false);
const pickedIds = ref<null | PickedProductIds>(null);
const pickedProduct = ref<BytedanceDpaProductListItem | null>(null);

const initialProduct = computed(() => toDpaProduct(props.modelValue));

function toDpaProduct(
  value?: null | UnitSelectedProduct,
): BytedanceDpaProductListItem | null {
  if (!value) {
    return null;
  }
  return {
    image_url: value.image_url || '',
    name: value.name || '',
    platform_id: Number(value.product_platform_id),
    product_id: Number(value.product_id),
    status: 1,
    title: value.title || value.name || '',
  } as BytedanceDpaProductListItem;
}

function toSelection(product: BytedanceDpaProductListItem): UnitSelectedProduct {
  return {
    image_url: product.image_url,
    name: product.name,
    product_id: Number(product.product_id),
    product_platform_id: Number(product.platform_id),
    title: product.title,
  };
}

function resetPickedState() {
  const value = props.modelValue;
  pickedIds.value = value
    ? {
        product_id: String(value.product_id),
        product_platform_id: String(value.product_platform_id),
        unique_product_id: String(value.product_id),
      }
    : null;
  pickedProduct.value = toDpaProduct(value);
}

watch(pickedIds, (value) => {
  if (!value) {
    pickedProduct.value = null;
  }
});

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[800px]',
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    if (pickedProduct.value) {
      emit('update:modelValue', toSelection(pickedProduct.value));
    } else if (pickedIds.value) {
      emit('update:modelValue', {
        product_id: Number(pickedIds.value.product_id),
        product_platform_id: Number(pickedIds.value.product_platform_id),
      });
    } else {
      message.warning('请先选择投放商品');
      return;
    }
    await drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    drawerOpen.value = isOpen;
    if (isOpen) {
      resetPickedState();
    }
  },
});

function openDrawer() {
  drawerApi.open();
}

function onProductSelected(product: BytedanceDpaProductListItem | null) {
  pickedProduct.value = product;
}

function onIdsChange(value: null | PickedProductIds) {
  pickedIds.value = value;
}
</script>

<template>
  <div class="unit-product-field">
    <Space :size="8" wrap>
      <Button type="primary" ghost @click="openDrawer">
        {{ selected ? '重新选择商品' : '选择商品' }}
      </Button>
      <Tag v-if="selected" color="blue">{{ displayLabel }}</Tag>
    </Space>
    <div v-if="selected" class="mt-1 text-xs text-gray-400">
      {{ displayIds }}
    </div>

    <Drawer title="选择投放商品">
      <Alert
        v-if="accountIds.length === 0"
        class="mb-3"
        message="请先在左侧配置区选择媒体账户，再查询商品库"
        show-icon
        type="warning"
      />
      <DpaProductSelector
        v-if="drawerOpen"
        :model-value="pickedIds ?? undefined"
        :advertiser-ids="accountIds"
        :initial-selected-product="initialProduct"
        @product-selected="onProductSelected"
        @update:model-value="onIdsChange"
      />
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.unit-product-field {
  width: 100%;
}
</style>
