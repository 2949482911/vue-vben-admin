<script setup lang="ts">
import { Page, useVbenModal } from "@vben/common-ui";
import { Card, message, Select } from "ant-design-vue";
import ConfigurationConfig from "../components/configurationArea.vue";
import { ref, watch } from "vue";
import type {
  OppoAdgroupData,
  OppoCampaignData,
  OppoCreation,
  OppoCreationData,
  OppoPromotionData,
} from "./Oppo.types";
import { OPPO_VERSION } from "./Oppo.types";
import { getPreviewTableData } from "./convertToPreviewData";
import { RuleKey, RuleMethod } from "#/views/marketing/creation/creation_enums";
import type {
  AccountInfo,
  AudienceConfigData,
  Material,
  MaterialData,
  MonitoringLinkConfigData,
  MonitoringLinkType,
  PageViewConfigData,
  Project,
  RuleConfiguration,
  RuleInfo,
  RuleOptions,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { Platform } from "#/constants/enums";
import OppoBaseTemplate from "#/views/marketing/creation/oppo/components/base/base_template.vue";
import Function from "#/views/marketing/creation/components/Function.vue";
import CreateStrategyGroup from "#/views/marketing/creation/components/createStrategyGroup.vue";
import Submit from "#/views/marketing/creation/components/submit/SubmitModal.vue";
import OppoPreviewArea from "#/views/marketing/creation/oppo/components/OppoPreviewArea.vue";

const OPPO_MARKETING_TYPE = [{ label: "基础模板", value: "base_template" }];

const adList = ref<OppoCreationData[]>([]);

const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  }
});

// 提交弹窗
const [SubmitModal, submitApi] = useVbenModal({
  connectedComponent: Submit,
});

/**
 * OPPO平台的规则配置
 */
const oppoRuleConfiguration: RuleConfiguration = {
  project: {
    show: true,
    name: "计划",
    rules: "计划生成规则",
    countLabel: "每个账户指定计划数"
  },
  adGroup: {
    show: true,
    name: "广告组",
    rules: "广告组生成规则",
    countLabel: "每个计划指定广告组数"
  },
  ad: {
    show: true,
    name: "广告",
    rules: "广告生成规则",
    countLabel: "每个广告组指定广告数"
  },
  creative: {
    show: true,
    name: "创意",
    rules: "创意生成规则",
    countLabel: "每个广告指定创意数"
  }
};

/**
 * OPPO平台的规则选项
 */
const oppoRuleOptions: RuleOptions = {
  projectRules: [
    { title: "根据定向包生成", desc: "计划数量与定向包数量相等", key: "targeting" },
    { title: "根据创意组生成", desc: "计划数量与创意组数量相等", key: "creative" },
    { title: "根据标题包生成", desc: "计划数量与标题包数量相等", key: "title" },
    { title: "指定数量", desc: "手动指定每个账户的计划数量", key: "custom" }
  ],
  adGroupRules: [
    { title: "根据定向包生成", desc: "广告组数量与定向包数量相等", key: "targeting" },
    { title: "根据创意组生成", desc: "广告组数量与创意组数量相等", key: "creative" },
    { title: "根据标题包生成", desc: "广告组数量与标题包数量相等", key: "title" },
    { title: "指定数量", desc: "手动指定每个计划的广告组数量", key: "custom" }
  ],
  adRules: [
    { title: "按创意组数", desc: "按创意组数生成广告", key: "creative" },
    { title: "按标题包数", desc: "按标题包数生成广告", key: "title" },
    { title: "指定数量", desc: "手动指定广告数量", key: "custom" }
  ],
  creativeRules: [
    { title: '无', desc: '无', key: 'none' },
    { title: '根据创意组生成', desc: '创意数量与创意组数量相等', key: 'creative_group' },
    { title: '指定数量', desc: '手动指定每个广告的创意数量', key: 'custom' },
  ]
};

function updateAccountInfo(accountInfo: Array<AccountInfo>) {
  creationInfo.value.accountInfo = accountInfo;
}

