<script setup lang="ts" name="AuthAccount">
import {useVbenModal} from '@vben/common-ui';
import {useVbenForm} from '#/adapter/form';
import {$t} from "@vben/locales";
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {advertiserReportApi} from "#/api/core";
import {onMounted, reactive, ref} from "vue";
import {Tag, Switch} from 'ant-design-vue';
import { trimObject } from '#/utils/trim';
import {
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import type {HistoryItem} from '#/api/models';
const params = ref({})

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await modalApi.close();
  },

  async onConfirm() {
    await modalApi.close();
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      params.value.platform = data.platform
      params.value.localAdvertiserId = data.id
      
    }
  }
});
const gridOptions: VxeGridProps<HistoryItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
    // reserve: true,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'source',
      title: `${$t('marketing.advertiser.history.columns.source')}`,
      width: 'auto',
    },
    {
      field: 'retry',
      title: `${$t('marketing.advertiser.history.columns.retry')}`,
      width: 'auto',
    },
    {
      field: 'taskType',
      title: `${$t('marketing.advertiser.history.columns.taskType')}`,
      width: 'auto',
    },
    {
      field: 'taskStatus',
      title: `${$t('marketing.advertiser.history.columns.taskStatus')}`,
      width: 'auto',
      slots:{
        default:'taskStatus'
      }
    },
    {
      field: 'taskStartTime',
      title: `${$t('marketing.advertiser.history.columns.taskStartTime')}`,
      formatter: 'formatDateTime',
      width: 'auto',
    },
    {
      field: 'taskEndTime',
      title: `${$t('marketing.advertiser.history.columns.taskEndTime')}`,
      formatter: 'formatDateTime',
      width: 'auto',
    },
    {
      field: 'startTime',
      title: `${$t('marketing.advertiser.history.columns.startTime')}`,
      formatter: 'formatDateTime',
      width: 'auto',
    },
    {
      field: 'endTime',
      title: `${$t('marketing.advertiser.history.columns.endTime')}`,
      formatter: 'formatDateTime',
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any,
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await advertiserReportApi.fetchHistoryList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params.value
        });
      },
    },
  },
};
const [Grid, gridApi] = useVbenVxeGrid({gridOptions});
</script>

<template>
  <div>
    <Modal class="w-[70%]">
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1"/>
        </template>
        <template #taskStatus="{ row }">
          <Tag v-if="row.taskStatus === 0" color="orange">{{ $t('common.pending') }}</Tag>
          <Tag v-if="row.taskStatus === 1" color="blue">{{ $t('common.processing') }}</Tag>
          <Tag v-if="row.taskStatus === 2" color="green">{{ $t('common.completed') }}</Tag>
          <Tag v-if="row.taskStatus === 3" color="red">{{ $t('common.failed') }}</Tag>
        </template>
      </Grid>
    </Modal>
  </div>
</template>

<style scoped>

</style>
