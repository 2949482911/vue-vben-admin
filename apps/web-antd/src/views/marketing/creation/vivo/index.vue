<script setup lang="ts">
import { Page, useVbenModal } from "@vben/common-ui";
import { Card, message, Select } from "ant-design-vue";
import ConfigurationConfig from "../components/configurationArea.vue";
import VivoBaseTemplate from "./components/base/VivoBaseTemplate.vue";
import Function from "../components/Function.vue";
import VivoPreviewArea from "./components/VivoPreviewArea.vue";
import CreateStrategyGroup from "../components/createStrategyGroup.vue";
import { ref, watch } from "vue";

import { VIVO_MARKETING_TYPE } from "#/views/marketing/creation/vivo/components/enums";

import type {
  ChannelPackageValue,
  QualificationValue,
  VivoAdgroupData,
  VivoCampaignData,
  VivoCreation,
  VivoPromotionData
} from "#/views/marketing/creation/vivo/vivo";
import { Platform } from "#/constants/enums";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import type {
  AccountInfo,
  AudienceConfigData,
  Material,
  MaterialData,
  MonitoringLinkConfigData,
  PageViewConfigData,
  Project,
  RuleInfo,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { vivoRuleConfiguration, vivoRuleOptions } from "./rules";
import { getVivoTableData } from "./vivo";
import type { PageViewItem } from "#/api/models/assert";

// 预览数据列表
const adList = ref<Array<any>>([]);
const template = ref<string>("base_template");

function updateTemplate(changeVal: string) {
  template.value = changeVal;
}

// 策略组保存弹窗
const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  }
});

// vivo创建信息
const creationInfo = ref<VivoCreation>({
  version: "",
  project: {
    projectId: "",
    projectName: "",
    icon: "",
    packageName: ""
  },
  accountInfo: [],
  configData: {
    // 渠道包
    channelPackage: new Map<string, ChannelPackageValue>(),
    deepLinkList: {
      deepLinkConfig: {
        method: "all"
      },
      data: new Map<string, Array<string>>()
    },
    // 投放资质
    advertiserQualification: new Map<string, QualificationValue>(),
    campaign: {
      name: "",
      adType: 2,
      mediaType: 1,
      dailyBudget: 200,
      campaignType: 0,
      pushForm: 0,
      pushType: 0,
      promotionType: 0,
      conversionMonitorType: 0
    },
    adgroup: {
      apkId: "",
      appPackageName: "",
      appletOriginId: "",
      appletPath: "",
      biddingStrategy: 0,
      builtInRpkDeepLink: "",
      campaignId: 0,
      channelId: "",
      chargeType: null,
      conversionFilterCycle: 0,
      cvType: "",
      dailyBudget: -1,
      endDate: "",
      h5Code: "",
      h5Type: null,
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
      secondCvType: null,
      secondOcpxPrice: 0,
      spentType: null,
      startDate: "",
      subpackageId: 0,
      webSiteUrl: "",
      wechatFollow: 0
    },
    promotion: {
      groupId: "",
      name: "",
      deepLink: "",
      videoAttribution: 0,
      pageUrl: "",
      h5Code: "",
      h5Type: 0,
      generalSwitch: 0,
      config: {
        videoMaxCount: 5,
        imageMaxCount: 5,
        materialNormId: 0,
        placeType: 0,
        strongReminder: 0,
        virtualPositionId: ""
      }
    },
    audience: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<TargetedPackageTypeItem>>()
    },
    material: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Material[]>()
    },
    titlePackage: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<TitlePackageItem>>()
    },
    landingPage: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<PageViewItem>>()
    },
    monitoringLink: {
      config: {
        method: RuleMethod.ALL
      },
      linkType: RuleMethod.MANUAL,
      data: new Map()
    }
  },
  platform: Platform.VIVO,
  ruleInfo: {
    projectRuleKey: RuleKey.TARGET,
    projectCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adGroupCount: 1,
    adRuleKey: RuleKey.CREATIVE,
    adCount: 1,
    creativeRuleKey: RuleKey.CREATIVE_GROUP,
    creativeCount: 0
  },
  monitoringLink: {
    clickLink: "",
    exposureLink: "",
    monitorLink: "",
    linkModeType: "manual",
    allocateType: "all",
    ocpxTaskId: ""
  },
  configurationConfig: {
    platform: Platform.VIVO
  }
});