function updateProject(project: Project) {
  creationInfo.value.project = project;
}

function updateRuleInfo(ruleInfo: RuleInfo) {
  creationInfo.value.ruleInfo = ruleInfo;
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  creationInfo.value.configData.audience = audienceConfigData;
}

function updateMonitoringLink(monitoringLink: MonitoringLinkConfigData) {
  creationInfo.value.configData.monitoringLink = monitoringLink;
}

function updateCampaign(campaign: OppoCampaignData) {
  Object.assign(creationInfo.value.configData.campaign, campaign);
}

function updateAdgroup(adgroup: OppoAdgroupData) {
  Object.assign(creationInfo.value.configData.adgroup, adgroup);
}

function updatePromotion(promotion: OppoPromotionData) {
  Object.assign(creationInfo.value.configData.promotion, promotion);
}

function updateMaterial(material: MaterialData) {
  creationInfo.value.configData.material = material;
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  creationInfo.value.configData.titlePackage = titlePackage;
}

function updateLandingPage(landingPage: PageViewConfigData) {
  creationInfo.value.configData.landingPage = landingPage;
}

function genPreviewTableData() {
  adList.value = getPreviewTableData(creationInfo.value);
}

function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error("请先配置预览区数据");
    return;
  }
  console.log(adList.value);
  submitApi.open();
}

function createStrategyGroup() {
  createStrategyGroupApi.setData(creationInfo.value);
  createStrategyGroupApi.open();
}

const template = ref<string>("base_template");

async function initCreationInfo() {
  creationInfo.value = {
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
        planName: "",
        extensionType: 2,
        dayLimit: 0,
        dayBudget: 0,
        deliveryMode: 0
      },
      adgroup: {
        planId: "",
        adGroupName: "",
        pageUrl: "",
        extensionType: 2,
        extensionFlow: 0,
        flowScene: 1,
        dayLimit: 0,
        beginTime: "",
        endTime: "",
        billingType: 1,
        adSearchPremiumKwSaveDTOList: [],
        appId: "",
        autoOpenFlag: 0,
        deepOcpcPrice: "",
        deepOcpcType: 0,
        deepUrl: "",
        instantAppId: "",
        instantAppUrl: "",
        ocpcOptmType: 0,
        ocpcPrice: "",
        ocpcType: 0,
        pageId: "",
        pageType: 1,
        price: "",
        smartExpandType: 0,
        targetId: "",
        timeLimit: 0,
        timeSet: "",
        linkDeskFlag: 0,
        appletType: 0,
        kwOcpcPrice: "",
        kwDeepOcpcPrice: "",
        kwTargetROI: "",
        channelPkgId: "",
        defaultSecondStage: 0,
        targetROI: "",
        adsDpaProductDTO: {
          dpaProductType: 0,
          dpaProductLibraryId: 0,
          dpaProductIdList: []
        },
        advertiseType: 0,
        pushAppPageType: 0,
        ocpxOptimizeSwitch: 0,
        ocpxOptimizeType: 0,
        extJson: "",
        appletId: "",
        appletPath: "",
        marketingObjectiveDTO: {
          dpaProductType: 3,
          dpaProductLibraryId: "",
          dpaProductIdList: []
        }
      },
      promotion: {
        adGroupId: "",
        adName: "",
        globalSpecId: 1,
        adSource: 0,
        brandLogoImgId: "",
        brandName: "",
        buttonTxt: "",
        copywriter: "",
        copywriterId: "",
        downloadUrl: "",
        dynamicCr: 0,
        exposeUrl: "",
        videoImgId: "",
        imgMatIds: [],
        clickUrl: "",
        config: {
          videoMaxCount: 0,
          imageMaxCount: 0,
          materialNormId: 0,
          placeType: 0,
          strongReminder: 0,
          virtualPositionId: ""
        }
      },
      material: {
        config: { method: RuleMethod.ALL },
        data: new Map<string, Material[]>()
      },
      audience: {
        config: { method: RuleMethod.ALL },
        data: new Map<string, Array<TargetedPackageTypeItem>>()
      },
      titlePackage: {
        config: { method: RuleMethod.ALL },
        data: new Map<string, Array<TitlePackageItem>>()
      },
      monitoringLink: {
        config: { method: RuleMethod.ALL },
        linkType: RuleMethod.MANUAL,
        data: new Map<string, Array<MonitoringLinkType>>()
      },
      landingPage: {
        config: { method: RuleMethod.ALL },
        data: new Map()
      },
      deepLinkList: {
        deepLinkConfig: { method: RuleMethod.ALL },
        data: new Map()
      },
    },
    configurationConfig: {
      platform: Platform.OPPO
    },
    platform: Platform.OPPO,
    project: {
      projectId: "",
      projectName: "",
      icon: "",
      packageName: "",
      appId: ''
    },
    ruleInfo: {
      projectRuleKey: RuleKey.TARGET,
      projectCount: 1,
      adGroupRuleKey: RuleKey.TARGET,
      adGroupCount: 1,
      adRuleKey: RuleKey.CREATIVE,
      adCount: 1,
      creativeRuleKey: RuleKey.CREATIVE_GROUP,
      creativeCount: 1
    },
    version: OPPO_VERSION
  };
}

