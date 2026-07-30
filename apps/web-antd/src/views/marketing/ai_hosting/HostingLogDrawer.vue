<script setup lang="ts" name="HostingLogDrawer">
/**
 * AI 智能托管 — 执行日志抽屉
 *
 * 在任务列表的「日志」操作中打开，展示单个任务的执行记录
 * 使用 useVbenDrawer 的 connectedComponent 模式，由父组件 setData + open
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Tag } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import { aiHostingApi } from '#/api/core';
import type { HostingLog } from '#/api/models/ai_hosting';
import { RULE_TYPE_MAP, ACTION_TYPE_MAP, LOG_RESULT_MAP } from './constants';

// ==================== 抽屉逻辑 ====================

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[900px]',
  closeOnClickModal: true,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as { taskId: string; taskName: string };
      if (data?.taskId) {
        drawerApi.setState({ title: `执行日志 — ${data.taskName || ''}` });
        gridApi.reload();
      }
    }
  },
});

// ==================== 表格配置 ====================

const gridOptions: VxeGridProps<HostingLog> = {
  border: true,
  height: 'auto',
  keepSource: true,
  pagerConfig: { pageSize: 20 },
  columns: [
    {
      field: 'executedAt',
      title: '执行时间',
      width: 160,
      formatter: 'formatDateTime',
    },
    { field: 'advertiserName', title: '账户', minWidth: 140 },
    { field: 'adName', title: '计划/广告', minWidth: 160 },
    {
      field: 'ruleType',
      title: '规则类型',
      width: 100,
      slots: { default: 'ruleType' },
    },
    { field: 'ruleName', title: '规则名称', minWidth: 120 },
    {
      field: 'action',
      title: '执行动作',
      width: 100,
      slots: { default: 'action' },
    },
    { field: 'reason', title: '触发原因', minWidth: 200 },
    {
      field: 'result',
      title: '结果',
      width: 80,
      slots: { default: 'result' },
    },
    {
      field: 'errorMsg',
      title: '错误信息',
      minWidth: 200,
      slots: { default: 'errorMsg' },
    },
  ],
  proxyConfig: {
    autoLoad: false,
    ajax: {
      query: async ({ page }) => {
        const data = drawerApi.getData() as { taskId: string };
        if (!data?.taskId) return { items: [], total: 0 };
        return await aiHostingApi.fetchLogList({
          page: page.currentPage,
          pageSize: page.pageSize,
          taskId: data.taskId,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>

<template>
  <Drawer>
    <Grid>
      <!-- 规则类型 -->
      <template #ruleType="{ row }">
        <Tag
          :color="RULE_TYPE_MAP[row.ruleType]?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ RULE_TYPE_MAP[row.ruleType]?.label || row.ruleType }}
        </Tag>
      </template>

      <!-- 执行动作 -->
      <template #action="{ row }">
        <span>{{ ACTION_TYPE_MAP[row.action] || row.action }}</span>
      </template>

      <!-- 执行结果 -->
      <template #result="{ row }">
        <Tag
          :color="LOG_RESULT_MAP[row.result]?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ LOG_RESULT_MAP[row.result]?.label || row.result }}
        </Tag>
      </template>

      <!-- 错误信息 -->
      <template #errorMsg="{ row }">
        <span v-if="row.errorMsg" class="error-text">{{ row.errorMsg }}</span>
        <span v-else class="empty-text">—</span>
      </template>
    </Grid>
  </Drawer>
</template>

<style scoped lang="scss">
.error-text {
  color: #ff4d4f;
  font-size: 13px;
}

.empty-text {
  color: rgba(0, 0, 0, 0.25);
}
</style>
