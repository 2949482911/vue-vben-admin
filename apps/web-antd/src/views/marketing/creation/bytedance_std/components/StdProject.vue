<script setup lang="ts" name="StdProjectForm">
/**
 * 智擎版项目表单卡片
 *
 * 完全对齐 bytedance/BytedanceCampaign.vue 模式：
 * - 接收 formFields prop
 * - 通过 :form-fields 传给 StdProjectDrawer（作为 prop，不是 setData）
 * - openProjectDrawer 直接传 projectInfo.value 给 setData
 * - drawer 关闭后取 getData() 回填
 */
import type { AccountInfo, AudienceConfigData } from "#/views/marketing/creation/creation";
import type { StdProjectData } from "../bytedance";
import { computed, ref, watch } from "vue";
import { useVbenDrawer, useVbenModal } from "@vben/common-ui";
import StdProjectDrawer from "./StdProjectDrawer.vue";
import AudiencePackageModal
  from "#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue";
import { Platform } from "#/constants/enums";
import { Alert, Button, Card, Descriptions, DescriptionsItem } from "ant-design-vue";
import AudiencePackageShow
  from "#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue";

const emit = defineEmits(["update:project", "update:audiencePackage"]);

const { formFields, audience, project, accountInfo } = defineProps({
  formFields: { type: Array, default: () => [] },
  audience: {
    type: Object as () => AudienceConfigData | null,
    default: () => ({})
  },
  project: {
    type: Object as () => StdProjectData | null,
    default: () => ({})
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => []
  }
});

const [ProjectDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: StdProjectDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const projectData = drawerApi.getData();
      if (projectData) {
        projectInfo.value = projectData as StdProjectData;
      }
      emit("update:project", projectInfo.value);
    }
  }
});

const projectInfo = ref<StdProjectData>({
  audience: {},
  blue_flow_keyword_name: [],
  live_duration: 0,
  multi_delivery_medium: "",
  product_id: "",
  product_platform_id: "",
  shop_platform: "",
  unique_product_id: 0,
  operation: "",
  name: "",
  ad_type: "",
  landing_type: "",
  marketing_goal: "",
  app_promotion_type: "",
  delivery_mode: "",
  delivery_type: "",
  native_type: "",
  aweme_id: "",
  delivery_medium: "",
  download_url: "",
  app_name: "",
  download_type: "",
  download_mode: "",
  quick_app_id: "",
  launch_type: "",
  promotion_type: "",
  subscribe_url: "",
  asset_id: "",
  external_action: "",
  deep_external_action: "",
  game_addiction_id: "",
  deep_bid_type: "",
  schedule_type: "",
  start_time: "",
  end_time: "",
  schedule_time: "",
  bid_type: "",
  budget_mode: "",
  budget: 0,
  bid: 0,
  cpa_bid: 0,
  deep_cpabid: 0,
  roi_goal: 0,
  first_roi_goal: 0,
  seven_roi_goal: 0,
  pricing: "",
  layer_roi_switch: "",
  search_continue_delivery: "",
  landing_page_stay_time: 0,
  brand_info: {
    yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
    brand_name_id: 0, cdp_brand_name: "", sub_brand_names: [], sub_brand_name_ids: []
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
    anchor_related_type: "OFF",
    anchor_material_list: [],
    component_material_list: [],
    external_url_material_list: [],
    web_url_material_list: [],
    open_url: "",
    open_urls: [],
    ulink: "",
    ulink_type: "",
    mini_program_info: { app_id: "", start_path: "", params: "", url: "", urls: [], auto: [] },
    playlet_series_url_list: [],
    original_video_title: "",
    dynamic_creative_switch: "",
    advanced_dc_settings: [],
    call_to_action_buttons: [],
    intelligent_generation: "",
    params_type: "",
    external_url_field: "",
    external_url_params: "",
    open_url_type: "",
    open_url_field: "",
    open_url_params: "",
    source: ""
  },
  audience_type: "",
  is_comment_disable: "",
  aigc_dynamic_creative_switch: "",
  star_task_id_list: [],
  keywords: [],
  auto_extend_traffic: "",
  track_url_setting: {
    track_url_type: "",
    track_url_group_id: 0,
    track_url: [],
    action_track_url: [],
    active_track_url: [],
    video_play_effective_track_url: [],
    video_play_done_track_url: [],
    video_play_first_track_url: [],
    send_type: ""
  },
  micro_promotion_type: "",
  micro_app_instance_id: 0,
  dpa_adtype: "",
  multi_asset_type: "",
  asset_type: "",
  instance_id: 0
});

watch(
  () => project,
  (newProject) => {
    if (newProject) {
      projectInfo.value = { ...newProject };
    }
  },
  { immediate: true, deep: true }
);

const isAudience = computed(() => projectInfo.value.audience_type !== "CUSTOM");

function openProjectDrawer() {
  drawerApi.setData(projectInfo.value);
  drawerApi.open();
}

const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal
});

function openAudiencePackage() {
  audiencePackageModalApi.setData(audience);
  audiencePackageModalApi.open();
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}
</script>

<template>
  <div class="std-project-form-container">
    <div class="cards-wrapper">
      <Card title="智擎项目" class="info-card">
        <div class="card-content">
          <template v-if="projectInfo.name">
            <Descriptions title="基本信息" :column="1" class="info-descriptions">
              <DescriptionsItem label="项目名称">{{ projectInfo.name }}</DescriptionsItem>
              <DescriptionsItem label="营销目的">{{ projectInfo.landing_type }}</DescriptionsItem>
              <DescriptionsItem label="营销场景">{{ projectInfo.marketing_goal }}</DescriptionsItem>
              <DescriptionsItem label="投放模式">
                {{ projectInfo.delivery_mode === "PROCEDURAL" ? "自动投放" : "手动投放" }}
              </DescriptionsItem>
              <DescriptionsItem label="状态">{{ projectInfo.operation === "ENABLE" ? "启用" : "停用"
                }}
              </DescriptionsItem>
            </Descriptions>
          </template>
          <Alert v-else type="error" message="请先填写项目信息" class="empty-alert" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openProjectDrawer">
            {{ projectInfo.name ? "编辑项目" : "添加项目" }}
          </Button>
        </div>
      </Card>

      <Card title="定向包" class="info-card">
        <div class="card-content">
          <AudiencePackageShow :audience="audience" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openAudiencePackage" :disabled="isAudience">
            添加定向包
          </Button>
        </div>
      </Card>
    </div>

    <!-- formFields 通过 prop 传给 Drawer，与 BytedanceCampaign 一致 -->
    <ProjectDrawerModule :form-fields="formFields" :account-info="accountInfo" />

    <AudiencePackage
      :account-info="accountInfo"
      :platform="Platform.BYTEDANCE"
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
