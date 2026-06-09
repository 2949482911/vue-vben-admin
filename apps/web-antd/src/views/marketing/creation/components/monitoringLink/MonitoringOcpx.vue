<script setup lang="ts" name="MonitoringOcpx">
// OCPX 任务列表选择组件 - 供后续全媒体批投公用
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { ocpxTaskApi } from "#/api/core/ocpx";
import { ref } from "vue";
import type { OcpxTaskItem, OpcxTaskPageRequest } from "#/api/models/ocpx";
import { trimObject } from "#/utils/trim";
import { Tag } from "ant-design-vue";

// const props = defineProps<{
//   linkModeType: string;
//   allocateType: string;
// }>();

const emit = defineEmits<{
  'update:modelValue': [value: {monitorLink: string; ocpxTaskId?: string}];
}>();

// 临时选中行
const tempSelectedRow = ref<OcpxTaskItem | null>(null);

// Grid 表单配置
const formOptions = {
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入任务名称',
      },
      fieldName: 'name',
      label: '任务名称',
    },
  ],
  showCollapseButton: false,
  submitOnEnter: false,
};

// Grid 配置
const gridOptions: VxeGridProps = {
  border: true,
  rowConfig: {keyField: 'id'},
  checkboxConfig: {highlight: true, reserve: true, trigger: 'row', checkMethod: ({row}) => {
    // 只允许单选
    return !tempSelectedRow.value || tempSelectedRow.value.id === row.id;
  }},
  radioConfig: {highlight: true},
  toolbarConfig: {custom: true, refresh: true, zoom: true},
  columns: [
    {field: 'name', title: '任务名称', width: 'auto'},
    {field: 'platform', title: '平台', width: 'auto'},
    {
      field: 'taskState',
      title: '状态',
      width: 'auto',
      slots: {default: 'taskState'},
    },
  ],
  height: '400px',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args) as OpcxTaskPageRequest;
        const res = await ocpxTaskApi.fetchOcpxTaskList(params);
        // 恢复勾选状态
        setTimeout(() => {
          const grid = gridApi.grid;
          if (grid && tempSelectedRow.value) {
            grid.setCheckboxRow(tempSelectedRow.value, true);
          }
        }, 100);
        return res;
      },
    },
  },
};

// Grid 事件
const gridEvents = {
  radioChange: ({row}) => {
    tempSelectedRow.value = row;
    emitUpdate();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions, gridEvents});

function emitUpdate() {
  if (tempSelectedRow.value) {
    emit('update:modelValue', {
      monitorLink: tempSelectedRow.value.description || '',
      ocpxTaskId: tempSelectedRow.value.id,
    });
  }
}

// 外部重置选中
function resetSelection() {
  tempSelectedRow.value = null;
  gridApi.grid?.clearCheckboxRow();
  gridApi.grid?.clearCheckboxReserve();
}

// 查询
function query() {
  gridApi.query();
}

defineExpose({resetSelection, query});
</script>

<template>
  <div>
    <Grid>
      <template #taskState="{ row }">
        <Tag color="green" v-if="row.taskState === 1">启用</Tag>
        <Tag v-else color="red">不启用</Tag>
      </template>
    </Grid>
  </div>
</template>

<style scoped lang="scss">
</style>
