<script lang="ts" setup name="AiModelConfigManager">
/**
 * 系统管理 — 模型管理
 *
 * 平台级模型库：三种来源（平台托管/自持 Key/自建网关）统一维护。
 * 接口：/aimodel/model_config（save / list 分页 / batch_options）。
 * 创建与编辑均使用 vben 自带抽屉；批量操作统一走 batch_options。
 */
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ModelConfigItem } from '#/api/models/ai_model';
import type { BatchOptions } from '#/api/models/core';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Dropdown, Menu, MenuItem, message, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aiModelApi } from '#/api';
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from '#/constants/locales';

import { CAPABILITY_MAP, CAPABILITY_OPTIONS, SOURCE_MAP, SOURCE_OPTIONS } from './constants';
import Create from './create.vue';

// ==================== 创建 / 编辑抽屉 ====================
const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: Create,
});

function openDrawer(row?: ModelConfigItem) {
  createDrawerApi.setData(row ?? {});
  createDrawerApi.open();
}

// ==================== 列表 ====================

const formOptions: VbenFormProps = {
  collapsed: true,
  compact: true,
  schema: [
    { component: 'Input', fieldName: 'model', label: '模型名' },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: CAPABILITY_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'capability',
      label: '能力',
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: SOURCE_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'source',
      label: '来源',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: true,
};

const gridOptions: VxeGridProps<ModelConfigItem> = {
  checkboxConfig: { highlight: true, labelField: 'id' },
  columns: [
    { field: 'model', title: '模型名', minWidth: 180 },
    { field: 'provider', title: '供应商', minWidth: 130 },
    { field: 'capability', slots: { default: 'capability' }, title: '能力', width: 100 },
    { field: 'source', slots: { default: 'source' }, title: '来源', width: 120 },
    { field: 'baseUrl', title: 'Base URL', minWidth: 220 },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  height: 'auto',
  pagerConfig: { enabled: true },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await aiModelApi.fetchModelConfigList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...(args as Record<string, any>),
        });
      },
    },
  },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
};

const selectedRows = ref<ModelConfigItem[]>([]);
const gridEvents = {
  checkboxAll: ({ records }: { records: ModelConfigItem[] }) => (selectedRows.value = records),
  checkboxChange: ({ records }: { records: ModelConfigItem[] }) => (selectedRows.value = records),
  proxyQuery: () => (selectedRows.value = []),
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

function pageReload() {
  gridApi.reload();
  selectedRows.value = [];
}

// ==================== 批量 / 单条操作 ====================

function batchOptions(type: BatchOptionsType, ids: Array<number | string>) {
  return aiModelApi.fetchModelConfigBatchOptions({
    targetIds: ids.map((id) => String(id)),
    type,
    values: {},
  } as BatchOptions);
}

async function toggleStatus(row: ModelConfigItem) {
  await batchOptions(row.status === 1 ? BatchOptionsType.DISABLE : BatchOptionsType.Enable, [row.id]);
  message.success(row.status === 1 ? '已停用' : '已启用');
  pageReload();
}

async function handleDelete(row: ModelConfigItem) {
  await batchOptions(BatchOptionsType.Delete, [row.id]);
  message.success('删除成功');
  pageReload();
}

async function handleBatchDelete() {
  await batchOptions(BatchOptionsType.Delete, selectedRows.value.map((r) => r.id));
  message.success('批量删除成功');
  pageReload();
}

async function handleBatchEnable() {
  await batchOptions(BatchOptionsType.Enable, selectedRows.value.map((r) => r.id));
  message.success('批量启用成功');
  pageReload();
}

async function handleBatchDisable() {
  await batchOptions(BatchOptionsType.DISABLE, selectedRows.value.map((r) => r.id));
  message.success('批量停用成功');
  pageReload();
}
</script>

<template>
  <Page>
    <Grid>
      <template #capability="{ row }">
        <Tag :bordered="false" :color="CAPABILITY_MAP[row.capability || '']?.color || 'default'">
          {{ CAPABILITY_MAP[row.capability || '']?.label || row.capability || '-' }}
        </Tag>
      </template>

      <template #source="{ row }">
        <Tag :bordered="false" :color="SOURCE_MAP[row.source || '']?.color || 'default'">
          {{ SOURCE_MAP[row.source || '']?.label || row.source || '-' }}
        </Tag>
      </template>

      <template #status="{ row }">
        <Switch :checked="row.status === 1" @click="toggleStatus(row)" />
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openDrawer(row)">{{ $t('common.edit') }}</Button>
        <Button danger type="link" @click="handleDelete(row)">{{ $t('common.delete') }}</Button>
      </template>

      <template #toolbar-tools>
        <Dropdown :disabled="selectedRows.length === 0" placement="bottomCenter" trigger="click">
          <Button class="mr-2" :disabled="selectedRows.length === 0">
            {{ $t('common.batch_options') }}
          </Button>
          <template #overlay>
            <Menu>
              <MenuItem @click="handleBatchEnable">批量启用</MenuItem>
              <MenuItem @click="handleBatchDisable">批量停用</MenuItem>
              <MenuItem @click="handleBatchDelete">批量删除</MenuItem>
            </Menu>
          </template>
        </Dropdown>
        <Button class="mr-2" type="primary" @click="openDrawer()">
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>

    <CreateDrawer @page-reload="pageReload" />
  </Page>
</template>
