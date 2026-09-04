<script setup lang="ts">
import { Page, useVbenModal } from "@vben/common-ui";
import { Card, Drawer, message, Select } from "ant-design-vue";
import ConfigurationConfig from "../components/configurationArea.vue";
import { ref, watch } from "vue";
import type { BytedanceCampaignData, BytedanceCreation, BytedanceCreationData, BytedancePromotionData } from "./bytedance";
import { BYTEDANCE } from "./bytedance";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import type { AwemeConfigData } from "./bytedance";
import type {
  AccountInfo,
  AudienceConfigData,
  Material,
  MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType, PageViewConfigData,
  Project,
  RuleConfiguration,
  RuleInfo,
  RuleOptions,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { Platform } from "#/constants/enums";
import { BYTEDANCE_MARKETING_TYPE } from "#/views/marketing/creation/bytedance/enums";
import BytedanceBaseTemplate
  from "#/views/marketing/creation/bytedance/components/base/base_template.vue";
import BytedancePreviewArea
  from "#/views/marketing/creation/bytedance/components/BytedancePreviewArea.vue";
import { getPreviewTableData } from "#/views/marketing/creation/bytedance/convertToPreviewData";
import MarketingProductDouyinTemplate
  from "#/views/marketing/creation/bytedance/components/marketing_product_douyin/MarketingProductDouyinTemplate.vue";
import MiniProgramDouyinTemplate
  from "#/views/marketing/creation/bytedance/components/mini_program_douyin/MiniProgramDouyinTemplate.vue";
import MiniProgramWechatTemplate
  from "#/views/marketing/creation/bytedance/components/mini_program_wechat/MiniProgramWechatTemplate.vue";
import Function from "#/views/marketing/creation/components/Function.vue";
import CreateStrategyGroup from "#/views/marketing/creation/components/createStrategyGroup.vue";
import Submit from "#/views/marketing/creation/components/submit/SubmitModal.vue";
import BatchTaskResultDrawer from "#/views/marketing/creation/components/result/BatchTaskResultDrawer.vue";


// 提交弹窗
const [SubmitModal, submitApi] = useVbenModal({
  connectedComponent: Submit,
  onOpenChange(isOpen) {
    if (!isOpen) {
      // 弹窗关闭时重置
    }
  },
});

// ==================== 批投任务结果跟踪 ====================
/** 当前正在执行的批投任务信息 */
const currentTask = ref<{ taskId: string; taskName: string; platform: string; projectId: string } | null>(null);
/** 结果抽屉开关 */
const resultDrawerOpen = ref(false);
/** 是否有进行中的任务（控制工具栏「查看任务进度」按钮显隐） */
const taskInProgress = ref(false);

/**
 * 提交成功回调 - 自动打开结果抽屉
 */
function handleTaskCreated(data: { taskId: string; taskName: string }) {
  currentTask.value = {
    taskId: data.taskId,
    taskName: data.taskName,
    platform: creationInfo.value.platform,
    projectId: creationInfo.value.project.projectId,
  };
  taskInProgress.value = true;
  resultDrawerOpen.value = true;
}

/**
 * 查看任务进度（从工具栏按钮触发）
 */
function viewTaskProgress() {
  if (currentTask.value) {
    resultDrawerOpen.value = true;
  }
}

/**
 * 抽屉关闭回调
 */
function onResultDrawerClose() {
  resultDrawerOpen.value = false;
}

/**
 * 任务完成回调（由 BatchTaskResultDrawer emit）
 */
function onTaskCompleted(_status: number) {
  // 任务执行完毕，更新按钮状态
  // 按钮在任务完成后仍然显示（用户可能需要查看结果），但不再标记为进行中
}


/**
 * 提交
 */
function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error("请先配置预览区数据");
    return;
  }
  submitApi.open();
}

const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  }
});

/**
 * 巨量引擎平台的规则配置
 */
const bytedanceRuleConfiguration: RuleConfiguration = {
  project: {
    show: true,
    name: "项目",
    rules: "项目生成规则",
    countLabel: "每个账户指定项目数"
  },
  adGroup: {
    show: true,
    name: "广告",
    rules: "广告生成规则",
    countLabel: "每个项目指定广告数"
  },
  ad: {
    show: false,
    name: "广告",
    rules: "广告生成规则",
    countLabel: "每个动态创意指定广告数"
  },
  creative: {
    show: false,
    name: "创意",
    rules: "创意生成规则",
    countLabel: "每个动态创意指定创意数"
  }
};

