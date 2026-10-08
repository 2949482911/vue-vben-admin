<script setup lang="ts">
import {useVbenDrawer} from '@vben/common-ui';
import {useVbenForm, type VbenFormSchema} from '#/adapter/form';
import type {HuaWeiStoreCampaignData} from "#/views/marketing/creation/huawei_store/huawei_store";

const {formFields} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});


const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  closeOnPressEscape: true,
  class: "w-[70%]",
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const campaign = drawerApi.getData() as HuaWeiStoreCampaignData;
      formApi.setState({
        schema: formFields as VbenFormSchema[],
      })
      const campaignInfo = campaign.campaignInfo || {};
      const newCampaign = Object.assign(campaign, campaignInfo);
      await formApi.setValues(newCampaign);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();
    const campaign = {
      ...currentValues,
      campaignInfo: {
        adNetwork: currentValues.adNetwork,
        buyMode: currentValues.buyMode,
        campaignName: currentValues.taskName,
        dailyBudget: currentValues.dailyBudget,
        marketingGoal: currentValues.marketingGoal,
        type: currentValues.type,
      }
    }
    drawerApi.setData(campaign);
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    drawerApi.close();
  }
});


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-[300px]',
    },
  },
});

</script>

<template>
  <div>
    <Drawer title="任务">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">

</style>
