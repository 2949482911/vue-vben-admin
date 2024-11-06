<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, type VbenFormProps } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Switch } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchOrderList } from '#/api';

interface RowType {
  id: string;
  title: string;
  createTime: string;
  updateTime: string;
  createUsername: string;
  updateUsername: string;
  status: number;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'orderNo',
      label: `${$t('pay.order.columns.orderNo')}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50, type: 'checkbox', width: 100 },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      title: `${$t('core.columns.createTime')}`,
    },
    {
      field: 'updateTime',
      formatter: 'formatDateTime',
      title: `${$t('core.columns.updateTime')}`,
    },
    { field: 'orderNo', title: `${$t('pay.order.columns.orderNo')}` },
    { field: 'payId', title: `${$t('pay.order.columns.payId')}` },
    { field: 'thirdOrderNo', title: `${$t('pay.order.columns.thirdOrderNo')}` },
    { field: 'money', title: `${$t('pay.order.columns.money')}` },
    { field: 'realityMoney', title: `${$t('pay.order.columns.realityMoney')}` },
    { field: 'type', title: `${$t('pay.order.columns.type')}` },
    {
      field: 'returnSuccess',
      title: `${$t('pay.order.columns.returnSuccess')}`,
    },
    {
      field: 'closeDate',
      title: `${$t('pay.order.columns.returnSuccess')}`,
      formatter: 'formatDateTime',
    },
    {
      field: 'payTime',
      title: `${$t('pay.order.columns.returnSuccess')}`,
      formatter: 'formatDateTime',
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: { default: 'action' },
      width: 256,
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await fetchOrderList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">编辑</Button>
      </template>
      <template #status="{ row }">
        <Switch v-model:checked="row.status" />
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openBaseDrawer()">
          新增
        </Button>
        <Button class="mr-2" type="primary" @click="() => gridApi.query()">
          刷新当前页面
        </Button>
        <Button class="mr-2" type="primary" @click="() => gridApi.reload()">
          刷新并返回第一页
        </Button>
      </template>
    </Grid>
  </Page>
</template>
