<script lang="ts" setup name="NoticeManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';

import {Page, useVbenDrawer, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch} from 'ant-design-vue';
import {noticeApi} from '#/api';
import {STATUS_SELECT, TABLE_COMMON_COLUMNS} from '#/constants/locales';

import CreateNotice from './create-notice.vue';

const [CreateNoticeDrawer, baseDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: CreateNotice,
  closeOnPressEscape: true,
  footer: false,
});

function openBaseDrawer(row?: RowType) {
  if (row) {
    baseDrawerApi.setData(row);
  }
  baseDrawerApi.open();
}

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
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: `${$t('system.notice.columns.title')}`,
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: 'Date',
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

const gridOptions: VxeGridProps<RowType> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50, type: 'checkbox', width: 100 },
    ...TABLE_COMMON_COLUMNS,
    { field: 'title', title: `${$t('system.notice.columns.title')}` },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        return await noticeApi.getNoticeList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
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
<div>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">{{$t('common.edit')}}</Button>
        <Button type="link">{{$t('common.delete')}}</Button>
      </template>
      <template #status="{ row }">
        <Switch :checked="row.status === 1" />
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
  <CreateNoticeDrawer @page-reload="pageReload" />
</div>
</template>
