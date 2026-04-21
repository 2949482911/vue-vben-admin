<script lang="ts" setup>
import type {LabelItem, NewLabelItemType, EditLabelItemType} from '#/api/models/marketing'
import { projectApi,  accountLabelApi } from '#/api';
import { ACTIVE_PLATFORM } from '#/constants/locales';
import { useVbenForm, useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import {ref} from 'vue';
import {$t} from '@vben/locales';
import { trimObject } from '#/utils/trim';

const emit = defineEmits(['pageReload']);
const objectRequest = ref<LabelItem>({});
const isUpdate = ref<Boolean>(false);
const title = ref<String>('');
const [LabelModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
    objectRequest.value = {};
    isUpdate.value = false;
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    const formValue = await formApi.getValues()
    const formattedData = trimObject(formValue);
    try{
      await (isUpdate.value
        ? accountLabelApi.fetchModifyAccountLabel(formattedData as EditLabelItemType)
        : accountLabelApi.fetchNewAccountLabel(formattedData as NewLabelItemType)
      );
      isUpdate.value ? message.success("修改成功！") : message.success("添加成功！")
      isUpdate.value = false;
      await formApi.resetForm();
      await modalApi.close();
      emit('pageReload');
    }catch(err){
      console.log(err)
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<LabelItem>();
      if (objectRequest.value.id) {
        title.value = "修改标签"
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
        title.value = "新增标签"
      }
    }
  },
});
function handleSetFormValue(row: LabelItem) {
  formApi.setValues(row);
}
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '标签名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'remark',
      label: '备注',
      rules: 'required',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'id',
      // 界面显示的label
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
  ],
});

</script>
<template>
  <LabelModal :title="title">
    <Form/>
  </LabelModal>
</template>

<style lang="scss" scoped>

</style>
