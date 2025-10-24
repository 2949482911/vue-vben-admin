<script lang="ts" setup name="MenuManager">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type {
  CreateMenuRequest,
  MenuItem,
  UpdateMenuRequest,
} from '#/api/models/menu';

import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { menuApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import CreateMenu from './create-menu.vue';

const [CreateMenuModal, createMenuModalApi] = useVbenModal({
  connectedComponent: CreateMenu,
  centered: true,
  modal: true,
});

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createMenuModalApi.setData(row);
  } else {
    createMenuModalApi.setData({});
  }
  createMenuModalApi.open();
}

function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.menu.type.menu'),
      value: 1,
    },
    { color: 'default', label: $t('system.menu.type.interface'), value: 2 },
    { color: 'error', label: $t('system.menu.type.button'), value: 3 },
  ];
}

const gridOptions: VxeGridProps<MenuItem> = {
  columns: [
    {
      field: 'title',
      minWidth: 300,
      title: `${$t('system.menu.columns.title')}`,
      treeNode: true,
      slots: { default: 'title' },
    },
    {
      field: 'name',
      minWidth: 300,
      title: `${$t('system.menu.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'type',
      minWidth: 300,
      cellRender: { name: 'CellTag', options: getMenuTypeOptions() },
      title: `${$t('system.menu.columns.type')}`,
      slots: { default: 'type' },
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
        return await menuApi.fetchMenuTree();
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
    expandAll: false,
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true,
  },
};

/**
 * delete menu
 */
const handlerDeleteMenu = async (id) => {
  await menuApi.fetchBatchOptions({
    targetIds: [id],
    type: BatchOptionsType.Delete,
    values: {},
  });
  pageReload();
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
  <div>
    <Page>
      <Grid :table-title="$t('system.menu.title')">
        <template #title="{ row }">
          <div class="flex w-full items-center gap-1">
            <div class="size-5 flex-shrink-0">
              <IconifyIcon
                v-if="row.type === 2"
                icon="carbon:security"
                class="size-full"
              />
              <IconifyIcon
                v-else-if="row.icon"
                :icon="row.icon || 'carbon:circle-dash'"
                class="size-full"
              />
            </div>
            <span class="flex-auto">{{ $t(row.title) }}</span>
            <div class="items-center justify-end"></div>
          </div>
          <MenuBadge
            v-if="row.badgeType"
            class="menu-badge"
            :badge="row.badge"
            :badge-type="row.badgeType"
            :badge-variants="row.badgeVariants"
          />
        </template>

        <template #type="{ row }">
          <Tag v-if="row.type === 1">{{ $t('system.menu.type.menu') }}</Tag>
          <Tag v-if="row.type === 2">
            {{ $t('system.menu.type.interface') }}
          </Tag>
          <Tag v-if="row.type === 3">{{ $t('system.menu.type.button') }}</Tag>
        </template>

        <template #action="{ row }">
          <Button
            type="link"
            @click="openBaseDrawer({ parentId: row.id, sort: row.sort + 1 })"
          >
            {{ $t('common.create') }}
          </Button>
          <Button type="link" @click="openBaseDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDeleteMenu(row.id)">
            {{ $t('common.delete') }}
          </Button>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
            {{ $t('common.create') }}
          </Button>
          <Button class="mr-2" type="primary" @click="expandAll">
            展开全部
          </Button>
          <Button type="primary" @click="collapseAll"> 折叠全部</Button>
        </template>
      </Grid>
    </Page>
    <CreateMenuModal @page-reload="pageReload" />
  </div>
</template>

<style lang="less" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
