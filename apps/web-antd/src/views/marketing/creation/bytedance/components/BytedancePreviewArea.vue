<script setup lang="ts" name="BytedancePreviewArea">
// 巨量引擎广告预览数据

import { computed } from "vue";
import type { BytedanceCreationData } from "#/views/marketing/creation/bytedance/bytedance";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import type {
  PreviewColumn,
  AccountTabData,
  LevelNames,
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import PreviewArea from "#/views/marketing/creation/components/preview_area/PreviewArea.vue";
import { convertToPreviewData } from "#/views/marketing/creation/bytedance/convertToPreviewData";

const props = defineProps<{
  adList: Array<BytedanceCreationData>;
  accountInfo: AccountInfo[];
}>();

// 转换数据为预览区需要的格式
const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.adList, props.accountInfo);
});

// 巨量引擎的层级名称配置（项目 → 广告，无广告组）
const levelNames: LevelNames = {
  campaign: { show: true, labelName: "项目" },
  adgroup: { show: true, labelName: "广告" },
  promotion: { show: false, labelName: "广告" },
};

// 定义表格列配置
const tableColumns: PreviewColumn[] = [
  {
    title: "项目信息",
    children: [
      { field: "campaignName", title: "项目名称", minWidth: 200 },
      { field: "marketingGoal", title: "营销目标", minWidth: 120 },
      { field: "landingType", title: "推广目的", minWidth: 120 },
      { field: "deliveryMode", title: "投放模式", minWidth: 100 },
      { field: "campaignBudget", title: "项目预算", minWidth: 100 },
      { field: "campaignBid", title: "项目出价", minWidth: 100 },
      { field: "campaignBudgetMode", title: "预算模式", minWidth: 100 },
      { field: "campaignPricing", title: "计费方式", minWidth: 100 },
      { field: "campaignStatus", title: "状态", minWidth: 80 },
    ],
  },
  {
    title: "广告信息",
    children: [
      { field: "promotionName", title: "广告名称", minWidth: 200 },
      { field: "promotionBudget", title: "广告预算", minWidth: 100 },
      { field: "promotionBid", title: "广告出价", minWidth: 100 },
      { field: "promotionBudgetMode", title: "预算模式", minWidth: 100 },
      { field: "promotionStatus", title: "状态", minWidth: 80 },
    ],
  },
  {
    title: "素材信息",
    children: [
      { field: "displayMaterialInfo", title: "素材信息", minWidth: 160 },
      { field: "titleInfo", title: "标题", minWidth: 200 },
    ],
  },
];
</script>

<template>
  <div>
    <PreviewArea
      :key="adList.length"
      :table-columns="tableColumns"
      :table-data="previewData"
      :show-empty="adList.length === 0"
      :campaign-merge-fields="[
        'campaignName',
        'marketingGoal',
        'landingType',
        'deliveryMode',
        'campaignBudget',
        'campaignBid',
        'campaignBudgetMode',
        'campaignPricing',
        'campaignStatus',
      ]"
      :adgroup-merge-fields="[]"
      :level-names="levelNames"
    />
  </div>
</template>

<style scoped lang="scss"></style>
