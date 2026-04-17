<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { ref,watch } from 'vue';
import { useVbenModal } from "@vben/common-ui";
import SelectMetricModal from "#/views/marketing/report/adreportdata/selectmetric.vue";
const currentQueryMetric = ref<string[]>([]);
// Props 定义
interface Props {
  metricList?: string[];
  onConfirm?: (metricIds: string[]) => void;
}
const props = withDefaults(defineProps<Props>(), {
  metricList: () => [],
  onConfirm: () => {},
});
// 监听外部传入的 value 变化
watch(
  () => props.metricList,
  (newVal) => {
    console.log('newVal', newVal);
    if (newVal && Array.isArray(newVal) && newVal.length > 0) {
      currentQueryMetric.value = [...newVal];
    } else if (newVal && Array.isArray(newVal) && newVal.length === 0) {
      currentQueryMetric.value = [];
    }
  },{
    deep: true,
    immediate: true
  }
);

const [SelectMetricModalModal, selectMetricModalApi] = useVbenModal({
  connectedComponent: SelectMetricModal,
});
function reloadFromStart(metricIds: string[]) {
  currentQueryMetric.value = metricIds;
  props.onConfirm?.(metricIds);
}
async function openPlatformMetricMapDetailModal() {
  selectMetricModalApi.open();
}
</script>
<template>
  <div class="metric-item"> 
    <Button type="primary" @click="openPlatformMetricMapDetailModal">选择指标</Button>
    <span class="selected-metric">已选{{currentQueryMetric.length}}个指标</span>
  </div>
  <SelectMetricModalModal  
  @confirmMetric="reloadFromStart" 
  :selectedMetrics="currentQueryMetric"/>
</template>

<style lang="scss" scoped>
.metric-item {
  .selected-metric {
    font-size: 12px;
    color: #a8abb2;
    margin-left: 5px;
  }
}

</style>
