<script setup lang="ts" name="TestCallbackModal">
import {useVbenModal} from '@vben/common-ui';

import {ref} from 'vue';
import type {ClickMonitorResponse} from "#/api/models";
import {clickMonitorApi, platformCallbackApi} from "#/api";
import {useVbenForm} from "#/adapter/form";
import {$t} from "@vben/locales";


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (form) => {
    await clickMonitorApi.fetchTestCallback({
      ocpxTaskId: clickMonitor.value.ocpxTaskId,
      platformCallbackId: clickMonitor.value.platformCallbackId,
      behaviorType: form.behaviorType,
    })
  },
  schema: [
    {
      component: 'ApiSelect',
      // 字段名
      fieldName: 'behaviorType',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.behaviorType')}`,
      componentProps: {
        placeholder: `${$t('common.select')}`,
        api: async () => {
          return await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(
            clickMonitor.value.platform
          );
        },
        valueField: 'value',
        labelField: 'label',
      },
      rules: 'required',
    },
  ],
});


const clickMonitor = ref<ClickMonitorResponse>({
  name: "",
  ocpxTaskId: "",
  platformCallbackId: "",
  url: "",
  platform: ""
});

/**
 * 联调回传
 */
async function testCallback(behaviorType: string) {
  await clickMonitorApi.fetchTestCallback({
    ocpxTaskId: clickMonitor.value.ocpxTaskId,
    platformCallbackId: clickMonitor.value.platformCallbackId,
    behaviorType: behaviorType,
  })
}

const [Modal, modalApi] = useVbenModal({
  bordered: false,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate()
    if (!result.valid) {
      return;
    }
    await formApi.submitForm()
    await modalApi.close();
  },
  onOpened() {

  },
  async onOpenChange(open) {
    if (!open) {
      await modalApi.close();
    }
    clickMonitor.value = modalApi.getData();
  },
});


</script>

<template>
  <Modal>
    <Form></Form>
  </Modal>
</template>

<style scoped>

</style>
