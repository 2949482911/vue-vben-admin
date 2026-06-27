<script setup lang="ts" name="TencentCampaign">
import type { AudienceConfigData } from "#/views/marketing/creation/creation";
import AudiencePackageModal
  from "#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue";
import { ref, watch } from "vue";
import type { TencentCampaignData } from "#/views/marketing/creation/tencent/tencent";
import { useVbenDrawer, useVbenModal } from "@vben/common-ui";
import TencentCampaignDrawer from "./TencentCampaignDrawer.vue";
import { Platform } from "#/constants/enums";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Divider,
  Space
} from "ant-design-vue";
import AudiencePackageShow
  from "#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue";

/**
 * update:campaign 更新计划信息
 * update:audiencePackage 更新定向包
 */
const emit = defineEmits(["update:campaign", "update:audiencePackage"]);


/**
 * 计划编辑抽屉
 */

const [CampaignDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: TencentCampaignDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const campaignData = drawerApi.getData();
      campaignInfo.value = campaignData as TencentCampaignData;
      emit("update:campaign", campaignInfo.value);
    }
  }
});


/**
 * formFields 展示的表单
 * campaignShowLabel 展示的label
 * audience 定向包
 * campaign 计划数据
 * accountInfo 账户信息
 */
const { formFields, campaignShowLabel, audience, campaign, accountInfo } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  campaignShowLabel: {
    type: Object,
    default: () => {}
  },
  audience: {
    type: Object as () => AudienceConfigData | null,
    default: () => {}
  },
  campaign: {
    type: Object as () => TencentCampaignData | null,
    default: () => {}
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => []
  }
});


// campaignInfo 腾讯营销单元信息 - 必须在 watch 之前定义
const campaignInfo = ref<TencentCampaignData>({
  adgroup_id: 0,
  additional_product_spec: {
    product_catalog_id: "",
    product_outer_id: ""
  },
  additional_product_spec_switch: false,
  adgroup_name: "",
  adx_realtime_type: "",
  aoi_optimization_strategy: {
    aoi_id_list: [], aoi_optimization_strategy_enabled: false
  },
  aoi_optimization_strategy_switch: false,
  auto_acquisition_budget: 0,
  auto_acquisition_enabled: false,
  auto_derived_creative_enabled: false,
  auto_derived_creative_preference: {
    auto_derived_creative_method_type_list: []
  },
  auto_derived_creative_preference_switch: false,
  auto_derived_landing_page_switch: false,
  automatic_site_enabled: false,
  begin_date: "",
  bid_amount: 0,
  bid_mode: "",
  bid_scene: "",
  cloud_union_spec: {
    expected_roi: 0, roi_goal: ""
  },
  cloud_union_spec_switch: false,
  configured_status: "",
  conversion_id: "",
  cost_constraint_scene: "",
  custom_cost_cap: 0,
  custom_cost_roi_cap: 0,
  daily_budget: 0,
  dca_spec: {
    recommend_method_ids: [], set_id: ""
  },
  dca_spec_switch: false,
  deep_conversion_behavior_advanced_bid: 0,
  deep_conversion_behavior_bid: 0,
  deep_conversion_spec: {
    deep_conversion_behavior_advanced_spec: {
      bid_amount: 0, goal: ""
    },
    deep_conversion_behavior_spec: {
      bid_amount: 0, goal: ""
    },
    deep_conversion_type: "",
    deep_conversion_worth_advanced_spec: {
      expected_roi: 0, goal: ""
    },
    deep_conversion_worth_spec: {
      expected_roi: 0, goal: ""
    }
  },
  deep_conversion_spec_switch: false,
  deep_conversion_worth_advanced_rate: 0,
  deep_conversion_worth_rate: 0,
  dsp_id: 0,
  dynamic_ad_type: "",
  ecom_pkam_switch: "",
  enable_steady_exploration: false,
  end_date: "",
  exploration_strategy: "",
  feedback_id: 0,
  first_day_begin_time: "",
  flow_optimization_enabled: false,
  forward_link_assist: "",
  live_recommend_strategy_enabled: false,
  marketing_asset_id: 0,
  marketing_asset_outer_spec: {
    marketing_asset_outer_id: "",
    marketing_asset_outer_name: "",
    marketing_asset_outer_sub_id: "",
    marketing_target_type: ""
  },
  marketing_asset_outer_spec_switch: false,
  marketing_carrier_detail: {
    marketing_carrier_id: "", marketing_carrier_name: "", marketing_sub_carrier_id: ""
  },
  marketing_carrier_detail_switch: false,
  marketing_carrier_type: "",
  marketing_goal: "",
  marketing_sub_goal: "",
  material_package_id: 0,
  mpa_spec: {
    product_catalog_id: "",
    product_series_id: "",
    recommend_method_ids: []
  },
  mpa_spec_switch: false,
  optimization_goal: "",
  poi_list: [],
  priority_site_set: [],
  rta_id: 0,
  rta_target_id: "",
  scene_spec: {
    display_scene: [],
    exclude_mobile_union: [],
    exclude_union_position_package: [],
    mobile_union: [],
    mobile_union_category: [],
    pc_scene: [],
    qbsearch_scene: [],
    tencent_news: [],
    union_position_package: [],
    wechat_channels_scene: [],
    wechat_position: [],
    wechat_scene: {
      mini_program_and_mini_game: [],
      official_account_media_category: [],
      pay_scene: []
    },
    wechat_search_scene: []
  },
  scene_spec_switch: false,
  search_expand_targeting_switch: "",
  search_expansion_switch: "",
  sell_strategy_id: 0,
  short_play_pay_type: "",
  site_set: [],
  smart_bid_type: "",
  smart_cost_cap: 0,
  smart_coupon_mode: "",
  smart_targeting_mode: "",
  time_series: "",
  user_action_sets: []
});


