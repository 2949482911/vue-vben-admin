<script lang="ts" setup name="AccountManager">

import type {VxeGridProps, VxeGridListeners} from '#/adapter/vxe-table';
import type {DownloadCenterItem} from '#/api/models/tools';

import { Page} from '@vben/common-ui';
import {$t} from '@vben/locales';

import { Switch } from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {downloadCenterApi} from '#/api/core/tools';
import {
  TASK_STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { trimObject } from '#/utils/trim';
const gridOptions: VxeGridProps<DownloadCenterItem> = {
  columns: [
    {
      field: 'name',
      title: `${$t('tools.downcenter.columns.name')}`,
      width: 'auto',
    },
    {
      field: 'type',
      title: `${$t('tools.downcenter.columns.type')}`,
      width: 'auto',
    },
    {
      field: 'downloadUrl',
      title: `${$t('tools.downcenter.columns.downloadUrl')}`,
      slots: {default: 'downloadUrl'},
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
         const params = trimObject(args);
        return await downloadCenterApi.fetchDownloadList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  pagerConfig: {
    enabled: true,
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
};
const gridEvents: VxeGridListeners<DownloadCenterItem> = {
  cellClick: ({ row }) => {
    
  },
};
const [Grid, gridApi] = useVbenVxeGrid({gridEvents, gridOptions});

</script>

<template>
  <div>
    <Page>
      <Grid>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" />
        </template>
        <template #downloadUrl="{ row }">
           <a class="downloadLink" :href="row.downloadUrl" :download="row.name">{{row.downloadUrl}}</a>
        </template>
      </Grid>
    </Page>
  </div>
</template>
<style lang="scss" scoped>
.downloadLink {
  color: hsl(var(--primary));
  cursor:pointer;
}
</style>
