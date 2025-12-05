<script setup lang="ts" name="CreateAdvertiserModal">
import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import type {AdvertiserItem} from "#/api/models";
import {advertiserApi, projectApi} from "#/api";
import {STATUS_SELECT} from "#/constants/locales";

const emit = defineEmits(['pageReload']);


const objectRequest = ref<AdvertiserItem>({
  config: new Map<string, any>(), projectId: "", putStatus: 0,
  advertiserId: "",
  advertiserName: "",
  advertiserRole: "",
  balance: 0,
  companyName: "",
  createTime: "",
  createUsername: "",
  dailyBudget: 0,
  id: "",
  platform: "",
  platformAuditState: "",
  platformRemark: "",
  platformStatus: "",
  putStatue: 0,
  remark: "",
  roleType: "",
  status: 0,
  updateTime: "",
  updateUsername: ""
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
  handleSubmit: async (formVal: AdvertiserItem) => {
    await (isUpdate.value ? advertiserApi.fetchUpdateAdvertiser({
        id: formVal.id,
        putStatue: formVal.putStatue,
        remark: formVal.remark,
        projectId: formVal.projectId,
        config: formVal.config,
      })
      : undefined)
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
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.choice')}`,
        options: STATUS_SELECT,
      },
      // 字段名
      fieldName: 'putStatue',
      label: `${$t('marketing.advertiser.columns.putStatue')}`
    },

    {
      component: "Textarea",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'remark',
      label: `${$t('marketing.advertiser.columns.remark')}`
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
    }
  ],
});


const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await formApi.resetForm();
    objectRequest.value = {
      config: new Map<string, any>(),
      projectId: "",
      putStatus: 0,
      advertiserId: "",
      advertiserName: "",
      advertiserRole: "",
      balance: 0,
      companyName: "",
      createTime: "",
      createUsername: "",
      dailyBudget: 0,
      id: "",
      platform: "",
      platformAuditState: "",
      platformRemark: "",
      platformStatus: "",
      putStatue: 0,
      remark: "",
      roleType: "",
      status: 0,
      updateTime: "",
      updateUsername: ""
    };
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
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<AdvertiserItem>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      }
    } else {
      isUpdate.value = false;
    }
  },
});

function handleSetFormValue(row: AdvertiserItem) {
  formApi.setValues(row)
}

</script>

<template>
  <div>
    <Page>
      <Modal>
        <Form/>
      </Modal>
    </Page>
  </div>
</template>

<style scoped>

</style>
