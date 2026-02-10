<script setup lang="ts" name="Behavioracallbackrecordlist">
import {useVbenVxeGrid} from "@vben/plugins/vxe-table";
import type {VxeGridProps} from "#/adapter/vxe-table";
import type {OcpxBehavioracallbackRecordItem} from "#/api/models";
import {$t} from "@vben/locales";
import {ocpxTaskApi, clickMonitorApi} from "#/api/core/ocpx";
import {Page, useVbenModal, type VbenFormProps, useVbenDrawer} from '@vben/common-ui';
import {Tag, Button, message} from "ant-design-vue";
import { trimObject } from "#/utils/trim";
import viewDetailsModel from './viewDetailsModel.vue';
import { ref } from "vue";

const [ViewDetailsModel, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: viewDetailsModel,
  // 核心逻辑：监听第二层的打开与关闭
  onOpenChange(isOpen: boolean) {
    // 当第二层打开时，禁用第一层的 closeOnPressEscape
    // 当第二层关闭时，恢复第一层的 closeOnPressEscape
    modalApi.setState({
      closeOnPressEscape: !isOpen,
    });
  },
});

function viewDetailsOpen() {
  drawerApi.open();
}

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  // 确保第一层有一个明确的 zIndex (可选)
  zIndex: 1000,
  closeOnPressEscape: true,
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


/**
 * 重提转换回传
 * @param row
 */
async function rePushBehaviorCallback(row: OcpxBehavioracallbackRecordItem) {
  await clickMonitorApi.fetchRePushBehaviorCallback(row.id)
  await gridApi.reload();
}


// 默认展开
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'behavioraPlatformId',
      label: `${$t('ocpx.ocpx_task.callback_record_columns.platformCallbackName')}`,
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
    zoom: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    {title: '序号', type: 'seq', width: 50},
    {
      field: 'behavioraPlatformName',
      title: `${$t('ocpx.ocpx_task.callback_record_columns.behaviorPlatformName')}`,
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
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.respMsg')}`,
    },

    {
      field: 'success',
      title: `${$t('ocpx.ocpx_task.behavior_record_columns.success')}`,
      slots: {default: 'success'},

    },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      title: `${$t('core.columns.createTime')}`,
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
      width: 'auto',
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);

        return await ocpxTaskApi.fetchOcpxBehavioracallbackRecordList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          ocpxTaskId: modalApi.getData()["taskId"]
        });
      },
    },
  },
}

const detailsId = ref<string>('')
async function viewDetails(row:OcpxBehavioracallbackRecordItem){
  detailsId.value = row.id
  viewDetailsOpen()
}

const selectedRows = ref<OcpxBehavioracallbackRecordItem[]>([])
const gridEvents = {
  checkboxChange:({records}:{records:OcpxBehavioracallbackRecordItem[]})=>{
    selectedRows.value = records
  },
  //全选事件
  checkboxAll:({records}:{records:OcpxBehavioracallbackRecordItem[]})=>{
    selectedRows.value = records
  },
}

async function batchRetry(){
  const ids = selectedRows.value.map(item => item.id)
  console.log(ids,'selectedRows.value.length');
  try{
    await clickMonitorApi.fetchRePushRetryBehaviorCallback(ids)
    await gridApi.reload();
    message.success("批量重试成功！")
  }catch(err){
    console.log(err);
  }
  
}
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions, gridEvents});

</script>

<template>
  <div>
    <Modal>
      <Page auto-content-height>
        <Grid>

          <template #success="{ row }">
            <Tag color="green" v-if="row.success">{{ $t('common.yes') }}</Tag>
            <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
          </template>


          <template #action="{ row }">
            <Button type="link" v-if="!row.success" @click="rePushBehaviorCallback(row)">
              {{ $t('core.repush') }}
            </Button>
            <Button type="link" @click="viewDetails(row)">
              查看详情
            </Button>
          </template>
          <template #toolbar-tools>
            <Button class="mr-2" type="primary" :disabled="selectedRows.length===0" @click="batchRetry">
              批量重试
            </Button>
        </template>
        </Grid>
      </Page>
    </Modal>
    <ViewDetailsModel :detailsId="detailsId"/>
  </div>
</template>

<style scoped>

</style>
