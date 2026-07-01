<script setup lang="ts" name="TencentAdgroupDrawer">
import { useVbenDrawer } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";

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
    componentProps: {
      class: "w-[300px]"
    }
  }
});


const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const adgroup = drawerApi.getData();
      formApi.setState({
        schema: formFields
      });

      // 将对象属性平铺出来，用于表单回显
      const flattenedData = {
        ...adgroup,

        // program_creative_info 平铺
        material_derive_id: adgroup.program_creative_info?.material_derive_id || 0,
        bid_mode: adgroup.program_creative_info?.bid_mode || "",
        derive_version: adgroup.program_creative_info?.derive_version || "",
        original_material_id_list: adgroup.program_creative_info?.material_derive_info.original_material_id_list || [],
        original_adcreative_template_id_list: adgroup.program_creative_info?.material_derive_info?.original_adcreative_template_id_list || [],
        original_cover_image_id: adgroup.program_creative_info?.material_derive_info.original_cover_image_id || "",
        derive_data_list: adgroup.program_creative_info?.material_derive_info.derive_data_list || []
      };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    // 将平铺的属性还原到对象属性中
    const adgroup = {
      ...currentValues,

      // program_creative_info 还原
      program_creative_info: {
        material_derive_id: currentValues.material_derive_id || 0,
        bid_mode: currentValues.bid_mode || "",
        derive_version: currentValues.derive_version || "",
        material_derive_info: {
          original_material_id_list: currentValues.original_material_id_list || [],
          original_adcreative_template_id_list: currentValues.original_adcreative_template_id_list || [],
          original_cover_image_id: currentValues.original_cover_image_id || "",
          derive_data_list: currentValues.derive_data_list || []
        }
      }
    };

    drawerApi.setData(adgroup);
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
    <Drawer title="广告">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">

</style>
