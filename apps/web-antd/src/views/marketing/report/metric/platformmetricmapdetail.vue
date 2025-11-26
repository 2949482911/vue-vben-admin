<script lang="ts" setup name="PlatformMetricMapDetail">
import {ref} from 'vue';

import {JsonViewer, useVbenModal} from '@vben/common-ui';

const jsonData = ref<Record<string, any>>({});

const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
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
    jsonData.value = modalApi.getData<Record<string, any>>();
  },
});
</script>
<template>
  <Modal>
    <JsonViewer :value="jsonData"/>
  </Modal>
</template>
