<script setup lang="ts" name="BytedanceBaseTemplate">
import { Col, Row } from "ant-design-vue";

import BytedanceCampaign from "../BytedanceCampaign.vue";
import BytedancePromotion from "../BytedancePromotion.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import type {
  AudienceConfigData,
  MaterialData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  BytedanceCampaignData,
  BytedanceCreation,
  BytedancePromotionData
} from "#/views/marketing/creation/bytedance/bytedance";
import {
  BytedanceCampaign_ad_type,
  BytedanceCampaign_app_promotion_type,
  BytedanceCampaign_asset_type,
  BytedanceCampaign_auto_extend_traffic,
  BytedanceCampaign_bid_type,
  BytedanceCampaign_budget_optimize_switch,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_delivery_type,
  BytedanceCampaign_download_mode,
  BytedanceCampaign_download_type,
  BytedanceCampaign_dpa_adtype,
  BytedanceCampaign_filter_night_switch,
  BytedanceCampaign_inventory_catalog,
  BytedanceCampaign_inventory_type,
  BytedanceCampaign_landing_page_stay_time,
  BytedanceCampaign_landing_type,
  BytedanceCampaign_launch_type,
  BytedanceCampaign_layer_roi_switch,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_micro_promotion_type,
  BytedanceCampaign_multi_asset_type,
  BytedanceCampaign_open_url_type,
  BytedanceCampaign_paid_switch,
  BytedanceCampaign_pricing,
  BytedanceCampaign_product_setting,
  BytedanceCampaign_project_custom,
  BytedanceCampaign_promotion_type,
  BytedanceCampaign_schedule_type,
  BytedanceCampaign_search_continue_delivery,
  BytedanceCampaign_send_type,
  BytedanceCampaign_star_auto_delivery_switch,
  BytedanceCampaign_star_auto_material_addition_switch,
  BytedanceCampaign_ulink_url_type,
  BytedanceCampaign_union_video_type,
  BytedanceCampaign_value_optimized_type,
  BytedanceCampgin_budget_mode,
  BytedancePromotion_ad_download_status,
  BytedancePromotion_anchor_related_type,
  BytedancePromotion_auto_extend_traffic,
  BytedancePromotion_budget_mode,
  BytedancePromotion_is_comment_disable,
  CampaignOperation,
  DeliveryMode,
  fieldLabelMap
} from "#/views/marketing/creation/bytedance/enums";

const emit = defineEmits([
  "update:campaign",
  "update:promotion",
  "update:audiencePackage",
  "update:updateMaterial",
  "update:titlePackage"
]);

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => BytedanceCreation,
    default: () => ({})
  }
});

function updateCampaign(campaign: BytedanceCampaignData) {
  emit("update:campaign", campaign);
}

function updatePromotion(promotion: BytedancePromotionData) {
  emit("update:promotion", promotion);
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}

function updateMaterial(materialData: MaterialData) {
  emit("update:updateMaterial", materialData);
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit("update:titlePackage", titlePackage);
}

