<script setup lang="ts">
import type { DelLabelItemType, LabelItem } from "#/api/models/marketing";

import { Page, useVbenModal, type VbenFormProps } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { useDictStore } from "@vben/stores";

import { Button, message, Switch, Tag } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { accountLabelApi } from "#/api";
import { BatchOptionsType, STATUS_SELECT, TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { trimObject } from "#/utils/trim";

import { LABEL_TYPE_DICT_CODE } from "./constants";
import CreatedLabel from "./createdLabel.vue";

const dictStore = useDictStore();

/** 标签类型展示：字典 label + 颜色，未收录回退原值 */
function labelTypeMeta(value?: string) {
  const item = value
    ? dictStore.getDictItem(LABEL_TYPE_DICT_CODE, value)
    : undefined;
  return {
    color: item?.color || "default",
    label: item?.label ?? value ?? "-"
  };
}

async function fetchLabelTypeOptions() {
  const items = await dictStore.getDict(LABEL_TYPE_DICT_CODE);
  return {
    items: items.map((item) => ({
      label: item.label,
      value: String(item.value)
    }))
  };
}

const [CreatedLabelModule, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreatedLabel,
  centered: true,
  modal: true
});

const gridOptions: VxeGridProps<LabelItem> = {
  columns: [
    {
      field: "name",
      title: `${$t("marketing.accountLabel.columns.name")}`,
      width: "auto"
    },
    {
      field: "labelType",
      title: "标签类型",
      width: 120,
      slots: { default: "labelType" }
    },
    {
      field: "remark",
      title: `${$t("marketing.accountLabel.columns.remark")}`,
      width: "auto"
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await accountLabelApi.fetchGetAccountLabelList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  },
  checkboxConfig: {
    highlight: true,
    labelField: "id"
  },
  pagerConfig: {
    enabled: true
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true
  }
};
const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      fieldName: "id",
      label: `id`
    },
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入"
      },
      fieldName: "name",
      label: "标签名字"
    },
    {
      component: "ApiSelect",
      componentProps: {
        allowClear: true,
        api: fetchLabelTypeOptions,
        labelField: "label",
        placeholder: "请选择标签类型",
        resultField: "items",
        showSearch: true,
        valueField: "value"
      },
      fieldName: "labelType",
      label: "标签类型"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: "请选择"
      },
      fieldName: "status",
      label: "状态"
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function openCreateModal(
  row?: LabelItem
) {
  if (row?.id) {
    modalApi.setData(row);
  } else {
    modalApi.setData({});
  }
  modalApi.open();
}

/**
 * 单个删除按钮点击事件
 */
async function handlerDelete(data: LabelItem | LabelItem[]) {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) {
    return message.warning("请选择需要删除的数据！");
  }
  const rowIds = rows.map((item) => item.id) as string[];
  try {
    await accountLabelApi.fetchBatchOptions({
      targetIds: rowIds,
      type: "delete"
    });
    await message.success("删除成功");
    pageReload();
    gridApi.grid.clearCheckboxRow();
  } catch (err) {
    console.error("删除失败:", err);
  }
}

/**
 * 批量删除按钮点击事件
 */
function handlerDeleteAll() {
  const selectedRecords = gridApi.grid.getCheckboxRecords();
  handlerDelete(selectedRecords);
}

function pageReload() {
  gridApi.reload();
}

async function handlerState(row: LabelItem) {
  await (row.status === 1
    ? accountLabelApi.fetchBatchOptions({
      targetIds: [row.id!],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>()
    } as DelLabelItemType)
    : accountLabelApi.fetchBatchOptions({
      targetIds: [row.id!],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>()
    } as DelLabelItemType));
  pageReload();
}
</script>

<template>
  <Page content-class="p-5">
    <Grid>
      <template #labelType="{ row }">
        <Tag v-if="row.labelType" :bordered="false" :color="labelTypeMeta(row.labelType).color">
          {{ labelTypeMeta(row.labelType).label }}
        </Tag>
        <span v-else>-</span>
      </template>

      <template #status="{ row }">
        <Switch :checked="row.status === 1" @click="handlerState(row)" />
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openCreateModal(row)">
          {{ $t("common.edit") }}
        </Button>
        <Button type="link" danger @click="handlerDelete(row)">
          {{ $t("common.delete") }}
        </Button>
      </template>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="() => openCreateModal()">新增</Button>
        <Button type="primary" danger @click="handlerDeleteAll">删除</Button>
      </template>
    </Grid>
    <CreatedLabelModule @page-reload="pageReload" />
  </Page>
</template>

<style scoped lang="scss">

</style>
