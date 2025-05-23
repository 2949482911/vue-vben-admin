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
const orderReportResponse = ref<OrderReportResponse>();

const props = defineProps({
  "dim": {
    type: String,
    default: 'hour'
  }
});

/**
 * get report
 */
async function getOrderReport() {
  let days: number = 0;
  if (props.dim == 'date') {
    days = -30;
  }
  const date = DateUtils.generateDateRangeByDaysStr(days)
  orderReportResponse.value = await orderReportApi.fetchOrderReport({
    dateList: [date.endDate, date.startDate],
    needCname: true,
    metrics: ["OrderCount", "BuyUserCount", "OrderAmount"],
    filters: [],
    dimensions: [props.dim],
    decimalPoint: 2,
  })

}

onMounted(async () => {
  await getOrderReport()

  // handler data
  const {items} = orderReportResponse.value;
  const hourList: Array<string> = [];
  const dataList: Array<string> = [];
  const buyUserCount: Array<string> = [];
  const orderAmount: Array<string> = []
  items.sort((x, y) => {
    if (x[props.dim] < y[props.dim]) {
      return -1;
    }
    if (x[props.dim] > y[props.dim]) {
      return 1;
    }
    return 0;
  }).forEach(x => {
    hourList.push(x[props.dim]);
    dataList.push(x['OrderCount'])
    buyUserCount.push(x['BuyUserCount'])
    orderAmount.push(x['OrderAmount'])
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
        data: dataList,
        type: 'line',
        stack: 'Total',
        name: `${$t('media.report.metric.OrderCount')}`
      },
      {
        data: buyUserCount,
        type: 'line',
        stack: 'Total',
        name: `${$t('media.report.metric.BuyUserCount')}`
      },
      {
        data: orderAmount,
        type: 'line',
        stack: 'Total',
        name: `${$t('media.report.metric.OrderAmount')}`
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: true,
      },
      boundaryGap: false,
      data: Array.from(hourList).map((_item, _) => `${_item}${props.dim === 'hour' ? '时' : '日'}`),
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: {
      type: 'value'
    },
  }
  );
});
</script>

<template>
  <EchartsUI ref="chartRef"/>
</template>
