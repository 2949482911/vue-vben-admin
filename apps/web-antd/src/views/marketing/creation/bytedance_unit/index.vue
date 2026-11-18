<script setup lang="ts">
import type { ProductConfigData } from '../bytedance_std/bytedance';
/**
 * 巨量引擎-全域批投页面
 *
 * 单层结构：只有项目层级；素材/标题/抖音号全部内嵌在项目参数中。
 * 提交时 extraParams.taskType=bytedance_unit，后端路由到 BytedanceUnitCreateAdvertisement。
 */
import type {
  UnitCreation,
  UnitProjectCreateRequest,
} from './bytedance';

import type { DpaProductAllocationConfig } from '#/views/marketing/creation/components/dpa_product/types';
import type {
  AudienceConfigData,
  AwemeConfigData,
  MaterialData,
  PageViewConfigData,
  RuleConfiguration,
  RuleInfo,
  RuleOptions,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';

import { ref, watch } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { Platform, SubType } from '#/constants/enums';
import { normalizeAwemeConfig } from '#/views/marketing/creation/components/aweme/types';
import BatchCreateLayout from '#/views/marketing/creation/components/batch_shell/BatchCreateLayout.vue';
import {
  createEmptyDpaProductConfig,
  normalizeDpaProductConfig,
} from '#/views/marketing/creation/components/dpa_product/types';
import { normalizeProductConfig } from '#/views/marketing/creation/components/product_config/types';
import { RuleKey, RuleMethod } from '#/views/marketing/creation/creation_enums';

import ConfigurationConfig from '../components/configurationArea.vue';
import CreateStrategyGroup from '../components/createStrategyGroup.vue';
import Function from '../components/Function.vue';
import BatchTaskResultDrawer from '../components/result/BatchTaskResultDrawer.vue';
import Submit from '../components/submit/SubmitModal.vue';
import { BYTEDANCE_UNIT } from './bytedance';
import UnitBaseTemplate from './components/UnitBaseTemplate.vue';
import UnitProjectPreviewArea from './components/UnitProjectPreviewArea.vue';
import { getPreviewTableData } from './convertToPreviewData';

const [SubmitModal, submitApi] = useVbenModal({
  connectedComponent: Submit,
});

const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  },
});

type ResultDrawerData = {
  hiddenLayers?: Array<'adGroup' | 'campaign' | 'creative' | 'promotion'>;
  platform: string;
  projectId: string;
  taskId: string;
  taskName: string;
};

const currentTask = ref<null | ResultDrawerData>(null);
const taskInProgress = ref(false);

const [TaskResultDrawer, taskResultDrawerApi] = useVbenDrawer({
  connectedComponent: BatchTaskResultDrawer,
});

function openResultDrawer() {
  if (!currentTask.value) {
    return;
  }
  taskResultDrawerApi.open();
}

function handleTaskCreated(data: { taskId: string; taskName: string }) {
  currentTask.value = {
    hiddenLayers: ['adGroup', 'promotion'],
    platform: creationInfo.value.platform,
    projectId: creationInfo.value.project.projectId,
    taskId: data.taskId,
    taskName: data.taskName,
  };
  taskInProgress.value = true;
  openResultDrawer();
}

function viewTaskProgress() {
  openResultDrawer();
}

function onTaskCompleted(_status: number) {
  // 任务完成，保留进度入口
}

const bytedanceUnitRuleConfiguration: RuleConfiguration = {
  adGroup: {
    countLabel: '每个项目指定广告组数',
    name: '广告组',
    rules: '广告组生成规则',
    show: false,
  },
  ad: {
    countLabel: '每个广告组指定广告数',
    name: '广告',
    rules: '广告生成规则',
    show: false,
  },
  creative: {
    countLabel: '每个广告指定创意数',
    name: '创意',
    rules: '创意生成规则',
    show: false,
  },
  project: {
    countLabel: '每个账户指定项目数',
    name: '项目',
    rules: '项目生成规则',
    show: true,
  },
};

const bytedanceUnitRuleOptions: RuleOptions = {
  adGroupRules: [],
  adRules: [],
  creativeRules: [],
  projectRules: [
    {
      desc: '项目数量与定向包数量相等',
      key: 'targeting',
      title: '根据定向包生成',
    },
    {
      desc: '项目数量与创意组数量相等',
      key: 'creative',
      title: '根据创意组生成',
    },
    {
      desc: '项目数量与标题包数量相等',
      key: 'title',
      title: '根据标题包生成',
    },
    {
      desc: '手动指定每个账户的项目数量',
      key: 'custom',
      title: '指定数量',
    },
  ],
};

function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error('请先配置预览区数据');
    return;
  }
  submitApi.open();
}

