<script setup lang="ts" name="DpaProductAllocationCard">
import type { DpaProductAllocationConfig } from './types';

/**
 * 巨量投放商品配置卡片
 *
 * 只负责展示分配摘要和打开共享配置抽屉；实际商品分配由创建对象中的 dpaProductConfig 决定。
 */
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Button, Card, Space, Tag } from 'ant-design-vue';

import DpaProductAllocationDrawer from './DpaProductAllocationDrawer.vue';
import {
  countDpaProducts,
  createEmptyDpaProductConfig,
  normalizeDpaProductConfig,
} from './types';

const props = withDefaults(
  defineProps<{
    accountInfo: AccountInfo[];
    dpaProductConfig?: DpaProductAllocationConfig | null;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
    dpaProductConfig: null,
  },
);

const emit = defineEmits<{
  'update:dpaProductConfig': [value: DpaProductAllocationConfig];
}>();

const [DpaProductAllocationDrawerComp, drawerApi] = useVbenDrawer({
  connectedComponent: DpaProductAllocationDrawer,
});

const localConfig = ref<DpaProductAllocationConfig>(
  createEmptyDpaProductConfig(),
);

const methodLabelMap = {
  ALL_SAME: '统一配置',
  AVERAGE: '平均分配',
  PER_ACCOUNT: '分账户配置',
} as const;

const methodLabel = computed(
  () => methodLabelMap[localConfig.value.config.method] || '未配置',
);

const totalCount = computed(() => countDpaProducts(localConfig.value));

const productNames = computed(() => {
  const names: string[] = [];
  const seen = new Set<string>();
  localConfig.value.data.forEach((items) => {
    items.forEach((product) => {
      const name = product.name || product.title || `ID:${product.product_id}`;
      if (!seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
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
  drawerApi.setData(normalizeDpaProductConfig(localConfig.value));
  drawerApi.open();
}

function updateConfig(data: DpaProductAllocationConfig) {
  localConfig.value = normalizeDpaProductConfig(data);
  emit('update:dpaProductConfig', {
    config: { ...localConfig.value.config },
    data: new Map(localConfig.value.data),
  });
}

function handleClear() {
  localConfig.value = createEmptyDpaProductConfig();
  emit('update:dpaProductConfig', createEmptyDpaProductConfig());
}

watch(
  () => props.dpaProductConfig,
  (value) => {
    localConfig.value = normalizeDpaProductConfig(value);
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="dpa-product-card" :class="{ 'is-disabled': disabled }">
    <Card title="投放商品" class="h-full">
      <div class="flex h-full flex-col">
        <div class="flex-1">
          <template v-if="totalCount > 0">
            <Space :size="8" wrap>
              <Tag color="blue">{{ methodLabel }}</Tag>
              <span class="text-sm text-gray-500">
                共 {{ totalCount }} 个商品
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
            <div class="product-tags">
              <Tag
                v-for="name in productNames.slice(0, 3)"
                :key="name"
                :bordered="false"
                color="blue"
              >
                {{ name }}
              </Tag>
              <Tag v-if="productNames.length > 3" :bordered="false">
                +{{ productNames.length - 3 }}
              </Tag>
            </div>
          </template>
          <Alert v-else type="error" message="请配置投放商品" show-icon />
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

    <DpaProductAllocationDrawerComp
      :account-info="accountInfo"
      @update:dpa-product-config="updateConfig"
    />
  </div>
</template>

<style scoped lang="scss">
.dpa-product-card {
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

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
</style>
