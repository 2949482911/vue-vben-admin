<script setup lang="ts" name="StdProjectForm">
/**
 * 智擎版项目表单卡片
 *
 * 展示项目摘要信息，通过抽屉编辑项目配置
 * 集成定向包
 */
import type { AudienceConfigData } from '#/views/marketing/creation/creation';
import type { StdProjectData } from '#/views/marketing/creation/bytedance_std/bytedance';
import { ref, watch } from 'vue';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import StdProjectDrawer from './StdProjectDrawer.vue';
import AudiencePackageModal
  from '#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import { Alert, Button, Card, Descriptions, DescriptionsItem } from 'ant-design-vue';
import AudiencePackageShow
  from '#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue';

const emit = defineEmits([
  'update:project',
  'update:audiencePackage',
]);

const props = defineProps({
  project: {
    type: Object as () => StdProjectData | null,
    default: () => ({}),
  },
  audience: {
    type: Object as () => AudienceConfigData | null,
    default: () => ({}),
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => [],
  },
});

// -- 项目抽屉 --
const [ProjectDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: StdProjectDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const projectData = drawerApi.getData();
      if (projectData) {
        projectInfo.value = projectData as StdProjectData;
      }
      emit('update:project', projectInfo.value);
    }
  },
});

// -- 定向包弹窗 --
const [AudiencePackage, audienceModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal,
});

function openAudiencePackage() {
  audienceModalApi.setData(props.audience);
  audienceModalApi.open();
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}

// -- 项目数据 --
const projectInfo = ref<StdProjectData>({
  operation: 'ENABLE',
  name: '',
  ad_type: 'ALL',
  landing_type: 'APP',
  marketing_goal: 'VIDEO_AND_IMAGE',
  app_promotion_type: 'DOWNLOAD',
  delivery_mode: 'PROCEDURAL',
  delivery_type: 'NORMAL',
  native_type: 'ACCOUNT',
  aweme_id: '',
  delivery_medium: '',
  related_product: { product_setting: 'NO_MAP', product_platform_id: '', product_id: '', unique_product_id: '' },
  download_url: '',
  app_name: '',
  download_type: 'DOWNLOAD_URL',
  download_mode: 'DEFAULT',
  quick_app_id: '',
  launch_type: 'DIRECT_OPEN',
  promotion_type: 'LANDING_PAGE_LINK',
  subscribe_url: '',
  asset_id: 0,
  external_action: '',
  deep_external_action: '',
  game_addiction_id: '',
  paid_switch: 2,
  deep_bid_type: 'DEEP_BID_DEFAULT',
  value_optimized_type: 'OFF',
  schedule_type: 'SCHEDULE_FROM_NOW',
  start_time: '',
  end_time: '',
  schedule_time: '',
  bid_type: 'CUSTOM',
  budget_mode: 'BUDGET_MODE_DAY',
  budget: 0,
  bid: 0,
  cpa_bid: 0,
  deep_cpabid: 0,
  roi_goal: 0,
  first_roi_goal: 0,
  seven_roi_goal: 0,
  pricing: 'PRICING_OCPM',
  layer_roi_switch: 'OFF',
  search_continue_delivery: 'OFF',
  landing_page_stay_time: 0,
  open_url: '',
  open_url_type: '',
  open_urls: [],
  ulink_url_type: 'UNIVERSAL_LINK',
  ulink_url: '',
  brand_info: {
    yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
    brand_name_id: 0, cdp_brand_name: '', sub_brand_names: [], sub_brand_name_ids: [],
  },
  project_materials: {
    local_video_material_list: [],
    local_image_material_list: [],
    video_material_list: [],
    image_material_list: [],
    title_material_list: [],
    carousel_material_list: [],
    trial_play_material_list: [],
    instant_play_material_list: [],
    product_info: { titles: [], image_ids: [], selling_points: [], local_material_image_ids: [] },
    anchor_related_type: 'OFF',
    anchor_material_list: [],
    component_material_list: [],
    external_url_material_list: [],
    web_url_material_list: [],
    open_url: '',
    open_urls: [],
    ulink: '',
    ulink_type: '',
    mini_program_info: { app_id: '', start_path: '', params: '', url: '', urls: [], auto: [] },
    playlet_series_url_list: [],
    original_video_title: '',
    dynamic_creative_switch: '',
    advanced_dc_settings: [],
    call_to_action_buttons: [],
    intelligent_generation: 'OFF',
    params_type: '',
    external_url_field: '',
    external_url_params: '',
    open_url_type: '',
    open_url_field: '',
    open_url_params: '',
  },
  audience_type: 'UNLIMITED',
  source: '',
  is_comment_disable: 'OFF',
  ad_download_status: 'OFF',
  aigc_dynamic_creative_switch: 'OFF',
  star_auto_material_addition_switch: 'OFF',
  star_auto_delivery_switch: 'OFF',
  star_task_id_list: [],
  keywords: [],
  auto_extend_traffic: 'OFF',
  track_url_setting: {
    track_url_type: '', track_url_group_id: 0,
    track_url: [], action_track_url: [], active_track_url: [],
    video_play_effective_track_url: [], video_play_done_track_url: [], video_play_first_track_url: [],
    send_type: 'SERVER_SEND',
  },
  micro_promotion_type: '',
  micro_app_instance_id: 0,
  dpa_adtype: '',
  multi_asset_type: '',
  asset_type: '',
  instance_id: 0,
});

watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      projectInfo.value = { ...newProject };
    }
  },
  { immediate: true, deep: true },
);

function openProjectDrawer() {
  drawerApi.setData(projectInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="std-project-form-container">
    <div class="cards-wrapper">
      <!-- 项目卡片 -->
      <Card title="智擎项目" class="info-card">
        <div class="card-content">
          <template v-if="projectInfo.name">
            <Descriptions title="基本信息" :column="1" class="info-descriptions">
              <DescriptionsItem label="项目名称">{{ projectInfo.name }}</DescriptionsItem>
              <DescriptionsItem label="营销目的">{{ projectInfo.landing_type }}</DescriptionsItem>
              <DescriptionsItem label="营销场景">{{ projectInfo.marketing_goal }}</DescriptionsItem>
              <DescriptionsItem label="投放模式">{{ projectInfo.delivery_mode === 'PROCEDURAL' ? '自动投放' : '手动投放' }}</DescriptionsItem>
              <DescriptionsItem label="状态">{{ projectInfo.operation === 'ENABLE' ? '启用' : '停用' }}</DescriptionsItem>
            </Descriptions>
          </template>
          <Alert v-else type="error" message="请先填写项目信息" class="empty-alert" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openProjectDrawer">
            {{ projectInfo.name ? '编辑项目' : '添加项目' }}
          </Button>
        </div>
      </Card>

      <!-- 定向包卡片 -->
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

    <ProjectDrawerModule :account-info="accountInfo" />

    <AudiencePackage
      :account-info="accountInfo"
      platform="BYTEDANCE_STD"
      @update:orientation="updateAudiencePackage"
    />
  </div>
</template>

<style scoped lang="scss">
.std-project-form-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cards-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px;
  }

  :deep(.ant-card-body) {
    padding: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.info-descriptions {
  :deep(.ant-descriptions-item-label) {
    font-weight: 500;
  }
}

.empty-alert {
  margin: 8px 0;
}
</style>
