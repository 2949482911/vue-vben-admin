<script setup lang="ts">
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Card, Row, Col, Button, Divider } from 'ant-design-vue';
import ConfigurationArea from '../configurationArea.vue';
import RuleConfiguration from '../ruleConfiguration.vue';
import ProjectModule from '#/views/marketing/creation/vivo/campaign/projectModule.vue';
import CreativeMaterialsGroupModule from './creativeMatGroup/creativeMaterialsGroupModule.vue';
import TitlePackageModule from './titlePackage/titlePackageModule.vue';
import PreviewArea from './previewTable/previewArea.vue';
import MonitoringLinkGroup from './monitoringLinkGroup.vue';
import { ref } from 'vue';
import type {
  VivoAdgroupData,
  VivoAudienceData,
  VivoCampaignData,
  VivoCreation,
  VivoPromotionData,
  VivoTitlePackageData,
  QualificationValue,
  VivoDeepLinkData,
} from '#/views/marketing/creation/vivo/vivo';
import { Platform } from '#/constants/enums';
import type {
  AccountInfo,
  Material,
  MaterialData,
  MonitoringLinkType,
  Project,
  RuleInfo,
} from '#/views/marketing/creation/creation';
import AdOrientation from './adgroup/adOrientationModule.vue';
import TitlePackagePopup from './titlePackage/titlePackagePopup.vue';
import AdvertisingGroupModule from './adgroup/advertisingGroupModule.vue';
import type { TargetedPackageTypeItem, TitlePackageItem } from '#/api/models';
import { message } from 'ant-design-vue';
import CreativeMaterialsDrawer from './creativeMatGroup/creativeMaterialsDrawer.vue';
import { watch } from 'vue';
import Create from '../components/create.vue';

const advertisingGroupRef = ref();
const previewAreaRef = ref();
const configurationAreaRef = ref();

