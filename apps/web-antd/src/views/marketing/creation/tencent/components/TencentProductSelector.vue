<script setup lang="ts" name="TencentProductSelector">
import type { TencentProductItem } from "#/api/models";
// 商品选择组件 - 供腾讯商品销售场景使用
// 参照 audience_package/AudiencePackageSelector.vue 模式：内部组装 展示 + 抽屉 + 选择按钮
import type { AccountInfo, ProductData, ProductSelection } from "#/views/marketing/creation/creation";

import { computed, ref, watch } from "vue";

import { useVbenDrawer } from "@vben/common-ui";

import { Alert, Button, Card } from "ant-design-vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import TencentProductDrawer from "./TencentProductDrawer.vue";

const props = defineProps<{
  /** 商品数据 */
  product: null | ProductData;
  /** 账户列表 */
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits(["update:product"]);

const [ProductDrawerComp, productDrawerApi] = useVbenDrawer({
  connectedComponent: TencentProductDrawer
});

/** 兼容复用策略组后 Map 被 JSON 序列化成普通对象的情况 */
function toMap(data: any): Map<string, ProductSelection> {
  return data instanceof Map ? data : new Map(Object.entries(data || {}));
}

const localProduct = ref<ProductData>({
  config: { method: RuleMethod.ALL },
  data: new Map()
});

/** 已选商品分组，用于卡片回显 */
const previewGroups = computed(() => {
  const groups: Array<{ items: Array<TencentProductItem>; key: string; name: string }> = [];
  toMap(localProduct.value.data).forEach((selection, key) => {
    const items = selection?.products ?? [];
    if (items.length > 0) {
      const account = props.accountInfo.find((item) => item.localAdvertiserId === key);
      groups.push({
        items,
        key,
        name: key === "0" ? "全部账户" : account?.advertiserName || key
      });
    }
  });
  return groups;
});

const totalCount = computed(() =>
  previewGroups.value.reduce((total, group) => total + group.items.length, 0)
);

function openProductDrawer() {
  productDrawerApi.setData({
    config: { ...localProduct.value.config },
    data: toMap(localProduct.value.data)
  });
  productDrawerApi.open();
}

/** 接收抽屉确认回调，更新本地数据并 emit 到最外层 */
function updateProduct(data: ProductData) {
  localProduct.value = {
    config: { ...data.config },
    data: toMap(data.data)
  };
  emit("update:product", {
    config: { ...localProduct.value.config },
    data: toMap(localProduct.value.data)
  });
}

function handleClear() {
  localProduct.value = {
    config: { method: RuleMethod.ALL },
    data: new Map()
  };
  emit("update:product", {
    config: { method: RuleMethod.ALL },
    data: new Map()
  });
}

// 监听父组件传入的 product 变化，实现回显
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct && newProduct.data) {
      localProduct.value = {
        ...newProduct,
        config: { ...newProduct.config },
        data: toMap(newProduct.data)
      };
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="product-selector-container">
    <Card title="商品" class="info-card">
      <div class="card-content">
        <template v-if="totalCount > 0">
          <div v-for="group in previewGroups" :key="group.key" class="product-group">
            <div class="group-title">{{ group.name }}（{{ group.items.length }}）</div>
            <div class="product-tags">
              <span v-for="item in group.items" :key="item.product_outer_id" class="product-tag">
                {{ item.product_name || item.product_outer_id }}
              </span>
            </div>
          </div>
        </template>
        <Alert v-else type="error" message="请选择商品" show-icon class="empty-alert" />
      </div>
      <div class="card-footer">
        <Button v-if="totalCount > 0" type="link" danger @click="handleClear">清空</Button>
        <Button type="primary" danger @click="openProductDrawer">
          {{ totalCount > 0 ? "编辑" : "添加" }}
        </Button>
      </div>
    </Card>

    <ProductDrawerComp :account-info="accountInfo" @update:product="updateProduct" />
  </div>
</template>

<style scoped lang="scss">
.product-selector-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
    }
  }

  :deep(.ant-card-head) {
    padding: 12px 16px;
    min-height: 57px;
    border-bottom: 1px solid rgb(0 0 0 / 6%);
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
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid rgb(0 0 0 / 6%);
}

.product-group {
  margin-bottom: 12px;
}

.group-title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.product-tag {
  padding: 2px 8px;
  font-size: 12px;
  background: rgb(0 0 0 / 4%);
  border: 1px solid rgb(0 0 0 / 8%);
  border-radius: 4px;
}

.empty-alert {
  margin: 8px 0;
}
</style>
