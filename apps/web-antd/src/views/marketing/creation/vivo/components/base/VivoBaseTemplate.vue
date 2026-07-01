<script setup lang="ts" name="VivoBaseTemplate">
// vivo基础模板
import { Col, Row } from "ant-design-vue";

import VivoCampaign from "#/views/marketing/creation/vivo/components/VivoCampaign.vue";
import VivoAdgroup from "#/views/marketing/creation/vivo/components/VivoAdgroup.vue";
import VivoPromotion from "#/views/marketing/creation/vivo/components/VivoPromotion.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";

import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  ChannelPackageValue,
  QualificationValue,
  VivoAdgroupData,
  VivoCampaignData,
  VivoCreation,
  VivoPromotionData
} from "#/views/marketing/creation/vivo/vivo";
import {
  ADTYPE_SELECT,
  BID_SELECT,
  BILLINGTYPE_SELECT,
  COMMODITYURL_SELECT,
  CONVERSION_SELECT,
  DELIVER_SELECT,
  MEDIA_SELECT,
  NOTIFICATIONTYPE_SELECT,
  NOTIFORMAT_SELECT,
  PHASETWOGOAL_SELECT,
  PROJRCT_SELECT,
  PROMOTION_SELECT,
  PROMOTIONLINK_SELECT
} from "#/views/marketing/creation/vivo/projectEnum";

const emit = defineEmits(["update:campaign", "update:adgroup", "update:promotion",
  "update:audiencePackage", "update:material", "update:titlePackage",
  "update:adQualification", "update:channelPackage", "adTypeChanged", "update:pageView"]);

/**
 * vivo基础模板props
 * 包含creationInfo
 */
const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => VivoCreation,
    default: () => {
      return {};
    }
  }
});

/**
 * vivo计划表单字段配置
 * 在VivoBaseTemplate内部定义，传入到VivoCampaign组件
 */
