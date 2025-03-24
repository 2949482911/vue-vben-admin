<script lang="ts" setup name="ReturnOrdersManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {returnOrderApi} from "#/api/media/";
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
      fieldName: "platformSkuId",
      label: `${$t("media.return_order.columns.platformSkuId")}`
    },
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
    {field: "platform", title: `${$t("media.return_order.columns.platform")}`, width: "auto"},
    {
      field: "platformRefundId",
      title: `${$t("media.return_order.columns.platformRefundId")}`,
      width: "auto"
    },
    {
      field: "platformSkuId",
      title: `${$t("media.return_order.columns.platformSkuId")}`,
      width: "auto"
    },
    {field: "handlingWay", title: `${$t("media.return_order.columns.handlingWay")}`, width: "auto"},
    {
      field: "negotiateStatus",
      title: `${$t("media.return_order.columns.negotiateStatus")}`,
      width: "auto"
    },
    {field: "refundFee", title: `${$t("media.return_order.columns.refundFee")}`, width: "auto"},
    {
      field: "refundStatus",
      title: `${$t("media.return_order.columns.refundStatus")}`,
      width: "auto"
    },
    {field: "refundType", title: `${$t("media.return_order.columns.refundType")}`, width: "auto"},
    {field: "refundDesc", title: `${$t("media.return_order.columns.refundDesc")}`, width: "auto"},
    {field: "submitTime", title: `${$t("media.return_order.columns.submitTime")}`, width: "auto"},
    {field: "relItemId", title: `${$t("media.return_order.columns.relItemId")}`, width: "auto"},
    ...TABLE_COMMON_COLUMNS,
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
        return await returnOrderApi.fetchGetReturnOrderList({
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

        <template #toolbar-tools>
          <Button class="mr-2" type="primary">
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #status="{ row  }">
          <Switch :checked="row.status == 1" @change="handlerState(row)"/>
        </template>

        <template #skus="{ row }">
          <div>{{ row.skus.length }}</div>
        </template>

        <template #auditStatus="{ row }">
          <div>{{ row.auditStatus }}</div>
        </template>

        <template #action="{ row }">
          <Button type="link">{{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
          <Button type="link">{{ $t('common.info') }}</Button>
          <Button type="link">{{ $t('media.media_item.columns.stock_add') }}</Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
