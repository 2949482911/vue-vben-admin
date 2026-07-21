<script setup lang="ts" name="MarketingProductDouyinTemplate">
import { Col, Row } from "ant-design-vue";

import BytedanceCampaign from "../BytedanceCampaign.vue";
import BytedancePromotion from "../BytedancePromotion.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import type {
  AudienceConfigData,
  MaterialData, PageViewConfigData,
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
  BytedanceCampaign_bid_type,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_delivery_type,
  BytedanceCampaign_download_mode,
  BytedanceCampaign_dpa_adtype,
  BytedanceCampaign_landing_type,
  BytedanceCampaign_launch_type,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_micro_promotion_type,
  BytedanceCampaign_multi_asset_type,
  BytedanceCampaign_open_url_type,
  BytedanceCampaign_pricing,
  BytedanceCampaign_product_setting,
  BytedanceCampaign_promotion_type,
  BytedanceCampaign_schedule_type,
  BytedanceCampaign_ulink_url_type,
  BytedanceCampgin_budget_mode,
  BytedancePromotion_is_comment_disable,
  CampaignOperation,
  DeliveryMode,
  fieldLabelMap
} from "#/views/marketing/creation/bytedance/enums";
import { markRaw } from "vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import PageViewSelector from "#/views/marketing/creation/components/pageview/PageViewSelector.vue";

