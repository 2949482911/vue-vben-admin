<script lang="ts" setup name="MediaOnlineretailersManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {BatchOptionsType, PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {developerApi} from '#/api/media';

import Create from './create.vue'
import type {CreateDeveloperRequest, DeveloperItem, UpdateDeveloperRequest} from "#/api/models/media/developer";
import {ConstantEnum} from "@vben/constants";

const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create,
  centered: true,
  modal: true,
});


function openBaseDrawer(row?: CreateDeveloperRequest | UpdateDeveloperRequest) {
  if (row) {
    createModalApi.setData(row);
  } else {
    createModalApi.setData({})
  }
  createModalApi.open();
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Input",
      fieldName: "appId",
      label: `${$t("media.developer.columns.appId")}`
    },
    {
      component: "Input",
      fieldName: "appName",
      label: `${$t("media.developer.columns.appName")}`
    },
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.developer.columns.platform")}`,
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


/**
 * update state
 * @param row
 */
async function handlerState(row: DeveloperItem) {
  if (row.status === ConstantEnum.COMMON_ENABLE) {
    await developerApi.fetchBatchOptions({
      type: BatchOptionsType.DISABLE,
      targetIds: [row.id]
    })
  } else {
    await developerApi.fetchBatchOptions({
      type: BatchOptionsType.Enable,
      targetIds: [row.id]
    })
  }
  pageReload();
}

const gridOptions: VxeGridProps<DeveloperItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    ...TABLE_COMMON_COLUMNS,
    {field: "platform", title: `${$t("media.developer.columns.platform")}`, width: "auto"},
    {field: "appName", title: `${$t("media.developer.columns.appName")}`, width: "auto"},
    {field: "appId", title: `${$t("media.developer.columns.appId")}`, width: "auto"},
    {field: "secret", title: `${$t("media.developer.columns.secret")}`, width: "auto"},
    {field: "remark", title: `${$t("media.developer.columns.remark")}`, width: "auto"},
    {
      field: "authorizedAccount",
      title: `${$t("media.developer.columns.authorizedAccount")}`,
      width: "auto"
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
        return await developerApi.fetchDeveloperList({
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
        <template #status="{ row }">
          <Switch :checked="row.status === ConstantEnum.COMMON_ENABLE" @change="handlerState(row)"/>
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openBaseDrawer(row)">{{ $t('common.edit') }}</Button>
          <!--          <Button type="link" @click="handlerDelete(row.id)">{{ $t('common.delete') }}</Button>-->
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
            {{ $t('common.create') }}
          </Button>
        </template>

      </Grid>
    </Page>
    <CreateModal @page-reload="pageReload"></CreateModal>
  </div>
</template>
