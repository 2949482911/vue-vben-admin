<script setup lang="ts" name="AwemeConfigCard">
/**
 * 抖音号配置卡片
 *
 * 三种模式均支持多选：统一配置 / 分账户配置 / 平均分配。
 */
import type { AccountInfo, AwemeConfigData } from '#/views/marketing/creation/creation';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Button, Card, Space, Tag } from 'ant-design-vue';

import AwemeConfigDrawer from './AwemeConfigDrawer.vue';
import {
  countAwemes,
  createEmptyAwemeConfig,
  normalizeAwemeConfig,
} from './types';

const props = withDefaults(
  defineProps<{
    accountInfo: AccountInfo[];
    awemeConfig?: AwemeConfigData | null;
    disabled?: boolean;
  }>(),
  {
    awemeConfig: null,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:awemeConfig': [value: AwemeConfigData];
}>();

const [AwemeConfigDrawerComp, awemeDrawerApi] = useVbenDrawer({
  connectedComponent: AwemeConfigDrawer,
});

const localAwemeConfig = ref<AwemeConfigData>(createEmptyAwemeConfig());

const methodLabelMap = {
  ALL_SAME: '统一配置',
  AVERAGE: '平均分配',
  PER_ACCOUNT: '分账户配置',
} as const;

const methodLabel = computed(
  () => methodLabelMap[localAwemeConfig.value.config.method] || '未配置',
);

const totalCount = computed(() => countAwemes(localAwemeConfig.value));

const awemeNames = computed(() => {
  const names: string[] = [];
  const seen = new Set<string>();
  localAwemeConfig.value.data.forEach((items) => {
    items.forEach((item) => {
      if (!seen.has(item.awemeName)) {
        seen.add(item.awemeName);
        names.push(item.awemeName);
      }
    });
  });
  return names;
});

const configuredAccounts = computed(() => {
  if (localAwemeConfig.value.config.method !== 'PER_ACCOUNT') {
    return props.accountInfo.length;
  }
  return props.accountInfo.filter(
    (account) =>
      (localAwemeConfig.value.data.get(account.localAdvertiserId)?.length ??
        0) > 0,
  ).length;
});

function openDrawer() {
  awemeDrawerApi.setData(normalizeAwemeConfig(localAwemeConfig.value));
  awemeDrawerApi.open();
}

function updateAwemeConfig(data: AwemeConfigData) {
  localAwemeConfig.value = normalizeAwemeConfig(data);
  emit('update:awemeConfig', {
    config: { ...localAwemeConfig.value.config },
    data: new Map(localAwemeConfig.value.data),
  });
}

function handleClear() {
  localAwemeConfig.value = createEmptyAwemeConfig();
  emit('update:awemeConfig', createEmptyAwemeConfig());
}

watch(
  () => props.awemeConfig,
  (value) => {
    localAwemeConfig.value = normalizeAwemeConfig(value);
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="aweme-config-card" :class="{ 'is-disabled': disabled }">
    <Card title="抖音号配置" class="h-full">
      <div class="flex h-full flex-col">
        <div class="flex-1">
          <template v-if="totalCount > 0">
            <Space :size="8" wrap>
              <Tag color="blue">{{ methodLabel }}</Tag>
              <span class="text-sm text-gray-500">
                共 {{ totalCount }} 个抖音号
              </span>
              <span
                v-if="localAwemeConfig.config.method === 'PER_ACCOUNT'"
                class="text-sm text-gray-500"
              >
                · 覆盖 {{ configuredAccounts }} / {{ accountInfo.length }} 个账户
              </span>
              <span
                v-else-if="localAwemeConfig.config.method === 'AVERAGE'"
                class="text-sm text-gray-500"
              >
                · 按计划平均分配
              </span>
              <span v-else class="text-sm text-gray-500">
                · 全部账户/计划共用
              </span>
            </Space>
            <div class="aweme-tags">
              <Tag
                v-for="name in awemeNames.slice(0, 3)"
                :key="name"
                :bordered="false"
                color="blue"
              >
                {{ name }}
              </Tag>
              <Tag v-if="awemeNames.length > 3" :bordered="false">
                +{{ awemeNames.length - 3 }}
              </Tag>
            </div>
          </template>
          <Alert v-else type="error" message="请配置抖音号" show-icon />
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

    <AwemeConfigDrawerComp
      :account-info="accountInfo"
      @update:aweme-config="updateAwemeConfig"
    />
  </div>
</template>

<style scoped lang="scss">
.aweme-config-card {
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

.aweme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
</style>
