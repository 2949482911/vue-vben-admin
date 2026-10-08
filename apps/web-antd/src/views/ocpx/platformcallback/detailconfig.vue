<script lang="ts" setup name="DetailConfig">
import { ref } from 'vue';

import { JsonViewer, useVbenModal } from '@vben/common-ui';

const jsonData = ref<Record<string, any>>({});

const [Modal, modalApi] = useVbenModal<Record<string, any>>({
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
    jsonData.value = modalApi.getData()!;
  },
});
</script>
<template>
  <Modal>
    <JsonViewer :value="jsonData" />
  </Modal>
</template>
