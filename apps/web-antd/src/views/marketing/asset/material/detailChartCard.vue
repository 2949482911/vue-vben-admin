<script setup lang="ts" name="DetailChartCard">
/**
 * 投放数据图表卡片
 *
 * 统一承载 EchartsUI 的卡片外壳：标题、右侧说明、空态文案、图表高度。
 * 图表用项目内置的 @vben/plugins/echarts，卡片风格与详情页其他卡片保持一致。
 *
 * 说明：`echarts` 只作为 @vben/plugins 的依赖存在，本应用未直接依赖它，
 * 因此图表配置按普通对象传递，不引入 echarts 的类型包。
 */
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card } from 'ant-design-vue';

const props = withDefaults(
  defineProps<{
    /** 卡片标题 */
    title: string;
    /** 标题右侧口径说明 */
    hint?: string;
    /** 图表高度 */
    height?: string;
    /** 无数据时叠加空态文案 */
    empty?: boolean;
    /** 取数中：图表区叠加 loading 遮罩，不卸载图表实例 */
    loading?: boolean;
    /** echarts 配置 */
    option: Record<string, any>;
  }>(),
  { empty: false, height: '260px', hint: '', loading: false },
);

const chartRef = ref<EchartsUIType>();
const { renderEcharts, updateData } = useEcharts(chartRef);

/**
 * 空态只覆盖一层文案，坐标轴与图例照常渲染。
 * 后端补上数据后直接出图，不需要改动图表结构。
 */
const finalOption = computed<Record<string, any>>(() => props.option);

watch(finalOption, (option) => updateData(option, true), { deep: true });

onMounted(() => {
  renderEcharts(finalOption.value);
});
</script>

<template>
  <Card :bordered="false" class="chart-card" size="small">
    <template #title>
      <span class="chart-title">{{ title }}</span>
    </template>
    <template #extra>
      <span v-if="hint" class="chart-hint">{{ hint }}</span>
    </template>

    <div v-loading="loading" class="chart-body" :style="{ height }">
      <EchartsUI ref="chartRef" height="100%" />
      <div v-if="empty && !loading" class="chart-empty">当前条件下暂无数据</div>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.chart-card {
  height: 100%;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;

  :deep(.ant-card-head) {
    min-height: 42px;
    padding: 0 16px;
  }

  :deep(.ant-card-head-title) {
    font-size: 14px;
    font-weight: 600;
  }

  :deep(.ant-card-body) {
    padding: 8px 12px 12px;
  }
}

.chart-body {
  position: relative;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  pointer-events: none;
}

.chart-hint {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}
</style>
