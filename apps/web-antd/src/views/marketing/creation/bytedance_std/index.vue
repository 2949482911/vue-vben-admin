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
  AwemeConfigData,
  MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType,
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

import StdBaseTemplate from "./components/base_template/base_template.vue";
import StdAppTemplate from "./components/app_template/AppTemplate.vue";
import StdProjectPreviewArea from "./components/StdProjectPreviewArea.vue";
import { getPreviewTableData } from "./convertToPreviewData";
import type {
  ProductConfigData,
  StdCreation,
  StdCreationData,
  StdProjectData
} from "./bytedance";
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
  projectId: string;
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
  // 用 Object.assign 合并，保留抽屉未返回的字段（audience/track_url_setting 等）
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

function updateMonitoringLink(monitoringLink: MonitoringLinkConfigData) {
  creationInfo.value.configData.monitoringLink = monitoringLink;
}

function updateAwemeConfig(awemeConfig: AwemeConfigData) {
  creationInfo.value.configData.awemeConfig = awemeConfig;
}

function updateProductConfig(productConfig: ProductConfigData) {
  creationInfo.value.configData.productConfig = productConfig;
}

function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn("配置已更新,预览区已重置");
  }
}

function genPreviewTableData() {
  // 点击生成广告预览即开启新一轮配置，清空上个任务进度信息并隐藏「查看任务进度」按钮
  currentTask.value = null;
  taskInProgress.value = false;
  resultDrawerOpen.value = false;
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
      ad_type: "",
      aigc_dynamic_creative_switch: "",
      app_name: "",
      app_promotion_type: "",
      asset_id: "",
      asset_type: "",
      audience: {},
      audience_type: "",
      auto_extend_traffic: "",
      aweme_id: "",
      bid: 0,
      bid_type: "",
      blue_flow_keyword_name: [],
      brand_info: {
        brand_name_id: 0,
        cdp_brand_id: 0,
        cdp_brand_name: "",
        ecom_brand_id: 0,
        sub_brand_name_ids: [],
        sub_brand_names: [],
        yuntu_category_id: 0
      },
      budget: 0,
      budget_mode: "",
      cpa_bid: 0,
      deep_bid_type: "",
      deep_cpabid: 0,
      deep_external_action: "",
      delivery_medium: "",
      delivery_mode: "",
      delivery_type: "",
      download_mode: "",
      download_type: "",
      download_url: "",
      dpa_adtype: "",
      end_time: "",
      external_action: "",
      first_roi_goal: 0,
      game_addiction_id: "",
      instance_id: 0,
      is_comment_disable: "",
      keywords: [],
      landing_page_stay_time: 0,
      landing_type: "",
      launch_type: "",
      layer_roi_switch: "",
      live_duration: 0,
      marketing_goal: "",
      micro_app_instance_id: 0,
      micro_promotion_type: "",
      multi_asset_type: "",
      multi_delivery_medium: "",
      name: "",
      native_type: "",
      operation: "",
      pricing: "",
      product_id: "",
      product_platform_id: "",
      project_materials: {
        source:"",
        advanced_dc_settings: [],
        anchor_material_list: [],
        anchor_related_type: "",
        call_to_action_buttons: [],
        carousel_material_list: [],
        component_material_list: [],
        dynamic_creative_switch: "",
        external_url_field: "",
        external_url_material_list: [],
        external_url_params: "",
        image_material_list: [],
        instant_play_material_list: [],
        intelligent_generation: "",
        local_image_material_list: [],
        local_video_material_list: [],
        mini_program_info: {
          app_id: "", auto: [], params: "", start_path: "", url: "", urls: []

        },
        open_url: "",
        open_url_field: "",
        open_url_params: "",
        open_url_type: "",
        open_urls: [],
        original_video_title: "",
        params_type: "",
        playlet_series_url_list: [],
        product_info: {
          image_ids: [],
          local_material_image_ids: [],
          selling_points: [],
          titles: []
        },
        title_material_list: [],
        trial_play_material_list: [],
        ulink: "",
        ulink_type: "",
        video_material_list: [],
        web_url_material_list: []

      },
      promotion_type: "",
      quick_app_id: "",
      roi_goal: 0,
      schedule_time: "",
      schedule_type: "",
      search_continue_delivery: "",
      seven_roi_goal: 0,
      shop_platform: "",
      star_task_id_list: [],
      start_time: "",
      subscribe_url: "",
      track_url_setting: {
        action_track_url: [],
        active_track_url: [],
        send_type: "",
        track_url: [],
        track_url_group_id: 0,
        track_url_type: "",
        video_play_done_track_url: [],
        video_play_effective_track_url: [],
        video_play_first_track_url: []

      },
      unique_product_id: 0

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
    },
    monitoringLink: {
      config: { method: RuleMethod.ALL },
      linkType: RuleMethod.MANUAL,
      data: new Map<string, Array<MonitoringLinkType>>()
    },
    // 抖音号配置（智擎版仅支持按项目/按账户分配）
    awemeConfig: { config: { method: 'PER_ACCOUNT' }, data: new Map() },
    // 产品配置（统一配置/按账户配置/按项目配置）
    productConfig: { config: { method: 'ALL_SAME' }, data: new Map() }

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
    appId: "",
    downloadUrl: ""
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
    if (config.monitoringLink && !(config.monitoringLink.data instanceof Map)) {
      config.monitoringLink.data = new Map(Object.entries(config.monitoringLink.data || {}));
    }
    if (config.awemeConfig && config.awemeConfig.data && !(config.awemeConfig.data instanceof Map)) {
      config.awemeConfig.data = new Map(Object.entries(config.awemeConfig.data || {}));
    }
    // 旧数据可能缺少 awemeConfig，补默认值避免下游 prop 校验告警
    if (!config.awemeConfig) {
      config.awemeConfig = { config: { method: 'PER_ACCOUNT' }, data: new Map() };
    }
    if (config.productConfig && config.productConfig.data && !(config.productConfig.data instanceof Map)) {
      config.productConfig.data = new Map(Object.entries(config.productConfig.data || {}));
    }
    // 旧数据可能缺少 productConfig，补默认值避免下游 prop 校验告警
    if (!config.productConfig) {
      config.productConfig = { config: { method: 'ALL_SAME' }, data: new Map() };
    }
  }
  creationInfo.value = creation;
  template.value = creation.configurationConfig.template || "base_template";
}

