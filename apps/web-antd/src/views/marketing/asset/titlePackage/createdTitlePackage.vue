<script lang="ts" setup>
import { projectApi, titlePackApi } from '#/api';
import { ACTIVE_PLATFORM } from '#/constants/locales';
import { useVbenForm, useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';

const emit = defineEmits(['pageReload']);

const [titlePackageModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    const formValue = await formApi.getValues()
    const formattedData = {
      title: formValue.title,
      platform: formValue.platform,
      projectId: formValue.projectId,
      config: {
        pushSubTitle: formValue.pushSubTitle?.split('\n').filter((item: string) => item.trim() !== '') || [],
        subTitle: formValue.subTitle?.split('\n').filter((item: string) => item.trim() !== '') || []
      }
    };
    try{
      await titlePackApi.fetchNewTitlePack(formattedData)
      await formApi.resetForm();
      await modalApi.close();
      emit('pageReload');
      message.success("添加成功！")
    }catch(err){
      console.log(err)
    }
  },
});

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
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        api: async (params:any) => {
          return await projectApi.fetchProjectList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: 'items',
      },
      fieldName: 'projectId',
      label: '产品',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'title',
      label: '标题名称',
      rules: 'required',
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options:ACTIVE_PLATFORM,
        placeholder: '请选择',
      },
      fieldName: 'platform',
      label: '平台',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'subTitle',
      label: '副标题',
      dependencies: {
        show: (val) => {
          return val.platform === 'vivo';
        },
        triggerFields: ['platform'],
      },
    },
    {
      component: 'Textarea',
      fieldName: 'pushSubTitle',
      label: '应用副标题',
      dependencies: {
        show: (val) => {
          return val.platform === 'vivo';
        },
        triggerFields: ['platform'],
      },
    },
  ],
});

</script>
<template>
  <titlePackageModal title="添加标题包">
    <Form/>
  </titlePackageModal>
</template>

<style lang="scss" scoped>

</style>
