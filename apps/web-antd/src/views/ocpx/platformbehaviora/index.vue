<script lang="ts" setup name="PlatformCallbackManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {BehavioraPlatformItem} from '#/api/models';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch, Tag} from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {behavioraPlatformApi} from '#/api/core/ocpx';
import {
  BatchOptionsType,
  BEHAVIORA_PLATFORM,
  MatchFieldSelect,
  ModelSelect,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import CreateObjectRequestComp from './create.vue';
import DetailConfig from './detailconfig.vue';

// config detail
const [DetailConfigModel, detailConfigModalApi] = useVbenModal({
  connectedComponent: DetailConfig,
});

function openDetailConfig(row: BehavioraPlatformItem) {
  detailConfigModalApi.setData(row.config);
  detailConfigModalApi.open();
}

const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(row: BehavioraPlatformItem) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

async function handlerState(row: BehavioraPlatformItem) {
  await (row.status === 1
    ? behavioraPlatformApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>(),
    })
    : behavioraPlatformApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>(),
    }));
  pageReload();
}

async function handlerDelete(row: BehavioraPlatformItem) {
  await behavioraPlatformApi.fetchBatchOptions({
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
        options: BEHAVIORA_PLATFORM,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('ocpx.behavioraplatform.columns.name')}`,
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

const gridOptions: VxeGridProps<BehavioraPlatformItem> = {
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
    search: true,
    zoom: true,
  },
  columns: [
    {
      field: 'platform',
      title: `${$t('ocpx.behavioraplatform.columns.platform')}`,
      width: 'auto',
    },
    {
      field: 'name',
      title: `${$t('ocpx.behavioraplatform.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'model',
      title: `${$t('ocpx.behavioraplatform.columns.model')}`,
      width: 'auto',
      slots: {
        default: 'model',
      },
    },
    {
      field: 'matchField',
      title: `${$t('ocpx.behavioraplatform.columns.matchField')}`,
      width: 'auto',
      slots: {
        default: 'matchField',
      },
    },
    {
      field: 'simulate',
      title: `${$t('ocpx.behavioraplatform.columns.simulate')}`,
      width: 'auto',
      slots: {
        default: 'simulate',
      },
    },
    {
      field: 'type',
      title: `${$t('ocpx.behavioraplatform.columns.type')}`,
      width: 'auto',
      slots: {
        default: 'type',
      },
    },
    {
      field: 'config',
      title: `${$t('ocpx.behavioraplatform.columns.config')}`,
      slots: {default: 'config'},
      width: 'auto',
    },
    {
      field: 'remark',
      title: `${$t('ocpx.behavioraplatform.columns.remark')}`,
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await behavioraPlatformApi.fetchBehavioraPlatformList({
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
        <template #model="{ row }">
          <Tag color="red">
            {{ ModelSelect.filter((x) => x.value === row.model)[0].label }}
          </Tag>
        </template>

        <template #type="{ row }">
          <Tag color="green" v-if="row.type === 1">
            {{ $t('ocpx.behavioraplatform.type.callback') }}
          </Tag>
          <Tag color="red" v-else> {{  $t('ocpx.behavioraplatform.type.direct_link') }}</Tag>
        </template>


        <template #simulate="{ row }">
          <Tag color="green" v-if="row.simulate">
            {{ $t('common.yes') }}
          </Tag>
          <Tag color="red" v-else> {{ $t('common.no') }}</Tag>
        </template>

        <template #matchField="{ row }">
          <Tag color="orange">
            {{
              MatchFieldSelect.filter((x) => x.value === row.matchField)[0]
                .label
            }}
          </Tag>
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
          <Button class="mr-2" type="primary" @click="openCreateModal">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <DetailConfigModel/>
  </div>
</template>
