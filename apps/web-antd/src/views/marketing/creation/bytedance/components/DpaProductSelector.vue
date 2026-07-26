<script setup lang="ts">
// 巨量引擎 DPA 商品选择器 - 两步选择：商品库 → 商品（单选）
import { ref, watch, computed } from 'vue';
import {
  Select, Table, Empty, Spin, Tag, message, Button, Input
} from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { bytedanceAdvertisementApi } from '#/api';
import type {
  BytedanceDpaProductAvailablesItem,
  BytedanceDpaProductListItem,
} from '#/api/models/bytedance';

const props = defineProps<{
  /** 广告主ID列表 */
  advertiserIds: string[];
  /** 已选数据（编辑回显 - IDs） */
  modelValue?: {
    product_platform_id?: string;
    product_id?: string;
    unique_product_id?: string;
  };
  /** 已选商品完整信息（编辑回显 - 展示用） */
  initialSelectedProduct?: BytedanceDpaProductListItem | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: {
    product_platform_id: string;
    product_id: string;
    unique_product_id: string;
  } | null): void;
  /** 商品选中事件 - 携带完整商品信息用于外部展示 */
  (e: 'productSelected', product: BytedanceDpaProductListItem | null): void;
}>();

// 商品库列表
const loadingLibraries = ref(false);
const libraries = ref<BytedanceDpaProductAvailablesItem[]>([]);
const selectedLibraryId = ref<number | undefined>(undefined);

// 商品列表
const loadingProducts = ref(false);
const products = ref<BytedanceDpaProductListItem[]>([]);
const selectedProduct = ref<BytedanceDpaProductListItem | null>(null);
const productSearch = ref('');

/** 加载商品库 */
async function loadLibraries() {
  if (!props.advertiserIds.length) return;
  loadingLibraries.value = true;
  try {
    const res = await bytedanceAdvertisementApi.fetchDpaProductAvailables({
      advertiserId: props.advertiserIds,
    });
    libraries.value = res || [];
  } catch (e: any) {
    message.error(e?.message || '获取商品库失败');
    libraries.value = [];
  } finally {
    loadingLibraries.value = false;
  }
}

/** 加载商品列表 */
async function loadProducts() {
  if (!selectedLibraryId.value || !props.advertiserIds.length) return;
  loadingProducts.value = true;
  try {
    const res = await bytedanceAdvertisementApi.fetchDpaProductList({
      advertiserId: props.advertiserIds,
      productPlatformId: selectedLibraryId.value,
      page: 1,
      pageSize: 50,
    });
    products.value = res || [];
  } catch (e: any) {
    message.error(e?.message || '获取商品列表失败');
    products.value = [];
  } finally {
    loadingProducts.value = false;
  }
}

/** 处理商品库切换 */
function handleLibraryChange(libId: number) {
  selectedLibraryId.value = libId;
  selectedProduct.value = null;
  emit('update:modelValue', null);
  loadProducts();
}

/** 处理商品选择 */
function handleProductSelect(product: BytedanceDpaProductListItem) {
  selectedProduct.value = product;
  emit('update:modelValue', {
    product_platform_id: String(product.platform_id),
    product_id: String(product.product_id),
    unique_product_id: String(product.product_id), // 巨量使用 product_id 作为 unique_product_id
  });
  emit('productSelected', product);
}

/** 清空选择 */
function handleClear() {
  selectedProduct.value = null;
  emit('update:modelValue', null);
  emit('productSelected', null);
}

// 监听 advertiserIds 变化
watch(
  () => props.advertiserIds,
  (ids) => {
    if (ids?.length) {
      loadLibraries();
    }
  },
  { immediate: true }
);

// 编辑回显：恢复已选商品展示
watch(
  () => props.initialSelectedProduct,
  (product) => {
    if (product) {
      selectedProduct.value = product;
      selectedLibraryId.value = product.platform_id;
    }
  },
  { immediate: true }
);

// 商品表格列
const productColumns = [
  {
    title: '商品预览',
    key: 'image_url',
    width: 80,
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '商品ID',
    dataIndex: 'product_id',
    key: 'product_id',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
  },
];

