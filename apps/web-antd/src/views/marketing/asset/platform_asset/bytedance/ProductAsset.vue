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
    title: '商品',
    minWidth: 260,
    slots: { default: 'assetName' },
  },
  {
    field: 'assetId',
    title: '商品 ID',
    width: 190,
    showOverflow: 'tooltip',
  },
  { field: 'productStatus', title: '商品状态', width: 110 },
  { field: 'auditStatus', title: '审核状态', width: 110 },
  { field: 'stock', title: '库存', width: 90 },
  {
    field: 'categoryId',
    title: '类目 ID',
    width: 140,
    showOverflow: 'tooltip',
  },
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
    asset-type="product"
    :columns="columns"
    :filters="filters"
    :platform="platform"
  />
</template>