// 监听父组件传入的 campaign 数据变化，实现回显（复用策略组时）
watch(
  () => campaign,
  (newCampaign) => {
    if (newCampaign) {
      campaignInfo.value = { ...newCampaign };
    }
  },
  { immediate: true, deep: true }
);


function openCampaignDrawer() {
  drawerApi.setData(campaignInfo.value);
  drawerApi.open();
}


/**
 * 更新定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}


//----------选择定向包-----------
const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal
});


function openAudiencePackage() {
  audiencePackageModalApi.setData(audience);
  audiencePackageModalApi.open();
}

</script>

<template>
  <div class="tencent-campaign-container">
    <div class="campaign-cards-wrapper">
      <Card title="营销单元" class="info-card">
        <div class="card-content">
          <Descriptions title="基本信息" v-if="campaignInfo.adgroup_name" :column="1" class="info-descriptions">
            <DescriptionsItem v-for="(label, key ) in campaignShowLabel"
                              :key="key" :label="label">
              {{ campaignInfo[key] }}
            </DescriptionsItem>
          </Descriptions>
          <Alert v-else type="error" message="请先填写营销单元信息" class="empty-alert"></Alert>
        </div>
        <div class="card-footer">
          <Button primary danger @click="openCampaignDrawer">
            {{ campaignInfo.adgroup_name ? "编辑营销单元" : "添加营销单元" }}
          </Button>
        </div>
      </Card>

      <Card title="定向包" class="info-card">
        <div class="card-content">
          <AudiencePackageShow :audience="audience" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openAudiencePackage">
            添加定向包
          </Button>
        </div>
      </Card>
    </div>

    <CampaignDrawerModule :form-fields="formFields" />

    <AudiencePackage :account-info="accountInfo"
                     :platform="Platform.TENCENT"
                     @update:orientation="updateAudiencePackage"
    />
  </div>
</template>

<style scoped lang="scss">
.tencent-campaign-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.campaign-cards-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  width: 100%;
  min-height: 300px; // 固定最小高度，防止内容被挤压
  
  // Card 样式优化
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
    min-height: 57px; // Card 标题固定高度
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
  min-height: 150px; // 增大内容区域最小高度，确保有足够空间显示内容
}

.card-footer {
  display: flex;
  justify-content: center; // 居中对齐
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto; // 自动推到底部
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
