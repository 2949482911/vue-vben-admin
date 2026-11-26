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
    title: '抖音号',
    minWidth: 260,
    slots: { default: 'assetName' },
  },
  {
    field: 'assetId',
    title: '抖音号 ID',
    width: 190,
    showOverflow: 'tooltip',
  },
  {
    field: 'authStatus',
    title: '授权状态',
    width: 120,
    showOverflow: 'tooltip',
  },
  {
    field: 'awemeUserType',
    title: '账号类型',
    width: 120,
    showOverflow: 'tooltip',
  },
  {
    field: 'authType',
    title: '授权类型',
    width: 140,
    showOverflow: 'tooltip',
  },
  {
    field: 'authAutoExpireDate',
    title: '授权到期',
    width: 130,
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
    asset-type="aweme"
    :columns="columns"
    :filters="filters"
    :platform="platform"
  />
</template>
