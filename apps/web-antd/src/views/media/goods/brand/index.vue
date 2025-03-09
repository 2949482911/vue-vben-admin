<script lang="ts" setup name="BrandManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {brandApi} from "#/api/media/";
import type {BrandItem} from "#/api/models/media/item";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.brand.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
    },
    {
      component: "Input",
      fieldName: "name",
      label: `${$t("media.brand.columns.name")}`
    },
    {
      component: "Input",
      fieldName: "nameEn",
      label: `${$t("media.brand.columns.nameEn")}`
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


async function handlerState(row: BrandItem) {
  pageReload();
}

const gridOptions: VxeGridProps<BrandItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    ...TABLE_COMMON_COLUMNS,
    {field: "platform", title: `${$t("media.account.columns.platform")}`, width: "auto"},
    {field: "name", title: `${$t("media.brand.columns.name")}`, width: "auto"},
    {field: "nameEn", title: `${$t("media.brand.columns.nameEn")}`, width: "auto"},
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
        return await brandApi.fetchBrandList({
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
        <template #status="{ row }">
          <Switch :checked="row.status == 1" @change="handlerState(row)"/>
        </template>
      </Grid>
    </Page>
  </div>
</template>
