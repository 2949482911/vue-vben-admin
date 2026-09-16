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
    <!-- 配置列：一行 4 列，列高由外层工作台决定；内容超出只在列内滚动 -->
    <div class="panes">
      <div class="pane">
        <VivoV2Campaign :creation-info="creationInfo" @update:campaign="updateCampaign" />
      </div>

      <div class="pane">
        <VivoV2Ad :creation-info="creationInfo" @update:ad="updateAd" />
      </div>

      <div class="pane">
        <CreativeGroupSelector
          :account-info="creationInfo?.accountInfo"
          :material="creationInfo?.configData?.material"
          :rule-info="creationInfo?.ruleInfo"
          @update:material="updateMaterial"
        />
      </div>

      <!-- 小配置合并列：定向包 / 标题包 / 落地页 -->
      <div class="pane">
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vivo-v2-base-template {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.panes {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }

  :deep(.ant-card) {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  :deep(.ant-card-head) {
    flex-shrink: 0 !important;
  }

  :deep(.ant-card-body) {
    display: flex !important;
    flex: 1 1 0% !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-content) {
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-footer) {
    flex-shrink: 0 !important;
  }
}

.combined-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1 1 0%;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
