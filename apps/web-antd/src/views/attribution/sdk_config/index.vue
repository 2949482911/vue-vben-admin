<script lang="ts" setup name="SdkConfigIndex">
import { Page, useVbenDrawer, type VbenFormProps } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { SdkAppConfigItem } from "#/api/models/attribution";
import { $t } from "@vben/locales";

import { Button, Switch, Tag } from "ant-design-vue";
import { sdkConfigApi } from "#/api/core/attribution";
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from "#/constants/locales";

import CreateSdkConfig from "./create.vue";
import { trimObject } from "#/utils/trim";

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: CreateSdkConfig,
});

function openCreateDrawer(row?: SdkAppConfigItem) {
  if (row?.id) {
    createDrawerApi.setData(row);
  } else {
    createDrawerApi.setData({});
  }
  createDrawerApi.open();
}

/** 状态切换 */
async function handlerState(row: SdkAppConfigItem) {
  await sdkConfigApi.fetchBatchOptions({
    targetIds: [row.id],
    type: row.status === 1 ? BatchOptionsType.DISABLE : BatchOptionsType.Enable,
    values: {},
  });
  pageReload();
}

/** 删除 */
async function handlerDelete(row: SdkAppConfigItem) {
  await sdkConfigApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: {},
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      fieldName: "projectId",
      label: `${$t("attribution.sdkConfig.projectId")}`,
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<SdkAppConfigItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: "id",
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: "projectName",
      title: `${$t("attribution.sdkConfig.projectName")}`,
      width: "auto",
    },
    {
      field: "projectType",
      title: `${$t("attribution.sdkConfig.projectType")}`,
      width: 120,
    },
    {
      field: "packageName",
      title: `${$t("attribution.sdkConfig.packageName")}`,
      width: "auto",
    },
    {
      field: "sdkKey",
      title: `${$t("attribution.sdkConfig.sdkKey")}`,
      width: "auto",
      minWidth: 200,
    },
    {
      field: "sdkEnabled",
      title: `${$t("attribution.sdkConfig.sdkEnabled")}`,
      width: 100,
      slots: { default: "sdkEnabled" },
    },
    {
      field: "attributionConfigName",
      title: `${$t("attribution.sdkConfig.attributionConfigName")}`,
      width: "auto",
    },
    {
      field: "enabledEventIds",
      title: `${$t("attribution.sdkConfig.enabledEventIds")}`,
      width: 120,
      formatter: ({ cellValue }) => (cellValue as any[])?.length ?? 0,
    },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  height: "auto",
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await sdkConfigApi.fetchSdkConfigList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #action="{ row }">
          <Button type="link" @click="openCreateDrawer(row)">
            {{ $t("common.edit") }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t("common.delete") }}
          </Button>
        </template>

        <template #sdkEnabled="{ row }">
          <Tag :color="row.sdkEnabled ? 'green' : 'default'">
            {{ row.sdkEnabled ? $t("common.yes") : $t("common.no") }}
          </Tag>
        </template>

        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)" />
        </template>

        <template #toolbar-tools>
          <Button type="primary" @click="() => openCreateDrawer()">
            {{ $t("common.create") }}
          </Button>
        </template>
      </Grid>
    </Page>

    <CreateDrawer @page-reload="pageReload" />
  </div>
</template>
