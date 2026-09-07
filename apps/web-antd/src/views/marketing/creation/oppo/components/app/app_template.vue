<script setup lang="ts" name="OppoAppTemplate">
/**
 * OPPO-应用推广模板（应用下载 / 应用调起）
 *
 * 参考 OPPO Omni 接口文档：
 * - 3.1 添加单个计划信息（extensionType=2 应用下载 / 6 应用调起）
 * - 4.1 添加单个广告组（appId 推广应用必填、流量/计费/转化/排期）
 * - 5.5 广告创意（广告名称/规格/品牌/按钮文案，素材与落地页由下方选择器配置）
 *
 * 批量搭建逻辑与其它媒体一致：预览 -> 提交 -> 任务进度。
 * 模板字段均使用 vben Form 字段配置（antd 原生组件渲染），不新增自定义组件。
 */
import { Col, Row } from "ant-design-vue";

import type {
  OppoAdgroupData,
  OppoCampaignData,
  OppoCreation,
  OppoPromotionData
} from "#/views/marketing/creation/oppo/Oppo.types";
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import {
  BILLINGTYPE_SELECT,
  DAY_LIMIT_SELECT,
  DAYLIMIT_SELECT,
  DEEP_CV_SELECT,
  DELIVERMODE_SELECT,
  fieldLabelMap,
  FLOW_SELECT,
  FLOWSCENE_SELECT,
  GLOBAL_SPECID_SELECT,
  OCPC_OPTM_TYPE_OPTIONS,
  PAGE_TYPE_SELECT,
  SMART_EXPAND_SELECT,
  TIME_LIMIT_SELECT
} from "#/views/marketing/creation/oppo/projectEnum";
import OppoCampaign from "#/views/marketing/creation/oppo/components/OppoCampaign.vue";
import OppoAdgroup from "#/views/marketing/creation/oppo/components/OppoAdgroup.vue";
import OppoPromotion from "#/views/marketing/creation/oppo/components/OppoPromotion.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import PageViewSelector from "#/views/marketing/creation/components/pageview/PageViewSelector.vue";
import AudiencePackageSelector
  from "#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue";
import { Platform } from "#/constants/enums";
import { computed, markRaw } from "vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";

const emit = defineEmits([
  "update:campaign",
  "update:adgroup",
  "update:promotion",
  "update:audiencePackage",
  "update:updateMaterial",
  "update:titlePackage",
  "update:landingPage"
]);

//是否展示落地页
const showPageViewSelector = computed(() => creationInfo?.configData.adgroup.pageType === 9); //

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => OppoCreation,
    default: () => ({})
  }
});

function updateCampaign(campaign: OppoCampaignData) {
  emit("update:campaign", campaign);
}

function updateAdgroup(adgroup: OppoAdgroupData) {
  emit("update:adgroup", adgroup);
}

function updatePromotion(promotion: OppoPromotionData) {
  emit("update:promotion", promotion);
}

function updateMaterial(materialData: MaterialData) {
  emit("update:updateMaterial", materialData);
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit("update:titlePackage", titlePackage);
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}

function updateLandingPage(landingPage: PageViewConfigData) {
  emit("update:landingPage", landingPage);
}

// ==================== 计划字段 ====================
/** 应用推广-推广目标：2 应用下载 / 6 应用调起 */
const APP_EXTENSION_SELECT = [
  { label: "应用下载", value: 2 },
  { label: "应用调起", value: 6 }
];

const campaignFormFields = [
  {
    component: "AdNameGen",
    fieldName: "planName",
    label: "计划名称",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "extensionType",
    componentProps: { options: APP_EXTENSION_SELECT, allowClear: false },
    label: "推广目标",
    defaultValue: 2,
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "dayLimit",
    componentProps: { options: DAYLIMIT_SELECT },
    label: "是否限制日预算",
    defaultValue: 0
  },
  {
    component: "Input",
    fieldName: "dayBudget",
    label: "日预算（分）",
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => currentValue["dayLimit"] === 1,
      triggerFields: ["dayLimit"]
    }
  },
  {
    component: "Select",
    fieldName: "deliveryMode",
    componentProps: { options: DELIVERMODE_SELECT },
    label: "竞价策略",
    defaultValue: 0,
    rules: "required"
  }
];

