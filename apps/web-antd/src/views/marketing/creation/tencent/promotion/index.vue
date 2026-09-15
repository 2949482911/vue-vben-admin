<script setup lang="ts">
// 腾讯广告管理页（媒体直达页）：计划 / 动态创意 两级
// 腾讯无第三层级，后端 TencentPromotionManager 仅支持 campaign、adgroup 两个层级：
//   campaign -> tencent_campaign_state（营销单元，对应 https://developers.e.qq.com/v3.0/docs/api/adgroups/get）
//   adgroup  -> tencent_adgroup_state （动态创意，对应 https://developers.e.qq.com/v3.0/docs/api/dynamic_creatives/get）
// 页头与层级页签由 AdManagementShell 提供，列表能力复用 PlatformLevelList
// 枚举码值文案见 ../enums.ts（来源：https://developers.e.qq.com/v3.0/docs/enums）
import { ref } from 'vue';

import AdManagementShell from '../../components/platform_promotion/AdManagementShell.vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';
import { TENCENT_ADGROUP_ENUMS, TENCENT_CAMPAIGN_ENUMS } from '../enums';

const LEVEL_TABS: Array<{ key: string; label: string }> = [
  { key: 'campaign', label: '计划' },
  { key: 'adgroup', label: '动态创意' },
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
    platform-label="腾讯广告"
    description="按计划 / 动态创意层级查看数据，支持筛选与导出"
    create-path="/marketing/tencent/promotion/creation"
    :tabs="LEVEL_TABS"
    @change="handleLevelChange"
  >
    <template #campaign>
      <PlatformLevelList
        ref="campaignRef"
        platform="tencent"
        level="campaign"
        id-field="campaign_id"
        :enums="TENCENT_CAMPAIGN_ENUMS"
      />
    </template>
    <template #adgroup>
      <PlatformLevelList
        ref="adgroupRef"
        platform="tencent"
        level="adgroup"
        id-field="adgroup_id"
        :enums="TENCENT_ADGROUP_ENUMS"
      />
    </template>
  </AdManagementShell>
</template>
