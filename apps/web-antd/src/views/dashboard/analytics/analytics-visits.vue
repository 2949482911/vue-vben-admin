<script lang="ts" setup>
import type {EchartsUIType} from '@vben/plugins/echarts';

import {onMounted, ref} from 'vue';

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
    metrics: ["OrderCount"],
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
    dataList.push(x['OrderCount'])
  })
  await renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2 %',
    },
    series: [
      {
        barMaxWidth: 80,
        // color: '#4f69fd',
        data: dataList,
        type: 'bar',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          // color: '#4f69fd',
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
  });
});
</script>

<template>
  <EchartsUI ref="chartRef"/>
</template>
