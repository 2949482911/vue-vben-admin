<script setup lang="ts">
import { Page } from "@vben/common-ui";
import { Card, Select } from "ant-design-vue";
import ConfigurationConfig from "../components/configurationArea.vue";
import { ref } from "vue";
import type { TencentCreation } from "./tencent";
import { TENCENT } from "./tencent";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import type {
  AccountInfo,
  AudienceConfigData,
  Material,
  MonitoringLinkType,
  Project,
  RuleInfo
} from "#/views/marketing/creation/creation";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { Platform } from "#/constants/enums";
import { TENCENT_MARKETING_TYPE } from "#/views/marketing/creation/tencent/enums";
import TencentBaseTemplate
  from "#/views/marketing/creation/tencent/components/base/TencentBaseTemplate.vue";


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
      program_creative_info: {
        bid_mode: "", derive_version: "",
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
  platform: "",
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

        />
      </Card>

      <Card class="header">
        <Select :options="TENCENT_MARKETING_TYPE" default-value="base_template"></Select>
      </Card>

      <Card class="header">
        <TencentBaseTemplate :creation-info="creationInfo"
                             @update:audience-package="updateAudiencePackage"
        />
      </Card>
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
