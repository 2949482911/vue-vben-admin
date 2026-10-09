<script setup lang="ts" name="HostingTriggerHistory">
/**
 * AI 智能托管 — 触发留痕
 *
 * airflow 每次规则命中都会写一条历史（result = pending 待审核 / report_failed 上报失败），
 * 用于追溯「AI 监控触发过什么」。复用既有 log/list 接口。
 * 全部由 ant-design-vue 组件实现（Card / Space / Select / Timeline / Tag / Pagination），
 * 不写自定义样式。
 */
import type { HostingLog, LogResult } from "#/api/models/ai_hosting";
import { onMounted, ref } from "vue";

import { ReloadOutlined } from "@ant-design/icons-vue";
import {
  Button,
  Card,
  Empty,
  Flex,
  Pagination,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography
} from "ant-design-vue";

import { aiHostingApi } from "#/api/core";
import { PLATFORM } from "#/constants/locales";
import { getPlatformColor, getPlatformLabel } from "#/constants/platform";

import { LOG_RESULT_MAP, TRIGGER_RESULT_OPTIONS } from "../constants";

const loading = ref(false);
const logs = ref<HostingLog[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

const filters = ref<{ platform?: string; result?: LogResult }>({
  result: "pending"
});

async function fetchLogs() {
  loading.value = true;
  try {
    const res = await aiHostingApi.fetchLogList({
      page: page.value,
      pageSize: pageSize.value,
      platform: filters.value.platform,
      result: filters.value.result
    });
    logs.value = res?.items ?? [];
    total.value = res?.total ?? logs.value.length;
  } finally {
    loading.value = false;
  }
}

function handleFilterChange() {
  page.value = 1;
  void fetchLogs();
}

function handlePageChange(current: number, size: number) {
  page.value = current;
  pageSize.value = size;
  void fetchLogs();
}

function resultMeta(result?: string) {
  return (
    LOG_RESULT_MAP[result ?? ""] ?? { label: result ?? "-", color: "default" }
  );
}

onMounted(() => {
  void fetchLogs();
});
</script>

<template>
  <Card :bordered="false" class="trigger-card" title="规则触发历史">
    <template #extra>
      <Space>
        <Select
          v-model:value="filters.result"
          class="filter-select"
          :options="TRIGGER_RESULT_OPTIONS"
          allow-clear
          placeholder="全部结果"
          @change="handleFilterChange"
        />
        <Select
          v-model:value="filters.platform"
          class="filter-select"
          :options="PLATFORM"
          allow-clear
          placeholder="全部媒体"
          @change="handleFilterChange"
        />
        <Button @click="handleFilterChange">
          <template #icon><ReloadOutlined /></template>
          刷新
        </Button>
      </Space>
    </template>

    <Spin :spinning="loading">
      <Timeline v-if="logs.length">
        <Timeline.Item
          v-for="log in logs"
          :key="log.id"
          :color="log.result === 'report_failed' ? 'red' : 'orange'"
        >
          <Space :size="8" wrap>
            <Typography.Text strong>{{ log.ruleName || "-" }}</Typography.Text>
            <Tag :bordered="false" :color="getPlatformColor(log.platform)">
              {{ getPlatformLabel(log.platform) }}
            </Tag>
            <Tag :bordered="false" :color="resultMeta(log.result).color">
              {{ resultMeta(log.result).label }}
            </Tag>
            <Typography.Text type="secondary">
              {{ log.executedAt || log.createTime }}
            </Typography.Text>
          </Space>

          <Flex vertical :gap="0">
            <Typography.Text type="secondary">
              {{ log.advertiserName || log.advertiserId }} · {{ log.adName || log.adId }}
            </Typography.Text>
            <Typography.Text v-if="log.reason" type="secondary">
              {{ log.reason }}
            </Typography.Text>
            <Typography.Text v-if="log.errorMsg" type="danger">
              {{ log.errorMsg }}
            </Typography.Text>
          </Flex>
        </Timeline.Item>
      </Timeline>
      <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无触发记录" />
    </Spin>

    <Flex v-if="total > 0" justify="flex-end">
      <Pagination
        :current="page"
        :page-size="pageSize"
        :total="total"
        show-size-changer
        :show-total="(t: number) => `共 ${t} 条`"
        size="small"
        @change="handlePageChange"
      />
    </Flex>
  </Card>
</template>

<style scoped lang="scss">
/* 卡片撑满视图区，内容在卡片内部滚动（与其他视图的锁高保持一致） */
.trigger-card {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

.filter-select {
  min-width: 140px;
}
</style>
