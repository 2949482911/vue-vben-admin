<script lang="ts" setup name="AddressManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {Button} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {logisticsApi, mediaAccountApi} from "#/api/media/";
import type {SellerAddressItem} from "#/api/models/media/logistics";

// 创建
import CreateAddress from "./create.vue"

const [CreateAddressModal, createModalApi] = useVbenModal({
  connectedComponent: CreateAddress,
  centered: true,
  modal: true,
});

function openModal(row?: SellerAddressItem) {
  if (row) {
    createModalApi.setData({
      id: row.id,
      platform: row.platform,
      accountId: row.accountId,
      provinceCode: row.mediaSellerAddressDetail.provinceCode,
      province: row.mediaSellerAddressDetail.province,
      cityCode: row.mediaSellerAddressDetail.cityCode,
      city: row.mediaSellerAddressDetail.city,
      districtCode: row.mediaSellerAddressDetail.districtCode,
      district: row.mediaSellerAddressDetail.district,
      address: row.mediaSellerAddressDetail.address,
      town: row.mediaSellerAddressDetail.town,
      townCode: row.mediaSellerAddressDetail.townCode,
      consignee: row.mediaSellerAddressDetail.consignee,
      mobile: row.mediaSellerAddressDetail.mobile,
      defaultAddress: row.defaultAddress,
      addressType: row.addressType,
    })
  }else {
    createModalApi.setData({})
  }
  createModalApi.open()
}


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
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        // 菜单接口转options格式
        afterFetch: (data: { name: string; id: string }[]) => {
          return data.map((item: any) => ({
            label: `${item.name}-${item.platform}`,
            value: item.id,
          }));
        },
        // 菜单接口
        api: async () => {
          const {items} = await mediaAccountApi.fetchAllMediaOnlineretailers()
          return items;
        },
      },
      // 字段名
      fieldName: 'localAccountId',
      // 界面显示的label
      label: `${$t("media.account.columns.platformAccountId")}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


const gridOptions: VxeGridProps<SellerAddressItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {field: "platform", title: `${$t("media.seller_address.columns.platform")}`, width: "auto"},
    {
      field: "addressStatus",
      title: `${$t("media.seller_address.columns.addressStatus")}`,
      width: "auto"
    },
    {
      field: "defaultAddress",
      title: `${$t("media.seller_address.columns.defaultAddress")}`,
      width: "auto"
    },
    {
      field: "addressType",
      title: `${$t("media.seller_address.columns.addressType")}`,
      width: "auto"
    },
    {field: "sourceType", title: `${$t("media.seller_address.columns.sourceType")}`, width: "auto"},
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
        return await logisticsApi.fetchSellerAddressList({
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
          <Button class="mr-2" type="primary" @click="openModal(null)">
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openModal(row)">{{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
        </template>
      </Grid>

    </Page>
    <CreateAddressModal @page-reload="pageReload"></CreateAddressModal>
  </div>
</template>
