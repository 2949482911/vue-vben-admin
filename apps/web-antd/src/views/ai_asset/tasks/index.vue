<script lang="ts" setup name="AiAssetTasks">
/**
 * AI 资产 — 生成任务队列
 *
 * 异步生成任务：SUBMITTED→QUEUED→RUNNING→SUCCEEDED/FAILED/CANCELLED。
 * 接口：task/list（分页）、task/cancel（取消）。
 */
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { GenerationTaskItem } from '#/api/models/ai_asset';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aiAssetApi } from '#/api';

import {
  ASSET_SKILL_MAP,
  ASSET_SKILL_OPTIONS,
  CANCELABLE_TASK_STATUS,
  TASK_STATUS_MAP,
  TASK_STATUS_OPTIONS,
} from '../constants';

const formOptions: VbenFormProps = {
  collapsed: true,
  compact: true,
  schema: [
    {
      component: 'Select',
      componentProps: { allowClear: true, options: ASSET_SKILL_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'skill',
      label: 'Skill',
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: TASK_STATUS_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: true,
};

const gridOptions: VxeGridProps<GenerationTaskItem> = {
  columns: [
    { field: 'id', title: '任务ID', width: 100 },
    { field: 'skill', slots: { default: 'skill' }, title: 'Skill', width: 110 },
    { field: 'model', title: '模型', minWidth: 160 },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 130 },
    { field: 'cost', title: '成本', width: 100 },
    { field: 'errorMsg', title: '错误信息', minWidth: 180, showOverflow: true },
    { field: 'finishedAt', formatter: 'formatDateTime', title: '完成时间', minWidth: 170 },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间', minWidth: 170 },
    { slots: { default: 'action' }, title: '操作', width: 100 },
  ],
  height: 'auto',
  pagerConfig: { enabled: true },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await aiAssetApi.fetchTaskList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...(args as Record<string, any>),
        });
      },
    },
  },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

function canCancel(status?: number) {
  return CANCELABLE_TASK_STATUS.includes(status ?? 0);
}

function handleCancel(row: GenerationTaskItem) {
  Modal.confirm({
    title: '取消任务',
    content: `确认取消生成任务 #${row.id}？`,
    okText: '确认取消',
    async onOk() {
      await aiAssetApi.cancelTask(row.id);
      message.success('已取消');
      pageReload();
    },
  });
}
</script>

<template>
  <Page>
    <Grid>
      <template #skill="{ row }">
        {{ ASSET_SKILL_MAP[row.skill || ''] || row.skill || '-' }}
      </template>

      <template #status="{ row }">
        <Tag :bordered="false" :color="TASK_STATUS_MAP[row.status ?? 0]?.color || 'default'">
          {{ TASK_STATUS_MAP[row.status ?? 0]?.label || row.status || '-' }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button v-if="canCancel(row.status)" danger type="link" @click="handleCancel(row)">
          取消
        </Button>
        <span v-else>-</span>
      </template>
    </Grid>
  </Page>
</template>
