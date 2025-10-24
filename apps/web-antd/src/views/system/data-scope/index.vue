<script lang="ts" setup name="DataRangeManager">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type {
  CreateMenuRequest,
  MenuItem,
  UpdateMenuRequest,
} from '#/api/models/menu';
import type { DataRangeItem, OrgItem } from '#/api/models/users';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { dataRangeApi, orgApi } from '#/api';
import {
  BatchOptionsType,
  DATA_SCOPE,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import Create from './create.vue';

const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create,
  centered: true,
  modal: true,
});

const orgTreeData = ref<OrgItem[]>([]);

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createModalApi.setData(row);
  } else {
    createModalApi.setData({});
  }
  createModalApi.open();
}

async function handlerState(row: DataRangeItem) {
  await (row.status == 1
    ? dataRangeApi.fetchBatchOptions({
        targetIds: [row.id],
        type: BatchOptionsType.DISABLE,
      })
    : dataRangeApi.fetchBatchOptions({
        targetIds: [row.id],
        type: BatchOptionsType.Enable,
      }));
  pageReload();
}

async function handlerDelete(id: string) {
  await dataRangeApi.fetchBatchOptions({
    targetIds: [id],
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
      label: `${$t('system.user.columns.nickname')}`,
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

const gridOptions: VxeGridProps<MenuItem> = {
  columns: [
    {
      field: 'name',
      title: `${$t('system.data_scope.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'type',
      title: `${$t('system.data_scope.columns.type')}`,
      slots: { default: 'type' },
      width: 'auto',
    },
    {
      field: 'code',
      title: `${$t('system.data_scope.columns.code')}`,
      width: 'auto',
    },
    {
      field: 'remark',
      title: `${$t('system.data_scope.columns.remark')}`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS,
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await dataRangeApi.fetchDataRangeList({
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

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const pageReload = () => {
  gridApi.reload();
};

onMounted(() => {
  orgApi.fetchOrgTree().then((res) => {
    orgTreeData.value = res;
  });
});
</script>

<template>
  <div>
    <Page>
      <Grid :table-title="$t('system.user.title')">
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @click="handlerState(row)" />
        </template>

        <template #type="{ row }">
          <Tag>
            {{ DATA_SCOPE.filter((x) => x.value == row.type)[0].label }}
          </Tag>
        </template>

        <template #sex="{ row }">
          <Tag v-if="row.sex == 1">{{ $t('common.boy') }}</Tag>
          <Tag v-else>{{ $t('common.girl') }}</Tag>
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openBaseDrawer(row)">
            {{ $t('common.edit') }}
          </Button>

          <Button type="link" @click="handlerDelete(row.id)">
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
    <CreateModal @page-reload="pageReload" />
  </div>
</template>
