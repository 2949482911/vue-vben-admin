<script setup lang="ts" name="Behavioracallbackrecordlist">
import {useVbenVxeGrid} from "@vben/plugins/vxe-table";
import type {VxeGridProps} from "#/adapter/vxe-table";
import type {OcpxBehavioracallbackRecordItem} from "#/api/models";
import {$t} from "@vben/locales";
import {ocpxTaskApi} from "#/api/core/ocpx";
import {Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';


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
  }
});


// 默认展开
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'behavioraPlatformId',
      label: `${$t('ocpx.ocpx_task.callback_record_columns.behavioraPlatformName')}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};


const gridOptions: VxeGridProps<OcpxBehavioracallbackRecordItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true,
  },
  columns: [
    {title: '序号', type: 'seq', width: 50, type: 'checkbox', width: 100},
    {
      field: 'behavioraPlatformName',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.behavioraPlatformName')}`,
    },
    {
      field: 'platformCallbackName',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.platformCallbackName')}`,
    },
    {
      field: 'respCode',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.respCode')}`,
    },
    {
      field: 'respMsg',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.respMsg')}`,
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
      query: async ({page}, args) => {
        return await ocpxTaskApi.fetchOcpxBehavioracallbackRecordList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args,
          ocpxTaskId: modalApi.getData()["taskId"]
        });
      },
    },
  },
}
const [Grid] = useVbenVxeGrid({formOptions, gridOptions});

</script>

<template>
  <div>
    <Modal>
      <Page auto-content-height>
        <Grid></Grid>
      </Page>
    </Modal>
  </div>
</template>

<style scoped>

</style>
