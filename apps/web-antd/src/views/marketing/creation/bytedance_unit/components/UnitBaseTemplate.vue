<script setup lang="ts" name="UnitBaseTemplate">
import type { ProductConfigData } from '../../bytedance_std/bytedance';
import type {
  UnitCreation,
  UnitProjectCreateRequest,
} from '../bytedance';

import type { DpaProductAllocationConfig } from '#/views/marketing/creation/components/dpa_product/types';
import type {
  AudienceConfigData,
  AwemeConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';

import { Platform } from '#/constants/enums';
import AudiencePackageSelector from '#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue';
import AwemeConfigCard from '#/views/marketing/creation/components/aweme/AwemeConfigCard.vue';
import CreativeGroupSelector from '#/views/marketing/creation/components/creative/CreativeGroupSelector.vue';
import DpaProductAllocationCard from '#/views/marketing/creation/components/dpa_product/DpaProductAllocationCard.vue';
import PageViewSelector from '#/views/marketing/creation/components/pageview/PageViewSelector.vue';
import ProductConfigAllocationCard from '#/views/marketing/creation/components/product_config/ProductConfigAllocationCard.vue';
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
  'update:dpaProductConfig',
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

function updateDpaProductConfig(dpaProductConfig: DpaProductAllocationConfig) {
  emit('update:dpaProductConfig', dpaProductConfig);
}
</script>

<template>
  <div class="panes batch-config-panes">
    <UnitProject
      :project="creationInfo.configData.project"
      @update:project="updateProject"
    />
    <AudiencePackageSelector
      :account-info="creationInfo.accountInfo"
      :audience="creationInfo.configData.audience"
      :platform="Platform.BYTEDANCE"
      @update:audience="updateAudiencePackage"
    />
    <ProductConfigAllocationCard
      :account-info="creationInfo.accountInfo"
      :product-config="creationInfo.configData.productConfig"
      @update:product-config="updateProductConfig"
    />
    <DpaProductAllocationCard
      :account-info="creationInfo.accountInfo"
      :dpa-product-config="creationInfo.configData.dpaProductConfig"
      @update:dpa-product-config="updateDpaProductConfig"
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
      @update:aweme-config="updateAwemeConfig"
    />
  </div>
</template>

<style scoped lang="scss"></style>
