<script setup lang="ts" name="SelectMetricModal">
import { Page, useVbenModal } from '@vben/common-ui';
import { onMounted, ref, reactive, watch } from 'vue';
import { metricApi } from '#/api';
import type { MetricItem } from '#/api/models';
import { Checkbox, Divider, CheckboxGroup, Space, InputSearch } from 'ant-design-vue';

const emit = defineEmits(['confirmMetric']);

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

// 🔍 实时搜索（核心）
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

// 全选
const onCheckAllChange = (e: any) => {
  const currentOptions = checkboxOptionTypeList.value.map(x => x.value);

  Object.assign(state, {
    checkedList: e.target.checked ? currentOptions : [],
    indeterminate: false,
  });
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
          <CheckboxGroup
            class="metric-checkbox-group"
            :options="checkboxOptionTypeList"
            v-model:value="state.checkedList"
          />
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
