<script setup lang="ts">
import { trimObject } from '#/utils/trim';
import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer, Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref, watch } from 'vue'; // 添加 watch
import { message } from 'ant-design-vue';
import type {
  searchDataFilter,
  CampaignUpdateItem,
  UpdateSubscribeType,
  CampaignItem
} from '#/api/models';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { campaignApi } from '#/api/core/adx.ts';

const title = ref<string>('');
const emit = defineEmits(['pageReload']);
const objectRequest = ref<CampaignUpdateItem>({});
const isUpdate = ref<Boolean>(false);
  watch(isUpdate,(newVal) => {
  if(newVal) {
    title.value = "修改计划"
  } else {
    title.value = "新增计划"
  }
},{ deep: true, immediate: true });
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    // const params = trimObject(formVal);
    const params = formVal;
    if(isUpdate.value) {
      // 调用修改接口
      await campaignApi.fetchUpdateCampaign(params as CampaignUpdateItem);
      message.success('修改成功');
    } else {
      // 调用新增接口
      await campaignApi.fetchCreateCampaign(params as CampaignItem);
      message.success('新增成功');
     }
     emit('pageReload');
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'name',
      label: `${$t('adx.campaign.columns.name')}`
    },
    {
      component: 'DatePicker',
      fieldName: 'startTime',
      label: '开始时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        showTime: true,
      },
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'endTime',
      label: '结束时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        showTime: true,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'daypartingConfig',
      label: `${$t('adx.campaign.columns.daypartingConfig')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'dailyBudget',
      label: `${$t('adx.campaign.columns.dailyBudget')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'totalBudget',
      label: `${$t('adx.campaign.columns.totalBudget')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'qpsLimit',
      label: `${$t('adx.campaign.columns.qpsLimit')}`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: `匀速`,
            value: 'uniform'
          },
          {
            label: `加速`,
            value: 'accelerate '
          }
        ]
      },
      rules: 'required',
      fieldName: 'pacingType',
      label: `${$t('adx.campaign.columns.pacingType')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'pacingRate',
      label: `${$t('adx.campaign.columns.pacingRate')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'priority',
      label: `${$t('adx.campaign.columns.priority')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'tmaxMs',
      label: `${$t('adx.campaign.columns.tmaxMs')}`
    },
  ],
});
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: false,
  // 当抽屉打开状态改变时触发
  async onOpenChange(isOpen) {
    if (!isOpen) {
      await drawerApi.close();
    } else {
      objectRequest.value = await drawerApi.getData<CampaignUpdateItem>();
      formApi.setValues(objectRequest.value);
      isUpdate.value = !!objectRequest.value.id;
    }
  },
  async onConfirm() {
    const result = await formApi.validate();
    if(!result.valid) return;
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    await drawerApi.close();
  },
});
</script>
<template> 
  <div>
    <Page auto-content-height>
      <Drawer class="w-[40%]" :title="title">
        <Form>
        </Form>
      </Drawer>
    </Page>
  </div>
</template>

<style lang="scss" scoped>
</style>
