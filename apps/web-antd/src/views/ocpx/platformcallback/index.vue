<script lang="ts" setup name="PlatformCallbackManager">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import type {PlatformcallbackItem,} from '#/api/models';
import {$t} from '@vben/locales';

import {Button, Switch, Tag} from 'ant-design-vue';
import {platformCallbackApi} from '#/api/core/ocpx';
import {
  BatchOptionsType,
  BACKHAUL,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import CreateObjectRequestComp from './create.vue';
import DetailConfig from './detailconfig.vue';

// config detail
const [DetailConfigModel, detailConfigModalApi] = useVbenModal({
  connectedComponent: DetailConfig,
});

function openDetailConfig(row: PlatformcallbackItem) {
  detailConfigModalApi.setData(row.config);
  detailConfigModalApi.open();
}

const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(
  row?: PlatformcallbackItem
) {
  if (row?.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

async function handlerState(row: PlatformcallbackItem) {
  await (row.status == 1
    ? platformCallbackApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>(),
    })
    : platformCallbackApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>(),
    }));
  pageReload();
}

async function handlerDelete(row: PlatformcallbackItem) {
  await platformCallbackApi.fetchBatchOptions({
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
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: BACKHAUL,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('ocpx.platformcallback.columns.name')}`,
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: 'Date',
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

const gridOptions: VxeGridProps<PlatformcallbackItem> = {
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
      field: 'platform',
      title: `${$t('ocpx.platformcallback.columns.platform')}`,
      width: "auto"
    },
    {
      field: 'name', title: `${$t('ocpx.platformcallback.columns.name')}`, width: "auto"
    },
    {
      field: 'advertiserId',
      title: `${$t('ocpx.platformcallback.columns.advertiserId')}`,
      width: "auto"
    },
    {
      field: 'advertiserName',
      title: `${$t('ocpx.platformcallback.columns.advertiserName')}`,
      width: "auto"
    },

    {
      field: 'ratio',
      title: `${$t('ocpx.platformcallback.columns.ratio')}`,
      width: "auto"
    },

    {
      field: 'behaviorType',
      title: `${$t('ocpx.platformcallback.columns.behaviorType')}`,
      width: "auto",
      slots: {default: 'behaviorType'}
    },

    {
      field: 'onlyClick',
      title: `${$t('ocpx.platformcallback.columns.onlyClick')}`,
      width: "auto",
      slots: {default: 'onlyClick'}
    },
    {
      field: 'hadClick',
      title: `${$t('ocpx.platformcallback.columns.hadClick')}`,
      width: "auto",
      slots: {default: 'hadClick'}
    },

    {
      field: 'config',
      title: `${$t('ocpx.platformcallback.columns.config')}`,
      slots: {default: 'config'},
      width: "auto"
    },
    {
      field: 'remark', title: `${$t('ocpx.platformcallback.columns.remark')}`,
      width: "auto"
    },

    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await platformCallbackApi.fetchPlatformcallbackList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args,
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

        <template #hadClick="{row}">
          <Tag color="green" v-if="row.hadClick">
            {{ $t('common.yes') }}
          </Tag>
          <Tag v-else color="red">{{ $t('common.no') }}</Tag>
        </template>

        <template #onlyClick="{row}">
          <Tag color="green" v-if="row.onlyClick">
            {{ $t('common.yes') }}
          </Tag>
          <Tag v-else color="red">{{ $t('common.no') }}</Tag>
        </template>

        <template #behaviorType="{row}">
          <Tag color="green" v-if="row.behaviorTypeMoel === 'auto'">
            {{ $t('ocpx.platformcallback.auto') }}
          </Tag>
          <Tag v-else color="red">{{ row.behaviorTypeName }}</Tag>
        </template>
        <template #config="{ row }">
          <Button type="link" @click="openDetailConfig(row)">
            {{ $t('common.detail') }}
          </Button>
        </template>
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
          <Button class="mr-2" type="primary" @click="()=>openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <DetailConfigModel/>
  </div>
</template>
