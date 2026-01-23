<script setup lang="ts" name="SelectMetricModal">
import { Page, useVbenModal } from '@vben/common-ui';
import { onMounted, ref, reactive, watch, nextTick, computed } from 'vue';
import { metricApi } from '#/api';
import type { MetricItem } from '#/api/models';
import { Checkbox, Divider, CheckboxGroup, Space, InputSearch } from 'ant-design-vue';

const emit = defineEmits(['confirmMetric']);

//接收父组件使用模板传回来的指标回显数组
const props = defineProps<{
  selectedMetrics: string[]
}>()

// 搜索关键字
const indicatorValue = ref('');

// checkbox 状态
const state = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: [] as string[],
});

// 原始指标列表（不动）
const metricList = ref<MetricItem[]>([]);

const visibleMetricIds = computed(() => {
  const keyword = indicatorValue.value.trim().toLowerCase();
  if (!keyword) {
    return metricList.value.map(item => item.id);
  }
  return metricList.value
    .filter(item => item.cname.toLowerCase().includes(keyword))
    .map(item => item.id);
});


// 实际用于展示的 checkbox options
const checkboxOptionTypeList = ref<{ label: string; value: string }[]>([]);

// Modal
const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await modalApi.close();
  },
  async onConfirm() {
    emit('confirmMetric', state.checkedList);
    await modalApi.close();
  },
  async onOpenChange(isOpen){
    if (isOpen) {
      nextTick(() => {
        state.checkedList = props.selectedMetrics
          ? [...props.selectedMetrics]
          : [];
      });
    }
  }
});

// 拉取指标
async function getMetricList() {
  const dataList:any = await metricApi.fetchMetric();
  metricList.value = dataList;
  updateCheckboxOptions(dataList);
}

// 根据列表更新 checkbox options
function updateCheckboxOptions(list: MetricItem[]) {
  checkboxOptionTypeList.value = list.map(item => ({
    label: item.cname,
    value: item.id,
  }));
}

// 实时搜索（核心）
watch(indicatorValue, (keyword) => {
  const searchText = keyword.trim().toLowerCase();
  if (!searchText) {
    // 关键字为空，恢复全部
    updateCheckboxOptions(metricList.value);
    return;
  }
  const filteredList = metricList.value.filter(item =>
    item.cname.toLowerCase().includes(searchText)
  );
  updateCheckboxOptions(filteredList);
});

//监听指标全选框和未全选框的状态
watch(
  () => state.checkedList,
  (val) => {
    const total = checkboxOptionTypeList.value.length;
    if (val.length === 0) {
      state.checkAll = false;
      state.indeterminate = false;
    } else if (val.length === total) {
      state.checkAll = true;
      state.indeterminate = false;
    } else {
      state.checkAll = false;
      state.indeterminate = true;
    }
  },
  { deep: true }
);


// 全选
const onCheckAllChange = (e: any) => {
  const currentOptions = checkboxOptionTypeList.value.map(x => x.value);

  if (e.target.checked) {
    // ✅ 追加（去重）
    state.checkedList = Array.from(
      new Set([...state.checkedList, ...currentOptions])
    );
  } else {
    // ✅ 只取消“当前搜索结果”里的
    state.checkedList = state.checkedList.filter(
      val => !currentOptions.includes(val)
    );
  }

  state.indeterminate = false;
};


onMounted(() => {
  getMetricList();
});
</script>

<template>
  <div>
    <Modal class="w-[720px] max-w-[720px] mx-auto">
      <div style="padding-left: 1rem;">
        <InputSearch
          v-model:value="indicatorValue"
          placeholder="请输入指标名称搜索"
          style="width: 200px"
          allowClear
        />
      </div>

      <Page>
        <Checkbox
          v-model:checked="state.checkAll"
          :indeterminate="state.indeterminate"
          @change="onCheckAllChange"
        >
          {{ $t('core.checkAll') }}
        </Checkbox>

        <Divider />

        <Space size="large">
          <CheckboxGroup v-model:value="state.checkedList">
            <div class="metric-checkbox-group">
              <Checkbox
                v-for="item in metricList"
                :key="item.id"
                :value="item.id"
                v-show="visibleMetricIds.includes(item.id)"
              >
                {{ item.cname }}
              </Checkbox>
            </div>
          </CheckboxGroup>
        </Space>
      </Page>
    </Modal>
  </div>
</template>


<style lang="scss" scoped>
  //指标全选按钮分列排序每行三个，一起三列
  .metric-checkbox-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px 16px;
  }
</style>
