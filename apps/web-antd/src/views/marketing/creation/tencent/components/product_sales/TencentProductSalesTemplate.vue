<script setup lang="ts" name="TencentProductSalesTemplate">
// 商品销售-商品库 投放模板
// 营销目的=商品销售，推广产品=商品库（外投商品），营销载体=页面跳转，落地页=微信小程序
// 对应 adgroups/add + dynamic_creatives/add 两个接口

import type {
  AudienceConfigData,
  MaterialData,
  ProductData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  TencentAdgroupData,
  TencentCampaignData,
  TencentCreation
} from "#/views/marketing/creation/tencent/tencent";

import { markRaw } from "vue";

import { Platform } from "#/constants/enums";
import AudiencePackageSelector
  from "#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import TencentAdgroup from "#/views/marketing/creation/tencent/components/TencentAdgroup.vue";
import TencentCampaign from "#/views/marketing/creation/tencent/components/TencentCampaign.vue";
import TencentProductSelector
  from "#/views/marketing/creation/tencent/components/TencentProductSelector.vue";
import {
  fieldLabelMap,
  Marketing_carrier_type,
  Tencent_auto_derived_creative_method_type_list,
  Tencent_bid_mode,
  Tencent_bid_scene,
  Tencent_configured_status,
  Tencent_cost_constraint_scene,
  Tencent_creative_delivery_mode,
  Tencent_dynamic_creative_type,
  Tencent_ecom_pkam_switch,
  Tencent_exploration_strategy,
  Tencent_marketing_goal,
  Tencent_marketing_sub_goal,
  Tencent_marketing_target_type,
  Tencent_priority_site_set,
  Tencent_search_expand_targeting_switch,
  Tencent_search_expansion_switch,
  Tencent_short_play_pay_type,
  Tencent_smart_bid_type,
  Tencent_smart_targeting_mode,
  TencentOptimization_goal,
  Tencnet_site_set
} from "#/views/marketing/creation/tencent/tencent_enums";

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => TencentCreation,
    default: () => {
      return {};
    }
  }
});

const emit = defineEmits(["update:campaign", "update:adgroup",
  "update:audiencePackage", "update:updateMaterial", "update:titlePackage", "update:product"]);


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
 * 编辑商品
 */