function saveStrategyGroup() {
  createStrategyGroupApi.setData(creationInfo.value);
  createStrategyGroupApi.open();
}

function updateAccountInfo(accountInfo: UnitCreation['accountInfo']) {
  creationInfo.value.accountInfo = accountInfo;
}

function updateProject(project: UnitCreation['project']) {
  creationInfo.value.project = project;
}

function updateRuleInfo(ruleInfo: RuleInfo) {
  creationInfo.value.ruleInfo = ruleInfo;
}

function updateProjectData(project: UnitProjectCreateRequest) {
  creationInfo.value.configData.project = project;
}

function updateAudiencePackage(audience: AudienceConfigData) {
  creationInfo.value.configData.audience = audience;
}

function updateMaterial(material: MaterialData) {
  creationInfo.value.configData.material = material;
}

function updateLandingPage(landingPage: PageViewConfigData) {
  creationInfo.value.configData.landingPage = landingPage;
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  creationInfo.value.configData.titlePackage = titlePackage;
}

function updateAwemeConfig(awemeConfig: AwemeConfigData) {
  creationInfo.value.configData.awemeConfig = awemeConfig;
}

function updateProductConfig(productConfig: ProductConfigData) {
  creationInfo.value.configData.productConfig = productConfig;
}

function updateDpaProductConfig(dpaProductConfig: DpaProductAllocationConfig) {
  creationInfo.value.configData.dpaProductConfig = dpaProductConfig;
}

function resetCreationInfo() {
  if (adList.value.length > 0) {
    adList.value = [];
    message.warn('配置已更新,预览区已重置');
  }
}

/** 媒体必填项校验：source / 投放商品 / 抖音号 / 视频 / 标题 / 产品配置 / 落地页 */
function validateProjectData(data: ReturnType<typeof getPreviewTableData>) {
  if (data.length === 0) {
    return '请先选择媒体账户';
  }
  const projects = data.flatMap((item) => item.projectList);
  if (projects.length === 0) {
    return '请先填写项目配置并生成预览';
  }
  if (
    projects.some(
      (item) =>
        !item.related_product?.product_platform_id ||
        !item.related_product?.product_id,
    )
  ) {
    return '请配置投放商品';
  }
  if (projects.some((item) => !item.source?.trim())) {
    return '请填写项目来源（source 为媒体必填）';
  }
  if (projects.some((item) => Number(item.budget) < 300)) {
    return '项目预算不能低于 300 元';
  }
  if (
    projects.some(
      (item) =>
        item.schedule_type === 'SCHEDULE_START_END' &&
        (!item.start_time || !item.end_time),
    )
  ) {
    return '指定起止日期时，请填写开始和结束日期';
  }
  if (projects.some((item) => !item.aweme_id)) {
    return '请配置抖音号';
  }
  if (
    projects.some(
      (item) =>
        (item.video_material_list ?? []).every(
          (material) => (material.local_video_material_list ?? []).length === 0,
        ),
    )
  ) {
    return '每个项目至少需要 1 个视频素材';
  }
  if (projects.some((item) => (item.title_material_list ?? []).length === 0)) {
    return '请至少选择一个标题';
  }
  if (
    projects.some(
      (item) =>
        (item.product_info?.titles ?? []).length === 0 ||
        ((item.product_info?.local_images_ids ?? []).length === 0 &&
          (item.product_info?.image_ids ?? []).length === 0),
    )
  ) {
    return '请配置产品信息（产品名称、产品主图）';
  }
  if (
    projects.some(
      (item) => (item.playlet_series_url_info ?? []).length === 0,
    )
  ) {
    return '请选择落地页作为短剧专辑链接';
  }
  return '';
}

function genPreviewTableData() {
  const data = getPreviewTableData(creationInfo.value);
  const error = validateProjectData(data);
  if (error) {
    message.error(error);
    return;
  }
  currentTask.value = null;
  taskInProgress.value = false;
  taskResultDrawerApi.close();
  adList.value = data;
}

