<script lang="ts" setup name="SystemDictManage">
/**
 * 系统管理 — 字典管理
 *
 * 左侧字典类型、右侧字典项；均使用 vben 的 vxe Grid，新增/编辑走 vben 抽屉 + 表单。
 * 接口：/dict/type/list|save|batch_options、/dict/data/list|save|batch_options。
 * 任意变更后刷新运行时字典缓存（useDictStore），页面无需重登即可生效。
 */
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { BatchOptions } from '#/api/models/core';
import type { DictDataItem, DictTypeItem } from '#/api/models/dict';

import { nextTick, ref } from 'vue';

import { ColPage, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useDictStore } from '@vben/stores';

import {
  Button,
  Card,
  Dropdown,
  Menu,
  MenuItem,
  message,
  Modal,
  Switch,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { dictApi } from '#/api';
import { BatchOptionsType, STATUS_SELECT } from '#/constants/locales';

import DataDrawerContent from './DataDrawer.vue';
import TypeDrawerContent from './TypeDrawer.vue';

const dictStore = useDictStore();

// ==================== 抽屉 ====================

const [TypeDrawer, typeDrawerApi] = useVbenDrawer({
  connectedComponent: TypeDrawerContent,
});
const [DataDrawer, dataDrawerApi] = useVbenDrawer({
  connectedComponent: DataDrawerContent,
});

// ==================== 状态 ====================

const colProps = {
  leftMaxWidth: 55,
  leftMinWidth: 28,
  leftWidth: 38,
  resizable: true,
  rightWidth: 62,
};

const selectedType = ref<DictTypeItem>();
const selectedData = ref<DictDataItem[]>([]);

// ==================== 字典项 ====================

const dataFormOptions: VbenFormProps = {
  collapsed: true,
  compact: true,
  schema: [
    { component: 'Input', fieldName: 'label', label: '显示文案' },
    { component: 'Input', fieldName: 'value', label: '字典值' },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: $t('common.choice'),
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: true,
  wrapperClass: 'grid-cols-3',
};

const dataGridEvents = {
  checkboxAll: ({ records }: { records: DictDataItem[] }) => {
    selectedData.value = records;
  },
  checkboxChange: ({ records }: { records: DictDataItem[] }) => {
    selectedData.value = records;
  },
  proxyQuery: () => {
    selectedData.value = [];
  },
};

const dataGridOptions: VxeGridProps<DictDataItem> = {
  checkboxConfig: { highlight: true, labelField: 'label' },
  columns: [
    { field: 'label', minWidth: 130, title: '显示文案' },
    { field: 'value', minWidth: 130, title: '字典值' },
    {
      field: 'color',
      slots: { default: 'color' },
      title: '标签颜色',
      width: 120,
    },
    { field: 'sort', title: '排序', width: 70 },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 76 },
    {
      field: 'updateTime',
      formatter: 'formatDateTime',
      title: '更新时间',
      width: 160,
    },
    { slots: { default: 'action' }, title: '操作', width: 120 },
  ],
  height: 'auto',
  pagerConfig: { enabled: true },
  proxyConfig: {
    autoLoad: false,
    ajax: {
      query: async ({ page }, args) => {
        if (!selectedType.value) {
          return { items: [], total: 0 };
        }
        return await dictApi.fetchDataList({
          dictCode: selectedType.value.code,
          page: page.currentPage,
          pageSize: page.pageSize,
          ...(args as Record<string, any>),
        });
      },
    },
  },
  toolbarConfig: { custom: false, export: false, refresh: true, zoom: false },
};

const [DataGrid, dataGridApi] = useVbenVxeGrid({
  formOptions: dataFormOptions,
  gridEvents: dataGridEvents,
  gridOptions: dataGridOptions,
});

// ==================== 字典类型 ====================

const typeFormOptions: VbenFormProps = {
  collapsed: true,
  compact: true,
  schema: [
    { component: 'Input', fieldName: 'name', label: '名称' },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: $t('common.choice'),
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: true,
  wrapperClass: 'grid-cols-2',
};

const typeGridEvents = {
  radioChange: ({ row }: { row: DictTypeItem }) => {
    selectedType.value = row;
    void dataGridApi.reload();
  },
  /** 数据装载后回显选中项（刷新/保存/筛选后保持左侧联动） */
  proxyQuery: () => {
    const current = selectedType.value;
    if (!current) {
      return;
    }
    void nextTick(() => {
      typeGridApi.grid.setRadioRow(current);
    });
  },
};

const typeGridOptions: VxeGridProps<DictTypeItem> = {
  columns: [
    { type: 'radio', width: 46 },
    { field: 'name', minWidth: 150, title: '字典名称' },
    {
      field: 'dataCount',
      slots: { default: 'dataCount' },
      title: '数据量',
      width: 90,
    },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 76 },
    { slots: { default: 'action' }, title: '操作', width: 116 },
  ],
  height: 'auto',
  pagerConfig: { enabled: false },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async (_params, args) => {
        const res = await dictApi.fetchTypeList({
          page: 1,
          pageSize: 500,
          ...(args as Record<string, any>),
        });
        const items = res?.items ?? [];
        if (!selectedType.value && items[0]) {
          selectedType.value = items[0];
          // 等右侧 Grid 挂载完成后再触发首次加载
          void nextTick(() => dataGridApi.reload());
        }
        return res;
      },
    },
  },
  radioConfig: { highlight: true, reserve: true, trigger: 'row' },
  toolbarConfig: { custom: false, export: false, refresh: true, zoom: false },
};

