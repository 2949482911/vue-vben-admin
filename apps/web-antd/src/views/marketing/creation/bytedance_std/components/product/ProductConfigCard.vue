<script setup lang="ts" name="ProductConfigCard">
/**
 * 智擎版-产品配置卡片
 *
 * 产品信息分配规则配置入口（统一配置 / 按账户配置 / 按项目配置），
 * 点击添加/编辑打开 ProductConfigDrawer 配置产品名称、卖点、行动号召、产品主图。
 */
import { Alert, Button, Card, Space, Tag } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import type { AccountInfo } from '#/views/marketing/creation/creation';
import type {
  ProductConfigData,
  ProductConfigRule,
  ProductDataMapping,
} from '#/views/marketing/creation/bytedance_std/bytedance';
import ProductConfigDrawer from './ProductConfigDrawer.vue';

const props = withDefaults(defineProps<{
  /** 允许 undefined：复用旧策略组数据可能缺少该配置 */
  productConfig?: ProductConfigData | null;
  accountInfo: AccountInfo[];
  /** 是否置灰禁止配置 */
  disabled?: boolean;
}>(), {
  disabled: false,
});

const emit = defineEmits(['update:productConfig']);

const [ProductConfigDrawerComp, drawerApi] = useVbenDrawer({
  connectedComponent: ProductConfigDrawer,
});

/** 本地产品配置副本 */
const localConfig = ref<ProductConfigData>({
  config: { method: 'ALL_SAME' },
  data: new Map(),
});

/** 分配规则文案 */
const methodLabelMap: Record<ProductConfigRule, string> = {
  ALL_SAME: '统一配置',
  PER_ACCOUNT: '按账户配置',
  PER_PROJECT: '按项目配置',
};

/** 当前分配方式文案 */
const methodLabel = computed(() => {
  return methodLabelMap[localConfig.value.config.method] || '未配置';
});

/** 已配置产品数量（映射单元数） */
const totalCount = computed(() => {
  let total = 0;
  localConfig.value.data.forEach((items) => {
    total += items.length;
  });
  return total;
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
function updateConfig(data: ProductConfigData) {
  localConfig.value = {
    config: { ...data.config },
    data: new Map(data.data),
  };
  emit('update:productConfig', {
    config: { ...localConfig.value.config },
    data: new Map(localConfig.value.data),
  });
}

/** 清空 */
function handleClear() {
  localConfig.value.data.clear();
  localConfig.value.config.method = 'ALL_SAME';
  emit('update:productConfig', {
    config: { method: 'ALL_SAME' },
    data: new Map(),
  });
}

/** 监听父组件传入配置变化，实现回显 */
watch(
  () => props.productConfig,
  (newVal) => {
    if (newVal && newVal.data) {
      const dataMap =
        newVal.data instanceof Map
          ? newVal.data
          : new Map<string, ProductDataMapping[]>(Object.entries(newVal.data || {}));
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
  <div class="product-config-card" :class="{ 'is-disabled': disabled }">
    <Card title="产品配置" class="h-full">
      <div class="flex h-full flex-col">
        <div class="flex-1">
          <Space v-if="totalCount > 0" :size="8" align="center">
            <Tag color="blue">{{ methodLabel }}</Tag>
            <span class="text-sm text-gray-500">共 {{ totalCount }} 个产品配置</span>
          </Space>
          <Alert v-else type="error" message="请配置产品信息" show-icon />
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

    <ProductConfigDrawerComp
      :account-info="accountInfo"
      @update:product-config="updateConfig"
    />
  </div>
</template>

<style scoped lang="scss">
.product-config-card {
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
