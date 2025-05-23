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
    metricName: "ItemCount",
    icon: SvgCakeIcon,
    title: `${$t('media.report.order_report.itemCount')}`,
    totalTitle: `${$t('media.report.order_report.thirtyDaysItemCount')}`,
    totalValue: 0,
    value: 0,
  },
  {
    metricName: "BuyUserCount",
    icon: SvgDownloadIcon,
    title: `${$t('media.report.order_report.buyUserCount')}`,
    totalTitle: `${$t('media.report.order_report.thirtyDaysBuyUserCount')}`,
    totalValue: 0,
    value: 0,
  },
  {
    metricName: "OrderAmount",
    icon: SvgBellIcon,
    title: `${$t('media.report.order_report.orderAmount')}`,
    totalTitle: `${$t('media.report.order_report.thirtyDaysOrderAmount')}`,
    totalValue: 0,
    value: 0,
  },
]);


// 图表
const chartTabs: TabOption[] = [
  {
    label: `${$t('media.report.chartTabs.hour_trend_chart')}`,
    value: 'hour',
  },
  {
    label: `${$t('media.report.chartTabs.day_trend_chart')}`,
    value: 'day',
  },
  {
    label: `${$t('media.report.chartTabs.mouth_trend_chart')}`,
    value: 'mouth',
  }
];

//
const orderReportResponse = ref<OrderReportResponse>();


async function getOrderReport() {
  // 默认获取30天内的数据
  const date = DateUtils.generateDateRangeByDaysStr(-30)
  orderReportResponse.value = await orderReportApi.fetchOrderReport({
    dateList: [date.endDate, date.startDate],
    needCname: true,
    metrics: ["OrderCount", "BuyUserCount", "OrderAmount"],
    filters: [],
    dimensions: ["date"],
    decimalPoint: 2,
  })
  await setValues();
}

async function setValues() {
  // set values
  overviewItems.value.forEach(item => {
    orderReportResponse.value.items.forEach(data => {
      if (DateUtils.getCurrentDateStr() === data['date']) {
        item.value = Number(data[item.metricName]) || 0
      }
    })
  })


  // set total
  overviewItems.value.forEach(item => {
    const total = orderReportResponse.value.total[0];
    item.totalValue = Number(total[item.metricName]) || 0
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
      <template #hour>
        <AnalyticsTrends :dim="'hour'"/>
      </template>
      <template #day>
        <AnalyticsTrends :dim="'date'"/>
      </template>
      <template #mouth>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData/>
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" :title="`${$t('media.report.chartTabs.dimensions_local_account')}`">
        <AnalyticsVisitsSource/>
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales/>
      </AnalysisChartCard>
    </div>
  </div>
</template>
