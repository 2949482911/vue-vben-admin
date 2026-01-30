<script lang="ts" setup name="ClickMonitor">
import {Button, message } from "ant-design-vue";

import {useVbenModal} from '@vben/common-ui';
import {clickMonitorApi} from "#/api/core/ocpx";
import type {ClickMonitorResponse} from "#/api/models";
import {$t} from "@vben/locales";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import TestCallback from './testcallback.vue';

const [TestCallbackModal, testCallbackApi] = useVbenModal(
  {
    connectedComponent: TestCallback,
    centered: true,
    modal: true,
  },
);


function openTestCallbackModal(row: ClickMonitorResponse) {
  testCallbackApi.setData(row)
  testCallbackApi.open();
}


const gridOptions: VxeGridProps<ClickMonitorResponse> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    {
      title: `${$t('ocpx.ocpx_task.clickmonitor.name')}`,
      field: 'name',
    },
    {
      title: `${$t('ocpx.ocpx_task.clickmonitor.url')}`,
      field: 'url',
      slots: {
        default: "url"
      }
    },
    {
      title: `${$t('ocpx.ocpx_task.clickmonitor.callback')}`,
      field: 'callback',
      slots: {
        default: "callback"
      }
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
      width: 'auto',
    },
  ],
  height: 'auto',
  // keepSource: true,
  pagerConfig: {
    enabled: false
  },
  proxyConfig: {
    enabled: false,
  }
}

const [Grid, gridApi] = useVbenVxeGrid({gridOptions});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  bordered: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    modalApi.close();
  },
  onConfirm() {
    modalApi.close();
  },
  onOpened() {

  },
  async onOpenChange(open) {
    if (!open) {
      await modalApi.close();
    }
    gridApi.setLoading(true);
    const dataList = await clickMonitorApi.fetchGenClickUrl(modalApi.getData()["taskId"])
    gridApi.setGridOptions({
      data: dataList,
    });
    // await gridApi.reload();
    gridApi.setLoading(false);
  },
});

function copyCallback(text: string) {
  if (!text) return;
  //clipboard api官方复制操作 writeText是异步Promise
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制');
  });
}


</script>
<template>
  <Modal>
    <Grid>
      <template #url="{ row }">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <Button
          type="link"
          @click="copyCallback(row.url)"
          >
            一键复制
          </Button>
        </div>
      </template>
      <template #callback="{ row }">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <Button
            v-for="item in row.behaviorCallbackUrls"
            :key="item.url"
            type="link"
            @click="copyCallback(item.url)"
          >
            {{ item.name }}
          </Button>
        </div>
      </template>
      <template #action="{ row }">
        <Button type="link" @click="openTestCallbackModal(row)">
          {{ $t('ocpx.ocpx_task.clickmonitor.testCallback') }}
        </Button>
      </template>
    </Grid>
    <TestCallbackModal/>
  </Modal>
</template>
