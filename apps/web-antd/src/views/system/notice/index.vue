<script lang="ts" setup name="NoticeManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';

import {Page, useVbenDrawer, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch} from 'ant-design-vue';
import {noticeApi} from '#/api';
import {BatchOptionsType, STATUS_SELECT, TABLE_COMMON_COLUMNS} from '#/constants/locales';

import CreateNotice from './create-notice.vue';
import type {NoticeItem} from "#/api/models";

const [CreateNoticeDrawer, baseDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: CreateNotice,
  closeOnPressEscape: true,
  footer: true,
});


async function handlerState(row: NoticeItem) {
  if (row.status == 1) {
    await noticeApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
    })
  } else {
    await noticeApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
    })
  }
  pageReload();
}


async function handlerDelete(row: NoticeItem) {
  await noticeApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
  })
  pageReload();
}

function openBaseDrawer(row?: NoticeItem) {
  if (row) {
    baseDrawerApi.setData(row);
  }else {
    baseDrawerApi.setData({})
  }
  baseDrawerApi.open();
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

const gridOptions: VxeGridProps<NoticeItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    {title: '序号', type: 'seq', width: 50, type: 'checkbox', width: 100},
    ...TABLE_COMMON_COLUMNS,
    {field: 'title', title: `${$t('system.notice.columns.title')}`},
    {field: 'level', title: `${$t('system.notice.columns.level')}`},
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await noticeApi.getNoticeList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #action="{ row }">
          <Button type="link" @click="openBaseDrawer(row)">{{ $t('common.edit') }}</Button>
          <Button type="link" @click="handlerDelete(row)">{{ $t('common.delete') }}</Button>
        </template>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openBaseDrawer()">
            {{$t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateNoticeDrawer @page-reload="pageReload"/>
  </div>
</template>
