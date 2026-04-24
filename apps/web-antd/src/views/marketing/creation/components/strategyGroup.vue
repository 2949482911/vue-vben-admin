<script lang="ts" setup>
import { Button, message } from 'ant-design-vue';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { strategyGropApi, projectApi } from '#/api/core';
import type { StrategyGropType } from '#/api/models';
import { $t } from '@vben/locales';
import { BatchOptionsType, PLATFORM, TABLE_COMMON_COLUMNS } from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import CreateObjectRequestComp from './create.vue'; //新增|修改弹窗
import { VIVO_VERSION } from '../vivo/vivo';

// 组件 Props 类型定义
interface Props {
  projectId?: string;
  platform?: string;
  config?: Object;
}
const props = defineProps<Props>();
// 定义要传递给父组件的事件
const emit = defineEmits(['update:reuse']);

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
        resultField: 'items',
        api: async () => {
          return await projectApi.fetchProjectList({ page: 1, pageSize: 1000 });
        },
      },
      fieldName: 'projectId',
      label: '项目',
    },
    {
      component: 'Select',
      defaultValue: props.platform ?? 'vivo',
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
const modifiedColumns = (TABLE_COMMON_COLUMNS as any[]).map((col) => {
  if (col.field === 'status') {
    return { ...col, width: 180 };
  }
  return col;
});

const gridOptions: VxeGridProps<StrategyGropType> = {
  border: true,
  height: '500px',
  toolbarConfig: {},
  data: [],
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
    ...modifiedColumns,
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await strategyGropApi.fetchGetStrategyGrop({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

const [Modal, modalApi] = useVbenModal({});

function reuseStrategyGroup(row: StrategyGropType) {
  emit('update:reuse', row.configObj);
  modalApi.close();
}

async function deleteStrategyGroup(row: StrategyGropType) {
  const params = {
    type: BatchOptionsType.Delete,
    targetIds: [row.id],
    values: {},
  };
  await strategyGropApi.fetchBatchStrategyGrop(params);
  message.success('删除成功');
  pageReload();
}
/**
 * 创建弹窗
 */
const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(row: StrategyGropType) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({ projectId: props.projectId });
  }
  createObjectApi.open();
}
</script>
<template>
  <div>
    <Modal title="选择策略组" class="w-[73.2%]">
      <Grid>
        <template #status="{ row }">
          {{ row.version !== VIVO_VERSION ? '版本已迭代，旧版本不可用' : '最新版本' }}
        </template>
        <template #action="{ row }">
          <Button
            type="link"
            @click="openCreateModal(row)"
            :disabled="row.version !== VIVO_VERSION"
          >
            {{ $t('common.edit') }}
          </Button>
          <Button
            type="link"
            @click="reuseStrategyGroup(row)"
            :disabled="row.version !== VIVO_VERSION"
          >
            复用
          </Button>
          <Button type="link" danger @click="deleteStrategyGroup(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <!-- <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template> -->
      </Grid>
    </Modal>
    <CreateObjectModal
      @page-reload="pageReload"
      :config="props.config"
      :projectId="props.projectId"
      :plaform="props.platform"
    />
  </div>
</template>

<style></style>
