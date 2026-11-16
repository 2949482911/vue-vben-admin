<script setup lang="ts" name="UnitBaseTemplate">
import type { ProductConfigData } from '../../bytedance_std/bytedance';
import type {
  UnitCreation,
  UnitProjectCreateRequest,
} from '../bytedance';

import type {
  AudienceConfigData,
  AwemeConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';

import { Platform } from '#/constants/enums';
import ProductConfigCard from '#/views/marketing/creation/bytedance_std/components/product/ProductConfigCard.vue';
import AudiencePackageSelector from '#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue';
import AwemeConfigCard from '#/views/marketing/creation/components/aweme/AwemeConfigCard.vue';
import CreativeGroupSelector from '#/views/marketing/creation/components/creative/CreativeGroupSelector.vue';
import PageViewSelector from '#/views/marketing/creation/components/pageview/PageViewSelector.vue';
import TitleSelector from '#/views/marketing/creation/components/title/TitleSelector.vue';

import UnitProject from './UnitProject.vue';

const { creationInfo } = defineProps<{
  creationInfo: UnitCreation;
}>();

const emit = defineEmits([
  'update:project',
  'update:audiencePackage',
  'update:awemeConfig',
  'update:landingPage',
  'update:titlePackage',
  'update:updateMaterial',
  'update:productConfig',
]);

function updateAudiencePackage(audience: AudienceConfigData) {
  emit('update:audiencePackage', audience);
}

function updateProject(project: UnitProjectCreateRequest) {
  emit('update:project', project);
}
function updateAwemeConfig(awemeConfig: AwemeConfigData) {
  emit('update:awemeConfig', awemeConfig);
}
function updateLandingPage(landingPage: PageViewConfigData) {
  emit('update:landingPage', landingPage);
}
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit('update:titlePackage', titlePackage);
}
function updateMaterial(material: MaterialData) {
  emit('update:updateMaterial', material);
}

function updateProductConfig(productConfig: ProductConfigData) {
  emit('update:productConfig', productConfig);
}
</script>

<template>
  <div class="unit-base-template">
    <div class="panes">
      <div class="pane">
        <div class="split-pane">
          <UnitProject
            :account-info="creationInfo.accountInfo"
            :project="creationInfo.configData.project"
            @update:project="updateProject"
          />
          <AudiencePackageSelector
            :account-info="creationInfo.accountInfo"
            :audience="creationInfo.configData.audience"
            :platform="Platform.BYTEDANCE"
            @update:audience="updateAudiencePackage"
          />
        </div>
      </div>

      <div class="pane">
        <div class="combined-area">
          <ProductConfigCard
            :account-info="creationInfo.accountInfo"
            :product-config="creationInfo.configData.productConfig"
            @update:product-config="updateProductConfig"
          />
          <CreativeGroupSelector
            :account-info="creationInfo.accountInfo"
            :material="creationInfo.configData.material"
            @update:material="updateMaterial"
          />
        </div>
      </div>

      <div class="pane">
        <div class="combined-area">
          <PageViewSelector
            :account-info="creationInfo.accountInfo"
            :page-view="creationInfo.configData.landingPage"
            @update:page-view="updateLandingPage"
          />
          <TitleSelector
            :account-info="creationInfo.accountInfo"
            :title-package="creationInfo.configData.titlePackage"
            @update:title-package="updateTitlePackage"
          />
          <AwemeConfigCard
            :account-info="creationInfo.accountInfo"
            :aweme-config="creationInfo.configData.awemeConfig"
            :supported-rules="['PER_PROJECT', 'PER_ACCOUNT']"
            @update:aweme-config="updateAwemeConfig"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.unit-base-template {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.panes {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

/* 全域项目 + 定向包各占一半 */
.split-pane {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
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
    flex: 1;
    min-height: 0;
  }
}
</style>
