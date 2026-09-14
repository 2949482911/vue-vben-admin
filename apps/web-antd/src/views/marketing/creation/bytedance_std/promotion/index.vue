<script setup lang="ts">
// 巨量引擎-智擎 广告列表页（媒体直达页）：仅「项目」层级（与实际批创层级一致）
// 页头与层级页签由 AdManagementShell 提供，列表能力复用 PlatformLevelList
import { ref } from 'vue';

import AdManagementShell from '../../components/platform_promotion/AdManagementShell.vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';

const LEVEL_TABS: Array<{ key: string; label: string }> = [{ key: 'campaign', label: '项目' }];

const campaignRef = ref<InstanceType<typeof PlatformLevelList>>();

const levelRefs: Record<string, any> = { campaign: campaignRef };

// 智擎与巨量引擎同接口：项目层批量支持 启停/预算/ROI/删除
const STD_PROJECT_OPERATION_KEYS = [
  'update_project_status',
  'update_project_budget',
  'update_project_roi',
  'delete_campaign',
];

/** 页签切换后刷新当前层级列表（隐藏状态下挂载的表格需要重新布局查询） */
function handleLevelChange(key: string) {
  levelRefs[key]?.value?.pageReload();
}
</script>

<template>
  <AdManagementShell
    platform-label="巨量引擎-智擎"
    description="按项目层级查看数据，支持批量操作与导出"
    create-path="/marketing/bytedance_std/promotion/creation"
    :tabs="LEVEL_TABS"
    @change="handleLevelChange"
  >
    <template #campaign>
      <PlatformLevelList
        ref="campaignRef"
        platform="bytedance_std"
        level="campaign"
        id-field="campaign_id"
        :operation-keys="STD_PROJECT_OPERATION_KEYS"
      />
    </template>
  </AdManagementShell>
</template>
