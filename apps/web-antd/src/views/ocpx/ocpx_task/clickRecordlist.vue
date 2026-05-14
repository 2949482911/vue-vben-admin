<script setup lang="ts" name="clickRecordlist">
import type { VbenFormProps } from '@vben/common-ui';
import {ref} from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ClickReordItem, CallbackClickReordItem, ClickReordPageRequest } from '#/api/models';
import { useVbenForm } from '#/adapter/form';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { Button, message, RangePicker } from 'ant-design-vue';
import { ocpxTaskApi,platformCallbackApi } from '#/api/core/ocpx';
import { trimObject } from '#/utils/trim';
const defalutPlatformCallbackId = ref<string>()
const defalutBehaviorPlatformId = ref<string>()
const platform = ref<string>()
const taskId = ref<string>()
  const queryCallback = ref({
  page: 1,
  pageSize: 1000,
  ids:'',
  name:''
})
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
      const modalData = modalApi.getData()
      taskId.value = modalData.id
      platform.value = modalData.platform
      defalutPlatformCallbackId.value = modalData.platformCallbackIds[0]
      defalutBehaviorPlatformId.value = modalData.behavioraPlatformIds[0]
      queryCallback.value.ids = modalData.platformCallbackIds.length > 0 ? modalData.platformCallbackIds.join(',') : []
    }
  },
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
      requestIds:selectedRows.value.map(item => item.requestId),
    }
    const params = trimObject(postParams)
    await ocpxTaskApi.fetchBatchClickRecordList(params as CallbackClickReordItem)
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
          return  await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(platform.value as string);
        },
        showSearch: true,
        allowClear: true
      },
      // 字段名
      fieldName: 'behaviorType',
      // 界面显示的label
      label: '事件',
      rules: 'required',
    },
  ]
})
// 默认展开
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'DatePicker',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'createTime',
      label: '时间'
    },
    {
      fieldName: 'adgroupId',
      label: $t('ocpx.ocpx_task.click_record_columns.adgroup'),
      component: 'Input',
    },
    {
      fieldName: 'requestId',
      label: $t('ocpx.ocpx_task.click_record_columns.requestId'),
      component: 'Input',
    },
    {
      fieldName: 'clickId',
      label: '点击ID',
      component: 'Input',
    },
    {
      component: 'ApiSelect',
      fieldName: 'platformCallbackId',
      label: `${$t('ocpx.ocpx_task.behavior_record_columns.platformCallbackName')}`,
      defaultValue: defalutPlatformCallbackId,
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        api: async () => {
          return await platformCallbackApi.fetchPlatformcallbackList(queryCallback.value);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: "items",
      },
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<ClickReordItem> = {
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
    {title: '序号', type: 'seq', width: 50},
    {
      field: 'advertiserId',
      title: `${$t('ocpx.ocpx_task.click_record_columns.advertiserId')}`,
    },
    {
      field: 'requestId',
      title: `${$t('ocpx.ocpx_task.click_record_columns.requestId')}`,
    },
    {
      formatter: 'formatDateTime',
      field: 'createDatetime',
      title: `${$t('ocpx.ocpx_task.click_record_columns.clickTime')}`,
    },
    {
      formatter: 'formatDate',
      field: 'createTime',
      title: `点击日期`,
    },

    {
      field: 'adgroupId',
      title: `${$t('ocpx.ocpx_task.click_record_columns.adgroup')}`,
    }
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await ocpxTaskApi.fetchClickRecordList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          taskId: taskId.value,
        } as ClickReordPageRequest);
      },
    },
  },
};
// 勾选的数组
const selectedRows = ref<ClickReordItem[]>([])
const gridEvents = {
  checkboxChange: ({ records }: { records: ClickReordItem[] }) => {
    selectedRows.value = records;
  },
  //全选事件
  checkboxAll: ({ records }: { records: ClickReordItem[] }) => {
    selectedRows.value = records;
  },
  //当分页时也需要置灰批量操作按钮
  proxyQuery: ({}) => {
    selectedRows.value = [];
  },
};
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions,gridEvents });
function pageReload() {
  gridApi.reload();
}
function openBatchCallback() {
  callbackModalApi.open()
}
function openCallback(row: ClickReordItem) {
}
</script>

<template>
  <div>
    <Modal>
      <Page auto-content-height>
        <Grid>
          <template #toolbar-tools>
            <Button class="mr-2" type="primary" @click="()=>openBatchCallback()" :disabled="selectedRows.length === 0">
              批量回传
            </Button>
          </template>
          <template #action="{ row }">
            <Button type="link" @click="openCallback(row)">
              回传
            </Button>
        </template>
        </Grid>
      </Page>
    </Modal>
    <CallbackModal title="事件选择" class="w-[30%]">
      <Form/>
    </CallbackModal>
  </div>
</template>

<style scoped></style>
