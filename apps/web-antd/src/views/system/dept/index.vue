<script lang="ts" setup>
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import type {CreateMenuRequest, MenuItem, UpdateMenuRequest,} from '#/api/models/menu';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch} from 'ant-design-vue';
import {orgApi} from '#/api';

import Create from './create.vue';
import {TABLE_COMMON_COLUMNS} from "#/constants/locales";


const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create,
  centered: true,
  modal: true,
});


function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createModalApi.setData(row);
  }else {
    createModalApi.setData({})
  }
  createModalApi.open();
}

const gridOptions: VxeGridProps<MenuItem> = {
  columns: [
    ...TABLE_COMMON_COLUMNS,
    {
      field: 'name',
      minWidth: 300,
      title: `${$t('system.org.columns.name')}`,
      treeNode: true,
    },
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({}) => {
        return await orgApi.fetchOrgTree();
      },
    },
    response: {
      list: (params) => {
        return params.data;
      },
    },
  },
  pagerConfig: {
    enabled: false,
  },
  treeConfig: {
    childrenField: 'children',
    parentField: 'parentId',
    rowField: 'id',
    transform: false,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const expandAll = () => {
  gridApi.grid?.setAllTreeExpand(true);
};

const collapseAll = () => {
  gridApi.grid?.setAllTreeExpand(false);
};

const pageReload = () => {
  gridApi.reload();
};
</script>

<template>
  <Page>
    <Grid :table-title="$t('system.menu.title')">

      <template #status="{ row }">
        <Switch :checked="row.status == 1" />
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">
          {{$t('common.edit')}}
        </Button>
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
          {{$t('common.create')}}
        </Button>
      </template>
    </Grid>
  </Page>
  <CreateModal @page-reload="pageReload" />
</template>
