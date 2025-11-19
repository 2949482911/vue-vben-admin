<script lang="ts" setup name="PlatformCallbackManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {NoticeItem, OcpxTaskItem} from '#/api/models';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Dropdown, Menu, MenuItem, Switch, Tag} from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {ocpxTaskApi} from '#/api/core/ocpx';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import Behavioracallbackrecordlist from './behavioracallbackrecordlist.vue';
import BehaviorRecordList from './behaviorrecordlist.vue';
import ClickMonitor from './clickmonitor.vue';
import CreateObjectRequestComp from './create.vue';

const [ClickMonitorModal, clickMonitorApi] = useVbenModal({
  connectedComponent: ClickMonitor,
  centered: true,
  modal: true,
});

// 转化回调事件列表
const [BehavioracallbackrecordModel, behavioracallbackrecordApi] = useVbenModal(
  {
    connectedComponent: Behavioracallbackrecordlist,
    centered: true,
    modal: true,
  },
);

function openClickMonitor(row: OcpxTaskItem) {
  clickMonitorApi.setData({taskId: row.id});
  clickMonitorApi.open();
}

function openBehavioracallbackrecord(row: OcpxTaskItem) {
  behavioracallbackrecordApi.setData({taskId: row.id});
  behavioracallbackrecordApi.open();
}

// =================

// 转化请求事件列表
const [BehaviorRecordModel, behaviorRecordApi] = useVbenModal({
  connectedComponent: BehaviorRecordList,
  centered: true,
  modal: true,
});

function openBehaviorRecord(row: OcpxTaskItem) {
  behaviorRecordApi.setData({taskId: row.id});
  behaviorRecordApi.open();
}

const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(row: OcpxTaskItem) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

async function handlerState(row: NoticeItem) {
  await (row.status === 1
    ? ocpxTaskApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>(),
    })
    : ocpxTaskApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>(),
    }));
  pageReload();
}

/**
 * delete ocpx task
 * @param row
 */
async function handlerDelete(row: OcpxTaskItem) {
  await ocpxTaskApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>(),
  });
  await gridApi.reload();
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

const gridOptions: VxeGridProps<OcpxTaskItem> = {
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
    {
      field: 'platform',
      title: `${$t('ocpx.ocpx_task.columns.platform')}`,
      width: 'auto',
    },
    {
      field: 'name',
      title: `${$t('ocpx.ocpx_task.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'taskState',
      title: `${$t('ocpx.ocpx_task.columns.taskState')}`,
      slots: {default: 'taskState'},
      width: 'auto',
    },
    {
      field: 'hadClick',
      title: `${$t('ocpx.ocpx_task.columns.hadClick')}`,
      slots: {default: 'hadClick'},
      width: 'auto',
    },
    {
      field: 'clickRangeDay',
      title: `${$t('ocpx.ocpx_task.columns.clickRangeDay')}`,
      width: 'auto',
    },
    {
      field: 'description',
      title: `${$t('ocpx.ocpx_task.columns.description')}`,
      width: 'auto',
      maxWidth: "200",
      showFooterOverflow: "tooltip"
    },

    ...TABLE_COMMON_COLUMNS,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await ocpxTaskApi.fetchOcpxTaskList({
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
        <template #taskState="{ row }">
          <Tag color="green">
            {{
              STATUS_SELECT.filter((x) => x.value === row.taskState)[0].label
            }}
          </Tag>
        </template>

        <template #hadClick="{row}">
          <Tag color="green" v-if="row.hadClick">{{ $t('core.had') }}</Tag>
          <Tag v-else color="red">{{ $t('core.empty') }}</Tag>
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

          <Dropdown>
            <Button type="link">
              {{ $t('core.more') }}
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem @click="openClickMonitor(row)">
                  {{ $t('core.clickmonitor') }}
                </MenuItem>
                <MenuItem @click="openBehavioracallbackrecord(row)">
                  {{ $t('core.behavioracallbackrecord') }}
                </MenuItem>
                <MenuItem @click="openBehaviorRecord(row)">
                  {{ $t('core.behaviorRecord') }}
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openCreateModal">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <ClickMonitorModal/>
    <BehavioracallbackrecordModel/>
    <BehaviorRecordModel/>
  </div>
</template>
