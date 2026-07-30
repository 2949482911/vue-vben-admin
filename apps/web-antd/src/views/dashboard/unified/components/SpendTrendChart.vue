<script setup lang="ts" name="SpendTrendChart">
/**
 * 消耗趋势折线图
 *
 * 按天展示消耗和转化双折线趋势
 * 参考 analytics-trends.vue 的 useEcharts 用法
 */
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, watch } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { Card, Empty } from 'ant-design-vue';
import type { TrendDataPoint } from '#/api/models';

const props = defineProps<{
  /** 趋势数据 */
  data: TrendDataPoint[];
  /** 加载状态 */
  loading?: boolean;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts, updateData } = useEcharts(chartRef);

// 构建 ECharts 配置
function buildOption(data: TrendDataPoint[]) {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['消耗', '转化'],
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
      boundaryGap: false,
      data: data.map((d) => d.day),
      axisTick: { show: false },
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
        name: '转化',
        position: 'right',
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '消耗',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.15 },
        itemStyle: { color: '#1668dc' },
        data: data.map((d) => d.adCost), // 分 → 元
      },
      {
        name: '转化',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#00b96b' },
        data: data.map((d) => d.adConvertAppCustom),
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
  <Card title="消耗趋势" class="chart-card" :loading="loading">
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
