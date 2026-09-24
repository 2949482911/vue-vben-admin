<script lang="ts" setup name="NoticeManager">
import type { VbenFormProps } from "@vben/common-ui";
import { Page, useVbenDrawer } from "@vben/common-ui";

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { NoticeItem } from "#/api/models";
import { $t } from "@vben/locales";

import { Button, Switch, Tag } from "ant-design-vue";
import { noticeApi } from "#/api";
import { BatchOptionsType, STATUS_SELECT, TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { noticeLevelColor, noticeLevelText, noticePlainText } from "#/utils/notice";

import CreateNotice from "./create-notice.vue";

const [CreateNoticeDrawer, baseDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: CreateNotice,
  closeOnPressEscape: true,
  footer: true
});

async function handlerState(row: NoticeItem) {
  await (row.status == 1
    ? noticeApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE
    })
    : noticeApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable
    }));
  pageReload();
}

async function handlerDelete(row: NoticeItem) {
  await noticeApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete
  });
  pageReload();
}

function openBaseDrawer(row?: NoticeItem) {
  if (row) {
    baseDrawerApi.setData(row);
  } else {
    baseDrawerApi.setData({});
  }
  baseDrawerApi.open();
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: "Input",
      fieldName: "title",
      label: `${$t("system.notice.columns.title")}`
    },
    {
      component: "DatePicker",
      fieldName: "datePicker",
      label: "Date"
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

const gridOptions: VxeGridProps<NoticeItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: "id"
  },
  height: "auto",
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true
  },
  columns: [
    { field: "title", title: `${$t("system.notice.columns.title")}`, minWidth: 200 },
    {
      field: "content",
      title: `${$t("system.notice.columns.content")}`,
      minWidth: 260,
      slots: { default: "content" }
    },
    {
      field: "level",
      title: `${$t("system.notice.columns.level")}`,
      width: 120,
      slots: { default: "level" }
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  keepSource: true,
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        // 后端返回全量列表（未分页），此处包装为 vxe-table 需要的结构
        return await noticeApi.getNoticeList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
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
  <Page>
    <Grid>
      <template #content="{ row }">
        <span>{{ noticePlainText(row.content) }}</span>
      </template>
      <template #level="{ row }">
        <Tag :color="noticeLevelColor(row.level)">
          {{ noticeLevelText(row.level) }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">
          {{ $t("common.edit") }}
        </Button>
        <Button type="link" @click="handlerDelete(row)">
          {{ $t("common.delete") }}
        </Button>
      </template>
      <template #status="{ row }">
        <Switch :checked="row.status === 1" @click="handlerState(row)" />
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openBaseDrawer()">
          {{ $t("common.create") }}
        </Button>
      </template>
    </Grid>
    <CreateNoticeDrawer @page-reload="pageReload" />
  </Page>

</template>
