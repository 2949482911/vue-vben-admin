<script setup lang="ts" name="PlatformCompareChart">
/**
 * 平台对比柱状图
 *
 * 展示各平台的消耗和 ROI 对比。配色从 vben 设计 token 取（见 utils/chart-colors），
 * 消耗柱用主色→强调色的纵向渐变，ROI 线用警告色；卡片标题带主题色图标块。
 */
import type { ECOption, EchartsUIType } from '@vben/plugins/echarts';

import type { PlatformCompareItem } from '#/api/models';

import { onMounted, ref, watch } from 'vue';

import { Loading } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { BarChartOutlined } from '@ant-design/icons-vue';
import { Card, Empty } from 'ant-design-vue';

import { chartPalette } from '#/utils/chart-colors';

const props = defineProps<{
  /** 平台对比数据 */
  data: PlatformCompareItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

function buildOption(data: PlatformCompareItem[]): ECOption {
  const c = chartPalette();
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params: any) {
        let html = params[0]?.axisValue || '';
        params.forEach((p: any) => {
          const val =
            p.seriesName === '消耗' ? `¥${(p.value).toFixed(2)}` : p.value;
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
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: c.primary },
              { offset: 1, color: c.cyan },
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
        itemStyle: { color: c.warning },
        lineStyle: { color: c.warning, width: 2 },
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
      <span class="pt-ic"><BarChartOutlined /></span>
      平台对比
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
