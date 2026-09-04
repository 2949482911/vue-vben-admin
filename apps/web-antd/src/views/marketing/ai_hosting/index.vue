<script setup lang="ts" name="AiHostingList">
/**
 * AI 智能托管 — 任务列表页
 *
 * 展示托管任务列表，支持创建/编辑/暂停/恢复/删除
 * 参考 metric/index.vue 的 useVbenVxeGrid + proxyConfig 模式
 */
import type { VbenFormProps } from '@vben/common-ui';
import { Page, useVbenDrawer } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Button, message, Tag } from 'ant-design-vue';
import { aiHostingApi } from '#/api/core';
import { BatchOptionsType, PLATFORM, TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { trimObject } from '#/utils/trim';
import type { HostingTask } from '#/api/models/ai_hosting';
import type { BatchOptions } from '#/api/models/core';

import {
  EXECUTION_MODE_MAP,
  HOSTING_STATUS_MAP,
  HOSTING_STATUS_OPTIONS,
  RULE_TYPE_MAP,
} from './constants';
import CreateHostingTask from './create.vue';
import HostingLogDrawer from './HostingLogDrawer.vue';

// ==================== 创建/编辑抽屉 ====================
const [CreateDrawer, createApi] = useVbenDrawer({
  connectedComponent: CreateHostingTask,
});

function openCreateDrawer(row?: HostingTask) {
  createApi.setData(row?.id ? row : {});
  createApi.open();
}

// ==================== 日志抽屉 ====================
const [LogDrawer, logApi] = useVbenDrawer({
  connectedComponent: HostingLogDrawer,
});

/** 查看日志 — 打开日志抽屉 */
function viewLog(row: HostingTask) {
  logApi.setData({ taskId: row.id, taskName: row.name });
  logApi.open();
}

// ==================== 状态操作 ====================

/** 暂停/恢复 */
async function toggleStatus(row: HostingTask) {
  const action =
    row.taskStatus === "running"
      ? BatchOptionsType.DISABLE
      : BatchOptionsType.Enable;
  await aiHostingApi.fetchBatchOptions({
    targetIds: [row.id],
    type: action,
    values: new Map<string, any>()
  } as BatchOptions);
  message.success(action === BatchOptionsType.DISABLE ? "已暂停" : "已恢复");
  gridApi.reload();
}

/** 删除 */
async function handleDelete(row: HostingTask) {
  await aiHostingApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>()
  } as BatchOptions);
  message.success("删除成功");
  await gridApi.reload();
}

// ==================== 表格配置 ====================

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      fieldName: "name",
      label: "任务名称"
    },
    {
      component: "Select",
      componentProps: { options: PLATFORM },
      fieldName: "platform",
      label: "平台"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: HOSTING_STATUS_OPTIONS
      },
      fieldName: "taskStatus",
      label: "状态"
    }
  ],
  showCollapseButton: true,
  submitOnEnter: false
};

const gridOptions: VxeGridProps<HostingTask> = {
  border: true,
  checkboxConfig: { highlight: true, labelField: "id" },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  columns: [
    { field: "name", title: "任务名称", minWidth: 180 },
    { field: "platform", title: "平台", width: 100 },
    {
      field: "executionMode",
      title: "执行模式",
      width: 100,
      slots: { default: "executionMode" }
    },
    {
      field: "rules",
      title: "规则数量",
      width: 90,
      slots: { default: "rules" }
    },
    {
      field: "taskStatus",
      title: "任务状态",
      width: 90,
      slots: { default: "taskStatus" }
    },
    {
      field: "stats.todayExecCount",
      title: "今日执行",
      width: 90
    },
    {
      field: "stats.managedAdCount",
      title: "管理计划数",
      width: 100
    },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  height: "auto",
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await aiHostingApi.fetchTaskList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <Page content-class="p-5">
    <Grid>
      <!-- 表格状态列 -->
      <template #taskStatus="{ row }">
        <Tag
          :color="HOSTING_STATUS_MAP[row.taskStatus]?.color || 'default'"
          :bordered="false"
        >
          {{ HOSTING_STATUS_MAP[row.taskStatus]?.label || row.status }}
        </Tag>
      </template>

      <!-- 执行模式列 -->
      <template #executionMode="{ row }">
        <Tag
          :color="row.executionMode === 'auto' ? 'green' : row.executionMode === 'manual' ? 'orange' : 'blue'"
          :bordered="false"
        >
          {{ EXECUTION_MODE_MAP[row.executionMode] || row.executionMode }}
        </Tag>
      </template>

      <!-- 规则数量列 -->
      <template #rules="{ row }">
        <div class="rule-tags">
          <Tag
            v-for="rule in (row.rules || []).slice(0, 3)"
            :key="rule.id"
            :color="RULE_TYPE_MAP[rule.type]?.color || 'default'"
            :bordered="false"
            size="small"
          >
            {{ RULE_TYPE_MAP[rule.type]?.label || rule.type }}
          </Tag>
          <Tag v-if="(row.rules || []).length > 3" :bordered="false" size="small">
            +{{ row.rules.length - 3 }}
          </Tag>
        </div>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <Button type="link" size="small" @click="toggleStatus(row)">
          {{ row.task_status === "running" ? "暂停" : "恢复" }}
        </Button>
        <Button type="link" size="small" @click="openCreateDrawer(row)">
          编辑
        </Button>
        <Button type="link" size="small" @click="viewLog(row)">
          日志
        </Button>
        <Button type="link" size="small" danger @click="handleDelete(row)">
          删除
        </Button>
      </template>

      <!-- 工具栏 -->
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openCreateDrawer()">
          创建托管任务
        </Button>
      </template>
    </Grid>

    <!-- 创建/编辑抽屉 -->
    <CreateDrawer @page-reload="pageReload" />

    <!-- 日志抽屉 -->
    <LogDrawer />
  </Page>
</template>

<style scoped lang="scss">
.rule-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
