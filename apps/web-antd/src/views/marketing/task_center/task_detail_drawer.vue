<script setup lang="ts">
import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { useVbenDrawer } from "@vben/common-ui";
import type { TaskBatchCenterDetailItem, TaskBatchCenterItem } from "#/api/models/marketing";
import { taskCenterApi } from "#/api";
import { formatDateTime } from "@vben/utils";
import { $t } from "#/locales";
import { Tag } from "ant-design-vue";
import { ref } from "vue";

// 层级文案映射
const LEVEL_MAP: Record<string, string> = {
  campaign: $t("marketing.taskCenter.level.campaign"),
  adgroup: $t("marketing.taskCenter.level.adgroup"),
  promotion: $t("marketing.taskCenter.level.promotion")
};

/** 当前主任务ID（由抽屉打开时注入） */
const taskId = ref<number>();

/** 目标ID列格式化 */
function formatTargetIds(targetIds?: string[]) {
  if (!targetIds || targetIds.length === 0) {
    return "-";
  }
  return targetIds.join(", ");
}

/** 请求参数列格式化 */
function formatRequestParams(requestParams?: Record<string, any>) {
  if (!requestParams) {
    return "-";
  }
  return JSON.stringify(requestParams);
}

const gridOptions: VxeGridProps<TaskBatchCenterDetailItem> = {
  columns: [
    {
      field: "id",
      title: $t("marketing.taskCenter.columns.id"),
      width: "auto"
    },
    {
      field: "optionType",
      title: $t("marketing.taskCenter.columns.taskType"),
      width: "auto"
    },
    {
      field: "platform",
      title: $t("marketing.taskCenter.columns.platform"),
      width: "auto"
    },
    {
      field: "code",
      title: $t("marketing.taskCenter.columns.code"),
      width: "auto"
    },
    {
      field: "message",
      title: $t("marketing.taskCenter.columns.message"),
      width: "auto"
    },
    {
      field: "requestId",
      title: $t("marketing.taskCenter.columns.requestId"),
      width: "auto"
    },
    {
      field: "targetIds",
      title: $t("marketing.taskCenter.columns.targetIds"),
      formatter: ({ cellValue }) => formatTargetIds(cellValue),
      width: "auto"
    },
    {
      field: "requestParams",
      title: $t("marketing.taskCenter.columns.requestParams"),
      formatter: ({ cellValue }) => formatRequestParams(cellValue),
      width: "auto"
    },
    {
      field: "result",
      title: $t("marketing.taskCenter.columns.result"),
      width: "auto",
      slots: {default : 'result'}
    },
    {
      field: "createTime",
      title: $t("marketing.taskCenter.columns.createTime"),
      formatter: ({ cellValue }) => {
        if (!cellValue) {
          return "-";
        }
        return formatDateTime(cellValue);
      },
      width: 170
    }
  ],
  height: "auto",
  proxyConfig: {
    // 抽屉打开后再手动加载，避免未打开时发起无效请求
    autoLoad: false,
    ajax: {
      query: async ({ page }) => {
        return await taskCenterApi.fetchGetTaskBatchCenterDetailList({
          taskId: taskId.value as number,
          page: page.currentPage,
          pageSize: page.pageSize
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[880px]",
  closeOnPressEscape: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 通过 drawerApi.setData 注入主任务行数据
      const data = drawerApi.getData() as TaskBatchCenterItem;
      taskId.value = data?.id as unknown as number | undefined;
    }
  },
  onOpened() {
    // 打开动画结束后 Grid 已挂载，手动加载任务详情
    gridApi.reload();
  }
});
</script>

<template>
  <Drawer :title="$t('marketing.taskCenter.detailTitle')">
    <Grid>
      <template #result="{ row }">
        <Tag v-if="row.result === 'SUCCESS'" color="green">
          {{ $t("marketing.taskCenter.result.success") }}
        </Tag>
        <Tag v-else-if="row.result === 'FAILED'" color="red">
          {{ $t("marketing.taskCenter.result.failed") }}
        </Tag>
        <span v-else>{{ row.result || "-" }}</span>
      </template>
    </Grid>
  </Drawer>
</template>

<style scoped lang="scss"></style>
