<script lang="ts" setup name="TencentProductDrawer">
// 商品选择抽屉：支持「全部相同」/「按账户分配」，商品数据来自后端腾讯商品库接口
import type { TencentProductCatalogItem, TencentProductItem } from "#/api/models";
import type {
  AccountInfo,
  ProductData,
  ProductSelection
} from "#/views/marketing/creation/creation";

import { computed, ref, watch } from "vue";

import { useVbenDrawer } from "@vben/common-ui";

import { Alert, InputSearch, message, RadioButton, RadioGroup, Select, Spin } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { tencentAdvertisementApi } from "#/api/core";
import { RuleMethod } from "#/views/marketing/creation/creation_enums";

const { accountInfo } = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  }
});

const emit = defineEmits(["update:product"]);

/** 「全部相同」时数据统一挂在 0 键下 */
const ALL_KEY = "0";

/** 当前操作的账户 id（按账户分配时使用） */
const currentAccountId = ref<string>("");
/** 商品库下拉 */
const catalogs = ref<Array<TencentProductCatalogItem>>([]);
const currentCatalogId = ref<string>("");
/** 商品列表 */
const products = ref<Array<TencentProductItem>>([]);
const loading = ref(false);
const keyword = ref("");

const localProduct = ref<ProductData>({
  config: { method: RuleMethod.ALL },
  data: new Map<string, ProductSelection>()
});

/** 当前停留账户已勾选的商品，切换账户/搜索前先暂存在这里 */
const tempSelectedRows = ref<Array<TencentProductItem>>([]);

const catalogOptions = computed(() =>
  catalogs.value.map((item) => ({
    label: item.product_catalog_name,
    value: String(item.product_catalog_id)
  }))
);

/** 关键词过滤（接口返回的是全量商品，前端直接过滤） */
const filteredProducts = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return products.value;
  return products.value.filter(
    (item) =>
      item.product_name?.toLowerCase().includes(kw) ||
      item.product_outer_id?.toLowerCase().includes(kw)
  );
});

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: "product_outer_id",
    reserve: true
  },
  columns: [
    { type: "checkbox", width: 50 },
    { field: "product_image_url", slots: { default: "image" }, title: "商品图", width: 90 },
    { field: "product_outer_id", title: "商品 id", width: 170 },
    { field: "product_name", minWidth: 220, title: "商品名称" },
    { field: "product_short_name", minWidth: 160, title: "商品简称" },
    { field: "price", title: "日常售价", width: 110 },
    { field: "brand_name", title: "品牌", width: 140 },
    { field: "product_select_score", title: "爆量分", width: 100 }
  ],
  data: [],
  height: "460px",
  pagerConfig: { enabled: false },
  rowConfig: { keyField: "product_outer_id" }
};

const gridEvents = {
  checkboxAll: () => updateTempRecords(),
  checkboxChange: () => updateTempRecords()
};

/**
 * 收集表格当前全部勾选（含跨账户切换的保留项）
 */
function updateTempRecords() {
  const grid = gridApi.grid;
  if (!grid) return;
  const rows: Array<TencentProductItem> = [
    ...(grid.getCheckboxReserveRecords?.() ?? []),
    ...grid.getCheckboxRecords()
  ];
  const uniqueMap = new Map<string, TencentProductItem>();
  rows.forEach((item) => {
    if (item?.product_outer_id) {
      uniqueMap.set(item.product_outer_id, item);
    }
  });
  tempSelectedRows.value = [...uniqueMap.values()];
}

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 当前查询使用的账户 id 列表：按账户分配时只查当前账户，全部相同时查所有账户取交集
 */
function queryAdvertiserIds(): string[] {
  return localProduct.value.config.method === RuleMethod.ACCOUNT
     ? [currentAccountId.value]
     : accountInfo.map((item) => item.localAdvertiserId);
}

