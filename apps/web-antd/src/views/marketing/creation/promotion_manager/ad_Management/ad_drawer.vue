<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { aManagementApi } from '#/api';
import { useVbenForm } from '#/adapter/form';
import { getAdFormSchema } from './public_adFormItem';

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData();

      const targetSchema = getAdFormSchema(data.platform);
      formApi.setState({
        schema: targetSchema,
      });

      const res = await aManagementApi.fetchAdManagementDetail({
        targetId: data.promotionId,
        platform: data.platform,
        level: 'promotion',
      });
      formApi.setValues(res);
      console.log(res, 'res');
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
    labelClass: 'w-[150px] flex-shrink-0 justify-end pr-2',
  },
  layout: 'horizontal',
  schema: [],
});
</script>
<template>
  <Drawer title="广告组详情">
    <Form />
  </Drawer>
</template>
