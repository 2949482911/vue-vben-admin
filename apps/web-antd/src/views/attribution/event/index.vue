<script lang="ts" setup name="AttributionEvents">
import { useVbenDrawer, type VbenFormProps } from '@vben/common-ui';
import { Page } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { EventConfigItem } from '#/api/models/attribution';
import { $t } from '@vben/locales';

import { Button, Switch, Tag } from 'ant-design-vue';
import { eventConfigApi } from '#/api/core/attribution';
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from '#/constants/locales';

import CreateEvent from './create.vue';
import { trimObject } from '#/utils/trim';
import { getEventCategoryLabel, getEventTypeLabel, EVENT_TYPE_OPTIONS, EVENT_CATEGORY_OPTIONS } from './enums';

const [CreateEventDrawer, createEventApi] = useVbenDrawer({
  connectedComponent: CreateEvent,
});

function openCreateDrawer(row?: EventConfigItem) {
  if (row?.id) {
    createEventApi.setData(row);
  } else {
    createEventApi.setData({});
  }
  createEventApi.open();
}

/** 状态切换 */
async function handlerState(row: EventConfigItem) {
  await eventConfigApi.fetchBatchOptions({
    targetIds: [row.id],
    type: row.status === 1 ? BatchOptionsType.DISABLE : BatchOptionsType.Enable,
    values: {},
  });
  pageReload();
}

/** 删除 */
async function handlerDelete(row: EventConfigItem) {
  await eventConfigApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: {},
  });
  pageReload();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'eventName',
      label: `${$t('attribution.eventConfig.eventName')}`,
    },
    {
      component: 'Input',
      fieldName: 'eventDisplayName',
      label: `${$t('attribution.eventConfig.eventDisplayName')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: EVENT_TYPE_OPTIONS,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'eventType',
      label: `${$t('attribution.eventConfig.eventType')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: EVENT_CATEGORY_OPTIONS,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'eventCategory',
      label: `${$t('attribution.eventConfig.eventCategory')}`,
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<EventConfigItem> = {
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
      field: 'eventName',
      title: `${$t('attribution.eventConfig.eventName')}`,
      width: 'auto',
    },
    {
      field: 'eventDisplayName',
      title: `${$t('attribution.eventConfig.eventDisplayName')}`,
      width: 'auto',
    },
    {
      field: 'eventType',
      title: `${$t('attribution.eventConfig.eventType')}`,
      width: 'auto',
      slots: { default: 'eventType' },
    },
    {
      field: 'eventCategory',
      title: `${$t('attribution.eventConfig.eventCategory')}`,
           width: 'auto',
      slots: { default: 'eventCategory' },
    },
    {
      field: 'eventValueType',
      title: `${$t('attribution.eventConfig.eventValueType')}`,
      width: 'auto',
    },
    {
      field: 'isCallbackEvent',
      title: `${$t('attribution.eventConfig.isCallbackEvent')}`,
      width: 'auto',
      slots: { default: 'isCallbackEvent' },
    },
    {
      field: 'isAttributionEvent',
      title: `${$t('attribution.eventConfig.isAttributionEvent')}`,
      width: 'auto',
      slots: { default: 'isAttributionEvent' },
    },
    {
      field: 'isSystem',
      title: `${$t('attribution.eventConfig.isSystem')}`,
      width: 'auto',
      slots: { default: 'isSystem' },
    },
    {
      field: 'sortOrder',
      title: `${$t('attribution.eventConfig.sortOrder')}`,
      width: 'auto',
    },
    {
      field: 'attributeIds',
      title: `${$t('attribution.eventConfig.attributeIds')}`,
      width: 'auto',
      formatter: ({ cellValue }) => (cellValue as any[])?.length ?? 0,
    },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await eventConfigApi.fetchGetEventConfigList({
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
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #action="{ row }">
          <Button type="link" @click="openCreateDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>

        <template #eventType="{ row }">
          <Tag>{{ getEventTypeLabel(row.eventType) }}</Tag>
        </template>

        <template #eventCategory="{ row }">
          <Tag color="blue">{{ getEventCategoryLabel(row.eventCategory) }}</Tag>
        </template>

        <template #isCallbackEvent="{ row }">
          <Tag :color="row.isCallbackEvent ? 'green' : 'default'">
            {{ row.isCallbackEvent ? $t('common.yes') : $t('common.no') }}
          </Tag>
        </template>

        <template #isAttributionEvent="{ row }">
          <Tag :color="row.isAttributionEvent ? 'purple' : 'default'">
            {{ row.isAttributionEvent ? $t('common.yes') : $t('common.no') }}
          </Tag>
        </template>

        <template #isSystem="{ row }">
          <Tag :color="row.isSystem ? 'orange' : 'default'">
            {{ row.isSystem ? $t('common.yes') : $t('common.no') }}
          </Tag>
        </template>

        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)" />
        </template>

        <template #toolbar-tools>
          <Button type="primary" @click="() => openCreateDrawer()">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>

    <CreateEventDrawer @page-reload="pageReload" />
  </div>
</template>
