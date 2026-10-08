<script lang="ts" setup name="DeveloperManager">
import type { VbenFormProps } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import type { DeveloperItem } from "#/api/models";

import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { Button, Modal, Popconfirm } from "ant-design-vue";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { developerApi } from "#/api/core";
import {
  BatchOptionsType,
  DEVELOPER_AUTH_ACCOUNT_PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS
} from "#/constants/locales";
import { trimObject } from "#/utils/trim";

import CreateObjectRequestComp from "./create.vue";

/** 开发者状态：1 启用 / 9 停用（对应 STATUS_SELECT） */
const STATUS_ENABLE = 1;
const STATUS_DISABLE = 9;

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: CreateObjectRequestComp
});

function openCreateDrawer(row?: DeveloperItem) {
  createDrawerApi.setData(row?.id ? row : {}).open();
}

/**
 * 状态开关二次确认：返回 false 会中止切换（CellSwitch 的 beforeChange）
 * @param newStatus 期望切换到的状态值
 * @param row 行数据
 */
async function onStatusChange(newStatus: number, row: DeveloperItem) {
  const toEnable = newStatus === STATUS_ENABLE;
  try {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        content: `${row.name} → ${toEnable ? $t("common.enabled") : $t("common.disabled")}`,
        onCancel: () => reject(new Error("已取消")),
        onOk: () => resolve(true),
        title: $t("ui.actionTitle.edit", [$t("core.columns.status")])
      });
    });
  } catch {
    return false;
  }
  await developerApi.fetchBatchOptions({
    targetIds: [row.id!],
    type: toEnable ? BatchOptionsType.Enable : BatchOptionsType.DISABLE,
    values: new Map<string, any>()
  });
  pageReload();
  return true;
}

async function handlerDelete(row: DeveloperItem) {
  await developerApi.fetchBatchOptions({
    targetIds: [row.id!],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>()

  });
  pageReload();
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: "Input",
      fieldName: "id",
      label: `id`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: DEVELOPER_AUTH_ACCOUNT_PLATFORM,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "platform",
      label: `${$t("ocpx.platform.title")}`
    },
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("marketing.developer.columns.name")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "status",
      label: `${$t("core.columns.status")}`
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  compact: true,
  collapsed: true
};

const gridOptions: VxeGridProps<DeveloperItem> = {
  border: true,
  height: "auto",
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
      field: "platform",
      title: `${$t("marketing.developer.columns.platform")}`,
      width: "auto"
    },
    {
      field: "name", title: `${$t("marketing.developer.columns.name")}`, width: "auto"
    },
    {
      field: "apiKey",
      title: `${$t("marketing.developer.columns.apiKey")}`,
      width: "auto"

    },
    {
      field: "apiSecret",
      title: `${$t("marketing.developer.columns.apiSecret")}`,
      width: "auto"

    },
    {
      field: "remark", title: `${$t("marketing.developer.columns.remark")}`, width: "auto"
    },
    {
      field: "authCount", title: `${$t("marketing.developer.columns.authCount")}`, width: "auto"
    },
    {
      // 启用/停用，切换前二次确认，接口失败自动回滚
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: "CellSwitch",
        props: { checkedValue: STATUS_ENABLE, unCheckedValue: STATUS_DISABLE }
      },
      field: "status",
      title: `${$t("core.columns.status")}`,
      width: "auto"
    },

    // status 已在上方单独定义（需要开关渲染器），从公共列里剔除避免出现重复列
    ...(TABLE_COMMON_COLUMNS.filter((col: any) => col.field !== "status") as any)
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await developerApi.fetchDeveloperList({
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
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <Button type="link" @click="openCreateDrawer(row)">
          {{ $t("common.edit") }}
        </Button>
        <Popconfirm
          :title="$t('ui.actionMessage.deleteConfirm', [row.name])"
          @confirm="handlerDelete(row)"
        >
          <Button danger type="link">
            {{ $t("common.delete") }}
          </Button>
        </Popconfirm>
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openCreateDrawer()">
          {{ $t("common.create") }}
        </Button>
      </template>
    </Grid>
  </Page>
  <CreateDrawer @page-reload="pageReload" />
</template>
