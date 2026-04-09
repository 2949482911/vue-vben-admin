<script lang="ts" setup name="AccountManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {CreationTaskItem} from '#/api/models/marketing';

import { Page} from '@vben/common-ui';
import {$t} from '@vben/locales';

import { Tag, Switch } from 'ant-design-vue';
import { trimObject } from '#/utils/trim';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { creationTaskApi } from '#/api';
import {
  TASK_STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
  BatchOptionsType
} from '#/constants/locales';
import {RuleType} from "#/constants/enums";
import { formatDateTime } from "@vben/utils";
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
      fieldName: 'platform',
      label: `${$t('marketing.creation.columns.platform')}`,
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('marketing.creation.columns.name')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: TASK_STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'taskStatus',
      label: `${$t('marketing.creation.columns.taskStatus')}`,
    },
    {
      component: 'Input',
      fieldName: 'projectId',
      label: `${$t('marketing.creation.columns.projectId')}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<CreationTaskItem> = {
  columns: [
    {
      field: 'platform',
      title: `${$t('marketing.creation.columns.platform')}`,
      width: 'auto',
    },
    {
      field: 'name',
      title: `${$t('marketing.creation.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'ruleType',
      title: `${$t('marketing.creation.columns.ruleType')}`,
      slots: {default: 'ruleType'},
      width: 'auto',
    },
    {
      field: 'taskStatus',
      title: `${$t('marketing.creation.columns.taskStatus')}`,
      slots: {default: 'taskStatus'},
      width: 'auto',
    },
    {
      field: 'projectId',
      title: `${$t('marketing.creation.columns.projectId')}`,
      width: 'auto',
    },
    {
      field: 'commitAdvertiserCount',
      title: `${$t('marketing.creation.columns.commitAdvertiserCount')}`,
      width: 'auto',
    },
    {
      field: 'commitCampaignCount',
      title: `${$t('marketing.creation.columns.commitCampaignCount')}`,
      width: 'auto',
    },
    {
      field: 'successCampaignCount',
      title: `${$t('marketing.creation.columns.successCampaignCount')}`,
      width: 'auto',
    },
    {
      field: 'commitAdGroupCount',
      title: `${$t('marketing.creation.columns.commitAdGroupCount')}`,
      width: 'auto',
    },
    {
      field: 'successAdGroupCount',
      title: `${$t('marketing.creation.columns.successAdGroupCount')}`,
      width: 'auto',
    },
    {
      field: 'commitPromotionCount',
      title: `${$t('marketing.creation.columns.commitPromotionCount')}`,
      width: 'auto',
    },
    {
      field: 'successPromotionCount',
      title: `${$t('marketing.creation.columns.successPromotionCount')}`,
      width: 'auto',
    },
    {
      field: 'commitCreativeCount',
      title: `${$t('marketing.creation.columns.commitCreativeCount')}`,
      width: 'auto',
    },
    {
      field: 'successCreativeCount',
      title: `${$t('marketing.creation.columns.successCreativeCount')}`,
      width: 'auto',
    },
    {
      field: 'startTime',
      formatter: 'formatDateTime',
      title: `${$t('marketing.creation.columns.startTime')}`,
      width: 'auto',
    },
    {
      field: 'endTime',
      formatter: ({ cellValue }) => {
      // 1. 过滤空值：如果值为空/undefined/null/空字符串，返回自定义提示（如'-'）
      if (!cellValue || cellValue === '' || cellValue === null) {
        return '-'; // 也可以返回空字符串 '' 或 '无数据' 等
      }
      // 2. 非空值则调用原有格式化函数
      return formatDateTime(cellValue);
    },
      title: `${$t('marketing.creation.columns.endTime')}`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await creationTaskApi.fetchGetCreationTaskList({
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
function pageReload() {
  gridApi.reload();
}
async function handlerState(row: CreationTaskItem) {

}
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

const ruleLabels: Record<RuleType, string> = {
  [RuleType.IMMEDIATELY]: '立即提交'
}

</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>
        <template #taskStatus="{ row }">
          <Tag v-if="row.taskStatus === 1" color="orange">{{ $t('common.pending') }}</Tag>
          <Tag v-if="row.taskStatus === 2" color="blue">{{ $t('common.processing') }}</Tag>
          <Tag v-if="row.taskStatus === 3" color="green">{{ $t('common.completed') }}</Tag>
          <Tag v-if="row.taskStatus === 4" color="red">{{ $t('common.failed') }}</Tag>
        </template>
        <template #ruleType="{ row }">
          {{ ruleLabels[row.ruleType] }}
        </template>
      </Grid>
    </Page>
  </div>
</template>
