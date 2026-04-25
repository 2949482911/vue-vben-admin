<script setup lang="ts">
import { trimObject } from '#/utils/trim';
import { useVbenDrawer, Page } from '@vben/common-ui';
import type { VbenFormProps } from '@vben/common-ui';
import type { CampaignItem } from '#/api/models';
import type { VxeGridProps } from '#/adapter/vxe-table';
import {Button, Dropdown, Menu, MenuItem, Switch, Tag} from 'ant-design-vue';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { campaignApi } from '#/api/core/adx.ts';
import {$t} from '@vben/locales';
import CreateDSpDrawer from './create.vue';

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('adx.campaign.columns.name')}`,
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<CampaignItem> = {
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
      title: `${$t('adx.campaign.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'daypartingConfig',
      title: `${$t('adx.campaign.columns.daypartingConfig')}`,
      width: 'auto',
    },
    {
      field: 'dailyBudget',
      title: `${$t('adx.campaign.columns.dailyBudget')}`,
      width: 'auto'
    },
    {
      field: 'spentToday',
      title: `${$t('adx.campaign.columns.spentToday')}`,
      width: 'auto'
    },
    {
      field: 'spentTotal',
      title: `${$t('adx.campaign.columns.spentTotal')}`,
      width: 'auto'
    },
    {
      field: 'qpsLimit',
      title: `${$t('adx.campaign.columns.qpsLimit')}`,
      width: 'auto'
    },
    {
      field: 'currentQps',
      title: `${$t('adx.campaign.columns.currentQps')}`,
      width: 'auto'
    },
    {
      field: 'pacingType',
      title: `${$t('adx.campaign.columns.pacingType')}`,
      width: 'auto'
    },
    {
      field: 'pacingRate',
      title: `${$t('adx.campaign.columns.pacingRate')}`,
      width: 'auto'
    },
    {
      field: 'priority',
      title: `${$t('adx.campaign.columns.priority')}`,
      width: 'auto'
    },
    {
      field: 'tmaxMs',
      title: `${$t('adx.campaign.columns.tmaxMs')}`,
      width: 'auto'
    },
    {
      field: 'startTime',
      title: `${$t('adx.campaign.columns.startTime')}`,
      width: 'auto',
      formatter: 'formatDateTime',
    },
    {
      field: 'endTime',
      title: `${$t('adx.campaign.columns.endTime')}`,
      width: 'auto',
      formatter: 'formatDateTime',
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

        return await campaignApi.fetchCampaignList({
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
function openCreateDrawer(row?: CampaignItem) {
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
