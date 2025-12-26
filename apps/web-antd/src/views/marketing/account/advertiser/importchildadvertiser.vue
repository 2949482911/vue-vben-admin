<script setup lang="ts" name="ImportChildAdvertiser">
// 导入子账户
import {useVbenModal} from '@vben/common-ui';
import {Page} from '@vben/common-ui';
import {reactive, ref} from 'vue';
import {advertiserApi} from "#/api/core";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import type {AccountChildResponse} from "#/api/models";
import {$t} from "@vben/locales";

//设置分页参数
const pages = reactive({
  total:0,
  currentPage:1,
  pageSize:10
})
//弹框导入列表的全部数据
const importData = ref<AccountChildResponse | any>()

const emit = defineEmits(['pageReload']);
const objectRequest = ref<{ id: string; }>({id: '',})

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    gridApi.setGridOptions({data: []});
    objectRequest.value = {id: ''};
    await modalApi.close();
  },
  async onConfirm() {
    const checkedRecords = gridApi.grid.getCheckboxRecords();
    const advertiserIds: string[] = checkedRecords.map((item) => item.advertiserId);
    await advertiserApi.fetchImportChild({id: objectRequest.value.id, advertiserIds})
    gridApi.setGridOptions({data: []});
    objectRequest.value = {id: ''};
    emit('pageReload');
    await modalApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<{ id: string; }>();
      gridApi.setLoading(true);

      importData.value = await advertiserApi.fetchAccountChild(objectRequest.value.id)
      pages.total = importData.value.length
      
      gridApi.setGridOptions({
        data: importData.value, 
        pagerConfig: {
          total: pages.total,
          currentPage: pages.currentPage,
          pageSize: pages.pageSize,
        },
      });

      updatePageData()
      gridApi.setLoading(false);
    }
  },
});


const gridOptions: VxeGridProps<AccountChildResponse> = {
  border: true,
  height: "600px",
  checkboxConfig: {
    highlight: true,
    labelField: 'advertiserId',
    range: true,
    checkMethod(params: {
      row: AccountChildResponse
    }): boolean {
      return !params.row.exist;
    }
  },
  toolbarConfig: {},
  data:[],
  columns: [
    {title: '序号', type: 'checkbox', fixed: 'left', width: 'auto',},

    {
      field: 'advertiserId',
      title: `${$t('marketing.advertiser.columns.advertiserId')}`,
      width: 'auto',
    },

    {
      field: 'advertiserName',
      title: `${$t('marketing.advertiser.columns.advertiserName')}`,
      width: 'auto',
    },
  ],
  keepSource: true,
  proxyConfig: undefined,
  pagerConfig: {
    enabled: true,
    total:pages.total,
    pageSize: pages.pageSize,
    currentPage: pages.currentPage,
    pageSizes: [10, 20],
  },
};

//设置前端分页更新事件
function updatePageData(){
  const start = (pages.currentPage - 1) * pages.pageSize
  const end = pages.currentPage * pages.pageSize
  const pageData = importData.value.slice(start,end)
  gridApi.setGridOptions({
    data:pageData,
    pagerConfig:{
      total:pages.total,
      currentPage:pages.currentPage,
      pageSize:pages.pageSize
    }
  })
}

//前端分页按钮事件
const gridEvents = {
  pageChange({currentPage,pageSize}:{currentPage:number,pageSize:number}){
    pages.currentPage = currentPage;
    pages.pageSize = pageSize
    updatePageData();
  }
}


const [Grid, gridApi] = useVbenVxeGrid({gridOptions,gridEvents});


</script>

<template>
  <Page>
    <Modal class="w-[605px]">
      <Grid></Grid>
    </Modal>
  </Page>
</template>

<style scoped lang="scss">
:deep(.vxe-table--body),
:deep(.vxe-table--header){
  width: 100% !important;
}
</style>


