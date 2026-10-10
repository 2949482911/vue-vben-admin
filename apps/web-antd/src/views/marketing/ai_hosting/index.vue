<script setup lang="ts" name="AiHostingList">
/**
 * AI 智能托管 — 页面
 *
 * 实时托管概览（KPI 驾驶舱）+ 分段切换（托管任务 / 审核台）。触发留痕已并入审核台。
 * 切换使用 ant-design-vue 的 Segmented（对应用户原型图的分段按钮风格）。
 * 三个视图共用同一块「锁高」区域，各自内部滚动，与页面其余部分保持一致。
 */
import type { HostingStats } from "#/api/models/ai_hosting";
import { computed, h, nextTick, onMounted, ref } from "vue";

import { Page } from "@vben/common-ui";

import { Badge, Segmented, Space } from "ant-design-vue";

import { aiHostingApi } from "#/api/core";

import HostingCockpit from "./components/HostingCockpit.vue";
import HostingReviewConsole from "./components/HostingReviewConsole.vue";
import HostingTaskList from "./components/HostingTaskList.vue";

/** 当前视图 */
const activeTab = ref<string>("tasks");

/** 统计概览（后端 P1 修复前可能恒为 0） */
const stats = ref<HostingStats | null>(null);
const statsLoading = ref(false);

/** 待审核决策数（供概览与分段角标联动） */
const pendingCount = ref(0);

const reviewRef = ref<null | { focusPending: () => void }>(null);

/** 分段选项（审核台带待审核角标） */
const segmentOptions = computed(() => [
  { label: "托管任务", value: "tasks" },
  {
    label: () =>
      h(
        Space,
        { size: 4 },
        {
          default: () => [
            h("span", "审核台"),
            pendingCount.value > 0
              ? h(Badge, { count: pendingCount.value, overflowCount: 99 })
              : null
          ]
        }
      ),
    value: "review"
  }
]);

async function fetchStats() {
  statsLoading.value = true;
  try {
    stats.value = await aiHostingApi.fetchStats({});
  } catch {
    stats.value = null;
  } finally {
    statsLoading.value = false;
  }
}

/** 待审核数量：页面自行拉取一次，保证未进入审核台时角标也已就绪 */
async function fetchPendingCount() {
  try {
    const res = await aiHostingApi.fetchDecisionList({
      page: 1,
      pageSize: 1,
      decisionStatus: "pending"
    });
    pendingCount.value = res?.total ?? 0;
  } catch {
    pendingCount.value = 0;
  }
}

/** 审核台回传的待审核数量（审批后联动角标） */
function handlePendingChange(count: number) {
  pendingCount.value = count;
}

/** 概览「待审核」点击：切到审核台并回到待审核视图 */
async function goReview() {
  activeTab.value = "review";
  await nextTick();
  reviewRef.value?.focusPending();
}

onMounted(() => {
  void fetchStats();
  void fetchPendingCount();
});
</script>

<template>
  <Page auto-content-height>
    <div class="hosting-page">
      <!-- 实时托管概览（按内容高度固定） -->
      <HostingCockpit
        class="hosting-cockpit"
        :loading="statsLoading"
        :pending-count="pendingCount"
        :stats="stats"
        @open-pending="goReview"
      />

      <!-- 视图切换：分段按钮（对齐原型图） -->
      <Segmented
        v-model:value="activeTab"
        class="hosting-segmented"
        :options="segmentOptions"
      />

      <!-- 视图区：占满剩余高度，各视图内部滚动 -->
      <div class="hosting-views">
        <HostingTaskList v-if="activeTab === 'tasks'" class="hosting-view" />
        <HostingReviewConsole
          v-else-if="activeTab === 'review'"
          ref="reviewRef"
          class="hosting-view"
          @pending-change="handlePendingChange"
        />
      </div>
    </div>
  </Page>
</template>

<style scoped lang="scss">
/*
 * 仅保留 antd 组件无法表达的锁高布局：整页 flex 列，视图区占满剩余高度。
 * 其余视觉全部由组件实现。对齐 material / ai_copilot 页的锁高范式。
 */
.hosting-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.hosting-cockpit {
  flex: none;
}

.hosting-segmented {
  flex: none;
  align-self: flex-start;
  margin-bottom: 16px;
}

.hosting-views {
  flex: 1;
  min-height: 0;
}

.hosting-view {
  height: 100%;
}
</style>
