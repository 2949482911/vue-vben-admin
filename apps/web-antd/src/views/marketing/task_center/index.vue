<script setup lang="ts">
import type { VbenFormProps } from "@vben/common-ui";
import { Page, useVbenDrawer } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { TaskBatchCenterItem } from "#/api/models/marketing";
import { formatDateTime } from "@vben/utils";

import { $t } from "#/locales";
import { Button, Progress, Space, Tag } from "ant-design-vue";
import { taskCenterApi } from "#/api";
import { trimObject } from "#/utils/trim";
import TaskDetailDrawer from "./task_detail_drawer.vue";
import { TABLE_COMMON_COLUMNS } from "#/constants/locales";

// 操作类型选项
const OPTION_TYPE_SELECT = [
  {
    label: $t("marketing.taskCenter.optionType.campaignBatchStart"),
    value: "campaign_batch_start"
  },
  { label: $t("marketing.taskCenter.optionType.deleteCampaign"), value: "delete_campaign" },
  { label: $t("marketing.taskCenter.optionType.deletePromotion"), value: "delete_promotion" },
  {
    label: $t("marketing.taskCenter.optionType.updateProjectStatus"),
    value: "update_project_status"
  },
  {
    label: $t("marketing.taskCenter.optionType.updateProjectBudget"),
    value: "update_project_budget"
  },
  { label: $t("marketing.taskCenter.optionType.updateProjectRoi"), value: "update_project_roi" }
];

const OPTION_TYPE_MAP: Record<string, string> = Object.fromEntries(
  OPTION_TYPE_SELECT.map((item) => [item.value, item.label])
);

// 任务状态下拉选项
const TASK_STATUS_SELECT = [
  { label: $t("marketing.taskCenter.taskStatus.pending"), value: 1 },
  { label: $t("marketing.taskCenter.taskStatus.processing"), value: 2 },
  { label: $t("marketing.taskCenter.taskStatus.completed"), value: 3 },
  { label: $t("marketing.taskCenter.taskStatus.failed"), value: 4 }
];

// 任务状态
const TASK_STATUS_MAP: Record<number, { color: string; text: string }> = {
  1: { color: "orange", text: $t("marketing.taskCenter.taskStatus.pending") },
  2: { color: "blue", text: $t("marketing.taskCenter.taskStatus.processing") },
  3: { color: "green", text: $t("marketing.taskCenter.taskStatus.completed") },
  4: { color: "red", text: $t("marketing.taskCenter.taskStatus.failed") }
};

// 任务详情抽屉
const [TaskDetailDrawerModule, taskDetailDrawerApi] = useVbenDrawer({
  connectedComponent: TaskDetailDrawer,
});

function openDetail(row: TaskBatchCenterItem) {
  taskDetailDrawerApi.setData(row);
  taskDetailDrawerApi.open();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: $t("common.input")
      },
      fieldName: "name",
      label: $t("marketing.taskCenter.columns.name")
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: OPTION_TYPE_SELECT,
        placeholder: $t("common.choice")
      },
      fieldName: "optionType",
      label: $t("marketing.taskCenter.columns.optionType")
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: TASK_STATUS_SELECT,
        placeholder: $t("common.choice")
      },
      fieldName: "taskStatus",
      label: $t("marketing.taskCenter.columns.taskStatus")
    }
  ],
  showCollapseButton: false,
  submitOnEnter: true,
  compact: true,
  collapsed: true,
};

const gridOptions: VxeGridProps<TaskBatchCenterItem> = {
  columns: [
    {
      field: "id",
      title: $t("marketing.taskCenter.columns.taskId"),
      width: "auto"
    },
    {
      field: "name",
      title: $t("marketing.taskCenter.columns.name"),
      width: "auto"
    },
    {
      field: "optionType",
      title: $t("marketing.taskCenter.columns.optionType"),
      slots: { default: "optionType" },
      width: "auto"
    },
    {
      field: "totalCount",
      title: $t("marketing.taskCenter.columns.totalCount"),
      width: "auto"
    },
    {
      field: "successCount",
      title: $t("marketing.taskCenter.columns.successCount"),
      width: "auto"
    },
    {
      field: "failedCount",
      title: $t("marketing.taskCenter.columns.failedCount"),
      width: "auto"
    },
    {
      field: "pendingCount",
      title: $t("marketing.taskCenter.columns.pendingCount"),
      width: "auto"
    },
    {
      field: "taskStatus",
      title: $t("marketing.taskCenter.columns.taskStatus"),
      slots: { default: "taskStatus" },
      width: "auto"
    },
    {
      title: $t("marketing.taskCenter.columns.progress"),
      slots: { default: "progress" },
      width: "auto"
    },
    {
      field: "startTime",
      formatter: ({ cellValue }) => {
        if (!cellValue) {
          return "-";
        }
        return formatDateTime(cellValue);
      },
      title: $t("marketing.taskCenter.columns.startTime"),
      width: "auto"
    },
    {
      field: "endTime",
      formatter: ({ cellValue }) => {
        if (!cellValue) {
          return "-";
        }
        return formatDateTime(cellValue);
      },
      title: $t("marketing.taskCenter.columns.endTime"),
      width: "auto"
    },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await taskCenterApi.fetchGetTaskBatchCenterList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  },
  pagerConfig: {
    enabled: true
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true
  }
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #optionType="{ row }">
          {{ OPTION_TYPE_MAP[row.optionType ?? ""] || row.optionType || "-" }}
        </template>
        <template #taskStatus="{ row }">
          <Tag :color="TASK_STATUS_MAP[row.taskStatus as number]?.color">
            {{ TASK_STATUS_MAP[row.taskStatus as number]?.text || row.taskStatusName || "-" }}
          </Tag>
        </template>
        <template #progress="{ row }">
          <div class="flex items-center gap-2">
            <Progress
              :percent="row.progressPercent ?? 0"
              :size="20"
              :stroke-width="14"
              :status="row.taskStatus === 4 ? 'exception' : row.taskStatus === 3 ? 'success' : 'active'"
              style="width: 120px; margin-bottom: 0;"
            />
            <span class="text-xs text-gray-500">{{ row.progressPercent }}</span>
          </div>
        </template>
        <template #action="{ row }">
          <Space>
            <Button size="small" type="link" @click="openDetail(row)">
              {{ $t("marketing.taskCenter.viewDetail") }}
            </Button>
          </Space>
        </template>
      </Grid>
    </Page>

    <!-- 任务详情抽屉 -->
    <TaskDetailDrawerModule />
  </div>
</template>

<style scoped lang="scss"></style>
