<script lang="ts" setup name="MetricManager">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import type {MetricItem} from '#/api/models';
import {$t} from '@vben/locales';

import {Button, message, Switch, Tag} from 'ant-design-vue';
import {metricApi, metricGroupApi} from '#/api/core';
import {
  BatchOptionsType,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import CreateObjectRequestComp from './create.vue';
import PlatformMetricMapDetail from './platformmetricmapdetail.vue';
import { trimObject } from '#/utils/trim';
import { ref } from 'vue'
import type {BatchOptions} from "#/api/models/core";
const selectedRows = ref<MetricItem[]>([])
const [PlatformMetricMapDetailModal, platformMetricMapDetailApi] = useVbenModal({
  connectedComponent: PlatformMetricMapDetail,
});


function openPlatformMetricMapDetailModal(row: MetricItem) {
  platformMetricMapDetailApi.setData(row.platformMetricMap);
  platformMetricMapDetailApi.open();
}


const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(
  row?: MetricItem
) {
  if (row?.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

async function handlerState(row: MetricItem) {
  await (row.status == 1
    ? metricApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>(),
    })
    : metricApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>(),
    }));
  pageReload();
}

async function handlerDelete(row: MetricItem) {
  await metricApi.fetchBatchOptions({
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

const gridOptions: VxeGridProps<MetricItem> = {
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
      field: 'ename', title: `${$t('marketing.metric.columns.ename')}`, width: "auto"
    },
    {
      field: 'cname', title: `${$t('marketing.metric.columns.cname')}`, width: "auto"
    },

    {
      field: 'description', title: `${$t('marketing.metric.columns.description')}`, width: "auto"
    },

    {
      field: 'metricType', title: `${$t('marketing.metric.columns.metricType')}`, width: "auto",
      slots: {default: 'metricType'}
    },

    {
      field: 'formula', title: `${$t('marketing.metric.columns.formula')}`, width: "auto"
    },

    {
      field: 'calculateLogic',
      title: `${$t('marketing.metric.columns.calculateLogic')}`,
      width: "auto"
    },

    {
      field: 'platformMetricMap',
      title: `${$t('marketing.metric.columns.platformMetricMap')}`,
      width: "auto",
      slots: {default: 'config'},
    },

    {
      field: 'implMethod', 
      title: `${$t('marketing.metric.columns.implMethod')}`, 
      width: "auto"
    },

    {
      field: 'isSystem', title: `${$t('marketing.metric.columns.isSystem')}`, 
      width: "auto",
      slots: {default: 'isSystem'}
    },

    {
      field: 'isCustom', title: `${$t('marketing.metric.columns.isCustom')}`, 
      width: "auto",
      slots: {default: 'isCustom'}
    },

    {
      field: 'calculateSort',
      title: `${$t('marketing.metric.columns.calculateSort')}`,
      width: "auto"
    },

    {
      field: 'sort', 
      title: `${$t('marketing.metric.columns.sort')}`, 
      width: "auto"
    },
    {
      field: 'metricGroupName', 
      title: `${$t('marketing.metric.columns.metricGroupName')}`, 
      width: "auto",
      slots: {default: 'metricGroup'}
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
        return await metricApi.fetchSystemMetricList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};
const gridEvents = {
  checkboxChange: ({records}:{records:MetricItem[]}) => {
    selectedRows.value = records
  },
  //全选事件
  checkboxAll:({records}:{records:MetricItem[]})=>{
    selectedRows.value = records
  },
    //当分页时也需要置灰批量操作按钮
  proxyQuery:({})=>{
    selectedRows.value = []
  }
}
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions, gridEvents});

function pageReload() {
  gridApi.reload();
}
const [BindModal, bindModalApi] = useVbenModal({
  title:'批量绑定指标类目',
  centered: true,
  async onConfirm() {
    const result = await bindFormApi.validate();
    if (!result.valid) return;
    try {
      await bindFormApi.submitForm();
      message.success('绑定成功')
      pageReload();
      await bindModalApi.close();
    } catch (error) {
      console.error('提交失败', error);
    }
  },
});
const [BindForm,bindFormApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const result = await bindFormApi.validate();
    if (!result.valid) throw new Error('表单验证失败');
    const targetIds = selectedRows.value.map(item => item.id)
    const type = 'update_metric_group'
    const formValues = { ...formVal };
    const values = trimObject(formValues);
    await metricApi.fetchBatchOptions({
      targetIds,
      type,
      values
    } as BatchOptions)
  },
  schema: [
    {
      component: "ApiSelect",
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          size: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: "items",
        api: async (params: any) => {
          return await metricGroupApi.fetchGetMetricGroupList(params);
        }
      },
      fieldName: 'metricGroupId',
      label: `指标类目`,
      rules: 'required'
    }
  ]
})
async function batchBindMetricGroup() {
  if(selectedRows.value.length === 0) {
    message.warning('请先勾选要绑定的数据')
    return
  }
  bindModalApi.open()
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

        <template #metricType="{row}">
          <Tag color="red" v-if="row.metricType === 1"> {{
              $t('marketing.metric.metricType.atomic')
            }}
          </Tag>
          <Tag color="green" v-else-if="row.metricType === 2">
            {{ $t('marketing.metric.metricType.derive') }}
          </Tag>
          <Tag color="green" v-else-if="row.metricType === 3">
            {{ $t('marketing.metric.metricType.eventMetric') }}
          </Tag>
          <Tag color="orange" v-else>
            {{ $t('marketing.metric.metricType.platformMetric') }} - {{row.platform}}
          </Tag>
        </template>

        <template #isSystem="{row}">
          <Tag color="green" v-if="row.isSystem">{{ $t('common.yes') }}</Tag>
          <Tag v-else color="red">{{ $t('common.no') }}</Tag>
        </template>

        <template #metricGroup="{row}">
          <Tag color="green">{{ row.metricGroupName }}</Tag>
        </template>

        <template #isCustom="{row}">
          <Tag color="green" v-if="row.isCustom">{{ $t('common.yes') }}</Tag>
          <Tag v-else color="red">{{ $t('common.no') }}</Tag>
        </template>


        <template #config="{row}">
          <Button type="link" @click="openPlatformMetricMapDetailModal(row)">
            {{ $t('common.detail') }}
          </Button>
        </template>

        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="batchBindMetricGroup">
            类目绑定
          </Button>
          <Button class="mr-2" type="primary" @click="()=>openCreateModal()">
            {{ $t('common.create') }}
          </Button>

        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <PlatformMetricMapDetailModal/>
    <BindModal><BindForm/></BindModal>
  </div>
</template>
