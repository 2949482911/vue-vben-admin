<script lang="ts" setup>
import {Page, useVbenModal,type VbenFormProps} from '@vben/common-ui';
import { ref } from 'vue';
import { useVbenForm } from '#/adapter/form';
import {$t} from '@vben/locales';
import { trimObject } from '#/utils/trim';
import type {MetricGroupType,UpdateMetricGroupType} from '#/api/models';
import { metricGroupApi } from '#/api/core';
const emit = defineEmits(['pageReload']);

const isUpdate = ref<boolean>(false)
const [Modal,modalApi] = useVbenModal({
  onOpenChange(isOpen: Boolean) {
    if(isOpen) {
      const modalData:MetricGroupType = modalApi.getData()
      console.log('modaldata',modalData)
      if(modalData.id) {
        handleResetFormVal(modalData)
        isUpdate.value = true
      } else {
        isUpdate.value = false
      }
    }
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;
    try{
      await formApi.submitForm();
      isUpdate.value = false;
      emit('pageReload');
      await modalApi.close()
    }catch(error) {
      console.error('提交失败', error);
    }
    
  }
})

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'id',
      dependencies: { show: false, triggerFields: ['*'] },
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'name',
      label: $t('marketing.metricGroup.columns.name'),
      rules: 'required'
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'description',
      label: $t('marketing.metricGroup.columns.description'),
    }
  ],
    handleSubmit: async (formVal: Record<string, any>) => {
      const formValues = { ...formVal };
      const params = trimObject(formValues);
      if(isUpdate.value) {
        await metricGroupApi.fetchUpdateMetricGroupList(params as UpdateMetricGroupType)
      } else {
        await metricGroupApi.fetchNewMetricGroupList(params as MetricGroupType)
      }
    }
})
function handleResetFormVal(row: MetricGroupType) {
  formApi.setValues({...row})
}
const title:string = isUpdate.value ? $t('common.edit') : $t('common.create');
</script>

<template>
  <Modal class="w-[30%]" :title="title">
    <Form/>
  </Modal>
</template>


<style lang="scss" scoped>

</style>
