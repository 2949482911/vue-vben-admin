<script setup lang="ts" name="SpendTrendChart">
/**
 * 消耗趋势折线图
 *
 * 按天展示消耗和转化双折线趋势。配色从 vben 设计 token 取（见 utils/chart-colors），
 * 深浅主题一致；卡片标题带主题色图标块。
 */
import type { ECOption, EchartsUIType } from '@vben/plugins/echarts';

import type { TrendDataPoint } from '#/api/models';

import { onMounted, ref, watch } from 'vue';

import { Loading } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { LineChartOutlined } from '@ant-design/icons-vue';
import { Card, Empty } from 'ant-design-vue';

import { chartPalette } from '#/utils/chart-colors';

const props = defineProps<{
  /** 趋势数据 */
  data: TrendDataPoint[];
  /** 加载状态 */
  loading?: boolean;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 构建 ECharts 配置
function buildOption(data: TrendDataPoint[]): ECOption {
  const c = chartPalette();
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
        // 主色描边 + 同色低透明度面积，避免在 canvas 里拼 alpha 字符串
        itemStyle: { color: c.primary },
        lineStyle: { color: c.primary, width: 2 },
        areaStyle: { color: c.primary, opacity: 0.14 },
        data: data.map((d) => d.adCost), // 分 → 元
      },
      {
        name: '转化',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: c.success },
        lineStyle: { color: c.success, width: 2 },
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
      // 必须用 renderEcharts 而不是 updateData：
      // 空数据 ↔ 有数据切换时 EchartsUI 会重新挂载（DOM 换了），
      // updateData 会把配置 setOption 到已卸载的旧实例上，图表就再也画不出来；
      // renderEcharts 会比对实例 DOM，不一致时先 dispose 再重建。
      renderEcharts(buildOption(newData));
    }
  },
  { deep: true },
);
</script>

<template>
  <Card class="chart-card">
    <template #title>
      <span class="pt-ic"><LineChartOutlined /></span>
      消耗趋势
    </template>
    <!-- 用 Loading 覆盖层而不是 Card 的 loading：
         Card 的 loading 会把子节点换成 Skeleton，导致 EchartsUI 被卸载、图表实例失联 -->
    <Loading :spinning="loading">
      <Empty v-if="data.length === 0 && !loading" description="暂无数据" />
      <EchartsUI v-else ref="chartRef" />
    </Loading>
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

/* 卡片标题前的主题色图标块 */
.pt-ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #fff;
  background: hsl(var(--primary));
  border-radius: 8px;
  box-shadow: 0 3px 10px hsl(var(--primary) / 32%);
}
</style>
