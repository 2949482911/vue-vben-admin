<script setup lang="ts">
import {useVbenDrawer} from '@vben/common-ui';
import {useVbenForm, type VbenFormSchema} from '#/adapter/form';
import type {HuaWeiStoreAdgroupData} from "#/views/marketing/creation/huawei_store/huawei_store";

const {formFields} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[70%]",
  closeOnClickModal: false,
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const adgroup = drawerApi.getData() as HuaWeiStoreAdgroupData;
      formApi.setState({
        schema: formFields as VbenFormSchema[],
      })
      await formApi.setValues(adgroup);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();
    drawerApi.setData(currentValues);
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
    <Drawer title="子任务">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">

</style>
