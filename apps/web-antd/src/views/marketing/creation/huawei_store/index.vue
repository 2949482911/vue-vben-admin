<script setup lang="ts">
import { ref, watch } from "vue";
import { Page, useVbenModal } from "@vben/common-ui";
import type {
  HuaWeiStoreAdgroupData,
  HuaWeiStoreCampaignData,
  HuaWeiStoreCreation,
  HuaWeiStoreCreationData
} from "./huawei_store";
import {
  getPreviewTableData
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
import { Card, message, Select, Space } from "ant-design-vue";
import { AdType, TaskTypeSelect } from "#/views/marketing/creation/huawei_store/data";

import DeliveryTaskRecommend from "./components/delivery-task-recommend/index.vue";
import type { PageViewItem } from "#/api/models/assert";
import Function from "#/views/marketing/creation/components/Function.vue";
import CreateStrategyGroupModal from "../components/createStrategyGroup.vue";
import RecommendPreviewArea
  from "#/views/marketing/creation/huawei_store/components/delivery-task-recommend/RecommendPreviewArea.vue";

import Submit from "#/views/marketing/creation/components/submit/SubmitModal.vue";

// 策略组
const [CreateAdvertiserModal, createAdvertiserApi] = useVbenModal({
  connectedComponent: CreateStrategyGroupModal,
  onCancel() {
    createAdvertiserApi.close();
  }
});

// 提交弹窗
const [SubmitModal, submitApi] = useVbenModal({
  connectedComponent: Submit
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

    //
    if (!config.promotionType) {
      config.promotionType = {
        adType: "search_card",
        taskType: "461314520477184955"
      };
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
  createAdvertiserApi.setData(creationInfo.value);
  createAdvertiserApi.open();
}

// ad list
const adList = ref<Array<HuaWeiStoreCreationData>>([]);

/**
 * genPreviewTableData 获取预览表格数据
 */
function genPreviewTableData() {
  adList.value = getPreviewTableData(creationInfo.value);
}


/**
 * 提交审核数据
 */
function submitCreateBatch() {
  if (adList.value.length < 0) {
    message.error("请求配置预览区数据");
    return;
  }
  submitApi.open();
}

// creationInfo 华为商店创建信息
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
  version: "1.0",
  configData: {
    // 广告信息
    promotionType: {
      adType: "search_card",
      taskType: "461314520477184955"
    },
    campaign: {
      appId: "",
      attributionMode: 3,
      budget: 200,
      campaignId: "",
      campaignInfo: {
        adNetwork: 1,
        buyMode: 1,
        campaignName: "",
        dailyBudget: 200,
        marketingGoal: 1,
        type: 1
      },
      clickAdMonitorReportUrl: "",
      deliveryHours: [],
      endDate: "",
      impAdMonitorReportUrl: "",
      isExcludeInstalledApp: 0,
      isPositiveRegion: "Y",
      regions: "CN",
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
      subTaskPrice: 200,
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


// 监听数据变化
watch(() => creationInfo, (_) => {
  resetCreationInfo();
}, { immediate: true, deep: true });

/**
 * 重置方法
 * 当配置区内任意属性发生改变时则需要生成预览区数据
 * 1.如果是计划发生了改变则
 */
function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn("配置已更新,预览区已重置");
  }
}


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
        <Space>
          <Select :options="TaskTypeSelect"
                  :value="creationInfo.configData.promotionType.taskType"></Select>
          <Select :options="AdType" :value="creationInfo.configData.promotionType.adType"></Select>
        </Space>
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
          @gen:ad-list="genPreviewTableData"
          @submit:create-batch="submitCreateBatch"
        />
      </Card>

      <Card class="header" title="预览区">
        <RecommendPreviewArea :ad-list="adList" :account-info="creationInfo.accountInfo" />
      </Card>

      <!--      策略组-->
      <CreateAdvertiserModal />
      <!--      提交审核-->
      <SubmitModal :creation-info="creationInfo" :ad-list="adList" />
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}
</style>
