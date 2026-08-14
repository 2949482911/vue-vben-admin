<script lang="ts" setup>
import type { EchartsUIType } from "@vben/plugins/echarts";
import { EchartsUI, useEcharts } from "@vben/plugins/echarts";

import { onMounted, ref } from "vue";
import type { PageIndexReportResponse } from "#/api/models";
import { dashboardApi } from "#/api";

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const respData = ref<PageIndexReportResponse>({
  cname: {}, items: [], summary: []
});

async function getTraffic_report_count() {
  respData.value = await dashboardApi.fetchPageIndexReport({
    reportType: "traffic_report_count"
  });
}

onMounted(async () => {
  await getTraffic_report_count();
  const indicator: Array<{name: string}> = [];
  const indicator_map: Record<string, any> = {};
  const x_data: Array<number> = [];
  const y_data: Array<number> = [];
  respData.value.items.forEach(x => {
    indicator_map[x["platform"]] = 1;
    x_data.push(x["AdClick"]);
    y_data.push(x["AdShow"]);
  });

  for (let indicatorMapKey in indicator_map) {
    indicator.push({
      name: indicatorMapKey
    })
  }

  await renderEcharts({
    legend: {
      bottom: 0,
      data: ["访问", "趋势"]
    },
    radar: {
      indicator: indicator,
      radius: "60%",
      splitNumber: 8
    },
    series: [
      {
        areaStyle: {
          opacity: 1,
          shadowBlur: 0,
          shadowColor: "rgba(0,0,0,.2)",
          shadowOffsetX: 0,
          shadowOffsetY: 10
        },
        data: [
          {
            itemStyle: {
              color: "#b6a2de"
            },
            name: "点击量",
            value: x_data
          },
          {
            itemStyle: {
              color: "#5ab1ef"
            },
            name: "曝光",
            value: y_data
          }
        ],
        itemStyle: {
          // borderColor: '#fff',
          borderRadius: 10,
          borderWidth: 2
        },
        symbolSize: 0,
        type: "radar"
      }
    ],
    tooltip: {}
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
