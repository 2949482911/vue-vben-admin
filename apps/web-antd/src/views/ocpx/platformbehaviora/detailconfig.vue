<script lang="ts" setup name="DetailConfig">
import { ref } from 'vue';

import { JsonViewer, useVbenModal } from '@vben/common-ui';

const jsonData = ref<Map<string, any>>(new Map());

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
    //@ts-ignore
    jsonData.value = modalApi.getData<Record<string, any>>();
  },
});
</script>
<template>
  <Modal>
    <JsonViewer :value="jsonData" />
  </Modal>
</template>
