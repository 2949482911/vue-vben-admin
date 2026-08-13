<script setup lang="ts" name="ProductConfigDrawer">
/**
 * 智擎版-产品配置抽屉
 *
 * 支持三种分配规则：
 * - ALL_SAME：所有账户/项目共用一个产品配置（Map key '0'）
 * - PER_ACCOUNT：每个账户一个产品配置（Map key = advertiserId），以 Tab 页逐账户编辑
 * - PER_PROJECT：所有项目共用一个产品配置（Map key '0'）
 *
 * 单个产品配置（ProductDataMapping）：产品名称/产品卖点/行动号召/产品主图
 * 保存通过抽屉底部「确定」按钮（onConfirm）完成，无需单独保存按钮。
 */
import {
  Badge,
  Empty,
  message,
  Radio,
  RadioGroup,
  Space,
  Tabs,
} from 'ant-design-vue';
import { computed, markRaw, ref, watch } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import ProductImageButtonField
  from '#/views/marketing/creation/bytedance/components/ProductImageButtonField.vue';
import MaterialSelector
  from '#/views/marketing/creation/components/material/MaterialSelector.vue';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type {
  ProductConfigData,
  ProductConfigRule,
  ProductDataMapping,
} from '#/views/marketing/creation/bytedance_std/bytedance';

const props = withDefaults(defineProps<{
  accountInfo: AccountInfo[];
}>(), {});

const emit = defineEmits(['update:productConfig']);

/** 分配规则选项 */
const ruleOptions: Array<{ label: string; value: ProductConfigRule }> = [
  { label: '统一配置（所有账户/项目相同）', value: 'ALL_SAME' },
  { label: '按账户配置（每个账户可不同）', value: 'PER_ACCOUNT' },
  { label: '按项目配置（所有项目相同）', value: 'PER_PROJECT' },
];

/** 当前规则 */
const localMethod = ref<ProductConfigRule>('ALL_SAME');

/** 本地配置映射（编辑态） key → ProductDataMapping */
const localMapping = ref<Map<string, ProductDataMapping>>(new Map());

/** 当前正在编辑的目标 key（与 Tabs 激活页同步） */
const currentKey = ref<string>('0');

/** Tabs 激活的 key */
const activeKey = ref<string>('0');

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

/** 指定 key 是否已配置 */
function isConfigured(key: string) {
  return localMapping.value.has(key);
}

/** Tabs 子组件（antd 4.x 通过 Tabs.TabPane 使用） */
const TabPane = Tabs.TabPane;

// ==================== 产品信息编辑表单 ====================
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'TextareaTags',
      fieldName: 'titles',
      label: '产品名称',
      rules: 'required',
      componentProps: { placeholder: '请输入产品名称，回车添加', maxLength: 20 },
    },
    {
      component: 'TextareaTags',
      fieldName: 'selling_points',
      label: '产品卖点',
      componentProps: { placeholder: '请输入产品卖点，回车添加（6-9字）', minLength: 6, maxLength: 9 },
    },
    {
      component: 'TextareaTags',
      fieldName: 'action_buttons',
      label: '行动号召',
      componentProps: { placeholder: '请输入行动号召按钮文案，回车添加（2-4字）', minLength: 2, maxLength: 4 },
    },
    {
      component: markRaw(ProductImageButtonField),
      fieldName: 'image_button',
      label: '产品主图',
      rules: 'required',
      componentProps: { openProductImageModal: () => openProductImageModal() },
    },
  ],
});

// ==================== 产品主图素材选择 ====================
const [ProductImageModal, productImageModalApi] = useVbenModal({
  connectedComponent: MaterialSelector,
});

async function openProductImageModal() {
  const current = await formApi.getValues();
  productImageModalApi.setData({
    materialType: 'image',
    preSelectedIds: Array.isArray(current.image_button) ? current.image_button : [],
  });
  productImageModalApi.open();
}

