<script setup lang="ts">
import { trimObject } from '#/utils/trim';
import { useVbenDrawer, Page } from '@vben/common-ui';
import type { VbenFormProps } from '@vben/common-ui';
import type { DspItem } from '#/api/models';
import type { VxeGridProps } from '#/adapter/vxe-table';
import {Button, Dropdown, Menu, MenuItem, Switch, Tag} from 'ant-design-vue';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { dspApi } from '#/api/core/adx.ts';
import {$t} from '@vben/locales';
import CreateDSpDrawer from './create.vue';

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('adx.dsp.columns.name')}`,
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<DspItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'name',
      title: `${$t('adx.dsp.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'platform',
      title: `${$t('adx.dsp.columns.platform')}`,
      width: 'auto',
    },
    {
      field: 'api',
      title: `${$t('adx.dsp.columns.api')}`,
      width: 'auto',
    },
    {
      field: 'apiVersion',
      title: `${$t('adx.dsp.columns.apiVersion')}`,
      width: 'auto',
    },
    {
      field: 'qpsLimit',
      title: `${$t('adx.dsp.columns.qpsLimit')}`,
      width: 'auto',
    },
    {
      field: 'weight',
      title: `${$t('adx.dsp.columns.weight')}`,
      width: 'auto',
      showFooterOverflow: "tooltip"
    },
    {
      field: 'remark',
      title: `${$t('adx.dsp.columns.remark')}`,
      width: 'auto',
      showFooterOverflow: "tooltip"
    },

    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);

        return await dspApi.fetchDspList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
 connectedComponent: CreateDSpDrawer,
})
function openCreateDrawer(row?: DspItem) {
  if (row?.id) {
    createDrawerApi.setData(row);
  } else {
    createDrawerApi.setData({});
  }
  createDrawerApi.open();
}
function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="()=>openCreateDrawer()">
            {{ $t('common.create') }}
          </Button>
        </template>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="openCreateDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateDrawer @page-reload="pageReload"/>
  </div>
</template>

<style scoped lang="scss">

</style>
