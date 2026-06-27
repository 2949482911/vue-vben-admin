<script setup lang="ts">
import { Page, useVbenModal } from "@vben/common-ui";
import { Card, message, Select } from "ant-design-vue";
import ConfigurationConfig from "../components/configurationArea.vue";
import { ref, watch } from "vue";
import type {
  TencentAdgroupData,
  TencentCampaignData,
  TencentCreation,
  TencentCreationData
} from "./tencent";
import {getPreviewTableData} from './tencent';
import { TENCENT } from "./tencent";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import type {
  AccountInfo,
  AudienceConfigData,
  Material, MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType,
  Project,
  RuleInfo,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { Platform } from "#/constants/enums";
import { TENCENT_MARKETING_TYPE } from "#/views/marketing/creation/tencent/enums";
import TencentBaseTemplate
  from "#/views/marketing/creation/tencent/components/base/TencentBaseTemplate.vue";
import Function from "#/views/marketing/creation/components/Function.vue";
import CreateStrategyGroup from "#/views/marketing/creation/components/createStrategyGroup.vue";

const adList = ref<Array<TencentCreationData>>([]);
// 策略组
const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  }
});

import TencentPreviewArea
  from "#/views/marketing/creation/tencent/components/TencentPreviewArea.vue";

/**
 * 更新账户信息
 * @param accountInfo 账户信息
 */
function updateAccountInfo(accountInfo: Array<AccountInfo>) {
  creationInfo.value.accountInfo = accountInfo;
}

/**
 * 更新产品信息
 * @param project 产品信息
 */
function updateProject(project: Project) {
  creationInfo.value.project = project;
}

/**
 * 更新规则信息
 */
function updateRuleInfo(ruleInfo: RuleInfo) {
  creationInfo.value.ruleInfo = ruleInfo;
}


/**
 * 更新定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  creationInfo.value.configData.audience = audienceConfigData;
}


/**
 * 更新监测链接
 */
function updateMonitoringLink(monitoringLink: MonitoringLinkConfigData) {
  creationInfo.value.configData.monitoringLink = monitoringLink;
}


/**
 * 更新推广计划
 */
function updateCampaign(campaign: TencentCampaignData) {
  creationInfo.value.configData.campaign = campaign;
}

/**
 * 推广单元
 * @param adgroup
 */
function updateAdgroup(adgroup: TencentAdgroupData) {
  creationInfo.value.configData.adgroup = adgroup;
}


/**
 * 素材
 * @param material
 */
function updateMaterial(material: MaterialData) {
  creationInfo.value.configData.material = material;
}


/**
 * 更新标题包
 * @param titlePackage
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  creationInfo.value.configData.titlePackage = titlePackage;
}


/**
 * 预览数据生成
 */
function genPreviewTableData() {
  adList.value = getPreviewTableData(creationInfo.value)
}





function submitCreateBatch() {
  // if (adList.value.length < 0) {
  //   message.error("请求配置预览区数据");
  //   return;
  // }
  // submitApi.open();
}


/**
 * 保存策略组
 */
function createStrategyGroup() {
  createStrategyGroupApi.setData(creationInfo.value);
  createStrategyGroupApi.open();
}

/**
 * 模板选择
 */
const template = ref<string>("base_template");

function updateTemplate(changeVal: string) {
  template.value = changeVal;
}

/**
 * 复用策略
 * @param tencentCreation
 */
function updateReuse(tencentCreation: TencentCreation) {
  if (tencentCreation.configData) {
    const config = tencentCreation.configData;
    // 1. 恢复 material.data
    if (config.material && !(config.material.data instanceof Map)) {
      config.material.data = new Map(Object.entries(config.material.data || {}));
    }

    // 2. 恢复 audience.data
    if (config.audience && !(config.audience.data instanceof Map)) {
      config.audience.data = new Map(Object.entries(config.audience.data || {}));
    }

    // 3. 恢复 titlePackage.data
    if (config.titlePackage && !(config.titlePackage.data instanceof Map)) {
      config.titlePackage.data = new Map(Object.entries(config.titlePackage.data || {}));
    }

    // 4. 恢复 pageView.data
    // if (config.pageView && !(config.pageView.data instanceof Map)) {
    //   config.pageView.data = new Map(Object.entries(config.pageView.data || {}));
    // }

    // 5. 恢复 monitoringLink.data
    if (config.monitoringLink && !(config.monitoringLink.data instanceof Map)) {
      config.monitoringLink.data = new Map(Object.entries(config.monitoringLink.data || {}));
    }
  }
  creationInfo.value = tencentCreation;
}


