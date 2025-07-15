<script lang="ts" setup>
import type {EchartsUIType} from '@vben/plugins/echarts';

import {onMounted, ref} from 'vue';

import {EchartsUI, useEcharts} from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const {renderEcharts} = useEcharts(chartRef);
import type {OrderReportResponse} from "#/api/models";
import {DateUtils} from "#/utils";
import {orderReportApi} from "#/api/media";

const orderReportResponse = ref<OrderReportResponse>();


async function getOrderReport() {
  // 默认获取30天内的数据
  const date = DateUtils.generateDateRangeByDaysStr(-30)
  orderReportResponse.value = await orderReportApi.fetchOrderReport({
    dateList: [date.endDate, date.startDate],
    needCname: true,
    metrics: ["OrderCount", "ItemCount", "BuyUserCount", "OrderAmount"],
    filters: [],
    dimensions: ["local_account_id"],
    decimalPoint: 2,
  })
}

onMounted(async () => {
  await getOrderReport();
  const {items, _} = orderReportResponse.value;
  const dataList: Array<{name: string, value: string}> = [];
  const buyUserCont: Array<{name: string, value: string}> = [];
  items.forEach(_item => {
    dataList.push({
      name: _item["accountName"],
      value: _item['OrderCount']
    });
    buyUserCont.push({
      name: _item["accountName"],
      value: _item['BuyUserCount']
    })
  })

  await renderEcharts({
    legend: {
      bottom: '2%',
      left: 'center',
    },
    series: [
      {
        animationDelay() {
          return Math.random() * 100;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        avoidLabelOverlap: false,
        // color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'],
        data: dataList,
        emphasis: {
          label: {
            fontSize: '12',
            fontWeight: 'bold',
            show: true,
          },
        },
        itemStyle: {
          // borderColor: '#fff',
          borderRadius: 10,
          borderWidth: 2,
        },
        label: {
          position: 'center',
          show: false,
        },
        labelLine: {
          show: false,
        },
        name: '订单数',
        radius: ['40%', '65%'],
        type: 'pie',
      }
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
