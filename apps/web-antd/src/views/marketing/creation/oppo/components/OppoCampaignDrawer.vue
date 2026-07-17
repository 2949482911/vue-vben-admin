<script setup lang="ts" name="OppoCampaignDrawer">
import { nextTick } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';

const { formFields } = defineProps({
  formFields: {
    type: Array,
    default: () => [],
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const campaign = drawerApi.getData();
      formApi.setState({ schema: formFields });
      await nextTick();

      // Campaign 全部为平铺字段，无嵌套对象
      const flattenedData = { ...campaign };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const campaign = { ...currentValues };

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
  },
});
</script>

<template>
  <div>
    <Drawer title="计划配置">
      <Form></Form>
    </Drawer>
  </div>
</template>
