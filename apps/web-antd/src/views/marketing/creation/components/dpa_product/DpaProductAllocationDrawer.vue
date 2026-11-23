<script setup lang="ts" name="DpaProductAllocationDrawer">
import type {
  DpaProductAllocationConfig,
  DpaProductAllocationMethod,
} from './types';

/**
 * 巨量投放商品配置抽屉
 *
 * 商品选择与分配规则在同一个抽屉内完成：
 * - 统一配置：严格单选，所有账户/计划共用
 * - 分账户配置：每个账户多选，账户内计划循环使用
 * - 平均分配：全局多选，预览时按计划顺序循环铺开
 */
import type { BytedanceDpaProductAvailablesItem, BytedanceDpaProductListItem } from '#/api/models/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed, nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Input, message, Radio, RadioGroup, Select, Table, Tag } from 'ant-design-vue';

import { bytedanceAdvertisementApi } from '#/api';

import { normalizeDpaProductConfig } from './types';

const props = defineProps<{
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits<{
  'update:dpaProductConfig': [value: DpaProductAllocationConfig];
}>();

const MODE_OPTIONS: Array<{
  desc: string;
  label: string;
  value: DpaProductAllocationMethod;
}> = [
  {
    desc: '所有账户、所有计划共用同一个商品',
    label: '统一配置',
    value: 'ALL_SAME',
  },
  {
    desc: '每个账户可多选，账户下的计划循环使用',
    label: '分账户配置',
    value: 'PER_ACCOUNT',
  },
  {
    desc: '多选商品，生成预览时按计划平均分配',
    label: '平均分配',
    value: 'AVERAGE',
  },
];

const method = ref<DpaProductAllocationMethod>('ALL_SAME');
const allSameProducts = ref<BytedanceDpaProductListItem[]>([]);
const averageProducts = ref<BytedanceDpaProductListItem[]>([]);
const accountProducts = ref<Map<string, BytedanceDpaProductListItem[]>>(
  new Map(),
);
const currentAccountId = ref('');
const drawerOpen = ref(false);

const libraries = ref<BytedanceDpaProductAvailablesItem[]>([]);
const libraryId = ref<number | undefined>();
const products = ref<BytedanceDpaProductListItem[]>([]);
const productSearch = ref('');
const loadingLibraries = ref(false);
const loadingProducts = ref(false);

const accountIds = computed(() =>
  props.accountInfo
    .map((account) => account.localAdvertiserId)
    .filter(Boolean),
);

const contextAdvertiserIds = computed(() =>
  method.value === 'PER_ACCOUNT'
    ? currentAccountId.value
      ? [currentAccountId.value]
      : []
    : accountIds.value,
);

const currentAccount = computed(() =>
  props.accountInfo.find(
    (account) => account.localAdvertiserId === currentAccountId.value,
  ),
);

const activeProducts = computed(() => {
  if (method.value === 'ALL_SAME') {
    return allSameProducts.value;
  }
  if (method.value === 'AVERAGE') {
    return averageProducts.value;
  }
  return accountProducts.value.get(currentAccountId.value) ?? [];
});

const filteredProducts = computed(() => {
  const keyword = productSearch.value.trim().toLowerCase();
  if (!keyword) {
    return products.value;
  }
  return products.value.filter(
    (product) =>
      product.name?.toLowerCase().includes(keyword) ||
      product.title?.toLowerCase().includes(keyword) ||
      String(product.product_id).includes(keyword),
  );
});

const selectedKeys = computed(() =>
  activeProducts.value.map((product) => productKey(product)),
);

const rowSelection = computed(() => ({
  getCheckboxProps: (record: BytedanceDpaProductListItem) => ({
    disabled: record.status !== 1,
  }),
  onSelect: (record: BytedanceDpaProductListItem, selected: boolean) => {
    toggleProduct(record, selected);
  },
  onSelectAll: (
    selected: boolean,
    _rows: BytedanceDpaProductListItem[],
    changeRows: BytedanceDpaProductListItem[],
  ) => {
    toggleProducts(changeRows, selected);
  },
  selectedRowKeys: selectedKeys.value,
  type: method.value === 'ALL_SAME' ? ('radio' as const) : ('checkbox' as const),
}));

const previewPlans = computed(() => {
  const list = activeProducts.value;
  if (list.length === 0) {
    return [];
  }
  const count = method.value === 'PER_ACCOUNT' ? 4 : 6;
  return Array.from({ length: count }, (_, index) => ({
    name: `计划 ${String(index + 1).padStart(2, '0')}`,
    product: list[index % list.length]!,
  }));
});

const columns = [
  {
    key: 'image',
    title: '商品预览',
    width: 76,
  },
  {
    dataIndex: 'name',
    key: 'name',
    title: '商品名称',
    ellipsis: true,
  },
  {
    dataIndex: 'product_id',
    key: 'product_id',
    title: '商品ID',
    width: 180,
  },
  {
    key: 'status',
    title: '状态',
    width: 72,
  },
];

function productKey(product: BytedanceDpaProductListItem) {
  return `${product.platform_id}_${product.product_id}`;
}

function setActiveProducts(list: BytedanceDpaProductListItem[]) {
  if (method.value === 'ALL_SAME') {
    allSameProducts.value = list.slice(0, 1);
  } else if (method.value === 'AVERAGE') {
    averageProducts.value = list;
  } else if (currentAccountId.value) {
    accountProducts.value.set(currentAccountId.value, list);
  }
}

function toggleProduct(
  product: BytedanceDpaProductListItem,
  selected: boolean,
) {
  const key = productKey(product);
  const current = [...activeProducts.value];
  if (method.value === 'ALL_SAME') {
    setActiveProducts(selected ? [product] : []);
    return;
  }
  if (selected) {
    if (!current.some((item) => productKey(item) === key)) {
      current.push(product);
    }
  } else {
    const index = current.findIndex((item) => productKey(item) === key);
    if (index >= 0) {
      current.splice(index, 1);
    }
  }
  setActiveProducts(current);
}

function toggleProducts(
  rows: BytedanceDpaProductListItem[],
  selected: boolean,
) {
  for (const row of rows) {
    toggleProduct(row, selected);
  }
}

function removeProduct(product: BytedanceDpaProductListItem) {
  toggleProduct(product, false);
}

function productStatus(status: number) {
  if (status === 1) {
    return { color: 'green', text: '上架' };
  }
  if (status === 0) {
    return { color: 'default', text: '下架' };
  }
  return { color: 'red', text: '删除' };
}

function configuredCount(accountId: string) {
  return accountProducts.value.get(accountId)?.length ?? 0;
}

async function loadLibraries(preserveLibrary = false) {
  const previousLibraryId = preserveLibrary ? libraryId.value : undefined;
  productSearch.value = '';
  products.value = [];
  if (!preserveLibrary) {
    libraryId.value = undefined;
  }
  if (contextAdvertiserIds.value.length === 0) {
    libraries.value = [];
    libraryId.value = undefined;
    return;
  }
  loadingLibraries.value = true;
  try {
    libraries.value =
      (await bytedanceAdvertisementApi.fetchDpaProductAvailables({
        advertiserId: contextAdvertiserIds.value,
      })) || [];
    if (
      previousLibraryId &&
      libraries.value.some((item) => item.platform_id === previousLibraryId)
    ) {
      libraryId.value = previousLibraryId;
      await loadProducts();
    } else {
      libraryId.value = undefined;
    }
  } catch (error: any) {
    libraries.value = [];
    libraryId.value = undefined;
    message.error(error?.message || '获取商品库失败');
  } finally {
    loadingLibraries.value = false;
  }
}

async function loadProducts() {
  if (!libraryId.value || contextAdvertiserIds.value.length === 0) {
    products.value = [];
    return;
  }
  loadingProducts.value = true;
  try {
    products.value =
      (await bytedanceAdvertisementApi.fetchDpaProductList({
        advertiserId: contextAdvertiserIds.value,
        page: 1,
        pageSize: 50,
        productPlatformId: libraryId.value,
      })) || [];
  } catch (error: any) {
    products.value = [];
    message.error(error?.message || '获取商品列表失败');
  } finally {
    loadingProducts.value = false;
  }
}

function handleLibraryChange(value: unknown) {
  libraryId.value = value as number;
  loadProducts();
}

async function handleAccountChange(accountId: string) {
  currentAccountId.value = accountId;
  await loadLibraries(true);
}

watch(
  () => method.value,
  async () => {
    if (!drawerOpen.value) {
      return;
    }
    if (method.value === 'PER_ACCOUNT' && !currentAccountId.value) {
      currentAccountId.value = accountIds.value[0] ?? '';
    }
    await nextTick();
    await loadLibraries();
  },
);

const [Drawer, drawerApi] = useVbenDrawer<DpaProductAllocationConfig>({
  class: 'w-[75%]',
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    if (method.value === 'ALL_SAME' && allSameProducts.value.length === 0) {
      message.warning('请选择 1 个投放商品');
      return;
    }
    if (method.value === 'AVERAGE' && averageProducts.value.length === 0) {
      message.warning('请至少选择 1 个投放商品');
      return;
    }
    if (method.value === 'PER_ACCOUNT') {
      const unconfigured = props.accountInfo.filter(
        (account) => configuredCount(account.localAdvertiserId) === 0,
      );
      if (unconfigured.length > 0) {
        message.warning(
          `请为账户 [${unconfigured.map((account) => account.advertiserName).join('、')}] 选择商品`,
        );
        return;
      }
    }

    const data = new Map<string, BytedanceDpaProductListItem[]>();
    if (method.value === 'PER_ACCOUNT') {
      for (const account of props.accountInfo) {
        const list = accountProducts.value.get(account.localAdvertiserId) ?? [];
        if (list.length > 0) {
          data.set(account.localAdvertiserId, [...list]);
        }
      }
    } else {
      data.set(
        '0',
        method.value === 'ALL_SAME'
          ? [...allSameProducts.value]
          : [...averageProducts.value],
      );
    }

    emit('update:dpaProductConfig', {
      config: { method: method.value },
      data,
    });
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    drawerOpen.value = isOpen;
    if (!isOpen) {
      return;
    }
    const config = normalizeDpaProductConfig(drawerApi.getData());
    method.value = config.config.method;
    allSameProducts.value = [...(config.data.get('0') ?? [])].slice(0, 1);
    averageProducts.value =
      config.config.method === 'AVERAGE' ? [...(config.data.get('0') ?? [])] : [];
    accountProducts.value = new Map();
    config.data.forEach((list, key) => {
      if (key !== '0' && list.length > 0) {
        accountProducts.value.set(key, [...list]);
      }
    });
    currentAccountId.value = accountIds.value[0] ?? '';
    await nextTick();
    await loadLibraries();
  },
});
</script>

