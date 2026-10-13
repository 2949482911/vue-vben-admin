<script lang="ts" setup>
import type { AnalysisOverviewItem } from "@vben/common-ui";
import type { TabOption } from "@vben/types";

import type { PageIndexReportResponse } from "#/api/models";

import { onMounted, ref } from "vue";

import { AnalysisChartCard, AnalysisChartsTabs, AnalysisOverview } from "@vben/common-ui";
import { SvgBellIcon, SvgCakeIcon, SvgCardIcon, SvgDownloadIcon } from "@vben/icons";

import { dashboardApi } from "#/api";

import AnalyticsTrends from "./analytics-trends.vue";
import AnalyticsVisitsData from "./analytics-visits-data.vue";
import AnalyticsVisitsSales from "./analytics-visits-sales.vue";
import AnalyticsVisitsSource from "./analytics-visits-source.vue";
import AnalyticsVisits from "./analytics-visits.vue";

const respData = ref<PageIndexReportResponse>({
  cname: {}, items: [], summary: []
});

async function getCostReport() {
  respData.value = await dashboardApi.fetchPageIndexReport({
    reportType: "cost_report"
  });
}


const overviewItems = ref<AnalysisOverviewItem[]>([]);

// 后端汇总字段可能是字符串数字（如 "0"），数字滚动组件需要 number，统一转数值
function toNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

/**
 * 指标文案：cname 里不一定有对应字段，取值会是 undefined，
 * 直接塞进模板会渲染出字符串 "undefined"，这里统一兜底成 -
 */
function toLabel(value: unknown): string {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

async function initOverviewItems() {
  if (respData.value.summary) {
    const cname = respData.value.cname;
    const summary = respData.value.summary[0] || {};
    overviewItems.value = [
      {
        icon: SvgCardIcon,
        title: toLabel(cname.AdRegister),
        totalTitle: toLabel(cname.AdRegister),
        totalValue: toNumber(summary.AdRegister),
        value: toNumber(summary.AdRegister)
      },
      {
        icon: SvgCakeIcon,
        title: toLabel(cname.AdCost),
        totalTitle: toLabel(cname.AdCost),
        totalValue: toNumber(summary.AdCost),
        value: toNumber(summary.AdCost)
      },
      {
        icon: SvgDownloadIcon,
        title: toLabel(cname.AdActivate),
        totalTitle: toLabel(cname.AdActivate),
        totalValue: toNumber(summary.AdActivate),
        value: toNumber(summary.AdActivate)
      },
      {
        icon: SvgBellIcon,
        title: toLabel(cname.AdPayOneTimeAmount),
        totalTitle: "总使用量",
        totalValue: toNumber(summary.AdPayOneTimeAmount),
        value: toNumber(summary.AdPayOneTimeAmount)
      }
    ];
  }
}

onMounted(async () => {
  await getCostReport();
  await initOverviewItems();
});
//


const chartTabs: TabOption[] = [
  {
    label: "流量趋势",
    value: "trends"
  },
  {
    label: "月访问量",
    value: "visits"
  }
];
</script>

<template>
  <div class="analytics-page p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*
 * 仅本页适配：给 vben 的 AnalysisOverview 四张卡按顺序上主题色。
 * 不修改 @vben/common-ui 组件本身，:`deep()` 作用域限定在本页。
 * 颜色取 vben token，cyan / violet 为本站补充强调色（vben 无内置）。
 */
.analytics-page {
  :deep(.grid.grid-cols-1 > *:nth-child(1)) {
    --tint: hsl(var(--primary));
  }

  :deep(.grid.grid-cols-1 > *:nth-child(2)) {
    --tint: hsl(187 78% 38%);
  }

  :deep(.grid.grid-cols-1 > *:nth-child(3)) {
    --tint: hsl(var(--success));
  }

  :deep(.grid.grid-cols-1 > *:nth-child(4)) {
    --tint: hsl(258 84% 62%);
  }

  :deep(.grid.grid-cols-1 > *) {
    border-color: color-mix(in srgb, var(--tint) 22%, transparent);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tint) 10%, hsl(var(--card))) 0%,
      color-mix(in srgb, var(--tint) 3%, hsl(var(--card))) 100%
    );
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  :deep(.grid.grid-cols-1 > *:hover) {
    transform: translateY(-2px);
    box-shadow: 0 10px 26px color-mix(in srgb, var(--tint) 18%, transparent);
  }
}
</style>
