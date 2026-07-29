<script setup lang="ts" name="StdProjectPreviewArea">
/**
 * 智擎版预览区
 *
 * 单层结构：只展示项目信息表格
 */
import { computed } from 'vue';
import type { StdCreationData } from '#/views/marketing/creation/bytedance_std/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type {
  PreviewColumn,
  AccountTabData,
  LevelNames,
} from '#/views/marketing/creation/components/preview_area/previewAreaData';
import PreviewArea from '#/views/marketing/creation/components/preview_area/PreviewArea.vue';
import { convertToPreviewData } from '#/views/marketing/creation/bytedance_std/convertToPreviewData';

const props = defineProps<{
  adList: Array<StdCreationData>;
  accountInfo: AccountInfo[];
}>();

const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.adList, props.accountInfo);
});

// 智擎版层级名称配置（仅项目层）
const levelNames: LevelNames = {
  campaign: { show: true, labelName: '项目' },
  adgroup: { show: false, labelName: '广告组' },
  promotion: { show: false, labelName: '广告' },
};

// 表格列配置
const tableColumns: PreviewColumn[] = [
  {
    title: '项目信息',
    children: [
      { field: 'projectName', title: '项目名称', minWidth: 200 },
      { field: 'marketingGoal', title: '营销场景', minWidth: 120 },
      { field: 'landingType', title: '营销目的', minWidth: 120 },
      { field: 'deliveryMode', title: '投放模式', minWidth: 100 },
      { field: 'productId', title: '商品ID', minWidth: 150 },
      { field: 'optimizeGoal', title: '优化目标', minWidth: 150 },
      { field: 'deepOptimizeGoal', title: '深度优化目标', minWidth: 150 },
      { field: 'roiGoal', title: 'ROI系数', minWidth: 100 },
      { field: 'projectBudget', title: '项目预算', minWidth: 100 },
      { field: 'projectBid', title: '项目出价', minWidth: 100 },
      { field: 'projectBudgetMode', title: '预算模式', minWidth: 100 },
      { field: 'projectPricing', title: '计费方式', minWidth: 100 },
      { field: 'projectStatus', title: '状态', minWidth: 80 },
    ],
  },
  {
    title: '素材信息',
    children: [
      { field: 'displayMaterialInfo', title: '素材信息', minWidth: 160 },
      { field: 'titleInfo', title: '标题', minWidth: 200 },
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
        'projectName',
        'marketingGoal',
        'landingType',
        'deliveryMode',
        'productId',
        'optimizeGoal',
        'deepOptimizeGoal',
        'roiGoal',
        'projectBudget',
        'projectBid',
        'projectBudgetMode',
        'projectPricing',
        'projectStatus',
      ]"
      :adgroup-merge-fields="[]"
      :level-names="levelNames"
    />
  </div>
</template>

<style scoped lang="scss"></style>
