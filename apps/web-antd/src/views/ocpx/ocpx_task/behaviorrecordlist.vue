<script setup lang="ts" name="BehaviorRecordList">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OcpxBehaviorRecordItem } from '#/api/models';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Tag } from 'ant-design-vue';

import { ocpxTaskApi } from '#/api/core/ocpx';
import { trimObject } from '#/utils/trim';

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
    }
  },
});

// 默认展开
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'behavioraPlatformId',
      label: `${$t('ocpx.ocpx_task.behavior_record_columns.behaviorPlatformName')}`,
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
          ocpxTaskId: modalApi.getData().taskId,
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
