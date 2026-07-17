<script setup lang="ts" name="BytedanceCampaign">
import type { AudienceConfigData } from '#/views/marketing/creation/creation';
import AudiencePackageModal
  from '#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue';
import { ref, watch } from 'vue';
import type { BytedanceCampaignData } from '#/views/marketing/creation/bytedance/bytedance';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import BytedanceCampaignDrawer from './BytedanceCampaignDrawer.vue';
import { Platform } from '#/constants/enums';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
} from 'ant-design-vue';
import AudiencePackageShow
  from '#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue';

const emit = defineEmits(['update:campaign', 'update:audiencePackage']);

const [CampaignDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: BytedanceCampaignDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const campaignData = drawerApi.getData();
      campaignInfo.value = campaignData as BytedanceCampaignData;
      emit('update:campaign', campaignInfo.value);
    }
  },
});

const { formFields, campaignShowLabel, audience, campaign, accountInfo, fieldLabelMap } = defineProps({
  formFields: { type: Array, default: () => [] },
  campaignShowLabel: { type: Object, default: () => ({}) },
  audience: { type: Object as () => AudienceConfigData | null, default: () => ({}) },
  campaign: { type: Object as () => BytedanceCampaignData | null, default: () => ({}) },
  accountInfo: { type: Array as () => AccountInfo[], default: () => [] },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

const campaignInfo = ref<BytedanceCampaignData>({
  operation: 'ENABLE',
  delivery_mode: 'MANUAL',
  landing_type: 'APP',
  app_promotion_type: 'DOWNLOAD',
  marketing_goal: 'VIDEO_AND_IMAGE',
  ad_type: 'ALL',
  delivery_type: 'NORMAL',
  name: '',
  budget_group_id: 0,
  aigc_dynamic_creative_switch: false,
  star_task_id: 0,
  star_auto_material_addition_switch: 'OFF',
  star_auto_delivery_switch: 'OFF',
  keywords: [],
  auto_extend_traffic: 'OFF',
  related_product: { product_setting: 'NO_MAP', product_platform_id: '', product_id: '', unique_product_id: '' },
  download_url: '',
  app_name: '',
  download_type: 'DOWNLOAD_URL',
  download_mode: 'DEFAULT',
  quick_app_id: '',
  launch_type: 'DIRECT_OPEN',
  promotion_type: 'LANDING_PAGE_LINK',
  open_url_type: 'NONE',
  open_url_params: '',
  open_url_field: '',
  open_url: '',
  ulink_url_type: 'UNIVERSAL_LINK',
  ulink_url: '',
  subscribe_url: '',
  asset_type: 'ORANGE',
  multi_asset_type: '',
  micro_promotion_type: '',
  dpa_adtype: 'DPA_LINK',
  micro_app_instance_id: 0,
  native_setting: { aweme_id: '' },
  optimize_goal: { asset_ids: [], external_action: '', game_addiction_id: '', paid_switch: 2, deep_external_action: '' },
  value_optimized_type: 'OFF',
  landing_page_stay_time: 0,
  yuntu_5a_brand_id: '',
  yuntu_5a_brand_main_industry_id: '',
  delivery_range: { inventory_catalog: 'MANUAL', inventory_type: [], union_video_type: 'ORIGINAL_VIDEO' },
  audience: {},
  delivery_setting: {
    schedule_type: 'SCHEDULE_FROM_NOW', start_time: '', end_time: '', schedule_time: '', live_duration: 0,
    filter_night_switch: 'OFF', deep_bid_type: 'DEEP_BID_DEFAULT', bid_type: 'CUSTOM', project_custom: 'OFF',
    bid: 0, budget_mode: 'BUDGET_MODE_INFINITE', budget: 0, pricing: 'PRICING_OCPM',
    cpa_bid: 0, deep_cpabid: 0, roi_goal: 0, layer_roi_switch: 'OFF',
    first_roi_goal: 0, seven_roi_goal: 0, budget_optimize_switch: 'OFF', search_continue_delivery: 'OFF',
  },
  track_url_setting: {
    track_url_type: '', track_url_group_id: 0,
    track_url: [], action_track_url: [], active_track_url: [],
    video_play_effective_track_url: [], video_play_done_track_url: [], video_play_first_track_url: [],
    send_type: 'SERVER_SEND',
  },
});

watch(
  () => campaign,
  (newCampaign) => {
    if (newCampaign) {
      campaignInfo.value = { ...newCampaign };
    }
  },
  { immediate: true, deep: true },
);

function openCampaignDrawer() {
  drawerApi.setData(campaignInfo.value);
  drawerApi.open();
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}

const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal,
});

function openAudiencePackage() {
  audiencePackageModalApi.setData(audience);
  audiencePackageModalApi.open();
}
</script>

<template>
  <div class="bytedance-campaign-container">
    <div class="campaign-cards-wrapper">
      <Card title="项目" class="info-card">
        <div class="card-content">
          <Descriptions title="基本信息" v-if="campaignInfo.name" :column="1" class="info-descriptions">
            <DescriptionsItem v-for="(label, key) in campaignShowLabel" :key="key" :label="label">
              {{ fieldLabelMap[key] ? fieldLabelMap[key](campaignInfo[key]) : campaignInfo[key] }}
            </DescriptionsItem>
          </Descriptions>
          <Alert v-else type="error" message="请先填写项目信息" class="empty-alert" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openCampaignDrawer">
            {{ campaignInfo.name ? '编辑项目' : '添加项目' }}
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
                     :platform="Platform.BYTEDANCE"
                     @update:orientation="updateAudiencePackage"
    />
  </div>
</template>

<style scoped lang="scss">
.bytedance-campaign-container {
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
  min-height: 300px;

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
