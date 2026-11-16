<script setup lang="ts" name="UnitProjectPreviewArea">
/**
 * 全域批次预览区
 *
 * 单层结构：只展示项目信息表格。
 */
import type { UnitCreationData } from '../bytedance';

import type {
  AccountTabData,
  LevelNames,
  PreviewColumn,
} from '#/views/marketing/creation/components/preview_area/previewAreaData';
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed } from 'vue';

import PreviewArea from '#/views/marketing/creation/components/preview_area/PreviewArea.vue';

import { convertToPreviewData } from '../convertToPreviewData';

const props = defineProps<{
  accountInfo: AccountInfo[];
  adList: Array<UnitCreationData>;
  fill?: boolean;
}>();

const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.adList, props.accountInfo);
});

const levelNames: LevelNames = {
  adgroup: { labelName: '广告组', show: false },
  campaign: { labelName: '项目', show: true },
  promotion: { labelName: '广告', show: false },
};

const tableColumns: PreviewColumn[] = [
  {
    children: [
      { field: 'projectName', minWidth: 220, title: '项目名称' },
      { field: 'deliveryProduct', minWidth: 100, title: '营销产品' },
      { field: 'monetizationMode', minWidth: 120, title: '变现模式' },
      { field: 'budget', minWidth: 110, title: '预算' },
      { field: 'roiGoal', minWidth: 90, title: 'ROI系数' },
      { field: 'scheduleType', minWidth: 140, title: '投放时间' },
    ],
    title: '项目信息',
  },
  {
    children: [
      { field: 'materialInfo', minWidth: 160, title: '素材信息' },
      { field: 'titleInfo', minWidth: 200, title: '标题' },
    ],
    title: '素材信息',
  },
];
</script>

<template>
  <div class="h-full">
    <PreviewArea
      :key="adList.length"
      fill
      :adgroup-merge-fields="[]"
      :level-names="levelNames"
      :show-empty="adList.length === 0"
      :table-columns="tableColumns"
      :table-data="previewData"
    />
  </div>
</template>
