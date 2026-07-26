<script setup lang="ts" name="BytedanceCampaignDrawer">
import { computed, nextTick, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import DpaProductModal from './DpaProductModal.vue';
import type {
  BytedanceDpaProductListItem,
} from '#/api/models/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';

const props = defineProps({
  formFields: {
    type: Array,
    default: () => [],
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => [],
  },
});

/** 从 accountInfo 提取广告主ID列表（字符串数组） */
const advertiserIds = computed(() =>
  props.accountInfo.map((a) => a.localAdvertiserId),
);

/** 已选中的 DPA 商品信息（响应式对象，通过 schema.componentProps 注入到 DpaProductButtonField） */
const dpaContext = reactive<{ selectedProduct: BytedanceDpaProductListItem | null }>({
  selectedProduct: null,
});

/** DPA 商品选择弹窗 */
const [DpaProductModalModule, dpaModalApi] = useVbenModal({
  connectedComponent: DpaProductModal,
  onOpenChange(isOpen) {
    if (!isOpen) {
      // 弹窗关闭后，获取选中的商品并回填隐藏字段到表单
      const data = dpaModalApi.getData();
      if (data?.selectedProduct !== undefined) {
        dpaContext.selectedProduct = data.selectedProduct;
        if (data.selectedProduct) {
          formApi.setValues({
            related_product_platform_id: String(data.selectedProduct.platform_id),
            related_product_id: String(data.selectedProduct.product_id),
            related_product_unique_id: String(data.selectedProduct.product_id),
          });
        } else {
          formApi.setValues({
            related_product_platform_id: '',
            related_product_id: '',
            related_product_unique_id: '',
          });
        }
      }
    }
  },
});

/** 打开 DPA 商品选择弹窗 */
function openDpaModal() {
  dpaModalApi.setData({
    advertiserIds: advertiserIds.value,
    initialProduct: dpaContext.selectedProduct,
    selectedProduct: undefined,
  });
  dpaModalApi.open();
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange: (values: Record<string, any>) => {
    // 监听 related_product_setting 变化，非SINGLE时清空已选商品
    const newSetting = values.related_product_setting;
    if (newSetting !== 'SINGLE') {
      dpaContext.selectedProduct = null;
    }
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const campaign = drawerApi.getData();
      formApi.setState({ schema: props.formFields });
      await nextTick();

      // 初始化 DPA 商品选择器状态
      // 如果 schema 中将 product_setting 隐藏且有 defaultValue，以 schema 为准
      const productSettingField = (props.formFields as any[]).find(
        (f: any) => f.fieldName === 'related_product_setting',
      );
      const fieldIsHidden = productSettingField?.dependencies?.show === false;
      const productSetting = fieldIsHidden && productSettingField?.defaultValue
        ? productSettingField.defaultValue
        : (campaign.related_product?.product_setting || 'NO_MAP');
      dpaContext.selectedProduct = campaign._dpaProductInfo || null;

      // 动态注入 DPA 回调
      const schemaWithDpa = (props.formFields as any[]).map((f: any) => {
        if (f.fieldName === 'dpa_product_button') {
          return { ...f, componentProps: { dpaContext, openDpaModal } };
        }
        return f;
      });
      formApi.setState({ schema: schemaWithDpa });
      await nextTick();

      const flattenedData = {
        ...campaign,

        // related_product 平铺
        related_product_setting: productSetting,
        related_product_platform_id: campaign.related_product?.product_platform_id,
        related_product_id: campaign.related_product?.product_id,
        related_product_unique_id: campaign.related_product?.unique_product_id,

        // native_setting 平铺
        native_setting_aweme_id: campaign.native_setting?.aweme_id,

        // optimize_goal 平铺
        optimize_goal_asset_ids: campaign.optimize_goal?.asset_ids,
        optimize_goal_external_action: campaign.optimize_goal?.external_action,
        optimize_goal_game_addiction_id: campaign.optimize_goal?.game_addiction_id,
        optimize_goal_paid_switch: campaign.optimize_goal?.paid_switch,
        optimize_goal_deep_external_action: campaign.optimize_goal?.deep_external_action,

        // delivery_range 平铺
        delivery_range_inventory_catalog: campaign.delivery_range?.inventory_catalog,
        delivery_range_inventory_type: campaign.delivery_range?.inventory_type,
        delivery_range_union_video_type: campaign.delivery_range?.union_video_type,

        // delivery_setting 平铺
        delivery_setting_schedule_type: campaign.delivery_setting?.schedule_type,
        delivery_setting_start_time: campaign.delivery_setting?.start_time,
        delivery_setting_end_time: campaign.delivery_setting?.end_time,
        delivery_setting_schedule_time: campaign.delivery_setting?.schedule_time,
        delivery_setting_live_duration: campaign.delivery_setting?.live_duration,
        delivery_setting_filter_night_switch: campaign.delivery_setting?.filter_night_switch,
        delivery_setting_deep_bid_type: campaign.delivery_setting?.deep_bid_type,
        delivery_setting_bid_type: campaign.delivery_setting?.bid_type,
        delivery_setting_project_custom: campaign.delivery_setting?.project_custom,
        delivery_setting_bid: campaign.delivery_setting?.bid,
        delivery_setting_budget_mode: campaign.delivery_setting?.budget_mode,
        delivery_setting_budget: campaign.delivery_setting?.budget,
        delivery_setting_pricing: campaign.delivery_setting?.pricing,
        delivery_setting_cpa_bid: campaign.delivery_setting?.cpa_bid,
        delivery_setting_deep_cpabid: campaign.delivery_setting?.deep_cpabid,
        delivery_setting_roi_goal: campaign.delivery_setting?.roi_goal,
        delivery_setting_layer_roi_switch: campaign.delivery_setting?.layer_roi_switch,
        delivery_setting_first_roi_goal: campaign.delivery_setting?.first_roi_goal,
        delivery_setting_seven_roi_goal: campaign.delivery_setting?.seven_roi_goal,
        delivery_setting_budget_optimize_switch: campaign.delivery_setting?.budget_optimize_switch,
        delivery_setting_search_continue_delivery: campaign.delivery_setting?.search_continue_delivery,

        // track_url_setting 平铺
        send_type: campaign.track_url_setting?.send_type,
      };

      // 过滤 falsy 值：只在值有效时才传入表单，让 schema defaultValue 生效
      const filteredData: Record<string, any> = {};
      for (const [key, value] of Object.entries(flattenedData)) {
        if (value) {
          filteredData[key] = value;
        }
      }

      // 移除嵌套对象字段（非表单平铺字段名）
      const nestedKeys = [
        'related_product', 'native_setting', 'optimize_goal', 'delivery_range',
        'audience', 'delivery_setting', 'track_url_setting', 'keywords',
        '_dpaProductInfo',
      ];
      nestedKeys.forEach((k) => delete filteredData[k]);

      await formApi.setValues(filteredData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    // 商品投放模式下，必须选择商品
    if (currentValues.related_product_setting === 'SINGLE' && !dpaContext.selectedProduct) {
      message.warning('请先选择投放商品');
      return;
    }

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
        inventory_catalog: currentValues.delivery_range_inventory_catalog,
        inventory_type: currentValues.delivery_range_inventory_type || [],
        union_video_type: currentValues.delivery_range_union_video_type,
      },

      // delivery_setting 还原
      delivery_setting: {
        schedule_type: currentValues.delivery_setting_schedule_type ,
        start_time: currentValues.delivery_setting_start_time || '',
        end_time: currentValues.delivery_setting_end_time || '',
        schedule_time: currentValues.delivery_setting_schedule_time || '',
        live_duration: currentValues.delivery_setting_live_duration || 0,
        filter_night_switch: currentValues.delivery_setting_filter_night_switch ,
        deep_bid_type: currentValues.delivery_setting_deep_bid_type ,
        bid_type: currentValues.delivery_setting_bid_type || '',
        project_custom: currentValues.delivery_setting_project_custom || '',
        bid: currentValues.delivery_setting_bid || 0,
        budget_mode: currentValues.delivery_setting_budget_mode || '',
        budget: currentValues.delivery_setting_budget || 300,
        pricing: currentValues.delivery_setting_pricing || '',
        cpa_bid: currentValues.delivery_setting_cpa_bid || 0,
        deep_cpabid: currentValues.delivery_setting_deep_cpabid || 0,
        roi_goal: currentValues.delivery_setting_roi_goal || 0,
        layer_roi_switch: currentValues.delivery_setting_layer_roi_switch || '',
        first_roi_goal: currentValues.delivery_setting_first_roi_goal || 0,
        seven_roi_goal: currentValues.delivery_setting_seven_roi_goal || 0,
        budget_optimize_switch: currentValues.delivery_setting_budget_optimize_switch || '',
        search_continue_delivery: currentValues.delivery_setting_search_continue_delivery || '',
      },

      // track_url_setting 还原
      // track_url_setting: {
      //   track_url_type: currentValues.track_url_type || '',
      //   track_url_group_id: currentValues.track_url_group_id || 0,
      //   track_url: currentValues.track_url || [],
      //   action_track_url: currentValues.action_track_url || [],
      //   active_track_url: currentValues.active_track_url || [],
      //   video_play_effective_track_url: currentValues.video_play_effective_track_url || [],
      //   video_play_done_track_url: currentValues.video_play_done_track_url || [],
      //   video_play_first_track_url: currentValues.video_play_first_track_url || [],
      //   send_type: currentValues.send_type || '',
      // },

      // DPA 商品展示信息（用于摘要卡片，不传给API）
      _dpaProductInfo: dpaContext.selectedProduct,
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

    <DpaProductModalModule />
  </div>
</template>
