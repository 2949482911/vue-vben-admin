<script lang="ts" setup name="ProcessManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {Button, Switch} from 'ant-design-vue';
import type {CreateRoleRequest, FlowableFormItem, RoleItem, UpdateRoleRequest} from "#/api/models";
import {$t} from '@vben/locales';
import {BatchOptionsType, STATUS_SELECT, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import CreateProcess from "./create.vue";
import {flowableFormApi} from "#/api";


const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('bpm.work_flow.columns.name')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'status',
      label: `${$t('core.columns.status')}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};


const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: CreateProcess,
  centered: true,
  modal: true,
});

/**
 *
 * @param row
 */
function openCreateModal(row: CreateRoleRequest | UpdateRoleRequest) {
  if (row.id) {
    createModalApi.setData(row);
  } else {
    createModalApi.setData({})
  }
  createModalApi.open();
}

async function handlerDelete(id: string) {
  await flowableFormApi.fetchFormBatchOptions({
    targetIds: [id],
    type: BatchOptionsType.Delete.valueOf()
  })
  pageReload()
}

async function handlerState(row: FlowableFormItem) {
  let type: str = ""
  if (row.status == 1) {
    type = BatchOptionsType.DISABLE.valueOf()
  }else {
    type = BatchOptionsType.Enable.valueOf()
  }
  await flowableFormApi.fetchFormBatchOptions({
    targetIds: [row.id],
    type: type
  })
  pageReload()
}

const gridOptions: VxeGridProps<RoleItem> = {
  border: true,
  columns: [
    {title: '序号', type: 'seq', width: 50},
    ...TABLE_COMMON_COLUMNS,
    {field: 'name', title: `${$t('bpm.work_flow.columns.name')}`},
    {field: 'remark', title: `${$t('bpm.work_flow.columns.remark')}`},
  ],
  pagerConfig: {
    enabled: true,
  },
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await flowableFormApi.fetchFlowableFormList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      }
    },
    autoLoad: true,
  }
};


const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.query()
}


</script>

<template>
  <Page>
    <Grid>

      <template #status="{ row }">
        <Switch :checked="row.status == 1" @change="handlerState(row)"/>
      </template>

      <template #isSystem="{ row }">
        <Switch :checked="row.isSystem == 1"/>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openCreateModal(row)">{{ $t('common.edit') }}</Button>
        <Button type="link" @click="handlerDelete(row.id)">{{ $t('common.delete') }}</Button>
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openCreateModal">
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>

    <CreateModal @pageReload="pageReload"></CreateModal>
  </Page>
</template>