const creationInfo = ref<UnitCreation>({
  accountInfo: [],
  configData: {
    audience: { config: { method: RuleMethod.ALL }, data: new Map() },
    awemeConfig: { config: { method: 'ALL_SAME' }, data: new Map() },
    landingPage: { config: { method: RuleMethod.ALL }, data: new Map() },
    material: { config: { method: RuleMethod.ALL }, data: new Map() },
    project: {
      aigc_dynamic_creative_switch: 'ON',
      audience: {
        age: [],
        district: 'NONE',
        gender: 'NONE',
        platform: [],
      },
      budget: 0,
      delivery_product: 'ALBUM',
      end_time: '',
      going_global_switch: 'OFF',
      monetization_mode: 'IAP',
      name: '',
      schedule_time: '',
      schedule_type: 'SCHEDULE_FROM_NOW',
      source: '',
      start_time: '',
      uni_roi_goal: 0,
    },
    productConfig: { config: { method: 'ALL_SAME' }, data: new Map() },
    dpaProductConfig: createEmptyDpaProductConfig(),
    titlePackage: { config: { method: RuleMethod.ALL }, data: new Map() },
  },
  configurationConfig: {
    platform: Platform.BYTEDANCE,
    showSubType: true,
    subType: SubType.BYTEDANCE_UNIT,
    template: 'unit_template',
  },
  monitoringLink: {
    allocateType: '',
    clickLink: '',
    exposureLink: '',
    linkModeType: '',
    monitorLink: '',
    ocpxTaskId: '',
  },
  platform: Platform.BYTEDANCE,
  project: {
    appId: '',
    downloadUrl: '',
    icon: '',
    packageName: '',
    projectId: '',
    projectName: '',
  },
  ruleInfo: {
    adCount: 1,
    adGroupCount: 1,
    adGroupRuleKey: RuleKey.TARGET,
    adRuleKey: RuleKey.CREATIVE,
    creativeCount: 1,
    creativeRuleKey: RuleKey.CREATIVE_GROUP,
    projectCount: 1,
    projectRuleKey: RuleKey.TARGET,
  },
  subType: SubType.BYTEDANCE_UNIT,
  version: BYTEDANCE_UNIT,
});

function updateReuse(creation: UnitCreation) {
  const config = creation.configData;
  if (config.audience && !(config.audience.data instanceof Map)) {
    config.audience.data = new Map(Object.entries(config.audience.data || {}));
  }
  if (config.landingPage && !(config.landingPage.data instanceof Map)) {
    config.landingPage.data = new Map(
      Object.entries(config.landingPage.data || {}),
    );
  }
  if (config.material && !(config.material.data instanceof Map)) {
    config.material.data = new Map(Object.entries(config.material.data || {}));
  }
  if (config.titlePackage && !(config.titlePackage.data instanceof Map)) {
    config.titlePackage.data = new Map(
      Object.entries(config.titlePackage.data || {}),
    );
  }
  config.awemeConfig = normalizeAwemeConfig(config.awemeConfig);
  config.productConfig = normalizeProductConfig(config.productConfig);
  config.dpaProductConfig = normalizeDpaProductConfig(config.dpaProductConfig);
  creationInfo.value = creation;
}

const adList = ref<ReturnType<typeof getPreviewTableData>>([]);

watch(
  () => creationInfo,
  () => {
    resetCreationInfo();
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <BatchCreateLayout>
    <template #config>
      <ConfigurationConfig
        compact
        :account-info="creationInfo.accountInfo"
        :configuration-config="creationInfo.configurationConfig"
        :project="creationInfo.project"
        :rule-configuration="bytedanceUnitRuleConfiguration"
        :rule-info="creationInfo.ruleInfo"
        :rule-options="bytedanceUnitRuleOptions"
        @update:account-info="updateAccountInfo"
        @update:product-info="updateProject"
        @update:reuse="updateReuse"
        @update:rule-info="updateRuleInfo"
      />
    </template>

    <template #workbench>
      <UnitBaseTemplate
        :creation-info="creationInfo"
        @update:audience-package="updateAudiencePackage"
        @update:aweme-config="updateAwemeConfig"
        @update:dpa-product-config="updateDpaProductConfig"
        @update:landing-page="updateLandingPage"
        @update:product-config="updateProductConfig"
        @update:project="updateProjectData"
        @update:title-package="updateTitlePackage"
        @update:update-material="updateMaterial"
      />
    </template>

    <template #actions>
      <Function
        :account-info="creationInfo.accountInfo"
        :monitoring-link="creationInfo.monitoringLink"
        :show-monitoring="false"
        :task-in-progress="taskInProgress"
        @gen:ad-list="genPreviewTableData"
        @save:create-strategy-group="saveStrategyGroup"
        @submit:create-batch="submitCreateBatch"
        @view:task-progress="viewTaskProgress"
      />
    </template>

    <template #preview>
      <UnitProjectPreviewArea
        fill
        :account-info="creationInfo.accountInfo"
        :ad-list="adList"
      />
    </template>

    <CreateStrategyGroupModal />

    <SubmitModal
      :ad-list="adList"
      :creation-info="creationInfo"
      :extra-params="{ taskType: 'bytedance_unit' }"
      @result:get-creation-task="handleTaskCreated"
    />

    <TaskResultDrawer :task="currentTask" @task-completed="onTaskCompleted" />
  </BatchCreateLayout>
</template>
