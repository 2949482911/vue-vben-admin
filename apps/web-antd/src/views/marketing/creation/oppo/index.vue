<script setup lang="ts">
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Card, Row, Col, Button, Divider, message } from 'ant-design-vue';
import type { LandingPageData, TargetedPackageTypeItem, TitlePackageItem } from '#/api/models';
import { ref } from 'vue';
import { Platform } from '#/constants/enums';
import type {
  AccountInfo,
  Material,
  MaterialData,
  MonitoringLinkType,
  Project,
  RuleInfo,
} from '#/views/marketing/creation/creation';

import type {
  QualificationValue,
  ChannelPackageValue,
} from './Oppo.types';
import type {OppoCreation} from './Oppo.types';
import ConfigurationArea from './components/configurationArea.vue';
import ProjectModule from './components/campaign/projectModule.vue';
import AdvertisingGroupModule from './components/adGroup/advertisingGroupModule.vue';
import AdOrientation from './components/adGroup/adOrientationModule.vue';
import CreativeMaterialsDrawer from './components/creativeMatGroup/creativeMaterialsDrawer.vue';
import CreativeMaterialsGroupModule from './components/creativeMatGroup/creativeMaterialsGroupModule.vue';
// 创建对象
const creationInfo = ref<OppoCreation>({
  project: {
    projectId: '',
    projectName: '',
    icon: '',
    packageName: '',
  },
  accountInfo: [],
  configData: {
    // 渠道包
    channelPackage: new Map<string, ChannelPackageValue>(),
    deepLinkList: {
      deepLinkConfig: {
        method: 'all',
      },
      data: new Map<string, Array<string>>(),
    },
    // 投放资质
    advertiserQualification: new Map<string, QualificationValue>(),
    // 计划对象
    campaign: {
      planName: '',
      extensionType: 0,
      dayLimit: 0,
      dayBudget: 0,
      deliveryMode: 0
    },
    adgroup: {
      planId: '',
      adGroupName: '',
      pageUrl: '',
      extensionType: null,
      extensionFlow: 0,
      flowScene: 0,
      dayLimit: 0,
      beginTime: '',
      endTime: '',
      billingType: 0,
      adSearchPremiumKwSaveDTOList: [],
      appId: '',
      autoOpenFlag: 0,
      deepOcpcPrice: '',
      deepOcpcType: 0,
      deepUrl: '',
      instantAppId: '',
      instantAppUrl: '',
      ocpcOptmType: 0,
      ocpcPrice: '',
      ocpcType: 0,
      pageId: '',
      pageType: 0,
      price: '',
      smartExpandType: 0,
      targetId: '',
      timeLimit: 0,
      timeRange: '',
      linkDeskFlag: 0,
      appletType: 0,
      kwOcpcPrice: '',
      kwDeepOcpcPrice: '',
      kwTargetROI: '',
      channelPkgId: '',
      defaultSecondStage: 0,
      targetROI: '',
      adsDpaProductDTO: undefined,
      advertiseType: 0,
      pushAppPageType: 0,
      ocpxOptimizeSwitch: 0,
      ocpxOptimizeType: 0,
      extJson: '',
      appletId: '',
      appletPath: '',
      marketingObjectiveDTO: undefined
    },
    promotion: {
      groupId: '',
      name: '',
      deepLink: '',
      videoAttribution: 0,
      pageUrl: '',
      h5Code: '',
      h5Type: 0,
      generalSwitch: 0,
      config: {
        videoMaxCount: 5,
        imageMaxCount: 5,
        materialNormId: 0,
        placeType: 0,
        strongReminder: 0,
        virtualPositionId: '',
      },
    },
    audience: {
      audienceConfig: {
        method: 'all',
      },
      data: new Map<string, Array<TargetedPackageTypeItem>>(),
    },
    material: {
      config: {
        method: 'all',
      },
      data: new Map<string, Material[]>(),
    },
    titlePackage: {
      titlePackageConfig: {
        method: 'all',
      },
      data: new Map<string, Array<TitlePackageItem>>(),
    },
    landingPage: {
      landingPageConfig: {
        method: 'all',
      },
      data: new Map<string, Array<LandingPageData>>(),
    },
  },
  platform: Platform.OPPO,
  ruleInfo: {
    projectRuleKey: 'targeting',
    projectCount: 1,
    adGroupRuleKey: 'targeting',
    adGroupCount: 1,
    adRuleKey: 'creative',
    adCount: 1,
  },
  monitoringLink: {
    clickLink: '',
    exposureLink: '',
    monitorLink: '',
    linkModeType: 'manual',
    allocateType: 'all',
  },
});
function handleAccountUpdate(data: Array<AccountInfo>) {  
  creationInfo.value.accountInfo = data;
  console.log('handleAccountUpdate', data);
}

