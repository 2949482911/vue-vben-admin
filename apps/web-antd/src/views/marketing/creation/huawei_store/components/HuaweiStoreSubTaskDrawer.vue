<script setup lang="ts">
import {useVbenDrawer} from '@vben/common-ui';
import {useVbenForm} from '#/adapter/form';

const {formFields} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const adgroup = drawerApi.getData();
      formApi.setState({
        schema: formFields,
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
