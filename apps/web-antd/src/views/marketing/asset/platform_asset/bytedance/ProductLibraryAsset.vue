<script setup lang="ts">
import type {
  PlatformAssetColumns,
  PlatformAssetFilters,
} from '../types';

import AssetTypeTable from '../AssetTypeTable.vue';

defineOptions({ inheritAttrs: false });

defineProps<{
  filters: PlatformAssetFilters;
  platform: string;
}>();

const columns: PlatformAssetColumns = [
  {
    field: 'assetName',
    title: '商品库',
    minWidth: 260,
    slots: { default: 'assetName' },
  },
  {
    field: 'assetId',
    title: '商品库 ID',
    width: 190,
    showOverflow: 'tooltip',
  },
  { field: 'storeType', title: '店铺类型', width: 110 },
  { field: 'source', title: '来源', width: 120 },
  { field: 'accountType', title: '账号类型', width: 120 },
  {
    field: 'platformCreateTime',
    title: '创建时间',
    width: 160,
    showOverflow: 'tooltip',
  },
  {
    field: 'labelNames',
    title: '本地标签',
    width: 220,
    slots: { default: 'labels' },
  },
  {
    field: 'actions',
    title: '操作',
    width: 140,
    fixed: 'right',
    slots: { default: 'actions' },
  },
];
</script>

<template>
  <AssetTypeTable
    v-bind="$attrs"
    asset-type="product_library"
    :columns="columns"
    :filters="filters"
    :platform="platform"
  />
</template>
