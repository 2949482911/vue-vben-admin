<script setup lang="ts" name="AutoTaskList">
import type { VbenFormProps } from '@vben/common-ui';

import type { AutoTaskItem } from '../types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Card, Space, Tag, Typography } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { getLabelColor } from '#/views/marketing/account/label/constants';

import {
  AUTO_TASK_STATUS_META,
  AUTO_TASK_STATUS_OPTIONS,
  formatPlatformLabel,
  LAST_EXECUTE_STATUS_META,
  PLATFORM_MODE_OPTIONS,
  queryAutoTasks,
} from '../data';
import AutoTaskEditorDrawer from './AutoTaskEditorDrawer.vue';
import AutoTaskPlanDrawer from './AutoTaskPlanDrawer.vue';

const emit = defineEmits<{ changed: [] }>();

const [EditorDrawer, editorApi] = useVbenDrawer({
  connectedComponent: AutoTaskEditorDrawer,
});
const [PlanDrawer, planDrawerApi] = useVbenDrawer({
  connectedComponent: AutoTaskPlanDrawer,
});

function formatTime(value?: string) {
  if (!value) {
    return '—';
  }
  return value.replace('T', ' ').slice(0, 16);
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: '搜索任务名称' },
      fieldName: 'name',
      label: '任务名称',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: PLATFORM_MODE_OPTIONS,
      },
      fieldName: 'platformModeKey',
      label: '平台',
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: AUTO_TASK_STATUS_OPTIONS },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<AutoTaskItem> = {
  border: true,
  height: 'auto',
  keepSource: true,
  checkboxConfig: {
    highlight: true,
    labelField: "id"
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
  },
  columns: [
    {
      field: 'name',
      title: '任务名称',
      minWidth: 220,
      slots: { default: 'name' },
    },
    {
      field: 'platform',
      title: '平台',
      width: 130,
      slots: { default: 'platform' },
    },
    {
      field: 'tags',
      title: '标签',
      width: 190,
      slots: { default: 'tags' },
    },
    {
      field: 'status',
      title: '状态',
      width: 80,
      slots: { default: 'status' },
    },
    {
      field: 'scheduleText',
      title: '执行计划',
      width: 160,
      slots: { default: 'schedule' },
    },
    {
      field: 'lastExecuteTime',
      title: '最近执行',
      width: 160,
      slots: { default: 'lastExecute' },
    },
    ...(TABLE_COMMON_COLUMNS as any).filter(
      (column: any) => column.field !== 'status',
    ),
  ],
  pagerConfig: {
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = (args ?? {}) as {
          name?: string;
          platformModeKey?: string;
          status?: string;
        };
        const [platform, platformMode] = String(
          params.platformModeKey ?? '',
        ).split('#');
        return await queryAutoTasks({
          name: params.name,
          page: page.currentPage,
          pageSize: page.pageSize,
          platform: platform || undefined,
          platformMode: platformMode || undefined,
          status: params.status as any,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function openEditor(row?: AutoTaskItem) {
  editorApi.setData(row ?? {});
  editorApi.open();
}

function openPlan(row: AutoTaskItem) {
  planDrawerApi.setData(row);
  planDrawerApi.open();
}

function handleEditorSuccess() {
  gridApi.reload();
  emit('changed');
}

defineExpose({ createTask: () => openEditor() });
</script>

<template>
  <Card :bordered="false" class="auto-task-list-card h-full" title="任务列表">
    <Grid class="h-full">
      <template #name="{ row }">
        <div class="flex min-w-0 flex-col">
          <Typography.Text class="truncate font-medium" :title="row.name">
            {{ row.name }}
          </Typography.Text>
          <Typography.Text
            class="truncate text-xs"
            type="secondary"
            :title="row.projectName"
          >
            {{ row.projectName || '—' }}
          </Typography.Text>
        </div>
      </template>

      <template #platform="{ row }">
        <Tag :bordered="false">
          {{ formatPlatformLabel(row.platform, row.platformMode) }}
        </Tag>
      </template>

      <template #tags="{ row }">
        <Space v-if="row.tags.length" :size="[4, 4]" wrap>
          <Tag
            v-for="tag in row.tags.slice(0, 2)"
            :key="tag"
            :bordered="false"
            :color="getLabelColor(tag)"
          >
            {{ tag }}
          </Tag>
          <Tag v-if="row.tags.length > 2" :bordered="false">
            +{{ row.tags.length - 2 }}
          </Tag>
        </Space>
        <Typography.Text v-else type="secondary" class="text-xs">
          —
        </Typography.Text>
      </template>

      <template #status="{ row }">
        <Tag :bordered="false" :color="AUTO_TASK_STATUS_META[row.status].color">
          {{ AUTO_TASK_STATUS_META[row.status].label }}
        </Tag>
      </template>

      <template #schedule="{ row }">
        <div class="flex min-w-0 flex-col">
          <span class="truncate">{{ row.scheduleText }}</span>
          <Typography.Text class="text-xs" type="secondary">
            下次 {{ formatTime(row.nextExecuteTime) }}
          </Typography.Text>
        </div>
      </template>

      <template #lastExecute="{ row }">
        <div class="flex min-w-0 flex-col">
          <Tag
            v-if="row.lastExecuteStatus"
            :bordered="false"
            :color="
              LAST_EXECUTE_STATUS_META[row.lastExecuteStatus]?.color || 'default'
            "
          >
            {{
              LAST_EXECUTE_STATUS_META[row.lastExecuteStatus]?.label ||
              row.lastExecuteStatus
            }}
          </Tag>
          <Typography.Text v-else type="secondary" class="text-xs">
            未执行
          </Typography.Text>
          <Typography.Text class="text-xs" type="secondary">
            {{ formatTime(row.lastExecuteTime) }}
          </Typography.Text>
        </div>
      </template>

      <template #action="{ row }">
        <Button type="link" size="small" @click="openPlan(row)">
          计划卡
        </Button>
      </template>
    </Grid>

    <EditorDrawer @success="handleEditorSuccess" />
    <PlanDrawer @changed="handleEditorSuccess" />
</Card>
</template>

<style scoped lang="scss">
.auto-task-list-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.auto-task-list-card :deep(.ant-card-head) {
  flex: none;
}

.auto-task-list-card :deep(.ant-card-body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 0 16px 16px;
}
</style>
