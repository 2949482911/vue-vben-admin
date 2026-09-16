<script setup lang="ts">
// vivo 新版（vivo 2.0）批量投放（批创）
// 产品形式与其他媒体保持一致：配置区（账户/产品/规则） → 模板选择 → 模板配置（计划/广告/定向包/素材/标题包/落地页） → 监测链接组 → 预览区
// 字段定义见 ./vivo_v2.ts，文档：
//   计划 https://open-ad.vivo.com.cn/doc?id=677
//   广告 https://open-ad.vivo.com.cn/doc?id=687
//   枚举 https://open-ad.vivo.com.cn/doc?id=171
import type { AccountInfo, Project, RuleInfo } from '#/views/marketing/creation/creation';
import type {
  VivoV2AdData,
  VivoV2Creation,
  VivoV2PlanData,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Select } from 'ant-design-vue';

import BatchCreateLayout from '#/views/marketing/creation/components/batch_shell/BatchCreateLayout.vue';
import ConfigurationConfig from '#/views/marketing/creation/components/configurationArea.vue';
import CreateStrategyGroup from '#/views/marketing/creation/components/createStrategyGroup.vue';
import Function from '#/views/marketing/creation/components/Function.vue';
import VivoV2BaseTemplate from '#/views/marketing/creation/vivo_v2/components/base/VivoV2BaseTemplate.vue';
import VivoV2PreviewArea from '#/views/marketing/creation/vivo_v2/components/VivoV2PreviewArea.vue';
import { VIVO_V2_MARKETING_TYPE } from '#/views/marketing/creation/vivo_v2/enums';
import { vivoV2RuleConfiguration, vivoV2RuleOptions } from '#/views/marketing/creation/vivo_v2/rules';
import {
  defaultVivoV2Creation,
  getVivoV2TableData,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

// 预览数据列表
const adList = ref<Array<any>>([]);
const template = ref<string>('base_template');

// vivo2.0 创建信息
const creationInfo = ref<VivoV2Creation>(defaultVivoV2Creation());

/**
 * 更新模板
 */
async function updateTemplate(changeVal: string) {
  template.value = changeVal;
  creationInfo.value = defaultVivoV2Creation();
  creationInfo.value.configurationConfig.template = changeVal;
}

// 策略组保存弹窗
const [CreateStrategyGroupModal, createStrategyGroupApi] = useVbenModal({
  connectedComponent: CreateStrategyGroup,
  onCancel() {
    createStrategyGroupApi.close();
  },
});

// 监听数据变化，自动清空预览区
watch(
  () => creationInfo.value,
  () => {
    if (adList.value.length > 0) {
      adList.value = [];
      message.warn('配置已更新，预览区已重置');
    }
  },
  { deep: true },
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
 * JSON 序列化会丢失 Map 类型，这里统一恢复
 */
function updateReuse(vivoV2Creation: VivoV2Creation) {
  const config: any = vivoV2Creation.configData;
  if (config) {
    const mapFields = [
      'audience',
      'material',
      'titlePackage',
      'landingPage',
      'monitoringLink',
    ] as const;
    mapFields.forEach((field) => {
      if (config[field] && !(config[field].data instanceof Map)) {
        config[field].data = new Map(Object.entries(config[field].data || {}));
      }
    });
    if (!(config.qualification instanceof Map)) {
      config.qualification = new Map(Object.entries(config.qualification || {}));
    }
    if (!(config.channelPackage instanceof Map)) {
      config.channelPackage = new Map(Object.entries(config.channelPackage || {}));
    }
  }
  if (vivoV2Creation.configurationConfig?.template) {
    template.value = vivoV2Creation.configurationConfig.template;
  }
  creationInfo.value = vivoV2Creation;
}

/**
 * 更新计划信息
 */
function updateCampaign(campaign: Partial<VivoV2PlanData>) {
  Object.assign(creationInfo.value.configData.campaign, campaign);
}

/**
 * 更新广告信息
 */
function updateAd(ad: Partial<VivoV2AdData>) {
  Object.assign(creationInfo.value.configData.ad, ad);
}

/**
 * 更新定向包
 */
function updateAudiencePackage(audience: any) {
  creationInfo.value.configData.audience = audience;
}

/**
 * 更新素材
 */
function updateMaterial(material: any) {
  creationInfo.value.configData.material = material;
}

/**
 * 更新标题包
 */
function updateTitlePackage(titlePackage: any) {
  creationInfo.value.configData.titlePackage = titlePackage;
}

/**
 * 更新落地页
 */
function updatePageView(landingPage: any) {
  creationInfo.value.configData.landingPage = landingPage;
}

/**
 * 更新监测链接
 */
function updateMonitoringLink(monitoringLink: any) {
  creationInfo.value.configData.monitoringLink = monitoringLink;
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
  adList.value = getVivoV2TableData(creationInfo.value);
}

/**
 * 提交创建批投
 */
function submitCreateBatch() {
  if (adList.value.length === 0) {
    message.error('请先生成预览数据');
    return;
  }
  // TODO: 对接 vivo2.0 批创提交接口（计划 addPlan / 广告 ad/add），当前仅完成参数配置与预览
  message.info('提交接口待对接');
}
</script>

<template>
  <BatchCreateLayout>
    <template #config>
      <ConfigurationConfig
        compact
        :rule-info="creationInfo.ruleInfo"
        :configuration-config="creationInfo.configurationConfig"
        :account-info="creationInfo.accountInfo"
        :project="creationInfo.project"
        :rule-configuration="vivoV2RuleConfiguration"
        :rule-options="vivoV2RuleOptions"
        @update:account-info="updateAccountInfo"
        @update:product-info="updateProject"
        @update:rule-info="updateRuleInfo"
        @update:reuse="updateReuse"
      >
        <template #field-extra>
          <div class="field template-field">
            <span class="field-label">模板</span>
            <Select
              class="template-select"
              :options="VIVO_V2_MARKETING_TYPE"
              :value="template"
              @change="(val) => updateTemplate(String(val))"
            />
          </div>
        </template>
      </ConfigurationConfig>
    </template>

    <template #workbench>
      <VivoV2BaseTemplate
        v-if="template === 'base_template'"
        :creation-info="creationInfo"
        @update:campaign="updateCampaign"
        @update:ad="updateAd"
        @update:audience-package="updateAudiencePackage"
        @update:material="updateMaterial"
        @update:title-package="updateTitlePackage"
        @update:page-view="updatePageView"
      />
    </template>

    <template #actions>
      <Function
        :account-info="creationInfo.accountInfo"
        :monitoring-link="creationInfo.configData.monitoringLink"
        @update:monitoring-link="updateMonitoringLink"
        @save:create-strategy-group="createStrategyGroup"
        @gen:ad-list="genPreviewTableData"
        @submit:create-batch="submitCreateBatch"
      />
    </template>

    <template #preview>
      <VivoV2PreviewArea fill :table-data="adList" :account-info="creationInfo.accountInfo" />
    </template>

    <CreateStrategyGroupModal />
  </BatchCreateLayout>
</template>

<style scoped lang="scss">
.template-select {
  width: 180px;
}
</style>