/**
 * 巨量引擎平台的规则选项
 */
const bytedanceRuleOptions: RuleOptions = {
  projectRules: [
    { title: "根据定向包生成", desc: "项目数量与定向包数量相等", key: "targeting" },
    { title: "根据创意组生成", desc: "项目数量与创意组数量相等", key: "creative" },
    { title: "根据标题包生成", desc: "项目数量与标题包数量相等", key: "title" },
    { title: "指定数量", desc: "手动指定每个账户的项目数量", key: "custom" }
  ],
  adGroupRules: [
    { title: "根据定向包生成", desc: "广告数量与定向包数量相等", key: "targeting" },
    { title: "根据创意组生成", desc: "广告数量与创意组数量相等", key: "creative" },
    { title: "根据标题包生成", desc: "广告数量与标题包数量相等", key: "title" },
    { title: "指定数量", desc: "手动指定每个项目的广告数量", key: "custom" }
  ],
  adRules: [],
  creativeRules: []
};

function updateAccountInfo(accountInfo: Array<AccountInfo>) {
  creationInfo.value.accountInfo = accountInfo;
}

function updateProject(project: Project) {
  creationInfo.value.project = project;
  console.log(creationInfo.value.project);
}

function updateRuleInfo(ruleInfo: RuleInfo) {
  creationInfo.value.ruleInfo = ruleInfo;
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  creationInfo.value.configData.audience = audienceConfigData;
}

function updateMonitoringLink(monitoringLink: MonitoringLinkConfigData) {
  creationInfo.value.configData.monitoringLink = monitoringLink;
}

function updateCampaign(campaign: BytedanceCampaignData) {
  Object.assign(creationInfo.value.configData.campaign, campaign);
}

function updatePromotion(promotion: BytedancePromotionData) {
  Object.assign(creationInfo.value.configData.promotion, promotion);
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

function updateAwemeConfig(awemeConfig: AwemeConfigData) {
  creationInfo.value.configData.awemeConfig = awemeConfig;
}

function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn("配置已更新,预览区已重置");
  }
}


/**
 * gen ad list
 * 点击生成广告预览即开启新一轮配置，清空上个任务进度信息并隐藏「查看任务进度」按钮
 */
function genPreviewTableData() {
  currentTask.value = null;
  taskInProgress.value = false;
  resultDrawerOpen.value = false;
  adList.value = getPreviewTableData(creationInfo.value);
  console.log(adList.value);
}



function createStrategyGroup() {
  createStrategyGroupApi.setData(creationInfo.value);
  createStrategyGroupApi.open();
}

const template = ref<string>("base_template");

