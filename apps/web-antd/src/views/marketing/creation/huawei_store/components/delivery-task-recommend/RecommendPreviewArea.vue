<script setup lang="ts" name="RecommendPreviewArea">
// 推荐广告的预览区数据
import { computed } from "vue";
import type {
  PreviewColumn,
  AccountTabData,
  LevelNames
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import type { HuaWeiStoreCreationData } from "#/views/marketing/creation/huawei_store/huawei_store";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import PreviewArea from "#/views/marketing/creation/components/preview_area/PreviewArea.vue";
import { convertToPreviewData } from "#/views/marketing/creation/huawei_store/convertToPreviewData";


const props = defineProps<{
  adList: HuaWeiStoreCreationData[];
  accountInfo: AccountInfo[];
}>();

// 转换数据为预览区需要的格式
const previewData = computed<AccountTabData[]>(() => {
  return convertToPreviewData(props.adList, props.accountInfo);
});

// 华为商店的层级名称配置（使用对象结构）
const levelNames: LevelNames = {
  campaign: { show: true, labelName: "任务" },
  adgroup: { show: true, labelName: "子任务" },
  promotion: { show: true, labelName: "广告" }  // 华为商店有广告层级，显示
};

const tableColumns: PreviewColumn[] = [
  {
    title: "任务",
    children: [
      { field: "taskName", title: "任务名称" },
      { field: "budget", title: "预算" }
    ]
  },
  {
    title: "子任务",
    children: [
      { field: "subTaskName", title: "子任务名称" },
      { field: "subTaskPrice", title: "出价" }
    ]
  },
  {
    title: "广告",
    children: [
      { field: "contentTitle", title: "广告标题" },
      { field: "slogan", title: "标语" },
      { field: "clickMonitorUrl", title: "点击监测" },
      { field: "viewMonitorUrl", title: "曝光监测" }
    ]
  },
  {
    "title": "提交状态",
  }
];

</script>

<template>
  <div>
    <PreviewArea
      :table-data="previewData"
      :table-columns="tableColumns"
      :show-empty="adList.length === 0"
      :campaign-merge-fields="['taskName', 'budget']"
      :adgroup-merge-fields="['subTaskName']"
      :level-names="levelNames"
    ></PreviewArea>
  </div>
</template>

<style scoped lang="scss">

</style>
