<script setup lang="ts">
// vivo 应用推广模板
// 模板具体信息
import type {
  ChannelPackageValue,
  QualificationValue,
  VivoAdgroupData,
  VivoCampaignData,
  VivoCreation,
  VivoPromotionData
} from "#/views/marketing/creation/vivo/vivo";
import {
  BILLINGTYPE_SELECT,
  CONVERSION_SELECT,
  DELIVER_SELECT,
  MEDIA_SELECT,
  PHASETWOGOAL_SELECT
} from "#/views/marketing/creation/vivo/projectEnum";
import { Col, Row } from "ant-design-vue";
import {markRaw} from "vue";
import VivoCampaign from "#/views/marketing/creation/vivo/components/VivoCampaign.vue";
import VivoAdgroup from "#/views/marketing/creation/vivo/components/VivoAdgroup.vue";
import VivoPromotion from "#/views/marketing/creation/vivo/components/VivoPromotion.vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";

import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import VivoAdPlacementQualification
  from "#/views/marketing/creation/vivo/components/VivoAdPlacementQualification.vue";

const emit = defineEmits([
  "update:campaign",
  "update:adgroup",
  "update:adQualification",
  "update:channelPackage",
  "update:audiencePackage",
  "update:promotion",
  "update:pageView",
  "update:titlePackage",
  "update:material"
]);

/**
 * update campaign
 */
function updateCampaign(campaign: VivoCampaignData) {
  emit("update:campaign", campaign);
}


/**
 * update adgroup
 */
function updateAdgroup(adgroup: VivoAdgroupData) {
  emit("update:adgroup", adgroup);
}


/**
 * 更新投放资质
 */
function updateAdQualification(adQualification: Map<string, QualificationValue>) {
  emit("update:adQualification", adQualification);
}

/**
 * 更新渠道包
 */
function updateChannelPackage(channelPackage: Map<string, ChannelPackageValue>) {
  emit("update:channelPackage", channelPackage);
}


/**
 * 更新定向包
 */
function updateAudiencePackage(audience: AudienceConfigData) {
  emit("update:audiencePackage", audience);
}


/**
 * update promotion
 */
function updatePromotion(promotion: VivoPromotionData) {
  emit("update:promotion", promotion);
}

/**
 * 更新落地页
 * @param landingPage
 */
function updatePageView(landingPage: PageViewConfigData) {
  emit("update:pageView", landingPage);
}

/**
 * 编辑标题包
 * @param titlePackage 标题包
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit("update:titlePackage", titlePackage);
}


/**
 * 更新素材
 */
function updateMaterial(materialData: MaterialData) {
  emit("update:material", materialData);
}

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => VivoCreation,
    default: () => {
      return {};
    }
  }
});

// 模板计划初始化信息
const campaign: VivoCampaignData = {
  adType: 2, // 应用下载模板
  campaignType: 0,
  conversionMonitorType: 0,
  dailyBudget: 200,
  mediaType: 0,
  name: "",
  promotionType: 0,
  pushForm: 0,
  pushType: 0
};