function updateProduct(productData: ProductData) {
  emit("update:product", productData);
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


/** 投放时段：48 * 7 位，全 1 表示全时段投放 */
const FULL_TIME_SERIES = "1".repeat(336);


/** 商品销售场景默认投放版位（站点集合直投，不开智能版位） */
const DEFAULT_SITE_SET = [
  "SITE_SET_SEARCH_SCENE",
  "SITE_SET_CHANNELS",
  "SITE_SET_TENCENT_VIDEO",
  "SITE_SET_WECHAT_PLUGIN",
  "SITE_SET_KANDIAN",
  "SITE_SET_QQ_MUSIC_GAME",
  "SITE_SET_TENCENT_NEWS",
  "SITE_SET_MOBILE_UNION",
  "SITE_SET_WECHAT"
];


// 营销单元字段：默认值统一写在表单元素上（商品销售 + 页面跳转 + 微信小程序）
const campaignFormFields = [
  {
    component: "AdNameGen",
    fieldName: "adgroup_name",
    formItemClass: "w-[400px]",
    label: "名字",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "marketing_goal",
    componentProps: {
      options: Tencent_marketing_goal
    },
    defaultValue: "MARKETING_GOAL_PRODUCT_SALES",
    formItemClass: "w-[300px]",
    label: "营销目的",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "marketing_sub_goal",
    componentProps: {
      options: Tencent_marketing_sub_goal
    },
    defaultValue: "MARKETING_SUB_GOAL_UNKNOWN",
    formItemClass: "w-[300px]",
    label: "二级营销目的"
  },
  {
    component: "Select",
    fieldName: "marketing_carrier_type",
    componentProps: {
      options: Marketing_carrier_type
    },
    defaultValue: "MARKETING_CARRIER_TYPE_JUMP_PAGE",
    formItemClass: "w-[300px]",
    label: "营销载体",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "marketing_target_type",
    componentProps: {
      options: Tencent_marketing_target_type
    },
    defaultValue: "MARKETING_TARGET_TYPE_FICTION",
    formItemClass: "w-[340px]",
    label: "商品类型",
    help: "商品库(外投商品)类型，决定商品 id 的归属"
  },
  // {
  //   component: "InputNumber",
  //   fieldName: "marketing_asset_id",
  //   formItemClass: "w-[300px]",
  //   label: "营销资产 id"
  // },
  // {
  //   component: "Input",
  //   fieldName: "marketing_asset_outer_id",
  //   label: "商品 id"
  // },
  // {
  //   component: "Input",
  //   fieldName: "marketing_asset_outer_sub_id",
  //   label: "商品子 id"
  // },
  {
    component: "Select",
    fieldName: "optimization_goal",
    componentProps: {
      options: TencentOptimization_goal,
      showSearch: true,
      optionFilterProp: "label"
    },
    defaultValue: "OPTIMIZATIONGOAL_24H_FIRSTPAY",
    formItemClass: "w-[340px]",
    label: "优化目标",
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
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    formItemClass: "w-[300px]",
    label: "结束投放日期",
    rules: "required"
  },
  {
    component: "TimePicker",
    fieldName: "first_day_begin_time",
    // antd 的时间组件只有配了 valueFormat 才接受字符串：
    // 不配的话 value 会被原样当成 dayjs 使用（dayjs.js 的 locale.format 会直接取
    // date.locale()），传 "00:00:00" 这种字符串就会抛错、整个表单渲染不出来
    componentProps: {
      format: "HH:mm:ss",
      valueFormat: "HH:mm:ss"
    },
    defaultValue: "00:00:00",
    formItemClass: "items-baseline",
    label: "首日开始投放时间"
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: "time_series",
    defaultValue: FULL_TIME_SERIES,
    formItemClass: "items-baseline",
    label: "投放时段"
  },
  {
    component: "Select",
    fieldName: "bid_mode",
    componentProps: {
      options: Tencent_bid_mode
    },
    defaultValue: "BID_MODE_OCPM",
    formItemClass: "w-[300px]",
    label: "出价方式",
    rules: "required"
  },
  {
    component: "InputNumber",
    fieldName: "bid_amount",
    label: "出价(分)",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "smart_bid_type",
    componentProps: {
      options: Tencent_smart_bid_type
    },
    defaultValue: "SMART_BID_TYPE_CUSTOM",
    formItemClass: "w-[300px]",
    label: "出价策略"
  },
  {
    component: "InputNumber",
    fieldName: "daily_budget",
    label: "日预算(分)",
    help: "0 表示不限预算"
  },
  {
    component: "Switch",
    fieldName: "automatic_site_enabled",
    defaultValue: false,
    formItemClass: "w-[250px]",
    label: "智能版位",
    help: "开启后 site_set 无需选择"
  },
  {
    component: "Select",
    fieldName: "site_set",
    componentProps: {
      options: Tencnet_site_set,
      mode: "multiple"
    },
    defaultValue: DEFAULT_SITE_SET,
    label: "投放版位",
    dependencies: {
      show: (val: any) => {
        return !val.automatic_site_enabled;
      },
      triggerFields: ["automatic_site_enabled"]
    }
  },
  {
    component: "Select",
    fieldName: "exploration_strategy",
    componentProps: {
      options: Tencent_exploration_strategy
    },
    defaultValue: "AUTOMATIC_EXPLORATION",
    formItemClass: "w-[300px]",
    label: "版位探索策略"
  },
  {
    component: "Select",
    fieldName: "priority_site_set",
    componentProps: {
      options: Tencent_priority_site_set,
      mode: "multiple"
    },
    label: "优先探索版位",
    dependencies: {
      show: (val: any) => {
        return val.exploration_strategy === "STEADY_EXPLORATION";
      },
      triggerFields: ["exploration_strategy"]
    }
  },
  {
    component: "Select",
    fieldName: "search_expand_targeting_switch",
    componentProps: {
      options: Tencent_search_expand_targeting_switch
    },
    defaultValue: "SEARCH_EXPAND_TARGETING_SWITCH_CLOSE",
    formItemClass: "w-[340px]",
    label: "搜索扩量定向"
  },
  {
    component: "Select",
    fieldName: "search_expansion_switch",
    componentProps: {
      options: Tencent_search_expansion_switch
    },
    defaultValue: "SEARCH_EXPANSION_SWITCH_OPEN",
    formItemClass: "w-[300px]",
    label: "搜索扩量"
  },
  {
    component: "Select",
    fieldName: "smart_targeting_mode",
    componentProps: {
      options: Tencent_smart_targeting_mode
    },
    defaultValue: "SMART_TARGETING_MANUAL",
    formItemClass: "w-[300px]",
    label: "智能定向"
  },
  {
    component: "Select",
    fieldName: "ecom_pkam_switch",
    componentProps: {
      options: Tencent_ecom_pkam_switch
    },
    defaultValue: "ECOM_PKAM_SWITCH_CLOSE",
    formItemClass: "w-[300px]",
    label: "一方人群跑量加强"
  },
  {
    component: "Select",
    fieldName: "cost_constraint_scene",
    componentProps: {
      options: Tencent_cost_constraint_scene
    },
    defaultValue: "COST_CONSTRAINT_SCENE_UNKNOWN",
    formItemClass: "w-[300px]",
    label: "成本控制场景"
  },
  {
    component: "Select",
    fieldName: "short_play_pay_type",
    componentProps: {
      options: Tencent_short_play_pay_type
    },
    formItemClass: "w-[300px]",
    label: "短剧付费类型"
  },
  {
    component: "InputNumber",
    fieldName: "sell_strategy_id",
    formItemClass: "w-[300px]",
    label: "售卖策略 id"
  },
  {
    component: "InputNumber",
    fieldName: "feedback_id",
    formItemClass: "w-[300px]",
    label: "反馈 id"
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
    component: "Switch",
    fieldName: "auto_derived_creative_enabled",
    formItemClass: "w-[250px]",
    label: "创意增强 MAX"
  },
  {
    component: "Select",
    fieldName: "auto_derived_creative_method_type_list",
    componentProps: {
      options: Tencent_auto_derived_creative_method_type_list,
      mode: "multiple"
    },
    defaultValue: ["AUTO_DERIVED_CREATIVE_METHOD_TYPE_UNKNOWN"],
    label: "创意增强 MAX 偏好设置列表",
    dependencies: {
      show: (val: any) => {
        return val.auto_derived_creative_enabled;
      },
      triggerFields: ["auto_derived_creative_enabled"]
    }
  },
  {
    component: "Switch",
    fieldName: "auto_derived_landing_page_switch",
    formItemClass: "w-[250px]",
    label: "自动衍生落地页"
  },
  {
    component: "Switch",
    fieldName: "flow_optimization_enabled",
    formItemClass: "w-[250px]",
    label: "流量优化"
  },
  {
    component: "Switch",
    fieldName: "live_recommend_strategy_enabled",
    formItemClass: "w-[250px]",
    label: "直播推荐策略"
  },
  {
    component: "Select",
    fieldName: "bid_scene",
    componentProps: {
      options: Tencent_bid_scene
    },
    defaultValue: "BID_SCENE_UNKNOWN",
    formItemClass: "w-[300px]",
    label: "出价场景"
  },
  {
    component: "Select",
    fieldName: "configured_status",
    componentProps: {
      options: Tencent_configured_status
    },
    defaultValue: "AD_STATUS_NORMAL",
    formItemClass: "w-[300px]",
    label: "广告状态",
    rules: "required"
  }
];


// 卡片回显字段
const campaignShowLabel: Record<string, string> = {
  adgroup_name: "营销单元名字",
  marketing_goal: "营销目的",
  marketing_carrier_type: "营销载体",
  optimization_goal: "优化目标",
  marketing_asset_outer_id: "商品 id",
  begin_date: "开始时间",
  end_date: "结束时间",
  bid_mode: "出价方式",
  bid_amount: "出价(分)",
  daily_budget: "日预算(分)"
};


// 动态创意字段：默认值统一写在表单元素上（场景化创意内联取值见 description / 小程序等字段）
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
    componentProps: {
      options: Tencent_creative_delivery_mode
    },
    defaultValue: "DELIVERY_MODE_COMPONENT",
    formItemClass: "w-[300px]",
    label: "投放模式"
  },
  {
    component: "Select",
    fieldName: "dynamic_creative_type",
    componentProps: {
      options: Tencent_dynamic_creative_type
    },
    defaultValue: "DYNAMIC_CREATIVE_TYPE_PROGRAM",
    formItemClass: "w-[300px]",
    label: "动态创意类型"
  },
  {
    component: "Textarea",
    fieldName: "description_content",
    componentProps: {
      autoSize: { minRows: 2, maxRows: 4 },
      placeholder: "创意描述文案，会作为 description 创意组件提交"
    },
    label: "创意描述"
  },
  {
    component: "Input",
    fieldName: "mini_program_id",
    label: "落地页小程序 id",
    help: "与小程序路径同时填写才会生成创意主跳转组件"
  },
  {
    component: "Input",
    fieldName: "mini_program_path",
    label: "落地页小程序路径"
  },
  {
    component: "Input",
    fieldName: "wechat_channels_username",
    label: "视频号名称",
    help: "投放含视频号版位时需要，作为品牌形象"
  },
  {
    component: "Input",
    fieldName: "creative_template_id",
    formItemClass: "w-[300px]",
    label: "创意形式 id"
  },
  {
    component: "Switch",
    fieldName: "auto_derived_program_creative_switch",
    formItemClass: "w-[250px]",
    label: "自动衍生"
  },
  {
    component: "Select",
    fieldName: "configured_status",
    componentProps: {
      options: Tencent_configured_status
    },
    defaultValue: "AD_STATUS_NORMAL",
    formItemClass: "w-[300px]",
    label: "状态"
  }
];

