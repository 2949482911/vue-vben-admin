<script setup lang="ts" name="TencentMiniGameTemplate">
// 小游戏投放模板

import type {
  TencentAdgroupData,
  TencentCampaignData,
  TencentCreation
} from "#/views/marketing/creation/tencent/tencent";
import { Col, Row } from "ant-design-vue";
import TencentCampaign from "#/views/marketing/creation/tencent/components/TencentCampaign.vue";
import type {
  AudienceConfigData,
  MaterialData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import {
  Tencent_auto_derived_creative_method_type_list,
  Tencent_configured_status,
  Tencent_creative_delivery_mode,
  Tencent_ecom_pkam_switch
} from "#/views/marketing/creation/tencent/tencent_enums";
import { markRaw } from "vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import TencentAdgroup from "#/views/marketing/creation/tencent/components/TencentAdgroup.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";


const emit = defineEmits(["update:campaign", "update:adgroup",
  "update:audiencePackage", "update:updateMaterial", "update:titlePackage"]);


const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => TencentCreation,
    default: () => {
      return {};
    }
  }
});


/**
 * update campaign
 */
function updateCampaign(campaign: TencentCampaignData) {
  emit("update:campaign", campaign);
}


/**
 * update adgroup
 */
function updateAdgroup(adgroup: TencentAdgroupData) {
  emit("update:adgroup", adgroup);
}


/**
 * 编辑定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}


/**
 * 更新素材
 */
function updateMaterial(materialData: MaterialData) {
  emit("update:updateMaterial", materialData);
}


/**
 * 编辑标题包
 * @param titlePackage 标题包
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit("update:titlePackage", titlePackage);
}


// 计划模板
const campaign: TencentCampaignData = {
  additional_product_spec: {
    product_catalog_id: "",
    product_outer_id: ""
  },
  additional_product_spec_switch: false,
  adgroup_id: 0,
  adgroup_name: "",
  adx_realtime_type: "",
  aoi_optimization_strategy: {
    aoi_id_list: [],
    aoi_optimization_strategy_enabled: false
  },
  aoi_optimization_strategy_switch: false,
  auto_acquisition_budget: 0,
  auto_acquisition_enabled: false,
  auto_derived_creative_enabled: false,
  auto_derived_creative_preference: {
    auto_derived_creative_method_type_list: ["AUTO_DERIVED_CREATIVE_METHOD_TYPE_UNKNOWN"]
  },
  auto_derived_creative_preference_switch: false,
  auto_derived_landing_page_switch: false,
  automatic_site_enabled: true,
  begin_date: "",
  bid_amount: 0,
  bid_mode: "BID_MODE_OCPM",
  bid_scene: "BID_SCENE_NORMAL_AVERAGE",
  cloud_union_spec: {
    expected_roi: 0, roi_goal: ""
  },
  cloud_union_spec_switch: false,
  configured_status: "AD_STATUS_NORMAL",
  conversion_id: "",
  cost_constraint_scene: "",
  custom_cost_cap: 0,
  custom_cost_roi_cap: 0,
  daily_budget: 200,
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
  ecom_pkam_switch: "ECOM_PKAM_SWITCH_CLOSE",
  enable_steady_exploration: false,
  end_date: "",
  exploration_strategy: "AUTOMATIC_EXPLORATION",
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
    marketing_carrier_id: "",
    marketing_carrier_name: "",
    marketing_sub_carrier_id: ""
  },
  marketing_carrier_detail_switch: false,
  marketing_carrier_type: "MARKETING_CARRIER_TYPE_WECHAT_MINI_GAME",
  marketing_goal: "MARKETING_GOAL_USER_GROWTH",
  marketing_sub_goal: "MARKETING_SUB_GOAL_MINI_GAME_NEW_CUSTOMER_GROWTH",
  material_package_id: 0,
  mpa_spec: {
    product_catalog_id: "", product_series_id: "", recommend_method_ids: []
  },
  mpa_spec_switch: false,
  optimization_goal: "OPTIMIZATIONGOAL_APP_REGISTER",
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
  search_expand_targeting_switch: "SEARCH_EXPAND_TARGETING_SWITCH_CLOSE",
  search_expansion_switch: "",
  sell_strategy_id: 0,
  short_play_pay_type: "",
  site_set: [],
  smart_bid_type: "",
  smart_cost_cap: 0,
  smart_coupon_mode: "",
  smart_targeting_mode: "SMART_TARGETING_MANUAL",
  targeting: {},
  time_series: "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
  user_action_sets: []
};

//
const campaignFormFields = [
  {
    component: "AdNameGen",
    formItemClass: "w-[400px]",
    fieldName: "adgroup_name",
    label: "名字",
    rules: "required"
  },
  {
    component: "DatePicker",
    fieldName: "begin_date",
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    label: "开始投放日期",
    rules: "required"
  },
  {
    component: "DatePicker",
    fieldName: "end_date",
    formItemClass: "w-[300px]",
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    label: "结束投放日期",
    rules: "required"
  },
  {
    component: "TimePicker",
    fieldName: "first_day_begin_time",
    label: "首日开始投放时间",
    formItemClass: "items-baseline",
    help: ""
  },

  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: "time_series",
    label: "投放时段",
    formItemClass: "items-baseline"
  },

  {
    component: "Select",
    fieldName: "configured_status",
    formItemClass: "w-[300px]",
    componentProps: {
      options: Tencent_configured_status
    },
    defaultValue: "AD_STATUS_NORMAL",
    label: "广告状态",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "bid_mode",
    formItemClass: "w-[300px]",
    componentProps: {
      options: [
        {
          label: "cpc",
          value: "BID_MODE_CPC"
        },
        {
          label: "cpm",
          value: "BID_MODE_CPM"
        },
        {
          label: "ocpc",
          value: "BID_MODE_OCPC"
        },
        {
          label: "ocpm",
          value: "BID_MODE_OCPM"
        }
      ]
    },
    label: "出价方式",
    rules: "required"
  },
  {
    component: "Switch",
    fieldName: "auto_acquisition_enabled",
    formItemClass: "w-[250px]",
    label: "一键起量"
  },
  {
    component: "InputNumber",
    fieldName: "auto_acquisition_budget",
    label: "一键起量预算",
    dependencies: {
      show: (val: any) => {
        return val.auto_acquisition_enabled;
      },
      triggerFields: ["auto_acquisition_enabled"]
    }
  },

  {
    component: "InputNumber",
    fieldName: "daily_budget",
    label: "日预算"
  },
  {
    component: "Select",
    fieldName: "ecom_pkam_switch",
    label: "一方人群跑量加强",
    componentProps: {
      options: Tencent_ecom_pkam_switch
    },
    defaultValue: "ECOM_PKAM_SWITCH_CLOSE",
    help: ""
  },
  {
    component: "Switch",
    fieldName: "auto_derived_creative_enabled",
    formItemClass: "w-[250px]",
    label: "创意增强 MAX"
  },

  {
    component: "Select",
    fieldName: "auto_derived_creative_method_type_list",
    label: "创意增强 MAX 偏好设置列表",
    defaultValue: ["AUTO_DERIVED_CREATIVE_METHOD_TYPE_UNKNOWN"],
    componentProps: {
      options: Tencent_auto_derived_creative_method_type_list,
      mode: "multiple"
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["auto_derived_creative_enabled"];
      },
      triggerFields: ["auto_derived_creative_enabled"]
    }
  }
];


// 显示标签名字
const campaignShowLabel: Record<string, string> = {
  adgroup_name: "营销单元名字",
  marketing_goal: "营销目标",
  begin_date: "开始时间",
  end_date: "结束时间",
  daily_budget: "日预算",
  bid_mode: "出价方式"
};


const adgroup: TencentAdgroupData = {
  adgroup_id: 0,
  auto_derived_program_creative_switch: false,
  click_tracking_url: "",
  configured_status: "AD_STATUS_NORMAL",
  creative_components: [],
  creative_template_id: "",
  delivery_mode: "DELIVERY_MODE_COMPONENT",
  dynamic_creative_name: "",
  dynamic_creative_type: "DYNAMIC_CREATIVE_TYPE_PROGRAM",
  impression_tracking_url: "",
  page_track_url: "",
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
  program_creative_info_switch: false,
  site_set_validate_model: ""

};


/**
 *
 */
