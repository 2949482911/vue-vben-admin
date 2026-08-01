<script setup lang="ts" name="AwemeConfigCard">
// 抖音号配置选择组件 —— 巨量通用（bytedance / bytedance_std 共用）
// 支持 disabled 置灰：当项目投放身份不是抖音号（native_type != AWEME）时禁止配置
import type { AccountInfo, AwemeConfigData, AwemeDistributionRule, AwemeMapping } from '#/views/marketing/creation/creation';
import { Alert, Button, Card } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import { computed, ref, watch } from 'vue';
import AwemeConfigShow from './AwemeConfigShow.vue';
import AwemeConfigDrawer from './AwemeConfigDrawer.vue';

const props = withDefaults(defineProps<{
  /** 允许 undefined：复用旧策略组数据可能缺少该配置 */
  awemeConfig?: AwemeConfigData | null;
  accountInfo: AccountInfo[];
  /** 是否置灰禁止配置（项目投放身份非抖音号时） */
  disabled?: boolean;
  /** 支持的分配方案，默认全部（智擎版仅传 ['PER_PROJECT', 'PER_ACCOUNT']） */
  supportedRules?: AwemeDistributionRule[];
}>(), {
  disabled: false,
  supportedRules: () => ['ALL_SAME', 'PER_ACCOUNT', 'PER_PROJECT', 'PER_AD'],
});

const emit = defineEmits(['update:awemeConfig']);

const [AwemeConfigDrawerComp, awemeDrawerApi] = useVbenDrawer({
  connectedComponent: AwemeConfigDrawer,
});

/** 默认分配方式（取当前配置中受支持的，否则用第一个受支持项） */
const defaultMethod = computed<AwemeDistributionRule>(() => {
  const current = props.awemeConfig?.config?.method;
  if (!current) return props.supportedRules[0] || 'ALL_SAME';
  return props.supportedRules.includes(current)
    ? current
    : props.supportedRules[0] || 'ALL_SAME';
});

/** 本地抖音号配置副本 */
const localAwemeConfig = ref<AwemeConfigData>({
  config: { method: defaultMethod.value },
  data: new Map(),
});

/** 总分配数 */
const totalCount = computed(() => {
  let total = 0;
  localAwemeConfig.value.data.forEach((items) => {
    total += items.length;
  });
  return total;
});

/** 打开抽屉 */
function openDrawer() {
  awemeDrawerApi.setData({
    config: { method: localAwemeConfig.value.config.method },
    data: new Map(localAwemeConfig.value.data),
  });
  awemeDrawerApi.open();
}

/** 接收抽屉确认回调 */
function updateAwemeConfig(data: AwemeConfigData) {
  localAwemeConfig.value = {
    config: { ...data.config },
    data: new Map(data.data),
  };
  emit('update:awemeConfig', {
    config: { ...localAwemeConfig.value.config },
    data: new Map(localAwemeConfig.value.data),
  });
}

/** 清空 */
function handleClear() {
  localAwemeConfig.value.data.clear();
  localAwemeConfig.value.config.method = defaultMethod.value;
  emit('update:awemeConfig', {
    config: { method: defaultMethod.value },
    data: new Map(),
  });
}

/** 监听父组件传入配置变化，实现回显 */
watch(
  () => props.awemeConfig,
  (newVal) => {
    if (newVal && newVal.data) {
      const dataMap = newVal.data instanceof Map
        ? newVal.data
        : new Map<string, AwemeMapping[]>(Object.entries(newVal.data || {}));

      localAwemeConfig.value = {
        config: { method: defaultMethod.value },
        data: dataMap,
      };
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="aweme-config-selector-container" :class="{ 'is-disabled': disabled }">
    <Card title="抖音号配置" class="info-card">
      <div class="card-content">
        <template v-if="totalCount > 0">
          <AwemeConfigShow :aweme-config="localAwemeConfig" />
        </template>
        <template v-else>
          <Alert type="error" message="请配置抖音号" show-icon class="empty-alert" />
        </template>
      </div>
      <div class="card-footer">
        <Button v-if="totalCount > 0" type="link" danger :disabled="disabled" @click="handleClear">清空</Button>
        <Button type="primary" :disabled="disabled" @click="openDrawer">
          {{ totalCount > 0 ? '编辑' : '添加' }}
        </Button>
      </div>
    </Card>

    <AwemeConfigDrawerComp
      :account-info="accountInfo"
      :supported-rules="supportedRules"
      @update:aweme-config="updateAwemeConfig"
    />
  </div>
</template>

<style scoped lang="scss">
.aweme-config-selector-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &.is-disabled {
    opacity: 0.5;
    filter: grayscale(1);

    .info-card {
      pointer-events: none;
    }
  }
}

.info-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px;
  }

  :deep(.ant-card-body) {
    padding: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.empty-alert {
  margin: 8px 0;
}
</style>
