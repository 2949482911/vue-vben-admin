<script setup lang="ts" name="DpaProductConfigCard">
/**
 * 智擎版-投放商品配置卡片
 *
 * 投放商品分配规则配置入口（统一配置 / 按账户配置），
 * 点击添加/编辑打开 DpaProductConfigDrawer 按规则选择各账户投放商品。
 */
import { Alert, Button, Card, Space, Tag } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import type { BytedanceDpaProductListItem } from '#/api/models/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type {
  DpaProductConfigData,
  DpaProductConfigRule,
} from '#/views/marketing/creation/bytedance_std/bytedance';
import DpaProductConfigDrawer from './DpaProductConfigDrawer.vue';

const props = withDefaults(defineProps<{
  /** 允许 undefined：复用旧策略组数据可能缺少该配置 */
  dpaProductConfig?: DpaProductConfigData | null;
  accountInfo: AccountInfo[];
  /** 是否置灰禁止配置 */
  disabled?: boolean;
}>(), {
  disabled: false,
});

const emit = defineEmits(['update:dpaProductConfig']);

const [DpaProductConfigDrawerComp, drawerApi] = useVbenDrawer({
  connectedComponent: DpaProductConfigDrawer,
});

/** 本地投放商品配置副本 */
const localConfig = ref<DpaProductConfigData>({
  config: { method: 'ALL_SAME' },
  data: new Map(),
});

/** 分配规则文案 */
const methodLabelMap: Record<DpaProductConfigRule, string> = {
  ALL_SAME: '统一配置',
  PER_ACCOUNT: '按账户配置',
};

/** 当前分配方式文案 */
const methodLabel = computed(() => {
  return methodLabelMap[localConfig.value.config.method] || '未配置';
});

/** 已配置商品数量 */
const totalCount = computed(() => {
  let total = 0;
  localConfig.value.data.forEach((items) => {
    total += items.length;
  });
  return total;
});

/** 已配置商品概要（用于卡片展示） */
const productSummary = computed(() => {
  const names: string[] = [];
  localConfig.value.data.forEach((items) => {
    const first = items?.[0];
    if (first) names.push(first.name || first.title || `ID:${first.product_id}`);
  });
  return names;
});

/** 打开抽屉 */
function openDrawer() {
  drawerApi.setData({
    config: { method: localConfig.value.config.method },
    data: new Map(localConfig.value.data),
  });
  drawerApi.open();
}

/** 接收抽屉确认回调 */
function updateConfig(data: DpaProductConfigData) {
  localConfig.value = {
    config: { ...data.config },
    data: new Map(data.data),
  };
  emit('update:dpaProductConfig', {
    config: { ...localConfig.value.config },
    data: new Map(localConfig.value.data),
  });
}

/** 清空 */
function handleClear() {
  localConfig.value.data.clear();
  localConfig.value.config.method = 'ALL_SAME';
  emit('update:dpaProductConfig', {
    config: { method: 'ALL_SAME' },
    data: new Map(),
  });
}

/** 监听父组件传入配置变化，实现回显 */
watch(
  () => props.dpaProductConfig,
  (newVal) => {
    if (newVal && newVal.data) {
      const dataMap =
        newVal.data instanceof Map
          ? newVal.data
          : new Map<string, BytedanceDpaProductListItem[]>(
              Object.entries(newVal.data || {}),
            );
      localConfig.value = {
        config: { method: newVal.config?.method || 'ALL_SAME' },
        data: dataMap,
      };
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="dpa-product-config-card" :class="{ 'is-disabled': disabled }">
    <Card title="投放商品" class="h-full">
      <div class="flex h-full flex-col">
        <div class="flex-1">
          <template v-if="totalCount > 0">
            <Space :size="8" align="center">
              <Tag color="blue">{{ methodLabel }}</Tag>
              <span class="text-sm text-gray-500">共 {{ totalCount }} 个商品</span>
            </Space>
            <div class="mt-2 space-y-1">
              <div
                v-for="(name, idx) in productSummary"
                :key="idx"
                class="truncate text-xs text-gray-500"
              >
                · {{ name }}
              </div>
            </div>
          </template>
          <Alert v-else type="error" message="请配置投放商品" show-icon />
        </div>
        <div class="mt-4 flex justify-center">
          <Space :size="8">
            <Button v-if="totalCount > 0" type="link" danger :disabled="disabled" @click="handleClear">
              清空
            </Button>
            <Button type="primary" :disabled="disabled" @click="openDrawer">
              {{ totalCount > 0 ? '编辑' : '添加' }}
            </Button>
          </Space>
        </div>
      </div>
    </Card>

    <DpaProductConfigDrawerComp
      :account-info="accountInfo"
      @update:dpa-product-config="updateConfig"
    />
  </div>
</template>

<style scoped lang="scss">
.dpa-product-config-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  &.is-disabled {
    opacity: 0.5;
    filter: grayscale(1);
    pointer-events: none;
  }
}
</style>
