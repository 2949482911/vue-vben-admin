<script setup lang="ts" name="CallbackRecordList">
import type { VbenFormProps } from '@vben/common-ui';
import { ref } from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OcpxCallbackRecordItem, CallbackClickReordItem } from '#/api/models';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { Tag, message, Button } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { ocpxTaskApi, behavioraPlatformApi, platformCallbackApi } from '#/api/core/ocpx';
import { trimObject } from '#/utils/trim';

const defalutPlatformCallbackId = ref<string>();
const defalutBehaviorPlatformId = ref<string>();
const platform = ref<string>();
const taskId = ref<string>();
const queryBehaviora = ref({
  page: 1,
  pageSize: 1000,
  ids: '',
  name: '',
});
interface eventType {
  label: string;
  value: string;
}
const eventList = ref<eventType[]>([]);
let TYPE_LABEL_MAP: Record<string, string> = {};
const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData();
      taskId.value = modalData.taskId;
      platform.value = modalData.platform;
      defalutPlatformCallbackId.value = modalData.platformCallbackIds[0];
      defalutBehaviorPlatformId.value = modalData.behavioraPlatformIds[0];
      queryBehaviora.value.ids =
        modalData.behavioraPlatformIds.length > 0 ? modalData.behavioraPlatformIds.join(',') : [];
    }
  },
});

// 默认展开
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'ApiSelect',
      fieldName: 'behaviorPlatformId',
      label: `${$t('ocpx.ocpx_task.behavior_record_columns.behaviorPlatformName')}`,
      defaultValue: defalutBehaviorPlatformId,
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        api: async () => {
          const res = (await behavioraPlatformApi.fetchBehavioraPlatformList(
            queryBehaviora.value,
          )) as any;
          if (res?.items && res.items.length > 0) {
            const platform = res.items[0].platform;
            eventList.value = await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(
              platform as string,
            );
          }
          return res;
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        valueField: 'id',
        labelField: 'name',
        resultField: 'items',
      },
    },
    {
      component: 'Select',
      fieldName: 'eventType',
      label: '事件',
      defaultValue: null,
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        options: eventList,
      },
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          {
            label: '系统回传',
            value: 'callback',
          },
          {
            label: '扣量',
            value: 'deduction',
          },
          {
            label: '补量',
            value: 'supplement',
          },
        ],
      },
      fieldName: 'recordType',
      label: '记录类型',
    },
    {
      component: 'DatePicker',
      fieldName: 'createTime',
      label: `时间`,
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<OcpxCallbackRecordItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'taskId',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.taskId')}`,
    },
    {
      field: 'platform',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.platform')}`,
    },
    {
      field: 'eventType',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.eventType')}`,
      slots: { default: 'eventType' },
    },
    {
      field: 'recordType',
      title: '记录类型',
    },
    {
      field: 'requestId',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.requestId')}`,
    },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      title: `${$t('core.columns.createTime')}`,
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await ocpxTaskApi.fetchOxpcCallbackRecordList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          taskId: taskId.value,
        });
      },
    },
  },
};
function getTypeLabel(value: string): string {
  TYPE_LABEL_MAP = Object.fromEntries(eventList.value.map((item) => [item.value, item.label]));
  return TYPE_LABEL_MAP[value] ?? value;
}
const selectedRows = ref<OcpxCallbackRecordItem[]>([]);
const gridEvents = {
  checkboxChange: ({ records }: { records: OcpxCallbackRecordItem[] }) => {
    selectedRows.value = records;
  },
  //全选事件
  checkboxAll: ({ records }: { records: OcpxCallbackRecordItem[] }) => {
    selectedRows.value = records;
  },
};
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
    const postParams = {
      taskId: taskId.value,
      platformCallbackId: defalutPlatformCallbackId.value,
      behaviorPlatformId: defalutBehaviorPlatformId.value,
      behaviorType: formVal.behaviorType,
      requestIds: selectedRows.value.map((item) => item.requestId),
    };
    const params = trimObject(postParams);
    console.log('params', params);
    await ocpxTaskApi.fetchBatchClickRecordList(params as CallbackClickReordItem);
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
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        api: async () => {
          return await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(
            platform.value as string,
          );
        },
        showSearch: true,
        allowClear: true,
      },
      // 字段名
      fieldName: 'behaviorType',
      // 界面显示的label
      label: '事件',
      rules: 'required',
    },
  ],
});
const [CallbackModal, callbackModalApi] = useVbenModal({
  centered: true,
  onCancel() {
    callbackModalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    await formApi.resetForm();
    await callbackModalApi.close();
    message.success('操作成功');
    pageReload();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
    }
  },
});
function openBatchCallback() {
  callbackModalApi.open();
}
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });
function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <div>
    <Modal>
      <Page auto-content-height>
        <Grid>
          <template #toolbar-tools>
            <Button
              class="mr-2"
              type="primary"
              @click="() => openBatchCallback()"
              :disabled="selectedRows.length === 0"
            >
              批量回传
            </Button>
          </template>
          <template #eventType="{ row }">
            <Tag color="blue">{{ getTypeLabel(row.eventType) }}</Tag>
          </template>
        </Grid>
      </Page>
    </Modal>
    <CallbackModal title="事件选择" class="w-[30%]">
      <Form />
    </CallbackModal>
  </div>
</template>

<style scoped></style>