const campaignFormFields = [
  {
    component: "Input",
    fieldName: "name",
    label: "计划名称",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "adType",
    label: "推广目标",
    rules: "required",
    componentProps: {
      options: PROJRCT_SELECT
    }
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
    fieldName: "campaignType",
    label: "广告类型",
    componentProps: {
      options: ADTYPE_SELECT
    }
  },
  {
    component: "Select",
    fieldName: "pushForm",
    label: "通知形式",
    componentProps: {
      options: NOTIFORMAT_SELECT
    }
  },
  {
    component: "Select",
    fieldName: "pushType",
    label: "通知类型",
    componentProps: {
      options: NOTIFICATIONTYPE_SELECT
    }
  },
  {
    component: "Select",
    fieldName: "promotionType",
    label: "推广模式",
    componentProps: {
      options: PROMOTION_SELECT
    }
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

/**
 * vivo计划展示label配置
 */
const campaignShowLabel: Record<string, string> = {
  name: "计划名字",
  adType: "推广目标",
  mediaType: "媒体类型",
  dailyBudget: "计划日限额",
  campaignType: "广告类型",
  pushForm: "通知形式",
  pushType: "通知类型",
  promotionType: "推广模式",
  conversionMonitorType: "转化监测"
};

/**
 * vivo广告组表单字段配置
 * 在VivoBaseTemplate内部定义，传入到VivoAdgroup组件
 */
const adgroupFormFields = [
  {
    component: "Input",
    fieldName: "name",
    label: "广告组名称",
    rules: "required"
  },
  {
    component: "Input",
    fieldName: "rpkDeepLink",
    label: "快应用deepLink地址"
  },
  {
    component: "Input",
    fieldName: "webSiteUrl",
    label: "推广链接"
  },
  {
    component: "Input",
    fieldName: "h5Code",
    label: "推广链接编码"
  },
  {
    component: "Select",
    fieldName: "h5Type",
    label: "推广链接类型",
    componentProps: {
      options: PROMOTIONLINK_SELECT
    }
  },
  {
    component: "Select",
    fieldName: "productUrlType",
    label: "商品URL类型",
    componentProps: {
      options: COMMODITYURL_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "appletOriginId",
    label: "小程序id"
  },
  {
    component: "Input",
    fieldName: "appletPath",
    label: "小程序页面路径"
  },
  {
    component: "Select",
    fieldName: "chargeType",
    label: "计费类型",
    componentProps: {
      options: BILLINGTYPE_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "price",
    label: "一阶段出价"
  },
  {
    component: "Select",
    fieldName: "cvType",
    label: "转化目标",
    componentProps: {
      options: PHASETWOGOAL_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "ocpxPrice",
    label: "转化出价"
  },
  {
    component: "Select",
    fieldName: "secondCvType",
    label: "深度优化转化目标",
    componentProps: {
      options: PHASETWOGOAL_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "secondOcpxPrice",
    label: "深度优化出价"
  },
  {
    component: "Select",
    fieldName: "biddingStrategy",
    label: "出价策略",
    componentProps: {
      options: BID_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "industry1",
    label: "一级行业分类id"
  },
  {
    component: "Input",
    fieldName: "industry2",
    label: "二级行业分类id"
  },
  {
    component: "Input",
    fieldName: "advertiseQualificationId",
    label: "投放资质"
  },
  {
    component: "Input",
    fieldName: "dailyBudget",
    label: "日预算"
  },
  {
    component: "Select",
    fieldName: "spentType",
    label: "投放状态",
    componentProps: {
      options: DELIVER_SELECT
    }
  },
  {
    component: "Input",
    fieldName: "startDate",
    label: "开始日期"
  },
  {
    component: "Input",
    fieldName: "endDate",
    label: "结束日期"
  },
  {
    component: "Input",
    fieldName: "scheduleTime",
    label: "广告投放时段"
  },
  {
    component: "Input",
    fieldName: "wechatFollow",
    label: "微信关注"
  }
];

/**
 * vivo广告组展示label配置
 */
const adgroupShowLabel: Record<string, string> = {
  name: "广告组名称",
  webSiteUrl: "推广链接",
  chargeType: "计费类型",
  price: "一阶段出价",
  cvType: "转化目标"
};

/**
 * 广告属性
 */
const promotionFormFields = [
  {
    component: "Input",
    fieldName: "name",
    label: "广告名称",
    rules: "required"
  },
  {
    component: "Input",
    fieldName: "deepLink",
    label: "快应用deepLink地址"
  },
  {
    component: "Input",
    fieldName: "videoAttribution",
    label: "视频类型拓展归因"
  },
  {
    component: "Switch",
    fieldName: "generalSwitch",
    label: "流量优选开关",
    defaultValue: false,
    formItemClass: "w-[250px]"
  }
];
/**
 *
 */
const promotionShowLabel: Record<string, string> = {
  name: "广告名字",
  placeType: "展现形式",
  generalSwitch: "流量优选"
};

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
 * update promotion
 */
function updatePromotion(promotion: VivoPromotionData) {
  emit("update:promotion", promotion);
}

/**
 * 计划推广目标变更时的回调
 */
function handleAdTypeChanged() {
  emit("adTypeChanged");
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
 * 更新素材
 */
function updateMaterial(materialData: MaterialData) {
  emit("update:material", materialData);
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
</script>

<template>
  <div class="vivo-base-template">
    <Row :gutter="16" class="equal-height-row">
      <Col :span="5" class="equal-height-col">
        <VivoCampaign
          :campaign="creationInfo?.configData.campaign"
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :account-info="creationInfo.accountInfo"
          :has-account="creationInfo.accountInfo.length > 0"
          :has-product="!!creationInfo.project.projectId"
          @update:campaign="updateCampaign"
          @adTypeChanged="handleAdTypeChanged"
        />
      </Col>

      <Col :span="5" class="equal-height-col">
        <VivoAdgroup
          :adgroup="creationInfo?.configData.adgroup"
          :form-fields="adgroupFormFields"
          :adgroup-show-label="adgroupShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :account-info="creationInfo.accountInfo"
          :audience="creationInfo?.configData.audience"
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
          @update:promotion="updatePromotion"
          @update:page-view="updatePageView"
        />
      </Col>

      <Col :span="5" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
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
.vivo-base-template {
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
