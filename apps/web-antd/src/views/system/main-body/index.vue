<script lang="ts" setup name="MainBodyManager">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MainBodyItem } from '#/api/models';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { mainBodyApi } from '#/api';
import {
  BatchOptionsType,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import Create from './create.vue';
import ComboHistoryDrawer from './ComboHistoryDrawer.vue';

const [CreateDrawerModule, createDrawerApi] = useVbenDrawer({
  connectedComponent: Create,
});

const [ComboHistoryDrawerModule, comboHistoryDrawerApi] = useVbenDrawer({
  connectedComponent: ComboHistoryDrawer,
});

function openCreateDrawer(row?: MainBodyItem) {
  if (row) {
    createDrawerApi.setData(row);
  } else {
    createDrawerApi.setData({});
  }
  createDrawerApi.open();
}

function openComboHistoryDrawer(row: MainBodyItem) {
  comboHistoryDrawerApi.setData(row);
  comboHistoryDrawerApi.open();
}

async function handlerState(row: MainBodyItem) {
  await (row.status == 1
    ? mainBodyApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>()
    })
    : mainBodyApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>()
    }));
  pageReload();
}

async function handlerDelete(row: MainBodyItem) {
  await mainBodyApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>()
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('system.mainbody.columns.name')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'status',
      label: `${$t('core.columns.status')}`,
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<MainBodyItem> = {
  columns: [
    {
      field: 'name',
      title: `${$t('system.mainbody.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'email',
      title: `${$t('system.mainbody.columns.email')}`,
      width: 'auto',
    },
    {
      field: 'remark',
      title: `${$t('system.mainbody.columns.remark')}`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any,
  ],
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await mainBodyApi.fetchMainList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args,
        });
      },
    },
  },
  pagerConfig: {
    enabled: true,
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const pageReload = () => {
  gridApi.reload();
};
</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @click="handlerState(row)" />
        </template>

        <template #sex="{ row }">
          <Tag v-if="row.sex == 1">{{ $t('common.boy') }}</Tag>
          <Tag v-else>{{ $t('common.girl') }}</Tag>
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openCreateDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="openComboHistoryDrawer(row)">
            查看套餐
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openCreateDrawer(null)">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateDrawerModule @page-reload="pageReload" />
    <ComboHistoryDrawerModule />
  </div>
</template>