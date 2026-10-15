<script lang="ts" setup name="AiSkillManager">
/**
 * 系统管理 — Skill 管理
 *
 * 平台级 Skill 库：文生图/图生图/修图/文生视频/图生视频/剪辑/打标/推送，场景生成时加载。
 * 接口：/aimodel/skill（save / list 分页 / batch_options）。
 * 创建与编辑均使用 vben 自带抽屉；批量操作统一走 batch_options。
 */
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SkillItem } from '#/api/models/ai_model';
import type { BatchOptions } from '#/api/models/core';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Dropdown, Menu, MenuItem, message, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aiModelApi } from '#/api';
import { BatchOptionsType, TABLE_COMMON_COLUMNS } from '#/constants/locales';

import { SKILL_TYPE_MAP, SKILL_TYPE_OPTIONS } from './constants';
import Create from './create.vue';

// ==================== 创建 / 编辑抽屉 ====================
const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: Create,
});

function openDrawer(row?: SkillItem) {
  createDrawerApi.setData(row ?? {});
  createDrawerApi.open();
}

// ==================== 列表 ====================

const formOptions: VbenFormProps = {
  collapsed: true,
  compact: true,
  schema: [
    { component: 'Input', fieldName: 'name', label: 'Skill 名称' },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: SKILL_TYPE_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'type',
      label: '类型',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: true,
};

const gridOptions: VxeGridProps<SkillItem> = {
  checkboxConfig: { highlight: true, labelField: 'id' },
  columns: [
    { field: 'name', title: 'Skill 名称', minWidth: 160 },
    { field: 'type', slots: { default: 'type' }, title: '类型', width: 120 },
    {
      field: 'defaultModel',
      minWidth: 180,
      slots: { default: 'defaultModel' },
      title: '默认模型',
    },
    { field: 'promptTemplate', title: '提示词模板', minWidth: 240, showOverflow: true },
    ...(TABLE_COMMON_COLUMNS as any),
  ],
  height: 'auto',
  pagerConfig: { enabled: true },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await aiModelApi.fetchSkillList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...(args as Record<string, any>),
        });
      },
    },
  },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
};

const selectedRows = ref<SkillItem[]>([]);
const gridEvents = {
  checkboxAll: ({ records }: { records: SkillItem[] }) => (selectedRows.value = records),
  checkboxChange: ({ records }: { records: SkillItem[] }) => (selectedRows.value = records),
  proxyQuery: () => (selectedRows.value = []),
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

/**
 * 默认模型存的是模型库 id；这里把 id 映射成「模型名（供应商）」展示。
 * 未命中（如历史数据存的是模型名）则回退显示原值。
 */
const modelLabelMap = ref<Record<string, string>>({});

async function loadModelLabels() {
  try {
    const res = await aiModelApi.fetchModelConfigList({
      page: 1,
      pageSize: 500,
    });
    const map: Record<string, string> = {};
    (res?.items ?? []).forEach((m) => {
      map[String(m.id)] = `${m.model ?? ''}（${m.provider ?? m.source ?? ''}）`;
    });
    modelLabelMap.value = map;
  } catch {
    modelLabelMap.value = {};
  }
}

function modelLabel(value?: string) {
  if (!value) {
    return '-';
  }
  return modelLabelMap.value[String(value)] ?? String(value);
}

onMounted(() => {
  void loadModelLabels();
});

function pageReload() {
  gridApi.reload();
  selectedRows.value = [];
}

// ==================== 批量 / 单条操作 ====================

function batchOptions(type: BatchOptionsType, ids: Array<number | string>) {
  return aiModelApi.fetchSkillBatchOptions({
    targetIds: ids.map((id) => String(id)),
    type,
    values: {},
  } as BatchOptions);
}

async function toggleStatus(row: SkillItem) {
  await batchOptions(row.status === 1 ? BatchOptionsType.DISABLE : BatchOptionsType.Enable, [row.id]);
  message.success(row.status === 1 ? '已停用' : '已启用');
  pageReload();
}

async function handleDelete(row: SkillItem) {
  await batchOptions(BatchOptionsType.Delete, [row.id]);
  message.success('删除成功');
  pageReload();
}

async function handleBatchDelete() {
  await batchOptions(BatchOptionsType.Delete, selectedRows.value.map((r) => r.id));
  message.success('批量删除成功');
  pageReload();
}

async function handleBatchEnable() {
  await batchOptions(BatchOptionsType.Enable, selectedRows.value.map((r) => r.id));
  message.success('批量启用成功');
  pageReload();
}

async function handleBatchDisable() {
  await batchOptions(BatchOptionsType.DISABLE, selectedRows.value.map((r) => r.id));
  message.success('批量停用成功');
  pageReload();
}
</script>

<template>
  <Page>
    <Grid>
      <template #type="{ row }">
        <Tag :bordered="false">{{ SKILL_TYPE_MAP[row.type || ''] || row.type || '-' }}</Tag>
      </template>

      <template #defaultModel="{ row }">
        {{ modelLabel(row.defaultModel) }}
      </template>

      <template #status="{ row }">
        <Switch :checked="row.status === 1" @click="toggleStatus(row)" />
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openDrawer(row)">{{ $t('common.edit') }}</Button>
        <Button danger type="link" @click="handleDelete(row)">{{ $t('common.delete') }}</Button>
      </template>

      <template #toolbar-tools>
        <Dropdown :disabled="selectedRows.length === 0" placement="bottomCenter" trigger="click">
          <Button class="mr-2" :disabled="selectedRows.length === 0">
            {{ $t('common.batch_options') }}
          </Button>
          <template #overlay>
            <Menu>
              <MenuItem @click="handleBatchEnable">批量启用</MenuItem>
              <MenuItem @click="handleBatchDisable">批量停用</MenuItem>
              <MenuItem @click="handleBatchDelete">批量删除</MenuItem>
            </Menu>
          </template>
        </Dropdown>
        <Button class="mr-2" type="primary" @click="openDrawer()">
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>

    <CreateDrawer @page-reload="pageReload" />
  </Page>
</template>
