<script lang="ts" setup name="CrowdManager">
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "#/adapter/vxe-table";
import {Page, type VbenFormProps} from "@vben/common-ui";
import {Button, Switch} from "ant-design-vue";
import {$t} from "@vben/locales";
import {PlatformOptions, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {crowdApi} from "#/api/media/";
import type {MediaItemItem} from "#/api/models/media/item";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: "Select",
      fieldName: "platform",
      label: `${$t("media.crowd.columns.platform")}`,
      componentProps: {
        options: PlatformOptions,
      }
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};


async function handlerState(row: MediaItemItem) {
  pageReload();
}

const gridOptions: VxeGridProps<MediaItemItem> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {field: "platform", title: `${$t("media.crowd.columns.platform")}`, width: "auto"},
    {field: "crowdName", title: `${$t("media.crowd.columns.crowdName")}`, width: "auto"},
    {field: "crowdDesc", title: `${$t("media.crowd.columns.crowdDesc")}`, width: "auto"},
    {field: "extJson", title: `${$t("media.crowd.columns.extJson")}`, width: "auto"},

    ...TABLE_COMMON_COLUMNS
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
        return await crowdApi.fetchCrowdList({
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
          <Button class="mr-2" type="primary">
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #status="{ row  }">
          <Switch :checked="row.status == 1" @change="handlerState(row)"/>
        </template>

        <template #skus="{ row }">
          <div>{{ row.skus.length }}</div>
        </template>

        <template #auditStatus="{ row }">
          <div>{{ row.auditStatus }}</div>
        </template>

        <template #action="{ row }">
          <Button type="link">{{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
          <Button type="link">{{ $t('common.info') }}</Button>
          <Button type="link">{{ $t('media.media_item.columns.stock_add') }}</Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