async function updateTemplate(changeVal: string) {
  template.value = changeVal;
  await initCreationInfo();
  creationInfo.value.configurationConfig.template = changeVal;
}

/**
 * 复用oppo创编
 */
function updateReuse(oppoCreation: OppoCreation) {
  if (oppoCreation.configData) {
    const config = oppoCreation.configData;
    if (config.material && !(config.material.data instanceof Map)) {
      config.material.data = new Map(Object.entries(config.material.data || {}));
    }
    if (config.audience && !(config.audience.data instanceof Map)) {
      config.audience.data = new Map(Object.entries(config.audience.data || {}));
    }
    if (config.titlePackage && !(config.titlePackage.data instanceof Map)) {
      config.titlePackage.data = new Map(Object.entries(config.titlePackage.data || {}));
    }
    if (config.monitoringLink && !(config.monitoringLink.data instanceof Map)) {
      config.monitoringLink.data = new Map(Object.entries(config.monitoringLink.data || {}));
    }
    if (config.landingPage && !(config.landingPage.data instanceof Map)) {
      config.landingPage.data = new Map(Object.entries(config.landingPage.data || {}));
    }
  }
  creationInfo.value = oppoCreation;
}

// 创编对象
const creationInfo = ref<OppoCreation>({
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
    campaign: { planName: "", extensionType: 2, dayLimit: 0, dayBudget: 0, deliveryMode: 0 },
    adgroup: {
      planId: "",
      adGroupName: "",
      pageUrl: "",
      extensionType: 2,
      extensionFlow: 0,
      flowScene: 0,
      dayLimit: 0,
      beginTime: "",
      endTime: "",
      billingType: 1,
      adSearchPremiumKwSaveDTOList: [],
      appId: "",
      autoOpenFlag: 0,
      deepOcpcPrice: "",
      deepOcpcType: 0,
      deepUrl: "",
      instantAppId: "",
      instantAppUrl: "",
      ocpcOptmType: 0,
      ocpcPrice: "",
      ocpcType: 0,
      pageId: "",
      pageType: 1,
      price: "",
      smartExpandType: 0,
      targetId: "",
      timeLimit: 0,
      timeSet: "",
      linkDeskFlag: 0,
      appletType: 0,
      kwOcpcPrice: "",
      kwDeepOcpcPrice: "",
      kwTargetROI: "",
      channelPkgId: "",
      defaultSecondStage: 0,
      targetROI: "",
      adsDpaProductDTO: { dpaProductType: 0, dpaProductLibraryId: 0, dpaProductIdList: [] },
      advertiseType: 0,
      pushAppPageType: 0,
      ocpxOptimizeSwitch: 0,
      ocpxOptimizeType: 0,
      extJson: "",
      appletId: "",
      appletPath: "",
      marketingObjectiveDTO: { dpaProductType: 3, dpaProductLibraryId: "", dpaProductIdList: [] }
    },
    promotion: {
      adGroupId: "",
      adName: "",
      globalSpecId: 1,
      adSource: 0,
      brandLogoImgId: "",
      brandName: "",
      buttonTxt: "",
      copywriter: "",
      copywriterId: "",
      downloadUrl: "",
      dynamicCr: 0,
      exposeUrl: "",
      videoImgId: "",
      imgMatIds: [],
      clickUrl: "",
      config: {
        videoMaxCount: 0,
        imageMaxCount: 0,
        materialNormId: 0,
        placeType: 0,
        strongReminder: 0,
        virtualPositionId: ""
      }
    },
    material: { config: { method: RuleMethod.ALL }, data: new Map<string, Material[]>() },
    audience: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Array<TargetedPackageTypeItem>>()
    },
    titlePackage: {
      config: { method: RuleMethod.ALL },
      data: new Map<string, Array<TitlePackageItem>>()
    },
    monitoringLink: {
      config: { method: RuleMethod.ALL },
      linkType: RuleMethod.MANUAL,
      data: new Map<string, Array<MonitoringLinkType>>()
    },
    landingPage: { config: { method: RuleMethod.ALL }, data: new Map() },
    deepLinkList: { deepLinkConfig: { method: RuleMethod.ALL }, data: new Map() },
  },
  configurationConfig: {
    platform: Platform.OPPO, template: "base_template"
  },
  platform: Platform.OPPO,
  project: {
    projectId: "", projectName: "", icon: "", packageName: "" , appId: ''
  },
  ruleInfo: {
    projectRuleKey: RuleKey.TARGET,
    projectCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adGroupCount: 1,
    adRuleKey: RuleKey.CREATIVE,
    adCount: 1,
    creativeRuleKey: RuleKey.CREATIVE_GROUP,
    creativeCount: 1
  },
  version: OPPO_VERSION
});

