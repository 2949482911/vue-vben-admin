<script setup lang="ts">
// vivo 广告列表页（媒体直达页）：计划/广告组/广告
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, Card, Tabs, TabPane } from 'ant-design-vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';

const router = useRouter();
function openBatchCreate() {
  router.push('/marketing/creation/vivo');
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>vivo · 广告列表</span>
            <Button type="primary" @click="openBatchCreate">批量创建</Button>
          </div>
        </template>
        <Tabs type="card">
          <TabPane key="campaign" tab="计划">
            <PlatformLevelList platform="vivo" level="campaign" id-field="campaign_id" />
          </TabPane>
          <TabPane key="adgroup" tab="广告组">
            <PlatformLevelList platform="vivo" level="adgroup" id-field="adgroup_id" />
          </TabPane>
          <TabPane key="promotion" tab="广告" force-render>
            <PlatformLevelList platform="vivo" level="promotion" id-field="promotion_id" />
          </TabPane>
        </Tabs>
      </Card>
    </Page>
  </div>
</template>
