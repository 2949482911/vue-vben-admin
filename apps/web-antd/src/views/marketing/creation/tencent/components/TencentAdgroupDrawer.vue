<script setup lang="ts" name="TencentAdgroupDrawer">
import { useVbenDrawer } from "@vben/common-ui";

import { useVbenForm } from "#/adapter/form";

const { formFields } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});


/**
 * 去掉各模板 schema 上写死的字段宽度（w-[300px]、w-[400px] 等）。
 * 框架会把 commonConfig.formItemClass 和 schema 的 formItemClass 拼在同一个 class 上，
 * 两个宽度类同时存在时谁生效取决于样式表顺序、结果不可控，
 * 所以统一去掉，宽度只由下面 commonConfig 的 formItemClass 决定。
 */
function stripSchemaWidths(fields: any[]): any[] {
  return fields.map(({ formItemClass = "", ...rest }) => {
    return {
      ...rest,
      formItemClass: String(formItemClass)
        .split(" ")
        .filter((cls) => cls && !cls.startsWith("w-["))
        .join(" ")
    };
  });
}


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  // 竖版布局：一行一个字段
  wrapperClass: "grid-cols-1",
  commonConfig: {
    // 字段宽度：铺满抽屉并限制最大宽度，保证 Select 下拉能完整显示选项
    formItemClass: "w-full max-w-[800px]"
  }
});


const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: "w-[75%]",
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const adgroup = drawerApi.getData();
      formApi.setState({
        schema: stripSchemaWidths(formFields)
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
  <Drawer title="广告">
    <Form />
  </Drawer>
</template>

<style scoped lang="scss">

</style>