const [TypeGrid, typeGridApi] = useVbenVxeGrid({
  formOptions: typeFormOptions,
  gridEvents: typeGridEvents,
  gridOptions: typeGridOptions,
});

// ==================== 运行时缓存 ====================

function refreshRuntimeDict() {
  return dictStore.loadAllDicts(true).catch(() => {});
}

// ==================== 类型操作 ====================

function openTypeDrawer(row?: DictTypeItem) {
  typeDrawerApi.setData(row ?? {});
  typeDrawerApi.open();
}

async function onTypeSaved() {
  await refreshRuntimeDict();
  await typeGridApi.reload();
}

async function toggleTypeStatus(row: DictTypeItem) {
  const disabling = row.status === 1;
  await dictApi.batchTypeOptions({
    targetIds: [String(row.id)],
    type: disabling ? BatchOptionsType.DISABLE : BatchOptionsType.Enable,
    values: {},
  } as BatchOptions);
  message.success(disabling ? '已停用' : '已启用');
  await refreshRuntimeDict();
  await typeGridApi.reload();
}

function removeType(row: DictTypeItem) {
  Modal.confirm({
    content: '仅当该类型下没有字典项时可删除；删除后不可恢复。',
    okType: 'danger',
    async onOk() {
      await dictApi.batchTypeOptions({
        targetIds: [String(row.id)],
        type: BatchOptionsType.Delete,
        values: {},
      } as BatchOptions);
      const removingCurrent =
        String(selectedType.value?.id) === String(row.id);
      if (removingCurrent) {
        selectedType.value = undefined;
      }
      message.success('已删除');
      await refreshRuntimeDict();
      await typeGridApi.reload();
      if (!selectedType.value) {
        void dataGridApi.reload();
      }
    },
    title: `删除字典类型「${row.name}」？`,
  });
}

// ==================== 字典项操作 ====================

function openDataDrawer(row?: DictDataItem) {
  if (!selectedType.value && !row) {
    message.warning('请先选择左侧字典类型');
    return;
  }
  dataDrawerApi.setData({
    dictCode: row?.dictCode ?? selectedType.value?.code,
    dictName: selectedType.value?.name,
    row: row ?? {},
  });
  dataDrawerApi.open();
}

async function onDataSaved() {
  await refreshRuntimeDict();
  await dataGridApi.reload();
}

async function toggleDataStatus(row: DictDataItem) {
  const disabling = row.status === 1;
  await dictApi.batchDataOptions({
    targetIds: [String(row.id)],
    type: disabling ? BatchOptionsType.DISABLE : BatchOptionsType.Enable,
    values: {},
  } as BatchOptions);
  message.success(disabling ? '已停用' : '已启用');
  await onDataSaved();
}

