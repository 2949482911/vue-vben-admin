<script lang="ts" setup name="BrandManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformEnum, PlatformOptions} from "#/constants/locales";
import {itemApi} from "#/api/media/";
import type {
  MediaItemDetailRequest,
  MediaItemItem
} from "#/api/models/media/item";
import SelectPlatformPushItem from "./select-platform-push-item.vue"
import KuaiShouItemDetail from "./kuaishou/detail.vue";

const [SelectPlatformPushItemModel, selectPlatformPushItemModalApi] = useVbenModal({
  connectedComponent: SelectPlatformPushItem,
  centered: true,
  modal: true,
  fullscreen: false,
  fullscreenButton: true,
  showCollapseButton: true,
});

const [CreateKuaiShouItemDetailModal, createKuaiShouItemDetailModalApi] = useVbenModal({
  connectedComponent: KuaiShouItemDetail,
  centered: true,
  modal: true,
});


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
      },
      defaultValue: PlatformEnum.KUAISHOU
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
    {field: "platform", title: `${$t("media.media_item.columns.platform")}`, width: "auto"},
    {field: "title", title: `${$t("media.media_item.columns.title")}`, width: "auto"},
    {field: "shortTitle", title: `${$t("media.media_item.columns.shortTitle")}`, width: "auto"},
    {field: "imageUrls", title: `${$t("media.media_item.columns.imageUrls")}`, width: "auto"},
    {
      field: "purchaseLimit",
      title: `${$t("media.media_item.columns.purchaseLimit")}`,
      width: "auto"
    },
    {
      field: "platformCategoryName",
      title: `${$t("media.media_item.columns.platformCategoryName")}`,
      width: "auto"
    },
    {field: "itemRemark", title: `${$t("media.media_item.columns.itemRemark")}`, width: "auto"},
    {field: "auditStatus", title: `${$t("media.media_item.columns.auditStatus")}`, width: "auto"},
    {field: "sellingPoint", title: `${$t("media.media_item.columns.sellingPoint")}`, width: "auto"},
    {field: "stock", title: `${$t("media.media_item.columns.stock")}`, width: "auto"},
    {field: "skuCount", title: `${$t("media.media_item.columns.skuCount")}`, width: "auto"},
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
      width: 256,
    },
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

// detail model
function openPlatformItemDetail(row: MediaItemItem) {
  const data: MediaItemDetailRequest = {
    platform: row.platform,
    localAccountId: row.localAccountId,
    platformItemId: row.platformItemId
  }
  if (row.platform == PlatformEnum.KUAISHOU) {
    createKuaiShouItemDetailModalApi.setData(data)
    createKuaiShouItemDetailModalApi.open()
  }
}


</script>

<template>
  <div >
    <Page>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="selectPlatformPushItemModalApi.open()">
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #status="{ row  }">
          <Switch :checked="row.status == 1" @change="handlerState(row)"/>
        </template>


        <template #auditStatus="{ row }">
          <div>{{ row.auditStatus }}</div>
        </template>

        <template #action="{ row }">
          <Button type="link">{{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
          <Button type="link" @click="openPlatformItemDetail(row)">{{ $t('action.info') }}</Button>
        </template>
      </Grid>
    </Page>

    <SelectPlatformPushItemModel/>
    <CreateKuaiShouItemDetailModal/>
  </div>
</template>