// 创建对象
const creationInfo = ref<VivoCreation>({
  project: {
    projectId: '',
    projectName: '',
    icon: '',
    packageName: '',
  },
  accountInfo: [],
  configData: {
    deepLinkList: {
      deepLinkConfig: {
        method: 'all',
      },
      data: new Map<string, Array<string>>(),
    },
    // 投放资质
    advertiserQualification: new Map<string, QualificationValue>(),
    campaign: {
      name: '',
      adType: 0,
      mediaType: 0,
      dailyBudget: -1,
      campaignType: 0,
      pushForm: 0,
      pushType: 0,
      promotionType: 0,
      conversionMonitorType: 0,
    },
    adgroup: {
      apkId: 0,
      appPackageName: '',
      appletOriginId: '',
      appletPath: '',
      biddingStrategy: 0,
      builtInRpkDeepLink: '',
      campaignId: 0,
      channelId: 0,
      chargeType: null,
      conversionFilterCycle: 0,
      cvType: '',
      dailyBudget: -1,
      endDate: '',
      h5Code: '',
      h5Type: null,
      industry1: '',
      industry2: '',
      name: '',
      ocpxPrice: 0,
      price: 0,
      productUrlType: 0,
      retrieveType: 0,
      rpkDeepLink: '',
      ruleAudience: '',
      scheduleTime: '',
      secondCvType: null,
      secondOcpxPrice: 0,
      spentType: null,
      startDate: '',
      subpackageId: 0,
      webSiteUrl: '',
      wechatFollow: 0,
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
  },
  platform: Platform.VIVO,
  ruleInfo: {
    projectRuleKey: 'targeting',
    projectCount: 1,
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

watch(
  () => creationInfo.value,
  () => {
    // 如果预览区域已经有数据了，才执行清空（避免初始化时的冗余操作）
    if (previewAreaRef.value) {
      previewAreaRef.value.clearTable();
    }
  },
  { deep: true }, // 必须开启深度监听，因为 creationInfo 是个复杂对象
);

//----------保存策略组-----------
const [CreateModule, createModalApi] = useVbenModal({
  connectedComponent: Create,
});

/**保存策略组 */
async function savePolicyGroup() {
  if (
    creationInfo.value.accountInfo.length &&
    creationInfo.value.project.projectId &&
    creationInfo.value.configData.campaign.name &&
    creationInfo.value.configData.adgroup.name &&
    creationInfo.value.configData.promotion.name &&
    creationInfo.value.configData.audience.data.size > 0 &&
    creationInfo.value.configData.titlePackage.data.size > 0
  ) {
    createModalApi.setData(creationInfo.value);
  } else {
    return message.warning('请完善“配置区域”基本信息');
  }
  createModalApi.open();
}

//----------选择定向包-----------
const [AdOrientationModule, adOrientationModuleModalApi] = useVbenModal({
  connectedComponent: AdOrientation,
});

function openAdOrientationModule() {
  if (!creationInfo.value.configData.campaign.name)
    return message.warning('请先完善并保存“项目”基本信息');
  adOrientationModuleModalApi.setData(creationInfo.value.configData.audience);
  adOrientationModuleModalApi.open();
}

/**
 * 添加定向包到大对象
 * @param data
 */
function handlerOrientation(data: VivoAudienceData) {
  creationInfo.value.configData.audience = data;
}

//----------标题包-----------
const [TitlePackagePopupModule, titlePackagePopupModuleModalApi] = useVbenModal({
  connectedComponent: TitlePackagePopup,
});

function openTitlePackagePopupModule() {
  if (!creationInfo.value.configData.promotion.name)
    return message.warning('请先完善并保存“素材组”基本信息');
  titlePackagePopupModuleModalApi.setData(creationInfo.value.configData.titlePackage);
  titlePackagePopupModuleModalApi.open();
}

/**添加标题包到大对象 */
function handleTitlePackageUpdate(data: VivoTitlePackageData) {
  creationInfo.value.configData.titlePackage = data;
}

//----------创意素材组-----------
const [CreativeMaterialsDrawerModule, creativeMaterialsDrawerApi] = useVbenDrawer({
  connectedComponent: CreativeMaterialsDrawer,
});

function openCreativeMaterialsDrawerModule() {
  if (!creationInfo.value.configData.adgroup.name)
    return message.warning('请先完善并保存“广告组”基本信息');
  creativeMaterialsDrawerApi.setData({
    promotion: creationInfo.value.configData.promotion,
    material: creationInfo.value.configData.material,
  });
  creativeMaterialsDrawerApi.open();
}

/**广告创意素材上半部分组 */
function handleCreativeMaterialsDrawerUpdate(data: VivoPromotionData) {
  creationInfo.value.configData.promotion = data;
}

/**广告创意素材组（视频+图片） */
function handleCreativeMaterialsGroupList(data: MaterialData) {
  creationInfo.value.configData.material = data;
}

/**广告创意素材组（deepLink链接） */
function handleDeepLink(data: VivoDeepLinkData) {
  creationInfo.value.configData.deepLinkList = data;
}

/**清空广告创意素材上半部分组 */
function handleClearCreativeMaterialsDrawerUpdate(data: VivoPromotionData) {
  creationInfo.value.configData.promotion = data;
}

/**清空广告创意素材组（视频+图片） */
function handleClearCreativeMaterialsGroupList(data: MaterialData) {
  creationInfo.value.configData.material = data;
}

/**项目 */
function handleProductUpdate(data: Project) {
  creationInfo.value.project = data;
}

/**媒体账户 */
function handleAccountUpdate(data: Array<AccountInfo>) {
  // 1. 获取旧的 ID 集合用于对比
  const oldIds = creationInfo.value.accountInfo
    .map((a) => a.localAdvertiserId)
    .sort()
    .join(',');
  const newIds = data
    .map((a) => a.localAdvertiserId)
    .sort()
    .join(',');

  // 2. 只有当 ID 列表真的变了，才执行清理逻辑
  if (oldIds !== newIds) {
    const config = creationInfo.value.configData;

    // 需要清理的模块配置
    const cleanupTargets = [
      { obj: config.audience, methodKey: 'audienceConfig' },
      { obj: config.material, methodKey: 'config' },
      { obj: config.titlePackage, methodKey: 'titlePackageConfig' },
    ];

    cleanupTargets.forEach(({ obj, methodKey }) => {
      // 检查是否为“按账户配置”模式
      if ((obj as any)[methodKey]?.method === 'account') {
        // obj.data.clear(); // 清空 Map
        // 提示：也可以根据需要重新创建一个空的 Map 触发响应式
        obj.data = new Map();
      }
    });

    if (config.material.config.method === 'account') {
      config.promotion = {
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
      };
      // 如果有子组件引用，记得同步更新子组件内部状态
    }

    // 账户变了，预览表格也需要重置（因为表格行是基于账户生成的）
    if (previewAreaRef.value) {
      previewAreaRef.value.clearTable();
    }

    // 可选：给用户一个明确的提示
    if (oldIds !== '') {
      // 排除掉从无到有的初始赋值情况
      message.info('媒体账户已变更，已重置分账户配置数据');
    }
  }

  // 最后更新数据
  creationInfo.value.accountInfo = data;
}

/**复用策略组 */
function handleReuseUpdate(data: VivoCreation) {
  // 核心：在赋值前，恢复被丢失的 Map 类型
  if (data.configData) {
    const config = data.configData;

    // 1. 恢复 advertiserQualification
    if (!(config.advertiserQualification instanceof Map)) {
      config.advertiserQualification = new Map(
        Object.entries(config.advertiserQualification || {}),
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
  }

  creationInfo.value = data;
  configurationAreaRef.value.reuseDisplay(
    creationInfo.value.project,
    creationInfo.value.accountInfo,
  );
  advertisingGroupRef.value.setLocalAdGroupData(
    creationInfo.value.configData.adgroup,
    creationInfo.value.configData.advertiserQualification,
  );
  console.log(creationInfo.value, '复用策略组');
}

/**配置规则 */
function handleRuleUpdate(data: RuleInfo) {
  creationInfo.value.ruleInfo = data;
}

/**项目基本信息 */
function handleProjectConfigUpdate(data: VivoCampaignData) {
  creationInfo.value.configData.campaign = data;
}

/**广告组基本信息 */
function handleAdGroupUpdate(data: VivoAdgroupData) {
  creationInfo.value.configData.adgroup = data;
}

/**广告组投放资质 */
function handleAdQualification(data: Map<string, QualificationValue>) {
  creationInfo.value.configData.advertiserQualification = data;
}

/**如果项目里的推广目标改变，广告组的所有数据需要重新填写 */
function handleAdTypeChangeWarning() {
  creationInfo.value.configData.adgroup = {
    apkId: 0,
    appPackageName: '',
    appletOriginId: '',
    appletPath: '',
    biddingStrategy: 0,
    builtInRpkDeepLink: '',
    campaignId: 0,
    channelId: 0,
    chargeType: null,
    conversionFilterCycle: 0,
    cvType: '',
    dailyBudget: -1,
    endDate: '',
    h5Code: '',
    h5Type: null,
    industry1: '',
    industry2: '',
    name: '',
    ocpxPrice: 0,
    price: 0,
    productUrlType: 0,
    retrieveType: 0,
    rpkDeepLink: '',
    ruleAudience: '',
    scheduleTime: '',
    secondCvType: null,
    secondOcpxPrice: 0,
    spentType: null,
    startDate: '',
    subpackageId: 0,
    webSiteUrl: '',
    wechatFollow: 0,
  };
  creationInfo.value.configData.advertiserQualification = new Map<string, QualificationValue>();
  advertisingGroupRef.value.setLocalAdGroupData(
    creationInfo.value.configData.adgroup,
    creationInfo.value.configData.advertiserQualification,
  );
  message.warning('“推广目标”已变更，请重新完善“广告组”基本信息');
}

//----------监测链接组-----------
const [monitoringLinkGroupModal, modalApi] = useVbenModal({
  connectedComponent: MonitoringLinkGroup,
});

/**打开监测链接组 */
function openMonitoringLinkModal() {
  modalApi.open();
}

function handlemonitoringLinkGroupUpdate(data: MonitoringLinkType) {
  creationInfo.value.monitoringLink = data;
}

/**生成预览 */
function generatePreview() {
  if (
    creationInfo.value.accountInfo.length &&
    creationInfo.value.project.projectId &&
    creationInfo.value.configData.campaign.name &&
    creationInfo.value.configData.adgroup.name &&
    creationInfo.value.configData.promotion.name &&
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
</script>

<template>
  <Page auto-content-height>
    <div class="vivo">
      <Card>
        <h2 class="text">配置区</h2>
        <div class="configTop">
          <ConfigurationArea
            ref="configurationAreaRef"
            :accountInfo="creationInfo.accountInfo"
            :projectInfo="creationInfo.project"
            @update:accountInfo="handleAccountUpdate"
            @update:productInfo="handleProductUpdate"
          />
          <RuleConfiguration
            :ruleInfo="creationInfo.ruleInfo"
            @update:ruleInfo="handleRuleUpdate"
            @update:reuse="handleReuseUpdate"
          />
        </div>
        <Row :gutter="16">
          <Col :span="6">
            <ProjectModule
              :has-account="creationInfo.accountInfo.length > 0"
              :has-product="!!creationInfo.project.projectId"
              :campaign="creationInfo.configData.campaign"
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
                @update:adQualification="handleAdQualification"
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
          <Col :span="6">
            <Card>
              <TitlePackageModule
                :titlePackage="creationInfo.configData.titlePackage"
                :accountInfo="creationInfo.accountInfo"
              />
              <TitlePackagePopupModule
                :accountInfo="creationInfo.accountInfo"
                :titlePackage="creationInfo.configData.titlePackage"
                @update:titlePackageConfig="handleTitlePackageUpdate"
              />
              <div class="btnCla">
                <Button type="text" @click="openTitlePackagePopupModule()">添加标题包</Button>
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
    </div>
    <monitoringLinkGroupModal
      :accountInfo="creationInfo.accountInfo"
      :monitoringLink="creationInfo.monitoringLink"
      @update:monitoringLinkGroup="handlemonitoringLinkGroupUpdate"
    />
    <CreateModule />
  </Page>
</template>

<style scoped lang="scss">
.vivo {
  height: 100%;

  .text {
    font-size: 16px;
    font-weight: 600;
  }

  .configTop {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: -10px;
  }

  .generateButton {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }

  .btnCla {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}
</style>
