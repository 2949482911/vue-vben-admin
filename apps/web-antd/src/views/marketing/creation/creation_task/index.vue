<script lang="ts" setup name="CreationTaskList">
import type { VbenFormProps } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import type { CreationTaskItem } from "#/api/models/marketing";

import { onBeforeUnmount, ref } from "vue";

import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { formatDateTime } from "@vben/utils";

import { Button, Progress, Space, Tag } from "ant-design-vue";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { creationTaskApi } from "#/api";
import { RuleType } from "#/constants/enums";
import { TABLE_COMMON_COLUMNS, TASK_STATUS_SELECT } from "#/constants/locales";
import { trimObject } from "#/utils/trim";

import TaskDetailPanel from "./task_drawer_detail.vue";

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      fieldName: "id",
      label: `id`
    },
    {
      component: "Input",
      fieldName: "platform",
      label: `${$t("marketing.creation.columns.platform")}`
    },
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("marketing.creation.columns.name")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: TASK_STATUS_SELECT,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "taskStatus",
      label: `${$t("marketing.creation.columns.taskStatus")}`
    },
    {
      component: "Input",
      fieldName: "projectId",
      label: `${$t("marketing.creation.columns.projectId")}`
    }
  ],
  showCollapseButton: true,
  submitOnEnter: true,
  compact: true,
  collapsed: true
};

// 任务详情抽屉（vben useVbenDrawer）
const selectedTask = ref<CreationTaskItem | null>(null);

const [TaskDetailDrawer, taskDetailDrawerApi] = useVbenDrawer({
  class: "w-[65%]",
  contentClass: "p-5",
  destroyOnClose: true,
  closeOnPressEscape: true,
  footer: false,
  title: "批投任务详情",
  onClosed() {
    selectedTask.value = null;
  }
});

function openDetail(task: CreationTaskItem) {
  selectedTask.value = task;
  taskDetailDrawerApi.open();
}

// 自动刷新：对进行中的任务定期轮询
let refreshTimer: null | ReturnType<typeof setInterval> = null;

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    gridApi.reload();
  }, 5000);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// 检查列表中是否有进行中的任务
function checkHasProcessingTasks(records: CreationTaskItem[]) {
  return records.some(r => r.taskStatus === 1 || r.taskStatus === 2);
}

const gridOptions: VxeGridProps<CreationTaskItem> = {
  columns: [
    {
      field: "platform",
      title: `${$t("marketing.creation.columns.platform")}`,
      width: 100
    },
    {
      field: "name",
      title: `${$t("marketing.creation.columns.name")}`,
      minWidth: 160
    },
    {
      field: "ruleType",
      title: `${$t("marketing.creation.columns.ruleType")}`,
      slots: { default: "ruleType" },
      width: 100
    },
    {
      field: "taskStatus",
      title: `${$t("marketing.creation.columns.taskStatus")}`,
      slots: { default: "taskStatus" },
      width: 90
    },
    {
      title: "进度",
      slots: { default: "progress" },
      width: 180
    },
    {
      field: "commitAdvertiserCount",
      title: `${$t("marketing.creation.columns.commitAdvertiserCount")}`,
      width: 100
    },
    {
      field: "commitCampaignCount",
      title: `${$t("marketing.creation.columns.commitCampaignCount")}`,
      width: 110
    },
    {
      field: "commitAdGroupCount",
      title: `${$t("marketing.creation.columns.commitAdGroupCount")}`,
      width: 110
    },
    {
      field: "commitPromotionCount",
      title: `${$t("marketing.creation.columns.commitPromotionCount")}`,
      width: 110
    },
    {
      field: "commitCreativeCount",
      title: `${$t("marketing.creation.columns.commitCreativeCount")}`,
      width: 110
    },
    {
      field: "projectId",
      title: `${$t("marketing.creation.columns.projectId")}`,
      width: 100
    },
    {
      field: "startTime",
      formatter: "formatDateTime",
      title: `${$t("marketing.creation.columns.startTime")}`,
      width: 160
    },
    {
      field: "endTime",
      formatter: ({ cellValue }) => {
        if (!cellValue || cellValue === "" || cellValue === null) {
          return "-";
        }
        return formatDateTime(cellValue);
      },
      title: `${$t("marketing.creation.columns.endTime")}`,
      width: 160
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await creationTaskApi.fetchGetCreationTaskList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      },
      queryAfter: (data) => {
        // 检查是否有进行中任务，有则开启自动刷新
        if (checkHasProcessingTasks(data.records)) {
          startAutoRefresh();
        } else {
          stopAutoRefresh();
        }
      }
    }
  },
  checkboxConfig: {
    highlight: true,
    labelField: "id"
  },
  pagerConfig: {
    enabled: true
  },
  exportConfig: {
    filename: "",
    types: ["csv", "xlsx", "xls"]
  },
  height: "auto",
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const ruleLabels: Record<RuleType, string> = {
  [RuleType.IMMEDIATELY]: "立即提交"
};

/** 计算进度百分比 */
function calcProgress(row: CreationTaskItem) {
  const total =
    (Number(row.commitCampaignCount) || 0) +
    (Number(row.commitAdGroupCount) || 0) +
    (Number(row.commitPromotionCount) || 0) +
    (Number(row.commitCreativeCount) || 0);
  const success =
    (Number(row.successCampaignCount) || 0) +
    (Number(row.successAdGroupCount) || 0) +
    (Number(row.successPromotionCount) || 0) +
    (Number(row.successCreativeCount) || 0);
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
}

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>

<template>
  <Page>
    <Grid>
      <template #status="{ row }">
        <Tag v-if="row.taskStatus === 1" color="orange">待处理</Tag>
        <Tag v-if="row.taskStatus === 2" color="blue">处理中</Tag>
        <Tag v-if="row.taskStatus === 3" color="green">已完成</Tag>
        <Tag v-if="row.taskStatus === 4" color="red">失败</Tag>
      </template>
      <template #taskStatus="{ row }">
        <Tag v-if="row.taskStatus === 1" color="orange">{{ $t("common.pending") }}</Tag>
        <Tag v-if="row.taskStatus === 2" color="blue">{{ $t("common.processing") }}</Tag>
        <Tag v-if="row.taskStatus === 3" color="green">{{ $t("common.completed") }}</Tag>
        <Tag v-if="row.taskStatus === 4" color="red">{{ $t("common.failed") }}</Tag>
      </template>
      <template #ruleType="{ row }">
        {{ ruleLabels[row.ruleType] }}
      </template>
      <template #progress="{ row }">
        <div class="flex items-center gap-2">
          <Progress
            :percent="calcProgress(row)"
            :size="20"
            :stroke-width="14"
            :status="row.taskStatus === 4 ? 'exception' : row.taskStatus === 3 ? 'success' : 'active'"
            style="width: 120px; margin-bottom: 0;"
          />
        </div>
      </template>
      <template #action="{ row }">
        <Space>
          <Button size="small" type="link" @click="openDetail(row)">查看详情</Button>
        </Space>
      </template>
    </Grid>
  </Page>

  <!-- 任务详情抽屉（复用共享详情面板） -->
  <TaskDetailDrawer>
    <TaskDetailPanel v-if="selectedTask" :task="selectedTask" />
  </TaskDetailDrawer>
</template>
