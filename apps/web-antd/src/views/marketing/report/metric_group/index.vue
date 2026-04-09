<script setup lang="ts">
import type {MetricGroupType} from '#/api/models';
import {Page, useVbenModal,type VbenFormProps} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import {Button, message, Switch} from 'ant-design-vue';
import {$t} from '@vben/locales';
import {
  BatchOptionsType,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import { metricGroupApi } from '#/api/core'
import CreateObjectRequestComp from './create.vue'
const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      label: `id`,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '名字',
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

const gridOptions: VxeGridProps<MetricGroupType> = {
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
      field: 'name',
      title: `${$t('marketing.metricGroup.columns.name')}`,
      width: 'auto'
    },
    {
      field: 'description',
      title: `${$t('marketing.metricGroup.columns.description')}`,
      width: 'auto'
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await metricGroupApi.fetchGetMetricGroupList({
          page:page.pageSize,
          pageSize: page.pageSize,
          ...params
        })
      }
    }
  }
}

const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,

})

function handlerState(row:MetricGroupType) {

}
function openCreateModal(row:MetricGroupType) {
  if(row?.id) {
    createObjectApi.setData(row)
  }
  createObjectApi.open()
}
async function handlerDelete(row:MetricGroupType) {
  await metricGroupApi.fetchDelMetricGroupList({
    targetIds:[row.id],
    type:BatchOptionsType.Delete,
    values:{}
  })
  message.success('删除成功')
  pageReload()
}
function pageReload() {
  gridApi.reload();
}
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="()=>openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="openCreateModal(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
  </div>
</template>

<style scoped lang="scss">

</style>
