<script setup lang="ts" name="TencentPreviewArea">
// 腾讯广告预览数据

import { computed } from "vue";
import type { TencentCreationData } from "#/views/marketing/creation/tencent/tencent";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import type {
  PreviewColumn,
  AccountTabData,
  LevelNames
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import PreviewArea from "#/views/marketing/creation/components/preview_area/PreviewArea.vue";
import { convertToPreviewData } from "#/views/marketing/creation/tencent/convertToPreviewData";


const props = defineProps<{
  adList: Array<TencentCreationData>;
  accountInfo: AccountInfo[];
}>();

// 转换数据为预览区需要的格式
const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.adList, props.accountInfo);
});

// 腾讯的层级名称配置（使用对象结构）
const levelNames: LevelNames = {
  campaign: { show: true, labelName: "营销单元" },
  adgroup: { show: true, labelName: "动态创意" },
  promotion: { show: false, labelName: "广告" }  // 腾讯没有广告层级，不显示
};

// 定义表格列配置
const tableColumns: PreviewColumn[] = [
  {
    title: "计划信息",
    children: [
      { field: "campaignName", title: "计划名称", minWidth: 200 },
      { field: "marketingGoal", title: "营销目标", minWidth: 120 },
      { field: "marketingSubGoal", title: "二级目标", minWidth: 120 },
      { field: "beginDate", title: "开始日期", minWidth: 100 },
      { field: "endDate", title: "结束日期", minWidth: 100 },
      { field: "dailyBudget", title: "日预算", minWidth: 100 },
      { field: "bidAmount", title: "出价", minWidth: 100 },
      { field: "optimizationGoal", title: "优化目标", minWidth: 120 },
      { field: "configuredStatus", title: "状态", minWidth: 80 }
    ]
  },
  {
    title: "广告组信息",
    children: [
      { field: "adgroupName", title: "广告组名称", minWidth: 200 },
      { field: "creativeTemplateId", title: "创意模板", minWidth: 120 },
      { field: "deliveryMode", title: "投放模式", minWidth: 100 },
      { field: "dynamicCreativeType", title: "动态创意类型", minWidth: 120 },
      { field: "impressionTrackingUrl", title: "曝光监测链接", minWidth: 200 },
      { field: "clickTrackingUrl", title: "点击监测链接", minWidth: 200 }
    ]
  },
  {
    title: "创意组件",
    children: [
      { field: "imageInfo", title: "图片", minWidth: 150 },
      { field: "videoInfo", title: "视频", minWidth: 150 },
      { field: "titleInfo", title: "标题", minWidth: 150 }
    ]
  }
];

</script>

<template>
<div>
  <PreviewArea
    :table-columns="tableColumns"
    :table-data="previewData"
    :show-empty="adList.length === 0"
    :campaign-merge-fields="['campaignName']"
    :adgroup-merge-fields="['adgroupName']"
    :level-names="levelNames"
  ></PreviewArea>
</div>
</template>

<style scoped lang="scss">

</style>
