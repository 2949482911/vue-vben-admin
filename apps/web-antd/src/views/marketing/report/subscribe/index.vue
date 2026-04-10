<script lang="ts" setup>
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {ReportSubscriptionItem, UpdateSubscribeType} from '#/api/models/marketing';
import { PLATFORM, DIMS } from "#/constants/locales";
import { Page, useVbenDrawer} from '@vben/common-ui';
import {$t} from '@vben/locales';

import { Tag, Switch, Button, message } from 'ant-design-vue';
import { trimObject } from '#/utils/trim';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { subscribeApi } from '#/api';
import {
  TASK_STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
  BatchOptionsType
} from '#/constants/locales';
import {RuleType} from "#/constants/enums";
import CreateObjectRequestComp from './create.vue';//新增|修改弹窗
import { formatDateTime } from "@vben/utils";
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      label: `${$t('marketing.report.subscribe.id')}`,
    },
    {
      component: 'Select',
      componentProps: {
        options: PLATFORM
      },
      fieldName: 'platform',
      label: `${$t('marketing.report.subscribe.platform')}`,
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('marketing.report.subscribe.name')}`,
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<ReportSubscriptionItem> = {
  columns: [
    {
      field: 'id',
      title: `${$t('marketing.report.subscribe.id')}`,
      width: 'auto',
    },
    {
      field: 'name',
      title: `${$t('marketing.report.subscribe.name')}`,
      width: 'auto',
    },
    {
      field: 'platform',
      title: `${$t('marketing.report.subscribe.platform')}`,
      width: 'auto',
    },
    {
      field: 'subscribeDateTimeRange',
      title: `${$t('marketing.report.subscribe.subscribeDateTimeRange')}`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        const res =  await subscribeApi.fetchGetSubscribe({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
        const newRes = res.items.map((item: UpdateSubscribeType) => {
          return {
            ...item,
            platform: item?.config?.platform.join(','),
            subscribeDateTimeRange: `${item.subscribeDateTimeRange[0]}~${item.subscribeDateTimeRange[1]}`,
            
          }
        })
        res.items = newRes
        return res
      },
    },
  },
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
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
function pageReload() {
  gridApi.reload();
}
async function handlerState(row: UpdateSubscribeType) {
  let type = 'disable';
  if(row.status === 9 ) {
    type = 'enable'
  }
  const params = {
    targetIds:[row?.id],
    type,
    values:{}
  }
  await subscribeApi.fetchBatchSubscribe(params)
  message.success('修改成功')
  pageReload()
}
/**
 * 创建弹窗
 */
const [CreateObjectDrawer, createObjectApi] = useVbenDrawer({
  connectedComponent: CreateObjectRequestComp
});
function openCreateDrawer(row?: UpdateSubscribeType) {
  if (row?.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}
async function handlerDelete(row: ReportSubscriptionItem){
  const params = {
    targetIds:[row?.id],
    type: 'delete',
    values:{}
  }
  await subscribeApi.fetchBatchSubscribe(params)
  message.success('删除成功')
  pageReload()
}
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => openCreateDrawer()">
            {{ $t('common.create') }}
          </Button>
          </template>
          <template #action="{ row }">
          <Button type="link" @click="openCreateDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
          </template>
      </Grid>
    </Page>
    <CreateObjectDrawer @page-reload="pageReload"/>
  </div>
</template>
