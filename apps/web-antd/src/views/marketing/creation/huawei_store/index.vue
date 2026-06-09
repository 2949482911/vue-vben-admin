<script setup lang="ts">
import { ref } from "vue";
import { Page, useVbenModal } from "@vben/common-ui";
import type {
  HuaWeiStoreAdgroupData,
  HuaWeiStoreCampaignData,
  HuaWeiStoreCreation
} from "./huawei_store";
import { Platform } from "#/constants/enums";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import type {
  AccountInfo,
  AudienceConfigData,
  Material,
  MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType,
  Project,
  RuleInfo,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import ConfigurationConfig from "../components/configurationArea.vue";
import { Card, Select } from "ant-design-vue";
import { TaskTypeSelect } from "#/views/marketing/creation/huawei_store/data";

import DeliveryTaskRecommend from "./components/delivery-task-recommend/index.vue";
import type { PageViewItem } from "#/api/models/assert";
import Function from "#/views/marketing/creation/components/Function.vue";
import PreviewArea from "#/views/marketing/creation/components/preview_area/PreviewArea.vue";
import CreateAdvertiser from "../components/createStrategyGroup.vue";

// 策略组
const [CreateAdvertiserModal, createAdvertiserApi] = useVbenModal({
  connectedComponent: CreateAdvertiser,
  onCancel() {
    createAdvertiserApi.close();
  }
});



/**
 * 更新账户信息
 * @param accountInfo 账户信息
 */
function updateAccountInfo(accountInfo: Array<AccountInfo>) {
  creationInfo.value.accountInfo = accountInfo;
}

/**
 * 更新产品信息
 * @param project 产品信息
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
 * 策略组复用对象
 */
function updateReuse(huaweiStoreCreation: HuaWeiStoreCreation) {
  // 核心：在赋值前，恢复被丢失的 Map 类型（JSON 序列化后 Map 变成普通对象）
  if (huaweiStoreCreation.configData) {
    const config = huaweiStoreCreation.configData;

    // 1. 恢复 material.data
    if (config.material && !(config.material.data instanceof Map)) {
      config.material.data = new Map(Object.entries(config.material.data || {}));
    }

    // 2. 恢复 audience.data
    if (config.audience && !(config.audience.data instanceof Map)) {
      config.audience.data = new Map(Object.entries(config.audience.data || {}));
    }

    // 3. 恢复 titlePackage.data
    if (config.titlePackage && !(config.titlePackage.data instanceof Map)) {
      config.titlePackage.data = new Map(Object.entries(config.titlePackage.data || {}));
    }

    // 4. 恢复 pageView.data
    if (config.pageView && !(config.pageView.data instanceof Map)) {
      config.pageView.data = new Map(Object.entries(config.pageView.data || {}));
    }

    // 5. 恢复 monitoringLink.data
    if (config.monitoringLink && !(config.monitoringLink.data instanceof Map)) {
      config.monitoringLink.data = new Map(Object.entries(config.monitoringLink.data || {}));
    }

  }

  creationInfo.value = huaweiStoreCreation;
}


/**
 * update 更新计划
 * @param campaign
 */
function updateCampaign(campaign: HuaWeiStoreCampaignData) {
  creationInfo.value.configData.campaign = campaign;
}

/**
 * 更新子任务
 */
function updateAdgroup(adgroup: HuaWeiStoreAdgroupData) {
  creationInfo.value.configData.adgroup = adgroup;
}


/**
 * 更新定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  creationInfo.value.configData.audience = audienceConfigData;
}


/**
 * update material
 * @param materialData
 */
function updateMaterial(materialData: MaterialData) {
  creationInfo.value.configData.material = materialData;
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
 * 保存策略组
 */
function createStrategyGroup() {
  createAdvertiserApi.setData(creationInfo.value)
  createAdvertiserApi.open();
}

//// creationInfo 华为商店创建信息
const creationInfo = ref<HuaWeiStoreCreation>({
  monitoringLink: {
    clickLink: "",
    exposureLink: "",
    monitorLink: "",
    linkModeType: "",
    allocateType: "",
    ocpxTaskId: ""
  },
  accountInfo: [],
  configData: {
    campaign: {
      appId: "",
      attributionMode: 0,
      budget: 0,
      campaignId: "",
      campaignInfo: {
        adNetwork: 0,
        buyMode: 0,
        campaignName: "",
        dailyBudget: 0,
        marketingGoal: 0,
        subTasks: [],
        type: 0
      },
      clickAdMonitorReportUrl: "",
      deliveryHours: [],
      endDate: "",
      impAdMonitorReportUrl: "",
      isExcludeInstalledApp: 0,
      isPositiveRegion: "",
      regions: "",
      startDate: "",
      taskName: ""
    },
    adgroup: {
      conversionBehaviorId: "",
      conversionExcludeBehaviorId: "",
      subTaskFollowAppName: "",
      subTaskKey: "",
      subTaskKeyMatchType: "",
      subTaskName: "",
      subTaskPrice: 0,
      subTaskRtaId: "",
      subTaskUserGroupId: "",
      taskId: ""
    },
    promotion: {
      appDeepLinkUrl: "",
      attachment: "",
      contentTitle: "",
      contentType: "",
      crossScreenFloatPic: "",
      deepLinkUrl: "",
      httpDeepLinkUrl: "",
      landingPageContent: "",
      landingPageObsUrl: "",
      landingPageQualification: "",
      landingPageType: "",
      materialIdsList: [],
      pageId: "",
      pageType: "",
      slogan: "",
      verticalScreenFloatPic: ""
    },
    material: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Material[]>()
    },
    audience: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<TargetedPackageTypeItem>>()
    },
    titlePackage: {
      config: {
        method: RuleMethod.ALL
      },
      data: new Map<string, Array<TitlePackageItem>>()
    },
    pageView: {
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
      data: new Map<string, Array<MonitoringLinkType>>()
    }
  },
  platform: Platform.HUAWEI_STORE,
  project: {
    projectId: "",
    projectName: "",
    icon: "",
    packageName: ""
  },
  ruleInfo: {
    projectRuleKey: RuleKey.TARGET,
    projectCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adGroupCount: 1,
    adRuleKey: RuleKey.CREATIVE,
    adCount: 1,
    creativeRuleKey: "creative_group",
    creativeCount: 1
  },
  configurationConfig: {
    platform: Platform.HUAWEI_STORE
  }


});