function onProductImageSelected(selectedMaterials: Array<{ id: string; name: string }>) {
  const imageIds = selectedMaterials.map((m) => String(m.id));
  formApi.setValues({ image_button: imageIds });
}

// ==================== 表单与映射同步 ====================
/** 将当前表单值保存到 localMapping[currentKey] */
async function saveCurrent() {
  if (!currentKey.value) return;
  const values = await formApi.getValues();
  localMapping.value.set(currentKey.value, {
    titles: values.titles || [],
    selling_points: values.selling_points || [],
    action_buttons: values.action_buttons || [],
    image_button: values.image_button || [],
  });
}

/** 加载指定 key 的配置到表单（不保存当前） */
async function applyKey(key: string) {
  currentKey.value = key;
  activeKey.value = key;
  const m = localMapping.value.get(key);
  await formApi.setValues({
    titles: m?.titles || [],
    selling_points: m?.selling_points || [],
    action_buttons: m?.action_buttons || [],
    image_button: m?.image_button || [],
  });
}

/** 切换编辑目标（先保存当前） */
async function switchKey(key: string) {
  await saveCurrent();
  await applyKey(key);
}

/** 规则切换时重建编辑目标 */
const initializing = ref(false);
watch(localMethod, (method) => {
  if (initializing.value) return;
  if (method === 'PER_ACCOUNT') {
    applyKey(accountList.value[0]?.localAdvertiserId || '0');
  } else {
    applyKey('0');
  }
});

// ==================== Drawer ====================
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[75%]',
  closeOnPressEscape: true,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) return;
    const data = drawerApi.getData() as ProductConfigData;
    // 恢复已有配置到编辑态
    localMapping.value = new Map();
    if (data?.data) {
      const raw: Map<string, ProductDataMapping[]> =
        data.data instanceof Map
          ? data.data
          : new Map<string, ProductDataMapping[]>(Object.entries(data.data || {}));
      raw.forEach((items, key) => {
        if (items?.[0]) localMapping.value.set(key, items[0]);
      });
    }
    // 恢复规则（不触发 watch 的初始化副作用）
    initializing.value = true;
    localMethod.value = data?.config?.method || 'ALL_SAME';
    initializing.value = false;
    // 加载默认编辑目标
    const initKey =
      localMethod.value === 'PER_ACCOUNT'
        ? accountList.value[0]?.localAdvertiserId || '0'
        : '0';
    applyKey(initKey);
  },
  async onConfirm() {
    await saveCurrent();
    // 校验
    if (localMethod.value === 'PER_ACCOUNT') {
      const unconfigured = accountList.value.filter(
        (acc) => !localMapping.value.has(acc.localAdvertiserId),
      );
      if (unconfigured.length > 0) {
        message.warning(`还有 ${unconfigured.length} 个账户未配置产品信息`);
        return;
      }
    } else if (!localMapping.value.has('0')) {
      message.warning('请先配置产品信息');
      return;
    }
    // 组装结果
    const resultData = new Map<string, ProductDataMapping[]>();
    localMapping.value.forEach((mapping, key) => {
      resultData.set(key, [mapping]);
    });
    emit('update:productConfig', {
      config: { method: localMethod.value },
      data: resultData,
    });
    drawerApi.close();
  },
  onCancel() {
    drawerApi.close();
  },
});
</script>

<template>
  <Drawer title="产品配置">
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

    <!-- ALL_SAME / PER_PROJECT：单一配置说明 -->
    <div v-else class="mb-3 text-sm text-gray-500">
      {{ localMethod === 'ALL_SAME' ? '所有账户/项目' : '所有项目' }}将使用同一个产品配置：
    </div>

    <!-- 产品信息编辑表单（Tabs 每个 Tab 共用，切换时自动保存并加载对应配置） -->
    <Form />

    <!-- 产品主图素材选择器 -->
    <ProductImageModal @update:material="onProductImageSelected" />
  </Drawer>
</template>

<style scoped lang="scss"></style>
