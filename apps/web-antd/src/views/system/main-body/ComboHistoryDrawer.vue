<script setup lang="ts">
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Tag } from 'ant-design-vue';
import type { MainBodyItemCombo } from '#/api/models/main-body';
import { ref, watch, computed } from 'vue';

const [ComboHistoryDrawer, drawerApi] = useVbenDrawer({
  class:"w-[75vm]",
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data && data.mainBodyCombo) {
        comboHistory.value = data.mainBodyCombo;
      }
    }
  },
  onClosed() {
    // 关闭抽屉时清空数据
    comboHistory.value = [];
    drawerApi.close();
  },
});

const comboHistory = ref<MainBodyItemCombo[]>([]);

// 将套餐历史数据转换为表格数据，每个套餐的每个权益作为一行
const tableData = computed(() => {
  const result: any[] = [];

  comboHistory.value.forEach(combo => {
    // 如果有权益列表，每个权益创建一行
    if (combo.comboPrivilegeItems && combo.comboPrivilegeItems.length > 0) {
      combo.comboPrivilegeItems.forEach(privilege => {
        result.push({
          // 套餐信息
          comboName: combo.comboName,
          comboType: combo.comboType,
          startTime: combo.startTime,
          endTime: combo.endTime,
          using: combo.using,
          createTime: combo.createTime,
          createUsername: combo.createUsername,
          // 权益信息（children列需要的数据）
          privilegeName: privilege.privilegeName,
          privilegeCode: privilege.privilegeCode,
          quota: privilege.quota,
          unit: privilege.unit,
        });
      });
    } else {
      // 如果没有权益，也要显示套餐信息
      result.push({
        using: combo.using,
        comboName: combo.comboName,
        comboType: combo.comboType,
        startTime: combo.startTime,
        endTime: combo.endTime,
        createTime: combo.createTime,
        createUsername: combo.createUsername,
        privilegeName: '',
        privilegeCode: '',
        quota: 0,
        unit: '',
      });
    }
  });

  return result;
});

// 计算需要合并的单元格
const mergeCells = computed(() => {
  const merges: any[] = [];
  let rowIndex = 0;

  comboHistory.value.forEach(combo => {
    const privilegeCount = combo.comboPrivilegeItems?.length || 1;

    // 如果有多个权益，需要合并套餐信息列
    if (privilegeCount > 1) {
      // 合并套餐名称列
      merges.push({
        row: rowIndex,
        col: 0,
        rowspan: privilegeCount,
        colspan: 1,
      });
      // 合并套餐类型列
      merges.push({
        row: rowIndex,
        col: 1,
        rowspan: privilegeCount,
        colspan: 1,
      });
      // 合并开始时间列
      merges.push({
        row: rowIndex,
        col: 2,
        rowspan: privilegeCount,
        colspan: 1,
      });
      // 合并结束时间列
      merges.push({
        row: rowIndex,
        col: 3,
        rowspan: privilegeCount,
        colspan: 1,
      });
      // 合并创建时间列
      merges.push({
        row: rowIndex,
        col: 4,
        rowspan: privilegeCount,
        colspan: 1,
      });
      // 合并创建人列
      merges.push({
        row: rowIndex,
        col: 5,
        rowspan: privilegeCount,
        colspan: 1,
      });
    }

    rowIndex += privilegeCount;
  });

  return merges;
});

const gridOptions: VxeGridProps = {
  border: true,
  columns: [
    {
      field: 'comboName',
      title: '套餐名称',
      width: 'auto',
    },
    {
      field: 'comboType',
      title: '套餐类型',
      width: 'auto',
      slots: { default: 'comboType' },
    },
    {
      field: 'startTime',
      title: '开始时间',
      width: 'auto',
    },
    {
      field: 'endTime',
      title: '结束时间',
      width: 'auto',
    },
    {
      field: 'using',
      title: '使用中',
      width: 'auto',
      slots: { default: 'using' },
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 'auto',
    },
    {
      field: 'createUsername',
      title: '创建人',
      width: 'auto',
    },
    {
      title: '套餐权益',
      children: [
        {
          field: 'privilegeName',
          title: '权益名称',
          width: 'auto',
          slots: { default: 'privilegeName' },
        },
        {
          field: 'quota',
          title: '配额',
          width: 'auto',
        },
        {
          field: 'unit',
          title: '单位',
          width: 'auto',
        },
      ],
    },
  ],
  height: 'auto',
  pagerConfig: {
    enabled: false,
  },
  mergeCells: mergeCells.value,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听数据变化更新表格
watch([tableData, mergeCells], ([newData, newMergeCells]) => {
  gridApi.setGridOptions({
    data: newData,
    mergeCells: newMergeCells,
  });
}, { immediate: true });
</script>

<template>
  <div>
    <ComboHistoryDrawer title="套餐历史记录">
      <Grid>
        <template #comboType="{ row }">
          <Tag v-if="row.comboType === 'trial'" color="blue">试用套餐</Tag>
          <Tag v-else-if="row.comboType === 'standard'" color="green">标准套餐</Tag>
          <Tag v-else-if="row.comboType === 'premium'" color="orange">高级套餐</Tag>
          <Tag v-else-if="row.comboType === 'enterprise'" color="purple">企业套餐</Tag>
          <Tag v-else color="default">{{ row.comboType }}</Tag>
        </template>

        <template #using="{ row }">
          <Tag v-if="row.using === true" color="green">是</Tag>
          <Tag v-else color="red">否</Tag>
        </template>

        <template #privilegeName="{ row }">
          <Tag v-if="row.privilegeName" color="blue">{{ row.privilegeName }}</Tag>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Grid>
    </ComboHistoryDrawer>
  </div>
</template>

<style scoped lang="scss"></style>
