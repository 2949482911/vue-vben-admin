<script setup lang="ts" name="TencentAdgroupDrawer">
import type { TencentAdgroupData } from "#/views/marketing/creation/tencent/tencent";

import { useVbenDrawer } from "@vben/common-ui";

import { useVbenForm } from "#/adapter/form";

const { formFields } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});


/**
 * 表单元素加工：
 * 1. Select 统一支持一键清空（实例 form 里也是这么给的）。
 * 2. Switch 例外：ant-design 的 switch 是 inline-block，commonConfig 里的 w-full 会把开关拉满整行。
 * 3. componentProps 是函数时（自定义组件用它懒取账户列表等）不能展开，展开会把函数本身丢掉，
 *    这里原样保留成函数。
 * 字段宽度不在这里统一设置，各模板按需在自己的 formItemClass 上单独写（w-[300px]、w-[600px]…）。
 */
function normalizeFields(fields: any[]): any[] {
  return fields.map(({ component, componentProps, ...rest }) => {
    const extra = {
      ...(component === "Select" ? { allowClear: true } : {}),
      ...(component === "Switch" ? { class: "w-auto" } : {})
    };

    if (typeof componentProps === "function") {
      return {
        ...rest,
        component,
        componentProps: (ctx: any) => ({ ...extra, ...componentProps(ctx) })
      };
    }

    return {
      ...rest,
      component,
      componentProps: { ...extra, ...(componentProps ?? {}) }
    };
  });
}


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  // 竖版布局：一行一个字段
  wrapperClass: "grid-cols-1",
  commonConfig: {
    // 控件铺满所属表单项，否则 antd 的 Select 只有内容宽度、下拉选项显示不全；
    // 字段宽度由各模板的 formItemClass 逐个决定，不在这里统一限制
    componentProps: { class: "w-full" }
  }
});


const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: "w-[75%]",
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      // getData() 返回 unknown，这里按抽屉的数据契约断言成广告
      const adgroup = drawerApi.getData() as TencentAdgroupData;
      formApi.setState({
        schema: normalizeFields(formFields)
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