<template>
  <Drawer title="投放商品配置">
    <div class="dpa-drawer">
      <div class="mode-block">
        <div class="block-title">
          <span>配置方式</span>
          <span class="muted">切换方式只改变分配规则，已选商品与账户分配会重新校验</span>
        </div>
        <RadioGroup v-model:value="method" class="mode-grid">
          <Radio
            v-for="option in MODE_OPTIONS"
            :key="option.value"
            :value="option.value"
            class="mode-card"
          >
            <span class="mode-name">{{ option.label }}</span>
            <span class="mode-desc">{{ option.desc }}</span>
          </Radio>
        </RadioGroup>
      </div>

      <div class="content-row">
        <aside v-if="method === 'PER_ACCOUNT'" class="account-list">
          <div class="account-head">
            <span>媒体账户</span>
            <span class="muted">
              已配置
              {{
                accountInfo.filter((account) =>
                  configuredCount(account.localAdvertiserId),
                ).length
              }}
              / {{ accountInfo.length }}
            </span>
          </div>
          <div
            v-for="account in accountInfo"
            :key="account.localAdvertiserId"
            class="account-item"
            :class="{
              active: currentAccountId === account.localAdvertiserId,
            }"
            @click="handleAccountChange(account.localAdvertiserId)"
          >
            <div class="account-name">{{ account.advertiserName }}</div>
            <div class="account-id">ID {{ account.localAdvertiserId }}</div>
            <div class="account-meta">
              <Tag
                :color="
                  configuredCount(account.localAdvertiserId) > 0
                    ? 'blue'
                    : 'default'
                "
              >
                {{
                  configuredCount(account.localAdvertiserId) > 0
                    ? `已选 ${configuredCount(account.localAdvertiserId)} 个`
                    : '未配置'
                }}
              </Tag>
            </div>
          </div>
        </aside>

        <div class="picker">
          <div class="picker-toolbar">
            <span class="field-label">商品库</span>
            <Select
              :loading="loadingLibraries"
              :options="
                libraries.map((library) => ({
                  label: `${library.name}（${library.product_industry}）`,
                  value: library.platform_id,
                }))
              "
              :value="libraryId"
              allow-clear
              placeholder="请选择商品库"
              show-search
              style="width: 260px"
              :not-found-content="
                loadingLibraries ? undefined : '暂无可用的商品库'
              "
              @change="handleLibraryChange"
            />
            <Input
              v-model:value="productSearch"
              allow-clear
              placeholder="搜索商品名称 / ID"
              style="width: 220px; margin-left: auto"
            />
          </div>

          <div class="table-wrap">
            <Table
              :columns="columns as any"
              :data-source="filteredProducts"
              :loading="loadingProducts"
              :pagination="{
                pageSize: 8,
                showTotal: (total: number) => `共 ${total} 个商品`,
                size: 'small',
              }"
              :row-key="productKey"
              :row-selection="rowSelection"
              :scroll="{ y: 250 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                  <img
                    v-if="record.image_url"
                    :src="record.image_url"
                    :alt="record.title"
                    class="product-image"
                  />
                  <div v-else class="product-image placeholder">
                    {{ (record.name || record.title || '商')[0] }}
                  </div>
                </template>
                <template v-if="column.key === 'name'">
                  <div class="product-name">
                    {{ record.name || record.title || `商品 ${record.product_id}` }}
                  </div>
                  <div class="product-sub">
                    {{ record.first_category || record.third_category || '短剧商品' }}
                  </div>
                </template>
                <template v-if="column.key === 'status'">
                  <Tag :color="productStatus(record.status).color">
                    {{ productStatus(record.status).text }}
                  </Tag>
                </template>
              </template>
            </Table>
          </div>

          <div class="selected-block">
            <div class="selected-head">
              <span>
                {{
                  method === 'PER_ACCOUNT'
                    ? `${currentAccount?.advertiserName || '当前账户'}已选商品`
                    : '已选商品'
                }}
              </span>
              <span class="muted">
                {{
                  method === 'ALL_SAME'
                    ? '统一配置仅允许选择 1 个商品'
                    : '按勾选顺序参与分配'
                }}
              </span>
            </div>
            <div v-if="activeProducts.length > 0" class="chips">
              <span
                v-for="(product, index) in activeProducts"
                :key="productKey(product)"
                class="chip"
              >
                <span v-if="method !== 'ALL_SAME'" class="chip-index">
                  {{ index + 1 }}
                </span>
                <span class="chip-name">
                  {{ product.name || product.title || `商品 ${product.product_id}` }}
                </span>
                <span class="chip-close" @click="removeProduct(product)">×</span>
              </span>
            </div>
            <div v-else class="selected-empty">
              请选择{{
                method === 'ALL_SAME' ? ' 1 个' : '至少 1 个'
              }}商品
            </div>
          </div>
        </div>

        <aside class="side-panel">
          <div class="side-card">
            <div class="side-title">
              <span>
                {{
                  method === 'PER_ACCOUNT'
                    ? '账户内分配预览'
                    : method === 'AVERAGE'
                      ? '平均分配预览'
                      : '配置结果'
                }}
              </span>
              <span class="muted">
                {{
                  method === 'PER_ACCOUNT'
                    ? `${previewPlans.length} 个计划`
                    : method === 'AVERAGE'
                      ? '按最终计划数生效'
                      : '统一配置'
                }}
              </span>
            </div>

            <template v-if="method === 'ALL_SAME'">
              <div v-if="activeProducts[0]" class="summary-product">
                <img
                  v-if="activeProducts[0].image_url"
                  :src="activeProducts[0].image_url"
                  class="product-image"
                  :alt="activeProducts[0].title"
                />
                <div v-else class="product-image placeholder">
                  {{ (activeProducts[0].name || '商')[0] }}
                </div>
                <div class="summary-info">
                  <div class="product-name">
                    {{ activeProducts[0].name || activeProducts[0].title }}
                  </div>
                  <div class="product-sub mono">
                    {{ activeProducts[0].product_id }}
                  </div>
                </div>
              </div>
              <div class="hint">
                所有账户、所有项目计划都使用该商品。
              </div>
            </template>

            <template v-else>
              <div v-if="previewPlans.length > 0" class="preview-list">
                <div
                  v-for="plan in previewPlans"
                  :key="plan.name"
                  class="preview-row"
                >
                  <span>{{ plan.name }}</span>
                  <span class="product-pill">
                    {{ plan.product.name || plan.product.title }}
                  </span>
                </div>
              </div>
              <div v-else class="selected-empty">选择商品后展示分配预览</div>
              <div class="hint" style="margin-top: 10px">
                {{
                  method === 'PER_ACCOUNT'
                    ? '同一账户下的计划按顺序循环使用该账户已选商品。'
                    : '商品按顺序平均铺开到计划；商品不足时从头循环。'
                }}
              </div>
            </template>
          </div>

          <div class="side-card rule-card">
            <div class="side-title">分配规则</div>
            <div class="rule-line">
              <span>统一配置</span>
              <span>严格单选，全量共用</span>
            </div>
            <div class="rule-line">
              <span>分账户配置</span>
              <span>每账户必选，账户内循环</span>
            </div>
            <div class="rule-line">
              <span>平均分配</span>
              <span>多选，按计划循环铺开</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.dpa-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.mode-block {
  flex: none;
  padding-bottom: 14px;
  border-bottom: 1px solid hsl(var(--border));
}

