<script setup lang="ts" name="VivoV2BaseTemplate">
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';
import type {
  VivoV2AdData,
  VivoV2Creation,
  VivoV2PlanData,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { Col, Row } from 'ant-design-vue';

import { Platform } from '#/constants/enums';
import AudiencePackageSelector from '#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue';
import CreativeGroupSelector from '#/views/marketing/creation/components/creative/CreativeGroupSelector.vue';
import PageViewSelector from '#/views/marketing/creation/components/pageview/PageViewSelector.vue';
import TitleSelector from '#/views/marketing/creation/components/title/TitleSelector.vue';
import VivoV2Ad from '#/views/marketing/creation/vivo_v2/components/VivoV2Ad.vue';
import VivoV2Campaign from '#/views/marketing/creation/vivo_v2/components/VivoV2Campaign.vue';

/**
 * vivo 2.0 基础模板 props
 * 包含 creationInfo
 */
const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => VivoV2Creation,
    default: () => ({}) as VivoV2Creation,
  },
});

/**
 * vivo 2.0 基础模板：把「计划 / 广告 / 定向包 / 创意组(素材) / 标题包 / 落地页」串成一个模板
 * vivo 2.0 只有计划 / 广告两级，无广告组层级
 */
const emit = defineEmits([
  'update:campaign',
  'update:ad',
  'update:audiencePackage',
  'update:material',
  'update:titlePackage',
  'update:pageView',
]);

/**
 * update campaign
 */
function updateCampaign(campaign: Partial<VivoV2PlanData>) {
  emit('update:campaign', campaign);
}

/**
 * update ad
 */
function updateAd(ad: Partial<VivoV2AdData>) {
  emit('update:ad', ad);
}

/**
 * 更新定向包
 */
function updateAudiencePackage(audience: AudienceConfigData) {
  emit('update:audiencePackage', audience);
}

/**
 * 更新素材（创意组）
 */
function updateMaterial(materialData: MaterialData) {
  emit('update:material', materialData);
}

/**
 * 编辑标题包
 * @param titlePackage 标题包
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit('update:titlePackage', titlePackage);
}

/**
 * 更新落地页
 * @param landingPage 落地页
 */
function updatePageView(landingPage: PageViewConfigData) {
  emit('update:pageView', landingPage);
}
</script>

<template>
  <div class="vivo-v2-base-template">
    <!-- 单行多列：每块配置独占一列，列高度对齐；小配置（定向包/标题包/落地页）合并到最后一列 -->
    <Row :gutter="16" class="equal-height-row">
      <Col :span="6" :xs="24" :md="12" :xl="6" class="equal-height-col">
        <VivoV2Campaign :creation-info="creationInfo" @update:campaign="updateCampaign" />
      </Col>

      <Col :span="6" :xs="24" :md="12" :xl="6" class="equal-height-col">
        <VivoV2Ad :creation-info="creationInfo" @update:ad="updateAd" />
      </Col>

      <Col :span="6" :xs="24" :md="12" :xl="6" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo?.accountInfo"
          :material="creationInfo?.configData?.material"
          :rule-info="creationInfo?.ruleInfo"
          @update:material="updateMaterial"
        />
      </Col>

      <!-- 小配置合并列：定向包 / 标题包 / 落地页 -->
      <Col :span="6" :xs="24" :md="12" :xl="6" class="equal-height-col">
        <div class="combined-area">
          <AudiencePackageSelector
            :audience="creationInfo?.configData?.audience"
            :account-info="creationInfo?.accountInfo"
            :platform="Platform.VIVO_NEW"
            :disabled="!creationInfo?.configData?.campaign?.name"
            @update:audience="updateAudiencePackage"
          />
          <TitleSelector
            :title-package="creationInfo?.configData?.titlePackage"
            :account-info="creationInfo?.accountInfo"
            @update:title-package="updateTitlePackage"
          />
          <PageViewSelector
            :page-view="creationInfo?.configData?.landingPage"
            :account-info="creationInfo?.accountInfo"
            @update:page-view="updatePageView"
          />
        </div>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">
.vivo-v2-base-template {
  width: 100%;
}

// 让所有列高度一致，但不强制扩容
.equal-height-row {
  display: flex;
  align-items: stretch;
}

.equal-height-col {
  display: flex;
  min-height: 0;

  // 让内部组件高度自适应父容器（匹配最高的列）
  > * {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-height: 0;
  }
}

// 合并列：多个小配置纵向排列，等分列高
.combined-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 0;
}
</style>
