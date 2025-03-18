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
import {ConstantEnum} from "@vben/constants";

const [AuthAccountModel, createAccountApi] = useVbenModal({
  connectedComponent: AuthAccount,
  centered: true,
  modal: true,
});

enum MediaAccountBatchOptionsEnum {
  //  停投启投
  PUT_STATUS = "put_status",
  //  取消授权
  CANCEL_AUTH = "cancel_auth",
}

/**
 * 账户授权状态
 */
function getAccountAuthType() {
  return [
    {color: 'success', label: $t('media.account.Effective'), value: ConstantEnum.COMMON_ENABLE},
    {color: 'error', label: $t('media.account.loseEffective'), value: ConstantEnum.COMMON_DISABLE},
  ];
}

/**
 *  停投启投
 * @param row
 */
async function putStatus(row: Array<MediaOnlineretailersItem>) {
  const targetIds: string[] = [];
  var values: Map<String, Number> = new Map();
  row.forEach(row => {
    targetIds.push(row.id)
    values.set(row.id, row.putStatus == ConstantEnum.COMMON_ENABLE ? ConstantEnum.COMMON_DISABLE : ConstantEnum.COMMON_ENABLE);
  })
  await mediaAccountApi.fetchMediaOnlineretailersBatchOptions({
    type: MediaAccountBatchOptionsEnum.PUT_STATUS,
    targetIds: targetIds,
    values: Object.fromEntries(values)
  })
  pageReload()
}


/**
 * 取消授权
 * @param row
 */
async function cancelStatus(row: Array<MediaOnlineretailersItem>) {
  const targetIds: string[] = [];
  const values: Map<String, Number> = new Map();
  row.forEach(row => {
    targetIds.push(row.id)
  })
  await mediaAccountApi.fetchMediaOnlineretailersBatchOptions({
    type: MediaAccountBatchOptionsEnum.CANCEL_AUTH,
    targetIds: targetIds,
    values: values
  })
  pageReload()
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
  keepSource: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {field: "platform", title: `${$t("media.account.columns.platform")}`, width: "auto"},
    {field: "name", title: `${$t("media.account.columns.name")}`, width: "auto"},
    {
      field: "sex",
      title: `${$t("media.account.columns.sex")}`,
      width: "auto",
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'success',
            label: $t('common.boy'),
            value: 1
          },
          {
            color: 'error',
            label: $t('common.girl'),
            value: 2
          }
        ]
      },
    },
    {field: "head", title: `${$t("media.account.columns.head")}`, width: "auto"},
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
    {field: "sellerId", title: `${$t("media.account.columns.sellerId")}`, width: "auto"},
    {field: "sellerName", title: `${$t("media.account.columns.sellerName")}`, width: "auto"},
    {field: "shopId", title: `${$t("media.account.columns.shopId")}`, width: "auto"},
    {field: "shopName", title: `${$t("media.account.columns.shopName")}`, width: "auto"},
    {field: "shopType", title: `${$t("media.account.columns.shopType")}`, width: "auto"},
    {
      field: "putStatus",
      title: `${$t("media.account.columns.putStatus")}`,
      width: "auto",
      cellRender: {name: 'CellTag', options: getAccountAuthType()},
    },
    {
      field: "authStatus",
      title: `${$t("media.account.columns.authStatus")}`,
      width: "auto",
      cellRender: {name: 'CellTag', options: getAccountAuthType()},
      align: 'center',
    },
    {field: "shopScore", title: `${$t("media.account.columns.shopScore")}`, width: "auto"},
    {field: "productScore", title: `${$t("media.account.columns.productScore")}`, width: "auto"},
    {
      field: "logisticsScore",
      title: `${$t("media.account.columns.logisticsScore")}`,
      width: "auto"
    },
    {field: "serviceScore", title: `${$t("media.account.columns.serviceScore")}`, width: "auto"},
    {
      field: "afterSalesServiceScore",
      title: `${$t("media.account.columns.afterSalesServiceScore")}`,
      width: "auto"
    },
    {
      field: "contentQualifyScore",
      title: `${$t("media.account.columns.contentQualifyScore")}`,
      width: "auto"
    },
    ...TABLE_COMMON_COLUMNS,
  ],
  pagerConfig: {
    enabled: true
  },
  rowConfig: {
    keyField: 'id',
  },
  sortConfig: {
    multiple: true
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: {code: 'query'},
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await mediaAccountApi.fetchMediaOnlineretailersList({
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
 * open auth model
 */
async function handlerAuthUrl() {
  createAccountApi.open()
}

</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @change="handlerState(row)"/>
        </template>

        <template #putStatus="{ row }">
          <Switch :checked="row.putStatus == 1"/>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="handlerAuthUrl">
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #action="{ row }">
          <Button type="link" v-if="row.putStatus === ConstantEnum.COMMON_ENABLE"
                  @click="putStatus([row])">{{ $t('media.account.putOff') }}
          </Button>
          <Button type="link" v-if="row.putStatus === ConstantEnum.COMMON_DISABLE"
                  @click="putStatus([row])">{{ $t('media.account.putOn') }}
          </Button>
          <Button type="link" v-show="row.authStatue === ConstantEnum.COMMON_ENABLE"
                  @click="cancelStatus([row])">{{ $t('media.account.cancelAuth') }}
          </Button>
        </template>

      </Grid>
    </Page>
    <AuthAccountModel></AuthAccountModel>
  </div>
</template>
