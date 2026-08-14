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

async function getTraffic_report_month() {
  respData.value = await dashboardApi.fetchPageIndexReport({
    reportType: "traffic_report_month"
  });
}


onMounted(async () => {
  await getTraffic_report_month();
  const x_line: Array<string> = [];
  const x_data: Array<any> = [];
  const y_data: Array<any> = [];

  respData.value.items.forEach(x => {
      x_line.push(x["month"]);
      x_data.push(x["AdClick"])
      y_data.push(x["AdShow"])
  });


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
        barMaxWidth: 80,
        color: '#4f69fd',
        data: x_data,
        type: "bar",
        name: "点击量"
      },
      {
        barMaxWidth: 80,
        color: '#4f692d',
        data: y_data,
        type: "bar",
        name: "曝光量"
      }
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          // color: '#4f69fd',
          width: 1
        }
      },
      trigger: "axis"
    },
    xAxis: {
      data: x_line.map((_item) => `${_item}月`),
      type: "category"
    },
    yAxis: {
      splitNumber: 4,
      type: "value"
    }
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
