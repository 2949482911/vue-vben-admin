<script setup lang="ts" name="BytedanceCampaignDrawer">
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

      const flattenedData = {
        ...campaign,

        // related_product 平铺
        related_product_setting: campaign.related_product?.product_setting || 'NO_MAP',
        related_product_platform_id: campaign.related_product?.product_platform_id || '',
        related_product_id: campaign.related_product?.product_id || '',
        related_product_unique_id: campaign.related_product?.unique_product_id || '',

        // native_setting 平铺
        native_setting_aweme_id: campaign.native_setting?.aweme_id || '',

        // optimize_goal 平铺
        optimize_goal_asset_ids: campaign.optimize_goal?.asset_ids || [],
        optimize_goal_external_action: campaign.optimize_goal?.external_action || '',
        optimize_goal_game_addiction_id: campaign.optimize_goal?.game_addiction_id || '',
        optimize_goal_paid_switch: campaign.optimize_goal?.paid_switch ?? 2,
        optimize_goal_deep_external_action: campaign.optimize_goal?.deep_external_action || '',

        // delivery_range 平铺
        delivery_range_inventory_catalog: campaign.delivery_range?.inventory_catalog || 'MANUAL',
        delivery_range_inventory_type: campaign.delivery_range?.inventory_type || [],
        delivery_range_union_video_type: campaign.delivery_range?.union_video_type || 'ORIGINAL_VIDEO',

        // delivery_setting 平铺
        delivery_setting_schedule_type: campaign.delivery_setting?.schedule_type || 'SCHEDULE_FROM_NOW',
        delivery_setting_start_time: campaign.delivery_setting?.start_time || '',
        delivery_setting_end_time: campaign.delivery_setting?.end_time || '',
        delivery_setting_schedule_time: campaign.delivery_setting?.schedule_time || '',
        delivery_setting_live_duration: campaign.delivery_setting?.live_duration || 0,
        delivery_setting_filter_night_switch: campaign.delivery_setting?.filter_night_switch || 'OFF',
        delivery_setting_deep_bid_type: campaign.delivery_setting?.deep_bid_type || 'DEEP_BID_DEFAULT',
        delivery_setting_bid_type: campaign.delivery_setting?.bid_type || 'CUSTOM',
        delivery_setting_project_custom: campaign.delivery_setting?.project_custom || 'OFF',
        delivery_setting_bid: campaign.delivery_setting?.bid || 0,
        delivery_setting_budget_mode: campaign.delivery_setting?.budget_mode || 'BUDGET_MODE_INFINITE',
        delivery_setting_budget: campaign.delivery_setting?.budget || 300,
        delivery_setting_pricing: campaign.delivery_setting?.pricing || 'PRICING_OCPM',
        delivery_setting_cpa_bid: campaign.delivery_setting?.cpa_bid || 0,
        delivery_setting_deep_cpabid: campaign.delivery_setting?.deep_cpabid || 0,
        delivery_setting_roi_goal: campaign.delivery_setting?.roi_goal || 0,
        delivery_setting_layer_roi_switch: campaign.delivery_setting?.layer_roi_switch || 'OFF',
        delivery_setting_first_roi_goal: campaign.delivery_setting?.first_roi_goal || 0,
        delivery_setting_seven_roi_goal: campaign.delivery_setting?.seven_roi_goal || 0,
        delivery_setting_budget_optimize_switch: campaign.delivery_setting?.budget_optimize_switch || 'OFF',
        delivery_setting_search_continue_delivery: campaign.delivery_setting?.search_continue_delivery || 'OFF',

        // track_url_setting 平铺
        // track_url_type: campaign.track_url_setting?.track_url_type || '',
        // track_url_group_id: campaign.track_url_setting?.track_url_group_id || 0,
        // track_url: campaign.track_url_setting?.track_url || [],
        // action_track_url: campaign.track_url_setting?.action_track_url || [],
        // active_track_url: campaign.track_url_setting?.active_track_url || [],
        // video_play_effective_track_url: campaign.track_url_setting?.video_play_effective_track_url || [],
        // video_play_done_track_url: campaign.track_url_setting?.video_play_done_track_url || [],
        // video_play_first_track_url: campaign.track_url_setting?.video_play_first_track_url || [],
        send_type: campaign.track_url_setting?.send_type || 'SERVER_SEND',
      };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const campaign = {
      ...currentValues,

      // related_product 还原
      related_product: {
        product_setting: currentValues.related_product_setting || 'NO_MAP',
        product_platform_id: currentValues.related_product_platform_id || '',
        product_id: currentValues.related_product_id || '',
        unique_product_id: currentValues.related_product_unique_id || '',
      },

      // native_setting 还原
      native_setting: {
        aweme_id: currentValues.native_setting_aweme_id || '',
      },

      // optimize_goal 还原
      optimize_goal: {
        asset_ids: currentValues.optimize_goal_asset_ids || [],
        external_action: currentValues.optimize_goal_external_action || '',
        game_addiction_id: currentValues.optimize_goal_game_addiction_id || '',
        paid_switch: currentValues.optimize_goal_paid_switch ?? 2,
        deep_external_action: currentValues.optimize_goal_deep_external_action || '',
      },

      // delivery_range 还原
      delivery_range: {
        inventory_catalog: currentValues.delivery_range_inventory_catalog || 'MANUAL',
        inventory_type: currentValues.delivery_range_inventory_type || [],
        union_video_type: currentValues.delivery_range_union_video_type || 'ORIGINAL_VIDEO',
      },

      // delivery_setting 还原
      delivery_setting: {
        schedule_type: currentValues.delivery_setting_schedule_type || 'SCHEDULE_FROM_NOW',
        start_time: currentValues.delivery_setting_start_time || '',
        end_time: currentValues.delivery_setting_end_time || '',
        schedule_time: currentValues.delivery_setting_schedule_time || '',
        live_duration: currentValues.delivery_setting_live_duration || 0,
        filter_night_switch: currentValues.delivery_setting_filter_night_switch || 'OFF',
        deep_bid_type: currentValues.delivery_setting_deep_bid_type || 'DEEP_BID_DEFAULT',
        bid_type: currentValues.delivery_setting_bid_type || 'CUSTOM',
        project_custom: currentValues.delivery_setting_project_custom || 'OFF',
        bid: currentValues.delivery_setting_bid || 0,
        budget_mode: currentValues.delivery_setting_budget_mode || 'BUDGET_MODE_INFINITE',
        budget: currentValues.delivery_setting_budget || 300,
        pricing: currentValues.delivery_setting_pricing || 'PRICING_OCPM',
        cpa_bid: currentValues.delivery_setting_cpa_bid || 0,
        deep_cpabid: currentValues.delivery_setting_deep_cpabid || 0,
        roi_goal: currentValues.delivery_setting_roi_goal || 0,
        layer_roi_switch: currentValues.delivery_setting_layer_roi_switch || 'OFF',
        first_roi_goal: currentValues.delivery_setting_first_roi_goal || 0,
        seven_roi_goal: currentValues.delivery_setting_seven_roi_goal || 0,
        budget_optimize_switch: currentValues.delivery_setting_budget_optimize_switch || 'OFF',
        search_continue_delivery: currentValues.delivery_setting_search_continue_delivery || 'OFF',
      },

      // track_url_setting 还原
      track_url_setting: {
        track_url_type: currentValues.track_url_type || '',
        track_url_group_id: currentValues.track_url_group_id || 0,
        track_url: currentValues.track_url || [],
        action_track_url: currentValues.action_track_url || [],
        active_track_url: currentValues.active_track_url || [],
        video_play_effective_track_url: currentValues.video_play_effective_track_url || [],
        video_play_done_track_url: currentValues.video_play_done_track_url || [],
        video_play_first_track_url: currentValues.video_play_first_track_url || [],
        send_type: currentValues.send_type || 'SERVER_SEND',
      },
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
  },
});
</script>

<template>
  <div>
    <Drawer title="项目配置">
      <Form></Form>
    </Drawer>
  </div>
</template>
