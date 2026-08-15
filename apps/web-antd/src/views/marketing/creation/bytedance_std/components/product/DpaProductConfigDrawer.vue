<script setup lang="ts" name="DpaProductConfigDrawer">
/**
 * 智擎版-投放商品配置抽屉
 *
 * 支持两种分配规则：
 * - ALL_SAME：所有账户共用一个投放商品（Map key '0'）
 * - PER_ACCOUNT：每个账户一个投放商品（Map key = advertiserId），以 Tab 页逐账户编辑
 *
 * 保存通过抽屉底部「确定」按钮（onConfirm）完成，无需单独保存按钮。
 */
import { Badge, Empty, message, Radio, RadioGroup, Space, Tabs } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import DpaProductSelector
  from '#/views/marketing/creation/bytedance/components/DpaProductSelector.vue';
import type { BytedanceDpaProductListItem } from '#/api/models/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type {
  DpaProductConfigData,
  DpaProductConfigRule,
} from '#/views/marketing/creation/bytedance_std/bytedance';

const props = withDefaults(defineProps<{
  accountInfo: AccountInfo[];
}>(), {});

const emit = defineEmits(['update:dpaProductConfig']);

/** 分配规则选项 */
const ruleOptions: Array<{ label: string; value: DpaProductConfigRule }> = [
  { label: '统一配置（所有账户相同）', value: 'ALL_SAME' },
  { label: '按账户配置（每个账户可不同）', value: 'PER_ACCOUNT' },
];

/** 当前规则 */
const localMethod = ref<DpaProductConfigRule>('ALL_SAME');

/** 本地配置映射（编辑态） key → 商品 */
const localData = ref<Map<string, BytedanceDpaProductListItem[]>>(new Map());

/** 当前正在编辑的目标 key（与 Tabs 激活页同步） */
const currentKey = ref<string>('0');

/** Tabs 激活的 key */
const activeKey = ref<string>('0');

/** 当前编辑目标的已选商品 */
const currentProduct = ref<BytedanceDpaProductListItem | null>(null);

/** 账户列表（去重） */
const accountList = computed(() => {
  const seen = new Set<string>();
  return props.accountInfo.filter((a) => {
    const key = a.localAdvertiserId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

/** 指定 key 是否已选商品 */
function isConfigured(key: string) {
  return localData.value.has(key);
}

/** Tabs 子组件（antd 4.x 通过 Tabs.TabPane 使用） */
const TabPane = Tabs.TabPane;

// ==================== 配置与商品同步 ====================
/** 将当前选择保存到 localData[currentKey] */
function saveCurrent() {
  if (!currentKey.value) return;
  localData.value.set(
    currentKey.value,
    currentProduct.value ? [currentProduct.value] : [],
  );
}

/** 加载指定 key 的商品到编辑态（不保存当前） */
function applyKey(key: string) {
  currentKey.value = key;
  activeKey.value = key;
  currentProduct.value = localData.value.get(key)?.[0] || null;
}

/** 切换编辑目标（先保存当前） */
async function switchKey(key: string) {
  saveCurrent();
  applyKey(key);
}

/** 规则切换时重建编辑目标 */
watch(localMethod, async () => {
  saveCurrent();
  if (localMethod.value === 'PER_ACCOUNT') {
    applyKey(accountList.value[0]?.localAdvertiserId || '0');
  } else {
    applyKey('0');
  }
});

// ==================== Drawer ====================
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[800px]',
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData() as DpaProductConfigData | null;
    // 恢复已有配置到编辑态
    localData.value = new Map();
    if (data?.data) {
      const raw: Map<string, BytedanceDpaProductListItem[]> =
        data.data instanceof Map
          ? data.data
          : new Map<string, BytedanceDpaProductListItem[]>(Object.entries(data.data || {}));
      raw.forEach((list, key) => {
        if (list?.[0]) localData.value.set(key, list);
      });
    }
    // 恢复规则
    localMethod.value = data?.config?.method || 'ALL_SAME';
    // 加载默认编辑目标
    const initKey =
      localMethod.value === 'PER_ACCOUNT'
        ? accountList.value[0]?.localAdvertiserId || '0'
        : '0';
    applyKey(initKey);
  },
  async onConfirm() {
    saveCurrent();
    // 校验
    if (localMethod.value === 'PER_ACCOUNT') {
      const unconfigured = accountList.value.filter(
        (acc) => !localData.value.has(acc.localAdvertiserId),
      );
      if (unconfigured.length > 0) {
        message.warning(`还有 ${unconfigured.length} 个账户未选择投放商品`);
        return;
      }
    } else if (!localData.value.has('0')) {
      message.warning('请先选择投放商品');
      return;
    }
    emit('update:dpaProductConfig', {
      config: { method: localMethod.value },
      data: new Map(localData.value),
    });
    drawerApi.close();
  },
  onCancel() {
    drawerApi.close();
  },
});
</script>

<template>
  <Drawer title="投放商品配置">
    <!-- 分配规则 -->
    <Space direction="vertical" :size="8" class="mb-4 w-full">
      <span class="text-sm font-medium text-gray-500">分配方式：</span>
      <RadioGroup v-model:value="localMethod">
        <Space direction="vertical" :size="4">
          <Radio v-for="opt in ruleOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </Radio>
        </Space>
      </RadioGroup>
    </Space>

    <!-- PER_ACCOUNT：Tabs 逐账户编辑 -->
    <template v-if="localMethod === 'PER_ACCOUNT'">
      <Tabs
        v-if="accountList.length > 0"
        v-model:activeKey="activeKey"
        @change="(key) => switchKey(String(key))"
      >
        <TabPane v-for="acc in accountList" :key="acc.localAdvertiserId">
          <template #tab>
            <Space :size="4">
              <Badge
                :status="isConfigured(acc.localAdvertiserId) ? 'success' : 'warning'"
              />
              <span>
                {{ acc.localAdvertiserId }}
                <template v-if="acc.advertiserName">（{{ acc.advertiserName }}）</template>
              </span>
            </Space>
          </template>
        </TabPane>
      </Tabs>
      <Empty
        v-else
        description="请先在配置区选择媒体账户"
        class="py-10"
      />
    </template>

    <!-- ALL_SAME：统一配置说明 -->
    <div v-else class="mb-3 text-sm text-gray-500">所有账户将使用同一个投放商品：</div>

    <!-- 商品选择器（每个 Tab 共用，切换时自动保存并加载对应选择） -->
    <DpaProductSelector
      v-if="localMethod === 'ALL_SAME' || accountList.length > 0"
      :key="currentKey"
      :advertiser-ids="
        localMethod === 'PER_ACCOUNT'
          ? [currentKey]
          : accountList.map((a) => a.localAdvertiserId)
      "
      :initial-selected-product="currentProduct"
      @product-selected="(p) => (currentProduct = p)"
    />
  </Drawer>
</template>

<style scoped lang="scss"></style>
