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
import type { OppoCreation, OppoPromotionData } from './Oppo.types';
import ConfigurationArea from './components/configurationArea.vue';
import ProjectModule from './components/campaign/projectModule.vue';
import AdvertisingGroupModule from './components/adGroup/advertisingGroupModule.vue';
import AdOrientation from './components/adGroup/adOrientationModule.vue';
import CreativeMaterialsDrawer from './components/creativeMatGroup/creativeMaterialsDrawer.vue';
import CreativeMaterialsGroupModule from './components/creativeMatGroup/creativeMaterialsGroupModule.vue';
import TitlePackageModule from './components/titlePackage/titlePackageModule.vue';
import landingPageModule from './components/landingPage/landingPageModule.vue';
import MonitoringLinkGroup from './components/monitoringLinkGroup.vue';
import Create from '../components/createStrategyGroup.vue';
const previewAreaRef = ref();
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
      adsDpaProductDTO: {},
      advertiseType: 0,
      pushAppPageType: 0,
      ocpxOptimizeSwitch: 0,
      ocpxOptimizeType: 0,
      extJson: '',
      appletId: '',
      appletPath: '',
      marketingObjectiveDTO: {}
    },
    promotion: {
      // 广告组id
      adGroupId: '',
      // 广告组名称
      adName: '',
      // 统一规格id
      globalSpecId: 0,
      // 广告来源
      adSource: 0,
      // 品牌背景logo
      brandLogoImgId: '',
      // 品牌名称
      brandName: '',
      // 按钮文案
      buttonTxt: '',
      // 广告文案
      copywriter: '',
      // 文案id
      copywriterId: '',
      // 下载监测链接
      downloadUrl: '',
      // 是否开启了衍生 0否 1是
      dynamicCr: 0,
      // 曝光监测链接
      exposeUrl: '',
      // 视频封面图
      videoImgId: '',
      // 图片素材id
      imgMatIds: [],
      // 点击链接
      clickUrl: '',
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
/**清空广告创意素材上半部分组 */
function handleClearCreativeMaterialsDrawerUpdate(data: OppoPromotionData) {
  creationInfo.value.configData.promotion = data;
}

/**清空广告创意素材组（视频+图片） */
function handleClearCreativeMaterialsGroupList(data: MaterialData) {
  creationInfo.value.configData.material = data;
}
/**广告创意素材上半部分组 */
function handleCreativeMaterialsDrawerUpdate(data: OppoPromotionData) {
  creationInfo.value.configData.promotion = data;
  console.log('handleCreativeMaterialsDrawerUpdate', data);
}

/**广告创意素材组（视频+图片） */
function handleCreativeMaterialsGroupList(data: MaterialData) {
  creationInfo.value.configData.material = data;
}
/**添加标题包到大对象 */
function handleTitlePackageUpdate(data) {
  creationInfo.value.configData.titlePackage = data;
}

//----------选择落地页-----------
const [LandingPageModule, landingPageModalApi] = useVbenModal({
  connectedComponent: landingPageModule,
});

function openLandingPageModule() {
  // if (!creationInfo.value.configData.promotion.adName)
    // return message.warning('请先完善并保存“素材组”基本信息');
  landingPageModalApi.setData(creationInfo.value.configData.landingPage);
  landingPageModalApi.open();
}
/**
 * 添加落地页到大对象
 * @param data
 */
function handleLandingPageUpdate(data) {
  creationInfo.value.configData.landingPage = data;
}
//----------监测链接组-----------
const [monitoringLinkGroupModal, modalApi] = useVbenModal({
  connectedComponent: MonitoringLinkGroup,
});

/**打开监测链接组 */
function openMonitoringLinkModal() {
  modalApi.open();
}

//----------保存策略组-----------
const [CreateModule, createModalApi] = useVbenModal({
  connectedComponent: Create,
});

/**保存策略组 */
async function savePolicyGroup() {
  if (
    creationInfo.value.accountInfo.length &&
    creationInfo.value.project.projectId &&
    creationInfo.value.configData.campaign.planName &&
    creationInfo.value.configData.adgroup.adGroupName&&
    creationInfo.value.configData.promotion.adName &&
    creationInfo.value.configData.audience.data.size > 0 &&
    creationInfo.value.configData.titlePackage.data.size > 0
  ) {
    createModalApi.setData(creationInfo.value);
  } else {
    return message.warning('请完善“配置区域”基本信息');
  }
  createModalApi.open();
}
/**生成预览 */
function generatePreview() {
  if (
    creationInfo.value.accountInfo.length &&
    creationInfo.value.project.projectId &&
    creationInfo.value.configData.campaign.planName &&
    creationInfo.value.configData.adgroup.adGroupName &&
    creationInfo.value.configData.promotion.adName &&
    // creationInfo.value.monitoringLink.clickLink &&
    // creationInfo.value.monitoringLink.exposureLink &&
    creationInfo.value.configData.audience.data.size > 0 &&
    creationInfo.value.configData.titlePackage.data.size > 0
  ) {
    previewAreaRef.value?.generateTable(creationInfo.value);
  } else {
    return message.warning('请完善“配置区域”基本信息');
  }
}
function handlemonitoringLinkGroupUpdate(data: MonitoringLinkType) {
  creationInfo.value.monitoringLink = data;
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
              />
            </Card>
          </Col>
           <Col :span="6">
            <Card>
              <TitlePackageModule
                :accountInfo="creationInfo.accountInfo"
                :promotionName="creationInfo.configData.promotion.adName"
                :titlePackage="creationInfo.configData.titlePackage"
                :landingPage="creationInfo.configData.landingPage"
                @update:titlePackageConfig="handleTitlePackageUpdate"
              />
              <LandingPageModule
                :accountInfo="creationInfo.accountInfo"
                :landingPage="creationInfo.configData.landingPage"
                @update:landingPageConfig="handleLandingPageUpdate"
              />
              <div class="btnCla">
                <Button type="text" @click="openLandingPageModule">添加落地页</Button>
              </div>
            </Card>
          </Col>
        </Row>
        <div class="generateButton">
          <Button type="primary" @click="openMonitoringLinkModal">监测链接组</Button>
          <div>
            <Button type="primary" @click="savePolicyGroup">保存策略组</Button>
            <Button style="margin: 0 0 0 10px" type="primary" @click="generatePreview"
              >生成广告预览</Button
            >
          </div>
        </div>
        <Card>
          <h2 class="text">预览区</h2>
          <PreviewArea
            ref="previewAreaRef"
            :creationInfo="creationInfo"
            :accountInfo="creationInfo.accountInfo"
          />
        </Card>
    </Card>
    <monitoringLinkGroupModal
      :accountInfo="creationInfo.accountInfo"
      :monitoringLink="creationInfo.monitoringLink"
      @update:monitoringLinkGroup="handlemonitoringLinkGroupUpdate"
    />
    <CreateModule />
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
  .generateButton {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }
</style>
