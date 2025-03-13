<script lang="ts" setup name="BrandManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {itemApi} from "#/api/media/";
import type {MediaItemItem} from "#/api/models/media/item";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.media_item.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
    },
    {
      component: "Input",
      fieldName: "title",
      label: `${$t("media.media_item.columns.title")}`
    },
    {
      component: "Input",
      fieldName: "shortTitle",
      label: `${$t("media.media_item.columns.shortTitle")}`
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


async function handlerState(row: MediaItemItem) {
  pageReload();
}

const gridOptions: VxeGridProps<MediaItemItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    ...TABLE_COMMON_COLUMNS,
    {field: "platform", title: `${$t("media.media_item.columns.platform")}`, width: "auto"},
    {field: "title", title: `${$t("media.media_item.columns.title")}`, width: "auto"},
    {field: "shortTitle", title: `${$t("media.media_item.columns.shortTitle")}`, width: "auto"},
    {field: "imageUrls", title: `${$t("media.media_item.columns.imageUrls")}`, width: "auto"},
    {field: "purchaseLimit", title: `${$t("media.media_item.columns.purchaseLimit")}`, width: "auto"},
    {field: "platformCategoryName", title: `${$t("media.media_item.columns.platformCategoryName")}`, width: "auto"},
    {field: "itemRemark", title: `${$t("media.media_item.columns.itemRemark")}`, width: "auto"},
    {field: "auditStatus", title: `${$t("media.media_item.columns.auditStatus")}`, width: "auto"},
    {field: "sellingPoint", title: `${$t("media.media_item.columns.sellingPoint")}`, width: "auto"},
    {field: "skus", title: `${$t("media.media_item.columns.skus")}`, width: "auto"},
  ],
  pagerConfig: {
    enabled: true
  },
  sortConfig: {
    multiple: true
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await itemApi.fetchGetItemList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      }
    },
    autoLoad: true
  }
};


const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.query();
}


</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row  }">
          <Switch :checked="row.status == 1" @change="handlerState(row)"/>
        </template>

        <template #skus="{ row }">
          <div>{{ row.skus.length}}</div>
        </template>

        <template #auditStatus="{ row }">
          <div>{{ row.auditStatus }}</div>
        </template>

        <template #action="{ row }">
          <Button type="link">{{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
          <Button type="link">{{ $t('common.info') }}</Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