const creationInfo = ref<TencentCreation>({
  // 待取消分配
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
      adgroup_id: 0,
      additional_product_spec: {
        product_catalog_id: "",
        product_outer_id: ""
      },
      adgroup_name: "",
      adx_realtime_type: "",
      aoi_optimization_strategy: {
        aoi_id_list: [], aoi_optimization_strategy_enabled: false
      },
      auto_acquisition_budget: 0,
      auto_acquisition_enabled: false,
      auto_derived_creative_enabled: false,
      auto_derived_creative_preference: {
        auto_derived_creative_method_type_list: []
      },
      auto_derived_landing_page_switch: false,
      automatic_site_enabled: false,
      begin_date: "",
      bid_amount: 0,
      bid_mode: "",
      bid_scene: "",
      cloud_union_spec: {
        expected_roi: 0, roi_goal: ""
      },
      configured_status: "",
      conversion_id: "",
      cost_constraint_scene: "",
      custom_cost_cap: 0,
      custom_cost_roi_cap: 0,
      daily_budget: 0,
      dca_spec: {
        recommend_method_ids: [], set_id: ""
      },
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
      marketing_carrier_detail: {
        marketing_carrier_id: "", marketing_carrier_name: "", marketing_sub_carrier_id: ""
      },
      marketing_carrier_type: "",
      marketing_goal: "",
      marketing_sub_goal: "",
      material_package_id: 0,
      mpa_spec: {
        product_catalog_id: "",
        product_series_id: "",
        recommend_method_ids: []
      },
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
    },
    adgroup: {
      adgroup_id: 0,
      auto_derived_program_creative_switch: false,
      click_tracking_url: "",
      configured_status: "",
      creative_components: [],
      creative_template_id: "",
      delivery_mode: "",
      dynamic_creative_name: "",
      dynamic_creative_type: "",
      impression_tracking_url: "",
      page_track_url: "",
      program_creative_info_switch: false,
      program_creative_info: {
        bid_mode: "",
        derive_version: "",
        material_derive_id: 0,
        material_derive_info: {
          derive_data_list: [],
          original_adcreative_template_id_list: [],
          original_cover_image_id: "",
          original_material_id_list: []
        }

      },
      site_set_validate_model: ""
    },
    material: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Material[]>()
    },
    audience: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<TargetedPackageTypeItem>>()
    },
    titlePackage: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<TitlePackageItem>>()
    },
    monitoringLink: {
      config: {
        method: RuleMethod.ALL
      },
      linkType: RuleMethod.MANUAL,
      data: new Map<string, Array<MonitoringLinkType>>()
    }
  },
  configurationConfig: {
    platform: Platform.TENCENT
  },
  platform: Platform.TENCENT,
  project: {
    projectId: "",
    projectName: "",
    icon: "",
    packageName: ""
  },
  ruleInfo: {
    projectRuleKey: RuleKey.TARGET,
    projectCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adGroupCount: 1,
    adRuleKey: RuleKey.CREATIVE,
    adCount: 1,
    creativeRuleKey: "creative_group",
    creativeCount: 1
  },
  version: TENCENT
});



// 监听数据变化
watch(() => creationInfo, (_) => {
  resetCreationInfo();
}, { immediate: true, deep: true });



function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn("配置已更新,预览区已重置");
  }
}

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
          @update:accountInfo="updateAccountInfo"
          @update:productInfo="updateProject"
          @update:ruleInfo="updateRuleInfo"
          @update:reuse="updateReuse"
        />
      </Card>

      <Card class="header">
        <Select class='w-[200px]' :options="TENCENT_MARKETING_TYPE" :value="template"
                @change="updateTemplate"></Select>
      </Card>

      <Card class="header">
        <TencentBaseTemplate
          v-if="template === 'base_template'"
          :creation-info="creationInfo"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:campaign="updateCampaign"
          @update:adgroup="updateAdgroup"
          @update:audience-package="updateAudiencePackage"
        />
      </Card>

      <!--监测链接组-->
      <Card class="header">
        <Function
          :accountInfo="creationInfo.accountInfo"
          :monitoring-link="creationInfo.configData.monitoringLink"
          @update:monitoring-link="updateMonitoringLink"
          @save:create-strategy-group="createStrategyGroup"
          @gen:ad-list="genPreviewTableData"
          @submit:create-batch="submitCreateBatch"
        />
      </Card>


      <Card title="预览区" class="header">
        <TencentPreviewArea :ad-list="adList" :account-info="creationInfo.accountInfo"></TencentPreviewArea>
      </Card>

      <CreateStrategyGroupModal />
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
