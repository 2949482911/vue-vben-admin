<script setup lang="ts" name="MatchTable">
import {Page} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import type {OcpxPlatformMatch} from "#/api/models";
import {$t} from "@vben/locales";
import {Button, Input, Select} from "ant-design-vue";
import {PLATFORM} from "#/constants/locales";
import { ref, watch } from "vue";
import {behavioraPlatformApi} from '#/api/core/ocpx';
import ExcelJS from 'exceljs';

type OcpxPlatformMatchForm = Partial<OcpxPlatformMatch>;

const { matchDataList } = defineProps<{
  matchDataList: OcpxPlatformMatchForm[]
}>()

const list = ref<OcpxPlatformMatchForm[]>([])
  
watch(
  () => matchDataList,
  (val) => {
    list.value = (val || []).map(item => createRow(item, false))
  },
  { immediate: true }
)

const gridOptions: VxeGridProps<OcpxPlatformMatchForm> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  data: list.value,
  columns: [
    {title: '序号', type: 'seq'},
    {
      field: 'platform',
      title: `${$t('ocpx.behavioraplatform.columns.platform')}`,
      slots: {default: 'platform'},
      width: '100px'
    },
    {
      field: 'advertiserId',
      title: `${$t('ocpx.behavioraplatform.columns.advertiserId')}`,
      slots: {default: 'advertiserId'}
    },
    {
      field: 'campaignId',
      title: `${$t('ocpx.behavioraplatform.columns.campaignId')}`,
      slots: {default: 'campaignId'}

    },
    {
      field: 'adgroupId',
      title: `${$t('ocpx.behavioraplatform.columns.adgroupId')}`,
      slots: {default: 'adgroupId'}
    },
    {
      field: 'promotionId',
      title: `${$t('ocpx.behavioraplatform.columns.promotionId')}`,
      slots: {default: 'promotionId'}
    },
    {
      field: 'creativeId',
      title: `${$t('ocpx.behavioraplatform.columns.creativeId')}`,
      slots: {default: 'creativeId'}
    },
    {
      field: 'matchId',
      title: `${$t('ocpx.behavioraplatform.columns.matchId')}`,
      slots: {default: 'matchId'}
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
    },
  ],
  rowConfig: {
    keyField: 'id',
  },
  keepSource: true,
  proxyConfig: undefined,
  pagerConfig: {
    enabled: false,
  },
};


const [Grid, gridApi] = useVbenVxeGrid({gridOptions});

function createRow(row?: OcpxPlatformMatchForm, isNew = true) {
  return {
    id: isNew ? String(Date.now() + Math.random()) : row?.id, // 新增/复制的时候自定义一个id,为防止后续在没有真实id情况下修改数据变成同步修改
    platform: row?.platform ?? '',
    advertiserId: row?.advertiserId ?? '',
    campaignId: row?.campaignId ?? '',
    adgroupId: row?.adgroupId ?? '',
    promotionId: row?.promotionId ?? '',
    creativeId: row?.creativeId ?? '',
    matchId: row?.matchId ?? '',
    _isNew: isNew,
  }
}

// 新增匹配列
function addMatchCol() {
  list.value.push(createRow())
  gridApi.setGridOptions({data: list.value})
}

// 复制匹配列
function copyMatchData(row: OcpxPlatformMatchForm ) {
  const { fullData } = gridApi.grid.getTableData()
  list.value = [...fullData ,createRow(row, true)]
  gridApi.setGridOptions({data: list.value})
}

// 删除方法
async function delMatchData(row : OcpxPlatformMatchForm, rowIndex : number) {
  list.value.splice(rowIndex , 1)
  if(!row._isNew){
    const ids = row.id as string
    await behavioraPlatformApi.fetchBatchOptions({
      type:"delete",
      targetIds:[ids],
      values: {}
    })
  }
}

function getSubmitData() {
  const { fullData } = gridApi.grid.getTableData();
  return fullData.map(({ id, _isNew, ...rest }) => {
    // 新增 / 复制的数据：不带 id
    if (_isNew) {
      return rest;
    }
    // 回显的数据：保留 id
    return { id, ...rest };
  });
}

/**导入excel*/
async function importExcel() {
  // 1. 创建一个隐藏的 input 用于选择文件
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls';
  
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const arrayBuffer = event.target.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const worksheet = workbook.getWorksheet(1); // 读取第一个工作表
      const jsonData: any[] = [];

      // 2. 解析 Excel 行 (从第 2 行开始，避开表头)
      worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData: any = {
            platform: row.getCell(1).value,     // 1 列是平台
            advertiserId: row.getCell(2).value, // 2 列是广告主ID
            campaignId: row.getCell(3).value,
            adgroupId: row.getCell(4).value,
            promotionId: row.getCell(5).value,
            creativeId: row.getCell(6).value,
            matchId: row.getCell(7).value,
          };
          jsonData.push(rowData);
        }
      });

      // 3. 转换为业务格式并更新表格
      const importedList = jsonData.map(item => createRow(item, true));
      list.value = [...list.value, ...importedList];
      gridApi.setGridOptions({ data: list.value });
      
      console.log('导入成功:', list.value);
    };
    reader.readAsArrayBuffer(file);
  };
  
  input.click();
}

defineExpose({
  getSubmitData,
});

</script>

<template>
  <Page>
    <div class="imBtn">
      <Button type="primary" @click="importExcel">
        导入 Excel
      </Button>
    </div>
    <Grid>

      <template #platform="{ row }">
        <Select size="large" v-model:value="row.platform" :options="PLATFORM" style="width: 80px;"/>
      </template>

      <template #advertiserId="{ row }">
        <Input v-model:value="row.advertiserId"/>
      </template>

      <template #campaignId="{ row }">
        <Input v-model:value="row.campaignId"/>
      </template>

      <template #adgroupId="{ row }">
        <Input v-model:value="row.adgroupId"/>
      </template>

      <template #promotionId="{ row }">
        <Input v-model:value="row.promotionId"/>
      </template>

      <template #creativeId="{ row }">
        <Input v-model:value="row.creativeId"/>
      </template>

      <template #matchId="{ row }">
        <Input v-model:value="row.matchId"/>
      </template>

      <template #action="{ row, rowIndex  }">
        <Button type="link" @click="copyMatchData(row)">
          {{ $t('core.copy') }}
        </Button>
        <Button type="link" @click="delMatchData(row, rowIndex)">
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
    <Button block class="mt-5" type="dashed" @click="addMatchCol"> {{
        $t('common.create')
      }}
    </Button>
  </Page>
</template>

<style scoped lang="scss">
.imBtn{
  display: flex;
  justify-content: flex-end;
  margin-right: 8px;
}
</style>
