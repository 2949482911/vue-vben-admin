<script setup lang="ts">
// oppo 广告列表页（媒体直达页）：计划/广告组/广告
import { useRouter } from "vue-router";
import { Page } from "@vben/common-ui";
import { Button, Card, TabPane, Tabs } from "ant-design-vue";
import PlatformLevelList from "../../components/platform_promotion/PlatformLevelList.vue";

const router = useRouter();

function openBatchCreate() {
  router.push({
    path: "/marketing/oppo/promotion/creation"
  });
}
</script>

<template>
  <Page content-class="p-5">
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <span>OPPO · 广告列表</span>
          <Button type="primary" @click="openBatchCreate">批量创建</Button>
        </div>
      </template>
      <Tabs type="card">
        <TabPane key="campaign" tab="计划">
          <PlatformLevelList platform="oppo" level="campaign" id-field="campaign_id" />
        </TabPane>
        <TabPane key="adgroup" tab="广告组">
          <PlatformLevelList platform="oppo" level="adgroup" id-field="adgroup_id" />
        </TabPane>
        <TabPane key="promotion" tab="广告" force-render>
          <PlatformLevelList platform="oppo" level="promotion" id-field="promotion_id" />
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>
