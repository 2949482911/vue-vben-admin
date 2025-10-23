<script lang="ts" setup name="ClickMonitor">
import {ref} from 'vue';
import {Textarea} from "ant-design-vue";

import {useVbenModal} from '@vben/common-ui';
import {clickMonitorApi} from "#/api/core/ocpx";
import type {ClickMonitorResponse} from "#/api/models";

const clickMonitor = ref<ClickMonitorResponse>({});

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
    <Textarea :value="clickMonitor.url" readonly :rows="6"></Textarea>
  </Modal>
</template>
