<script setup lang="ts" name="VivoV2PreviewArea">
import type { AccountTabData } from '#/views/marketing/creation/components/preview_area/previewAreaData';
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed } from 'vue';

import PreviewArea from '#/views/marketing/creation/components/preview_area/PreviewArea.vue';
import { convertToPreviewData } from '#/views/marketing/creation/vivo_v2/convertToPreviewData';

/**
 * vivo 2.0 预览区：计划 / 广告两级，无广告组层级
 */
const props = defineProps<{
  tableData: any[];
  accountInfo: AccountInfo[];
  /** 撑满父容器（批创工作台预览区） */
  fill?: boolean;
}>();

// 转换数据为预览区需要的格式
const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.tableData, props.accountInfo);
});

// vivo2.0 的层级名称配置：无广告组层级，隐藏其统计
const levelNames = {
  campaign: { show: true, labelName: '计划' },
  adgroup: { show: false, labelName: '广告组' },
  promotion: { show: true, labelName: '广告' },
};

// 定义表格列配置
const tableColumns = [
  {
    title: '计划信息',
    children: [
      { field: 'campaignName', title: '计划名称', minWidth: 200 },
      { field: 'campaignAdType', title: '推广目标', minWidth: 120 },
      { field: 'campaignChargeType', title: '出价方式', minWidth: 120 },
      { field: 'campaignPrice', title: '出价（元）', minWidth: 120 },
      { field: 'campaignBudget', title: '计划预算（元）', minWidth: 130 },
      { field: 'campaignSpentType', title: '投放类型', minWidth: 120 },
      { field: 'campaignDateRange', title: '投放日期', minWidth: 200 },
      { field: 'campaignScheduleTime', title: '投放时段', minWidth: 150 },
    ],
  },
  {
    title: '广告信息',
    children: [
      { field: 'promoName', title: '广告名称', minWidth: 200 },
      { field: 'promotionContent', title: '推广名称', minWidth: 150 },
      { field: 'deepLink', title: 'DeepLink', minWidth: 150 },
      { field: 'pageUrlName', title: '落地页', minWidth: 150 },
      { field: 'h5TypeName', title: 'h5详情页来源', minWidth: 140 },
      { field: 'avatarCode', title: '头像素材', minWidth: 140 },
      { field: 'imageCount', title: '图片素材数', minWidth: 110 },
      { field: 'videoCount', title: '视频素材数', minWidth: 110 },
      { field: 'adTitle', title: '标题', minWidth: 150 },
    ],
  },
  {
    title: '提交状态',
    children: [
      { field: 'campaignState', title: '状态', minWidth: 100 },
      { field: 'errorMsg', title: '原因', minWidth: 150 },
    ],
  },
];
</script>

<template>
  <div class="h-full">
    <PreviewArea
      fill
      :table-columns="tableColumns"
      :table-data="previewData"
      :show-empty="tableData.length === 0"
      :campaign-merge-fields="['campaignName']"
      :adgroup-merge-fields="[]"
      :level-names="levelNames"
    />
  </div>
</template>