const adgroupFormFields = [
  {
    component: "AdNameGen",
    fieldName: "dynamic_creative_name",
    label: "动态创意名称",
    rules: "required"
  },

  {
    component: "Select",
    fieldName: "delivery_mode",
    label: "投放模式",
    rules: "required",
    componentProps: {
      options: Tencent_creative_delivery_mode
    }
  },
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "auto_derived_program_creative_switch",
    label: "自动衍生",
    defaultValue: false,
    componentProps: {
      checked: false
    },
    help: "自动衍生程序化创意开关"
  },
  {
    component: "Select",
    fieldName: "configured_status",
    label: "状态",
    componentProps: {
      options: Tencent_configured_status
    },
    defaultValue: "AD_STATUS_SUSPEND"
  }
];

const adgroupShowLabel: Record<string, string> = {
  dynamic_creative_name: "动态创意名称",
  delivery_mode: "投放模式",
  configured_status: "状态"
};

defineExpose({
  campaign,
  adgroup
});

</script>

<template>
  <div class="tencent-wechat-minigame-template">
    <Row :gutter="16" class="equal-height-row">
      <Col :span="6" class="equal-height-col">
        <TencentCampaign
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :audience="creationInfo?.configData.audience"
          :account-info="creationInfo.accountInfo"
          @update:campaign="updateCampaign"
          @update:audience-package="updateAudiencePackage"
        ></TencentCampaign>
      </Col>


      <Col :span="6" class="equal-height-col">
        <TencentAdgroup
          :form-fields="adgroupFormFields"
          :adgroup-show-label="adgroupShowLabel"
          :adgroup="creationInfo?.configData.adgroup"
          @update:adgroup="updateAdgroup"
        ></TencentAdgroup>
      </Col>


      <Col :span="6" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          @update:material="updateMaterial"
        />
      </Col>


      <Col :span="6" class="equal-height-col">
        <TitleSelector
          :title-package="creationInfo.configData.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:title-package="updateTitlePackage"
        ></TitleSelector>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">
.tencent-wechat-minigame-template {
  width: 100%;
}

// 让所有列高度一致，但不强制扩容
.equal-height-row {
  display: flex;
  align-items: stretch;
}

.equal-height-col {
  display: flex;

  // 让内部组件高度自适应父容器（匹配最高的列）
  > * {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>