</script>


<template>
  <div>
    <Page auto-content-height>
      <Card class="header">
        <ConfigurationConfig
          :rule-info="creationInfo.ruleInfo"
          :configuration-config="creationInfo.configurationConfig"
          :account-info="creationInfo.accountInfo"
          :project="creationInfo.project"
          @update:accountInfo="updateAccountInfo"
          @update:productInfo="updateProject"
          @update:ruleInfo="updateRuleInfo"
          @update:reuse="updateReuse"
        />
      </Card>

      <Card class="header">
        <Select :options="TaskTypeSelect" default-value="461314520477184955"></Select>
      </Card>

      <Card class="header">
        <DeliveryTaskRecommend :creation-info="creationInfo"
                               @update:campaign="updateCampaign"
                               @update:adgroup="updateAdgroup"
                               @update:audience-package="updateAudiencePackage"
                               @update:update-material="updateMaterial"
                               @update:title-package="updateTitlePackage"

        />
      </Card>

      <!--监测链接组-->
      <Card class="header">
        <Function
          :accountInfo="creationInfo.accountInfo"
          :monitoring-link="creationInfo.configData.monitoringLink"
          @update:monitoring-link="updateMonitoringLink"
          @save:create-strategy-group="createStrategyGroup"
        />
      </Card>

      <Card class="header" title="预览区">
        <PreviewArea></PreviewArea>
      </Card>

      <!--      策略组-->
      <CreateAdvertiserModal />
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