async function initCreationInfo() {
  creationInfo.value = {
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
      campaign: {
        operation: "",
        delivery_mode: "",
        landing_type: "",
        app_promotion_type: "",
        marketing_goal: "",
        ad_type: "",
        delivery_type: "",
        name: "",
        budget_group_id: 0,
        aigc_dynamic_creative_switch: "",
        star_task_id: 0,
        star_auto_material_addition_switch: "",
        star_auto_delivery_switch: "",
        keywords: [],
        auto_extend_traffic: "",
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
        open_url_type: "",
        open_url_params: "",
        open_url_field: "",
        open_url: "",
        ulink_url_type: "",
        ulink_url: "",
        subscribe_url: "",
        asset_type: "",
        multi_asset_type: "",
        micro_promotion_type: "",
        dpa_adtype: "",
        micro_app_instance_id: 0,
        native_setting: { aweme_id: "" },
        optimize_goal: {
          asset_ids: [],
          external_action: "",
          game_addiction_id: "",
          paid_switch: 0,
          deep_external_action: ""
        },
        value_optimized_type: "",
        landing_page_stay_time: 0,
        yuntu_5a_brand_id: "",
        yuntu_5a_brand_main_industry_id: "",
        delivery_range: {
          inventory_catalog: "",
          inventory_type: [],
          union_video_type: ""
        },
        audience: {},
        delivery_setting: {
          schedule_type: "",
          start_time: "",
          end_time: "",
          schedule_time: "",
          live_duration: 0,
          filter_night_switch: "",
          deep_bid_type: "",
          bid_type: "",
          project_custom: "",
          bid: 0,
          budget_mode: "",
          budget: 0,
          pricing: "",
          cpa_bid: 0,
          deep_cpabid: 0,
          roi_goal: 0,
          layer_roi_switch: "",
          first_roi_goal: 0,
          seven_roi_goal: 0,
          budget_optimize_switch: "",
          search_continue_delivery: ""
        },
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
        }
      },
      promotion: {
        project_id: "",
        name: "",
        operation: "",
        promotion_materials: {
          local_video_material_list: [],
          local_image_material_list: [],
          video_material_list: [],
          image_material_list: [],
          title_material_list: [],
          params_type: "",
          external_url_field: "",
          external_url_params: "",
          open_url_type: "",
          open_url_field: "",
          open_url_params: "",
          product_info: {
            product_name_type: "", product_image_type: "", product_selling_point_type: "",
            product_name_fields: [], product_image_fields: [], product_selling_point_fields: [],
            titles: [], image_ids: [], selling_points: [],
            local_material_image_ids: []
          },
          original_video_title: "",
          playlet_series_url_list: [],
          decoration_material: { activity_id: "", image_mode: "" },
          anchor_material_list: [],
          component_material_list: [],
          external_url_material_list: [],
          mini_program_info: { app_id: "", auto: [], params: "", start_path: "", url: "", urls: [] },
          open_url: "",
          open_urls: [],
          ulink: "",
          ulink_type: "",
          web_url_material_list: [],
          blue_flow_material_recommend: "",
          carousel_material_list: [],
          trial_play_material_list: [],
          instant_play_material_list: [],
          dynamic_creative_switch: "",
          advanced_dc_settings: [],
          call_to_action_buttons: [],
          intelligent_generation: "",
          plant_grass_search_word_material: []
        },
        materials_type: "",
        promotion_related_product: [],
        native_setting: {
          aweme_setting_type: "",
          aweme_id: "",
          aweme_ids: [],
          anchor_related_type: ""
        },
        source: "",
        is_comment_disable: "",
        ad_download_status: "",
        brand_info: {
          yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
          brand_name_id: 0, cdp_brand_name: "", sub_brand_names: [], sub_brand_name_ids: []
        },
        budget_mode: "",
        budget: 0,
        bid: 0,
        cpa_bid: 0,
        deep_cpabid: 0,
        roi_goal: 0,
        first_roi_goal: 0,
        union_bid_ratio: 0,
        shop_multi_roi_goals: [],
        sevend_retention: 0,
        auto_extend_traffic: "",
        keywords: []
      },
      material: {
        config: { method: RuleMethod.ALL },
        data: new Map<string, Material[]>()
      },
      audience: {
        config: { method: RuleMethod.ALL },
        data: new Map<string, Array<TargetedPackageTypeItem>>()
      },
      titlePackage: {
        config: { method: RuleMethod.ALL },
        data: new Map<string, Array<TitlePackageItem>>()
      },
      monitoringLink: {
        config: { method: RuleMethod.ALL },
        linkType: RuleMethod.MANUAL,
        data: new Map<string, Array<MonitoringLinkType>>()
      },
      // 落地页
      landingPage: { config: { method: RuleMethod.ALL }, data: new Map() },
      // 抖音号配置
      awemeConfig: { config: { method: 'ALL_SAME' }, data: new Map() },
    },
    configurationConfig: {
      platform: Platform.BYTEDANCE
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
    version: BYTEDANCE
  };
}

async function updateTemplate(changeVal: string) {
  template.value = changeVal;
  await initCreationInfo();
  creationInfo.value.configurationConfig.template = changeVal;

  // 模板专属默认值覆盖
  if (changeVal === 'mini_program_douyin_template') {
    const campaign = creationInfo.value.configData.campaign;
    campaign.landing_type = 'MICRO_GAME';
    campaign.micro_promotion_type = 'AWEME';
    campaign.ad_type = 'ALL';
    campaign.delivery_type = 'NORMAL';
    // sDPA 单商品模式
    campaign.related_product = {
      product_setting: 'SINGLE',
      product_platform_id: '',
      product_id: '',
      unique_product_id: '',
    };
    // 投放版位：自动投放→通投智选，手动投放→首选媒体
    campaign.delivery_range.inventory_catalog =
      campaign.delivery_mode === 'PROCEDURAL' ? 'UNIVERSAL_SMART' : 'MANUAL';
    campaign.delivery_range.inventory_type = ['INVENTORY_AWEME_FEED'];
    // MICRO_GAME 项目层级不支持 native_setting.aweme_id
    campaign.native_setting = { aweme_id: '' };
    // AWEME 类型不需要 micro_app_instance_id
    campaign.micro_app_instance_id = 0;
    // 自动投放时仅支持日预算
    if (campaign.delivery_mode === 'PROCEDURAL') {
      campaign.delivery_setting.budget_mode = 'BUDGET_MODE_DAY';
    }
  }
}

