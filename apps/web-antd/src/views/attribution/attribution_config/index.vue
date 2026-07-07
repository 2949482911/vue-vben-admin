<script lang="ts" setup name="AttributionConfigIndex">
import { Page, useVbenDrawer, type VbenFormProps } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { AttributionConfigItem } from "#/api/models/attribution";
import { $t } from "@vben/locales";

import { Button, Switch, Tag } from "ant-design-vue";
import { attributionConfigApi } from "#/api/core/attribution";
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from "#/constants/locales";

import CreateAttributionConfig from "./create.vue";
import { trimObject } from "#/utils/trim";
import { ATTRIBUTION_MODEL_OPTIONS, getAttributionModelLabel } from "./enums";

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: CreateAttributionConfig,
});

function openCreateDrawer(row?: AttributionConfigItem) {
  if (row?.id) {
    createDrawerApi.setData(row);
  } else {
    createDrawerApi.setData({});
  }
  createDrawerApi.open();
}

/** 状态切换 */
async function handlerState(row: AttributionConfigItem) {
  await attributionConfigApi.fetchBatchOptions({
    targetIds: [row.id],
    type: row.status === 1 ? BatchOptionsType.DISABLE : BatchOptionsType.Enable,
    values: {},
  });
  pageReload();
}

/** 删除 */
async function handlerDelete(row: AttributionConfigItem) {
  await attributionConfigApi.fetchBatchOptions({
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
      fieldName: "name",
      label: `${$t("attribution.attributionConfig.name")}`,
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: ATTRIBUTION_MODEL_OPTIONS,
        placeholder: `${$t("common.choice")}`,
      },
      fieldName: "attributionModel",
      label: `${$t("attribution.attributionConfig.attributionModel")}`,
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<AttributionConfigItem> = {
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
      field: "name",
      title: `${$t("attribution.attributionConfig.name")}`,
      width: "auto",
    },
    {
      field: "attributionModel",
      title: `${$t("attribution.attributionConfig.attributionModel")}`,
      width: "auto",
      slots: { default: "attributionModel" },
    },
    {
      field: "clickLookbackWindow",
      title: `${$t("attribution.attributionConfig.clickLookbackWindow")}`,
      width: "auto",
    },
    {
      field: "exposureLookbackWindow",
      title: `${$t("attribution.attributionConfig.exposureLookbackWindow")}`,
      width: "auto",
    },
    {
      field: "ipLookbackWindow",
      title: `${$t("attribution.attributionConfig.ipLookbackWindow")}`,
      width: "auto",
    },
    {
      field: "callbackWindow",
      title: `${$t("attribution.attributionConfig.callbackWindow")}`,
      width: "auto",
    },
    {
      field: "isDefault",
      title: `${$t("attribution.attributionConfig.isDefault")}`,
      width: "auto",  
      slots: { default: "isDefault" },
    },
    {
      field: "idMatchPriority",
      title: `${$t("attribution.attributionConfig.idMatchPriority")}`,
      width: "auto",

    },
    {
      field: "description",
      title: `${$t("attribution.attributionConfig.description")}`,
      width: "auto",
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
        return await attributionConfigApi.fetchConfigList({
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

        <template #isDefault="{ row }">
          <Tag :color="row.isDefault ? 'blue' : 'default'">
            {{ row.isDefault ? $t("common.yes") : $t("common.no") }}
          </Tag>
        </template>

        <template #attributionModel="{ row }">
          <Tag>{{ getAttributionModelLabel(row.attributionModel) }}</Tag>
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
