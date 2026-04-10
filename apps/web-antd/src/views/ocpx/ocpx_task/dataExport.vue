<script lang="ts" setup name="CreateOcpxTask">
import type {OcpxTaskItem, OcpxExportEventClickRequest,} from '#/api/models';

import {ref} from 'vue';
import { message } from 'ant-design-vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {useVbenForm} from '#/adapter/form';
import {behavioraPlatformApi, ocpxTaskApi, platformCallbackApi} from '#/api/core/ocpx';
import {PLATFORM, STATUS_SELECT} from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import dayjs from 'dayjs';
const emit = defineEmits(['pageReload']);

const objectRequest = ref<Partial<OcpxTaskItem>>({});
const requestVal = ref<OcpxExportEventClickRequest>();
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const formValue = trimObject(formVal);
    requestVal.value = {
      startDate: formValue.dateTime[0],
      endDate: formValue.dateTime[1],
      reportName: formValue.name,
      taskId: formValue.id
    }
    // 调用导出逻辑
   await ocpxTaskApi.fetchOpcxExportEventClick(requestVal.value)
   message.success('导出成功，请前往下载中心查看！')
  },
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'id',
      // 界面显示的label
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: `${$t('ocpx.ocpx_task.columns.name')}`,
      rules: 'required'
    },
    {
      component: 'RangePicker',
      componentProps: {
        placeholder: [`${$t('common.select')}`, `${$t('common.select')}`],
        format: ['YYYY-MM-DD', 'YYYY-MM-DD'],
        valueFormat: 'YYYY-MM-DD',
        disabledDate: (current: any) => {
          return current && current > dayjs().endOf('day');
        },
      },
      rules: 'required',
      fieldName: 'dateTime',
      label: '时间',
    }
  ],
});

const [Modal, modalApi] = useVbenModal({
  centered: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  contentClass:'modalStyle',
  onCancel() {
    modalApi.close();
    formApi.resetForm();
  },
  async onConfirm() {
    const result = await formApi.validate()
    if (!result.valid) {
      return
    }
    await formApi.submitForm();
    emit('pageReload');
    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<Record<string, any>>();
      if (objectRequest.value.id) {
        handleSetFormValue(objectRequest.value);
      } else {
      }
    }
  },
});

function handleSetFormValue(row: Partial<OcpxTaskItem>) {
  formApi.setValues(row);
}

</script>
<template>
  <Modal class="w-[500px]">
    <Form/>
  </Modal>
</template>
s