function updateReuse(creation: BytedanceCreation) {
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
    if (config.monitoringLink && !(config.monitoringLink.data instanceof Map)) {
      config.monitoringLink.data = new Map(Object.entries(config.monitoringLink.data || {}));
    }
    if (config.landingPage && !(config.landingPage.data instanceof Map)) {
      config.landingPage.data = new Map(Object.entries(config.landingPage.data || {}));
    }
    if (config.awemeConfig && config.awemeConfig.data && !(config.awemeConfig.data instanceof Map)) {
      config.awemeConfig.data = new Map(Object.entries(config.awemeConfig.data || {}));
    }
  }
  creationInfo.value = creation;
  template.value = creationInfo.value.configurationConfig.template ||  'base_template';
}

const creationInfo = ref<BytedanceCreation>({
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
    campaign: {
      operation: "",
      delivery_mode: "",
      landing_type: "",
      app_promotion_type: "",
      marketing_goal: "",
      ad_type: "",
      delivery_type: "",
      name: "",
      budget_group_id: 0,
      aigc_dynamic_creative_switch: "",
      star_task_id: 0,
      star_auto_material_addition_switch: "",
      star_auto_delivery_switch: "",
      keywords: [],
      auto_extend_traffic: "",
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
      open_url_type: "",
      open_url_params: "",
      open_url_field: "",
      open_url: "",
      ulink_url_type: "",
      ulink_url: "",
      subscribe_url: "",
      asset_type: "",
      multi_asset_type: "",
      micro_promotion_type: "",
      dpa_adtype: "",
      micro_app_instance_id: 0,
      native_setting: { aweme_id: "" },
      optimize_goal: {
        asset_ids: [],
        external_action: "",
        game_addiction_id: "",
        paid_switch: 0,
        deep_external_action: ""
      },
      value_optimized_type: "",
      landing_page_stay_time: 0,
      yuntu_5a_brand_id: "",
      yuntu_5a_brand_main_industry_id: "",
      delivery_range: {
        inventory_catalog: "",
        inventory_type: [],
        union_video_type: ""
      },
      audience: {},
      delivery_setting: {
        schedule_type: "",
        start_time: "",
        end_time: "",
        schedule_time: "",
        live_duration: 0,
        filter_night_switch: "",
        deep_bid_type: "",
        bid_type: "",
        project_custom: "",
        bid: 0,
        budget_mode: "",
        budget: 0,
        pricing: "",
        cpa_bid: 0,
        deep_cpabid: 0,
        roi_goal: 0,
        layer_roi_switch: "",
        first_roi_goal: 0,
        seven_roi_goal: 0,
        budget_optimize_switch: "",
        search_continue_delivery: ""
      },
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
      }
    },
    promotion: {
      project_id: "",
      name: "",
      operation: "",
      promotion_materials: {
        local_video_material_list: [],
        local_image_material_list: [],
        video_material_list: [],
        image_material_list: [],
        title_material_list: [],
        params_type: "",
        external_url_field: "",
        external_url_params: "",
        open_url_type: "",
        open_url_field: "",
        open_url_params: "",
        product_info: {
          product_name_type: "", product_image_type: "", product_selling_point_type: "",
          product_name_fields: [], product_image_fields: [], product_selling_point_fields: [],
          titles: [], image_ids: [], selling_points: [], local_material_image_ids: []
        },
        original_video_title: "",
        playlet_series_url_list: [],
        decoration_material: { activity_id: "", image_mode: "" },
        anchor_material_list: [],
        component_material_list: [],
        external_url_material_list: [],
        mini_program_info: { app_id: "", auto: [], params: "", start_path: "", url: "", urls: [] },
        open_url: "",
        open_urls: [],
        ulink: "",
        ulink_type: "",
        web_url_material_list: [],
        blue_flow_material_recommend: "",
        carousel_material_list: [],
        trial_play_material_list: [],
        instant_play_material_list: [],
        dynamic_creative_switch: "",
        advanced_dc_settings: [],
        call_to_action_buttons: [],
        intelligent_generation: "",
        plant_grass_search_word_material: []
      },
      materials_type: "",
      promotion_related_product: [],
      native_setting: {
        aweme_setting_type: "",
        aweme_id: "",
        aweme_ids: [],
        anchor_related_type: ""
      },
      source: "",
      is_comment_disable: "",
      ad_download_status: "",
      brand_info: {
        yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
        brand_name_id: 0, cdp_brand_name: "", sub_brand_names: [], sub_brand_name_ids: []
      },
      budget_mode: "",
      budget: 0,
      bid: 0,
      cpa_bid: 0,
      deep_cpabid: 0,
      roi_goal: 0,
      first_roi_goal: 0,
      union_bid_ratio: 0,
      shop_multi_roi_goals: [],
      sevend_retention: 0,
      auto_extend_traffic: "",
      keywords: []
    },
    material: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Material[]>()
    },
    audience: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Array<TargetedPackageTypeItem>>()
    },
    titlePackage: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Array<TitlePackageItem>>()
    },
    monitoringLink: {
      config: { method: RuleMethod.ALL },
      linkType: RuleMethod.MANUAL,
      data: new Map<string, Array<MonitoringLinkType>>()
    },
    landingPage: {
      config: { method: RuleMethod.ALL },
      data: new Map()
    },
    // 抖音号配置
    awemeConfig: { config: { method: 'ALL_SAME' }, data: new Map() },
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
    packageName: "", appId: ""

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
  version: BYTEDANCE
});

