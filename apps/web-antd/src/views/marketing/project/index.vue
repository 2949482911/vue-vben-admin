<script lang="ts" setup name="ProjectManager">
import {useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {Page} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import type {ProjectItem} from '#/api/models';
import {$t} from '@vben/locales';

import {Button, Switch, Dropdown, Menu, MenuItem} from 'ant-design-vue';
import {projectApi} from '#/api/core';
import {BatchOptionsType, STATUS_SELECT, TABLE_COMMON_COLUMNS,} from '#/constants/locales';

import CreateProject from "./create.vue";
import { trimObject } from '#/utils/trim';

import { ref } from 'vue';
import BatchOperationComp from './batchOperation.vue';//批量修改弹窗

const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateProject,
  centered: true,
  modal: true,
});

function openCreateModal(
  row?: ProjectItem
) {
  if (row?.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

async function handlerState(row: ProjectItem) {
  await (row.status == 1
    ? projectApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>(),
    })
    : projectApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>(),
    }));
  pageReload();
}

async function handlerDelete(row: ProjectItem) {
  await projectApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>(),
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      label: `id`,
    },
    {
      component: 'Input',
      fieldName: 'ename',
      label: `${$t('marketing.metric.columns.ename')}`,
    },

    {
      component: 'Input',
      fieldName: 'cname',
      label: `${$t('marketing.metric.columns.cname')}`,
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

const gridOptions: VxeGridProps<ProjectItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
  columns: [

    {
      field: 'name', title: `${$t('marketing.project.columns.name')}`, width: "auto"
    },
    {
      field: 'projectType', title: `${$t('marketing.project.columns.projectType')}`, width: "auto"
    },

    {
      field: 'packageName', title: `${$t('marketing.project.columns.packageName')}`, width: "auto"
    },

    {
      field: 'description', title: `${$t('marketing.project.columns.description')}`, width: "auto",
    },

    {
      field: 'icon', title: `${$t('marketing.project.columns.icon')}`, width: "auto"
    },

    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await projectApi.fetchProjectList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};
const selectedRows = ref<ProjectItem[]>([])
const gridEvents = {
  checkboxChange:({records}:{records:ProjectItem[]})=>{
    selectedRows.value = records
  },
  //全选事件
  checkboxAll:({records}:{records:ProjectItem[]})=>{
    selectedRows.value = records
  },
  //当分页时也需要置灰批量操作按钮
  proxyQuery:({})=>{
    selectedRows.value = []
  }
}
/**
 * 批量修改弹窗
 */
const [BatchOperationModal, BatchOperationApi] = useVbenModal({
  connectedComponent: BatchOperationComp,
  centered: true,
  modal: true,
});

function openBatchOptions(modalType: string) {
  BatchOperationApi.setData({
    selectedRows: selectedRows.value, // 原有选中行数据
    modalType: modalType, // 新增的弹窗类型
  });
  BatchOperationApi.open();
}
function batchDelete() {
  const targetIds = selectedRows.value.map(item => item.id)
  projectApi.fetchBatchOptions({
      targetIds: targetIds,
      type: 'delete',
      values: {}
    })
}
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions, gridEvents});

function pageReload() {
  gridApi.reload();
}

</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #action="{ row }">
          <Button type="link" @click="openCreateModal(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>


        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>

        <template #toolbar-tools>
          <Dropdown trigger="click" placement="bottom">
            <Button class="mr-2" type="primary" :disabled="selectedRows.length===0">
              {{ $t('common.batch_options') }}
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem  @click="openBatchOptions('org')">
                  修改部门
                </MenuItem>
                <MenuItem  @click="openBatchOptions('creator')">
                  修改创建人
                </MenuItem>
                <MenuItem  @click="openBatchOptions('status')">
                  修改状态
                </MenuItem>
                <MenuItem  @click="batchDelete">
                  批量删除
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>

          <Button class="mr-2" type="primary" @click="()=>openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>

    <CreateObjectModal @page-reload="pageReload"/>
    <BatchOperationModal @page-reload="pageReload"/>
  </div>
</template>