// 监听数据变化，自动清空预览区
watch(
  () => creationInfo.value,
  () => {
    if (adList.value.length > 0) {
      adList.value = [];
      message.warn("配置已更新，预览区已重置");
    }
  },
  { deep: true }
);

/**
 * 更新账户信息
 */
function updateAccountInfo(accountInfo: Array<AccountInfo>) {
  creationInfo.value.accountInfo = accountInfo;
}

/**
 * 更新产品信息
 */
function updateProject(project: Project) {
  creationInfo.value.project = project;
}

/**
 * 更新规则信息
 */
function updateRuleInfo(ruleInfo: RuleInfo) {
  creationInfo.value.ruleInfo = ruleInfo;
}

/**
 * 复用策略组
 */
function updateReuse(vivoCreation: VivoCreation) {
  // 核心：在赋值前，恢复被丢失的 Map 类型（JSON 序列化后 Map 变成普通对象）
  if (vivoCreation.configData) {
    const config = vivoCreation.configData;

    // 1. 恢复 advertiserQualification
    if (!(config.advertiserQualification instanceof Map)) {
      config.advertiserQualification = new Map(
        Object.entries(config.advertiserQualification || {})
      );
    }

    // 2. 恢复 audience.data
    if (config.audience && !(config.audience.data instanceof Map)) {
      config.audience.data = new Map(Object.entries(config.audience.data || {}));
    }

    // 3. 恢复 material.data
    if (config.material && !(config.material.data instanceof Map)) {
      config.material.data = new Map(Object.entries(config.material.data || {}));
    }

    // 4. 恢复 titlePackage.data
    if (config.titlePackage && !(config.titlePackage.data instanceof Map)) {
      config.titlePackage.data = new Map(Object.entries(config.titlePackage.data || {}));
    }

    // 5. 恢复 landingPage.data
    if (config.landingPage && !(config.landingPage.data instanceof Map)) {
      config.landingPage.data = new Map(Object.entries(config.landingPage.data || {}));
    }

    // 6. 恢复 channelPackage
    if (!(config.channelPackage instanceof Map)) {
      config.channelPackage = new Map(Object.entries(config.channelPackage || {}));
    }

    // 7. 恢复 monitoringLink.data
    if (config.monitoringLink && !(config.monitoringLink.data instanceof Map)) {
      config.monitoringLink.data = new Map(
        Object.entries(config.monitoringLink.data || {})
      );
    }
  }

  creationInfo.value = vivoCreation;
}

/**
 * 更新计划信息
 */
function updateCampaign(campaign: VivoCampaignData) {
  creationInfo.value.configData.campaign = campaign;
}

/**
 * 计划推广目标变更时的回调
 */
function handleAdTypeChanged() {
  // 如果推广目标改变，清空广告组数据
  creationInfo.value.configData.adgroup = {
    apkId: "",
    appPackageName: "",
    appletOriginId: "",
    appletPath: "",
    biddingStrategy: 0,
    builtInRpkDeepLink: "",
    campaignId: 0,
    channelId: "",
    chargeType: null,
    conversionFilterCycle: 0,
    cvType: "",
    dailyBudget: -1,
    endDate: "",
    h5Code: "",
    h5Type: null,
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
    secondCvType: null,
    secondOcpxPrice: 0,
    spentType: null,
    startDate: "",
    subpackageId: 0,
    webSiteUrl: "",
    wechatFollow: 0
  };
  creationInfo.value.configData.advertiserQualification = new Map<string, QualificationValue>();
  creationInfo.value.configData.channelPackage = new Map<string, ChannelPackageValue>();
  message.warning("推广目标已变更，请重新完善广告组信息");
}

/**
 * 更新广告组信息
 */
