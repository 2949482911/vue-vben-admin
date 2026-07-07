<script lang="ts" setup name="AttributionProperties">
import { Page, useVbenDrawer, type VbenFormProps } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { EventAttributeItem } from "#/api/models/attribution";
import { $t } from "@vben/locales";

import { Button, Switch, Tag } from "ant-design-vue";
import { eventAttributeApi } from "#/api/core/attribution";
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from "#/constants/locales";

import CreateAttribute from "./create.vue";
import { trimObject } from "#/utils/trim";
import {
  ATTRIBUTE_CATEGORY_OPTIONS,
  ATTRIBUTE_TYPE_OPTIONS,
  getAttributeCategoryLabel,
  getAttributeTypeLabel,
} from "#/views/attribution/properties/enums";

const [CreateAttributeDrawer, createAttributeApi] = useVbenDrawer({
  connectedComponent: CreateAttribute
});

function openCreateDrawer(row?: EventAttributeItem) {
  if (row?.id) {
    createAttributeApi.setData(row);
  } else {
    createAttributeApi.setData({});
  }
  createAttributeApi.open();
}

/** 状态切换 */
async function handlerState(row: EventAttributeItem) {
  await eventAttributeApi.fetchBatchOptionsVO({
    targetIds: [row.id],
    type: row.status === 1 ? BatchOptionsType.DISABLE : BatchOptionsType.Enable,
    values: {}
  });
  pageReload();
}

/** 删除 */
async function handlerDelete(row: EventAttributeItem) {
  await eventAttributeApi.fetchBatchOptionsVO({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: {}
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("attribution.properties.name")}`
    },
    {
      component: "Input",
      fieldName: "displayName",
      label: `${$t("attribution.properties.displayName")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: ATTRIBUTE_TYPE_OPTIONS,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "type",
      label: `${$t("attribution.properties.type")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: ATTRIBUTE_CATEGORY_OPTIONS,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "category",
      label: `${$t("attribution.properties.category")}`
    }
  ],
  showCollapseButton: true,
  submitOnEnter: false
};

const gridOptions: VxeGridProps<EventAttributeItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: "id"
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true
  },
  columns: [
    {
      field: "name",
      title: `${$t("attribution.properties.name")}`,
      width: "auto"
    },
    {
      field: "displayName",
      title: `${$t("attribution.properties.displayName")}`,
      width: "auto"
    },
    {
      field: "type",
      title: `${$t("attribution.properties.type")}`,
      width: "auto",
      slots: { default: "type" }
    },
    {
      field: "category",
      title: `${$t("attribution.properties.category")}`,
      width: "auto",
      slots: { default: "category" }
    },
    {
      field: "isRequired",
      title: `${$t("attribution.properties.isRequired")}`,
      width: "auto",  
      slots: { default: "isRequired" }
    },
    {
      field: "isSystem",
      title: `${$t("attribution.properties.isSystem")}`,
      width: "auto",  
      slots: { default: "isSystem" }
    },
    {
      field: "defaultValue",
      title: `${$t("attribution.properties.defaultValue")}`,
      width: "auto"
    },
    {
      field: "validationRegex",
      title: `${$t("attribution.properties.validationRegex")}`,
      width: "auto"
    },
    ...(TABLE_COMMON_COLUMNS as any)
  ],
  height: "auto",
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await eventAttributeApi.fetchAttributeList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  }
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

        <template #type="{ row }">
          <Tag>{{ getAttributeTypeLabel(row.type) }}</Tag>
        </template>

        <template #category="{ row }">
          <Tag color="blue">{{ getAttributeCategoryLabel(row.category) }}</Tag>
        </template>

        <template #isRequired="{ row }">
          <Tag :color="row.isRequired ? 'red' : 'default'">
            {{ row.isRequired ? $t("common.yes") : $t("common.no") }}
          </Tag>
        </template>

        <template #isSystem="{ row }">
          <Tag :color="row.isSystem ? 'orange' : 'default'">
            {{ row.isSystem ? $t("common.yes") : $t("common.no") }}
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

    <CreateAttributeDrawer @page-reload="pageReload" />
  </div>
</template>
