<script setup lang="ts" name="SelectMetricModal">
import {Page, useVbenModal} from '@vben/common-ui';
import {onMounted, ref, reactive} from 'vue';
import {metricApi} from "#/api";
import type {MetricItem} from "#/api/models";
import {Checkbox, Divider, CheckboxGroup, Space} from 'ant-design-vue'

const emit = defineEmits(['confirmMetric']);

const state = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: ['Apple', 'Orange'],
});

// metric list
const metricList = ref<MetricItem[]>([]);
const checkboxOptionTypeList = ref<{ label: string, value: string }[]>([]);

// metric list
const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await modalApi.close();
  },
  async onConfirm() {
    // 调用父组件 将选中的值返回给父组件
    emit('confirmMetric', state.checkedList);
    await modalApi.close();
  },
});

async function getMetricList() {
  const dataList: Array<MetricItem> = await metricApi.fetchMetric();
  metricList.value = dataList;
  dataList.forEach(x => {
    checkboxOptionTypeList.value.push({
      label: x.cname,
      value: x.id
    })
  })
}

const onCheckAllChange = (e: any) => {
  const plainOptions: string[] = [];
  metricList.value.forEach(x => plainOptions.push(x.id));
  Object.assign(state, {
    checkedList: e.target.checked ? plainOptions : [],
    indeterminate: false,
  });
};

onMounted(() => {
  getMetricList()
});
</script>

<template>
  <div>
    <Modal>
      <Page>
        <Checkbox
          v-model:checked="state.checkAll"
          :indeterminate="state.indeterminate"
          @change="onCheckAllChange">{{ $t('core.checkAll') }}
        </Checkbox>
        <Divider/>
        <Space size="large">
          <CheckboxGroup :options="checkboxOptionTypeList" v-model:value="state.checkedList"/>
        </Space>
      </Page>
    </Modal>
  </div>
</template>

<style scoped>

</style>