const campaignShowLabel: Record<string, string> = {
  planName: "计划名称",
  extensionType: "推广目标",
  dayLimit: "日预算限制",
  dayBudget: "日预算",
  deliveryMode: "竞价策略"
};


/**
 * 广告组字段
 */
const adgroupFormFields: any[] = [
  {
    component: "AdNameGen",
    fieldName: "adGroupName",
    label: "广告组名称",
    rules: "required"
  },

  {
    component: "Select",
    fieldName: "billingType",
    componentProps: { options: BILLINGTYPE_SELECT },
    label: "计费方式",
    rules: "required",
    defaultValue: 1
  },

  // appApiField,
  {
    component: "Select",
    fieldName: "extensionFlow",
    rules: "required",
    componentProps: {
      options: FLOW_SELECT,
      allowClear: true
    },
    label: "推广流量",
    dependencies: {
      triggerFields: ["*"]
    }
  },
  {
    component: "Select",
    fieldName: "flowScene",
    rules: "required",
    componentProps: {
      options: FLOWSCENE_SELECT
    },
    label: "流量场景",
    dependencies: {
      triggerFields: ["extensionFlow"]
    }
  },

  {
    component: "Select",
    fieldName: "ocpcOptmType",
    componentProps: {
      options: OCPC_OPTM_TYPE_OPTIONS
    },
    label: "区分ocpc出价类型"
  },

  {
    component: "Select",
    fieldName: "ocpcType",
    rules: "required",
    componentProps: {
      options: DEEP_CV_SELECT
    },
    label: "目标转化类型",
    dependencies: {
      // show: (currentValue: any) => currentValue["ocpcOptmType"] === 1 || currentValue["billingType"] === 5,
      // triggerFields: ["ocpcOptmType"]
    }
  },

  {
    component: "InputNumber",
    fieldName: "ocpcPrice",
    rules: "required",
    componentProps: {},
    label: "目标转化出价",
    dependencies: {}
  },


  {
    component: "Input",
    fieldName: "deepUrl",
    label: "目标转化出价",
    defaultValue: "",
    dependencies: {
      show: (currentValue: any) => currentValue["flowScene"] === 14,
      triggerFields: ["flowScene"]
      // 直达链接
      // 备注：当flowScene=14（通知栏）时，deepUrl传值为应用内页
    }
  },

  {
    component: "Select",
    fieldName: "dayLimit",
    componentProps: { options: DAY_LIMIT_SELECT },
    label: "推广日期限制",
    defaultValue: 0,
    rules: "required"
  },
  {
    component: "DatePicker",
    fieldName: "beginTime",
    label: "推广开始时间",
    defaultValue: "",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    rules: "required",
    dependencies: {
      show: (currentValue: any) => currentValue["dayLimit"] === 1,
      triggerFields: ["dayLimit"]
    }
  },
  {
    component: "DatePicker",
    fieldName: "endTime",
    label: "推广结束时间",
    defaultValue: "",
    componentProps: { format: "YYYY-MM-DD", valueFormat: "YYYY-MM-DD" },
    rules: "required",
    dependencies: {
      show: (currentValue: any) => currentValue["dayLimit"] === 1,
      triggerFields: ["dayLimit"]
    }
  },

  {
    component: "InputNumber",
    fieldName: "price",
    label: "基础出价",
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => currentValue["billingType"] === 2 || currentValue["billingType"] === 5,
      triggerFields: ["billingType"]
    }
  },

  {
    component: "Select",
    fieldName: "deepOcpcType",
    componentProps: { options: DEEP_CV_SELECT },
    label: "深度转化类型",
    defaultValue: 0,
    dependencies: {
      show: (currentValue: any) => currentValue["ocpcOptmType"] === 1,
      triggerFields: ["ocpcOptmType"]
    }
  },
  {
    component: "InputNumber",
    fieldName: "deepOcpcPrice",
    label: "深度转化出价（分）",
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => currentValue["ocpcOptmType"] === 1,
      triggerFields: ["ocpcOptmType"]
    }
  },
  {
    component: "Select",
    fieldName: "smartExpandType",
    componentProps: { options: SMART_EXPAND_SELECT },
    label: "智能扩量",
    defaultValue: 0
  },
  {
    component: "Select",
    fieldName: "timeLimit",
    componentProps: { options: TIME_LIMIT_SELECT },
    label: "推广时段限制",
    defaultValue: 0,
    rules: "required"
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: "timeSet",
    label: "推广时段",
    rules: "required",
    dependencies: {
      show: (currentValue: any) => currentValue["timeLimit"] === 1,
      triggerFields: ["timeLimit"]
    }
  },

  {
    component: "Select",
    fieldName: "pageType",
    label: "落地页类型",
    rules: "required",
    componentProps: {
      options: PAGE_TYPE_SELECT
    }
  }

];

