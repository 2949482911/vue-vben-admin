<script lang="ts" setup name="AccountManager">

import type {VxeGridProps, VxeGridListeners} from '#/adapter/vxe-table';
import type {DownloadCenterItem} from '#/api/models/tools';
import type {VbenFormProps} from '@vben/common-ui';
import { Page} from '@vben/common-ui';
import {$t} from '@vben/locales';

import { Switch, Tag } from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {downloadCenterApi} from '#/api/core/tools';
import {
  TASK_STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { trimObject } from '#/utils/trim';
const gridOptions: VxeGridProps<DownloadCenterItem> = {
  columns: [
    {
      field: 'name',
      title: `${$t('tools.downcenter.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'type',
      title: `${$t('tools.downcenter.columns.type')}`,
      width: 'auto',
    },
    {
      field: 'downloadUrl',
      title: `${$t('tools.downcenter.columns.downloadUrl')}`,
      slots: {default: 'downloadUrl'},
      width: 'auto',
    },
    {
      field: 'taskState',
      title: `${$t('tools.downcenter.columns.taskState')}`,
      slots: {default: 'taskState'},
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
         const params = trimObject(args);
        return await downloadCenterApi.fetchDownloadList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
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

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      label: `id`,
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('tools.downcenter.columns.name')}`,
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: `${$t('tools.downcenter.columns.type')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {label: $t('common.pending'), value: 0},
          {label: $t('common.processing'), value: 1},
          {label: $t('common.completed'), value: 2},
          {label: $t('common.failed'), value: 3},
        ],
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'taskState',
      label: `${$t('tools.downcenter.columns.taskState')}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});
</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" />
        </template>
        <template #downloadUrl="{ row }">
           <a class="downloadLink" :href="row.downloadUrl" :download="row.name">点击下载</a>
        </template>
        <template #taskState="{ row }">
          <Tag v-if="row.taskState === 0" color="orange">{{ $t('common.pending') }}</Tag>
          <Tag v-if="row.taskState === 1" color="blue">{{ $t('common.processing') }}</Tag>
          <Tag v-if="row.taskState === 2" color="green">{{ $t('common.completed') }}</Tag>
          <Tag v-if="row.taskState === 3" color="red">{{ $t('common.failed') }}</Tag>
        </template>
      </Grid>
    </Page>
  </div>
</template>
<style lang="scss" scoped>
.downloadLink {
  color: hsl(var(--primary));
  cursor:pointer;
}
</style>
