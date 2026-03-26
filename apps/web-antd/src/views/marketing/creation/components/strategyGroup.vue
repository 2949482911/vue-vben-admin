<script lang="ts" setup>
import { useVbenForm } from '#/adapter/form';
import { Switch, Button, message } from 'ant-design-vue';
import {Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';
import { ref, reactive } from 'vue';
import type { FolderItem } from '#/api/models';
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { getFileMeta } from '#/utils/fileMeta';
import { uploadToOss } from '#/utils/uploadToOss';
import { strategyGropApi, projectApi } from '#/api/core';
import type {StrategyGropType,UpdateStrategyGropType} from "#/api/models";
import {$t} from "@vben/locales";
import type {
  VivoCreation
} from "#/views/marketing/creation/vivo/vivo";
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import CreateObjectRequestComp from './create.vue';//新增|修改弹窗
// 组件 Props 类型定义
interface Props {
  projectId?: string
  platform?: string 
  config?: Object
}
const props = defineProps<Props>();
// 定义要传递给父组件的事件
const emit = defineEmits<{
  (e: 'reuse', configData: {}): void
}>()

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
    },
    {
      component: 'ApiSelect',
      defaultValue: props.projectId,
      componentProps: {
        valueField: 'id',
        labelField: 'name',
        resultField: "items",
        api: async (params: any) => {
          return await projectApi.fetchProjectList({page: 1, pageSize: 1000,})
        }
      },
      fieldName: 'projectId',
      label: '项目',
    },
    {
      component: 'Select',
      defaultValue: props.platform??'vivo',
      componentProps: {
        allowClear: true,
        options: PLATFORM,
        placeholder: `${$t('common.choice')}`,
        disabled: true,
      },
      fieldName: 'platform',
      label: '平台',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};
const gridOptions: VxeGridProps<StrategyGropType> = {
  border: true,
  toolbarConfig: {},
  data:[],
  columns: [
    {
      field: 'name',
      title: `名称`,
      width: 'auto',
    },
    {
      field: 'platform',
      title: `平台`,
      width: 'auto',
    },
    {
      field: 'projectName',
      title: `项目`,
      width: 'auto',
    },
    {
      field: 'config',
      title: `配置地址`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any,
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await strategyGropApi.fetchGetStrategyGrop({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  }
};
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.reload();
}

function handlerState(row: StrategyGropType) {
  // 这里可以添加状态切换的逻辑
  console.log('切换状态:', row);
}
const [Modal, modalApi] = useVbenModal({
  async onOpenChange(open: boolean) {
  }
});
function reuseStrategyGroup(row:StrategyGropType) {
    emit('reuse', row.configObj)
    modalApi.close();
}
async function deleteStrategyGroup(row:StrategyGropType) {
  const params = {
    type: BatchOptionsType.Delete,
    targetIds: [row.id],
    values: {}
  }
  await strategyGropApi.fetchBatchStrategyGrop(params)
  message.success("删除成功")
  pageReload()
}
/**
 * 创建弹窗
 */
const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(row?: StrategyGropType) {
  if (row?.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({projectId:props.projectId});
  }
  createObjectApi.open();
}
</script>
<template>
  <div>
    <Modal title="选择策略组" class="w-[85%]">
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="openCreateModal(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="reuseStrategyGroup(row)">
            复用
          </Button>
          <Button type="link" @click="deleteStrategyGroup(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Modal>
    <CreateObjectModal 
      @page-reload="pageReload" 
      :config="props.config" 
      :projectId="props.projectId" 
      :plaform="props.platform"/>
  </div>

</template>

<style>

</style>
