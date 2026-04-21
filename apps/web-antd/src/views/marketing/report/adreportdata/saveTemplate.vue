<script setup lang="ts" name="SelectMetricModal">
import { useVbenModal } from '@vben/common-ui';
import { reportTemplateApi } from '#/api';
import { useVbenForm } from '#/adapter/form';
import type { searchDataFilter } from "#/api/models";
import { message } from 'ant-design-vue';
import { ref } from 'vue';

// 子组件接收父组件传过来搜索的数据模板
const props = defineProps<{
  searchData: searchDataFilter;
}>();
const isUpdate = ref(false);
const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: async (formVal: Record<string, any>) => {
    try {
      delete props.searchData.dateTimeRange;
      if(!props.searchData.queryMetric.length) return message.error('请勾选指标！');
      isUpdate.value ? await reportTemplateApi.fetchUpdateTemplate({
        id: formVal.id,
        name: formVal.name,
        type: 'base',
        remark: formVal.remark,
        template: props.searchData,
      }) : await reportTemplateApi.fetchReportTemplate({
        name: formVal.name,
        type: 'base',
        remark: formVal.remark,
        template: props.searchData,
      });
      // 提示保存成功
      message.success('保存成功！');
      emit('success');
      // 可选：关闭弹窗
      await modalApi.close();
    } catch (err) {
      console.error(err);
    }
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      }
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '报表名字',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '报表备注',
    },
  ],
  showDefaultActions:false
});

// Modal
const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData()
      console.log('data', data);
      if(data.id) {
        isUpdate.value = true;
        await formApi.setFieldValue('name',data.name);
        await formApi.setFieldValue('remark',data.remark);
        await formApi.setFieldValue('id',data.id);
      } else {
        console.log('创建');
        isUpdate.value = false;
        formApi.resetForm();
      }
    } else {
      isUpdate.value = false;    }
  },
  async onCancel() {
    isUpdate.value = false;
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    await formApi.submitForm();
  },
});

const emit = defineEmits<{
  (e: 'success'): void;
}>();
</script>

<template>
  <div>
    <Modal title="保存模板">
      <Form/>
    </Modal>
  </div>
</template>


<style lang="scss" scoped>
  
</style>
