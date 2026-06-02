<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Tabs, TabPane, Card } from 'ant-design-vue';
import { ref } from 'vue';
import Plan from './plan_Management/plan.vue';
import AdGroup from './adGroup_Management/adGroup.vue';
import Ad from './ad_Management/ad.vue';
const activeKey = ref<string>();
const planRef = ref();
const adGroupRef = ref();
const adRef = ref();

function switchTemplate(val: string | number) {
  if (val === 'plan') {
    planRef.value.plan_pageReload();
  } else if (val === 'adGroup') {
    adGroupRef.value.adGroup_pageReload();
  } else {
    adRef.value.ad_pageReload();
  }
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Card>
        <Tabs v-model:activeKey="activeKey" @change="switchTemplate">
          <TabPane key="plan" tab="计划">
            <Plan ref="planRef" />
          </TabPane>
          <TabPane key="adGroup" tab="广告组" force-render>
            <AdGroup ref="adGroupRef" />
          </TabPane>
          <TabPane key="ad" tab="广告" force-render>
            <Ad ref="adRef" />
          </TabPane>
        </Tabs>
      </Card>
    </Page>
  </div>
</template>

<style scoped lang="scss"></style>
