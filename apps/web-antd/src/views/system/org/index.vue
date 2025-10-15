<script lang="ts" setup name="DeptManager">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type {
  CreateMenuRequest,
  MenuItem,
  UpdateMenuRequest,
} from '#/api/models/menu';
import type { OrgItem } from '#/api/models/users';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Switch } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { orgApi } from '#/api';
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from '#/constants/locales';

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

async function handlerState(row: OrgItem) {
  await (row.status === 1
    ? orgApi.fetchBatchOptions({
        targetIds: [row.id],
        type: BatchOptionsType.DISABLE,
      })
    : orgApi.fetchBatchOptions({
        targetIds: [row.id],
        type: BatchOptionsType.Enable,
      }));
  pageReload();
}

async function handlerDelete(row: OrgItem) {
  await orgApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.DELETE,
  });
  await pageReload();
}

const gridOptions: VxeGridProps<MenuItem> = {
  columns: [
    {
      field: 'name',
      minWidth: 300,
      title: `${$t('system.org.columns.name')}`,
      treeNode: true,
    },
    ...TABLE_COMMON_COLUMNS,
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
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
const pageReload = () => {
  gridApi.reload();
};
</script>

<template>
  <div>
    <Page>
      <Grid :table-title="$t('system.menu.title')">
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @click="handlerState(row)" />
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
          <Button class="mr-2" type="primary" @click="pageReload()">
            {{ $t('common.search') }}
          </Button>
          <Button class="mr-2" type="primary" @click="openBaseDrawer">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateModal @page-reload="pageReload" />
  </div>
</template>
