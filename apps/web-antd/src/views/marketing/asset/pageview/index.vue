<script setup lang="ts">
import type { LandingPageData } from "#/api/models";

import { onMounted, ref } from "vue";

import { Page, useVbenDrawer, useVbenModal, type VbenFormProps } from "@vben/common-ui";

import { Button, Dropdown, Menu, MenuItem, message, Space, Switch, Tag } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { loadingPageApi } from "#/api";
import { TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { getPlatformColor, getPlatformLabel } from "#/constants/platform";
import { trimObject } from "#/utils/trim";
import { LABEL_TYPE_CODES, LABEL_TYPE_COLORS } from "#/views/marketing/account/label/constants";
import { useAccountLabelOptions } from "#/views/marketing/account/label/useAccountLabelOptions";

import BatchLabelModal from "../components/BatchLabelModal.vue";
import CreateLoadingPage from "./createLoadingPage.vue";
import LandingPageAddressList from "./LandingPageAddressList.vue";

const { labelNamesOf, loadLabelOptions } = useAccountLabelOptions(
  LABEL_TYPE_CODES.page
);
const labelColor = LABEL_TYPE_COLORS[LABEL_TYPE_CODES.page] ?? "default";

onMounted(() => {
  void loadLabelOptions();
});

const [CreateLoadingPageDrawer, createLoadingPageApi] = useVbenDrawer({
  connectedComponent: CreateLoadingPage,
});

const [BatchLabelModalComp, batchLabelModalApi] = useVbenModal({
  connectedComponent: BatchLabelModal
});

const selectedRows = ref<LandingPageData[]>([]);

const gridEvents = {
  checkboxAll: ({ records }: { records: LandingPageData[] }) => {
    selectedRows.value = records;
  },
  checkboxChange: ({ records }: { records: LandingPageData[] }) => {
    selectedRows.value = records;
  },
  proxyQuery: () => {
    selectedRows.value = [];
  }
};

async function openModal(val?: LandingPageData) {
  if (val?.id) {
    await createLoadingPageApi.setData(val);
  } else {
    await createLoadingPageApi.setData({});
  }
  createLoadingPageApi.open();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: [
          {
            label: "vivo",
            value: "vivo"
          }
        ],
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
      fieldName: "name",
      label: "名称"
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
      field: "name",
      title: "名称",
      width: "auto"
    },
    {
      field: "platform",
      title: "平台",
      width: "auto",
      // 媒体列渲染成中文带色标签，映射取自 constants/platform
      slots: { default: "platform" }
    },
    {
      field: "pageUrl",
      title: "地址配置",
      width: 320,
      slots: { default: "pageUrl" }
    },
    {
      field: "labelIds",
      title: "标签",
      width: 200,
      slots: { default: "labelIds" }
    },
    ...(TABLE_COMMON_COLUMNS as any)
  ],
  height: "auto",
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await loadingPageApi.fetchGetLoadingPage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  }
};

async function delLoadingPage() {
  const checkedRecords = gridApi.grid.getCheckboxRecords();
  const ids = checkedRecords.map((item) => item.id);
  try {
    await loadingPageApi.fetchDelLoadingPage({
      targetIds: ids,
      type: "delete"
    });
    pageReload();
    await message.success("删除成功！");
  } catch (err) {
    console.log(err, "err");
  }
}

function pageReload() {
  gridApi.reload();
}

function handlerState(_row: LandingPageData) {
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

function openBatchLabel() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    return message.warning("请选择需要修改标签的数据！");
  }
  batchLabelModalApi.setData({
    asset: "loading_page",
    targetIds: records.map((item: LandingPageData) => String(item.id))
  });
  batchLabelModalApi.open();
}
</script>

<template>
  <Page content-class="p-5">
    <Grid>
      <template #platform="{ row }">
        <Tag :bordered="false" :color="getPlatformColor(row.platform)">
          {{ getPlatformLabel(row.platform) }}
        </Tag>
      </template>
      <template #pageUrl="{ row }">
        <LandingPageAddressList
          :config="row.config"
          :platform="row.platform"
        />
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
        <Button type="link" @click="openModal(row)"> 编辑</Button>
      </template>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openModal()">新建落地页</Button>
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
        <Button class="mr-2" type="primary" danger @click="delLoadingPage">删除</Button>
      </template>
    </Grid>
  </Page>
  <CreateLoadingPageDrawer @page-reload="pageReload" />
  <BatchLabelModalComp @success="pageReload" />
</template>

<style scoped lang="scss"></style>
