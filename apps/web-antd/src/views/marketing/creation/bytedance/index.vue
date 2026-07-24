<script setup lang="ts">
import { Page, useVbenModal } from "@vben/common-ui";
import { Card, message, Select } from "ant-design-vue";
import ConfigurationConfig from "../components/configurationArea.vue";
import { ref, watch } from "vue";
import type { BytedanceCampaignData, BytedanceCreation, BytedanceCreationData, BytedancePromotionData } from "./bytedance";
import { BYTEDANCE } from "./bytedance";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
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
import Function from "#/views/marketing/creation/components/Function.vue";
import CreateStrategyGroup from "#/views/marketing/creation/components/createStrategyGroup.vue";
import Submit from "#/views/marketing/creation/components/submit/SubmitModal.vue";


// 提交弹窗
const [SubmitModal, submitApi] = useVbenModal({
  connectedComponent: Submit,
});


/**
 * 提交
 */
function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error("请先配置预览区数据");
    return;
  }
  console.log(adList.value);
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
  console.log(monitoringLink);
  creationInfo.value.configData.monitoringLink = monitoringLink;
  console.log(creationInfo.value.configData.monitoringLink);
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

function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn("配置已更新,预览区已重置");
  }
}


/**
 * gen ad list
 */
function genPreviewTableData() {
  adList.value = getPreviewTableData(creationInfo.value);
}



