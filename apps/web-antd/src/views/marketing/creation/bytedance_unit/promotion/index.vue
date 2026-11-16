<script setup lang="ts">
// 巨量引擎-全域 广告列表页（媒体直达页）：仅「项目」层级
// 账号复用智擎（bytedance_std）授权账户；批量更新/删除暂未开放，创建入口隐藏
import { ref } from 'vue';

import AdManagementShell from '../../components/platform_promotion/AdManagementShell.vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';

const LEVEL_TABS: Array<{ key: string; label: string }> = [
  { key: 'campaign', label: '项目' },
];

const campaignRef = ref<InstanceType<typeof PlatformLevelList>>();

const levelRefs: Record<string, any> = { campaign: campaignRef };

function handleLevelChange(key: string) {
  levelRefs[key]?.value?.pageReload();
}
</script>

<template>
  <AdManagementShell
    platform-label="巨量引擎-全域"
    description="按项目层级查看全域广告数据，支持详情与导出"
    create-path="/marketing/bytedance_unit/creation"
    :tabs="LEVEL_TABS"
    @change="handleLevelChange"
  >
    <template #campaign>
      <PlatformLevelList
        ref="campaignRef"
        platform="bytedance_unit"
        level="campaign"
        id-field="campaign_id"
        advertiser-platform="bytedance_std"
        :pinned-fields="[
          'platform_account_id',
          'campaign_name',
          'campaign_id',
        ]"
        :operation-keys="[]"
      />
    </template>
  </AdManagementShell>
</template>