async function loadCatalogs() {
  const advertiserId = queryAdvertiserIds();
  if (advertiserId.length === 0) {
    catalogs.value = [];
    currentCatalogId.value = "";
    return;
  }
  try {
    catalogs.value = await tencentAdvertisementApi.fetchProductCatalogs({ advertiserId });
    // 已保存的商品库仍可用就继续用（回显），否则只有一个商品库时默认选中
    const saved = savedCatalogId(currentKey());
    if (saved && catalogs.value.some((item) => String(item.product_catalog_id) === saved)) {
      currentCatalogId.value = saved;
    } else if (catalogs.value.length === 1) {
      currentCatalogId.value = String(catalogs.value[0]?.product_catalog_id ?? "");
    } else {
      currentCatalogId.value = "";
    }
  } catch {
    catalogs.value = [];
    await message.error("获取商品库失败");
  }
}

async function loadProducts() {
  const advertiserId = queryAdvertiserIds();
  if (!currentCatalogId.value || advertiserId.length === 0) {
    products.value = [];
    return;
  }
  loading.value = true;
  try {
    products.value = await tencentAdvertisementApi.fetchProductItems({
      advertiserId,
      productCatalogId: Number(currentCatalogId.value)
    });
  } catch {
    products.value = [];
    await message.error("获取商品失败");
  } finally {
    loading.value = false;
  }
}

/** 表格数据与勾选状态同步 */
async function syncGrid() {
  await gridApi.setGridOptions({ data: filteredProducts.value });
  const keys = tempSelectedRows.value.map((item) => item.product_outer_id);
  if (keys.length > 0) {
    setTimeout(() => {
      gridApi.grid?.setCheckboxRowKey(keys, true);
    }, 0);
  }
}

/** 某个位置（账户 id / 全部相同的 0）已保存的商品库 id */
function savedCatalogId(key: string): string {
  return localProduct.value.data.get(key)?.productCatalogId || "";
}

/** 某个位置已保存的商品 */
function savedProducts(key: string): Array<TencentProductItem> {
  return localProduct.value.data.get(key)?.products || [];
}

/**
 * 把当前停留位置的勾选落到 localProduct.data
 * @param key 账户 id / 全部相同的 0
 */
function flushCurrent(key: string) {
  if (!key) return;
  // 商品必须归属某个商品库，没选商品库视为未选择
  if (tempSelectedRows.value.length > 0 && currentCatalogId.value) {
    localProduct.value.data.set(key, {
      productCatalogId: currentCatalogId.value,
      products: [...tempSelectedRows.value]
    });
  } else {
    localProduct.value.data.delete(key);
  }
}

/** 当前停留位置的 key */
function currentKey(): string {
  return localProduct.value.config.method === RuleMethod.ACCOUNT
    ? currentAccountId.value
    : ALL_KEY;
}

/**
 * 分配方式改变
 */
async function changeMethod(e: any) {
  const value = e.target.value;
  if (value === RuleMethod.ALL) {
    currentAccountId.value = "";
    localProduct.value.data.clear();
  } else {
    currentAccountId.value = accountInfo[0]?.localAdvertiserId ?? "";
  }
  tempSelectedRows.value = [...savedProducts(currentKey())];
  await gridApi.grid?.clearCheckboxRow();
  await gridApi.grid?.clearCheckboxReserve();
  await loadCatalogs();
  await loadProducts();
  await syncGrid();
}

/** 切换账户 */
async function handleAccountClick(account: AccountInfo) {
  if (localProduct.value.config.method === RuleMethod.ACCOUNT) {
    flushCurrent(currentAccountId.value);
  }
  currentAccountId.value = account.localAdvertiserId;
  tempSelectedRows.value = [...savedProducts(currentAccountId.value)];
  await gridApi.grid?.clearCheckboxRow();
  await gridApi.grid?.clearCheckboxReserve();
  await loadCatalogs();
  await loadProducts();
  await syncGrid();
}

