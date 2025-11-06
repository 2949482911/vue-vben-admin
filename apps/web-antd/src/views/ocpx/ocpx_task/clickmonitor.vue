<script lang="ts" setup name="ClickMonitor">
import {ref} from 'vue';
import {Table, Card} from "ant-design-vue";

import {useVbenModal} from '@vben/common-ui';
import {clickMonitorApi} from "#/api/core/ocpx";
import type {ClickMonitorResponse} from "#/api/models";
import {$t} from "@vben/locales";

const clickMonitor = ref<Array<ClickMonitorResponse>>([]);
const columns = [
  {
    title: `${$t('ocpx.ocpx_task.clickmonitor.name')}`,
    dataIndex: 'name',
    label: 'Name'
  },
  {
    title: `${$t('ocpx.ocpx_task.clickmonitor.url')}`,
    dataIndex: 'url',
    label: 'Url'
  },
]


const [Modal, modalApi] = useVbenModal({
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
    clickMonitor.value = await clickMonitorApi.fetchGenClickUrl(modalApi.getData()["taskId"])
  },
});
</script>
<template>
  <Modal>
    <Card>
      <Table :columns="columns" :data-source="clickMonitor">

      </Table>
    </Card>
  </Modal>
</template>
