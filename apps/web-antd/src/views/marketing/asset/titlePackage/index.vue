<script setup lang="ts">
import type { TitlePackItem } from "./titlePackageType";

import { onMounted, ref } from "vue";

import { Page, useVbenDrawer, useVbenModal, type VbenFormProps } from "@vben/common-ui";

import { Button, Dropdown, Menu, MenuItem, message, Space, Switch, Tag } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { projectApi, titlePackApi } from "#/api";
import { ACTIVE_PLATFORM, TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { getPlatformColor, getPlatformLabel } from "#/constants/platform";
import { $t } from "#/locales";
import { trimObject } from "#/utils/trim";
import { LABEL_TYPE_CODES, LABEL_TYPE_COLORS } from "#/views/marketing/account/label/constants";
import { useAccountLabelOptions } from "#/views/marketing/account/label/useAccountLabelOptions";

import BatchLabelModal from "../components/BatchLabelModal.vue";
import CreatedTitlePackage from "./createdTitlePackage.vue";

const [CreatedTitlePackageModule, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: CreatedTitlePackage
});

const [BatchLabelModalComp, batchLabelModalApi] = useVbenModal({
  connectedComponent: BatchLabelModal
});

const selectedRows = ref<TitlePackItem[]>([]);

const gridEvents = {
  checkboxAll: ({ records }: { records: TitlePackItem[] }) => {
    selectedRows.value = records;
  },
  checkboxChange: ({ records }: { records: TitlePackItem[] }) => {
    selectedRows.value = records;
  },
  proxyQuery: () => {
    selectedRows.value = [];
  }
};

const displayValue = ref<TitlePackItem>();
const { labelNamesOf, loadLabelOptions } = useAccountLabelOptions(
  LABEL_TYPE_CODES.title
);
const labelColor = LABEL_TYPE_COLORS[LABEL_TYPE_CODES.title] ?? "default";

onMounted(() => {
  void loadLabelOptions();
});

function openDrawer() {
  displayValue.value = undefined;
  drawerApi.open();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        placeholder: "请选择"
      },
      fieldName: "platform",
      label: "平台"
    },
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入"
      },
      fieldName: "title",
      label: "标题名字"
    },
    {
      component: "ApiSelect",
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: "请选择",
        api: async (params: any) => {
          return await projectApi.fetchProjectList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000
        },
        valueField: "id",
        labelField: "name",
        resultField: "items"
      },
      fieldName: "projectId",
      label: "产品"
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  compact: true,
  collapsed: true
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
      field: "title",
      title: "标题",
      width: "auto"
    },
    {
      field: "projectName",
      title: "绑定产品",
      width: "auto"
    },
    {
      field: "labelIds",
      title: "标签",
      width: 200,
      slots: { default: "labelIds" }
    },
    {
      field: "platform",
      title: "平台",
      width: "auto",
      // 媒体列渲染成中文带色标签，映射取自 constants/platform
      slots: { default: "platform" }
    },
    ...(TABLE_COMMON_COLUMNS as any)
  ],
  height: "auto",
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await titlePackApi.fetchGetTitlePack({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  }
};

/**
 * 单个编辑按钮点击事件
 */
function handlerEdit(row: TitlePackItem) {
  displayValue.value = { ...row };
  drawerApi.open();
}

/**
 * 单个删除按钮点击事件
 */
async function handlerDelete(data: TitlePackItem | TitlePackItem[]) {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) {
    return message.warning("请选择需要删除的数据！");
  }
  const rowIds = rows.map((item) => item.id);
  try {
    await titlePackApi.fetchDelTitlePack({
      targetIds: rowIds,
      type: "delete"
    });
    message.success("删除成功");
    await pageReload();
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

function openBatchLabel() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    return message.warning("请选择需要修改标签的数据！");
  }
  batchLabelModalApi.setData({
    asset: "title",
    targetIds: records.map((item: TitlePackItem) => String(item.id))
  });
  batchLabelModalApi.open();
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

function pageReload() {
  gridApi.reload();
}

function handlerState(_row: TitlePackItem) {
}
</script>

<template>
  <Page>
    <Grid>
      <template #platform="{ row }">
        <Tag :bordered="false" :color="getPlatformColor(row.platform)">
          {{ getPlatformLabel(row.platform) }}
        </Tag>
      </template>
      <template #labelIds="{ row }">
        <Space v-if="row.labelIds?.length" wrap :size="[4, 4]">
          <Tag
            v-for="name in labelNamesOf(row.labelIds)"
            :key="name"
            :bordered="false"
            :color="labelColor"
          >
            {{ name }}
          </Tag>
        </Space>
        <span v-else>-</span>
      </template>
      <template #status="{ row }">
        <Switch :checked="row.status === 1" @click="handlerState(row)" />
      </template>
      <template #action="{ row }">
        <Button type="link" @click="handlerEdit(row)">编辑</Button>
        <Button type="link" danger @click="handlerDelete(row)">
          {{ $t("common.delete") }}
        </Button>
      </template>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openDrawer">新建标题包</Button>
        <Dropdown trigger="click" placement="bottomCenter">
          <Button class="mr-2" type="primary" :disabled="selectedRows.length === 0">
            批量操作
          </Button>
          <template #overlay>
            <Menu>
              <MenuItem @click="openBatchLabel">修改标签</MenuItem>
            </Menu>
          </template>
        </Dropdown>
        <Button type="primary" danger @click="handlerDeleteAll">删除</Button>
      </template>
    </Grid>
    <CreatedTitlePackageModule @page-reload="pageReload" :display-value="displayValue" />
    <BatchLabelModalComp @success="pageReload" />
  </Page>
</template>

<style scoped lang="scss"></style>