.block-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.muted {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  font-weight: 400;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.mode-grid :deep(.ant-radio-wrapper) {
  align-items: flex-start;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition: all 0.18s ease;
}

.mode-grid :deep(.ant-radio-wrapper:hover) {
  border-color: hsl(var(--primary) / 45%);
}

.mode-grid :deep(.ant-radio-wrapper-checked) {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.mode-grid :deep(.ant-radio) {
  margin-top: 2px;
}

.mode-name {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}

.mode-desc {
  display: block;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.45;
}

.content-row {
  display: flex;
  flex: 1;
  min-height: 0;
  padding-top: 14px;
}

.account-list {
  flex: none;
  width: 210px;
  padding-right: 14px;
  margin-right: 14px;
  overflow-y: auto;
  border-right: 1px solid hsl(var(--border));
}

.account-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.account-item {
  padding: 10px 11px;
  margin-bottom: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.account-item:hover {
  border-color: hsl(var(--primary) / 45%);
}

.account-item.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.account-name {
  font-weight: 600;
}

.account-id {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.account-meta {
  margin-top: 7px;
}

.picker {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.picker-toolbar {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.field-label {
  font-weight: 600;
  white-space: nowrap;
}

.table-wrap {
  flex: 1;
  min-height: 0;
}

.table-wrap :deep(.ant-table-wrapper),
.table-wrap :deep(.ant-spin-nested-loading),
.table-wrap :deep(.ant-spin-container) {
  height: 100%;
}

.product-image {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.product-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--primary-foreground));
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(
    145deg,
    hsl(var(--primary)),
    hsl(var(--primary) / 55%)
  );
}

.product-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-sub {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.selected-block {
  flex: none;
  margin-top: 10px;
  padding: 10px 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 260px;
  padding: 4px 8px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: 6px;
}

.chip-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--primary-foreground));
  font-size: 10px;
  font-weight: 700;
  background: hsl(var(--primary));
  border-radius: 50%;
}

.chip-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-close {
  color: hsl(var(--primary) / 65%);
  cursor: pointer;
}

.selected-empty {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.side-panel {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 12px;
  width: 286px;
  margin-left: 16px;
  overflow-y: auto;
}

.side-card {
  padding: 13px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
  font-weight: 600;
}

.summary-product {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background: hsl(var(--primary) / 10%);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: 8px;
}

.summary-info {
  min-width: 0;
}

.hint {
  padding: 8px 9px;
  color: hsl(var(--primary));
  font-size: 12px;
  line-height: 1.55;
  background: hsl(var(--primary) / 10%);
  border: 1px solid hsl(var(--primary) / 28%);
  border-radius: 6px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  background: hsl(var(--muted) / 55%);
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.product-pill {
  max-width: 160px;
  padding: 2px 7px;
  overflow: hidden;
  color: hsl(var(--primary));
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: hsl(var(--primary) / 12%);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: 4px;
}

.rule-card {
  background: hsl(var(--card));
}

.rule-line {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  border-bottom: 1px dashed hsl(var(--border));
}

.rule-line:last-child {
  border-bottom: 0;
}
</style>
