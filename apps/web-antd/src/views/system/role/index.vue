<script lang="ts" setup name="RoleManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {
  CreateRoleRequest,
  RoleItem,
  UpdateRoleRequest,
} from '#/api/models';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch, Tag} from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {roleApi} from '#/api/core/role';
import {
  ROLE_TYPE_OPTIONS,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import CreateRole from '#/views/system/role/create-role.vue';

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('system.role.columns.name')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ROLE_TYPE_OPTIONS,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'roleType',
      label: `${$t('system.role.columns.roleType')}`,
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

const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: CreateRole,
  centered: true,
  modal: true,
});

/**
 *
 * @param row
 */
function openCreateModal(row: CreateRoleRequest | UpdateRoleRequest) {
  if (row.id) {
    createModalApi.setData(row);
  } else {
    createModalApi.setData({});
  }
  createModalApi.open();
}

function handlerDelete(id: string) {
  roleApi.fetchDeleteRole(id).then(() => {
    pageReload();
  });
}

async function handlerState(row: RoleItem) {
  await (row.status == 1
    ? roleApi.fetchDisableRole(row.id)
    : roleApi.fetchEnableRole(row.id));
  pageReload();
}

const gridOptions: VxeGridProps<RoleItem> = {
  border: true,
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true,
  },
  columns: [
    {
      field: 'name',
      title: `${$t('system.role.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'roleType',
      title: `${$t('system.role.columns.roleType')}`,
      slots: {default: 'roleType'},
      width: 'auto',
    },
    {field: 'comment', title: `${$t('system.role.columns.comment')}`, width: 'auto',},
    {
      field: 'isSystem',
      title: `${$t('system.role.columns.isSystem')}`,
      slots: {default: 'isSystem'},
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS,
  ],
  pagerConfig: {
    enabled: true,
  },
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async (params) => {
        return await roleApi.fetchRoleList({
          page: params.page.currentPage,
          pageSize: params.page.pageSize,
        });
      },
    },
    autoLoad: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.query();
}
</script>

<template>
  <Page>
    <Grid>
      <template #status="{ row }">
        <Switch :checked="row.status == 1" @change="handlerState(row)"/>
      </template>

      <template #isSystem="{ row }">
        <Switch :checked="row.isSystem == 1"/>
      </template>

      <template #roleType="{ row }">
        <Tag>
          {{
            ROLE_TYPE_OPTIONS.filter((x) => x.value == row.roleType)[0].label
          }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openCreateModal(row)">
          {{ $t('common.edit') }}
        </Button>
        <Button type="link" @click="handlerDelete(row.id)">
          {{ $t('common.delete') }}
        </Button>
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openCreateModal">
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>

    <CreateModal @page-reload="pageReload"/>
  </Page>
</template>
