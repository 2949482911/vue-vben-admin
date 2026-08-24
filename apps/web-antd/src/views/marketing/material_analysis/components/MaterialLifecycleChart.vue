<script setup lang="ts" name="MaterialLifecycleChart">
/**
 * 素材生命周期分布漏斗图
 */
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, watch } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { Card } from 'ant-design-vue';
import type { LifecycleDistribution } from '#/api/models';

const props = defineProps<{
  data: LifecycleDistribution | null;
  loading?: boolean;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts, updateData } = useEcharts(chartRef);

function buildOption(data: LifecycleDistribution | null) {
  const d = data || { newCount: 0, growingCount: 0, peakCount: 0, decliningCount: 0, deadCount: 0 };
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'funnel',
        left: '10%',
        width: '80%',
        gap: 4,
        label: { show: true, position: 'inside', formatter: '{b}: {c}' },
        data: [
          { value: d.newCount, name: '新素材', itemStyle: { color: '#1668dc' } },
          { value: d.growingCount, name: '成长期', itemStyle: { color: '#13c2c2' } },
          { value: d.peakCount, name: '峰值期', itemStyle: { color: '#52c41a' } },
          { value: d.decliningCount, name: '衰退期', itemStyle: { color: '#fa8c16' } },
          { value: d.deadCount, name: '已停投', itemStyle: { color: '#bfbfbf' } },
        ],
      },
    ],
  };
}

onMounted(() => {
  //@ts-ignore
  renderEcharts(buildOption(props.data));
});

watch(
  () => props.data,
  //@ts-ignore
  (newData) => updateData(buildOption(newData)),
  { deep: true },
);
</script>

<template>
  <Card title="素材生命周期" class="chart-card" :loading="loading">
    <EchartsUI ref="chartRef" />
  </Card>
</template>

<style scoped lang="scss">
.chart-card {
  height: 320px;

  :deep(.ant-card-body) {
    height: calc(100% - 57px);
    padding: 12px 16px;
  }
}
</style>
