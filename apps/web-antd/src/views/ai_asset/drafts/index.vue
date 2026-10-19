<script lang="ts" setup name="AiAssetDrafts">
/**
 * AI 资产 — 草稿区
 *
 * 生成与调整中的素材（status=1 草稿），与正式素材库隔离、不双写。
 * 接口：material/list（分页，固定 status=1）、material/confirm（确认入库 + AI 打标）、material/version（版本链）。
 * 说明：素材生成在「创作工作台」承载，本期未接入。
 */
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MaterialItem } from '#/api/models/ai_asset';

import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Image, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aiAssetApi } from '#/api';
import { useWorkspaceStore } from '#/store';

import { MATERIAL_STATUS_MAP, MATERIAL_TYPE_MAP, MATERIAL_TYPE_OPTIONS } from '../constants';
import { workspacePagePath } from '../workspace/menu';
import VersionDrawer from './VersionDrawer.vue';

// ==================== 版本抽屉 ====================
const [Version, versionApi] = useVbenDrawer({
  connectedComponent: VersionDrawer,
});

const router = useRouter();
const workspaceStore = useWorkspaceStore();

/** 重新编辑：跳创作台并带上 materialId（创作台会自动回填参数并进入迭代态） */
function handleReedit(row: any) {
  const wsId = workspaceStore.workspaceId;
  if (wsId === undefined) {
    message.warning('请先进入工作区');
    return;
  }
  void router.push({
    path: workspacePagePath(wsId, 'studio'),
    query: { materialId: String(row.id) },
  });
}

function openVersion(row: MaterialItem) {
  versionApi.setData({ materialId: row.id });
  versionApi.open();
}

// ==================== 列表 ====================

const formOptions: VbenFormProps = {
  collapsed: true,
  compact: true,
  schema: [
    {
      component: 'Select',
      componentProps: { allowClear: true, options: MATERIAL_TYPE_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'materialType',
      label: '素材类型',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: true,
};

const gridOptions: VxeGridProps<MaterialItem> = {
  columns: [
    { field: 'thumbnailUrl', slots: { default: 'thumb' }, title: '预览', width: 90 },
    { field: 'materialType', slots: { default: 'type' }, title: '素材类型', width: 110 },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 100 },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间', minWidth: 170 },
    { slots: { default: 'action' }, title: '操作', width: 240 },
  ],
  height: 'auto',
  pagerConfig: { enabled: true },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await aiAssetApi.fetchMaterialList({
          page: page.currentPage,
          pageSize: page.pageSize,
          status: 1, // 草稿区：仅草稿
          ...(args as Record<string, any>),
        });
      },
    },
  },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

async function handleConfirm(row: MaterialItem) {
  Modal.confirm({
    title: '确认定稿',
    content:
      '确认后素材进入「已确认」（设计定稿）；之后可在素材库勾选后「入库到素材库」推到营销素材库。',
    okText: '确认定稿',
    async onOk() {
      await aiAssetApi.confirmMaterial(row.id);
      message.success('已确认定稿');
      pageReload();
    },
  });
}
</script>

<template>
  <Page>
    <Grid>
      <template #thumb="{ row }">
        <Image
          v-if="row.thumbnailUrl || row.storageUrl"
          fallback=""
          :src="row.thumbnailUrl || row.storageUrl"
          :width="48"
          :height="48"
        />
        <span v-else>-</span>
      </template>

      <template #type="{ row }">
        {{ MATERIAL_TYPE_MAP[row.materialType || ''] || row.materialType || '-' }}
      </template>

      <template #status="{ row }">
        <Tag :bordered="false" :color="MATERIAL_STATUS_MAP[row.status ?? 1]?.color || 'default'">
          {{ MATERIAL_STATUS_MAP[row.status ?? 1]?.label || row.status }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openVersion(row)">版本</Button>
        <Button type="link" @click="handleReedit(row)">重新编辑</Button>
        <Button type="link" @click="handleConfirm(row)">确认定稿</Button>
      </template>
    </Grid>

    <Version />
  </Page>
</template>
