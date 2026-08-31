<script lang="ts" setup name="AccountManager">

import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import type { DownloadCenterItem, ExportRTADataItem } from "#/api/models/tools";
import type { VbenFormProps } from "@vben/common-ui";
import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { useVbenForm } from "#/adapter/form";
import { Button, Switch, Tag } from "ant-design-vue";
import { downloadCenterApi } from "#/api/core/tools";
import { TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { trimObject } from "#/utils/trim";

const gridOptions: VxeGridProps<DownloadCenterItem> = {
  columns: [
    {
      field: "name",
      title: `${$t("tools.downcenter.columns.name")}`,
      width: "auto"
    },
    {
      field: "type",
      title: `${$t("tools.downcenter.columns.type")}`,
      width: "auto"
    },
    {
      field: "downloadUrl",
      title: `${$t("tools.downcenter.columns.downloadUrl")}`,
      slots: { default: "downloadUrl" },
      width: "auto"
    },
    {
      field: "taskState",
      title: `${$t("tools.downcenter.columns.taskState")}`,
      slots: { default: "taskState" },
      width: "auto"
    },
    {
      field: "message",
      title: "原因",
      width: "auto"
    },
    ...(TABLE_COMMON_COLUMNS as any)
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await downloadCenterApi.fetchDownloadList({
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
  // 默认展开
  schema: [
    {
      component: "Input",
      fieldName: "id",
      label: `id`
    },
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("tools.downcenter.columns.name")}`
    },
    {
      component: "Input",
      fieldName: "type",
      label: `${$t("tools.downcenter.columns.type")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: [
          { label: $t("common.pending"), value: 0 },
          { label: $t("common.processing"), value: 1 },
          { label: $t("common.completed"), value: 2 },
          { label: $t("common.failed"), value: 3 }
        ],
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "taskState",
      label: `${$t("tools.downcenter.columns.taskState")}`
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  compact: true,
  collapsed: true,
};
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
  },
  layout: "horizontal",
  handleSubmit: async (formVal: Record<string, any>) => {
    // const params = trimObject(formVal);
    const params = formVal;
    await downloadCenterApi.exportRtaData(params as ExportRTADataItem);
  },
  schema: [
    {
      component: "Select",
      fieldName: "type",
      label: `任务类型`,
      componentProps: {
        options: [
          {
            label: "rta",
            value: "rta"
          }
        ]
      },
      rules: "required"
    },
    {
      component: "RangePicker",
      componentProps: {
        placeholder: [`${$t("common.select")}`, `${$t("common.select")}`],
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        showTime: true
      },
      fieldName: "timeRange",
      label: "创建日期",
      rules: "required"
    },
    {
      component: "Select",
      fieldName: "fromMediaType",
      label: `来源媒体`,
      rules: "required",
      componentProps: {
        options: [
          {
            label: "VIVO",
            value: "vivo"
          }
        ]
      }
    },
    {
      component: "Select",
      fieldName: "toMediaType",
      label: `去向媒体`,
      rules: "required",
      componentProps: {
        options: [
          {
            label: "喜马拉雅",
            value: "xmly"
          }
        ]
      }
    }
  ]
});
// 导出rta数据抽屉
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: false,
  // 当抽屉打开状态改变时触发
  async onOpenChange(isOpen) {
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;
    await formApi.submitForm();
    await drawerApi.close();
  }
});

function exportRTAData() {
  drawerApi.open();
}
</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" />
        </template>

        <template #downloadUrl="{ row }">
          <a class="downloadLink" :class="{'disabled-link': !row.downloadUrl}"
             :href="row.downloadUrl" :download="row.name">点击下载</a>
        </template>
        <template #taskState="{ row }">
          <Tag v-if="row.taskState === 0" color="orange">{{ $t("common.pending") }}</Tag>
          <Tag v-if="row.taskState === 1" color="blue">{{ $t("common.processing") }}</Tag>
          <Tag v-if="row.taskState === 2" color="green">{{ $t("common.completed") }}</Tag>
          <Tag v-if="row.taskState === 3" color="red">{{ $t("common.failed") }}</Tag>
        </template>
        <template #toolbar-tools>
          <Button type="primary" @click="exportRTAData">
            导出
          </Button>
        </template>
      </Grid>
      <Drawer class="w-[40%]" title="数据导出">
        <Form>
        </Form>
      </Drawer>
    </Page>
  </div>
</template>
<style lang="scss" scoped>
.downloadLink {
  color: hsl(var(--primary));
  cursor: pointer;
}

.disabled-link {
  color: gray; /* 可选：灰色表示禁用状态 */
  text-decoration: none; /* 可选：去除下划线 */
  pointer-events: none;
}
</style>
