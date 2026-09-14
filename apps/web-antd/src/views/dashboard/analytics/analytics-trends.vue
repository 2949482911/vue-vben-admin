<script lang="ts" setup>
import type { EchartsUIType } from "@vben/plugins/echarts";

import type { PageIndexReportResponse } from "#/api/models";

import { onMounted, ref } from "vue";

import { EchartsUI, useEcharts } from "@vben/plugins/echarts";

import { Empty, message } from "ant-design-vue";

import { dashboardApi } from "#/api";

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 日流量加载

const respData = ref<PageIndexReportResponse>({
  cname: {}, items: [], summary: []
});

// 接口无数据时展示空态，避免渲染成一张空白坐标系
const isEmpty = ref(false);

async function getTraffic_report_day() {
  respData.value = await dashboardApi.fetchPageIndexReport({
    reportType: "traffic_report_day"
  });
}


onMounted(async () => {
  let items: Array<Record<string, any>>;
  try {
    await getTraffic_report_day();
    items = respData.value.items ?? [];
  } catch {
    await message.error("流量趋势数据加载失败，请稍后重试");
    return;
  }
  isEmpty.value = items.length === 0;
  if (isEmpty.value) {
    return;
  }
  const xLine: Array<string> = [];
  const AdClick: Array<any> = []
  const AdShow: Array<any>  = []
  items.forEach(x => {
    xLine.push(x.hour);
    AdClick.push(x.AdClick);
    AdShow.push(x.AdShow);
  })
  await renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: "1%",
      right: "1%",
      top: "2%"
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
      data: xLine.map((_item) => `${_item}:00`),
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
  <div v-if="isEmpty" class="flex h-[300px] items-center justify-center">
    <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无今日流量数据" />
  </div>
  <EchartsUI v-else ref="chartRef" />
</template>
