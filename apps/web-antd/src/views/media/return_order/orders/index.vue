<script lang="ts" setup name="ReturnOrdersManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps, useVbenModal} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformEnum, PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {returnOrderApi} from "#/api/media/";
import type {MediaItemItem} from "#/api/models/media/item";
import {
  getHandlerType,
  getNegotiateStatus,
  getPlatformTag,
  getReturnStatus,
  getReturnType
} from "#/constants";
import BilibiliReturnOrderDetail from "./detail/bilibili.vue";
import type {MediaReturnOrderDetailRequest} from "#/api/models/media/return_order";

const [CreateBilibiliReturnOrderDetailModel, createBilibiliReturnOrderDetailModel] = useVbenModal({
  connectedComponent: BilibiliReturnOrderDetail,
  centered: true,
  modal: true,
})


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
    {
      field: "platform",
      title: `${$t("media.return_order.columns.platform")}`,
      width: "auto",
      slots: {default: 'platform'}
    },
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
    {
      field: "handlingWay",
      title: `${$t("media.return_order.columns.handlingWay")}`,
      width: "auto",
      slots: {default: 'handlingWay'}
    },
    {
      field: "negotiateStatus",
      title: `${$t("media.return_order.columns.negotiateStatus")}`,
      width: "auto",
      slots: {default: 'negotiateStatus'}
    },
    {field: "refundFee", title: `${$t("media.return_order.columns.refundFee")}`, width: "auto"},
    {
      field: "returnStatus",
      title: `${$t("media.return_order.columns.returnStatus")}`,
      width: "auto",
      slots: {default: 'returnStatus'}
    },
    {
      field: "refundType",
      title: `${$t("media.return_order.columns.refundType")}`,
      width: "auto",
      slots: {default: 'refundType'}
    },
    {field: "refundDesc", title: `${$t("media.return_order.columns.refundDesc")}`, width: "auto"},
    {
      field: "submitTime",
      title: `${$t("media.return_order.columns.submitTime")}`,
      formatter: 'formatDateTime',
      width: "auto"
    },
    {field: "relItemId", title: `${$t("media.return_order.columns.relItemId")}`, width: "auto"},
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      title: `${$t('core.columns.createTime')}`,
      width: 'auto',
    },
    {
      field: 'updateTime',
      formatter: 'formatDateTime',
      title: `${$t('core.columns.updateTime')}`,
      width: 'auto',
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      slots: {default: 'action'},
      fixed: 'right',
      width: 'auto'
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

/**
 * open return order detail
 */
function openReturnOrderDetail(platform: string, platformRefundId: string, localAccountId: string) {

  const data: MediaReturnOrderDetailRequest = {
    platform,
    localAccountId,
    platformRefundId,
  }

  if (platform === PlatformEnum.Bilibili) {
    createBilibiliReturnOrderDetailModel.setData(data);
    createBilibiliReturnOrderDetailModel.open();
  }
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

        <template #returnStatus="{row}">
          <component :is="getReturnStatus(row.platform, row.returnStatus)"></component>
        </template>

        <template #negotiateStatus="{row}">
          <component :is="getNegotiateStatus(row.platform, row.negotiateStatus)"></component>
        </template>

        <template #handlingWay="{row}">
          <component :is="getHandlerType(row.platform, row.handlingWay)"></component>
        </template>

        <template #refundType="{row}">
          <component :is="getReturnType(row.platform, row.refundType)"></component>
        </template>

        <template #platform="{row}">
          <component :is="getPlatformTag(row.platform)"></component>
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
          <Button type="link"
                  @click="openReturnOrderDetail(row.platform, row.platformRefundId, row.localAccountId)">
            {{ $t('common.detail') }}
          </Button>
        </template>
      </Grid>
    </Page>


    <CreateBilibiliReturnOrderDetailModel />
  </div>
</template>
