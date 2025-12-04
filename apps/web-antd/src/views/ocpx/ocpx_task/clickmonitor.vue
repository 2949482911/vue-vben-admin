<script lang="ts" setup name="ClickMonitor">
import {Button, List, ListItem, ListItemMeta} from "ant-design-vue";

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
    await gridApi.reload();
    gridApi.setLoading(false);
  },
});


</script>
<template>
  <Modal>
    <Grid>
      <template #callback="{ row }">
        <List item-layout="horizontal" :data-source="row.behaviorCallbackUrls">
          <template #renderItem="{ item }">
            <ListItem>
              <ListItemMeta
                :description="item.name"
              >
                <template #title>
                  <div>{{ item.url }}</div>
                </template>

              </ListItemMeta>
            </ListItem>
          </template>
        </List>
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