// ==================== 项目表单字段 ====================
const campaignFormFields = [
  { component: "AdNameGen", fieldName: "name", label: "项目名称", rules: "required" },
  {
    component: "Select",
    fieldName: "operation",
    componentProps: { options: CampaignOperation },
    label: "启停状态",
    defaultValue: "ENABLE"
  },
  {
    component: "Select",
    fieldName: "delivery_mode",
    componentProps: { options: DeliveryMode },
    label: "投放模式",
    defaultValue: "MANUAL"
  },
  {
    component: "Select",
    fieldName: "landing_type",
    componentProps: { options: BytedanceCampaign_landing_type },
    label: "营销目的",
    rules: "required",
    defaultValue: "APP"
  },
  {
    component: "Select",
    fieldName: "app_promotion_type",
    componentProps: { options: BytedanceCampaign_app_promotion_type },
    label: "子目标",
    defaultValue: "DOWNLOAD",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["landing_type"] === "APP";
      },
      triggerFields: ["landing_type"]
    }
  },
  {
    component: "Select",
    fieldName: "marketing_goal",
    componentProps: { options: BytedanceCampaign_marketing_goal },
    label: "营销场景",
    defaultValue: "VIDEO_AND_IMAGE"
  },
  {
    component: "Select", fieldName: "ad_type",
    componentProps: { options: BytedanceCampaign_ad_type }, label: "广告类型", defaultValue: "ALL",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "delivery_type",
    componentProps: { options: BytedanceCampaign_delivery_type },
    label: "投放类型",
    defaultValue: "NORMAL",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "budget_group_id", label: "预算组ID", defaultValue: 0,
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Switch", formItemClass: "w-[250px]", fieldName: "aigc_dynamic_creative_switch",
    label: "AIGC动态创意开关", defaultValue: false,
    help: "该功能仅支持行业白名单客户使用，如需使用可咨询对接销售/运营"
  },
  {
    component: "Input", fieldName: "star_task_id", label: "星图任务ID", defaultValue: 0,
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "star_auto_material_addition_switch",
    componentProps: { options: BytedanceCampaign_star_auto_material_addition_switch },
    label: "星图自动素材补充",
    defaultValue: "OFF",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "star_auto_delivery_switch",
    componentProps: { options: BytedanceCampaign_star_auto_delivery_switch },
    label: "星图自动投放",
    defaultValue: "OFF",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },

  // 关键词（搜索流量）
  {
    component: "Select",
    fieldName: "auto_extend_traffic",
    componentProps: { options: BytedanceCampaign_auto_extend_traffic },
    label: "搜索流量自动扩量",
    defaultValue: "OFF",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },

  // 商品(related_product 平铺)
  {
    component: "Select", fieldName: "related_product_setting", componentProps: {
      options: BytedanceCampaign_product_setting
    }, label: "商品设置", defaultValue: "NO_MAP"
  },
  // 新增商品选择组件
  {
    component: "Input",
    fieldName: "product",
    label: "选择商品",
    componentProps: () => ({}),
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["related_product_setting"] === "SINGLE";
      },
      triggerFields: ["related_product_setting"]
    }
  },
  {
    component: "Input", fieldName: "related_product_platform_id", label: "商品平台ID",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "related_product_id", label: "商品ID",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "related_product_unique_id", label: "商品唯一ID",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },

  // 营销产品与投放载体 投放载体类型
  {
    component: "Select",
    fieldName: "advertiser_body",
    label: "投放载体",
    componentProps: {
      options: [
        {
          label: "抖音号",
          value: ""
        }
      ]
    }
  },

  {
    component: "Input", fieldName: "download_url", label: "下载链接", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "app_name", label: "应用名称", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "download_type",
    componentProps: { options: BytedanceCampaign_download_type },
    label: "下载类型",
    defaultValue: "DOWNLOAD_URL",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "download_mode",
    componentProps: { options: BytedanceCampaign_download_mode },
    label: "下载模式",
    defaultValue: "DEFAULT",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "quick_app_id", label: "快应用ID", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "launch_type",
    componentProps: { options: BytedanceCampaign_launch_type },
    label: "调起类型",
    defaultValue: "DIRECT_OPEN",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "promotion_type",
    componentProps: { options: BytedanceCampaign_promotion_type },
    label: "推广类型",
    defaultValue: "LANDING_PAGE_LINK",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "open_url_type",
    componentProps: { options: BytedanceCampaign_open_url_type },
    label: "直达链接类型",
    defaultValue: "NONE",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "open_url_params", label: "直达链接参数", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "open_url_field", label: "直达链接字段", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "open_url", label: "直达链接", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "ulink_url_type",
    componentProps: { options: BytedanceCampaign_ulink_url_type },
    label: "ulink类型",
    defaultValue: "UNIVERSAL_LINK",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "ulink_url", label: "ulink链接", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "subscribe_url", label: "预约链接", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "asset_type",
    componentProps: { options: BytedanceCampaign_asset_type },
    label: "资产类型",
    defaultValue: "ORANGE",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "multi_asset_type",
    componentProps: { options: BytedanceCampaign_multi_asset_type },
    label: "多资产类型",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "micro_promotion_type",
    componentProps: { options: BytedanceCampaign_micro_promotion_type },
    label: "小程序类型",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "dpa_adtype",
    componentProps: { options: BytedanceCampaign_dpa_adtype },
    label: "DPA广告类型",
    defaultValue: "DPA_LINK",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "micro_app_instance_id", label: "小程序实例ID", dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },

  // native_setting 平铺 抖音号投放
  {
    component: "Input", fieldName: "native_setting_aweme_id", label: "抖音号ID",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["advertiser_body"] === "douyin";
      },
      triggerFields: ["advertiser_body"]
    }
  },

  // 优化目标(optimize_goal 平铺)
  {
    component: "Select",
    fieldName: "optimize_goal_asset_ids",
    componentProps: { options: [], mode: "multiple", placeholder: "请选择资产ID" },
    label: "资产ID"
  },
  { component: "Input", fieldName: "optimize_goal_external_action", label: "优化目标" },
  { component: "Input", fieldName: "optimize_goal_game_addiction_id", label: "游戏防沉迷ID" },
  {
    component: "Select",
    fieldName: "optimize_goal_paid_switch",
    componentProps: { options: BytedanceCampaign_paid_switch },
    label: "付费开关",
    defaultValue: 2
  },
  { component: "Input", fieldName: "optimize_goal_deep_external_action", label: "深度优化目标" },
  {
    component: "Select",
    fieldName: "value_optimized_type",
    componentProps: { options: BytedanceCampaign_value_optimized_type },
    label: "价值优选",
    defaultValue: "OFF"
  },
  {
    component: "Select",
    fieldName: "landing_page_stay_time",
    componentProps: { options: BytedanceCampaign_landing_page_stay_time },
    label: "落地页停留时长",
    defaultValue: 0
  },
  { component: "Input", fieldName: "yuntu_5a_brand_id", label: "云图5A品牌ID" },
  { component: "Input", fieldName: "yuntu_5a_brand_main_industry_id", label: "云图主行业ID" },

  // 投放版位(delivery_range 平铺)
  {
    component: "Select",
    fieldName: "delivery_range_inventory_catalog",
    componentProps: { options: BytedanceCampaign_inventory_catalog },
    label: "版位目录",
    defaultValue: "MANUAL"
  },
  {
    component: "Select",
    fieldName: "delivery_range_inventory_type",
    componentProps: { options: BytedanceCampaign_inventory_type, mode: "multiple" },
    label: "版位类型"
  },
  {
    component: "Select",
    fieldName: "delivery_range_union_video_type",
    componentProps: { options: BytedanceCampaign_union_video_type },
    label: "穿山甲视频类型",
    defaultValue: "ORIGINAL_VIDEO"
  },

  // 排期、预算、出价(delivery_setting 平铺)
  {
    component: "Select",
    fieldName: "delivery_setting_schedule_type",
    componentProps: { options: BytedanceCampaign_schedule_type },
    label: "投放时间",
    defaultValue: "SCHEDULE_FROM_NOW"
  },
  {
    component: "DatePicker",
    fieldName: "delivery_setting_start_time",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    label: "开始时间",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["delivery_setting_schedule_type"] === "SCHEDULE_START_END";
      },
      triggerFields: ["*"]
    }
  },
  {
    component: "DatePicker",
    fieldName: "delivery_setting_end_time",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    label: "结束时间",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["delivery_setting_schedule_type"] === "SCHEDULE_START_END";
      },
      triggerFields: ["*"]
    }
  },
  { component: "Input", fieldName: "delivery_setting_schedule_time", label: "投放时段" },
  {
    component: "Input",
    fieldName: "delivery_setting_live_duration",
    label: "直播时长(分钟)",
    defaultValue: 0,
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "delivery_setting_filter_night_switch",
    componentProps: { options: BytedanceCampaign_filter_night_switch },
    label: "夜间过滤",
    defaultValue: "OFF"
  },
  {
    component: "Select",
    fieldName: "delivery_setting_deep_bid_type",
    componentProps: { options: BytedanceCampaign_deep_bid_type },
    label: "深度出价方式",
    defaultValue: "DEEP_BID_DEFAULT"
  },
  {
    component: "Select",
    fieldName: "delivery_setting_bid_type",
    componentProps: { options: BytedanceCampaign_bid_type },
    label: "竞价策略",
    defaultValue: "CUSTOM"
  },
  {
    component: "Select",
    fieldName: "delivery_setting_project_custom",
    componentProps: { options: BytedanceCampaign_project_custom },
    label: "项目自定义",
    defaultValue: "OFF"
  },
  { component: "Input", fieldName: "delivery_setting_bid", label: "出价(分)", defaultValue: 0 },
  {
    component: "Select",
    fieldName: "delivery_setting_budget_mode",
    componentProps: { options: BytedanceCampgin_budget_mode },
    label: "预算模式",
    defaultValue: "BUDGET_MODE_INFINITE"
  },
  { component: "Input", fieldName: "delivery_setting_budget", label: "预算(分)", defaultValue: 0 },
  {
    component: "Select",
    fieldName: "delivery_setting_pricing",
    componentProps: { options: BytedanceCampaign_pricing },
    label: "计费方式",
    defaultValue: "PRICING_OCPM"
  },
  { component: "Input", fieldName: "delivery_setting_cpa_bid", label: "CPA出价", defaultValue: 0 },
  {
    component: "Input",
    fieldName: "delivery_setting_deep_cpabid",
    label: "深度CPA出价",
    defaultValue: 0
  },
  { component: "Input", fieldName: "delivery_setting_roi_goal", label: "ROI目标", defaultValue: 0 },
  {
    component: "Select",
    fieldName: "delivery_setting_layer_roi_switch",
    componentProps: { options: BytedanceCampaign_layer_roi_switch },
    label: "多级ROI",
    defaultValue: "OFF"
  },
  {
    component: "Input",
    fieldName: "delivery_setting_first_roi_goal",
    label: "首日ROI目标",
    defaultValue: 0
  },
  {
    component: "Input",
    fieldName: "delivery_setting_seven_roi_goal",
    label: "7日ROI目标",
    defaultValue: 0
  },
  {
    component: "Select",
    fieldName: "delivery_setting_budget_optimize_switch",
    componentProps: { options: BytedanceCampaign_budget_optimize_switch },
    label: "预算优化",
    defaultValue: "OFF"
  },
  {
    component: "Select",
    fieldName: "delivery_setting_search_continue_delivery",
    componentProps: { options: BytedanceCampaign_search_continue_delivery },
    label: "搜索余额投放",
    defaultValue: "OFF"
  },

  // 监测链接(track_url_setting 平铺)
  { component: "Input", fieldName: "track_url_type", label: "监测链接类型" },
  { component: "Input", fieldName: "track_url_group_id", label: "监测链接组ID" },
  {
    component: "Select",
    fieldName: "track_url",
    componentProps: { options: [], mode: "tags", placeholder: "请输入展示监测链接" },
    label: "展示监测链接"
  },
  {
    component: "Select",
    fieldName: "action_track_url",
    componentProps: { options: [], mode: "tags", placeholder: "请输入点击监测链接" },
    label: "点击监测链接"
  },
  {
    component: "Select",
    fieldName: "active_track_url",
    componentProps: { options: [], mode: "tags", placeholder: "请输入激活监测链接" },
    label: "激活监测链接"
  },
  {
    component: "Select",
    fieldName: "video_play_effective_track_url",
    componentProps: { options: [], mode: "tags", placeholder: "请输入有效播放监测链接" },
    label: "有效播放监测链接"
  },
  {
    component: "Select",
    fieldName: "video_play_done_track_url",
    componentProps: { options: [], mode: "tags", placeholder: "请输入播放完成监测链接" },
    label: "播放完成监测链接"
  },
  {
    component: "Select",
    fieldName: "video_play_first_track_url",
    componentProps: { options: [], mode: "tags", placeholder: "请输入开始播放监测链接" },
    label: "开始播放监测链接"
  },
  {
    component: "Select",
    fieldName: "send_type",
    componentProps: { options: BytedanceCampaign_send_type },
    label: "发送类型",
    defaultValue: "SERVER_SEND"
  }
];