function createStrategyGroup() {
  console.log(creationInfo.value);
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
        operation: "ENABLE",
        delivery_mode: "MANUAL",
        landing_type: "APP",
        app_promotion_type: "DOWNLOAD",
        marketing_goal: "VIDEO_AND_IMAGE",
        ad_type: "ALL",
        delivery_type: "NORMAL",
        name: "",
        budget_group_id: 0,
        aigc_dynamic_creative_switch: false,
        star_task_id: 0,
        star_auto_material_addition_switch: "OFF",
        star_auto_delivery_switch: "OFF",
        keywords: [],
        auto_extend_traffic: "OFF",
        related_product: {
          product_setting: "NO_MAP",
          product_platform_id: "",
          product_id: "",
          unique_product_id: ""
        },
        download_url: "",
        app_name: "",
        download_type: "DOWNLOAD_URL",
        download_mode: "DEFAULT",
        quick_app_id: "",
        launch_type: "DIRECT_OPEN",
        promotion_type: "LANDING_PAGE_LINK",
        open_url_type: "NONE",
        open_url_params: "",
        open_url_field: "",
        open_url: "",
        ulink_url_type: "UNIVERSAL_LINK",
        ulink_url: "",
        subscribe_url: "",
        asset_type: "ORANGE",
        multi_asset_type: "",
        micro_promotion_type: "",
        dpa_adtype: "DPA_LINK",
        micro_app_instance_id: 0,
        native_setting: { aweme_id: "" },
        optimize_goal: {
          asset_ids: [],
          external_action: "",
          game_addiction_id: "",
          paid_switch: 2,
          deep_external_action: ""
        },
        value_optimized_type: "OFF",
        landing_page_stay_time: 0,
        yuntu_5a_brand_id: "",
        yuntu_5a_brand_main_industry_id: "",
        delivery_range: {
          inventory_catalog: "MANUAL",
          inventory_type: [],
          union_video_type: "ORIGINAL_VIDEO"
        },
        audience: {},
        delivery_setting: {
          schedule_type: "SCHEDULE_FROM_NOW",
          start_time: "",
          end_time: "",
          schedule_time: "",
          live_duration: 0,
          filter_night_switch: "OFF",
          deep_bid_type: "DEEP_BID_DEFAULT",
          bid_type: "CUSTOM",
          project_custom: "OFF",
          bid: 0,
          budget_mode: "BUDGET_MODE_INFINITE",
          budget: 0,
          pricing: "PRICING_OCPM",
          cpa_bid: 0,
          deep_cpabid: 0,
          roi_goal: 0,
          layer_roi_switch: "OFF",
          first_roi_goal: 0,
          seven_roi_goal: 0,
          budget_optimize_switch: "OFF",
          search_continue_delivery: "OFF"
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
          send_type: "SERVER_SEND"
        }
      },
      promotion: {
        project_id: "",
        name: "",
        operation: "ENABLE",
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
            titles: [], image_ids: [], selling_points: []
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
          anchor_related_type: "OFF"
        },
        source: "",
        is_comment_disable: "OFF",
        ad_download_status: "OFF",
        brand_info: {
          yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
          brand_name_id: 0, cdp_brand_name: "", sub_brand_names: [], sub_brand_name_ids: []
        },
        budget_mode: "BUDGET_MODE_DAY",
        budget: 0,
        bid: 0,
        cpa_bid: 0,
        deep_cpabid: 0,
        roi_goal: 0,
        first_roi_goal: 0,
        union_bid_ratio: 0,
        shop_multi_roi_goals: [],
        sevend_retention: 0,
        auto_extend_traffic: "OFF",
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
      operation: "ENABLE",
      delivery_mode: "MANUAL",
      landing_type: "APP",
      app_promotion_type: "DOWNLOAD",
      marketing_goal: "VIDEO_AND_IMAGE",
      ad_type: "ALL",
      delivery_type: "NORMAL",
      name: "",
      budget_group_id: 0,
      aigc_dynamic_creative_switch: false,
      star_task_id: 0,
      star_auto_material_addition_switch: "OFF",
      star_auto_delivery_switch: "OFF",
      keywords: [],
      auto_extend_traffic: "OFF",
      related_product: {
        product_setting: "NO_MAP",
        product_platform_id: "",
        product_id: "",
        unique_product_id: ""
      },
      download_url: "",
      app_name: "",
      download_type: "DOWNLOAD_URL",
      download_mode: "DEFAULT",
      quick_app_id: "",
      launch_type: "DIRECT_OPEN",
      promotion_type: "LANDING_PAGE_LINK",
      open_url_type: "NONE",
      open_url_params: "",
      open_url_field: "",
      open_url: "",
      ulink_url_type: "UNIVERSAL_LINK",
      ulink_url: "",
      subscribe_url: "",
      asset_type: "ORANGE",
      multi_asset_type: "",
      micro_promotion_type: "",
      dpa_adtype: "DPA_LINK",
      micro_app_instance_id: 0,
      native_setting: { aweme_id: "" },
      optimize_goal: {
        asset_ids: [],
        external_action: "",
        game_addiction_id: "",
        paid_switch: 2,
        deep_external_action: ""
      },
      value_optimized_type: "OFF",
      landing_page_stay_time: 0,
      yuntu_5a_brand_id: "",
      yuntu_5a_brand_main_industry_id: "",
      delivery_range: {
        inventory_catalog: "MANUAL",
        inventory_type: [],
        union_video_type: "ORIGINAL_VIDEO"
      },
      audience: {},
      delivery_setting: {
        schedule_type: "SCHEDULE_FROM_NOW",
        start_time: "",
        end_time: "",
        schedule_time: "",
        live_duration: 0,
        filter_night_switch: "OFF",
        deep_bid_type: "DEEP_BID_DEFAULT",
        bid_type: "CUSTOM",
        project_custom: "OFF",
        bid: 0,
        budget_mode: "BUDGET_MODE_INFINITE",
        budget: 0,
        pricing: "PRICING_OCPM",
        cpa_bid: 0,
        deep_cpabid: 0,
        roi_goal: 0,
        layer_roi_switch: "OFF",
        first_roi_goal: 0,
        seven_roi_goal: 0,
        budget_optimize_switch: "OFF",
        search_continue_delivery: "OFF"
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
        send_type: "SERVER_SEND"
      }
    },
    promotion: {
      project_id: "",
      name: "",
      operation: "ENABLE",
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
          titles: [], image_ids: [], selling_points: []
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
        anchor_related_type: "OFF"
      },
      source: "",
      is_comment_disable: "OFF",
      ad_download_status: "OFF",
      brand_info: {
        yuntu_category_id: 0, cdp_brand_id: 0, ecom_brand_id: 0,
        brand_name_id: 0, cdp_brand_name: "", sub_brand_names: [], sub_brand_name_ids: []
      },
      budget_mode: "BUDGET_MODE_DAY",
      budget: 0,
      bid: 0,
      cpa_bid: 0,
      deep_cpabid: 0,
      roi_goal: 0,
      first_roi_goal: 0,
      union_bid_ratio: 0,
      shop_multi_roi_goals: [],
      sevend_retention: 0,
      auto_extend_traffic: "OFF",
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
  <div>
    <Page auto-content-height>
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
        <Select
          class="w-[200px]"
          :options="BYTEDANCE_MARKETING_TYPE"
          :value="template"
          @change="updateTemplate"
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
        />
      </Card>

      <Card class="header">
        <Function
          :account-info="creationInfo.accountInfo"
          :monitoring-link="creationInfo.configData.monitoringLink"
          @update:monitoring-link="updateMonitoringLink"
          @gen:ad-list="genPreviewTableData"
          @save:create-strategy-group="createStrategyGroup"
          @submit:create-batch="submitCreateBatch"
        />
      </Card>

      <CreateStrategyGroupModal />

      <Card class="header" title="预览区">
        <BytedancePreviewArea
          :ad-list="adList"
          :account-info="creationInfo.accountInfo"
        />
      </Card>

      <SubmitModal :creation-info="creationInfo" :ad-list="adList" />
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
