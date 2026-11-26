<script setup lang="ts" name="PlatformAssetTypeTable">
import type {
  PlatformAssetColumns,
  PlatformAssetFilters,
} from './types';

/**
 * 媒体资产通用表格
 *
 * 各媒体/资产类型只提供列配置，查询、勾选、批量操作、标签/详情入口共用这一层。
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import type {
  PlatformAssetItem,
  PlatformAssetType,
} from '#/api/models/platform_asset';

import { ref, watch } from 'vue';

import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  MenuItem,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { platformAssetApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';

const props = defineProps<{
  assetType: PlatformAssetType;
  columns: PlatformAssetColumns;
  filters: PlatformAssetFilters;
  platform: string;
}>();

const emit = defineEmits<{
  batchTag: [PlatformAssetItem[]];
  'detail': [PlatformAssetItem];
  'tag': [PlatformAssetItem];
}>();

const selectedRows = ref<PlatformAssetItem[]>([]);

const gridEvents = {
  checkboxAll: ({ records }: { records: PlatformAssetItem[] }) => {
    selectedRows.value = records;
  },
  checkboxChange: ({ records }: { records: PlatformAssetItem[] }) => {
    selectedRows.value = records;
  },
  proxyQuery: () => {
    selectedRows.value = [];
  },
};

const gridOptions: VxeGridProps<PlatformAssetItem> = {
  border: true,
  height: 'auto',
  keepSource: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'assetId',
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    ...props.columns.slice(0, 1),
    {
      field: 'accountId',
      minWidth: 200,
      slots: { default: 'account' },
      title: '关联账户',
    },
    ...props.columns.slice(1),
  ] as PlatformAssetColumns,
  pagerConfig: {
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await platformAssetApi.fetchList({
          platform: props.platform,
          assetType: props.assetType,
          page: page.currentPage,
          pageSize: page.pageSize,
          ...props.filters,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

watch(
  () => props.filters,
  () => {
    void gridApi.reload();
  },
  { deep: true },
);

function thumbOf(row: PlatformAssetItem) {
  return (
    row.imageUrl ??
    row.imagesUrl?.[0] ??
    row.backupImages?.[0] ??
    undefined
  );
}

function visibleLabels(row: PlatformAssetItem) {
  return (row.labelNames ?? []).slice(0, 2);
}

function hiddenLabelCount(row: PlatformAssetItem) {
  return Math.max(0, (row.labelNames ?? []).length - 2);
}

function openBatchTag() {
  if (selectedRows.value.length === 0) {
    return;
  }
  emit('batchTag', [...selectedRows.value]);
}
</script>

<template>
  <Grid class="h-full">
    <template #toolbar-tools>
      <Space :size="8">
        <Typography.Text type="secondary" class="text-xs">
          已选 {{ selectedRows.length }} 项
        </Typography.Text>
        <Dropdown trigger="click" placement="bottomCenter">
          <Button
            class="mr-2"
            :disabled="selectedRows.length === 0"
            type="primary"
          >
            批量操作
          </Button>
          <template #overlay>
            <Menu>
              <MenuItem key="label" @click="openBatchTag">
                修改本地标签
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </Space>
    </template>

    <template #assetName="{ row }">
      <div class="flex min-w-0 items-center gap-2">
        <Avatar
          :size="34"
          :src="thumbOf(row)"
          class="shrink-0 !bg-primary/10 !text-primary"
          shape="square"
        >
          {{ row.assetName?.slice(0, 1) }}
        </Avatar>
        <div class="min-w-0">
          <div class="truncate font-medium" :title="row.assetName">
            {{ row.assetName }}
          </div>
          <div class="truncate text-xs text-muted-foreground">
            {{ row.assetId }}
          </div>
        </div>
      </div>
    </template>

    <template #account="{ row }">
      <div v-if="row.accountId" class="flex min-w-0 flex-col">
        <Typography.Text
          class="truncate"
          :title="row.accountName || row.accountId"
        >
          {{ row.accountName || '—' }}
        </Typography.Text>
        <Typography.Text
          class="truncate text-xs"
          type="secondary"
          :title="row.accountId"
        >
          {{ row.accountId }}
        </Typography.Text>
      </div>
      <Typography.Text v-else type="secondary" class="text-xs">
        —
      </Typography.Text>
    </template>

    <template #labels="{ row }">
      <Space v-if="(row.labelNames ?? []).length" :size="[4, 4]" wrap>
        <Tag
          v-for="name in visibleLabels(row)"
          :key="name"
          :bordered="false"
          :color="getLabelColor(name)"
        >
          {{ name }}
        </Tag>
        <Tag v-if="hiddenLabelCount(row) > 0" :bordered="false">
          +{{ hiddenLabelCount(row) }}
        </Tag>
      </Space>
      <Typography.Text v-else type="secondary" class="text-xs">
        —
      </Typography.Text>
    </template>

    <template #actions="{ row }">
      <Space :size="0">
        <Button size="small" type="link" @click="emit('detail', row)">
          详情
        </Button>
        <Button size="small" type="link" @click="emit('tag', row)">
          打标签
        </Button>
      </Space>
    </template>
  </Grid>
</template>
