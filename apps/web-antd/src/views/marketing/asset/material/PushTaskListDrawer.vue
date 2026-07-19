<script lang="ts" setup>
import { $t } from '@vben/locales';
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import type { VbenFormProps } from '#/adapter/form';
import { materialPushApi } from '#/api/core';
import type { PushMaterialTaskItem, PushTaskPageRequest } from '#/api/models/assert';
import { Tag } from 'ant-design-vue';
import { h } from 'vue';

// ==================== i18n 前缀 ====================
const T = 'page.marketing.asset.pushTask';

// ==================== 任务状态映射 ====================
const TASK_STATUS_MAP: Record<number, { labelKey: string; color: string }> = {
  1: { labelKey: `${T}.statusPending`, color: 'default' },
  2: { labelKey: `${T}.statusProcessing`, color: 'processing' },
  3: { labelKey: `${T}.statusCompleted`, color: 'success' },
  4: { labelKey: `${T}.statusFailed`, color: 'error' },
};

const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_MAP).map(
  ([value, item]) => ({
    value: Number(value),
    label: $t(item.labelKey),
  }),
);

// ==================== 筛选表单 ====================
const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t(`${T}.taskName`),
    },
    {
      component: 'Input',
      fieldName: 'platform',
      label: $t(`${T}.platform`),
    },
    {
      component: 'Select',
      fieldName: 'taskStatus',
      label: $t(`${T}.taskStatus`),
      componentProps: {
        allowClear: true,
        options: TASK_STATUS_OPTIONS,
        placeholder: $t(`${T}.taskStatus`),
      },
    },
  ],
  showCollapseButton: false,
  submitButtonOptions: {
    content: $t(`${T}.search`),
  },
  submitOnEnter: false,
  resetButtonOptions: {
    content: $t(`${T}.reset`),
  },
};

// ==================== Grid ====================
const gridOptions: VxeGridProps<PushMaterialTaskItem> = {
  columns: [
    { field: 'name', title: $t(`${T}.taskName`), minWidth: 180 },
    {
      field: 'platform',
      title: $t(`${T}.platform`),
      width: 120,
      slots: { default: 'platform' },
    },
    { field: 'totalCount', title: $t(`${T}.materialCount`), width: 90 },
    {
      title: $t(`${T}.pushProgress`),
      width: 200,
      slots: { default: 'progress' },
    },
    {
      field: 'taskStatus',
      title: $t(`${T}.status`),
      width: 100,
      slots: { default: 'status' },
    },
    { field: 'startTime', title: $t(`${T}.createTime`), width: 160 },
    { field: 'endTime', title: $t(`${T}.endTime`), width: 160 },
  ],
  pagerConfig: { enabled: true },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const params: PushTaskPageRequest = {
          page: page.currentPage,
          pageSize: page.pageSize,
          name: (formValues as any)?.name || '',
          platform: (formValues as any)?.platform || '',
          taskStatus: (formValues as any)?.taskStatus ?? 0,
        };
        if ((formValues as any)?.taskStatus === undefined) {
          params.taskStatus = 0;
        }
        const res = await materialPushApi.fetchMaterialPushTaskList(params);
        const data = res as any;
        if (Array.isArray(data)) {
          return data;
        }
        return { items: data?.items ?? [], total: data?.total ?? 0 };
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid<PushMaterialTaskItem>({
  formOptions,
  gridOptions,
});

// ==================== Drawer ====================
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onOpenChange(isOpen) {
    if (isOpen) {
      gridApi.reload();
    }
  },
  onCancel() {
    drawerApi.close();
  },
});

// ==================== 状态Tag渲染 ====================
function renderStatusTag(taskStatus: number) {
  const cfg = TASK_STATUS_MAP[taskStatus];
  if (!cfg) {
    return h(Tag, { color: 'default' }, () => $t(`${T}.unknown`));
  }
  return h(Tag, { color: cfg.color }, () => $t(cfg.labelKey));
}
</script>

<template>
  <Drawer class="w-[70%]" :title="$t(`${T}.title`)" :footer="false">
    <Grid>
      <template #platform="{ row }">
        <Tag v-if="row.platform" color="blue">{{ row.platform }}</Tag>
        <span v-else>-</span>
      </template>
      <template #progress="{ row }">
        <span class="progress-text">
          {{ $t(`${T}.success`) }}{{ row.successCount ?? 0 }}
          / {{ $t(`${T}.failed`) }}{{ row.failedCount ?? 0 }}
          / {{ $t(`${T}.skip`) }}{{ row.skipCount ?? 0 }}
        </span>
      </template>
      <template #status="{ row }">
        <component :is="renderStatusTag(row.taskStatus)" />
      </template>
    </Grid>
  </Drawer>
</template>

<style scoped lang="scss">
.progress-text {
  font-size: 12px;
  color: #666;
}
</style>