function removeData(row: DictDataItem) {
  Modal.confirm({
    okType: 'danger',
    async onOk() {
      await dictApi.batchDataOptions({
        targetIds: [String(row.id)],
        type: BatchOptionsType.Delete,
        values: {},
      } as BatchOptions);
      message.success('已删除');
      await onDataSaved();
    },
    title: `删除字典项「${row.label}」？`,
  });
}

async function batchData(type: BatchOptionsType) {
  const ids = selectedData.value.map((row) => String(row.id));
  if (ids.length === 0) {
    return;
  }
  await dictApi.batchDataOptions({
    targetIds: ids,
    type,
    values: {},
  } as BatchOptions);
  message.success('操作成功');
  await onDataSaved();
}

function confirmBatchDelete() {
  const ids = selectedData.value.map((row) => String(row.id));
  if (ids.length === 0) {
    return;
  }
  Modal.confirm({
    content: '删除后不可恢复，请确认。',
    okType: 'danger',
    async onOk() {
      await dictApi.batchDataOptions({
        targetIds: ids,
        type: BatchOptionsType.Delete,
        values: {},
      } as BatchOptions);
      message.success(`已删除 ${ids.length} 个字典项`);
      await onDataSaved();
    },
    title: `批量删除 ${ids.length} 个字典项？`,
  });
}
</script>

<template>
  <ColPage v-bind="colProps">
    <template #left>
      <Card class="dict-pane" title="字典类型">
        <TypeGrid>
          <template #dataCount="{ row }">
            <Tag :bordered="false">{{ row.dataCount ?? 0 }} 项</Tag>
          </template>

          <template #status="{ row }">
            <Switch
              size="small"
              :checked="row.status === 1"
              @click.stop="toggleTypeStatus(row)"
            />
          </template>

          <template #action="{ row }">
            <Button type="link" @click="openTypeDrawer(row)">
              {{ $t('common.edit') }}
            </Button>
            <Button danger type="link" @click="removeType(row)">
              {{ $t('common.delete') }}
            </Button>
          </template>

          <template #toolbar-tools>
            <Button class="mr-2" type="primary" @click="openTypeDrawer()">
              {{ $t('common.create') }}
            </Button>
          </template>
        </TypeGrid>
      </Card>
    </template>

    <Card
      class="dict-pane ml-2"
      :title="
        selectedType ? `${selectedType.name} · 字典项` : '字典项'
      "
    >
      <DataGrid>
        <template #color="{ row }">
          <span v-if="row.color" class="dict-color">
            <i :style="{ background: row.color }"></i>
            {{ row.color }}
          </span>
          <span v-else class="text-muted-foreground">-</span>
        </template>

        <template #status="{ row }">
          <Switch
            size="small"
            :checked="row.status === 1"
            @click.stop="toggleDataStatus(row)"
          />
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openDataDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button danger type="link" @click="removeData(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>

        <template #toolbar-tools>
          <Dropdown
            :disabled="selectedData.length === 0"
            placement="bottomCenter"
            trigger="click"
          >
            <Button class="mr-2" :disabled="selectedData.length === 0">
              批量操作{{ selectedData.length ? `（${selectedData.length}）` : '' }}
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem @click="batchData(BatchOptionsType.Enable)">
                  批量启用
                </MenuItem>
                <MenuItem @click="batchData(BatchOptionsType.DISABLE)">
                  批量停用
                </MenuItem>
                <MenuItem @click="confirmBatchDelete">批量删除</MenuItem>
              </Menu>
            </template>
          </Dropdown>
          <Button
            class="mr-2"
            type="primary"
            :disabled="!selectedType"
            @click="openDataDrawer()"
          >
            {{ $t('common.create') }}
          </Button>
        </template>
      </DataGrid>
    </Card>

    <TypeDrawer @success="onTypeSaved" />
    <DataDrawer @success="onDataSaved" />
  </ColPage>
</template>

<style scoped lang="scss">
/* 卡片撑满左右分栏，Grid 在卡内自行滚动 */
.dict-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  :deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
    padding: 12px;
  }
}

.dict-color {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;

  i {
    width: 12px;
    height: 12px;
    border: 1px solid hsl(var(--border));
    border-radius: 3px;
  }
}
</style>