function handleProductUpdate(data: Project) {
  creationInfo.value.project = data;
  console.log('handleProductUpdate', data);
}
// 规则配置
function handleRuleUpdate(data: RuleInfo) {
  creationInfo.value.ruleInfo = data;
  console.log('handleRuleUpdate', data);
}
// 项目配置
function handleProjectConfigUpdate(data: OppoCreation) { 
  creationInfo.value.configData.campaign = data;
  console.log('handleProjectConfigUpdate', data);
}
// 广告组配置
function handleAdGroupUpdate(data: OppoCreation) {
  creationInfo.value.configData.adGroup = data;
  console.log('handleAdGroupConfigUpdate', data);
}
/**
 * 添加定向包到大对象
 * @param data
 */
function handlerOrientation(data: OppoCreation) {
  creationInfo.value.configData.audience = data;
}
//----------选择定向包-----------
const [AdOrientationModule, adOrientationModuleModalApi] = useVbenModal({
  connectedComponent: AdOrientation,
});

function openAdOrientationModule() {
  if (!creationInfo.value.configData.campaign.planName)
    return message.warning('请先完善并保存“项目”基本信息');
  adOrientationModuleModalApi.setData(creationInfo.value.configData.audience);
  adOrientationModuleModalApi.open();
}
//----------创意素材组-----------
const [CreativeMaterialsDrawerModule, creativeMaterialsDrawerApi] = useVbenDrawer({
  connectedComponent: CreativeMaterialsDrawer,
});

function openCreativeMaterialsDrawerModule() {
  console.log('添加广告创意', creationInfo.value.configData.adgroup);
  // if (!creationInfo.value.configData.adgroup.adGroupName)
    // return message.warning('请先完善并保存“广告组”基本信息');
  creativeMaterialsDrawerApi.setData({
    promotion: creationInfo.value.configData.promotion,
    material: creationInfo.value.configData.material,
  });
  creativeMaterialsDrawerApi.open();
}

</script>

<template>
  <Page auto-content-height>
    <Card>
      <div class="header">
        <ConfigurationArea
          @update:accountInfo="handleAccountUpdate"
          @update:productInfo="handleProductUpdate"
          @update:ruleInfo="handleRuleUpdate"
          :ruleInfo="creationInfo.ruleInfo"
          >
        </ConfigurationArea>
      </div>
       <Row :gutter="16">
          <Col :span="6">
            <ProjectModule
              :has-account="creationInfo.accountInfo.length > 0"
              :has-product="!!creationInfo.project.projectId"
              @update:projectConfig="handleProjectConfigUpdate"
              @adTypeChanged="handleAdTypeChangeWarning"
            />
          </Col>
          <Col :span="6">
            <Card>
              <AdvertisingGroupModule
                ref="advertisingGroupRef"
                :campaign="creationInfo.configData.campaign"
                :adgroup="creationInfo.configData.adgroup"
                :accountInfo="creationInfo.accountInfo"
                :orientation="creationInfo.configData.audience"
                :advertiserQualification="creationInfo.configData.advertiserQualification"
                @update:adGroupConfig="handleAdGroupUpdate"
              />
              <Divider type="horizontal" />
              <AdOrientationModule
                :accountInfo="creationInfo.accountInfo"
                :orientation="creationInfo.configData.audience"
                @update:orientation="handlerOrientation"
              />
              <div class="btnCla">
                <Button type="text" @click="openAdOrientationModule">添加定向包</Button>
              </div>
            </Card>
          </Col>
           <Col :span="6">
            <Card>
              <CreativeMaterialsGroupModule
                :accountInfo="creationInfo.accountInfo"
                :promotion="creationInfo.configData.promotion"
                :material="creationInfo.configData.material"
                @update:clearCreativeMaterialsDrawerConfig="
                  handleClearCreativeMaterialsDrawerUpdate
                "
                @update:clearCreativeMaterialsGroupList="handleClearCreativeMaterialsGroupList"
              />
              <div class="btnCla">
                <Button type="text" @click="openCreativeMaterialsDrawerModule()">
                  {{
                    creationInfo.configData.material.data.size === 0 ? '添加广告创意素材' : '编辑'
                  }}
                </Button>
              </div>
              <CreativeMaterialsDrawerModule
                :accountInfo="creationInfo.accountInfo"
                :campaign="creationInfo.configData.campaign"
                :material="creationInfo.configData.material"
                :promotion="creationInfo.configData.promotion"
                :deepLinkList="creationInfo.configData.deepLinkList"
                @update:creativeMaterialsDrawerConfig="handleCreativeMaterialsDrawerUpdate"
                @update:creativeMaterialsGroupList="handleCreativeMaterialsGroupList"
                @update:deepLink="handleDeepLink"
              />
            </Card>
          </Col>
        </Row>
    </Card>
  </Page>
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
</style>
