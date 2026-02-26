<script setup lang="ts">
import { Select, SelectOption, Input } from 'ant-design-vue';
import { ref } from 'vue';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';

//媒体账户选择弹框
const [Modal, modalApi] = useVbenModal({
  contentClass:'modalStyle',
});

function mediaAccountClick(){
  modalApi.open()
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      label: '账户名',
    },
    {
      component: 'Input',
      fieldName: 'id',
      label: '备注',
    },
    {
      component: 'Input',
      fieldName: 'id',
      label: '账户ID',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'platform',
      label: '账户主体',
    }
  ],
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  height:"590px",
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { type: 'checkbox', width: 50 },
    { field: 'category', title: '账户名称' },
    { field: 'color', title: '广告主ID' },
    { field: 'productName', title: '主体名称' }
  ],
  exportConfig: {},
  // proxyConfig: {
  //   ajax: {
  //     query: async ({ page }) => {
  //       return await getExampleTableApi({
  //         page: page.currentPage,
  //         pageSize: page.pageSize,
  //       });
  //     },
  //   },
  // },
};

//产品选择
const value1 = ref()
const source = ref<any[]>([
  {
    id:"1",
    value:"1",
    label:"1"
  }
])

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

</script>

<template>
  <div class="selectArea">
    <div class="selectSection">
      <div class="selectSection" style="margin: 0 10px 0 0;">
        <div>产品：</div>
        <Select
          ref="select"
          v-model:value="value1"
          style="width: 120px"
        >
          <SelectOption v-for="item in source" :key="item.id" :label="item.label" :value="item.value"></SelectOption>
        </Select>
      </div>
      <div class="selectSection">
        <div>媒体账户：</div>
        <Input class="inp" v-model:value="value1" readonly style="width: 120px" @click="mediaAccountClick()"/>
      </div>
    </div>
  </div>
  <Modal class="w-[80%]" title="选择媒体账户">
    <Grid></Grid>
  </Modal>
</template>

<style scoped lang="scss">
.selectArea{
  margin: 10px 0 0;

  .selectSection{
    display: flex;
    align-items: center;

    .inp{
      cursor: pointer;
    }
  }

  :global(.z-popup .modalStyle) {
    min-height: 600px !important;
  }
}

</style>
