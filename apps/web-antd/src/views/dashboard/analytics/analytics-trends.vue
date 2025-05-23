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
    metrics: ["OrderCount"],
    filters: [],
    dimensions: [props.dim],
    decimalPoint: 2,
  })

}

onMounted(async () => {
  await getOrderReport()

  // handler data
  const {items, columns} = orderReportResponse.value;
  const hourList: Array<string> = [];
  const dataList: Array<string> = [];
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
        areaStyle: {},
        data: dataList,
        itemStyle: {
          color: '#5ab1ef',
        },
        smooth: true,
        type: 'line',
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
        show: false,
      },
      boundaryGap: false,
      data: hourList,
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef"/>
</template>