const adgroupShowLabel: Record<string, string> = {
  dynamic_creative_name: "动态创意名称",
  delivery_mode: "投放模式",
  dynamic_creative_type: "动态创意类型",
  mini_program_id: "落地页小程序",
  configured_status: "状态"
};
</script>

<template>
  <div class="tencent-product-sales-template">
    <div class="panes">
      <div class="pane">
        <TencentCampaign
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :field-label-map="fieldLabelMap"
          @update:campaign="updateCampaign"
        />
      </div>
      <div class="pane">
        <TencentProductSelector
          :product="creationInfo?.configData.product"
          :account-info="creationInfo.accountInfo"
          @update:product="updateProduct"
        />
      </div>
      <div class="pane">
        <AudiencePackageSelector
          :audience="creationInfo?.configData.audience"
          :account-info="creationInfo.accountInfo"
          :platform="Platform.TENCENT"
          @update:audience="updateAudiencePackage"
        />
      </div>
      <div class="pane">
        <TencentAdgroup
          :form-fields="adgroupFormFields"
          :adgroup-show-label="adgroupShowLabel"
          :adgroup="creationInfo?.configData.adgroup"
          :field-label-map="fieldLabelMap"
          @update:adgroup="updateAdgroup"
        />
      </div>
      <div class="pane">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          @update:material="updateMaterial"
        />
      </div>
      <div class="pane">
        <TitleSelector
          :title-package="creationInfo.configData.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:title-package="updateTitlePackage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tencent-product-sales-template {
  height: 100%;
}

.panes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  // 6 个面板（营销单元/商品/定向包/动态创意/素材/标题包）自动换行，两行等高
  grid-auto-rows: minmax(0, 1fr);
  gap: 16px;
  height: 100%;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  :deep(.ant-card) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  :deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  :deep(.ant-card-head),
  :deep(.ant-card-actions) {
    flex: none;
  }
}
</style>
