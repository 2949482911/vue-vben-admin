<script setup lang="ts">
// 巨量引擎-智擎 广告列表页（媒体直达页）：仅“项目”层级（与实际批创层级一致）
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, Card, Tabs, TabPane } from 'ant-design-vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';

const router = useRouter();
function openBatchCreate() {
  router.push('/marketing/creation/bytedance_std');
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>巨量引擎-智擎 · 广告列表</span>
            <Button type="primary" @click="openBatchCreate">批量创建</Button>
          </div>
        </template>
        <Tabs type="card">
          <TabPane key="campaign" tab="项目">
            <PlatformLevelList
              platform="bytedance_std"
              level="campaign"
              id-field="campaign_id"
            />
          </TabPane>
        </Tabs>
      </Card>
    </Page>
  </div>
</template>
