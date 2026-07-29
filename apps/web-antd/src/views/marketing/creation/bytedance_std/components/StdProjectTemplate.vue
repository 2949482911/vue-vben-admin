<script setup lang="ts" name="StdProjectTemplate">
/**
 * 巨量智擎版统一模板
 *
 * 单层结构：所有配置均在项目层级，通过 StdProjectForm 卡片管理
 * 复用共享组件：素材选择器(CreativeGroupSelector)、标题包(TitleSelector)、落地页(PageViewSelector)
 */
import { Col, Row } from 'ant-design-vue';

import StdProjectForm from './StdProjectForm.vue';
import CreativeGroupSelector
  from '#/views/marketing/creation/components/creative/CreativeGroupSelector.vue';
import TitleSelector
  from '#/views/marketing/creation/components/title/TitleSelector.vue';
import PageViewSelector
  from '#/views/marketing/creation/components/pageview/PageViewSelector.vue';
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';
import type {
  StdCreation,
  StdProjectData,
} from '#/views/marketing/creation/bytedance_std/bytedance';

const emit = defineEmits([
  'update:project',
  'update:audiencePackage',
  'update:updateMaterial',
  'update:titlePackage',
  'update:landingPage',
]);

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => StdCreation,
    default: () => ({}),
  },
});

function updateProject(project: StdProjectData) {
  emit('update:project', project);
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}

function updateMaterial(materialData: MaterialData) {
  emit('update:updateMaterial', materialData);
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit('update:titlePackage', titlePackage);
}

function updateLandingPage(landingPage: PageViewConfigData) {
  emit('update:landingPage', landingPage);
}
</script>

<template>
  <div class="std-project-template">
    <Row :gutter="16" class="equal-height-row">
      <!-- 第1列：项目配置 + 定向包 -->
      <Col :span="8" class="equal-height-col">
        <StdProjectForm
          :project="creationInfo?.configData.project"
          :audience="creationInfo?.configData.audience"
          :account-info="creationInfo.accountInfo"
          @update:project="updateProject"
          @update:audience-package="updateAudiencePackage"
        />
      </Col>

      <!-- 第2列：创意组（素材选择器） -->
      <Col :span="8" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          @update:material="updateMaterial"
        />
      </Col>

      <!-- 第3列：落地页 + 标题包 -->
      <Col :span="8" class="equal-height-col">
        <div class="combined-area">
          <PageViewSelector
            :page-view="creationInfo.configData.landingPage"
            :account-info="creationInfo.accountInfo"
            @update:page-view="updateLandingPage"
          />
          <TitleSelector
            :title-package="creationInfo.configData.titlePackage"
            :account-info="creationInfo.accountInfo"
            @update:title-package="updateTitlePackage"
          />
        </div>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">
.std-project-template {
  width: 100%;
}

.equal-height-row {
  display: flex;
  align-items: stretch;
  height: 650px;
}

.equal-height-col {
  display: flex;
  min-height: 0;

  > * {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

.combined-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
  }
}
</style>
