<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Card, Row, Col, Button } from "ant-design-vue";
import ConfigurationArea from "./configurationArea.vue"
import RuleConfiguration from "./ruleConfiguration.vue"
import ProjectModule from "./listings/projectModule.vue"
import AdvertisingGroupModule from "./adGroup/advertisingGroupModule.vue"
import CreativeMaterialsGroupModule from "./creativeMatGroup/creativeMaterialsGroupModule.vue"
import TitlePackageModule from "./titlePackage/titlePackageModule.vue"
import PreviewArea from "./previewTable/previewArea.vue"


</script>

<template>
  <Page auto-content-height>
    <div class="vivo">
      <Card>
        <h2 class="text">配置区</h2>
        <div class="configTop">
          <div>
            <ConfigurationArea/>
          </div>
          <div>
            <RuleConfiguration/>
          </div>
        </div>
        <Row :gutter="16">
          <Col :span="6">
            <ProjectModule/>
          </Col>
          <Col :span="6">
            <AdvertisingGroupModule/>
          </Col>
          <Col :span="6">
            <CreativeMaterialsGroupModule/>
          </Col>
          <Col :span="6">
            <TitlePackageModule/>
          </Col>
        </Row>
        <div class="generateButton">
          <Button type="primary">生成广告预览</Button>
        </div>
        <Card>
          <h2 class="text">预览区</h2>
          <PreviewArea></PreviewArea>
        </Card>
      </Card>
    </div>
  </Page>
</template>

<style scoped lang="scss">
.vivo{
  height: 100%;

  .text{
    font-size: 16px;
    font-weight: 600;
  }

  .configTop{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .generateButton{
    display: flex;
    justify-content: end;
    margin: 20px 0;
  }
}
</style>
