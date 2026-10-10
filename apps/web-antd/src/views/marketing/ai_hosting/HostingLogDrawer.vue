<script setup lang="ts" name="HostingLogDrawer">
/**
 * AI 智能托管 — 任务决策记录抽屉
 *
 * 在任务列表的「记录」操作中打开，展示单个任务的决策记录（原执行日志）。
 * 数据来源：decision/list（按 taskId 过滤）。原 log/list 已随数据模型收敛移除。
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Tag } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import { aiHostingApi } from '#/api/core';
import type { HostingDecision } from '#/api/models/ai_hosting';
import {
  RULE_TYPE_MAP,
  ACTION_TYPE_MAP,
  DECISION_STATUS_MAP,
} from './constants';

// ==================== 表格配置 ====================

const gridOptions: VxeGridProps<HostingDecision> = {
  border: true,
  height: 'auto',
  keepSource: true,
  pagerConfig: { pageSize: 20 },
  columns: [
    {
      field: 'createTime',
      title: '创建时间',
      width: 160,
      formatter: 'formatDateTime',
    },
    { field: 'advertiserName', title: '账户', minWidth: 140 },
    { field: 'targetName', title: '计划/广告', minWidth: 160 },
    {
      field: 'ruleType',
      title: '规则类型',
      width: 100,
      slots: { default: 'ruleType' },
    },
    { field: 'ruleName', title: '规则名称', minWidth: 120 },
    {
      field: 'action',
      title: '建议动作',
      width: 110,
      slots: { default: 'action' },
    },
    { field: 'aiReason', title: 'AI/触发原因', minWidth: 200 },
    {
      field: 'decisionStatus',
      title: '状态',
      width: 90,
      slots: { default: 'status' },
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
        const res = await aiHostingApi.fetchDecisionList({
          page: page.currentPage,
          pageSize: page.pageSize,
          taskId: data.taskId,
        });
        return { items: res?.items ?? [], total: res?.total ?? 0 };
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// ==================== 抽屉逻辑 ====================

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[900px]',
  closeOnClickModal: true,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as { taskId: string; taskName: string };
      drawerApi.setState({ title: `决策记录 — ${data?.taskName || ''}` });
    }
  },
  onOpened() {
    // 打开动画结束后 Grid 才完成挂载，此时再发起请求，否则 grid.commitProxy 未就绪
    gridApi.reload();
  },
});
</script>

<template>
  <Drawer>
    <Grid>
      <!-- 规则类型 -->
      <template #ruleType="{ row }">
        <Tag
          :color="RULE_TYPE_MAP[row.ruleType || '']?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ RULE_TYPE_MAP[row.ruleType || '']?.label || row.ruleType || '-' }}
        </Tag>
      </template>

      <!-- 建议动作 -->
      <template #action="{ row }">
        <span>{{ ACTION_TYPE_MAP[row.action || ''] || row.action || '-' }}</span>
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <Tag
          :color="DECISION_STATUS_MAP[row.decisionStatus || '']?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ DECISION_STATUS_MAP[row.decisionStatus || '']?.label || row.decisionStatus || '-' }}
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
