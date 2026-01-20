<script lang="ts" setup name="MetricManager">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import type {MetricItem} from '#/api/models';
import {$t} from '@vben/locales';

import {Button, Switch, Tag} from 'ant-design-vue';
import {metricApi} from '#/api/core';
import {
  BatchOptionsType,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import CreateObjectRequestComp from './create.vue';
import PlatformMetricMapDetail from './platformmetricmapdetail.vue';
import { trimObject } from '#/utils/trim';

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
    range: true,
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
      field: 'implMethod', title: `${$t('marketing.metric.columns.implMethod')}`, width: "auto"
    },

    {
      field: 'isSystem', title: `${$t('marketing.metric.columns.isSystem')}`, width: "auto",
      slots: {default: 'isSystem'}
    },

    {
      field: 'isCustom', title: `${$t('marketing.metric.columns.isCustom')}`, width: "auto",
      slots: {default: 'isCustom'}
    },

    {
      field: 'calculateSort',
      title: `${$t('marketing.metric.columns.calculateSort')}`,
      width: "auto"
    },

    {
      field: 'sort', title: `${$t('marketing.metric.columns.sort')}`, width: "auto"
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

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

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
          <Button class="mr-2" type="primary" @click="()=>openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <PlatformMetricMapDetailModal/>
  </div>
</template>
