<script setup lang="ts" name="VivoPromotionDrawer">
import { useVbenDrawer } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";
import type { VivoPromotionData } from "#/views/marketing/creation/vivo/vivo";

const { formFields } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    labelClass: 'w-[200px]',
    // formItemClass: 'w-[600px]',
    componentProps: {
      class: "w-[300px]"
    }
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const promotion = drawerApi.getData();
      formApi.setState({
        schema: formFields
      });

      // 回显表单数据
      await formApi.setValues(promotion || {});
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const promotionData = {
      ...currentValues,
      _isConfirmed: true
    };

    drawerApi.setData(promotionData);
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

</script>

<template>
  <div>
    <Drawer title="编辑广告信息">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.switch-item {
  width: auto !important;
  flex: none !important;
  :deep(.ant-form-item-control-input) {
    width: auto !important;
    max-width: 60px !important;
  }
}
</style>
