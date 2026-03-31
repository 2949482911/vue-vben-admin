<script setup lang="ts" name="BehaviorRecordList">
import type { VbenFormProps } from '@vben/common-ui';
import {ref} from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OcpxBehaviorRecordItem } from '#/api/models';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { Tag } from 'ant-design-vue';

import { ocpxTaskApi, behavioraPlatformApi, platformCallbackApi } from '#/api/core/ocpx';
import { trimObject } from '#/utils/trim';

const defalutBehavioraPlatformId = ref<string>()
const defalutPlatformCallbackId = ref<string>()
const taskId = ref<string>()
const queryBehaviora = ref({
  page: 1,
  pageSize: 1000,
  ids:'',
  name:''
})
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
      taskId.value = modalData.taskId
      defalutBehavioraPlatformId.value = modalData.behavioraPlatformIds[0]
      defalutPlatformCallbackId.value = modalData.platformCallbackIds[0]
      queryCallback.value.ids = modalData.platformCallbackIds.length > 0 ? modalData.platformCallbackIds.join(',') : []
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
      fieldName: 'behavioraPlatformId',
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

const gridOptions: VxeGridProps<OcpxBehaviorRecordItem> = {
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
      field: 'behavioraPlatformName',
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.behaviorPlatformName')}`,
    },
    {
      field: 'platformCallbackName',
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.platformCallbackName')}`,
    },
    {
      field: 'respCode',
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.respCode')}`,
    },
    {
      field: 'respMsg',
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.respMsg')}`,
    },

    {
      field: 'success',
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.success')}`,
      slots: { default: 'success' },
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
        return await ocpxTaskApi.fetchOxpcBehaviorRecordList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          taskId: modalApi.getData().taskId,
        });
      },
    },
  },
};
const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <div>
    <Modal>
      <Page auto-content-height>
        <Grid>
          <template #success="{ row }">
            <Tag color="green" v-if="row.requestSuccess">
              {{ $t('common.yes') }}
            </Tag>
            <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
          </template>
        </Grid>
      </Page>
    </Modal>
  </div>
</template>

<style scoped></style>
