<script lang="ts" setup name="MainBodyManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {MainBodyItem} from '#/api/models';
import type {CreateMenuRequest, UpdateMenuRequest} from '#/api/models/menu';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch, Tag} from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {mainBodyApi} from '#/api';
import {
  BatchOptionsType,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import Create from './create.vue';

const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create,
  centered: true,
  modal: true,
});

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createModalApi.setData(row);
  } else {
    createModalApi.setData({});
  }
  createModalApi.open();
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
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  // 默认展开
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
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
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
    ...TABLE_COMMON_COLUMNS,
  ],
  checkboxConfig: {
    checkAll: false,
    highlight: true,
    labelField: 'id',
    range: true,
  },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
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
    search: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

const pageReload = () => {
  gridApi.reload();
};
</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @click="handlerState(row)"/>
        </template>

        <template #sex="{ row }">
          <Tag v-if="row.sex == 1">{{ $t('common.boy') }}</Tag>
          <Tag v-else>{{ $t('common.girl') }}</Tag>
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openBaseDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateModal @page-reload="pageReload"/>
  </div>
</template>
