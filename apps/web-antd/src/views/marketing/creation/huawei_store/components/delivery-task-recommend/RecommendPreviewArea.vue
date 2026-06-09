<script setup lang="ts" name="RecommendPreviewArea">
// 推荐广告的预览区数据
import type {
  PreviewColumn
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import type { HuaWeiStoreCreationData } from "#/views/marketing/creation/huawei_store/huawei_store";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import PreviewArea from "#/views/marketing/creation/components/preview_area/PreviewArea.vue";
import { convertToPreviewData } from "#/views/marketing/creation/huawei_store/convertToPreviewData";


const props = defineProps<{
  adList: HuaWeiStoreCreationData[];
  accountInfo: AccountInfo[];
}>();


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
      :table-data="convertToPreviewData(props.adList, props.accountInfo)"
      :table-columns="tableColumns"
      :campaign-merge-fields="['taskName', 'budget']"
      :adgroup-merge-fields="['subTaskName']"
    ></PreviewArea>
  </div>
</template>

<style scoped lang="scss">

</style>
