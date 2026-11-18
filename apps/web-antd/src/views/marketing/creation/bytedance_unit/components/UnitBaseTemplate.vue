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
  <div class="panes batch-config-panes">
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
</template>

<style scoped lang="scss"></style>
