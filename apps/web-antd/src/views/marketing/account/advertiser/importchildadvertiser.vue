<script setup lang="ts" name="ImportChildAdvertiser">
// 导入子账户
import {useVbenModal} from '@vben/common-ui';
import {Page} from '@vben/common-ui';
import {reactive, ref, computed} from 'vue';
import {advertiserApi} from "#/api/core";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import { useVbenForm } from '#/adapter/form';
import type {AccountChildResponse, AdvertiserItem} from "#/api/models";
import {$t} from "@vben/locales";
import {InputSearch, Checkbox, Select, RadioGroup, RadioButton, message, Button } from "ant-design-vue";
import type { ProjectItem } from './advertiser';
 // 新增响应式变量
const selectedRowKeys = ref<(string)[]>([]);
//父传子接受的项目下拉数据列表
const props = defineProps<{
  projectOptions: ProjectItem[];
  roleType: String;
}>();
//转换成响应式
const projectItemOptions = computed(() =>
  props.projectOptions.map(item => ({
    label: item.name,
    value: item.id,
  }))
);
//所属项目字段
const projectStr = ref()

//设置分页参数
const pages = reactive({
  total:0,
  currentPage:1,
  pageSize: 100
})

const handleType = ref('choose')
const isSelectAll = ref<Boolean>(false)
//弹框导入列表的全部数据
const importData = ref<AccountChildResponse | any>([])
  // 当前用于分页的数据（搜索后 or 原始）
const filterData = ref<AccountChildResponse | any>([])

const emit = defineEmits(['pageReload']);
const objectRequest = ref<{ id: string; }>({id: '',})

const isSlect = ref(true)
const isLoading = ref<Boolean>(false)
const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<{ id: string; }>();
      gridApi.setLoading(true);

      importData.value = await advertiserApi.fetchAccountChild(objectRequest.value.id)
      // 初始化搜索数据 = 全量数据
      filterData.value = [...importData.value];
      pages.total = filterData.value.length
      pages.currentPage = 1
      updatePageData(filterData.value)
      gridApi.setLoading(false);
    }
  },
});

async function handleCancel() {
  gridApi.setGridOptions({data: []});
  objectRequest.value = {id: ''};
  await modalApi.close();
  accountName.value = ''
  checked.value = false
  projectStr.value = ''
  isSlect.value = true
}

