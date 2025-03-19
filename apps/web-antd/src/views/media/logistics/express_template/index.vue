<script lang="ts" setup name="BrandManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {logisticsApi} from "#/api/media/";
import type {ExpressTemplateItem} from "#/api/models/media/logistics";
import CreateExpressTemplate from "./create.vue"


const [CreateExpressTemplateModal, createModalApi] = useVbenModal({
  connectedComponent: CreateExpressTemplate,
  centered: true,
  modal: true,
});


function openModal(row: ExpressTemplateItem) {
  createModalApi.open()
}



const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.express_template.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
    },
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("media.express_template.columns.name")}`
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


const gridOptions: VxeGridProps<ExpressTemplateItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {field: "platform", title: `${$t("media.express_template.columns.platform")}`, width: "auto"},
    {field: "name", title: `${$t("media.express_template.columns.name")}`, width: "auto"},
    {field: "calType", title: `${$t("media.express_template.columns.calType")}`, width: "auto"},
    {field: "provinceName", title: `${$t("media.express_template.columns.provinceName")}`, width: "auto"},
    {field: "cityName", title: `${$t("media.express_template.columns.cityName")}`, width: "auto"},
    {field: "districtName", title: `${$t("media.express_template.columns.districtName")}`, width: "auto"},
    ...TABLE_COMMON_COLUMNS,

  ],
  pagerConfig: {
    enabled: true
  },
  sortConfig: {
    multiple: true
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await logisticsApi.fetchExpressTemplateList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      }
    },
    autoLoad: true
  }
};


const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.query();
}


</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openModal(null)">
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #action="{ row }">
          <Button type="link">{{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
        </template>
      </Grid>
    </Page>

    <CreateExpressTemplateModal @page-reload="pageReload"/>
  </div>
</template>
