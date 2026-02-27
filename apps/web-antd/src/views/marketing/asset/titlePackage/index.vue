<script setup lang="ts">
import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { projectApi, titlePackApi } from '#/api';
import { trimObject } from '#/utils/trim';
import { ACTIVE_PLATFORM, TABLE_COMMON_COLUMNS } from '#/constants/locales';
import { Button, message, Tag } from 'ant-design-vue';
import type { TitlePackItem } from './titlePackageType';
import CreatedTitlePackage from './createdTitlePackage.vue';
import { $t } from '#/locales';

const [CreatedTitlePackageModule, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreatedTitlePackage,
    centered: true,
    modal: true,
});

function openModal() {
  modalApi.open();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options:ACTIVE_PLATFORM,
        placeholder: '请选择',
      },
      fieldName: 'platform',
      label: '平台',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'title',
      label: '标题名字',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        api: async (params:any) => {
          return await projectApi.fetchProjectList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: 'items',
      },
      fieldName: 'projectId',
      label: '产品',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}

const gridOptions: VxeGridProps = {
  border: true,
  checkboxConfig: {
    highlight: true,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'title',
      title: '标题名称',
      width: 'auto',
    },
    {
      field: 'projectName',
      title: '绑定产品',
      width: 'auto',
    },
    {
      field: 'platform',
      title: '平台',
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await titlePackApi.fetchGetTitlePack({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};

/**
 * 单个删除按钮点击事件
 */
async function handlerDelete(data: TitlePackItem | TitlePackItem[]) {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) {
    return message.warning('请选择需要删除的数据！');
  }
  const rowIds = rows.map((item) => item.id);
  try {
    await titlePackApi.fetchDelTitlePack({
      targetIds: rowIds,
      type: 'delete',
    });
    message.success('删除成功');
    await pageReload();
    gridApi.grid.clearCheckboxRow(); 
  } catch (err) {
    console.error('删除失败:', err);
  }
}

/**
 * 批量删除按钮点击事件
 */
function handlerDeleteAll() {
  const selectedRecords = gridApi.grid.getCheckboxRecords();
  handlerDelete(selectedRecords);
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #status="{row}">
          <Tag color="green" v-if="row.status === 1">
            启用
          </Tag>
          <Tag v-else color="red">不启用</Tag>
        </template>
        <template #action="{ row }">
          <Button type="link" danger @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openModal">新建标题包</Button>
          <Button type="primary" danger @click="handlerDeleteAll">删除</Button>
        </template>
      </Grid>
    </Page>
    <CreatedTitlePackageModule @page-reload="pageReload"/>
  </div>
</template>

<style scoped lang="scss">

</style>
