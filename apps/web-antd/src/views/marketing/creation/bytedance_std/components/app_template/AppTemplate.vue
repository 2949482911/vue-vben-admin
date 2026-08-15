<script setup lang="ts" name="StdAppTemplate">
/**
 * 智擎版 App推广模板
 *
 * 与 base_template 结构完全一致，仅 projectFormFields 不同：
 * 增加 App 下载设置、落地页链接、产品主图等字段
 *
 * 参考 bytedance/MarketingProductDouyinTemplate.vue 模式
 */
import { Col, message, Row } from "ant-design-vue";
import { computed, markRaw, watch } from "vue";

import { bytedanceAdvertisementApi } from "#/api/core";
import StdProject from "../StdProject.vue";
import ProductConfigCard from "../product/ProductConfigCard.vue";
import AwemeConfigCard from "#/views/marketing/creation/components/aweme/AwemeConfigCard.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import PageViewSelector from "#/views/marketing/creation/components/pageview/PageViewSelector.vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import DpaProductButtonField
  from "#/views/marketing/creation/bytedance/components/DpaProductButtonField.vue";
import type {
  AudienceConfigData,
  AwemeConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  StdCreation,
  StdProjectData,
  ProductConfigData
} from "#/views/marketing/creation/bytedance_std/bytedance";
import {
  BytedanceCampaign_ad_type,
  BytedanceCampaign_app_promotion_type,
  BytedanceCampaign_bid_type,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_delivery_type,
  BytedanceCampaign_download_mode,
  BytedanceCampaign_download_type,
  BytedanceCampaign_external_action,
  BytedanceCampaign_landing_type,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_pricing,
  BytedanceCampaign_promotion_type,
  BytedanceCampaign_schedule_type,
  BytedanceCampaign_ulink_url_type,
  BytedanceCampgin_budget_mode,
  BytedanceNativeType,
  BytedancePromotion_anchor_related_type,
  BytedancePromotion_is_comment_disable,
  CampaignOperation,
  DeliveryMode,
  fieldLabelMap,
  BytedanceCampaign_deep_external_action
} from "#/views/marketing/creation/bytedance_std/enums";

const emit = defineEmits([
  "update:project",
  "update:updateMaterial",
  "update:titlePackage",
  "update:landingPage",
  "update:awemeConfig",
  "update:audiencePackage",
  "update:productConfig"
]);

const { creationInfo, productConfig } = defineProps({
  creationInfo: {
    type: Object as () => StdCreation,
    default: () => ({})
  },
  productConfig: {
    type: Object as () => ProductConfigData | null,
    default: null
  }
});

