<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type {
  CreateMenuRequest,
  MenuItem,
  UpdateMenuRequest,
} from '#/api/models/menu';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchMenuTree } from '#/api';

import CreateMenu from './create-menu.vue';

const [CreateMenuDrawer, baseDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: CreateMenu,
  closeOnPressEscape: true,
  footer: false,
});

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    baseDrawerApi.setData(row);
  }
  baseDrawerApi.open();
}

const gridOptions: VxeGridProps<MenuItem> = {
  columns: [
    {
      field: 'title',
      minWidth: 300,
      title: `${$t('system.menu.columns.title')}`,
      treeNode: true,
    },
    {
      field: 'name',
      minWidth: 300,
      title: `${$t('system.menu.columns.name')}`,
    },
    {
      field: 'type',
      minWidth: 300,
      title: `${$t('system.menu.columns.type')}`,
      slots: { default: 'type' },
    },
    {
      field: 'icon',
      minWidth: 300,
      title: `${$t('system.menu.columns.icon')}`,
    },
    {
      field: 'path',
      minWidth: 300,
      title: `${$t('system.menu.columns.path')}`,
    },
    {
      field: 'component',
      minWidth: 300,
      title: `${$t('system.menu.columns.component')}`,
    },
    {
      field: 'redirect',
      minWidth: 300,
      title: `${$t('system.menu.columns.redirect')}`,
    },
    {
      field: 'backendUrl',
      minWidth: 300,
      title: `${$t('system.menu.columns.backendUrl')}`,
    },
    {
      field: 'mark',
      minWidth: 300,
      title: `${$t('system.menu.columns.mark')}`,
    },
    {
      field: 'sort',
      minWidth: 300,
      title: `${$t('system.menu.columns.sort')}`,
    },

    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: { default: 'action' },
      width: 256,
    },
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({}) => {
        return await fetchMenuTree();
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
      <template #type="{ row }">
        <ATag v-if="row.type === 1">{{ $t('system.menu.type.menu') }}</ATag>
        <ATag v-if="row.type === 2">
          {{ $t('system.menu.type.interface') }}
        </ATag>
        <ATag v-if="row.type === 3">{{ $t('system.menu.type.button') }}</ATag>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">编辑</Button>
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="expandAll">
          展开全部
        </Button>
        <Button type="primary" @click="collapseAll"> 折叠全部 </Button>
      </template>
    </Grid>
  </Page>
  <CreateMenuDrawer @page-reload="pageReload" />
</template>
