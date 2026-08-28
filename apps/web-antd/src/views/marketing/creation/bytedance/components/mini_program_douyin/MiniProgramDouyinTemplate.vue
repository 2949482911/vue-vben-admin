<script setup lang="ts" name="MiniProgramDouyinTemplate">
/**
 * 小程序抖音号推广模板（商品推广·非短剧）
 *
 * 场景：MICRO_GAME（小程序）+ AWEME（抖音号）+ sDPA 单商品
 * 依据巨量引擎 project/create + promotion/create 官方API文档 & 成功创建模板
 *
 * 项目级参数约束：
 * - landing_type=MICRO_GAME, micro_promotion_type=AWEME（固定）
 * - 不传 native_setting.aweme_id（MICRO_GAME不支持）
 * - 不传 micro_app_instance_id（AWEME不需要）
 * - 不传 promotion_type/asset_type（MICRO_GAME不需要）
 * - inventory_catalog 按 delivery_mode 切换（MANUAL→MANUAL, PROCEDURAL→UNIVERSAL_SMART）
 * - inventory_type 固定 INVENTORY_AWEME_FEED（抖音短视频）
 * - dpa_adtype=DPA_LINK（sDPA 模式）
 * - related_product.product_setting=SINGLE
 *
 * 广告级参数：
 * - native_setting.aweme_id 由 AwemeConfigCard 分配
 * - 出价预算继承项目级，广告级不单独设置
 */
import { Col, Row } from "ant-design-vue";
import { markRaw } from "vue";

import BytedanceCampaign from "../BytedanceCampaign.vue";
import BytedancePromotion from "../BytedancePromotion.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import PageViewSelector from "#/views/marketing/creation/components/pageview/PageViewSelector.vue";
import AwemeConfigCard from "../../../components/aweme/AwemeConfigCard.vue";
import DpaProductButtonField from "../DpaProductButtonField.vue";
import ProductImageButtonField from "../ProductImageButtonField.vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  AwemeConfigData,
  BytedanceCampaignData,
  BytedanceCreation,
  BytedancePromotionData
} from "#/views/marketing/creation/bytedance/bytedance";
import {
  BytedanceCampaign_ad_type,
  BytedanceCampaign_bid_type,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_delivery_type,
  BytedanceCampaign_external_action,
  BytedanceCampaign_inventory_catalog,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_micro_promotion_type,
  BytedanceCampaign_pricing,
  BytedanceCampaign_product_setting,
  BytedanceCampaign_schedule_type,
  BytedanceCampgin_budget_mode,
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
  "update:titlePackage",
  "update:landingPage",
  "update:awemeConfig"
]);

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => BytedanceCreation,
    default: () => ({})
  }
});

/**
 * 项目数据更新回调
 * 同步 inventory_catalog（根据 delivery_mode 动态切换）
 * 清除项目层级的 native_setting（MICRO_GAME 不支持）
 */
function updateCampaign(campaign: BytedanceCampaignData) {
  // inventory_catalog: 自动投放→通投智选, 手动投放→首选媒体
  campaign.delivery_range.inventory_catalog =
    campaign.delivery_mode === "PROCEDURAL" ? "UNIVERSAL_SMART" : "MANUAL";

  // MICRO_GAME 项目层级不支持 native_setting.aweme_id
  campaign.native_setting = { aweme_id: "" };
  // AWEME 不需要 micro_app_instance_id
  campaign.micro_app_instance_id = 0;

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
  emit("update:landingPage", landingPage);
}

function updateAwemeConfig(awemeConfig: AwemeConfigData) {
  emit("update:awemeConfig", awemeConfig);
}

