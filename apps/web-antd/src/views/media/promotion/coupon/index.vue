<script lang="ts" setup name="CouponManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {couponApi} from "#/api/media/";
import type {MediaItemItem} from "#/api/models/media/item";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.coupon.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
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
    {field: "platform", title: `${$t("media.coupon.columns.platform")}`, width: "auto"},
    {field: "platformCouponId", title: `${$t("media.coupon.columns.platformCouponId")}`, width: "auto"},
    {field: "name", title: `${$t("media.coupon.columns.name")}`, width: "auto"},
    {field: "validStartTime", title: `${$t("media.coupon.columns.validStartTime")}`, width: "auto"},
    {field: "validEndTime", title: `${$t("media.coupon.columns.validEndTime")}`, width: "auto"},
    {field: "fixedValidityTime", title: `${$t("media.coupon.columns.fixedValidityTime")}`, width: "auto"},
    {field: "receiveChannel", title: `${$t("media.coupon.columns.receiveChannel")}`, width: "auto"},
    {field: "reduceAmount", title: `${$t("media.coupon.columns.reduceAmount")}`, width: "auto"},
    {field: "receiveStartTime", title: `${$t("media.coupon.columns.receiveStartTime")}`, width: "auto"},
    {field: "receiveEndTime", title: `${$t("media.coupon.columns.receiveEndTime")}`, width: "auto"},
    {field: "threshold", title: `${$t("media.coupon.columns.threshold")}`, width: "auto"},
    {field: "couponTargetType", title: `${$t("media.coupon.columns.couponTargetType")}`, width: "auto"},
    {field: "validityType", title: `${$t("media.coupon.columns.validityType")}`, width: "auto"},
    {field: "totalStock", title: `${$t("media.coupon.columns.totalStock")}`, width: "auto"},
    {field: "receivePerLimit", title: `${$t("media.coupon.columns.receivePerLimit")}`, width: "auto"},
    {field: "mediaStatus", title: `${$t("media.coupon.columns.mediaStatus")}`, width: "auto"},
    {field: "couponCirculation", title: `${$t("media.coupon.columns.couponCirculation")}`, width: "auto"},
    {field: "couponReceiveNum", title: `${$t("media.coupon.columns.couponReceiveNum")}`, width: "auto"},
    {field: "usedCouponOrderPayAmt", title: `${$t("media.coupon.columns.usedCouponOrderPayAmt")}`, width: "auto"},
    {field: "couponReceiveUserCnt", title: `${$t("media.coupon.columns.couponReceiveUserCnt")}`, width: "auto"},
    {field: "couponUsedNum", title: `${$t("media.coupon.columns.couponUsedNum")}`, width: "auto"},
    {field: "couponUsedUserCnt", title: `${$t("media.coupon.columns.couponUsedUserCnt")}`, width: "auto"},
    {field: "usedCouponAmt", title: `${$t("media.coupon.columns.usedCouponAmt")}`, width: "auto"},
    {field: "usedCouponOrderRealPayAmt", title: `${$t("media.coupon.columns.usedCouponOrderRealPayAmt")}`, width: "auto"},
    ...TABLE_COMMON_COLUMNS
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
        return await couponApi.fetchCouponList({
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
