<script setup lang="ts">
/**
 * 巨量智擎版批投页面
 *
 * 单层结构：只有项目层级，无广告组/广告/创意层级
 * 统一模板：std_project_template
 * 提交时通过 extraParams 增加 taskType=bytedance_std 区分
 */
import { Page, useVbenModal } from "@vben/common-ui";
import { Card, Drawer, message, Select } from "ant-design-vue";
import { ref, watch } from "vue";

import type {
  AccountInfo,
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  Project,
  RuleConfiguration,
  RuleInfo,
  RuleOptions,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import { Platform } from "#/constants/enums";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";

import ConfigurationConfig from "../components/configurationArea.vue";
import Function from "../components/Function.vue";
import CreateStrategyGroup from "../components/createStrategyGroup.vue";
import Submit from "../components/submit/SubmitModal.vue";
import BatchTaskResultDrawer from "../components/result/BatchTaskResultDrawer.vue";

import StdProjectTemplate from "./components/StdProjectTemplate.vue";
import StdProjectPreviewArea from "./components/StdProjectPreviewArea.vue";
import { getPreviewTableData } from "./convertToPreviewData";
import type { StdCreation, StdCreationData, StdProjectData } from "./bytedance";
import { BYTEDANCE_STD } from "./bytedance";
import { BYTEDANCE_STD_MARKETING_TYPE } from "#/views/marketing/creation/bytedance_std/enums";

// ==================== 提交弹窗 ====================
const [SubmitModal, submitApi] = useVbenModal({
  connectedComponent: Submit,
  onOpenChange(isOpen) {
    if (!isOpen) {
      // 弹窗关闭时重置
    }
  }
});

// ==================== 策略组弹窗 ====================
const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  }
});

// ==================== 批投任务结果跟踪 ====================
const currentTask = ref<{
  taskId: string;
  taskName: string;
  platform: string;
  projectId: string
} | null>(null);
const resultDrawerOpen = ref(false);
const taskInProgress = ref(false);

function handleTaskCreated(data: { taskId: string; taskName: string }) {
  currentTask.value = {
    taskId: data.taskId,
    taskName: data.taskName,
    platform: creationInfo.value.platform,
    projectId: creationInfo.value.project.projectId
  };
  taskInProgress.value = true;
  resultDrawerOpen.value = true;
}

function viewTaskProgress() {
  if (currentTask.value) {
    resultDrawerOpen.value = true;
  }
}

function onResultDrawerClose() {
  resultDrawerOpen.value = false;
}

function onTaskCompleted(_status: number) {
  // 任务执行完毕
}

// ==================== 智擎版规则配置（单层，只有项目） ====================
const bytedanceStdRuleConfiguration: RuleConfiguration = {
  project: {
    show: true,
    name: "项目",
    rules: "项目生成规则",
    countLabel: "每个账户指定项目数"
  },
  adGroup: {
    show: false,
    name: "广告组",
    rules: "广告组生成规则",
    countLabel: "每个项目指定广告组数"
  },
  ad: {
    show: false,
    name: "广告",
    rules: "广告生成规则",
    countLabel: "每个广告组指定广告数"
  },
  creative: {
    show: false,
    name: "创意",
    rules: "创意生成规则",
    countLabel: "每个广告指定创意数"
  }
};

const bytedanceStdRuleOptions: RuleOptions = {
  projectRules: [
    { title: "根据定向包生成", desc: "项目数量与定向包数量相等", key: "targeting" },
    { title: "根据创意组生成", desc: "项目数量与创意组数量相等", key: "creative" },
    { title: "根据标题包生成", desc: "项目数量与标题包数量相等", key: "title" },
    { title: "指定数量", desc: "手动指定每个账户的项目数量", key: "custom" }
  ],
  adGroupRules: [],
  adRules: [],
  creativeRules: []
};

// ==================== 事件处理 ====================
function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error("请先配置预览区数据");
    return;
  }
  submitApi.open();
}

function updateAccountInfo(accountInfo: Array<AccountInfo>) {
  creationInfo.value.accountInfo = accountInfo;
}

function updateProject(project: Project) {
  creationInfo.value.project = project;
}

function updateRuleInfo(ruleInfo: RuleInfo) {
  creationInfo.value.ruleInfo = ruleInfo;
}

function updateProjectData(project: StdProjectData) {
  Object.assign(creationInfo.value.configData.project, project);
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  creationInfo.value.configData.audience = audienceConfigData;
}

function updateMaterial(material: MaterialData) {
  creationInfo.value.configData.material = material;
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  creationInfo.value.configData.titlePackage = titlePackage;
}

function updateLandingPage(landingPage: PageViewConfigData) {
  creationInfo.value.configData.landingPage = landingPage;
}

function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn("配置已更新,预览区已重置");
  }
}

function genPreviewTableData() {
  adList.value = getPreviewTableData(creationInfo.value);
}

function createStrategyGroup() {
  createStrategyGroupApi.setData(creationInfo.value);
  createStrategyGroupApi.open();
}

