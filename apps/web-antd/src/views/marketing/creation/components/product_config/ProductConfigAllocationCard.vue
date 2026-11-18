<script setup lang="ts" name="ProductConfigAllocationCard">
import type { ProductConfigAllocationConfig } from './types';

/**
 * 产品配置卡片
 *
 * 展示多条产品配置的分配摘要；具体配置与分配在共享抽屉内完成。
 */
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Button, Card, Space, Tag } from 'ant-design-vue';

import ProductConfigAllocationDrawer from './ProductConfigAllocationDrawer.vue';
import {
  countProductConfigs,
  createEmptyProductConfig,
  normalizeProductConfig,
} from './types';

const props = withDefaults(
  defineProps<{
    accountInfo: AccountInfo[];
    productConfig?: null | ProductConfigAllocationConfig;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
    productConfig: null,
  },
);

const emit = defineEmits<{
  'update:productConfig': [value: ProductConfigAllocationConfig];
}>();

const [ProductConfigDrawerComp, drawerApi] = useVbenDrawer({
  connectedComponent: ProductConfigAllocationDrawer,
});

const localConfig = ref<ProductConfigAllocationConfig>(
  createEmptyProductConfig(),
);

const methodLabelMap = {
  ALL_SAME: '统一配置',
  AVERAGE: '平均分配',
  PER_ACCOUNT: '分账户配置',
} as const;

const methodLabel = computed(
  () => methodLabelMap[localConfig.value.config.method] || '未配置',
);

const totalCount = computed(() => countProductConfigs(localConfig.value));

const configNames = computed(() => {
  const names: string[] = [];
  localConfig.value.data.forEach((items, key) => {
    items.forEach((item, index) => {
      const prefix = key === '0' ? '' : '账户配置 · ';
      names.push(
        `${prefix}${item.titles?.[0] || `配置项 ${index + 1}`}`,
      );
    });
  });
  return names;
});

const configuredAccounts = computed(() => {
  if (localConfig.value.config.method !== 'PER_ACCOUNT') {
    return props.accountInfo.length;
  }
  return props.accountInfo.filter(
    (account) =>
      (localConfig.value.data.get(account.localAdvertiserId)?.length ?? 0) > 0,
  ).length;
});

function openDrawer() {
  drawerApi.setData(normalizeProductConfig(localConfig.value));
  drawerApi.open();
}

function updateConfig(data: ProductConfigAllocationConfig) {
  localConfig.value = normalizeProductConfig(data);
  emit('update:productConfig', {
    config: { ...localConfig.value.config },
    data: new Map(localConfig.value.data),
  });
}

function handleClear() {
  localConfig.value = createEmptyProductConfig();
  emit('update:productConfig', createEmptyProductConfig());
}

watch(
  () => props.productConfig,
  (value) => {
    localConfig.value = normalizeProductConfig(value);
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="product-config-allocation-card" :class="{ 'is-disabled': disabled }">
    <Card title="产品配置" class="h-full">
      <div class="flex h-full flex-col">
        <div class="flex-1">
          <template v-if="totalCount > 0">
            <Space :size="8" wrap>
              <Tag color="blue">{{ methodLabel }}</Tag>
              <span class="text-sm text-gray-500">
                共 {{ totalCount }} 条配置
              </span>
              <span
                v-if="localConfig.config.method === 'PER_ACCOUNT'"
                class="text-sm text-gray-500"
              >
                · 覆盖 {{ configuredAccounts }} / {{ accountInfo.length }} 个账户
              </span>
              <span
                v-else-if="localConfig.config.method === 'AVERAGE'"
                class="text-sm text-gray-500"
              >
                · 按计划平均分配
              </span>
              <span v-else class="text-sm text-gray-500">
                · 全部账户/计划共用
              </span>
            </Space>
            <div class="config-tags">
              <Tag
                v-for="name in configNames.slice(0, 3)"
                :key="name"
                :bordered="false"
                color="blue"
              >
                {{ name }}
              </Tag>
              <Tag v-if="configNames.length > 3" :bordered="false">
                +{{ configNames.length - 3 }}
              </Tag>
            </div>
          </template>
          <Alert v-else type="error" message="请配置产品信息" show-icon />
        </div>
        <div class="card-footer">
          <Space :size="8">
            <Button
              v-if="totalCount > 0"
              :disabled="disabled"
              danger
              type="link"
              @click="handleClear"
            >
              清空
            </Button>
            <Button type="primary" :disabled="disabled" @click="openDrawer">
              {{ totalCount > 0 ? '编辑' : '添加' }}
            </Button>
          </Space>
        </div>
      </div>
    </Card>

    <ProductConfigDrawerComp
      :account-info="accountInfo"
      @update:product-config="updateConfig"
    />
  </div>
</template>

<style scoped lang="scss">
.product-config-allocation-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;

  &.is-disabled {
    opacity: 0.5;
    filter: grayscale(1);
    pointer-events: none;
  }
}

.config-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
</style>
