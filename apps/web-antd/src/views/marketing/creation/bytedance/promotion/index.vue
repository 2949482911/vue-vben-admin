<script setup lang="ts">
// 巨量引擎 广告列表页（媒体直达页）
// 展示顺序：广告列表 ->【批量创建】新标签进入批创页
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, Card, Tabs, TabPane } from 'ant-design-vue';
import BytedanceLevelList from './components/BytedanceLevelList.vue';

const router = useRouter();

// 新开 Vben 内置标签跳转到批创页（独立隐藏路由 /marketing/creation/bytedance/create）
function openBatchCreate() {
  router.push('/marketing/creation/bytedance');
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>巨量引擎 · 广告列表</span>
            <Button type="primary" @click="openBatchCreate">批量创建</Button>
          </div>
        </template>
        <Tabs type="card">
          <TabPane key="campaign" tab="项目">
            <BytedanceLevelList level="campaign" />
          </TabPane>
          <TabPane key="adgroup" tab="广告" force-render>
            <BytedanceLevelList level="adgroup" />
          </TabPane>
        </Tabs>
      </Card>
    </Page>
  </div>
</template>

<style scoped></style>