// ==================== 项目表单字段（MICRO_GAME + AWEME + sDPA） ====================
const campaignFormFields = [
  // -- 基础信息（可见） --
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
    fieldName: "marketing_goal",
    componentProps: { options: BytedanceCampaign_marketing_goal },
    label: "营销场景",
    defaultValue: "VIDEO_AND_IMAGE"
  },

  // -- 场景固定参数（隐藏） --
  {
    component: "Select",
    fieldName: "landing_type",
    componentProps: { options: [{ label: "小程序", value: "MICRO_GAME" }] },
    label: "营销目的",
    defaultValue: "MICRO_GAME",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Select",
    fieldName: "micro_promotion_type",
    componentProps: { options: BytedanceCampaign_micro_promotion_type },
    label: "小程序类型",
    defaultValue: "AWEME",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Select",
    fieldName: "ad_type",
    componentProps: { options: BytedanceCampaign_ad_type },
    label: "广告类型",
    defaultValue: "ALL",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Select",
    fieldName: "delivery_type",
    componentProps: { options: BytedanceCampaign_delivery_type },
    label: "投放类型",
    defaultValue: "NORMAL",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Select",
    fieldName: "dpa_adtype",
    componentProps: { options: [{ label: "DPA落地页", value: "DPA_LINK" }] },
    label: "DPA广告类型",
    defaultValue: "DPA_LINK",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Select",
    fieldName: "ulink_url_type",
    componentProps: { options: [{ label: "Universal Link", value: "UNIVERSAL_LINK" }] },
    label: "ulink类型",
    defaultValue: "UNIVERSAL_LINK",
    dependencies: { show: false, triggerFields: ["*"] }
  },

  // -- 投放版位：inventory_catalog 由 updateCampaign 动态设置，这里只固定 inventory_type --
  {
    component: "Select",
    fieldName: "delivery_range_inventory_type",
    componentProps: {
      options: [{ label: "抖音短视频", value: "INVENTORY_AWEME_FEED" }],
      mode: "multiple"
    },
    label: "投放版位",
    defaultValue: ["INVENTORY_AWEME_FEED"],
    dependencies: { show: false, triggerFields: ["*"] }
  },

  {
    component: "Select",
    fieldName: "delivery_range_inventory_catalog",
    componentProps: {
      options: BytedanceCampaign_inventory_catalog
    },
    label: "投放版位大类",
    defaultValue: "UNIVERSAL_SMART",
    dependencies: { show: false, triggerFields: ["*"] }
  },

  // -- 商品关联（sDPA 单商品模式） --
  {
    component: "Select",
    fieldName: "related_product_setting",
    componentProps: { options: BytedanceCampaign_product_setting },
    label: "商品设置",
    defaultValue: "SINGLE",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "related_product_platform_id",
    label: "商品平台ID",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "related_product_id",
    label: "商品ID",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  // DPA商品选择按钮 — 由抽屉动态注入 dpaContext / openDpaModal
  {
    component: markRaw(DpaProductButtonField),
    fieldName: "dpa_product_button",
    label: "投放商品",
    componentProps: {},
    dependencies: {
      show: (cv: Record<string, any>) => cv["related_product_setting"] === "SINGLE",
      triggerFields: ["related_product_setting"]
    }
  },

  // -- AIGC 开关 --
  {
    component: "Switch",
    formItemClass: "w-[150px]",
    fieldName: "aigc_dynamic_creative_switch",
    componentProps: {
      checkedValue: "ON",
      unCheckedValue: "OFF",
      checkedChildren: "ON",
      unCheckedChildren: "OFF"
    },
    label: "AIGC动态创意开关",
    defaultValue: "OFF",
    help: "该功能仅支持行业白名单客户使用"
  },

  // -- 优化目标 --
  {
    component: "Select",
    fieldName: "optimize_goal_external_action",
    label: "转化目标",
    rules: "required",
    defaultValue: "AD_CONVERT_TYPE_ACTIVE",
    componentProps: {
      options: BytedanceCampaign_external_action,
      placeholder: "请选择优化目标"
    }
  },
  {
    component: "Select",
    fieldName: "optimize_goal_deep_external_action",
    label: "深度转化目标",
    defaultValue: "AD_CONVERT_TYPE_LT_ROI",
    componentProps: {
      options: BytedanceCampaign_external_action,
      placeholder: "请选择深度优化目标",
      allowClear: true
    }
  },
  // {
  //   component: "Input",
  //   fieldName: "_has_deep_goals",
  //   label: "",
  //   defaultValue: false,
  //   dependencies: { show: false, triggerFields: ["*"] }
  // },
  {
    component: "Select",
    fieldName: "delivery_setting_deep_bid_type",
    componentProps: { options: BytedanceCampaign_deep_bid_type, allowClear: true },
    label: "深度优化方式",
    defaultValue: "ROI_COEFFICIENT"
  },

  // -- 排期、预算、出价 --
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
      show: (cv: Record<string, any>) => cv["delivery_setting_schedule_type"] === "SCHEDULE_START_END",
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
      show: (cv: Record<string, any>) => cv["delivery_setting_schedule_type"] === "SCHEDULE_START_END",
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
    component: "InputNumber",
    fieldName: "delivery_setting_bid",
    label: "出价",
    defaultValue: 0,
    rules: "required",
    help: "点击出价/展示出价，范围 0.2-999"
  },
  {
    component: "Select",
    fieldName: "delivery_setting_budget_mode",
    componentProps: { options: BytedanceCampgin_budget_mode },
    label: "预算模式",
    rules: "required",
    defaultValue: "BUDGET_MODE_DAY"
  },
  {
    component: "InputNumber",
    fieldName: "delivery_setting_budget",
    label: "日预算",
    defaultValue: 300,
    rules: "required",
    dependencies: {
      show: (currentValue: Record<string, any>) => {
        return currentValue["delivery_setting_budget_mode"] !== "BUDGET_MODE_INFINITE";
      },
      triggerFields: ["delivery_setting_budget_mode"]
    }
  },
  {
    component: "Select",
    fieldName: "delivery_setting_pricing",
    componentProps: { options: BytedanceCampaign_pricing },
    label: "计费方式",
    defaultValue: "PRICING_OCPM"
  },
  {
    component: "InputNumber",
    fieldName: "delivery_setting_roi_goal",
    label: "ROI系数",
    defaultValue: 0,
    help: "深度优化方式为ROI系数时必填，范围(0,5]"
  },

  // -- delivery_setting 隐藏 OFF 开关（保证提交参数完整） --
  {
    component: "Input",
    fieldName: "delivery_setting_budget_optimize_switch",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "delivery_setting_filter_night_switch",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "delivery_setting_layer_roi_switch",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "delivery_setting_project_custom",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "delivery_setting_search_continue_delivery",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  }
];

