<script lang="ts" setup>
import type {EchartsUIType} from '@vben/plugins/echarts';

import {onMounted, ref} from 'vue';

import {EchartsUI, useEcharts} from '@vben/plugins/echarts';
import type {OrderReportResponse} from "#/api/models";
import {DateUtils} from "#/utils";
import {orderReportApi} from "#/api/media";

const chartRef = ref<EchartsUIType>();
const {renderEcharts} = useEcharts(chartRef);

const orderReportResponse = ref<OrderReportResponse>();

async function getOrderReport() {
  let days: number = -180;
  const date = DateUtils.generateDateRangeByDaysStr(days)
  orderReportResponse.value = await orderReportApi.fetchOrderReport({
    dateList: [date.endDate, date.startDate],
    needCname: true,
    metrics: ["OrderCount"],
    filters: [],
    dimensions: ['platform'],
    decimalPoint: 2,
  })

}

onMounted(async () => {
  await getOrderReport();
  const {items, _} = orderReportResponse.value;
  const data_list: Array<{name: string, value: number}> = [];
  items.forEach(x => {
    data_list.push({
      name: x.platform,
      value: x.OrderCount
    })
  })

  await renderEcharts({
    series: [
      {
        animationDelay() {
          return Math.random() * 400;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        center: ['50%', '50%'],
        color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'],
        data: data_list.sort((a, b) => {
          return a.value - b.value;
        }),
        name: '订单占比',
        radius: '80%',
        roseType: 'radius',
        type: 'pie',
      },
    ],

    tooltip: {
      trigger: 'item',
    },
  });
});
</script>

<template>
  <EchartsUI ref="chartRef"/>
</template>