const campaignShowLabel: Record<string, string> = {
  name: "项目名称",
  landing_type: "推广目的",
  marketing_goal: "营销场景",
  ad_type: "广告类型",
  delivery_type: "投放类型",
  asset_type: "资产类型"
};

// ==================== 广告表单字段 ====================
const promotionFormFields = [
  { component: "AdNameGen", fieldName: "name", label: "广告名称", rules: "required" },
  {
    component: "Select",
    fieldName: "operation",
    componentProps: { options: CampaignOperation },
    label: "启停状态",
    defaultValue: "ENABLE"
  },
  { component: "Input", fieldName: "project_id", label: "项目ID" },

  // 素材类型
  { component: "Input", fieldName: "materials_type", label: "素材类型" },

  // 原生单元设置(native_setting 平铺)
  { component: "Input", fieldName: "native_setting_aweme_setting_type", label: "抖音号设置类型" },
  { component: "Input", fieldName: "native_setting_aweme_id", label: "抖音号ID" },
  {
    component: "Select",
    fieldName: "native_setting_aweme_ids",
    componentProps: { options: [], mode: "multiple", placeholder: "请选择抖音号ID列表" },
    label: "抖音号ID列表"
  },
  {
    component: "Select",
    fieldName: "native_setting_anchor_related_type",
    componentProps: { options: BytedancePromotion_anchor_related_type },
    label: "锚点关联类型",
    defaultValue: "OFF"
  },

  // 创意设置
  { component: "Input", fieldName: "source", label: "创意来源" },
  {
    component: "Select",
    fieldName: "is_comment_disable",
    componentProps: { options: BytedancePromotion_is_comment_disable },
    label: "关闭评论",
    defaultValue: "OFF"
  },
  {
    component: "Select",
    fieldName: "ad_download_status",
    componentProps: { options: BytedancePromotion_ad_download_status },
    label: "下载状态",
    defaultValue: "OFF"
  },

  // 品牌信息(brand_info 平铺)
  { component: "Input", fieldName: "brand_info_yuntu_category_id", label: "云图类目ID" },
  { component: "Input", fieldName: "brand_info_cdp_brand_id", label: "CDP品牌ID" },
  { component: "Input", fieldName: "brand_info_ecom_brand_id", label: "电商品牌ID" },
  { component: "Input", fieldName: "brand_info_brand_name_id", label: "品牌名称ID" },
  { component: "Input", fieldName: "brand_info_cdp_brand_name", label: "CDP品牌名" },
  {
    component: "Select",
    fieldName: "brand_info_sub_brand_names",
    componentProps: { options: [], mode: "tags", placeholder: "请输入子品牌名" },
    label: "子品牌名称"
  },
  {
    component: "Select",
    fieldName: "brand_info_sub_brand_name_ids",
    componentProps: { options: [], mode: "tags", placeholder: "请输入子品牌ID" },
    label: "子品牌ID"
  },

  // 单元预算与出价
  {
    component: "Select",
    fieldName: "budget_mode",
    componentProps: { options: BytedancePromotion_budget_mode },
    label: "预算模式",
    defaultValue: "BUDGET_MODE_DAY"
  },
  { component: "Input", fieldName: "budget", label: "预算(分)", defaultValue: 0 },
  { component: "Input", fieldName: "bid", label: "出价(分)", defaultValue: 0 },
  { component: "Input", fieldName: "cpa_bid", label: "CPA出价", defaultValue: 0 },
  { component: "Input", fieldName: "deep_cpabid", label: "深度CPA出价", defaultValue: 0 },
  { component: "Input", fieldName: "roi_goal", label: "ROI目标", defaultValue: 0 },
  { component: "Input", fieldName: "first_roi_goal", label: "首日ROI目标", defaultValue: 0 },
  { component: "Input", fieldName: "union_bid_ratio", label: "联盟出价系数", defaultValue: 0 },
  { component: "Input", fieldName: "sevend_retention", label: "7日留存天数", defaultValue: 0 },

  // 搜索流量
  {
    component: "Select",
    fieldName: "auto_extend_traffic",
    componentProps: { options: BytedancePromotion_auto_extend_traffic },
    label: "搜索流量自动扩量",
    defaultValue: "OFF"
  }
];

const promotionShowLabel: Record<string, string> = {
  name: "广告名称",
  operation: "状态",
  budget_mode: "预算模式",
  budget: "预算",
  bid: "出价"
};
</script>

<template>
  <div class="bytedance-base-template">
    <Row :gutter="16" class="equal-height-row">
      <Col :span="6" class="equal-height-col">
        <BytedanceCampaign
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :audience="creationInfo?.configData.audience"
          :account-info="creationInfo.accountInfo"
          :field-label-map="fieldLabelMap"
          @update:campaign="updateCampaign"
          @update:audience-package="updateAudiencePackage"
        />
      </Col>

      <Col :span="6" class="equal-height-col">
        <BytedancePromotion
          :form-fields="promotionFormFields"
          :promotion-show-label="promotionShowLabel"
          :promotion="creationInfo?.configData.promotion"
          :field-label-map="fieldLabelMap"
          @update:promotion="updatePromotion"
        />
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
        />
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">
.bytedance-base-template {
  width: 100%;
}

.equal-height-row {
  display: flex;
  align-items: stretch;
  height: 612px;
}

.equal-height-col {
  display: flex;
  min-height: 0;

  > * {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
