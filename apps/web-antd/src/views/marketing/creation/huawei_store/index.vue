<script setup lang="ts">
import {ref} from 'vue';
import {Page} from '@vben/common-ui';
import type {
  HuaWeiStoreAdgroupData,
  HuaWeiStoreCampaignData,
  HuaWeiStoreCreation
} from "./huawei_store"
import {Platform} from "#/constants/enums";
import {RuleKey, RuleMethod} from "#/views/marketing/creation/creation_enums";
import type {
  AccountInfo,
  AudienceConfigData,
  Material,
  Project,
  RuleInfo
} from "#/views/marketing/creation/creation";
import type {TargetedPackageTypeItem, TitlePackageItem} from "#/api/models";
import ConfigurationConfig from '../components/configurationArea.vue';
import {Card, Select} from 'ant-design-vue';
import {TaskTypeSelect} from "#/views/marketing/creation/huawei_store/data";

import DeliveryTaskRecommend from './components/delivery-task-recommend/index.vue';


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

//// creationInfo 华为商店创建信息
const creationInfo = ref<HuaWeiStoreCreation>({
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
        method: RuleMethod.ALL,
      },
      data: new Map<string, Material[]>(),
    },
    audience: {
      config: {
        method: RuleMethod.ALL,
      },
      data: new Map<string, Array<TargetedPackageTypeItem>>(),
    },
    titlePackage: {
      config: {
        method: RuleMethod.ALL,
      },
      data: new Map<string, Array<TitlePackageItem>>(),
    }

  },
  monitoringLink: {
    allocateType: "", clickLink: "", exposureLink: "", linkModeType: "", monitorLink: ""
  },
  platform: Platform.HUAWEI_STORE,
  project: {
    projectId: '',
    projectName: '',
    icon: '',
    packageName: '',
  },
  ruleInfo: {
    projectRuleKey: RuleKey.TARGET,
    projectCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adGroupCount: 1,
    adRuleKey: RuleKey.CREATIVE,
    adCount: 1,
  },
  configurationConfig: {
    platform: Platform.HUAWEI_STORE,
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
        />
      </Card>
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
