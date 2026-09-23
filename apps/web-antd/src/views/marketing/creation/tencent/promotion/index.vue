<script setup lang="ts">
// 腾讯广告管理页（媒体直达页）：营销单元 / 动态创意 两级
// 层级命名与批投模块一致：campaign=营销单元（媒体侧 adgroup）、adgroup=动态创意（媒体侧 dynamic_creative）：
//   campaign -> tencent_campaign_state（营销单元，对应 https://developers.e.qq.com/v3.0/docs/api/adgroups/get）
//   adgroup  -> tencent_adgroup_state （动态创意，对应 https://developers.e.qq.com/v3.0/docs/api/dynamic_creatives/get）
// 页头与层级页签由 AdManagementShell 提供，列表能力复用 PlatformLevelList
// 枚举码值文案见 ../enums.ts（来源：https://developers.e.qq.com/v3.0/docs/enums）
// 批量操作：营销单元的操作挂在 campaign 层（批量接口 level 仍为 adgroup，ID 取 campaignId），
//   创意删除挂在 adgroup 层（创意ID 取 source_dynamic_creative_id）；
//   操作矩阵见 ../../promotion_manager/platformOptions
import { ref } from 'vue';

import AdManagementShell from '../../components/platform_promotion/AdManagementShell.vue';
import PlatformLevelList from '../../components/platform_promotion/PlatformLevelList.vue';
import { getBatchOperations } from '../../promotion_manager/platformOptions';
import { TENCENT_ADGROUP_ENUMS, TENCENT_CAMPAIGN_ENUMS } from '../enums';

const LEVEL_TABS: Array<{ key: string; label: string }> = [
  { key: 'campaign', label: '营销单元' },
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
    description="按营销单元 / 动态创意层级查看数据，支持筛选、批量操作与导出"
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
        :operation-keys="getBatchOperations('tencent', 'campaign')"
      />
    </template>
    <template #adgroup>
      <PlatformLevelList
        ref="adgroupRef"
        platform="tencent"
        level="adgroup"
        id-field="adgroup_id"
        :enums="TENCENT_ADGROUP_ENUMS"
        :operation-keys="getBatchOperations('tencent', 'adgroup')"
      />
    </template>
  </AdManagementShell>
</template>
