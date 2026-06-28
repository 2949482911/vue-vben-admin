<script setup lang="ts" name="VivoPreviewArea">
import { computed } from 'vue';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type { AccountTabData } from '#/views/marketing/creation/components/preview_area/previewAreaData';
import PreviewArea from '#/views/marketing/creation/components/preview_area/PreviewArea.vue';
import { convertToPreviewData } from '#/views/marketing/creation/vivo/convertToPreviewData';

const props = defineProps<{
  tableData: any[];
  accountInfo: AccountInfo[];
}>();

// 转换数据为预览区需要的格式
const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.tableData, props.accountInfo);
});

// vivo的层级名称配置
const levelNames = {
  campaign: { show: true, labelName: '计划' },
  adgroup: { show: true, labelName: '广告组' },
  promotion: { show: true, labelName: '广告' }
};

// 定义表格列配置
const tableColumns = [
  {
    title: '计划信息',
    children: [
      { field: 'campaignName', title: '计划名称', minWidth: 200 },
      { field: 'campaignBudget', title: '计划预算', minWidth: 120 },
      { field: 'campaignMediaType', title: '媒体类型', minWidth: 120 },
      { field: 'campaignAdType', title: '推广目标', minWidth: 120 }
    ]
  },
  {
    title: '广告组信息',
    children: [
      { field: 'groupName', title: '广告组名称', minWidth: 200 },
      { field: 'groupOcpxPrice', title: '转化出价', minWidth: 120 },
      { field: 'groupDailyBudget', title: '日预算', minWidth: 120 }
    ]
  },
  {
    title: '广告信息',
    children: [
      { field: 'promoName', title: '广告名称', minWidth: 200 },
      { field: 'deepLink', title: 'deepLink链接', minWidth: 150 },
      { field: 'clickLink', title: '点击链接', minWidth: 150 },
      { field: 'exposureLink', title: '曝光链接', minWidth: 150 },
      { field: 'pageUrlName', title: '落地页', minWidth: 120 }
    ]
  },
  {
    title: '创意信息',
    children: [
      { field: 'displayCreativeTitle', title: '标题', minWidth: 150 },
      { field: 'displayCreativeSubTitle', title: '副标题', minWidth: 150 },
      { field: 'displayCreativePushTitle', title: '应用标题', minWidth: 150 }
    ]
  },
  {
    title: '提交状态',
    children: [
      { field: 'campaignState', title: '状态', minWidth: 100 },
      { field: 'errorMsg', title: '原因', minWidth: 150 }
    ]
  }
];
</script>

<template>
  <div>
    <PreviewArea
      :table-columns="tableColumns"
      :table-data="previewData"
      :campaign-merge-fields="['campaignName']"
      :adgroup-merge-fields="['groupName']"
      :level-names="levelNames"
    ></PreviewArea>
  </div>
</template>

<style scoped lang="scss"></style>