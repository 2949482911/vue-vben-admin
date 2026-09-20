<script setup lang="ts">
// 巨量引擎 广告列表页（媒体直达页）
// 页头与层级页签由 AdManagementShell 提供，列表能力复用 BytedanceLevelList
import { ref } from "vue";

import AdManagementShell from "../../components/platform_promotion/AdManagementShell.vue";
import BytedanceLevelList from "./components/BytedanceLevelList.vue";

const LEVEL_TABS: Array<{ key: string; label: string }> = [
  { key: "campaign", label: "项目" },
  { key: "adgroup", label: "广告" }
];

const campaignRef = ref<InstanceType<typeof BytedanceLevelList>>();
const adgroupRef = ref<InstanceType<typeof BytedanceLevelList>>();

/** 页签切换后刷新当前层级列表（隐藏状态下挂载的表格需要重新布局查询） */
function handleLevelChange(key: string) {
  const target = key === "campaign" ? campaignRef.value : adgroupRef.value;
  target?.pageReload();
}
</script>

<template>
  <AdManagementShell
    platform-label="巨量引擎"
    description="按项目 / 广告层级查看数据，支持批量操作与导出"
    create-path="/marketing/bytedance/promotion/creation"
    :tabs="LEVEL_TABS"
    @change="handleLevelChange"
  >
    <template #campaign>
      <BytedanceLevelList ref="campaignRef" level="campaign" />
    </template>
    <template #adgroup>
      <BytedanceLevelList ref="adgroupRef" level="adgroup" />
    </template>
  </AdManagementShell>
</template>