/** 商品状态映射 */
function getProductStatus(status: number) {
  const map: Record<number, { color: string; text: string }> = {
    0: { color: 'default', text: '下架' },
    1: { color: 'green', text: '上架' },
    2: { color: 'red', text: '删除' },
  };
  return map[status] || { color: 'default', text: '未知' };
}

/** 过滤商品 */
const filteredProducts = computed(() => {
  const keyword = productSearch.value.trim().toLowerCase();
  if (!keyword) return products.value;
  return products.value.filter(
    p =>
      p.title?.toLowerCase().includes(keyword) ||
      p.name?.toLowerCase().includes(keyword) ||
      String(p.product_id).includes(keyword)
  );
});
</script>

<template>
  <div class="dpa-product-selector">
    <!-- 选择商品库 -->
    <div class="mb-3">
      <div class="mb-1 text-xs text-gray-500">商品库</div>
      <Select
        :value="selectedLibraryId"
        :loading="loadingLibraries"
        :options="libraries.map(l => ({ label: `${l.name} (${l.product_industry})`, value: l.platform_id }))"
        placeholder="请选择商品库"
        style="width: 100%;"
        :not-found-content="loadingLibraries ? undefined : '暂无可用的商品库'"
        @change="handleLibraryChange"
        allow-clear
        show-search
        :filter-option="(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())"
      />
    </div>

    <!-- 选择商品 -->
    <div v-if="selectedLibraryId">
      <div class="mb-2 flex items-center justify-between">
        <div class="text-xs text-gray-500">选择商品（单选）</div>
        <Input
          v-if="products.length > 0"
          v-model:value="productSearch"
          placeholder="搜索商品名称/ID"
          size="small"
          style="width: 200px;"
          allow-clear
        >
          <template #prefix><SearchOutlined /></template>
        </Input>
      </div>

      <Spin :spinning="loadingProducts" tip="加载商品中...">
        <div
          v-if="selectedProduct"
          class="mb-2 flex items-center gap-3 rounded border border-blue-300 bg-blue-50 p-2 dark:border-blue-600 dark:bg-blue-900/20"
        >
          <img
            v-if="selectedProduct.image_url"
            :src="selectedProduct.image_url"
            class="h-10 w-10 rounded object-cover"
            :alt="selectedProduct.title"
          />
          <div class="flex-1 min-w-0">
            <div class="truncate text-sm font-medium">{{ selectedProduct.title }}</div>
            <div class="text-xs text-gray-400">ID: {{ selectedProduct.product_id }}</div>
          </div>
          <Button size="small" danger type="link" @click="handleClear">移除</Button>
        </div>

        <Empty
          v-if="!loadingProducts && products.length === 0"
          description="该商品库暂无商品"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        />

        <Table
          v-if="products.length > 0 && !selectedProduct"
          :data-source="filteredProducts"
          :columns="productColumns"
          :pagination="{ pageSize: 10, size: 'small', showTotal: (total: number) => `共 ${total} 个商品` }"
          size="small"
          row-key="product_id"
          :scroll="{ y: 300 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'image_url'">
              <img
                v-if="record.image_url"
                :src="record.image_url"
                class="h-10 w-10 rounded object-cover"
                :alt="record.title"
              />
              <div v-else class="h-10 w-10 flex items-center justify-center rounded bg-gray-100 text-xs text-gray-400">无图</div>
            </template>
            <template v-if="column.key === 'status'">
              <Tag :color="getProductStatus(record.status).color">
                {{ getProductStatus(record.status).text }}
              </Tag>
            </template>
            <template v-if="column.key === 'action'">
              <Button
                size="small"
                type="primary"
                :disabled="record.status !== 1"
                @click="handleProductSelect(record)"
              >
                选择
              </Button>
            </template>
          </template>
        </Table>
      </Spin>
    </div>

    <Empty
      v-else-if="!loadingLibraries"
      description="请先选择商品库"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
    />
  </div>
</template>

<style scoped lang="scss">
.dpa-product-selector {
  :deep(.ant-select) {
    width: 100%;
  }

  :deep(.ant-table-wrapper) {
    .ant-table-thead > tr > th {
      padding: 8px;
      font-size: 12px;
    }
    .ant-table-tbody > tr > td {
      padding: 6px 8px;
    }
  }
}
</style>
