<script lang="ts" setup name="MainBodyManager">
import type { VbenFormProps } from "@vben/common-ui";
import { Page, useVbenDrawer, useVbenModal } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { MainBodyItem } from "#/api/models";
import type { CreateMenuRequest, UpdateMenuRequest } from "#/api/models/menu";
import { $t } from "@vben/locales";

import { ref } from "vue";

import { Button, Dropdown, Menu, MenuItem, Switch, Tag } from "ant-design-vue";
import { mainBodyApi } from "#/api";
import { BatchOptionsType, STATUS_SELECT, TABLE_COMMON_COLUMNS } from "#/constants/locales";

import BatchOperation from "./batchOperation.vue";
import ComboHistoryDrawer from "./ComboHistoryDrawer.vue";
import Create from "./create.vue";

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: Create
});

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createDrawerApi.setData(row);
  } else {
    createDrawerApi.setData({});
  }
  createDrawerApi.open();
}

const [ComboInfoDrawer, comboInfoDrawerApi] = useVbenDrawer({
  connectedComponent: ComboHistoryDrawer
});

function openComboDrawer(row: MainBodyItem) {
  comboInfoDrawerApi.setData(row);
  comboInfoDrawerApi.open();
}

async function handlerState(row: MainBodyItem) {
  await (row.status == 1
    ? mainBodyApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>()
    })
    : mainBodyApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>()

    }));
  pageReload();
}

async function handlerDelete(row: MainBodyItem) {
  await mainBodyApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("system.mainbody.columns.name")}`
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

const gridOptions: VxeGridProps<MainBodyItem> = {
  columns: [
    {
      field: "name",
      title: `${$t("system.mainbody.columns.name")}`,
      width: "auto"
    },
    {
      field: "email",
      title: `${$t("system.mainbody.columns.email")}`,
      width: "auto"
    },
    {
      field: "remark",
      title: `${$t("system.mainbody.columns.remark")}`,
      width: "auto"
    },
    {
      field: "sellId",
      title: `${$t("system.mainbody.columns.sellId")}`,
      width: "auto"
    }, {
      field: "sellName",
      title: `${$t("system.mainbody.columns.sellName")}`,
      width: "auto"
    }, {
      field: "phone",
      title: `${$t("system.mainbody.columns.phone")}`,
      width: "auto"
    },
    {
      field: "combo",
      title: `${$t("system.mainbody.columns.combo")}`,
      width: "auto",
      slots: { default: "combo" }
    },
    ...TABLE_COMMON_COLUMNS
  ],
  checkboxConfig: {
    highlight: true,
    labelField: "id"
  },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await mainBodyApi.fetchMainList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      }
    }
  },
  pagerConfig: {
    enabled: true
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true
  },
  height: "auto"
};

const selectedRows = ref<MainBodyItem[]>([]);
const gridEvents = {
  checkboxChange: ({ records }: { records: MainBodyItem[] }) => {
    selectedRows.value = records;
  },
  checkboxAll: ({ records }: { records: MainBodyItem[] }) => {
    selectedRows.value = records;
  },
  proxyQuery: () => {
    selectedRows.value = [];
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

const pageReload = () => {
  gridApi.reload();
  selectedRows.value = [];
};

const [BatchOperationModal, batchOperationApi] = useVbenModal({
  connectedComponent: BatchOperation,
  centered: true,
  modal: true
});

function openBatchSetSale() {
  batchOperationApi.setData({
    selectedRows: selectedRows.value,
    modalType: "sale"
  });
  batchOperationApi.open();
}

function openBatchSetCombo() {
  batchOperationApi.setData({
    selectedRows: selectedRows.value,
    modalType: "combo"
  });
  batchOperationApi.open();
}
</script>

<template>
  <Page>
    <Grid>
      <template #status="{ row }">
        <Switch :checked="row.status == 1" @click="handlerState(row)" />
      </template>

      <template #sex="{ row }">
        <Tag v-if="row.sex == 1">{{ $t("common.boy") }}</Tag>
        <Tag v-else>{{ $t("common.girl") }}</Tag>
      </template>

      <template #combo="{ row }">
        <Button type="link" @click="openComboDrawer(row)">
          {{ $t("system.mainbody.combo.view") }}
        </Button>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">
          {{ $t("common.edit") }}
        </Button>
        <Button type="link" @click="handlerDelete(row)">
          {{ $t("common.delete") }}
        </Button>
      </template>

      <template #toolbar-tools>
        <Dropdown trigger="click" placement="bottomCenter">
          <Button
            class="mr-2"
            type="primary"
            :disabled="selectedRows.length === 0"
          >
            {{ $t("common.batch_options") }}
          </Button>
          <template #overlay>
            <Menu>
              <MenuItem @click="openBatchSetSale">
                {{ $t("system.mainbody.batch.setSale") }}
              </MenuItem>
              <MenuItem @click="openBatchSetCombo">
                {{ $t("system.mainbody.batch.setCombo") }}
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>
        <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
          {{ $t("common.create") }}
        </Button>
      </template>
    </Grid>
    <CreateDrawer @page-reload="pageReload" />
    <BatchOperationModal @page-reload="pageReload" />
    <ComboInfoDrawer />
  </Page>
</template>
