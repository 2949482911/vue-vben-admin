<script setup lang="ts">
import type { MainBodyComboPageItem } from "#/api/models/main-body";

import { Page, useVbenDrawer, type VbenFormProps } from "@vben/common-ui";
import { useDictStore } from "@vben/stores";

import { Button, message, Space, Switch, Tag } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { mainBodyComboApi } from "#/api";
import { TABLE_COMMON_COLUMNS } from "#/constants/locales";

import {
  COMBO_PRIVILEGE_DICT_CODE,
  COMBO_PRIVILEGE_FALLBACK
} from "./constants";
import Create from "./create.vue";

const dictStore = useDictStore();

const UNIT_LABEL: Record<string, string> = {
  count: "次",
  gb: "GB",
  unit: "个"
};

/** 权益名称：字典优先，取不到回退接口快照 */
function privilegeLabel(privilege: { privilegeCode?: string; privilegeName?: string }) {
  if (!privilege.privilegeCode) {
    return privilege.privilegeName || "-";
  }
  const label = dictStore.getDictLabel(
    COMBO_PRIVILEGE_DICT_CODE,
    privilege.privilegeCode
  );
  if (label !== undefined && label !== null && label !== "") {
    return String(label);
  }
  return (
    COMBO_PRIVILEGE_FALLBACK[privilege.privilegeCode] ??
    privilege.privilegeName ??
    privilege.privilegeCode
  );
}

function quotaLabel(privilege: { quota?: number; unit?: string }) {
  if (privilege.quota === -1) {
    return "不限";
  }
  return `${privilege.quota ?? 0}${UNIT_LABEL[privilege.unit || ""] ?? privilege.unit ?? ""}`;
}

const [CreateDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: Create
});

function openDrawer(row?: MainBodyComboPageItem) {
  if (row) {
    drawerApi.setData(row);
  } else {
    drawerApi.setData({});
  }
  drawerApi.open();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入套餐名称"
      },
      fieldName: "name",
      label: "套餐名称"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        placeholder: "请选择套餐类型",
        options: [
          { label: "试用套餐", value: "trial" },
          { label: "标准套餐", value: "standard" },
          { label: "高级套餐", value: "premium" },
          { label: "企业套餐", value: "enterprise" }
        ]
      },
      fieldName: "type",
      label: "套餐类型"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        placeholder: "请选择状态",
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 }
        ]
      },
      fieldName: "status",
      label: "状态"
    }
  ],
  showCollapseButton: false,
  submitOnEnter: true,
  compact: true,
  collapsed: true
};

const gridOptions: VxeGridProps = {
  border: true,
  height: "auto",
  checkboxConfig: {
    highlight: true
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true
  },
  columns: [
    {
      field: "name",
      title: "套餐名称",
      width: "auto"
    },
    {
      field: "type",
      title: "套餐类型",
      width: "auto",
      slots: { default: "type" }
    },
    {
      field: "days",
      title: "有效天数",
      width: "auto"
    },
    {
      field: "price",
      title: "价格",
      width: "auto",
      slots: { default: "price" }
    },
    {
      field: "privileges",
      title: "套餐权益",
      width: 260,
      slots: { default: "privileges" }
    },
    {
      field: "isDefault",
      title: "是否默认",
      width: "auto",
      slots: { default: "isDefault" }
    },
    {
      field: "version",
      title: "版本",
      width: "auto"
    },
    ...(TABLE_COMMON_COLUMNS as any)
  ],
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = {
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        };
        return await mainBodyComboApi.fetchMainBodyComboList(params);
      }
    }
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

async function handlerDelete(row: MainBodyComboPageItem) {
  try {
    await mainBodyComboApi.fetchMainBodyComboBatchOption({
      targetIds: [row.id!],
      type: "delete",
      values: new Map<string, any>()
    });
    message.success("删除成功");
    pageReload();
  } catch (err) {
    console.error("删除失败:", err);
  }
}

async function handlerState(row: MainBodyComboPageItem) {
  try {
    await mainBodyComboApi.fetchMainBodyComboBatchOption({
      targetIds: [row.id!],
      type: row.status === 1 ? "disable" : "enable",
      values: new Map<string, any>()
    });
    message.success("操作成功");
    pageReload();
  } catch (err) {
    console.error("操作失败:", err);
  }
}
</script>

<template>
  <Page content-class="p-5">
    <Grid>
      <template #type="{ row }">
        <Tag v-if="row.type === 'trial'" color="blue">试用套餐</Tag>
        <Tag v-else-if="row.type === 'standard'" color="green">标准套餐</Tag>
        <Tag v-else-if="row.type === 'premium'" color="orange">高级套餐</Tag>
        <Tag v-else-if="row.type === 'enterprise'" color="purple">企业套餐</Tag>
        <Tag v-else color="default">{{ row.type }}</Tag>
      </template>
      <template #price="{ row }">
        ¥{{ row.price }}
      </template>
      <template #privileges="{ row }">
        <Space v-if="row.privileges?.length" wrap :size="[4, 4]">
          <Tag
            v-for="privilege in row.privileges"
            :key="privilege.id || privilege.privilegeCode"
            :bordered="false"
          >
            {{ privilegeLabel(privilege) }} · {{ quotaLabel(privilege) }}
          </Tag>
        </Space>
        <span v-else>-</span>
      </template>
      <template #isDefault="{ row }">
        <Tag v-if="row.isDefault" color="success">默认</Tag>
        <Tag v-else color="default">否</Tag>
      </template>
      <template #status="{ row }">
        <Switch :checked="row.status === 1" @click="handlerState(row)" />
      </template>
      <template #action="{ row }">
        <Button type="link" @click="openDrawer(row)">编辑</Button>
        <Button type="link" danger @click="handlerDelete(row)">
          删除
        </Button>
      </template>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openDrawer()">
          新建套餐
        </Button>
      </template>
    </Grid>
    <CreateDrawerModule @page-reload="pageReload" />
  </Page>
</template>

<style scoped lang="scss"></style>
