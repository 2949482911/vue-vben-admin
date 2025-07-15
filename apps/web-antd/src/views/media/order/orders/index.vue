<script lang="ts" setup name="ReturnOrdersManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {Button} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformEnum, PlatformOptions} from "#/constants/locales";
import {orderApi} from "#/api/media/";

// order info modal
import type {OrderDetailRequest, OrderItem} from "#/api/models";
import {getOrderStatusTag, getPayMethodTag, getPlatformTag, getOrderType} from "#/constants";
import BilibiliOrderDetail from "./bilibili/detail.vue";
import KuaiShouOrderDetail from "./kuaishou/detail.vue";
import RedNoteOrderDetail from "./rednote/detail.vue";

const [CreateKuaiShouOrderDetailModel, CreateKuaiShouOrderDetailModelApi] = useVbenModal({
  connectedComponent: KuaiShouOrderDetail,
  centered: true,
  modal: true,
})

const [CreateBilibiliOrderDetailModel, CreateBilibiliOrderDetailModelApi] = useVbenModal({
  connectedComponent: BilibiliOrderDetail,
  centered: true,
  modal: true,
})

const [CreateRedNoteOrderDetailModel, CreateRedNoteOrderDetailModelApi] = useVbenModal({
  connectedComponent: RedNoteOrderDetail,
  centered: true,
  modal: true,
})

function openOrderDetailModal(platform: string, orderId: string, localAccountId: string) {
  const orderDetailRequest: OrderDetailRequest = {
    platform: platform,
    platformOrderId: orderId,
    localAccountId: localAccountId
  }
  if (platform === PlatformEnum.Bilibili) {
    CreateBilibiliOrderDetailModelApi.setData(orderDetailRequest);
    CreateBilibiliOrderDetailModelApi.open();
  }
  if (platform === PlatformEnum.KUAISHOU) {
    CreateKuaiShouOrderDetailModelApi.setData(orderDetailRequest);
    CreateKuaiShouOrderDetailModelApi.open();
  }
  if (platform === PlatformEnum.RedNote) {
    CreateRedNoteOrderDetailModelApi.setData(orderDetailRequest);
    CreateRedNoteOrderDetailModelApi.open();
  }
}


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


async function handlerState(row: OrderItem) {
  pageReload();
}

const gridOptions: VxeGridProps<OrderItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {
      field: "platform",
      title: `${$t("media.order.columns.platform")}`,
      width: "auto",
      slots: {default: 'platform'}
    },
    {
      field: "platformOrderId",
      title: `${$t("media.order.columns.platformOrderId")}`,
      width: "auto",
    },
    {
      field: "platformOrderNo",
      title: `${$t("media.order.columns.platformOrderNo")}`,
      width: "auto"
    },
    {
      field: "payTime",
      title: `${$t("media.order.columns.payTime")}`,
      width: "auto",
      formatter: 'formatDateTime',
    },
    {field: "buyerOpenId", title: `${$t("media.order.columns.buyerOpenId")}`, width: "auto"},
    {field: "buyerNickname", title: `${$t("media.order.columns.buyerNickname")}`, width: "auto"},
    {field: "expressFee", title: `${$t("media.order.columns.expressFee")}`, width: "auto"},
    {field: "discountFee", title: `${$t("media.order.columns.discountFee")}`, width: "auto"},
    {
      field: "orderStatus",
      title: `${$t("media.order.columns.orderStatus")}`,
      width: "auto",
      slots: {default: 'orderStatus'}
    },
    {
      field: "orderType",
      title: `${$t("media.order.columns.orderType")}`,
      width: "auto",
      slots: {default: 'orderType'}
    },
    {field: "orderLevel", title: `${$t("media.order.columns.orderLevel")}`, width: "auto"},
    {
      field: "sendTime",
      title: `${$t("media.order.columns.sendTime")}`,
      width: "auto",
      formatter: 'formatDateTime',
    },
    {
      field: "refundTime",
      title: `${$t("media.order.columns.refundTime")}`,
      width: "auto",
      formatter: 'formatDateTime',
    },
    {
      field: "finishTime",
      title: `${$t("media.order.columns.finishTime")}`,
      width: "auto",
      formatter: 'formatDateTime',
    },
    {
      field: "orderCreateTime",
      title: `${$t("media.order.columns.orderCreateTime")}`,
      width: "auto"
    },
    {
      field: "orderUpdateTime",
      title: `${$t("media.order.columns.orderUpdateTime")}`,
      formatter: 'formatDateTime',
      width: "auto"
    },
    {field: "buyerRemark", title: `${$t("media.order.columns.buyerRemark")}`, width: "auto"},
    {
      field: "payType",
      title: `${$t("media.order.columns.payType")}`,
      width: "auto",
      slots: {default: 'payType'}
    },
    {
      field: "remindShipmentSign",
      title: `${$t("media.order.columns.remindShipmentSign")}`,
      width: "auto"
    },
    {field: "cancelReason", title: `${$t("media.order.columns.cancelReason")}`, width: "auto"},
    {field: "orderAmount", title: `${$t("media.order.columns.orderAmount")}`, width: "auto"},
    {field: "payAmount", title: `${$t("media.order.columns.payAmount")}`, width: "auto"},
    {field: "postAmount", title: `${$t("media.order.columns.postAmount")}`, width: "auto"},
    {field: "modifyAmount", title: `${$t("media.order.columns.modifyAmount")}`, width: "auto"},
    {
      field: "promotionAmount",
      title: `${$t("media.order.columns.promotionAmount")}`,
      width: "auto"
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
      width: 100,
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

        <template #platform="{row}">
          <component :is="getPlatformTag(row.platform)"></component>
        </template>

        <template #orderStatus="{ row  }">
          <component :is="getOrderStatusTag(row.platform, row.orderStatus)"></component>
        </template>

        <template #payType="{ row  }">
          <component :is="getPayMethodTag(row.platform, row.payType)"></component>
        </template>

        <template #skus="{ row }">
          <div>{{ row.skus.length }}</div>
        </template>

        <template #auditStatus="{ row }">
          <div>{{ row.auditStatus }}</div>
        </template>

        <template #orderType="{ row }">
          <component :is="getOrderType(row.platform, row.orderType)"></component>
        </template>

        <template #action="{ row }">
          <Button type="link"
                  @click="openOrderDetailModal(row.platform, row.platformOrderId, row.localAccountId)">
            {{ $t('action.info') }}
          </Button>
        </template>
      </Grid>
    </Page>

    <CreateBilibiliOrderDetailModel/>
    <CreateKuaiShouOrderDetailModel/>
    <CreateRedNoteOrderDetailModel />
  </div>
</template>
