<script setup lang="ts">
import { loadingPageApi } from '#/api';
import { TABLE_COMMON_COLUMNS } from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Button, message, Tag } from 'ant-design-vue';
import CreateLoadingPage from './createLoadingPage.vue';
import type { LandingPageData } from '#/api/models';

const [CreateLoadingPageModule, createLoadingPageApi] = useVbenModal({
  connectedComponent: CreateLoadingPage,
  centered: true,
  modal: true,
});

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
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'vivo',
            value: 'vivo',
          },
        ],
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
      fieldName: 'name',
      label: '名称',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};
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
      field: 'name',
      title: '名称',
      width: 'auto',
    },
    {
      field: 'platform',
      title: '平台',
      width: 'auto',
    },
    {
      field: 'pageUrl',
      title: '详情页地址',
      width: 'auto',
      slots: { default: 'pageUrl' },
    },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  height: 'auto',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await loadingPageApi.fetchGetLoadingPage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};

async function delLoadingPage() {
  const checkedRecords = gridApi.grid.getCheckboxRecords();
  const ids = checkedRecords.map((item) => item.id);
  try {
    loadingPageApi.fetchDelLoadingPage({
      targetIds: ids,
      type: 'delete',
    });
    pageReload();
    message.success('删除成功！');
  } catch (err) {
    console.log(err, 'err');
  }
}

function pageReload() {
  gridApi.reload();
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #pageUrl="{ row }">
          {{ row.config.pageUrl }}
        </template>
        <template #status="{ row }">
          <Tag color="green" v-if="row.status === 1"> 启用 </Tag>
          <Tag v-else color="red">不启用</Tag>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="openModal(row)"> 编辑 </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openModal()">新建落地页</Button>
          <Button class="mr-2" type="primary" danger @click="delLoadingPage">删除</Button>
        </template>
      </Grid>
    </Page>
    <CreateLoadingPageModule @page-reload="pageReload" />
  </div>
</template>

<style scoped lang="scss"></style>
