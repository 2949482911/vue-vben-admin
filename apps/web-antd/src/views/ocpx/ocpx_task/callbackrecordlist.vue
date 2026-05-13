<script setup lang="ts" name="CallbackRecordList">
import type { VbenFormProps } from '@vben/common-ui';
import {ref} from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OcpxCallbackRecordItem } from '#/api/models';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { Tag } from 'ant-design-vue';

import { ocpxTaskApi, behavioraPlatformApi, platformCallbackApi } from '#/api/core/ocpx';
import { trimObject } from '#/utils/trim';

const defalutBehavioraPlatformId = ref<string>()
const platform = ref<string>()
const taskId = ref<string>()
const queryBehaviora = ref({
  page: 1,
  pageSize: 1000,
  ids:'',
  name:''
})
interface eventType {
  label: string;
  value: string;
}
const eventList = ref<eventType[]>([])
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
      const modalData = modalApi.getData()
      taskId.value = modalData.taskId
      defalutBehavioraPlatformId.value = modalData.behavioraPlatformIds[0]
      platform.value = modalData.platform
      queryBehaviora.value.ids = modalData.behavioraPlatformIds.length > 0? modalData.behavioraPlatformIds.join(',') : []
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
      defaultValue: defalutBehavioraPlatformId,
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
          api: async () => {
          return await behavioraPlatformApi.fetchBehavioraPlatformList(queryBehaviora.value);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        valueField: 'id',
        labelField: 'name',
        resultField: "items",
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'eventType',
      label: '事件',
      defaultValue: null,
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        api: async () => {
          const res = await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(platform.value as string);
          eventList.value = res;
          TYPE_LABEL_MAP = Object.fromEntries(eventList.value.map(item => [item.value, item.label]));
          return  res
        },
      }
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
    }
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
      slots: { default: 'eventType' }
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
          taskId: taskId.value
        });
      },
    },
  },
};
function getTypeLabel(value: string): string {
  return TYPE_LABEL_MAP[value] ?? value;
}
const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <div>
    <Modal>
      <Page auto-content-height>
        <Grid>
          <template #eventType="{ row }">
            <Tag color="blue">{{getTypeLabel(row.eventType)}}</Tag>
          </template>
        </Grid>
      </Page>
    </Modal>
  </div>
</template>

<style scoped></style>