// 模板
const template = ref<string>("base_template");

async function updateTemplate(changeVal: string) {
  template.value = changeVal;
  creationInfo.value.configurationConfig.template = changeVal;

  // 模板专属默认值覆盖
  if (changeVal === "app_template") {
    const project = creationInfo.value.configData.project;
    // App推广模板固定参数
    project.landing_type = "APP";
    project.download_type = "DOWNLOAD_URL";
    project.download_mode = "DEFAULT";
    project.launch_type = "DIRECT_OPEN";
    project.promotion_type = "LANDING_PAGE_LINK";
    // 接口未定义该顶层字段（确认时映射进 project_materials.ulink_type），此处作为模板固定参数保留
    (project as any).ulink_url_type = "UNIVERSAL_LINK";
    // 投放身份默认抖音号，启用抖音号配置区
    project.native_type = "AWEME";
  }
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

      <!-- 模板区：通过 v-if 切换不同模板组件 -->
      <Card class="header">
        <StdBaseTemplate
          v-if="template === 'base_template'"
          :creation-info="creationInfo"
          :product-config="creationInfo.configData.productConfig"
          @update:project="updateProjectData"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:audience-package="updateAudiencePackage"
          @update:landing-page="updateLandingPage"
          @update:product-config="updateProductConfig"
        />
        <StdAppTemplate
          v-if="template === 'app_template'"
          :creation-info="creationInfo"
          :product-config="creationInfo.configData.productConfig"
          @update:project="updateProjectData"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:audience-package="updateAudiencePackage"
          @update:landing-page="updateLandingPage"
          @update:aweme-config="updateAwemeConfig"
          @update:product-config="updateProductConfig"
        />
      </Card>

      <!-- 工具栏 -->
      <Card class="header">
        <Function
          :account-info="creationInfo.accountInfo"
          :task-in-progress="taskInProgress"
          :monitoring-link="creationInfo.configData.monitoringLink"
          @gen:ad-list="genPreviewTableData"
          @save:create-strategy-group="createStrategyGroup"
          @submit:create-batch="submitCreateBatch"
          @view:task-progress="viewTaskProgress"
          @update:monitoring-link="updateMonitoringLink"
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
        :extra-params="{'taskType': 'bytedance_std'}"
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
