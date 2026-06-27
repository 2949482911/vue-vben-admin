<script setup lang="ts">
import { Page, useVbenDrawer, type VbenFormProps } from "@vben/common-ui";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { Button, message, Switch, Tag } from "ant-design-vue";
import { mainBodyComboApi } from "#/api";
import Create from "./create.vue";
import type { MainBodyComboPageItem } from "#/api/models/main-body";

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
  submitOnEnter: false
};

const gridOptions: VxeGridProps = {
  border: true,
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
  height: "auto",
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
      targetIds: [row.id],
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
      targetIds: [row.id],
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
  <div>
    <Page auto-content-height>
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
    </Page>
    <CreateDrawerModule @page-reload="pageReload" />
  </div>
</template>

<style scoped lang="scss"></style>
