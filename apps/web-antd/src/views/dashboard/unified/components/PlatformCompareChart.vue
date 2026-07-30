<script setup lang="ts" name="PlatformCompareChart">
/**
 * 平台对比柱状图
 *
 * 展示各平台的消耗和ROI对比
 */
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, watch } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { Card, Empty } from 'ant-design-vue';
import type { PlatformCompareItem } from '#/api/models';

const props = defineProps<{
  /** 平台对比数据 */
  data: PlatformCompareItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts, updateData } = useEcharts(chartRef);

function buildOption(data: PlatformCompareItem[]) {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params: any[]) {
        let html = params[0]?.axisValue || '';
        params.forEach((p) => {
          const val = p.seriesName === '消耗' ? `¥${(p.value).toFixed(2)}` : p.value;
          html += `<br/>${p.marker}${p.seriesName}: ${val}`;
        });
        return html;
      },
    },
    legend: {
      data: ['消耗', 'ROI'],
      bottom: 0,
    },
    grid: {
      top: '3%',
      left: '2%',
      right: '2%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.platform),
      axisTick: { alignWithLabel: true },
    },
    yAxis: [
      {
        type: 'value',
        name: '消耗(元)',
        position: 'left',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'ROI',
        position: 'right',
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '消耗',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#1668dc' },
              { offset: 1, color: '#69b1ff' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        data: data.map((d) => d.adCost),
      },
      {
        name: 'ROI',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        itemStyle: { color: '#fa8c16' },
        lineStyle: { width: 2 },
        data: data.map((d) => d.adPayRoi),
      },
    ],
  };
}

onMounted(() => {
  if (props.data.length > 0) {
    renderEcharts(buildOption(props.data));
  }
});

watch(
  () => props.data,
  (newData) => {
    if (newData.length > 0) {
      updateData(buildOption(newData));
    }
  },
  { deep: true },
);
</script>

<template>
  <Card title="平台对比" class="chart-card" :loading="loading">
    <Empty v-if="data.length === 0 && !loading" description="暂无数据" />
    <EchartsUI v-else ref="chartRef" />
  </Card>
</template>

<style scoped lang="scss">
.chart-card {
  height: 360px;

  :deep(.ant-card-body) {
    height: calc(100% - 57px);
    padding: 12px 16px;
  }
}
</style>
