<script setup lang="ts">
// vivo 广告列表页（媒体直达页）：计划 / 广告组 / 广告
// 页头与层级页签由 AdManagementShell 提供，列表能力复用 PlatformLevelList
import { ref } from 'vue';

import AdManagementShell from '../../components/platform_promotion/AdManagementShell.vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';

const LEVEL_TABS: Array<{ key: string; label: string }> = [
  { key: 'campaign', label: '计划' },
  { key: 'adgroup', label: '广告组' },
  { key: 'promotion', label: '广告' },
];

const campaignRef = ref<InstanceType<typeof PlatformLevelList>>();
const adgroupRef = ref<InstanceType<typeof PlatformLevelList>>();
const promotionRef = ref<InstanceType<typeof PlatformLevelList>>();

const levelRefs: Record<string, any> = {
  campaign: campaignRef,
  adgroup: adgroupRef,
  promotion: promotionRef,
};

/** 页签切换后刷新当前层级列表（隐藏状态下挂载的表格需要重新布局查询） */
function handleLevelChange(key: string) {
  levelRefs[key]?.value?.pageReload();
}
</script>

<template>
  <AdManagementShell
    platform-label="vivo"
    description="按计划 / 广告组 / 广告层级查看数据，支持批量操作与导出"
    create-path="/marketing/vivo/promotion/creation"
    :tabs="LEVEL_TABS"
    @change="handleLevelChange"
  >
    <template #campaign>
      <PlatformLevelList ref="campaignRef" platform="vivo" level="campaign" id-field="campaign_id" />
    </template>
    <template #adgroup>
      <PlatformLevelList ref="adgroupRef" platform="vivo" level="adgroup" id-field="adgroup_id" />
    </template>
    <template #promotion>
      <PlatformLevelList
        ref="promotionRef"
        platform="vivo"
        level="promotion"
        id-field="promotion_id"
      />
    </template>
  </AdManagementShell>
</template>