function updateProject(project: StdProjectData) {
  emit("update:project", project);
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

function updateProductConfig(data: ProductConfigData) {
  emit("update:productConfig", data);
}

/** 是否投放身份为抖音号（native_type=AWEME）—— 决定抖音号配置区是否可配置 */
const isAweme = computed(() => creationInfo?.configData.project.native_type !== "AWEME");
// 落地页选择
const isPageView = computed(() => creationInfo.configData.project.download_type !== 'EXTERNAL_URL')


// ==================== 资产ID自动匹配 ====================
// app_name（应用名称）与资产列表中的 asset_name 匹配时，自动回填 asset_id
watch(
  () => [creationInfo?.configData.project?.app_name, creationInfo?.project?.projectName],
  async ([appName, projectName]) => {
    const matchName = appName || projectName;
    // 无匹配名称或 asset_id 已存在时跳过
    if (!matchName) {
      return
    }
    const advertiserIds = (creationInfo?.accountInfo || []).map((a) => a.localAdvertiserId);
    if (!advertiserIds.length) {
      return
    };
    const assets = await bytedanceAdvertisementApi.fetchBytedanceAssertsList({
      advertiserId: advertiserIds,
      projectId: creationInfo?.project?.projectId || ""
    });
    if (!assets) {
      message.error("当前账户无资产配置请先在巨量后台创建或共享资产");
      return;
    }
    const matched = assets[0];
    if (matched) {
      emit("update:project", {
        ...creationInfo?.configData.project,
        asset_id: matched.asset_id
      });
    }
  },
  { immediate: true }
);

// ==================== App推广模板表单字段 ====================
const projectFormFields = [
  // -- 基本信息 --
  { component: "AdNameGen", fieldName: "name", label: "项目名称", rules: "required" },
  {
    component: "Select", fieldName: "operation",
    componentProps: { options: CampaignOperation },
    label: "启停状态", defaultValue: "ENABLE"
  },
  {
    component: "Select", fieldName: "delivery_mode",
    componentProps: { options: DeliveryMode },
    label: "投放模式", defaultValue: "PROCEDURAL",
    dependencies: {
      show: false,
      triggerFields: ["8"]
    }
  },
  {
    component: "Select", fieldName: "landing_type",
    componentProps: { options: BytedanceCampaign_landing_type },
    label: "营销目的", rules: "required", defaultValue: "APP",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "app_promotion_type",
    label: "子目标",
    componentProps: {
      options: BytedanceCampaign_app_promotion_type
    },
    defaultValue: "DOWNLOAD"
  },

  // {
  //   component: "Select", fieldName: "delivery_medium",
  //   componentProps: { options: Bytedance_delivery_medium },
  //   label: "投放身份", rules: "required", defaultValue: "APP"
  // },

  {
    component: "Select", fieldName: "native_type",
    componentProps: { options: BytedanceNativeType },
    label: "投放身份", rules: "required", defaultValue: "AWEME"
  },

  {
    component: "Select", fieldName: "marketing_goal",
    componentProps: { options: BytedanceCampaign_marketing_goal },
    label: "营销场景", defaultValue: "VIDEO_AND_IMAGE",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Select", fieldName: "ad_type",
    componentProps: { options: BytedanceCampaign_ad_type },
    label: "项目类型", defaultValue: "ALL"
  },
  {
    component: "Select", fieldName: "delivery_type",
    componentProps: { options: BytedanceCampaign_delivery_type },
    label: "投放类型", defaultValue: "NORMAL",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },

  // -- 优化目标（options 由 StdProjectDrawer 远程请求后注入） --
  {
    component: "Select",
    fieldName: "external_action",
    label: "转化目标",
    rules: "required",
    defaultValue: "AD_CONVERT_TYPE_ACTIVE",
    componentProps: {
      options: BytedanceCampaign_external_action,
      placeholder: "请选择转化目标",
      allowClear: true,
      showSearch: true
    }
  },
  {
    component: "Select",
    fieldName: "deep_external_action",
    label: "深度转化目标",
    componentProps: {
      options: BytedanceCampaign_deep_external_action,
      placeholder: "请选择深度转化目标",
      allowClear: true,
      showSearch: true
    },
    defaultValue: "AD_CONVERT_TYPE_NEXT_DAY_OPEN"
  },
  {
    component: "Select", fieldName: "deep_bid_type",
    componentProps: { options: BytedanceCampaign_deep_bid_type },
    label: "深度优化方式", defaultValue: "DEEP_BID_MIN"
  },

  // -- App下载设置（App模板特有） --
  {
    component: "Select", fieldName: "download_type",
    componentProps: { options: BytedanceCampaign_download_type },
    label: "下载方式", defaultValue: "DOWNLOAD_URL"
  },
  {
    component: "Select", fieldName: "download_mode",
    componentProps: { options: BytedanceCampaign_download_mode },
    label: "下载模式", defaultValue: "DEFAULT"
  },
  {
    component: "Input",
    fieldName: "download_url",
    label: "下载链接",
    defaultValue: `${creationInfo.project.downloadUrl}`,
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  {
    component: "Input", fieldName: "app_name", label: "应用名称", dependencies: {
      show: false, triggerFields: ["*"]
    }, defaultValue: `${creationInfo.project.projectName}`
  },
  // {
  //   component: "Select", fieldName: "launch_type",
  //   componentProps: { options: BytedanceCampaign_launch_type },
  //   label: "调起类型", defaultValue: "DIRECT_OPEN"
  // },
  {
    component: "Select", fieldName: "promotion_type",
    componentProps: { options: BytedanceCampaign_promotion_type },
    label: "推广类型", defaultValue: "LANDING_PAGE_LINK"
  },

  {
    component: "Input", fieldName: "subscribe_url",
    dependencies: {
      show: (currentVal: Record<string, any>) => {
        return currentVal["app_promotion_type"] === "RESERVE";
      },
      triggerFields: ["app_promotion_type"]
    },
    label: "预约链接"
  },
  {
    component: "Select",
    fieldName: "asset_id",
    label: "资产ID",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },

  // -- 商品选择 --
  // 是否选择关联商品（控制 DPA 商品选择按钮显隐）
  {
    component: "Select", fieldName: "related_product_enabled",
    componentProps: {
      options: [
        { label: "否", value: "NO" },
        { label: "是", value: "YES" }
      ]
    },
    label: "关联商品", defaultValue: "NO"
  },
  // DPA商品选择按钮 — 由 StdProjectDrawer 动态注入 dpaContext / openDpaModal
  {
    component: markRaw(DpaProductButtonField),
    fieldName: "dpa_product_button",
    label: "投放商品",
    componentProps: {},
    dependencies: {
      show: (cv: Record<string, any>) => cv["related_product_enabled"] === "YES",
      triggerFields: ["related_product_enabled"]
    }
  },

  // 商品库信息
  {
    component: "Input",
    fieldName: "product_id",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    },
    label: "商品ID"
  },

  {
    component: "Input",
    fieldName: "product_platform_id",
    dependencies: {
      show: false,
      triggerFields: ["*"]
    },
    label: "通用版商品库ID"
  },


  // -- 排期 --
  {
    component: "Select", fieldName: "schedule_type",
    componentProps: { options: BytedanceCampaign_schedule_type },
    label: "投放时间", defaultValue: "SCHEDULE_FROM_NOW"
  },
  {
    component: "DatePicker", fieldName: "start_time",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    label: "开始时间",
    rules: "required",
    dependencies: {
      show: (cv: Record<string, any>) => cv["schedule_type"] === "SCHEDULE_START_END",
      triggerFields: ["schedule_type"]
    }
  },
  {
    component: "DatePicker", fieldName: "end_time",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    label: "结束时间",
    rules: "required",
    dependencies: {
      show: (cv: Record<string, any>) => cv["schedule_type"] === "SCHEDULE_START_END",
      triggerFields: ["schedule_type"]
    }
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: "schedule_time",
    label: "投放时段"
  },

  // -- 竞价策略与出价 --
  {
    component: "Select", fieldName: "bid_type",
    componentProps: { options: BytedanceCampaign_bid_type },
    label: "竞价策略", defaultValue: "CUSTOM"
  },
  {
    component: "Select", fieldName: "pricing",
    componentProps: { options: BytedanceCampaign_pricing },
    label: "计费方式", defaultValue: "PRICING_OCPM"
  },

  // -- 预算 --
  {
    component: "Select", fieldName: "budget_mode",
    componentProps: { options: BytedanceCampgin_budget_mode },
    label: "预算模式", defaultValue: "BUDGET_MODE_DAY"
  },
  {
    component: "InputNumber", fieldName: "budget",
    label: "预算", defaultValue: 0,
    dependencies: {
      show: (cv: Record<string, any>) => cv["budget_mode"] !== "BUDGET_MODE_INFINITE",
      triggerFields: ["budget_mode"]
    }
  },
  {
    component: "InputNumber",
    fieldName: "cpa_bid",
    label: "出价",
    defaultValue: 0,
    rules: "required", help: "范围 0.2-999"
  },

  {
    component: "InputNumber",
    fieldName: "deep_cpabid",
    label: "深度出价",
    defaultValue: 0
  },
  {
    component: "InputNumber", fieldName: "roi_goal",
    label: "ROI系数", defaultValue: 0, help: "深度优化方式为ROI时必填"
  },

  // -- 落地页链接（App模板特有） --
  {
    component: "Input", fieldName: "open_url", label: "直达链接", dependencies: {
      show: (currentVal: Record<string, any>) => {
        return currentVal["app_promotion_type"] === "LAUNCH";
      },
      triggerFields: ["app_promotion_type"]
    }
  },
  {
    component: "Input", fieldName: "ulink_url", label: "备用链接",
    dependencies: {
      show: (currentVal: Record<string, any>) => {
        return currentVal["app_promotion_type"] === "LAUNCH";
      },
      triggerFields: ["app_promotion_type"]
    }
  },
  {
    component: "Select", fieldName: "ulink_url_type",
    componentProps: { options: BytedanceCampaign_ulink_url_type },
    label: "备用链接类型", defaultValue: "UNIVERSAL_LINK",
    dependencies: {
      show: (currentVal: Record<string, any>) => {
        return currentVal["app_promotion_type"] === "LAUNCH";
      },
      triggerFields: ["app_promotion_type"]
    }
  },

  // -- 产品主图（App模板特有） --
  // {
  //   component: "TextareaTags",
  //   fieldName: "project_materials_product_info_titles",
  //   label: "产品名称", help: "字数限制[1-20]"
  // },
  // {
  //   component: markRaw(ProductImageButtonField),
  //   fieldName: "product_image_button",
  //   rules: "required",
  //   label: "产品主图"
  // },
  // {
  //   component: "TextareaTags",
  //   fieldName: "project_materials_product_info_selling_points",
  //   label: "产品卖点", help: "字符限制[6-9]，个数[1,10]"
  // },
  // {
  //   component: "TextareaTags",
  //   fieldName: "project_materials_call_to_action_buttons",
  //   label: "行动号召", help: "字符限制[2-4]，个数[1,10]"
  // },

  // -- 创意设置 --
  {
    component: "Select", fieldName: "is_comment_disable",
    componentProps: { options: BytedancePromotion_is_comment_disable },
    label: "评论管理", defaultValue: "OFF"
  },
  {
    component: "Select", fieldName: "anchor_related_type",
    componentProps: { options: BytedancePromotion_anchor_related_type },
    label: "原生锚点", defaultValue: "OFF"
  },

  // -- 隐藏字段 --
  {
    component: "Input",
    fieldName: "search_continue_delivery",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "layer_roi_switch",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "auto_extend_traffic",
    defaultValue: "OFF",
    label: "智能拓流",
    dependencies: {},
    componentProps: {
      options: BytedancePromotion_is_comment_disable
    }
  },
  {
    component: "Input",
    fieldName: "star_auto_delivery_switch",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Input",
    fieldName: "star_auto_material_addition_switch",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  },
  {
    component: "Select",
    fieldName: "audience_type",
    defaultValue: "UNLIMITED",
    label: "定向包类型",
    componentProps: {
      options: [
        { label: "不限", value: "UNLIMITED" },
        { label: "自定义", value: "CUSTOM" }
      ]
    }
  },
  {
    component: "Input",
    fieldName: "ad_download_status",
    defaultValue: "OFF",
    dependencies: { show: false, triggerFields: ["*"] }
  }
];


/**
 * 展示label
 */
const campaignShowLabel: Record<string, string> = {
  name: "项目名称",
  landing_type: "推广目的",
  marketing_goal: "营销场景",
  ad_type: "广告类型",
  delivery_type: "投放类型",
}

</script>

<template>
  <div class="std-app-template">
    <Row :gutter="16" class="equal-height-row">
      <!-- 第1列：项目配置 + 抖音号配置 -->
      <Col :span="8" class="equal-height-col">
        <div class="combined-area">
          <StdProject
            :project="creationInfo?.configData.project"
            :audience="creationInfo?.configData.audience"
            :account-info="creationInfo.accountInfo"
            :form-fields="projectFormFields"
            :campaign-show-label="campaignShowLabel"
            :field-label-map="fieldLabelMap"
            @update:project="updateProject"
            @update:audience-package="updateAudiencePackage"
          />
        </div>
      </Col>

      <!-- 第2列：产品配置 + 创意组 -->
      <Col :span="8" class="equal-height-col">
        <div class="combined-area">
          <ProductConfigCard
            :product-config="productConfig"
            :account-info="creationInfo.accountInfo"
            @update:product-config="updateProductConfig"
          />
          <CreativeGroupSelector
            :account-info="creationInfo.accountInfo"
            :material="creationInfo.configData.material"
            @update:material="updateMaterial"
          />
        </div>

        <AwemeConfigCard
          :aweme-config="creationInfo?.configData.awemeConfig"
          :account-info="creationInfo.accountInfo"
          :disabled="isAweme"
          :supported-rules="['PER_PROJECT', 'PER_ACCOUNT']"
          @update:aweme-config="updateAwemeConfig"
        />
      </Col>

      <!-- 第3列：落地页 + 标题包 -->
      <Col :span="8" class="equal-height-col">
        <div class="combined-area">
          <PageViewSelector
            :disabled="isPageView"
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
.std-app-template {
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