// ==================== 初始化 ====================
const creationInfo = ref<StdCreation>({
  monitoringLink: {
    clickLink: "",
    exposureLink: "",
    monitorLink: "",
    linkModeType: "",
    allocateType: "",
    ocpxTaskId: ""
  },
  accountInfo: [],
  configData: {
    project: {
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
      related_product: {
        product_setting: "",
        product_platform_id: "",
        product_id: "",
        unique_product_id: ""
      },
      download_url: "",
      app_name: "",
      download_type: "",
      download_mode: "",
      quick_app_id: "",
      launch_type: "",
      promotion_type: "",
      subscribe_url: "",
      asset_id: 0,
      external_action: "",
      deep_external_action: "",
      game_addiction_id: "",
      paid_switch: 0,
      deep_bid_type: "",
      value_optimized_type: "",
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
      open_url: "",
      open_url_type: "",
      open_urls: [],
      ulink_url_type: "",
      ulink_url: "",
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
        product_info: {
          titles: [],
          image_ids: [],
          selling_points: [],
          local_material_image_ids: []
        },
        anchor_related_type: "",
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
        open_url_params: ""
      },
      audience_type: "",
      source: "",
      is_comment_disable: "",
      ad_download_status: "",
      aigc_dynamic_creative_switch: "",
      star_auto_material_addition_switch: "",
      star_auto_delivery_switch: "",
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
    },
    material: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, any[]>()
    },
    audience: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Array<TargetedPackageTypeItem>>()
    },
    titlePackage: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Array<TitlePackageItem>>()
    },
    landingPage: {
      config: { method: RuleMethod.ALL },
      data: new Map()
    }
  },
  configurationConfig: {
    platform: Platform.BYTEDANCE,
    template: "base_template"
  },
  platform: Platform.BYTEDANCE,
  project: {
    projectId: "",
    projectName: "",
    icon: "",
    packageName: "",
    appId: ""
  },
  ruleInfo: {
    projectRuleKey: RuleKey.TARGET,
    projectCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adGroupCount: 1,
    adRuleKey: RuleKey.CREATIVE,
    adCount: 1,
    creativeRuleKey: RuleKey.CREATIVE_GROUP,
    creativeCount: 1
  },
  version: BYTEDANCE_STD
});

// ==================== 复用策略组数据（Map 反序列化） ====================
function updateReuse(creation: StdCreation) {
  if (creation.configData) {
    const config = creation.configData;
    if (config.material && !(config.material.data instanceof Map)) {
      config.material.data = new Map(Object.entries(config.material.data || {}));
    }
    if (config.audience && !(config.audience.data instanceof Map)) {
      config.audience.data = new Map(Object.entries(config.audience.data || {}));
    }
    if (config.titlePackage && !(config.titlePackage.data instanceof Map)) {
      config.titlePackage.data = new Map(Object.entries(config.titlePackage.data || {}));
    }
    if (config.landingPage && !(config.landingPage.data instanceof Map)) {
      config.landingPage.data = new Map(Object.entries(config.landingPage.data || {}));
    }
  }
  creationInfo.value = creation;
  template.value = creation.configurationConfig.template || "base_template";
}

// 模板
const template = ref<string>("base_template");

async function updateTemplate(changeVal: string) {
  template.value = changeVal;
}

// 预览区数据
const adList = ref<StdCreationData[]>([]);

watch(() => creationInfo, (_) => {
  resetCreationInfo();
}, { immediate: true, deep: true });
</script>

<template>
  <div>
    <Page auto-content-height>

      <Card class="header" title="模板选择">
        <Select
          class="w-[200px]"
          :options="BYTEDANCE_STD_MARKETING_TYPE"
          :value="template"
          @change="updateTemplate"
        />
      </Card>

      <!-- 配置区：账户、产品、规则 -->
      <Card class="header">
        <ConfigurationConfig
          :rule-info="creationInfo.ruleInfo"
          :configuration-config="creationInfo.configurationConfig"
          :account-info="creationInfo.accountInfo"
          :project="creationInfo.project"
          :rule-configuration="bytedanceStdRuleConfiguration"
          :rule-options="bytedanceStdRuleOptions"
          @update:product-info="updateProject"
          @update:account-info="updateAccountInfo"
          @update:rule-info="updateRuleInfo"
          @update:reuse="updateReuse"
        />
      </Card>

      <!-- 智擎版统一模板（单层项目结构） -->
      <Card class="header">
        <StdProjectTemplate
          :creation-info="creationInfo"
          @update:project="updateProjectData"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:audience-package="updateAudiencePackage"
          @update:landing-page="updateLandingPage"
        />
      </Card>

      <!-- 工具栏 -->
      <Card class="header">
        <Function
          :account-info="creationInfo.accountInfo"
          :task-in-progress="taskInProgress"
          @gen:ad-list="genPreviewTableData"
          @save:create-strategy-group="createStrategyGroup"
          @submit:create-batch="submitCreateBatch"
          @view:task-progress="viewTaskProgress"
        />
      </Card>

      <CreateStrategyGroupModal />

      <!-- 预览区 -->
      <Card class="header" title="预览区">
        <StdProjectPreviewArea
          :ad-list="adList"
          :account-info="creationInfo.accountInfo"
        />
      </Card>

      <!-- 提交弹窗：extraParams 传递 taskType=bytedance_std -->
      <SubmitModal
        :creation-info="creationInfo"
        :ad-list="adList"
        @result:getCreationTask="handleTaskCreated"
      />

      <!-- 批投任务结果抽屉 -->
      <Drawer
        :open="resultDrawerOpen"
        title="批投任务执行结果"
        :width="800"
        @close="onResultDrawerClose"
        :destroyOnClose="false"
      >
        <BatchTaskResultDrawer
          v-if="currentTask"
          :task-id="currentTask.taskId"
          :task-name="currentTask.taskName"
          :platform="currentTask.platform"
          :project-id="currentTask.projectId"
          @task-completed="onTaskCompleted"
        />
      </Drawer>
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
