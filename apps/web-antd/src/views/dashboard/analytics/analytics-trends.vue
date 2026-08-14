<script lang="ts" setup>
import type { EchartsUIType } from "@vben/plugins/echarts";
import { EchartsUI, useEcharts } from "@vben/plugins/echarts";

import { onMounted, ref } from "vue";
import { dashboardApi } from "#/api";
import type { PageIndexReportResponse } from "#/api/models";

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 日流量加载

const respData = ref<PageIndexReportResponse>({
  cname: {}, items: [], summary: []
});

async function getTraffic_report_day() {
  respData.value = await dashboardApi.fetchPageIndexReport({
    reportType: "traffic_report_day"
  });
}


onMounted(async () => {
  await getTraffic_report_day();
  const xLine: Array<string> = [];
  const AdClick: Array<any> = []
  const AdShow: Array<any>  = []
  respData.value.items.forEach(x => {
    xLine.push(x["hour"]);
    AdClick.push(x["AdClick"]);
    AdShow.push(x["AdShow"]);
  })
  await renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: "1%",
      right: "1%",
      top: "2 %"
    },
    series: [
      {
        areaStyle: {},
        data: AdClick,
        itemStyle: {
          color: "#5ab1ef",
        },
        smooth: true,
        type: "line",
        name: '点击量'
      },
      {
        areaStyle: {},
        data: AdShow,
        itemStyle: {
          color: "#019680"
        },
        smooth: true,
        type: "line",
        name: '曝光'
      }
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: "#019680",
          width: 1
        }
      },
      trigger: "axis"
    },
    // xAxis: {
    //   axisTick: {
    //     show: false,
    //   },
    //   boundaryGap: false,
    //   data: Array.from({ length: 18 }).map((_item, index) => `${index + 6}:00`),
    //   type: 'category',
    // },
    xAxis: {
      axisTick: {
        show: false
      },
      boundaryGap: false,
      data: xLine.map((_item) => `${_item }:00`),
      splitLine: {
        lineStyle: {
          type: "solid",
          width: 1
        },
        show: true
      },
      type: "category"
    },
    yAxis: [
      {
        axisTick: {
          show: false
        },
        splitArea: {
          show: true
        },
        splitNumber: 4,
        type: "value"
      }
    ]
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
