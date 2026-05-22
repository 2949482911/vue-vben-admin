<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { aManagementApi } from '#/api';
import { useVbenForm } from '#/adapter/form';
import { getPlanFormSchema } from './public_planFormItem';

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData();

      const targetSchema = getPlanFormSchema(data.platform);
      formApi.setState({
        schema: targetSchema,
      });

      const res = await aManagementApi.fetchAdManagementDetail({
        targetId: data.campaignId,
        platform: data.platform,
        level: 'campaign',
      });
      formApi.setValues(res);
    }
  },
  async onCancel() {
    drawerApi.close();
    formApi.resetValidate();
  },
  async onConfirm() {
    drawerApi.close();
    formApi.resetValidate();
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[140px] flex-shrink-0 justify-end pr-3',
  },
  layout: 'horizontal',
  schema: [],
});
</script>
<template>
  <Drawer title="计划详情">
    <Form />
  </Drawer>
</template>
