<script setup lang="ts" name="CreateAdvertiserModal">
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref } from 'vue';
import { useVbenForm } from "#/adapter/form";
import type { StrategyGropType, UpdateStrategyGropType } from "#/api/models";
import { strategyGropApi, projectApi } from '#/api/core';
import { PLATFORM } from "#/constants/locales";
import { trimObject } from '#/utils/trim';
import { useOssClient } from '#/views/marketing/asset/material/useOssClient';
import { uploadToOss } from '#/utils/uploadToOss';
import { useUserStore } from '@vben/stores';
import { message } from 'ant-design-vue';

const emit = defineEmits(['pageReload']);
const configUrl = ref<string>('')

const objectRequest = ref<StrategyGropType>(<StrategyGropType>{
  config: "", 
  projectId: "", 
  name: "",
  platform: "",
  id: "",
});

const isUpdate = ref<Boolean>(false);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const params = trimObject(formVal);
    try{
      await (isUpdate.value ? strategyGropApi.fetchUpdateStrategyGrop(<UpdateStrategyGropType>{
          id: params.id,
          name: params.name,
          projectId: params.projectId,
          platform: params.platform,
          config: params.config
        })
        :
        strategyGropApi.fetchNewStrategyGrop(<StrategyGropType>{
          name: params.name,
          projectId: params.projectId,
          platform: params.platform,
          config: params.config
        })
      )
      message.success('保存策略组成功')
    }catch(err){
      console.log(err);
      message.error('保存策略组失败')
    }
  },
  schema: [
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
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'name',
      label: '名称',
      rules: 'required',
      
    },
    {
      component: 'Select',
      defaultValue: 'vivo',
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        options: PLATFORM,
        disabled: true
      },
      rules: 'required',
      // 字段名
      fieldName: 'platform',
      label: '平台',
    },
    {
      component: "ApiSelect",
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          size: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: "items",
        api: async (params: any) => {
          return await projectApi.fetchProjectList(params);
        }
      },
      fieldName: 'projectId',
      label: `${$t('marketing.advertiser.columns.projectId')}`,
      rules: 'required',
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await formApi.resetForm();
    objectRequest.value = {
      config: "", 
      projectId: "", 
      name: "",
      id: "",
      platform: "",
    } as StrategyGropType;
    isUpdate.value = false;
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    await modalApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData();
      configUrl.value = await uploadJson(objectRequest.value, 'strategyGroup')
      formApi.setFieldValue('config',configUrl.value)
      handleSetFormValue(objectRequest.value);
      if (objectRequest.value.id) {
        isUpdate.value = true;
      }
    } else {
      isUpdate.value = false;
    }
  },
});
const uploadJson = async (data: any, subName: string) => {
    const client = await useOssClient();
    const timestamp = Date.now();
    const userStore = useUserStore();
    const mainId = userStore.userInfo?.mainId;
    // 深拷贝一份数据，避免修改原始响应对象
    const cloneData = JSON.parse(JSON.stringify(data, (key, value) => {
      // 关键逻辑：如果遇到 Map 类型，将其转换为普通对象
      if (value instanceof Map) {
        return Object.fromEntries(value.entries());
      }
      return value;
    }));
    const jsonString = JSON.stringify(cloneData, null, 2);
    const fileName = `${timestamp}_${subName}.json`;
    const objectKey = `${mainId}/json/batchInvestment/${fileName}`;
    const file = new File([jsonString], fileName, { type: 'application/json' });
    const result = await uploadToOss(client, file, objectKey);
    return result.url; // 返回 OSS 路径
};
function handleSetFormValue(row: UpdateStrategyGropType) {
  formApi.setValues(row)
}
</script>

<template>
  <div>
    <Page>
      <Modal title="保存策略组">
        <Form/>
      </Modal>
    </Page>
  </div>
</template>

<style scoped>

</style>
