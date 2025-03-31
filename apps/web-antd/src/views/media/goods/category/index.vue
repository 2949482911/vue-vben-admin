<script lang="ts" setup name="BrandManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformEnum, PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {categoryApi} from "#/api/media/";
import type {MediaOnlineretailersItem} from "#/api/models/media/account";
import type {CategoryItem} from "#/api/models/media/item";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.category.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      },
      defaultValue: PlatformEnum.KUAISHOU,
    },
    {
      component: "Input",
      fieldName: "platformCategoryName",
      label: `${$t("media.category.columns.platformCategoryName")}`
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


async function handlerState(row: CategoryItem) {
  pageReload();
}

const gridOptions: VxeGridProps<MediaOnlineretailersItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {field: "platform", title: `${$t("media.category.columns.platform")}`, width: "auto"},
    {
      field: "platformCategoryName",
      title: `${$t("media.category.columns.platformCategoryName")}`,
      width: "auto",
      treeNode: true,
    },
    ...TABLE_COMMON_COLUMNS,
  ],
  pagerConfig: {
    enabled: true
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await categoryApi.fetchCategoryList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      }
    },
    autoLoad: true
  },
  treeConfig: {
    parentField: 'platformCategoryPid',
    rowField: 'platformCategoryId',
    transform: false,
    childrenField: "children",
    expandAll: false
  },
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
        <template #action="{ row }"></template>
      </Grid>
    </Page>
  </div>
</template>