const campaignShowLabel: Record<string, string> = {
  name: "项目名称",
  landing_type: "推广目的",
  marketing_goal: "营销场景",
  ad_type: "广告类型",
  delivery_type: "投放类型"
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

  // 产品设置
  {
    component: "TextareaTags",
    fieldName: "promotion_materials_product_info_titles",
    rules: "required",
    label: "产品名字"
  },
  {
    component: markRaw(ProductImageButtonField),
    fieldName: "product_image_button",
    label: "产品主图",
    rules: "required",
    // v-model 由 form 系统绑定，componentProps 由 BytedancePromotionDrawer 动态注入 openProductImageModal
    componentProps: {}
  },
  {
    component: "TextareaTags",
    fieldName: "promotion_materials_product_info_selling_points",
    rules: "required",
    label: "产品卖点"
  },

  // 行动号召
  {
    component: "TextareaTags",
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
        { label: "否", value: "OFF" },
        { label: "是", value: "ON" }
      ]
    }
  },

  // 创意设置
  {
    component: "Select",
    fieldName: "is_comment_disable",
    componentProps: { options: BytedancePromotion_is_comment_disable },
    label: "关闭评论",
    defaultValue: "OFF"
  }
];

const promotionShowLabel: Record<string, string> = {
  name: "广告名称",
  operation: "状态",
  is_comment_disable: "单元评论",
  source: "来源"
};
</script>

<template>
  <div class="mini-program-douyin-template">
    <Row :gutter="16" class="equal-height-row">
      <!-- 第1列：项目 + 定向包 -->
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

      <!-- 第2列：广告 + 抖音号配置 -->
      <Col :span="6" class="equal-height-col">
        <div class="combined-area">
          <BytedancePromotion
            :form-fields="promotionFormFields"
            :promotion-show-label="promotionShowLabel"
            :promotion="creationInfo?.configData.promotion"
            :field-label-map="fieldLabelMap"
            @update:promotion="updatePromotion"
          />
          <AwemeConfigCard
            :aweme-config="creationInfo?.configData.awemeConfig"
            :account-info="creationInfo.accountInfo"
            @update:aweme-config="updateAwemeConfig"
          />
        </div>
      </Col>

      <!-- 第3列：创意组 -->
      <Col :span="6" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          @update:material="updateMaterial"
        />
      </Col>

      <!-- 第4列：落地页 + 标题包 -->
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
.mini-program-douyin-template {
  width: 100%;
}

.equal-height-row {
  display: flex;
  align-items: stretch;
  height: 650px;
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

.combined-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
  }
}
</style>