async function handleConfirm() {
  isLoading.value = true;
  let advertiserIds: string[];
  try {
    if(handleType.value === 'import') {
      const formVal = await formApi.getValues();
      advertiserIds = strToArray(formVal.accountIds);
    } else {
      if(isSelectAll.value) {
        advertiserIds = selectedRowKeys.value
      } else {
        const checkedRecords = gridApi.grid.getCheckboxRecords();
        console.log('checkedRecords',checkedRecords)
        advertiserIds = checkedRecords.map((item) => item.advertiserId);
      }
    }
    await advertiserApi.fetchImportChild({id: objectRequest.value.id, advertiserIds,projectId:projectStr.value});
    gridApi.setGridOptions({data: []});
    objectRequest.value = {id: ''};
    emit('pageReload');
    await modalApi.close();
    accountName.value = ''
    checked.value = false
    projectStr.value = ''
    isSlect.value = true
    handleType.value = 'choose'
    message.success('导入成功')
  } catch(error) {
    console.log(error)
  } finally {
      isLoading.value = false;
  }
}
const gridOptions: VxeGridProps<AccountChildResponse> = {
  border: true,
  height: "491.5px",
  checkboxConfig: {
    highlight: true,
    labelField: 'advertiserId',
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
    pageSizes: [50, 100, 300, 500],
  },
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//设置前端分页更新事件
async function updatePageData(dataArr:[]){
   gridApi.setLoading(true);
  // 人为制造分页 loading
  await sleep(500);
  const start = (pages.currentPage - 1) * pages.pageSize
  const end = pages.currentPage * pages.pageSize
  gridApi.setGridOptions({
    data:dataArr.slice(start, end),
    pagerConfig:{
      total:dataArr.length,
      currentPage:pages.currentPage,
      pageSize:pages.pageSize
    }
  })
  isSlect.value = true
  gridApi.setLoading(false);
}

//前端分页按钮事件
const gridEvents = {
  pageChange({currentPage,pageSize}:{currentPage:number,pageSize:number}){
    pages.currentPage = currentPage;
    pages.pageSize = pageSize
    updatePageData(filterData.value);
  },
  checkboxChange:({records}:{records:AdvertiserItem[]})=>{
    isSelectAll.value = false
    // selectedRows.value = records
    if(!records.length) isSlect.value = true
    else isSlect.value = false
  },
  //全选事件
  checkboxAll: async({ checked, $event })=>{
    if(checked) {
      isSelectAll.value = true
      const isAddList = importData.value.filter((item:AccountChildResponse) =>
      !item.exist
    );
      selectedRowKeys.value = isAddList.map((item:AdvertiserItem) => item.advertiserId);
    } 
    if(!selectedRowKeys.value.length) {
      isSlect.value = true
      message.warning("无可新增数据")
    }
    else isSlect.value = false
    // selectedRows.value = records
  },
  //当分页时也需要置灰批量操作按钮
  // proxyQuery:({})=>{
  //   selectedRows.value = []
  // }
}

//项目名字筛选
const accountName = ref<string>()
function onSearch(valueText:string){
  pages.currentPage = 1;
   if (!valueText) {
    // 清空搜索：还原原始数据
    filterData.value = [...importData.value];
  } else {
    filterData.value = importData.value.filter((item:AccountChildResponse) =>
      item.advertiserName?.includes(valueText.trim())
    );
  }
  pages.total = filterData.value.length;
  updatePageData(filterData.value);
}

const checked = ref(false)
function changeBool(){
  filterExist(checked.value)
  isSlect.value = true
}

// 过滤展示只展示可新增账户
function filterExist(bool:boolean){
  if(bool){
    filterData.value = importData.value.filter((item:AccountChildResponse) =>
      !item.exist
    );
  }else{
    // 不过滤还原原始数据
    filterData.value = [...importData.value];
  }
  updatePageData(filterData.value);
}


// 用来控制只展示可新增账户的字段
const [Grid, gridApi] = useVbenVxeGrid({gridOptions,gridEvents});
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入以逗号分隔的账户ID',
        rows: 6
      },
      // 字段名
      fieldName: 'accountIds',
      // 界面显示的label
      label: '账户ID',
    },
  ],
});

function handlerOperate(e){
}

function strToArray(inputStr) {
  if (!inputStr || inputStr.trim() === '') {
    return [];
  }
  const arr = inputStr.split(/[, \n\t]+/);
  const result = arr.filter(item => item.trim() !== '');
  // 去重
  // const result = [...new Set(arr.filter(item => item.trim() !== ''))];
  return result;
}
</script>

<template>
  <Page>
    <Modal class="w-[605px]">
      <div class="oprateBtns"  v-if="roleType === 'bm'">
        <RadioGroup v-model:value="handleType" button-style="solid" @change="handlerOperate">
          <RadioButton value="choose">手动选择</RadioButton>
          <RadioButton value="import">手动导入</RadioButton>
        </RadioGroup>
      </div>
      <div v-if="handleType === 'choose'"  v-loading="isLoading">
        <div class="filterClass">
          <InputSearch
            v-model:value="accountName"
            placeholder="请输入账户名字搜索"
            style="width: 200px"
            @search="onSearch"
          />
          <Checkbox v-model:checked="checked" @change="changeBool">只展示可新增账户</Checkbox >
        </div>
        <div class="belongingClass">
          <div style="font-size: 13px;">所属项目：</div>
          <Select
            :disabled="isSlect"
            style="width: 133px"
            v-model:value="projectStr"
            show-search
            allow-clear
            :filter-option="(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            "
            :options="projectItemOptions"
            placeholder="请选择项目">
          </Select>
        </div>
        <Grid></Grid>
      </div>
     <div v-else>
        <Form />
     </div>
     <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="handleCancel">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleConfirm" :loading="isLoading">{{ $t('common.confirm') }}</Button>
        </div>
      </template>
    </Modal>
  </Page>
</template>

<style scoped lang="scss">
.filterClass{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:0 0.5rem;
}

.belongingClass{
  display: flex;
  align-items: center;
  padding:0.5rem 0.5rem 0;

}

.oprateBtns {
  margin: 10px 0;

}

:deep(.vxe-table--body),
:deep(.vxe-table--header){
  width: 100% !important;
}
</style>


