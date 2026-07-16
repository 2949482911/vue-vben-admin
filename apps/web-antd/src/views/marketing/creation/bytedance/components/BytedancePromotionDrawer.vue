<script setup lang="ts" name="BytedancePromotionDrawer">
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';

const { formFields } = defineProps({
  formFields: { type: Array, default: () => [] },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {},
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const promotion = drawerApi.getData();
      formApi.setState({ schema: formFields });

      // native_setting 平铺
      const ns = promotion.native_setting || {};

      // brand_info 平铺
      const bi = promotion.brand_info || {};

      const flattenedData = {
        ...promotion,

        // native_setting 平铺
        native_setting_aweme_setting_type: ns.aweme_setting_type || '',
        native_setting_aweme_id: ns.aweme_id || '',
        native_setting_aweme_ids: ns.aweme_ids || [],
        native_setting_anchor_related_type: ns.anchor_related_type || 'OFF',

        // brand_info 平铺
        brand_info_yuntu_category_id: bi.yuntu_category_id || 0,
        brand_info_cdp_brand_id: bi.cdp_brand_id || 0,
        brand_info_ecom_brand_id: bi.ecom_brand_id || 0,
        brand_info_brand_name_id: bi.brand_name_id || 0,
        brand_info_cdp_brand_name: bi.cdp_brand_name || '',
        brand_info_sub_brand_names: bi.sub_brand_names || [],
        brand_info_sub_brand_name_ids: bi.sub_brand_name_ids || [],
      };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const promotion = {
      ...currentValues,

      // native_setting 还原
      native_setting: {
        aweme_setting_type: currentValues.native_setting_aweme_setting_type || '',
        aweme_id: currentValues.native_setting_aweme_id || '',
        aweme_ids: currentValues.native_setting_aweme_ids || [],
        anchor_related_type: currentValues.native_setting_anchor_related_type || 'OFF',
      },

      // brand_info 还原
      brand_info: {
        yuntu_category_id: currentValues.brand_info_yuntu_category_id || 0,
        cdp_brand_id: currentValues.brand_info_cdp_brand_id || 0,
        ecom_brand_id: currentValues.brand_info_ecom_brand_id || 0,
        brand_name_id: currentValues.brand_info_brand_name_id || 0,
        cdp_brand_name: currentValues.brand_info_cdp_brand_name || '',
        sub_brand_names: currentValues.brand_info_sub_brand_names || [],
        sub_brand_name_ids: currentValues.brand_info_sub_brand_name_ids || [],
      },
    };

    drawerApi.setData(promotion);
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
    <Drawer title="广告配置">
      <Form></Form>
    </Drawer>
  </div>
</template>
