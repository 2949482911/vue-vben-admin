<script setup lang="ts">
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
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

import { markRaw } from "vue";

import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import VivoAdgroup from "#/views/marketing/creation/vivo/components/VivoAdgroup.vue";
import VivoAdPlacementQualification
  from "#/views/marketing/creation/vivo/components/VivoAdPlacementQualification.vue";
import VivoCampaign from "#/views/marketing/creation/vivo/components/VivoCampaign.vue";
import VivoPromotion from "#/views/marketing/creation/vivo/components/VivoPromotion.vue";
import {
  BILLINGTYPE_SELECT,
  CONVERSION_SELECT,
  DELIVER_SELECT,
  MEDIA_SELECT,
  PHASETWOGOAL_SELECT
} from "#/views/marketing/creation/vivo/projectEnum";

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => VivoCreation,
    default: () => {
      return {};
    }
  }
});

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
    <div class="panes">
      <div class="pane">
        <VivoCampaign
          :campaign="creationInfo.configData.campaign"
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :account-info="creationInfo.accountInfo"
          :has-account="creationInfo.accountInfo.length > 0"
          :has-product="!!creationInfo.project.projectId"
          @update:campaign="updateCampaign"
        />
      </div>

      <div class="pane">
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
          @update:ad-qualification="updateAdQualification"
          @update:channel-package="updateChannelPackage"
          @update:audience-package="updateAudiencePackage"
        />
      </div>

      <div class="pane">
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
      </div>

      <div class="pane">
        <div class="combined-area">
          <CreativeGroupSelector
            :account-info="creationInfo.accountInfo"
            :material="creationInfo.configData.material"
            :rule-info="creationInfo.ruleInfo"
            @update:material="updateMaterial"
          />
          <TitleSelector
            :title-package="creationInfo.configData.titlePackage"
            :account-info="creationInfo.accountInfo"
            @update:title-package="updateTitlePackage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vivo-application-template {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.panes {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }

  :deep(.ant-card) {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  :deep(.ant-card-head) {
    flex-shrink: 0 !important;
  }

  :deep(.ant-card-body) {
    display: flex !important;
    flex: 1 1 0% !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-content) {
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-footer) {
    flex-shrink: 0 !important;
  }
}

.combined-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1 1 0%;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
