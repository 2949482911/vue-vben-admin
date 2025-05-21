<script lang="ts" setup>
import type {AnalysisOverviewItem} from '@vben/common-ui';
import {AnalysisChartCard, AnalysisChartsTabs, AnalysisOverview,} from '@vben/common-ui';
import type {TabOption} from '@vben/types';
import {ref, onMounted} from 'vue'
import {orderReportApi} from "#/api/media";
import {SvgBellIcon, SvgCakeIcon, SvgCardIcon, SvgDownloadIcon,} from '@vben/icons';
import {$t} from '@vben/locales';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';
import {DateUtils} from "#/utils";
import type {OrderReportResponse} from "#/api/models";

// 指标
const overviewItems = ref<Array<AnalysisOverviewItem>>([
  {
    metricName: "OrderCount",
    icon: SvgCardIcon,
    title: `${$t('media.report.order_report.orderCount')}`,
    totalTitle: `${$t('media.report.order_report.thirtyDaysOrderCount')}`,
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgCakeIcon,
    title: '访问量',
    totalTitle: '总访问量',
    totalValue: 500_000,
    value: 20_000,
  },
  {
    icon: SvgDownloadIcon,
    title: '下载量',
    totalTitle: '总下载量',
    totalValue: 120_000,
    value: 8000,
  },
  {
    icon: SvgBellIcon,
    title: '使用量',
    totalTitle: '总使用量',
    totalValue: 50_000,
    value: 5000,
  },
]);


const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];

//
const orderReportResponse = ref<OrderReportResponse>();


async function getOrderReport() {
  // 默认获取30天内的数据
  const date = DateUtils.generateDateRangeByDaysStr(-30)
  orderReportResponse.value = await orderReportApi.fetchOrderReport({
    dateList: [date.endDate, date.startDate],
    needCname: true,
    metrics: ["OrderCount"],
    filters: [],
    dimensions: ["date"],
    decimalPoint: 2,
  })

  // set values
  await setValues();
}

async function setValues() {
  // set values
  overviewItems.value.forEach(item => {
    orderReportResponse.value.items.forEach(data => {
      if (DateUtils.getCurrentDateStr() === data['date']) {
        item.value = data[item.metricName] || 0
      }
    })
  })

  // set total
  overviewItems.value.forEach(item => {
    const total = orderReportResponse.value.total[0];
    item.totalValue = total[item.metricName] || 0
  })
}


onMounted(async () => {
  await getOrderReport()
})

</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems"/>
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends/>
      </template>
      <template #visits>
        <AnalyticsVisits/>
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData/>
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource/>
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales/>
      </AnalysisChartCard>
    </div>
  </div>
</template>
