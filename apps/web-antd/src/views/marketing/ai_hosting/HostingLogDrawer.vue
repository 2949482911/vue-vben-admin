<script setup lang="ts" name="HostingLogDrawer">
/**
 * AI 智能托管 — 任务决策记录抽屉
 *
 * 在任务列表的「记录」操作中打开，展示单个任务的决策记录（原执行日志）。
 * 数据来源：decision/list（按 taskId 过滤）。原 log/list 已随数据模型收敛移除。
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { HostingDecision } from '#/api/models/ai_hosting';

import { useVbenDrawer } from '@vben/common-ui';

import { Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aiHostingApi } from '#/api/core';

import {
  ACTION_TYPE_MAP,
  DECISION_STATUS_MAP,
  EFFECT_VERDICT_MAP,
  EXECUTED_BY_MAP,
  isQuotaBlocked,
  ROLLBACK_STATUS_MAP,
  RULE_TYPE_MAP,
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
      width: 130,
      slots: { default: 'status' },
    },
    {
      field: 'executedBy',
      title: '执行来源',
      width: 96,
      slots: { default: 'executedBy' },
    },
    {
      field: 'effectVerdict',
      title: '回评',
      width: 84,
      slots: { default: 'effect' },
    },
    {
      field: 'rollbackStatus',
      title: '回滚',
      width: 88,
      slots: { default: 'rollback' },
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

      <!-- 状态（含限额拦截标记） -->
      <template #status="{ row }">
        <Space :size="4" wrap>
          <Tag
            :color="DECISION_STATUS_MAP[row.decisionStatus || '']?.color || 'default'"
            :bordered="false"
            size="small"
          >
            {{ DECISION_STATUS_MAP[row.decisionStatus || '']?.label || row.decisionStatus || '-' }}
          </Tag>
          <Tag
            v-if="isQuotaBlocked(row.errorMsg)"
            :bordered="false"
            color="orange"
            size="small"
          >
            限额拦截
          </Tag>
        </Space>
      </template>

      <!-- 执行来源 -->
      <template #executedBy="{ row }">
        <Tag
          v-if="row.executedBy"
          :color="EXECUTED_BY_MAP[row.executedBy]?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ EXECUTED_BY_MAP[row.executedBy]?.label || row.executedBy }}
        </Tag>
        <span v-else class="empty-text">—</span>
      </template>

      <!-- 效果回评 -->
      <template #effect="{ row }">
        <Tag
          v-if="row.effectVerdict"
          :color="EFFECT_VERDICT_MAP[row.effectVerdict]?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ EFFECT_VERDICT_MAP[row.effectVerdict]?.label || row.effectVerdict }}
        </Tag>
        <span v-else class="empty-text">—</span>
      </template>

      <!-- 回滚状态 -->
      <template #rollback="{ row }">
        <Tag
          v-if="row.rollbackStatus && row.rollbackStatus !== 'none'"
          :color="ROLLBACK_STATUS_MAP[row.rollbackStatus]?.color || 'default'"
          :bordered="false"
          size="small"
        >
          {{ ROLLBACK_STATUS_MAP[row.rollbackStatus]?.label || row.rollbackStatus }}
        </Tag>
        <span v-else class="empty-text">—</span>
      </template>

      <!-- 错误信息（限额拦截非系统异常，用告警色而非错误色） -->
      <template #errorMsg="{ row }">
        <span
          v-if="row.errorMsg && !isQuotaBlocked(row.errorMsg)"
          class="error-text"
        >
          {{ row.errorMsg }}
        </span>
        <span v-else-if="row.errorMsg" class="warn-text">{{ row.errorMsg }}</span>
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

.warn-text {
  color: #fa8c16;
  font-size: 13px;
}

.empty-text {
  color: rgba(0, 0, 0, 0.25);
}
</style>
