<script lang="ts" setup name="ReturnOrdersManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {orderApi} from "#/api/media/";
import type {MediaItemItem} from "#/api/models/media/item";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.order.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
    },
    {
      component: "Input",
      fieldName: "platformOrderNo",
      label: `${$t("media.order.columns.platformOrderNo")}`
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
    {field: "platform", title: `${$t("media.order.columns.platform")}`, width: "auto"},
    {field: "platformOrderId", title: `${$t("media.order.columns.platformOrderId")}`, width: "auto"},
    {field: "platformOrderNo", title: `${$t("media.order.columns.platformOrderNo")}`, width: "auto"},
    {field: "payTime", title: `${$t("media.order.columns.payTime")}`, width: "auto"},
    {field: "buyerOpenId", title: `${$t("media.order.columns.buyerOpenId")}`, width: "auto"},
    {field: "buyerNickname", title: `${$t("media.order.columns.buyerNickname")}`, width: "auto"},
    {field: "expressFee", title: `${$t("media.order.columns.expressFee")}`, width: "auto"},
    {field: "discountFee", title: `${$t("media.order.columns.discountFee")}`, width: "auto"},
    {field: "orderStatus", title: `${$t("media.order.columns.orderStatus")}`, width: "auto"},
    {field: "orderType", title: `${$t("media.order.columns.orderType")}`, width: "auto"},
    {field: "orderLevel", title: `${$t("media.order.columns.orderLevel")}`, width: "auto"},
    {field: "sendTime", title: `${$t("media.order.columns.sendTime")}`, width: "auto"},
    {field: "refundTime", title: `${$t("media.order.columns.refundTime")}`, width: "auto"},
    {field: "finishTime", title: `${$t("media.order.columns.finishTime")}`, width: "auto"},
    {field: "orderCreateTime", title: `${$t("media.order.columns.orderCreateTime")}`, width: "auto"},
    {field: "orderUpdateTime", title: `${$t("media.order.columns.orderUpdateTime")}`, width: "auto"},
    {field: "buyerRemark", title: `${$t("media.order.columns.buyerRemark")}`, width: "auto"},
    {field: "payType", title: `${$t("media.order.columns.payType")}`, width: "auto"},
    {field: "remindShipmentSign", title: `${$t("media.order.columns.remindShipmentSign")}`, width: "auto"},
    {field: "cancelReason", title: `${$t("media.order.columns.cancelReason")}`, width: "auto"},
    {field: "orderAmount", title: `${$t("media.order.columns.orderAmount")}`, width: "auto"},
    {field: "payAmount", title: `${$t("media.order.columns.payAmount")}`, width: "auto"},
    {field: "postAmount", title: `${$t("media.order.columns.postAmount")}`, width: "auto"},
    {field: "modifyAmount", title: `${$t("media.order.columns.modifyAmount")}`, width: "auto"},
    {field: "promotionAmount", title: `${$t("media.order.columns.promotionAmount")}`, width: "auto"},

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
        return await orderApi.fetchOrderList({
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