// 预览区数据
const adList = ref<BytedanceCreationData[]>([]);

watch(() => creationInfo, (_) => {
  resetCreationInfo();
}, { immediate: true, deep: true });

</script>

<template>
    <Page >


      <Card class="header" title="模板选择">
        <Select
          class="w-[200px]"
          :options="BYTEDANCE_MARKETING_TYPE"
          :value="template"
          @change="updateTemplate"
        />
      </Card>

      <Card class="header">
        <ConfigurationConfig
          :rule-info="creationInfo.ruleInfo"
          :configuration-config="creationInfo.configurationConfig"
          :account-info="creationInfo.accountInfo"
          :project="creationInfo.project"
          :rule-configuration="bytedanceRuleConfiguration"
          :rule-options="bytedanceRuleOptions"
          @update:product-info="updateProject"
          @update:account-info="updateAccountInfo"
          @update:rule-info="updateRuleInfo"
          @update:reuse="updateReuse"
        />
      </Card>

      <Card class="header">
        <BytedanceBaseTemplate
          v-if="template === 'base_template'"
          :creation-info="creationInfo"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:campaign="updateCampaign"
          @update:promotion="updatePromotion"
          @update:audience-package="updateAudiencePackage"
        />
        <MarketingProductDouyinTemplate
          v-if="template === 'marketing_product_douyin_template'"
          :creation-info="creationInfo"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:campaign="updateCampaign"
          @update:promotion="updatePromotion"
          @update:audience-package="updateAudiencePackage"
          @update:landing-page="updateLandingPage"
          @update:aweme-config="updateAwemeConfig"
        />
        <MiniProgramDouyinTemplate
          v-if="template === 'mini_program_douyin_template'"
          :creation-info="creationInfo"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:campaign="updateCampaign"
          @update:promotion="updatePromotion"
          @update:audience-package="updateAudiencePackage"
          @update:landing-page="updateLandingPage"
          @update:aweme-config="updateAwemeConfig"
        />
      </Card>

      <Card class="header">
        <Function
          :account-info="creationInfo.accountInfo"
          :monitoring-link="creationInfo.configData.monitoringLink"
          :task-in-progress="taskInProgress"
          @update:monitoring-link="updateMonitoringLink"
          @gen:ad-list="genPreviewTableData"
          @save:create-strategy-group="createStrategyGroup"
          @submit:create-batch="submitCreateBatch"
          @view:task-progress="viewTaskProgress"
        />
      </Card>

      <CreateStrategyGroupModal />

      <Card class="header" title="预览区">
        <BytedancePreviewArea
          :ad-list="adList"
          :account-info="creationInfo.accountInfo"
        />
      </Card>

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
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
