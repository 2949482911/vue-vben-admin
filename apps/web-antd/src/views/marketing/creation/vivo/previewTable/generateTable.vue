<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Checkbox } from 'ant-design-vue';

// 1. 定义数据
const mockData = reactive([
  // 项目 A - 3条广告
  { projectId: 'P1', projectChecked: false, adChecked: false, projectName: '项目A：妙滋滋春节推广', adName: '广告A-01', targeting: '111', groupPackage: '未配置', budget: '1000', price: '10', optimizeGoal: '激活', monitorLink: '默认', status: '待提交' },
  { projectId: 'P1', projectChecked: false, adChecked: false, projectName: '项目A：妙滋滋春节推广', adName: '广告A-02', targeting: '111', groupPackage: '未配置', budget: '1000', price: '10', optimizeGoal: '激活', monitorLink: '默认', status: '待提交' },
  { projectId: 'P1', projectChecked: false, adChecked: false, projectName: '项目A：妙滋滋春节推广', adName: '广告A-03', targeting: '111', groupPackage: '未配置', budget: '1000', price: '10', optimizeGoal: '激活', monitorLink: '默认', status: '待提交' },
  
  // 项目 B - 2条广告
  { projectId: 'P2', projectChecked: false, adChecked: false, projectName: '项目B：甜甜微小夏季活动', targeting: '222', groupPackage: '已配置', budget: '2000', price: '20', optimizeGoal: '注册', monitorLink: '链接1', status: '待提交', adName: '广告B-01' },
  { projectId: 'P2', projectChecked: false, adChecked: false, projectName: '项目B：甜甜微小夏季活动', targeting: '222', groupPackage: '已配置', budget: '2000', price: '20', optimizeGoal: '注册', monitorLink: '链接1', status: '待提交', adName: '广告B-02' },
  
  // 项目 C - 4条广告
  { projectId: 'P3', projectChecked: false, adChecked: false, projectName: '项目C：品牌年度大促', targeting: '333', groupPackage: '未配置', budget: '5000', price: '50', optimizeGoal: '付费', monitorLink: '默认', status: '待提交', adName: '广告C-01' },
  { projectId: 'P3', projectChecked: false, adChecked: false, projectName: '项目C：品牌年度大促', targeting: '333', groupPackage: '未配置', budget: '5000', price: '50', optimizeGoal: '付费', monitorLink: '默认', status: '待提交', adName: '广告C-02' },
  { projectId: 'P3', projectChecked: false, adChecked: false, projectName: '项目C：品牌年度大促', targeting: '333', groupPackage: '未配置', budget: '5000', price: '50', optimizeGoal: '付费', monitorLink: '默认', status: '待提交', adName: '广告C-03' },
  { projectId: 'P3', projectChecked: false, adChecked: false, projectName: '项目C：品牌年度大促', targeting: '333', groupPackage: '未配置', budget: '5000', price: '50', optimizeGoal: '付费', monitorLink: '默认', status: '待提交', adName: '广告C-04' },
]);

// --- 计算全选状态 ---
// 项目全选
const isAllProjectChecked = computed({
  get: () => mockData.length > 0 && mockData.every(i => i.projectChecked),
  set: (val) => mockData.forEach(i => i.projectChecked = val)
});

// 广告全选
const isAllAdChecked = computed({
  get: () => {
    // 必须要让 computed 依赖 mockData 数组内部的变化
    return mockData.length > 0 && mockData.every(item => item.adChecked);
  },
  set: (val: boolean) => {
    mockData.forEach(item => {
      item.adChecked = val;
    });
  }
});

// --- 处理逻辑 ---
// --- 广告单选处理 ---
const onAdCheckChange = (row: any, checked: boolean) => {
  const index = mockData.findIndex(item => item.adName === row.adName && item.projectId === row.projectId);
  if (index !== -1) {
    // 使用 ! 告诉 TS：我确定这里不是 undefined
    mockData[index]!.adChecked = checked;
  }
};