const adgroupShowLabel: Record<string, string> = {
  adGroupName: "广告组名称",
  billingType: "计费方式",
  ocpcType: "目标转化类型",
  price: "基础出价",
  dayLimit: "推广日期限制",
  beginTime: "开始时间",
  endTime: "结束时间",
  flowScene: "流量场景"
};

// ==================== 广告(创意)字段 ====================
const promotionFormFields = [
  {
    component: "AdNameGen",
    fieldName: "adName",
    label: "广告名称",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "globalSpecId",
    componentProps: { options: GLOBAL_SPECID_SELECT },
    label: "统一规格",
    defaultValue: 63,
    rules: "required"
  },
  {
    component: "Input",
    fieldName: "brandName",
    label: "品牌名称",
    rules: "required",
    defaultValue: ""
  },
  {
    component: "Input",
    fieldName: "buttonTxt",
    label: "按钮文案",
    rules: "required",
    defaultValue: ""
  }
];

const promotionShowLabel: Record<string, string> = {
  adName: "广告名称",
  globalSpecId: "规格",
  brandName: "品牌名称",
  copywriter: "广告文案",
  dynamicCr: "是否衍生",
  clickUrl: "点击链接"
};

// 展示卡字段值 -> 文案（在全局 map 之上补充应用推广枚举）
const optionLabel = (options: { label: string; value: any }[]) => (value: any) =>
  options.find((o) => o.value === value)?.label ?? value;

const appFieldLabelMap: Record<string, (value: any) => string> = {
  ...fieldLabelMap,
  extensionType: optionLabel(APP_EXTENSION_SELECT),
  deliveryMode: optionLabel(DELIVERMODE_SELECT),
  dayLimit: (v) => (Number(v) === 1 ? "是" : "否"),
  billingType: optionLabel(BILLINGTYPE_SELECT),
  globalSpecId: optionLabel(GLOBAL_SPECID_SELECT),
  appId: (v) => String(v ?? "")
};
</script>

<template>
  <Row :gutter="16">
    <Col :span="5">
      <OppoCampaign
        :form-fields="campaignFormFields"
        :campaign-show-label="campaignShowLabel"
        :campaign="creationInfo?.configData.campaign"
        :field-label-map="appFieldLabelMap"
        @update:campaign="updateCampaign"
      />
    </Col>

    <Col :span="5">
      <OppoAdgroup
        :form-fields="adgroupFormFields"
        :adgroup-show-label="adgroupShowLabel"
        :adgroup="creationInfo?.configData.adgroup"
        :field-label-map="appFieldLabelMap"
        @update:adgroup="updateAdgroup"
      />
    </Col>

    <Col :span="5">
      <OppoPromotion
        :form-fields="promotionFormFields"
        :promotion-show-label="promotionShowLabel"
        :promotion="creationInfo?.configData.promotion"
        :field-label-map="appFieldLabelMap"
        @update:promotion="updatePromotion"
      />
    </Col>

    <Col :span="5">
      <CreativeGroupSelector
        :account-info="creationInfo.accountInfo"
        :material="creationInfo.configData.material"
        @update:material="updateMaterial"
      />
    </Col>

    <Col :span="4">
      <div class="combined-area">
        <PageViewSelector
          :disabled="showPageViewSelector"
          :page-view="creationInfo.configData.landingPage"
          :account-info="creationInfo.accountInfo"
          @update:page-view="updateLandingPage"
        />

        <TitleSelector
          :title-package="creationInfo.configData.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:title-package="updateTitlePackage"
        />

        <AudiencePackageSelector
          :audience="creationInfo.configData.audience"
          :account-info="creationInfo.accountInfo"
          :platform="Platform.OPPO"
          @update:audience="updateAudiencePackage"
        />
      </div>
    </Col>
  </Row>
</template>


<style scoped lang="scss">

.equal-height-row {
  display: flex;
  align-items: stretch;
  height: 750px;
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
