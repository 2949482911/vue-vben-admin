<script setup lang="ts" name="TencentCampaignDrawer">
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
      const campaign = drawerApi.getData();
      formApi.setState({
        schema: formFields
      });

      // 将对象属性平铺出来，用于表单回显
      const flattenedData = {
        ...campaign,

        // scene_spec 平铺
        scene_spec_mobile_union: campaign.scene_spec?.mobile_union || [],
        scene_spec_exclude_mobile_union: campaign.scene_spec?.exclude_mobile_union || [],
        scene_spec_union_position_package: campaign.scene_spec?.union_position_package || [],
        scene_spec_exclude_union_position_package: campaign.scene_spec?.exclude_union_position_package || [],
        scene_spec_tencent_news: campaign.scene_spec?.tencent_news || [],
        scene_spec_display_scene: campaign.scene_spec?.display_scene || [],
        official_account_media_category: campaign.scene_spec?.wechat_scene.official_account_media_category || [],
        mini_program_and_mini_game: campaign.scene_spec?.wechat_scene.mini_program_and_mini_game || [],
        pay_scene: campaign.scene_spec?.wechat_scene.pay_scene || [],
        wechat_position: campaign.scene_spec?.wechat_position || [],
        mobile_union_category: campaign.scene_spec?.mobile_union_category || [],
        qbsearch_scene: campaign.scene_spec?.qbsearch_scene || [],
        wechat_channels_scene: campaign.scene_spec?.wechat_channels_scene || [],
        pc_scene: campaign.scene_spec?.pc_scene || [],
        wechat_search_scene: campaign.scene_spec?.wechat_search_scene || [],


        // marketing_carrier_detail 平铺
        marketing_carrier_id: campaign.marketing_carrier_detail?.marketing_carrier_id || "",
        marketing_carrier_name: campaign.marketing_carrier_detail?.marketing_carrier_name || "",
        marketing_sub_carrier_id: campaign.marketing_carrier_detail?.marketing_sub_carrier_id || "",

        // deep_conversion_spec 平铺
        deep_conversion_type: campaign.deep_conversion_spec?.deep_conversion_type || "",
        deep_conversion_behavior_spec_goal: campaign.deep_conversion_spec?.deep_conversion_behavior_spec?.goal || "",
        deep_conversion_behavior_spec_bid_amount: campaign.deep_conversion_spec?.deep_conversion_behavior_spec?.bid_amount || 0,
        deep_conversion_worth_spec_goal: campaign.deep_conversion_spec?.deep_conversion_worth_spec?.goal || "",
        deep_conversion_worth_spec_expected_roi: campaign.deep_conversion_spec?.deep_conversion_worth_spec?.expected_roi || 0,
        deep_conversion_worth_advanced_spec_goal: campaign.deep_conversion_spec?.deep_conversion_worth_advanced_spec?.goal || "",
        deep_conversion_worth_advanced_spec_expected_roi: campaign.deep_conversion_spec?.deep_conversion_worth_advanced_spec?.expected_roi || 0,
        deep_conversion_behavior_advanced_spec_goal: campaign.deep_conversion_spec?.deep_conversion_behavior_advanced_spec?.goal || "",
        deep_conversion_behavior_advanced_spec_bid_amount: campaign.deep_conversion_spec?.deep_conversion_behavior_advanced_spec?.bid_amount || 0,

        // auto_derived_creative_preference 平铺
        auto_derived_creative_method_type_list: campaign.auto_derived_creative_preference?.auto_derived_creative_method_type_list || [],

        // cloud_union_spec 平铺
        cloud_union_spec_roi_goal: campaign.cloud_union_spec?.roi_goal || "",
        cloud_union_spec_expected_roi: campaign.cloud_union_spec?.expected_roi || 0,

        // dca_spec 平铺
        set_id: campaign.dca_spec?.set_id || "",
        recommend_method_ids: campaign.dca_spec?.recommend_method_ids || [],

        // marketing_asset_outer_spec 平铺
        marketing_asset_outer_id: campaign.marketing_asset_outer_spec?.marketing_asset_outer_id || "",
        marketing_asset_outer_name: campaign.marketing_asset_outer_spec?.marketing_asset_outer_name || "",
        marketing_asset_outer_sub_id: campaign.marketing_asset_outer_spec?.marketing_asset_outer_sub_id || "",
        marketing_target_type: campaign.marketing_asset_outer_spec?.marketing_target_type || "",

        // additional_product_spec 平铺
        product_catalog_id: campaign.additional_product_spec?.product_catalog_id || "",
        product_outer_id: campaign.additional_product_spec?.product_outer_id || "",

        // mpa_spec 平铺
        mpa_product_catalog_id: campaign.mpa_spec?.product_catalog_id || "",
        mpa_product_series_id: campaign.mpa_spec?.product_series_id || "",
        mpa_recommend_method_ids: campaign.mpa_spec?.recommend_method_ids || [],

        // aoi_optimization_strategy 平铺
        aoi_optimization_strategy_enabled: campaign.aoi_optimization_strategy?.aoi_optimization_strategy_enabled || false,
        aoi_id_list: campaign.aoi_optimization_strategy?.aoi_id_list || []
      };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    // 将平铺的属性还原到对象属性中
    const campaign = {
      ...currentValues,

      //  场景定向 还原
      scene_spec: {
        mobile_union: currentValues.scene_spec_mobile_union || [],
        exclude_mobile_union: currentValues.scene_spec_exclude_mobile_union || [],
        union_position_package: currentValues.scene_spec_union_position_package || [],
        exclude_union_position_package: currentValues.scene_spec_exclude_union_position_package || [],
        tencent_news: currentValues.scene_spec_tencent_news || [],
        display_scene: currentValues.scene_spec_display_scene || [],
        wechat_scene: {
          official_account_media_category: currentValues?.official_account_media_category || [],
          mini_program_and_mini_game: currentValues?.mini_program_and_mini_game || [],
          pay_scene: currentValues?.pay_scene || []
        },
        wechat_position: currentValues?.wechat_position || [],
        mobile_union_category: currentValues?.mobile_union_category || [],
        qbsearch_scene: currentValues?.qbsearch_scene || [],
        wechat_channels_scene: currentValues?.wechat_channels_scene || [],
        pc_scene: currentValues?.pc_scene || [],
        wechat_search_scene: currentValues?.wechat_search_scene || []
      },

      // marketing_carrier_detail 还原
      marketing_carrier_detail: {
        marketing_carrier_id: currentValues.marketing_carrier_id || "",
        marketing_carrier_name: currentValues.marketing_carrier_name || "",
        marketing_sub_carrier_id: currentValues.marketing_sub_carrier_id || ""
      },

      // deep_conversion_spec 还原
      deep_conversion_spec: {
        deep_conversion_type: currentValues.deep_conversion_type || "",
        deep_conversion_behavior_spec: {
          goal: currentValues.deep_conversion_behavior_spec_goal || "",
          bid_amount: currentValues.deep_conversion_behavior_spec_bid_amount || 0
        },
        deep_conversion_worth_spec: {
          goal: currentValues.deep_conversion_worth_spec_goal || "",
          expected_roi: currentValues.deep_conversion_worth_spec_expected_roi || 0
        },
        deep_conversion_worth_advanced_spec: {
          goal: currentValues.deep_conversion_worth_advanced_spec_goal || "",
          expected_roi: currentValues.deep_conversion_worth_advanced_spec_expected_roi || 0
        },
        deep_conversion_behavior_advanced_spec: {
          goal: currentValues.deep_conversion_behavior_advanced_spec_goal || "",
          bid_amount: currentValues.deep_conversion_behavior_advanced_spec_bid_amount || 0
        }
      },

      // auto_derived_creative_preference 还原
      auto_derived_creative_preference: {
        auto_derived_creative_method_type_list: currentValues.auto_derived_creative_method_type_list || []
      },

      // cloud_union_spec 还原
      cloud_union_spec: {
        roi_goal: currentValues.cloud_union_spec_roi_goal || [],
        expected_roi: currentValues.cloud_union_spec_expected_roi || 0
      },

      // dca_spec 还原
      dca_spec: {
        set_id: currentValues.set_id || "",
        recommend_method_ids: currentValues.recommend_method_ids || []
      },

      // marketing_asset_outer_spec 还原
      marketing_asset_outer_spec: {
        marketing_asset_outer_id: currentValues.marketing_asset_outer_id || "",
        marketing_asset_outer_name: currentValues.marketing_asset_outer_name || "",
        marketing_asset_outer_sub_id: currentValues.marketing_asset_outer_sub_id || "",
        marketing_target_type: currentValues.marketing_target_type || []
      },

      // additional_product_spec 还原
      additional_product_spec: {
        product_catalog_id: currentValues.additional_product_spec_product_catalog_id || "",
        product_outer_id: currentValues.additional_product_spec_product_outer_id || ""
      },

      // mpa_spec 还原
      mpa_spec: {
        product_catalog_id: currentValues.mpa_product_catalog_id || "",
        product_series_id: currentValues.mpa_product_series_id || "",
        recommend_method_ids: currentValues.mpa_recommend_method_ids || []
      },

      // aoi_optimization_strategy 还原
      aoi_optimization_strategy: {
        aoi_optimization_strategy_enabled: currentValues.aoi_optimization_strategy_enabled || false,
        aoi_id_list: currentValues.aoi_id_list || []
      }
    };

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
  }
});

</script>

<template>
  <div>
    <Drawer title="营销单元">
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
