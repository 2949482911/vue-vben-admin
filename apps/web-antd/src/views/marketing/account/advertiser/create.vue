<script setup lang="ts" name="CreateAdvertiserModal">
import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import type {AdvertiserItem, DeveloperItem} from "#/api/models";
import {advertiserApi, projectApi, developerApi} from "#/api";
import {STATUS_SELECT, ADVERTISET_ADDED} from "#/constants/locales";

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

interface DeveloperOption {
  label: string;
  value: string;
}
const developerOption = ref<DeveloperOption[]>([])

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
    await (isUpdate.value ? advertiserApi.fetchUpdateAdvertiser({
        id: formVal.id,
        putStatue: formVal.putStatue,
        remark: formVal.remark,
        projectId: formVal.projectId,
        platform: formVal.platform,
        advertiserId: formVal.advertiserId,
        advertiserName: formVal.advertiserName,
        developerId: formVal.developerId,
        config: {},
        advertiserRole: formVal.advertiserRole,
        putStatus: formVal.putStatue,
      })
      : 
      advertiserApi.fetchCreateAdvertiser({
        platform: formVal.platform,
        advertiserId: formVal.advertiserId,
        advertiserName: formVal.advertiserName,
        developerId: formVal.developerId,
        config: {},
        advertiserRole: formVal.advertiserRole,
        putStatus: formVal.putStatue,
        projectId: formVal.projectId,
        remark: formVal.remark,
      })
    )
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
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        options: ADVERTISET_ADDED,
      },
      rules: 'required',
      // 字段名
      fieldName: 'platform',
      label: '平台',
      dependencies: {
        show: (value) => !value.id,
        triggerFields: ['id'],
      },
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.choice')}`,
        options: developerOption,
      },
      rules: 'required',
      // 字段名
      fieldName: 'developerId',
      label: '开发者',
      dependencies: {
        show: value => {
          return !value.id && value.platform === 'huawei_store'
        },
        triggerFields: ['platform','id']
      }
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'advertiserId',
      label: '账户ID',
      dependencies: {
        show: (value) => !value.id,
        triggerFields: ['id'],
      },
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'advertiserName',
      label: '账户名称',
      dependencies: {
        show: (value) => !value.id,
        triggerFields: ['id'],
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: `${$t('marketing.advertiser.advertiserRole.proxy')}`,
            value: 'proxy',
          },
          {
            label: `${$t('marketing.advertiser.advertiserRole.advertiser')}`,
            value: 'advertiser',
          },
          {
            label: `${$t('marketing.advertiser.advertiserRole.personal')}`,
            value: 'personal',
          },
        ],
        placeholder: `${$t('common.choice')}`,
      },
      rules: 'required',
      // 字段名
      fieldName: 'advertiserRole',
      label: '角色',
      dependencies: {
        show: (value) => !value.id,
        triggerFields: ['id'],
      },
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.choice')}`,
        options: STATUS_SELECT,
      },
      defaultValue:9,
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
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<AdvertiserItem>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      }
      const res = await developerApi.fetchDeveloperList({platform:'huawei_store', page:1, pageSize:200 })
      developerOption.value = res.items.map((item:DeveloperItem) => ({
        label: item.name,
        value: item.id,
      }));
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
