<script lang="ts" setup name="AiAssetMaterialPage">
/**
 * AI 资产 · 素材库（菜单入口）
 *
 * 素材库 / 资产 是同一页面的两个分段，另一个入口是 asset/index.vue，
 * 页面状态与页头文案见 components/useLibraryPage。
 */
import { computed } from 'vue';

import { Page } from '@vben/common-ui';

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, Segmented } from 'ant-design-vue';

import { useWorkspaceStore } from '#/store';

import AssetLibrary from '../asset/components/AssetLibrary.vue';
import MaterialLibrary from '../asset/components/MaterialLibrary.vue';
import {
  LIBRARY_PAGE_TABS,
  useLibraryPage,
} from '../asset/components/useLibraryPage';
import WorkspaceRequired from '../asset/components/WorkspaceRequired.vue';

const { addLabel, meta, openCreate, setPanelRef, topTab } =
  useLibraryPage('media');

// 域外（旧入口/深链）没有工作区上下文，不发请求
const hasWorkspace = computed(
  () => useWorkspaceStore().workspaceId !== undefined,
);
</script>

<template>
  <Page :description="meta.description" :title="meta.title">
    <template #extra>
      <Button v-if="hasWorkspace" type="primary" @click="openCreate">
        <template #icon><PlusOutlined /></template>
        {{ addLabel }}
      </Button>
    </template>

    <WorkspaceRequired v-if="!hasWorkspace" />

    <template v-else>
      <Segmented
        v-model:value="topTab"
        class="library-segmented mb-3"
        :options="LIBRARY_PAGE_TABS"
      />

      <MaterialLibrary v-if="topTab === 'media'" :ref="setPanelRef" />
      <AssetLibrary v-else :ref="setPanelRef" />
    </template>
  </Page>
</template>

<style scoped lang="scss">
@use '../asset/components/segmented.scss';
</style>
