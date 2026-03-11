<script setup lang="ts">
import type {LabelItem} from '#/api/models/marketing'
import { Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';
import { Button, message, Tag } from 'ant-design-vue';
import { ACTIVE_PLATFORM, TABLE_COMMON_COLUMNS, STATUS_SELECT, } from '#/constants/locales';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { accountLabelApi } from '#/api';
import { trimObject } from '#/utils/trim';
import CreatedLabel from './createdLabel.vue';

const [CreatedLabelModule, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreatedLabel,
    centered: true,
    modal: true,
});

const gridOptions: VxeGridProps<LabelItem> = {
  columns: [
    {
      field: 'name',
      title: `${$t('marketing.accountLabel.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'remark',
      title: `${$t('marketing.accountLabel.columns.remark')}`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any,
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await accountLabelApi.fetchGetAccountLabelList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  pagerConfig: {
    enabled: true,
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
};
const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '标签名字',
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options:STATUS_SELECT,
        placeholder: '请选择',
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function openCreateModal(
  row?: LabelItem
) {
  if (row?.id) {
    modalApi.setData(row);
  } else {
    modalApi.setData({});
  }
  modalApi.open();
}

/**
 * 单个删除按钮点击事件
 */
async function handlerDelete(data: LabelItem | LabelItem[]) {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) {
    return message.warning('请选择需要删除的数据！');
  }
  const rowIds = rows.map((item) => item.id);
  try {
    await accountLabelApi.fetchBatchOptions({
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
          <Button type="link" @click="openCreateModal(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" danger @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => openCreateModal()">新建</Button>
          <Button type="primary" danger @click="handlerDeleteAll">删除</Button>
        </template>
      </Grid>
    </Page>
    <CreatedLabelModule @page-reload="pageReload"/>
  </div>
</template>

<style scoped lang="scss">

</style>
