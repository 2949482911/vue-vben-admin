<script setup lang="ts" name="OppoPreviewArea">
import { computed } from "vue";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import type { OppoCreationData } from "#/views/marketing/creation/oppo/Oppo.types";
import type {
  AccountTabData,
  LevelNames,
  PreviewColumn
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import PreviewArea from "#/views/marketing/creation/components/preview_area/PreviewArea.vue";
import { convertToPreviewData } from "#/views/marketing/creation/oppo/convertToPreviewData";

const props = defineProps<{
  adList: OppoCreationData[];
  accountInfo: AccountInfo[];
}>();

// 转换数据为预览区需要的格式
const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.adList, props.accountInfo)
});

// OPPO 的层级名称配置
const levelNames: LevelNames = {
  campaign: { show: true, labelName: '计划' },
  adgroup: { show: true, labelName: '广告组' },
  promotion: { show: true, labelName: '广告' },
};

// 定义表格列配置（四级：计划 / 广告组 / 广告 / 创意）
const tableColumns: PreviewColumn[] = [
  {
    title: '计划信息',
    children: [
      { field: 'campaignName', title: '计划名称', minWidth: 180 },
      { field: 'campaignAdType', title: '推广目标', width: 100 },
      { field: 'campaignBudget', title: '计划日预算', width: 110 },
    ],
  },
  {
    title: '广告组信息',
    children: [
      { field: 'adgroupName', title: '广告组名称', minWidth: 180 },
      { field: 'groupPrice', title: '基础出价(分)', width: 120 },
      { field: 'groupOcpxPrice', title: '转化出价(分)', width: 120 },
      { field: 'groupStartDate', title: '开始时间', width: 120 },
      { field: 'groupEndDate', title: '结束时间', width: 120 },
    ],
  },
  {
    title: '广告信息',
    children: [
      { field: 'promotionName', title: '广告名称', minWidth: 180 },
      { field: 'clickMonitorUrl', title: '点击监测', minWidth: 150 },
      { field: 'viewMonitorUrl', title: '曝光监测', minWidth: 150 },
      { field: 'pageUrlName', title: '落地页', width: 120 },
    ],
  },
  {
    title: '创意信息',
    children: [
      { field: 'creativeTitle', title: '创意标题', minWidth: 160 },
      { field: 'creativeAppName', title: '应用名称', width: 120 },
      { field: 'displayMaterialInfo', title: '素材信息', minWidth: 160 },
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
      :campaign-merge-fields="['campaignName', 'campaignAdType', 'campaignMediaType', 'campaignBudget']"
      :adgroup-merge-fields="['adgroupName', 'groupPrice', 'groupOcpxPrice', 'groupStartDate', 'groupEndDate']"
      :level-names="levelNames"
    />
  </div>
</template>

<style scoped lang="scss"></style>
