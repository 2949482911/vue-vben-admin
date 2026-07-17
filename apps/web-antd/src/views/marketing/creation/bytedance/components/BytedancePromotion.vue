<script setup lang="ts" name="BytedancePromotion">
import { ref, watch } from 'vue';
import type { BytedancePromotionData } from '#/views/marketing/creation/bytedance/bytedance';
import { useVbenDrawer } from '@vben/common-ui';
import BytedancePromotionDrawer from './BytedancePromotionDrawer.vue';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
} from 'ant-design-vue';

const emit = defineEmits(['update:promotion']);

const [PromotionDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: BytedancePromotionDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const promotionData = drawerApi.getData();
      promotionInfo.value = promotionData as BytedancePromotionData;
      emit('update:promotion', promotionInfo.value);
    }
  },
});

const { formFields, promotionShowLabel, promotion, fieldLabelMap } = defineProps({
  formFields: { type: Array, default: () => [] },
  promotionShowLabel: { type: Object, default: () => ({}) },
  promotion: { type: Object as () => BytedancePromotionData | null, default: () => ({}) },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

const promotionInfo = ref<BytedancePromotionData>({
  project_id: '',
  name: '',
  operation: 'ENABLE',
  promotion_dpa_materials: {
    video_material_list: [],
    image_material_list: [],
    params_type: '',
    external_url_field: '',
    external_url_material_list: [],
    external_url_params: '',
    web_url_material_list: [],
    open_url_type: '',
    open_url_field: '',
    open_url_params: '',
    open_url: '',
    product_info: {
      product_name_type: '', product_image_type: '', product_selling_point_type: '',
      product_name_fields: [], product_image_fields: [], product_selling_point_fields: [],
      titles: [], image_ids: [], selling_points: [],
    },
    call_to_action_buttons: [],
    dynamic_creative_switch: '',
    advanced_dc_settings: [],
  },
  materials_type: '',
  promotion_related_product: [],
  promotion_related_product_materials: [],
  native_setting: { aweme_setting_type: '', aweme_id: '', aweme_ids: [], anchor_related_type: 'OFF' },
  source: '',
  is_comment_disable: 'OFF',
  ad_download_status: 'OFF',
  brand_info: {
    yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
    brand_name_id: 0, cdp_brand_name: '', sub_brand_names: [], sub_brand_name_ids: [],
  },
  budget_mode: 'BUDGET_MODE_DAY',
  budget: 0,
  bid: 0,
  cpa_bid: 0,
  deep_cpabid: 0,
  roi_goal: 0,
  first_roi_goal: 0,
  union_bid_ratio: 0,
  shop_multi_roi_goals: [],
  sevend_retention: 0,
  auto_extend_traffic: 'OFF',
  keywords: [],
});

watch(
  () => promotion,
  (newPromotion) => {
    if (newPromotion) {
      promotionInfo.value = { ...newPromotion };
    }
  },
  { immediate: true, deep: true },
);

function openPromotionDrawer() {
  drawerApi.setData(promotionInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="bytedance-promotion-container">
    <Card title="广告" class="info-card">
      <div class="card-content">
        <Descriptions title="基本信息" v-if="promotionInfo.name" :column="1" class="info-descriptions">
          <DescriptionsItem v-for="(label, key) in promotionShowLabel" :key="key" :label="label">
            {{ fieldLabelMap[key] ? fieldLabelMap[key](promotionInfo[key]) : promotionInfo[key] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert v-else type="error" message="请先填写广告信息" class="empty-alert" />
      </div>
      <div class="card-footer">
        <Button primary danger @click="openPromotionDrawer">
          {{ promotionInfo.name ? '编辑广告' : '添加广告' }}
        </Button>
      </div>
    </Card>
    <PromotionDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">
.bytedance-promotion-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-card {
  width: 100%;
  height: 100%;
  min-height: 616px;

  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px;
  }

  .ant-card-body {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
  min-height: 150px;
}

.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto;
}

.info-descriptions {
  .ant-descriptions-item-label {
    font-weight: 500;
  }
}

.empty-alert {
  margin: 8px 0;
}
</style>