const emit = defineEmits([
  "update:campaign",
  "update:promotion",
  "update:audiencePackage",
  "update:updateMaterial",
  "update:titlePackage",
  "update:landingPage"
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

function updateLandingPage(landingPage: PageViewConfigData) {
  emit('update:landingPage', landingPage);
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
    defaultValue: "PROCEDURAL"
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
    component: "Switch",
    formItemClass: "w-[150px]",
    fieldName: "aigc_dynamic_creative_switch",
    label: "AIGC动态创意开关", defaultValue: false,
    help: "该功能仅支持行业白名单客户使用，如需使用可咨询对接销售/运营"
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

  { component: "Input", fieldName: "optimize_goal_external_action", label: "优化目标" },
  { component: "Input", fieldName: "optimize_goal_deep_external_action", label: "深度优化目标" },
  {
    component: "Select",
    fieldName: "delivery_setting_deep_bid_type",
    componentProps: { options: BytedanceCampaign_deep_bid_type },
    label: "深度优化方式",
    defaultValue: "DEEP_BID_DEFAULT"
  },
  // {
  //   component: "Select",
  //   fieldName: "value_optimized_type",
  //   componentProps: { options: BytedanceCampaign_value_optimized_type },
  //   label: "价值优选",
  //   defaultValue: "OFF"
  // },
  // {
  //   component: "Select",
  //   fieldName: "landing_page_stay_time",
  //   componentProps: { options: BytedanceCampaign_landing_page_stay_time },
  //   label: "落地页停留时长",
  //   defaultValue: 0
  // },
  // { component: "Input", fieldName: "yuntu_5a_brand_id", label: "云图5A品牌ID" },
  // { component: "Input", fieldName: "yuntu_5a_brand_main_industry_id", label: "云图主行业ID" },

  // 投放版位(delivery_range 平铺)
  // {
  //   component: "Select",
  //   fieldName: "delivery_range_inventory_catalog",
  //   componentProps: { options: BytedanceCampaign_inventory_catalog },
  //   label: "版位目录",
  //   defaultValue: "MANUAL"
  // },
  // {
  //   component: "Select",
  //   fieldName: "delivery_range_inventory_type",
  //   componentProps: { options: BytedanceCampaign_inventory_type, mode: "multiple" },
  //   label: "版位类型",
  //   dependencies: {
  //     show: (currentValue: Record<string, any>) => {
  //       return currentValue["delivery_range_inventory_catalog"] === "MANUAL";
  //     },
  //     triggerFields: ["delivery_range_inventory_catalog"]
  //   }
  // },


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
    rules: "required",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["delivery_setting_schedule_type"] === "SCHEDULE_START_END";
      },
      triggerFields: ["delivery_setting_schedule_type"]

    }
  },
  {
    component: "DatePicker",
    fieldName: "delivery_setting_end_time",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    label: "结束时间",
    rules: "required",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["delivery_setting_schedule_type"] === "SCHEDULE_START_END";
      },
      triggerFields: ["delivery_setting_schedule_type"]

    }
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: "delivery_setting_schedule_time",
    label: "投放时段",
    componentProps: {}
  },

  {
    component: "Select",
    fieldName: "delivery_setting_bid_type",
    componentProps: { options: BytedanceCampaign_bid_type },
    label: "竞价策略",
    defaultValue: "CUSTOM"
  },

  {
    component: "Input",
    fieldName: "delivery_setting_bid",
    label: "出价",
    defaultValue: 0,
    rules: "required"
  },

  {
    component: "Select",
    fieldName: "delivery_setting_budget_mode",
    componentProps: { options: BytedanceCampgin_budget_mode },
    label: "预算模式",
    defaultValue: "BUDGET_MODE_DAY",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "InputNumber",
    fieldName: "delivery_setting_budget",
    label: "日预算",
    defaultValue: 300,
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "delivery_setting_pricing",
    componentProps: { options: BytedanceCampaign_pricing },
    label: "计费方式",
    defaultValue: "PRICING_OCPM"
  },

  { component: "Input", fieldName: "delivery_setting_roi_goal", label: "ROI系数", defaultValue: 0 },
  // { component: "Input", fieldName: "delivery_setting_first_roi_goal", label: "首日ROI目标", defaultValue: 0 },
  // { component: "Input", fieldName: "delivery_setting_seven_roi_goal", label: "7日ROI系数", defaultValue: 0 },

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
  { component: "Input", fieldName: "source", label: "来源", rules: "required" },
  {
    component: "Select",
    fieldName: "is_comment_disable",
    label: "单元评论",
    defaultValue: "OFF",
    componentProps: {
      options: [
        {
          label: "否",
          value: "OFF"
        },
        {
          label: "是",
          value: "ON"
        }
      ]
    }
  },
  // { component: "Input", fieldName: "project_id", label: "项目ID" },

  // 产品设置
  {
    component: "Input",
    fieldName: "promotion_materials_product_info_titles",
    rules: "required",
    label: "产品名字"
  },
  {
    component: "Input",
    fieldName: "promotion_materials_product_info_image_ids",
    rules: "required",
    label: "产品主图"
  },
  {
    component: "Input",
    fieldName: "promotion_materials_product_info_selling_points",
    rules: "required",
    label: "产品卖点"
  },


  // 行动号召
  {
    component: "Input",
    fieldName: "promotion_materials_call_to_action_buttons",
    rules: "required",
    label: "行动号召",
    help: "行动号召文案，字数限制：[2-6]，数组上限为10"
  },
  {
    component: "Select",
    fieldName: "promotion_materials_intelligent_generation",
    rules: "required",
    label: "智能生成行动号召",
    defaultValue: "OFF",
    componentProps: {
      options: [
        {
          label: "否",
          value: "OFF"
        },
        {
          label: "是",
          value: "ON"
        }
      ]
    }
  },

  // 素材类型
  // { component: "Input", fieldName: "materials_type", label: "素材类型" },

  // 原生单元设置(native_setting 平铺)
  { component: "Input", fieldName: "native_setting_aweme_setting_type", label: "抖音号设置类型" },
  { component: "Input", fieldName: "native_setting_aweme_id", label: "抖音号ID" },
  // {
  //   component: "Select",
  //   fieldName: "native_setting_aweme_ids",
  //   componentProps: { options: [], mode: "multiple", placeholder: "请选择抖音号ID列表" },
  //   label: "抖音号ID列表"
  // },
  // {
  //   component: "Select",
  //   fieldName: "native_setting_anchor_related_type",
  //   componentProps: { options: BytedancePromotion_anchor_related_type },
  //   label: "锚点关联类型",
  //   defaultValue: "OFF"
  // },

  // 创意设置
  // { component: "Input", fieldName: "source", label: "创意来源" },
  {
    component: "Select",
    fieldName: "is_comment_disable",
    componentProps: { options: BytedancePromotion_is_comment_disable },
    label: "关闭评论",
    defaultValue: "OFF"
  }
  // {
  //   component: "Select",
  //   fieldName: "ad_download_status",
  //   componentProps: { options: BytedancePromotion_ad_download_status },
  //   label: "下载状态",
  //   defaultValue: "OFF"
  // },

  // 品牌信息(brand_info 平铺)
  // { component: "Input", fieldName: "brand_info_yuntu_category_id", label: "云图类目ID" },
  // { component: "Input", fieldName: "brand_info_cdp_brand_id", label: "CDP品牌ID" },
  // { component: "Input", fieldName: "brand_info_ecom_brand_id", label: "电商品牌ID" },
  // { component: "Input", fieldName: "brand_info_brand_name_id", label: "品牌名称ID" },
  // { component: "Input", fieldName: "brand_info_cdp_brand_name", label: "CDP品牌名" },
  // {
  //   component: "Select",
  //   fieldName: "brand_info_sub_brand_names",
  //   componentProps: { options: [], mode: "tags", placeholder: "请输入子品牌名" },
  //   label: "子品牌名称"
  // },
  // {
  //   component: "Select",
  //   fieldName: "brand_info_sub_brand_name_ids",
  //   componentProps: { options: [], mode: "tags", placeholder: "请输入子品牌ID" },
  //   label: "子品牌ID"
  // },

  // 单元预算与出价
  // {
  //   component: "Select",
  //   fieldName: "budget_mode",
  //   componentProps: { options: BytedancePromotion_budget_mode },
  //   label: "预算模式",
  //   defaultValue: "BUDGET_MODE_DAY"
  // },
  // { component: "Input", fieldName: "budget", label: "预算(分)", defaultValue: 0 },
  // { component: "Input", fieldName: "bid", label: "出价(分)", defaultValue: 0 },
  // { component: "Input", fieldName: "cpa_bid", label: "CPA出价", defaultValue: 0 },
  // { component: "Input", fieldName: "deep_cpabid", label: "深度CPA出价", defaultValue: 0 },
  // { component: "Input", fieldName: "roi_goal", label: "ROI目标", defaultValue: 0 },
  // { component: "Input", fieldName: "first_roi_goal", label: "首日ROI目标", defaultValue: 0 },
  // { component: "Input", fieldName: "union_bid_ratio", label: "联盟出价系数", defaultValue: 0 },
  // { component: "Input", fieldName: "sevend_retention", label: "7日留存天数", defaultValue: 0 },

  // 搜索流量
  // {
  //   component: "Select",
  //   fieldName: "auto_extend_traffic",
  //   componentProps: { options: BytedancePromotion_auto_extend_traffic },
  //   label: "搜索流量自动扩量",
  //   defaultValue: "OFF"
  // }
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
        <div class="combined-area">
          <PageViewSelector
            :page-view="creationInfo.configData.landingPage"
            :account-info="creationInfo.accountInfo"
            @update:page-view="updateLandingPage"
          />

          <TitleSelector
            :title-package="creationInfo.configData.titlePackage"
            :account-info="creationInfo.accountInfo"
            @update:title-package="updateTitlePackage"
          />
        </div>
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
}

.equal-height-col {
  display: flex;

  > * {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.combined-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: auto;
}
</style>