function updateAdgroup(adgroup: VivoAdgroupData) {
  creationInfo.value.configData.adgroup = adgroup;
}

/**
 * 更新广告信息
 */
function updatePromotion(promotion: VivoPromotionData) {
  creationInfo.value.configData.promotion = promotion;
}

/**
 * 更新投放资质
 */
function updateAdQualification(adQualification: Map<string, QualificationValue>) {
  creationInfo.value.configData.advertiserQualification = adQualification;
}

/**
 * 更新渠道包
 */
function updateChannelPackage(channelPackage: Map<string, ChannelPackageValue>) {
  creationInfo.value.configData.channelPackage = channelPackage;
}

/**
 * 更新定向包
 */
function updateAudiencePackage(audience: AudienceConfigData) {
  creationInfo.value.configData.audience = audience;
}

/**
 * 更新素材
 */
function updateMaterial(material: MaterialData) {
  creationInfo.value.configData.material = material;
}

/**
 * 更新标题包
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  creationInfo.value.configData.titlePackage = titlePackage;
}

/**
 * 更新监测链接
 */
function updateMonitoringLink(monitoringLink: MonitoringLinkConfigData) {
  creationInfo.value.configData.monitoringLink = monitoringLink;
}


/**
 * 更新落地页
 * @param landingPage
 */
function updatePageView(landingPage: PageViewConfigData) {
  creationInfo.value.configData.landingPage = landingPage;
}

/**
 * 保存策略组
 */
function createStrategyGroup() {
  createStrategyGroupApi.setData(creationInfo.value);
  createStrategyGroupApi.open();
}

/**
 * 生成预览数据
 */
function genPreviewTableData() {
  adList.value = getVivoTableData(creationInfo.value);
}

/**
 * 提交创建批投
 */
function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error("请先生成预览数据");
    return;
  }
  // TODO: 实现提交逻辑
}
</script>

<template>
  <Page auto-content-height>
    <!-- 配置区 -->
    <Card class="header">
      <ConfigurationConfig
        :rule-info="creationInfo.ruleInfo"
        :configuration-config="creationInfo.configurationConfig"
        :account-info="creationInfo.accountInfo"
        :project="creationInfo.project"
        :rule-configuration="vivoRuleConfiguration"
        :rule-options="vivoRuleOptions"
        @update:accountInfo="updateAccountInfo"
        @update:productInfo="updateProject"
        @update:ruleInfo="updateRuleInfo"
        @update:reuse="updateReuse"
      />
    </Card>

    <!-- 基础模板（包含计划、广告组、定向包、创意组、标题包） -->

    <Card class="header">
      <Select class='w-[200px]'
              :options="VIVO_MARKETING_TYPE"
              :value="template"
              @change="updateTemplate"
      ></Select>
    </Card>

    <Card class="header">
      <VivoBaseTemplate v-if="template === 'base_template'"
                        :creation-info="creationInfo"
                        @update:campaign="updateCampaign"
                        @update:adgroup="updateAdgroup"
                        @update:promotion="updatePromotion"
                        @update:audiencePackage="updateAudiencePackage"
                        @update:material="updateMaterial"
                        @update:titlePackage="updateTitlePackage"
                        @update:adQualification="updateAdQualification"
                        @update:channelPackage="updateChannelPackage"
                        @update:page-view="updatePageView"
                        @adTypeChanged="handleAdTypeChanged"
      />
    </Card>

    <!-- 监测链接组 -->
    <Card class="header">
      <Function
        :accountInfo="creationInfo.accountInfo"
        :monitoring-link="creationInfo.configData.monitoringLink"
        @update:monitoring-link="updateMonitoringLink"
        @save:createStrategyGroup="createStrategyGroup"
        @gen:adList="genPreviewTableData"
        @submit:createBatch="submitCreateBatch"
      />
    </Card>

    <!-- 预览区 -->
    <Card title="预览区" class="header">
      <VivoPreviewArea :table-data="adList" :account-info="creationInfo.accountInfo" />
    </Card>

    <!-- 策略组保存弹窗 -->
    <CreateStrategyGroupModal />
  </Page>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
