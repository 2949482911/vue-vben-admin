<script lang="ts" setup name="MediaOnlineretailersManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {mediaAccountApi} from "#/api/media/account";
import type {MediaOnlineretailersItem} from "#/api/models/media/account";
import AuthAccount from "./auth.vue"

const [AuthAccountModel, createAccountApi] = useVbenModal({
  connectedComponent: AuthAccount,
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
      label: `${$t("media.developer.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
    },
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("media.account.columns.name")}`
    },
    {
      component: "Input",
      fieldName: "sellerId",
      label: `${$t("media.account.columns.sellerId")}`
    },
    {
      component: "Input",
      fieldName: "sellerName",
      label: `${$t("media.account.columns.sellerName")}`
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


async function handlerState(row: MediaOnlineretailersItem) {
  pageReload();
}

const gridOptions: VxeGridProps<MediaOnlineretailersItem> = {
  border: true,
  columns: [
    { title: "序号", type: "seq", width: 50, type: "checkbox", width: 100 },
    ...TABLE_COMMON_COLUMNS,
    { field: "platform", title: `${$t("media.account.columns.platform")}`, width: "auto" },
    { field: "name", title: `${$t("media.account.columns.name")}`, width: "auto" },
    { field: "sex", title: `${$t("media.account.columns.sex")}`, width: "auto" },
    { field: "head", title: `${$t("media.account.columns.head")}`, width: "auto" },
    {
      field: "highDefinitionHead",
      title: `${$t("media.account.columns.highDefinitionHead")}`,
      width: "auto"
    },
    {
      field: "accessTokenExpires",
      title: `${$t("media.account.columns.accessTokenExpires")}`,
      width: "auto"
    },
    { field: "sellerId", title: `${$t("media.account.columns.sellerId")}`, width: "auto" },
    { field: "sellerName", title: `${$t("media.account.columns.sellerName")}`, width: "auto" },
    { field: "shopId", title: `${$t("media.account.columns.shopId")}`, width: "auto" },
    { field: "shopName", title: `${$t("media.account.columns.shopName")}`, width: "auto" },
    { field: "shopType", title: `${$t("media.account.columns.shopType")}`, width: "auto" },
    { field: "shopScore", title: `${$t("media.account.columns.shopScore")}`, width: "auto" },
    { field: "productScore", title: `${$t("media.account.columns.productScore")}`, width: "auto" },
    {
      field: "logisticsScore",
      title: `${$t("media.account.columns.logisticsScore")}`,
      width: "auto"
    },
    { field: "serviceScore", title: `${$t("media.account.columns.serviceScore")}`, width: "auto" },
    {
      field: "afterSalesServiceScore",
      title: `${$t("media.account.columns.afterSalesServiceScore")}`,
      width: "auto"
    },
    {
      field: "contentQualifyScore",
      title: `${$t("media.account.columns.contentQualifyScore")}`,
      width: "auto"
    }
  ],
  pagerConfig: {
    enabled: true
  },
  sortConfig: {
    multiple: true
  },
  proxyConfig: {
    ajax: {
      query: async (params) => {
        return await mediaAccountApi.fetchMediaOnlineretailersList({
          page: params.page.currentPage,
          pageSize: params.page.pageSize
        });
      }
    },
    autoLoad: true
  }
};


const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.query();
}


async function handlerAuthUrl() {
  createAccountApi.open()
}

</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @change="handlerState(row)" />
        </template>

        <template #action="{ row }">
          <!--        <Button type="link" @click="openCreateModal(row)">{{$t('common.edit')}}</Button>-->
          <!--        <Button type="link" @click="handlerDelete(row.id)">{{$t('common.delete')}}</Button>-->
        </template>

      </Grid>

    </Page>
    <AuthAccountModel></AuthAccountModel>
  </div>
</template>
