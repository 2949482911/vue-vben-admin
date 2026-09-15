<script setup lang="ts">
// vivo 2.0 广告管理页（媒体直达页）：计划 / 广告 两级
// 新版 Marketing-API 只有「计划(ad/plan) / 广告」两级，无独立广告组层级
// 页头与层级页签由 AdManagementShell 提供，列表能力复用 PlatformLevelList
// 枚举码值文案见 ../enums.ts（来源：https://open-ad.vivo.com.cn/doc?id=171）
import { ref } from 'vue';

import AdManagementShell from '../../components/platform_promotion/AdManagementShell.vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';
import { VIVO_V2_ADGROUP_ENUMS, VIVO_V2_CAMPAIGN_ENUMS } from '../enums';

const LEVEL_TABS: Array<{ key: string; label: string }> = [
  { key: 'campaign', label: '计划' },
  { key: 'adgroup', label: '广告' },
];

const campaignRef = ref<InstanceType<typeof PlatformLevelList>>();
const adgroupRef = ref<InstanceType<typeof PlatformLevelList>>();

const levelRefs: Record<string, any> = {
  campaign: campaignRef,
  adgroup: adgroupRef,
};

/** 页签切换后刷新当前层级列表（隐藏状态下挂载的表格需要重新布局查询） */
function handleLevelChange(key: string) {
  levelRefs[key]?.value?.pageReload();
}
</script>

<template>
  <AdManagementShell
    platform-label="vivo 2.0"
    description="按计划 / 广告层级查看数据，支持筛选与导出"
    create-path="/marketing/vivo_new/promotion/creation"
    :tabs="LEVEL_TABS"
    @change="handleLevelChange"
  >
    <template #campaign>
      <!-- 账户下拉复用 vivo 媒体账户：platform_advertiser 表暂无 vivo2.0 记录 -->
      <PlatformLevelList
        ref="campaignRef"
        platform="vivo2.0"
        advertiser-platform="vivo"
        level="campaign"
        id-field="campaign_id"
        :enums="VIVO_V2_CAMPAIGN_ENUMS"
      />
    </template>
    <template #adgroup>
      <PlatformLevelList
        ref="adgroupRef"
        platform="vivo2.0"
        advertiser-platform="vivo"
        level="adgroup"
        id-field="adgroup_id"
        :enums="VIVO_V2_ADGROUP_ENUMS"
      />
    </template>
  </AdManagementShell>
</template>
