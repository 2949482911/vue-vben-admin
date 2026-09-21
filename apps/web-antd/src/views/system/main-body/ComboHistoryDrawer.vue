<script lang="ts" setup name="ComboInfoDrawer">
import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { computed, ref, watch } from 'vue';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import type { MainBodyItem, MainBodyItemCombo } from '#/api/models/main-body';

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[75%]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data = drawerApi.getData() as MainBodyItem | undefined;
      comboHistory.value = data?.mainBodyCombo ?? [];
    } else {
      comboHistory.value = [];
    }
  },
});

const comboHistory = ref<MainBodyItemCombo[]>([]);

// 套餐类型展示
const comboTypeMap = computed<Record<string, { color: string; label: string }>>(
  () => ({
    trial: { color: 'blue', label: $t('system.mainbody.combo.types.trial') },
    standard: {
      color: 'green',
      label: $t('system.mainbody.combo.types.standard'),
    },
    premium: {
      color: 'orange',
      label: $t('system.mainbody.combo.types.premium'),
    },
    enterprise: {
      color: 'purple',
      label: $t('system.mainbody.combo.types.enterprise'),
    },
  }),
);

// 将套餐数据转换为表格数据，每个套餐的每个权益作为一行
const tableData = computed(() => {
  const result: any[] = [];

  comboHistory.value.forEach((combo) => {
    if (combo.comboPrivilegeItems && combo.comboPrivilegeItems.length > 0) {
      combo.comboPrivilegeItems.forEach((privilege) => {
        result.push({
          comboName: combo.comboName,
          comboType: combo.comboType,
          startTime: combo.startTime,
          endTime: combo.endTime,
          using: combo.using,
          createTime: combo.createTime,
          createUsername: combo.createUsername,
          privilegeName: privilege.privilegeName,
          privilegeCode: privilege.privilegeCode,
          quota: privilege.quota,
          unit: privilege.unit,
        });
      });
    } else {
      result.push({
        comboName: combo.comboName,
        comboType: combo.comboType,
        startTime: combo.startTime,
        endTime: combo.endTime,
        using: combo.using,
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

  comboHistory.value.forEach((combo) => {
    const privilegeCount = combo.comboPrivilegeItems?.length || 1;

    if (privilegeCount > 1) {
      [0, 1, 2, 3, 4, 5].forEach((col) => {
        merges.push({
          row: rowIndex,
          col,
          rowspan: privilegeCount,
          colspan: 1,
        });
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
      title: `${$t('system.mainbody.combo.comboName')}`,
      width: 'auto',
    },
    {
      field: 'comboType',
      title: `${$t('system.mainbody.combo.comboType')}`,
      width: 'auto',
      slots: { default: 'comboType' },
    },
    {
      field: 'startTime',
      title: `${$t('system.mainbody.combo.startTime')}`,
      width: 'auto',
    },
    {
      field: 'endTime',
      title: `${$t('system.mainbody.combo.endTime')}`,
      width: 'auto',
    },
    {
      field: 'using',
      title: `${$t('system.mainbody.combo.using')}`,
      width: 'auto',
      slots: { default: 'using' },
    },
    {
      field: 'createTime',
      title: `${$t('core.columns.createTime')}`,
      width: 'auto',
    },
    {
      field: 'createUsername',
      title: `${$t('core.columns.createUsername')}`,
      width: 'auto',
    },
    {
      title: `${$t('system.mainbody.combo.privilege')}`,
      children: [
        {
          field: 'privilegeName',
          title: `${$t('system.mainbody.combo.privilegeName')}`,
          width: 'auto',
          slots: { default: 'privilegeName' },
        },
        {
          field: 'quota',
          title: `${$t('system.mainbody.combo.quota')}`,
          width: 'auto',
        },
        {
          field: 'unit',
          title: `${$t('system.mainbody.combo.unit')}`,
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

watch(
  [tableData, mergeCells],
  ([newData, newMergeCells]) => {
    gridApi.setGridOptions({
      data: newData,
      mergeCells: newMergeCells,
    });
  },
  { immediate: true },
);
</script>

<template>
  <Drawer :title="$t('system.mainbody.combo.title')">
    <Grid>
      <template #comboType="{ row }">
        <Tag :color="comboTypeMap[row.comboType]?.color ?? 'default'">
          {{ comboTypeMap[row.comboType]?.label ?? row.comboType }}
        </Tag>
      </template>

      <template #using="{ row }">
        <Tag v-if="row.using === true" color="green">
          {{ $t('system.mainbody.combo.yes') }}
        </Tag>
        <Tag v-else color="red">{{ $t('system.mainbody.combo.no') }}</Tag>
      </template>

      <template #privilegeName="{ row }">
        <Tag v-if="row.privilegeName" color="blue">
          {{ row.privilegeName }}
        </Tag>
        <span v-else class="text-gray-400">-</span>
      </template>
    </Grid>
  </Drawer>
</template>