// vivo计划表单字段配置
// 应用推广模式下
const campaignFormFields = [
  {
    component: "AdNameGen",
    fieldName: "name",
    label: "计划名称",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "mediaType",
    label: "媒体类型",
    rules: "required",
    componentProps: {
      options: MEDIA_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "dailyBudget",
    label: "计划日限额",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "conversionMonitorType",
    label: "转化监测",
    componentProps: {
      options: CONVERSION_SELECT
    }
  }
];


// 展示列表
const campaignShowLabel: Record<string, string> = {
  name: "计划名字",
  mediaType: "媒体类型",
  dailyBudget: "计划日限额",
  conversionMonitorType: "转化监测"
};

// 广告组
const adgroup: VivoAdgroupData = {
  advertiseQualificationId: "",
  apkId: "",
  appPackageName: creationInfo.project.packageName,
  appletOriginId: "",
  appletPath: "",
  biddingStrategy: 0,
  builtInRpkDeepLink: "",
  campaignId: 0,
  channelId: "",
  chargeType: 0,
  conversionFilterCycle: 0,
  cvType: 1,
  dailyBudget: 200,
  endDate: "",
  h5Code: "",
  h5Type: 0,
  industry1: "",
  industry2: "",
  name: "",
  ocpxPrice: 0,
  price: 0,
  productUrlType: 0,
  retrieveType: 0,
  rpkDeepLink: "",
  ruleAudience: "",
  scheduleTime: "",
  secondCvType: 0,
  secondOcpxPrice: 0,
  spentType: 0,
  startDate: "",
  subpackageId: 0,
  webSiteUrl: "",
  wechatFollow: 0
};


const adgroupFormFields = [
  {
    component: "AdNameGen",
    fieldName: "name",
    label: "广告组名称",
    rules: "required"
  },
  {
    component: markRaw(VivoAdPlacementQualification),
    fieldName: "advertiseQualificationId",
    rules: "required",
    label: "投放资质",
    componentProps: {
      accountInfo: creationInfo.accountInfo,
      // advertiserQualification: creationInfo.configData.advertiserQualification,
      // 触发数据变化emit到上层
      updateQualificationValue: (val: Map<string, QualificationValue>) => {
        emit("update:adQualification", val)
      }
    }
  },
  {
    component: "Input",
    fieldName: "price",
    label: "一阶段出价",
    rules: "required",
  }, {
    component: "Input",
    fieldName: "dailyBudget",
    label: "日预算",
    rules: "required",
  },
  {
    component: "Select",
    fieldName: "cvType",
    label: "转化目标",
    formItemClass: "w-[300px]",
    componentProps: {
      options: PHASETWOGOAL_SELECT
    },
    rules: "required"
  },
  {
    component: "DatePicker",
    fieldName: "startDate",
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    label: "开始日期",
    rules: "required"
  },
  {
    component: "DatePicker",
    fieldName: "endDate",
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    label: "结束日期",
    rules: "required"
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: "scheduleTime",
    label: "广告投放时段",
    rules: "required",
    formItemClass: 'auto',
  },
  {
    component: "Select",
    fieldName: "chargeType",
    label: "计费类型",
    rules: "required",
    defaultValue: 2,
    componentProps: {
      options: BILLINGTYPE_SELECT
    }
  },
  {
    component: "Select",
    fieldName: "spentType",
    label: "投放状态",
    rules: "required",
    defaultValue: 2,
    componentProps: {
      options: DELIVER_SELECT
    }
  }
];


const adgroupShowLabel: Record<string, string> = {
  name: "广告组名称",
  chargeType: "计费类型",
  price: "一阶段出价",
  cvType: "转化目标"
};


const promotionFormFields = [
  {
    component: "AdNameGen",
    fieldName: "name",
    label: "广告名称",
    rules: "required"
  },
  {
    component: "Switch",
    fieldName: "generalSwitch",
    label: "流量优选",
    defaultValue: false,
    formItemClass: "w-[250px]"
  }
];

const promotionShowLabel: Record<string, string> = {
  name: "广告名字",
  placeType: "展现形式",
  generalSwitch: "流量优选"
};

defineExpose({
  campaign,
  adgroup
});

</script>

<template>
  <div class="vivo-application-template">
    <Row :gutter="16" class="equal-height-row">
      <Col :span="5" class="equal-height-col">
        <VivoCampaign
          :campaign="creationInfo.configData.campaign"
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :account-info="creationInfo.accountInfo"
          :has-account="creationInfo.accountInfo.length > 0"
          :has-product="!!creationInfo.project.projectId"
          @update:campaign="updateCampaign"
        >
        </VivoCampaign>
      </Col>

      <Col :span="5" class="equal-height-col">
        <VivoAdgroup
          :adgroup="creationInfo.configData.adgroup"
          :form-fields="adgroupFormFields"
          :adgroup-show-label="adgroupShowLabel"
          :campaign="creationInfo.configData.campaign"
          :account-info="creationInfo.accountInfo"
          :audience="creationInfo.configData.audience"
          :advertiser-qualification="creationInfo?.configData.advertiserQualification"
          :channel-package="creationInfo?.configData.channelPackage"
          @update:adgroup="updateAdgroup"
          @update:adQualification="updateAdQualification"
          @update:channelPackage="updateChannelPackage"
          @update:audiencePackage="updateAudiencePackage"
        />
      </Col>

      <Col :span="5" class="equal-height-col">
        <VivoPromotion
          :promotion="creationInfo?.configData.promotion"
          :form-fields="promotionFormFields"
          :promotion-show-label="promotionShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :account-info="creationInfo.accountInfo"
          :landing-page="creationInfo.configData.landingPage"
          :has-account="creationInfo.accountInfo.length > 0"
          :has-product="!!creationInfo.project.projectId"
          :advertiser-qualification="creationInfo.configData.advertiserQualification"
          @update:promotion="updatePromotion"
          @update:page-view="updatePageView"
        />
      </Col>


      <Col :span="5" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          :rule-info="creationInfo.ruleInfo"
          @update:material="updateMaterial"
        />
      </Col>

      <Col :span="4" class="equal-height-col">
        <TitleSelector
          :title-package="creationInfo.configData.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:titlePackage="updateTitlePackage"
        />
      </Col>

    </Row>
  </div>
</template>

<style scoped lang="scss">
.vivo-application-template {
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
