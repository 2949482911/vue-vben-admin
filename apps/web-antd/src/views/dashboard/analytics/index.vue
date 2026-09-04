<script lang="ts" setup>
import type { AnalysisOverviewItem } from "@vben/common-ui";
import { AnalysisChartCard, AnalysisChartsTabs, AnalysisOverview } from "@vben/common-ui";
import type { TabOption } from "@vben/types";
import { SvgBellIcon, SvgCakeIcon, SvgCardIcon, SvgDownloadIcon } from "@vben/icons";
import { onMounted, ref } from "vue";

import AnalyticsTrends from "./analytics-trends.vue";
import AnalyticsVisitsData from "./analytics-visits-data.vue";
import AnalyticsVisitsSales from "./analytics-visits-sales.vue";
import AnalyticsVisitsSource from "./analytics-visits-source.vue";
import AnalyticsVisits from "./analytics-visits.vue";
import { dashboardApi } from "#/api";
import type { PageIndexReportResponse } from "#/api/models";

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

async function initOverviewItems() {
  if (respData.value.summary) {
    const summary = respData.value.summary[0] || {};
    overviewItems.value = [
      {
        icon: SvgCardIcon,
        title: `${respData.value.cname["AdRegister"]}`,
        totalTitle: `${respData.value.cname["AdRegister"]}`,
        totalValue: toNumber(summary.AdRegister),
        value: toNumber(summary.AdRegister)
      },
      {
        icon: SvgCakeIcon,
        title: `${respData.value.cname["AdCost"]}`,
        totalTitle: `${respData.value.cname["AdCost"]}`,
        totalValue: toNumber(summary.AdCost),
        value: toNumber(summary.AdCost)
      },
      {
        icon: SvgDownloadIcon,
        title: `${respData.value.cname["AdActivate"]}`,
        totalTitle: `${respData.value.cname["AdActivate"]}`,
        totalValue: toNumber(summary.AdActivate),
        value: toNumber(summary.AdActivate)
      },
      {
        icon: SvgBellIcon,
        title: `${respData.value.cname["AdPayOneTimeAmount"]}`,
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
  <div class="p-5">
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