// --- 勾选项目时，联动该项目下所有行 ---
const onProjectCheckChange = (row: any, checked: boolean) => {
  mockData.forEach((_item, index) => {
    // 同样使用 ! 断言
    if (mockData[index]!.projectId === row.projectId) {
      mockData[index]!.projectChecked = checked;
    }
  });
};

const handleSpanMethod = ({ row, _rowIndex, column, visibleData }: any) => {
  const projectFields = ['projectCheckbox', 'projectName', 'targeting', 'groupPackage', 'projectBudget', 'optimizeGoal', 'monitorLink'];
  if (projectFields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1];
    if (prevRow && prevRow.projectId === row.projectId) {
      return { rowspan: 0, colspan: 0 };
    } else {
      let countRowspan = 1;
      while (visibleData[_rowIndex + countRowspan] && visibleData[_rowIndex + countRowspan].projectId === row.projectId) {
        countRowspan++;
      }
      return { rowspan: countRowspan, colspan: 1 };
    }
  }
};

const gridOptions: VxeGridProps<any> = {
  border: true,
  height: 'auto',
  columnConfig: { resizable: true },
  showOverflow: false, 
  showHeaderOverflow: false,
  spanMethod: handleSpanMethod,
  columns: [
    {
      title: '项目',
      field: 'adProject',
      children: [
        { field: 'projectCheckbox', width: 50, slots: { header: 'projectHeaderSlot', default: 'projectCheckboxSlot' } },
        { field: 'projectName', title: '项目名称', width: 220, slots: { default: 'projectNameSlot' } },
        { field: 'targeting', title: '定向', width: 100 },
        { field: 'groupPackage', title: '人群包', width: 120, slots: { default: 'groupPackageSlot' } },
        { field: 'projectBudget', title: '项目预算与出价', width: 180, slots: { default: 'budgetSlot' } },
        { field: 'optimizeGoal', title: '优化目标', width: 120 },
        { field: 'monitorLink', title: '监测链接', width: 150 },
      ]
    },
    {
      title: '广告',
      field: 'adGroup',
      children: [
        { field: 'adCheckbox', width: 50, slots: { header: 'adHeaderSlot', default: 'adCheckboxSlot' } },
        { field: 'adName', title: '广告名称', minWidth: 200, slots: { default: 'adNameSlot' } },
        { field: 'status', title: '提交状态', width: 100 },
      ]
    }
  ],
  pagerConfig: { enabled: false },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

onMounted(() => {
  gridApi.setGridOptions({ data: mockData });
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #projectHeaderSlot>
        <Checkbox v-model:checked="isAllProjectChecked" />
      </template>
      <template #projectCheckboxSlot="{ row }">
        <Checkbox 
          :checked="row.projectChecked" 
          @change="(e: any) => onProjectCheckChange(row, e.target.checked)" 
        />
      </template>

      <template #adHeaderSlot>
        <Checkbox 
          :checked="isAllAdChecked" 
          @change="(e: any) => isAllAdChecked = e.target.checked" 
        />
      </template>
      <template #adCheckboxSlot="{ row }">
        <Checkbox 
          :checked="row.adChecked" 
          @change="(e: any) => onAdCheckChange(row, e.target.checked)" 
        />
      </template>

      <template #projectNameSlot="{ row }">
        <div class="whitespace-normal break-all">{{ row.projectName }}</div>
      </template>

      <template #adNameSlot="{ row }">
        <div class="whitespace-normal break-all py-2">{{ row.adName }}</div>
      </template>
    </Grid>
  </Page>
</template>

<style scoped>
:deep(.vxe-cell) {
  padding: 8px !important;
  word-break: break-all !important;
  white-space: normal !important;
}

:deep(.vxe-cell--slot) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.vxe-header--column.adGroup) {
  background-color: #fff !important;
}
</style>