watch(() => creationInfo, (_) => {
  resetCreationInfo();
}, { immediate: true, deep: true });

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
          :rule-configuration="oppoRuleConfiguration"
          :rule-options="oppoRuleOptions"
          @update:accountInfo="updateAccountInfo"
          @update:productInfo="updateProject"
          @update:ruleInfo="updateRuleInfo"
          @update:reuse="updateReuse"
        />
      </Card>

      <Card class="header">
        <Select class="w-[200px]" :options="OPPO_MARKETING_TYPE" :value="template"
                @change="updateTemplate" />
      </Card>

      <Card class="header">
        <OppoBaseTemplate
          v-if="template === 'base_template'"
          :creation-info="creationInfo"
          @update:title-package="updateTitlePackage"
          @update:update-material="updateMaterial"
          @update:campaign="updateCampaign"
          @update:adgroup="updateAdgroup"
          @update:promotion="updatePromotion"
          @update:audience-package="updateAudiencePackage"
          @update:landing-page="updateLandingPage"
        />
      </Card>

      <Card class="header">
        <Function
          :account-info="creationInfo.accountInfo"
          :monitoring-link="creationInfo.configData.monitoringLink"
          @update:monitoring-link="updateMonitoringLink"
          @save:create-strategy-group="createStrategyGroup"
          @gen:ad-list="genPreviewTableData"
          @submit:create-batch="submitCreateBatch"
        />
      </Card>

      <Card class="header" title="预览区">
        <OppoPreviewArea :ad-list="adList" :account-info="creationInfo.accountInfo" />
      </Card>

      <CreateStrategyGroupModal />
      <!--      提交审核-->
      <SubmitModal :creation-info="creationInfo" :ad-list="adList" />
    </Page>
  </div>
</template>

<style scoped lang="scss">
.header {
  margin-bottom: 10px;
}

.btnCla {
  display: flex;
  justify-content: center;
  width: 100%;
}

.generateButton {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}
</style>
