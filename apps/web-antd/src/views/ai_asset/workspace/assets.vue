<script lang="ts" setup name="AiAssetWorkspaceAssets">
/**
 * 工作区内 · 资产
 *
 * 复用现有「素材库 / 资产」页面（components 见 views/ai_asset/asset/components），
 * 数据由 request 拦截器自动带 X-Workspace-Id 过滤到当前工作区。
 */
import { Page } from '@vben/common-ui';

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, Segmented } from 'ant-design-vue';

import AssetLibrary from '../asset/components/AssetLibrary.vue';
import MaterialLibrary from '../asset/components/MaterialLibrary.vue';
import {
  LIBRARY_PAGE_TABS,
  useLibraryPage,
} from '../asset/components/useLibraryPage';

const { addLabel, meta, openCreate, setPanelRef, topTab } =
  useLibraryPage('media');
</script>

<template>
  <Page :description="meta.description" :title="meta.title">
    <template #extra>
      <Button type="primary" @click="openCreate">
        <template #icon><PlusOutlined /></template>
        {{ addLabel }}
      </Button>
    </template>

    <Segmented
      v-model:value="topTab"
      class="library-segmented mb-3"
      :options="LIBRARY_PAGE_TABS"
    />

    <MaterialLibrary v-if="topTab === 'media'" :ref="setPanelRef" />
    <AssetLibrary v-else :ref="setPanelRef" />
  </Page>
</template>

<style scoped lang="scss">
@use '../asset/components/segmented.scss';
</style>
