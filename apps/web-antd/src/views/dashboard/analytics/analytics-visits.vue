<script lang="ts" setup>
import type {EchartsUIType} from '@vben/plugins/echarts';

import {onMounted, ref} from 'vue';
import {$t} from '@vben/locales';

import {EchartsUI, useEcharts} from '@vben/plugins/echarts';
import type {OrderReportResponse} from "#/api/models";
import {DateUtils} from "#/utils";
import {orderReportApi} from "#/api/media";

const chartRef = ref<EchartsUIType>();
const {renderEcharts} = useEcharts(chartRef);

// 数据氢气
const orderReportResponse = ref<OrderReportResponse>();


async function getOrderReport() {
  let days: number = -180;
  const date = DateUtils.generateDateRangeByDaysStr(days)
  orderReportResponse.value = await orderReportApi.fetchOrderReport({
    dateList: [date.endDate, date.startDate],
    needCname: true,
    metrics: ["OrderCount", "BuyUserCount", "OrderAmount"],
    filters: [],
    dimensions: ['month'],
    decimalPoint: 2,
  })

}

onMounted(async () => {
  await getOrderReport();
  const {items, _} = orderReportResponse.value;
  const dimsList: Array<string> = [];
  const dataList: Array<string> = [];
  const buyUserCount: Array<string> = [];
  const orderAmount: Array<string> = []
  items.sort((x, y) => {
    if (x['date'] < y['date']) {
      return -1;
    }
    if (x['date'] > y['date']) {
      return 1;
    }
    return 0;
  }).forEach(x => {
    dimsList.push(x['date']);
    dataList.push(x['OrderCount']);
    buyUserCount.push(x["BuyUserCount"])
    orderAmount.push(x["OrderAmount"])
  })
  await renderEcharts({
    legend: {
      data: [`${$t('media.report.metric.OrderCount')}`, `${$t('media.report.metric.BuyUserCount')}`, `${$t('media.report.metric.OrderAmount')}`]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '1%',
      containLabel: true
    },
    series: [
      {
        barMaxWidth: 80,
        data: dataList,
        type: 'bar',
        name: `${$t('media.report.metric.OrderCount')}`
      },
      {
        barMaxWidth: 80,
        data: buyUserCount,
        type: 'bar',
        name: `${$t('media.report.metric.BuyUserCount')}`
      },
      {
        barMaxWidth: 80,
        data: orderAmount,
        type: 'bar',
        name: `${$t('media.report.metric.OrderAmount')}`
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#4f69fd',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      data: Array.from(dimsList).map((_item, _) => `${_item}月`),
      type: 'category',
    },
    yAxis: {
      // max: 8000,
      splitNumber: 4,
      type: 'value',
    },
  }
  );
});
</script>

<template>
  <EchartsUI ref="chartRef"/>
</template>
