<script lang="ts" setup name="PlatformCallbackManager">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import type {
  CreateRoleRequest,
  NoticeItem,
  PlatformcallbackItem,
  UpdateRoleRequest,
} from '#/api/models';
import {$t} from '@vben/locales';

import {Button, Switch, Tag} from 'ant-design-vue';
import {behavioraPlatformApi} from '#/api/core/ocpx';
import {
  BatchOptionsType, MatchFieldSelect, ModelSelect,
  PLATFORM, ROLE_TYPE_OPTIONS,
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
    row: CreateRoleRequest | PlatformcallbackItem | UpdateRoleRequest,
) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

async function handlerState(row: NoticeItem) {
  // await (row.status == 1
  //   ? noticeApi.fetchBatchOptions({
  //     targetIds: [row.id],
  //     type: BatchOptionsType.DISABLE,
  //   })
  //   : noticeApi.fetchBatchOptions({
  //     targetIds: [row.id],
  //     type: BatchOptionsType.Enable,
  //   }));
  pageReload();
}

async function handlerDelete(row: NoticeItem) {
  await noticeApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: PLATFORM,
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

const gridOptions: VxeGridProps<PlatformcallbackItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true,
  },
  columns: [
    {title: '序号', type: 'seq', type: 'checkbox', width: 'auto'},
    {
      field: 'platform',
      title: `${$t('ocpx.behavioraplatform.columns.platform')}`,
      width: "auto"
    },
    {
      field: 'name',
      title: `${$t('ocpx.behavioraplatform.columns.name')}`,
      width: "auto"
    },
    {
      field: 'model',
      title: `${$t('ocpx.behavioraplatform.columns.model')}`,
      width: "auto",
      slots: {
        default: 'model'
      }
    },
    {
      field: 'matchField',
      title: `${$t('ocpx.behavioraplatform.columns.matchField')}`,
      width: "auto",
      slots: {
        default: 'matchField'
      }
    },
    {
      field: 'config',
      title: `${$t('ocpx.behavioraplatform.columns.config')}`,
      slots: {default: 'config'},
      width: "auto"
    },
    {
      field: 'remark',
      title: `${$t('ocpx.behavioraplatform.columns.remark')}`,
      width: "auto"
    },
    ...TABLE_COMMON_COLUMNS
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
            {{
              ModelSelect.filter((x) => x.value == row.model)[0].label
            }}
          </Tag>
        </template>


        <template #matchField="{ row }">
          <Tag color="orange">
            {{
              MatchFieldSelect.filter((x) => x.value == row.matchField)[0].label
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