/** 切换商品库 */
async function onCatalogChange() {
  tempSelectedRows.value = [];
  await gridApi.grid?.clearCheckboxRow();
  await gridApi.grid?.clearCheckboxReserve();
  await loadProducts();
  await syncGrid();
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[75%]",
  closeOnPressEscape: true,
  async onConfirm() {
    flushCurrent(currentKey());

    // 按账户分配：每个账户都必须选到商品
    if (localProduct.value.config.method === RuleMethod.ACCOUNT) {
      const unselected = accountInfo.filter(
        (acc) => !localProduct.value.data.get(acc.localAdvertiserId)?.products?.length
      );
      if (unselected.length > 0) {
        await message.warning(
          `请为账户 [${unselected.map((acc) => acc.advertiserName).join("、")}] 选择商品`
        );
        return;
      }
      localProduct.value.data.delete(ALL_KEY);
    }

    emit("update:product", { ...localProduct.value });
    await drawerApi.close();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData() as ProductData;
    localProduct.value = {
      config: { ...data.config },
      data: new Map(data.data)
    };
    currentAccountId.value =
      localProduct.value.config.method === RuleMethod.ACCOUNT
        ? accountInfo[0]?.localAdvertiserId ?? ""
        : "";
    tempSelectedRows.value = [...savedProducts(currentKey())];
    await loadCatalogs();
    await loadProducts();
    await syncGrid();
  }
});

watch(keyword, () => {
  syncGrid();
});
</script>

<template>
  <Drawer title="选择商品">
    <div class="product-drawer">
      <div class="method-bar">
        <span>分配方式：</span>
        <RadioGroup v-model:value="localProduct.config.method" @change="changeMethod">
          <RadioButton :value="RuleMethod.ALL">全部相同</RadioButton>
          <RadioButton :value="RuleMethod.ACCOUNT">按账户分配</RadioButton>
        </RadioGroup>
      </div>

      <div class="drawer-body" :class="{ 'is-account': localProduct.config.method === RuleMethod.ACCOUNT }">
        <!-- 按账户分配时的账户列表 -->
        <div v-if="localProduct.config.method === RuleMethod.ACCOUNT" class="account-list">
          <div
            v-for="item in accountInfo"
            :key="item.localAdvertiserId"
            class="account-item" :class="[
              localProduct.data.get(item.localAdvertiserId) ? 'has-products' : 'no-products',
              currentAccountId === item.localAdvertiserId ? 'is-active' : ''
            ]"
            @click="handleAccountClick(item)"
          >
            <div class="account-name">{{ item.advertiserName }}</div>
            <div class="account-id">ID: {{ item.localAdvertiserId }}</div>
          </div>
        </div>

        <div class="product-main">
          <div class="product-toolbar">
            <Select
              v-model:value="currentCatalogId"
              :options="catalogOptions"
              :placeholder="currentCatalogId ? '请选择商品库' : '暂无可用商品库'"
              style="width: 260px"
              @change="onCatalogChange"
            />
            <InputSearch
              v-model:value="keyword"
              placeholder="搜索商品名称 / 商品 id"
              style="width: 240px"
              allow-clear
            />
          </div>

          <Spin :spinning="loading">
            <Grid>
              <template #image="{ row }">
                <img
                  v-if="row.product_image_url"
                  :src="row.product_image_url"
                  class="product-image"
                />
                <span v-else>-</span>
              </template>
            </Grid>
          </Spin>

          <Alert
            v-if="!currentCatalogId"
            class="catalog-alert"
            type="info"
            show-icon
            message="请先选择商品库"
          />
        </div>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.product-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.method-bar {
  flex: none;
  margin-bottom: 16px;
}

.drawer-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.drawer-body.is-account {
  flex-direction: row;
}

.account-list {
  flex: none;
  width: 240px;
  max-height: 520px;
  margin-right: 16px;
  padding-right: 16px;
  overflow-y: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.account-item {
  padding: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.account-name {
  font-size: 13px;
  font-weight: 500;
}

.account-id {
  font-size: 12px;
  color: rgb(0 0 0 / 45%);
}

.has-products {
  background-color: #e6f4ff;
  border-color: #91caff;
}

.no-products {
  background-color: #fafafa;
  border-color: #a2a2a2;
  border-style: dashed;
  opacity: 0.6;
}

.is-active {
  background-color: #bae0ff !important;
  border-color: #0958d9 !important;
  border-style: solid !important;
  opacity: 1 !important;
}

.product-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.product-toolbar {
  flex: none;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.product-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}

.catalog-alert {
  flex: none;
  margin-top: 12px;
}
</style>
