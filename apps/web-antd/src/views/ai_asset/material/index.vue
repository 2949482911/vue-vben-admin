<script lang="ts" setup name="AiAssetMaterialPage">
/**
 * AI 资产 · 素材库（菜单入口）
 *
 * 素材库 / 资产 是同一页面的两个分段，另一个入口是 asset/index.vue；
 * 操作按钮与筛选在各面板自己的工具栏里（对齐营销素材库：上边一条工具栏 + 素材网格）。
 */
import { computed } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, Segmented } from 'ant-design-vue';

import { useWorkspaceStore } from '#/store';

import AssetLibrary from '../asset/components/AssetLibrary.vue';
import MaterialLibrary from '../asset/components/MaterialLibrary.vue';
import {
  LIBRARY_PAGE_TABS,
  useLibraryPage,
} from '../asset/components/useLibraryPage';
import WorkspaceRequired from '../asset/components/WorkspaceRequired.vue';
import ElementsLibrary from '../elements/components/ElementsLibrary.vue';

const { topTab } = useLibraryPage('media');

// 域外（旧入口/深链）没有工作区上下文，不发请求
const hasWorkspace = computed(
  () => useWorkspaceStore().workspaceId !== undefined,
);
</script>

<template>
  <Page auto-content-height>
    <div class="library-shell">
      <WorkspaceRequired v-if="!hasWorkspace" />

      <template v-else>
        <Card class="library-tabs">
          <Segmented
            v-model:value="topTab"
            class="library-segmented"
            :options="LIBRARY_PAGE_TABS"
          />
        </Card>

        <MaterialLibrary v-if="topTab === 'media'" />
        <AssetLibrary v-else-if="topTab === 'catalog'" />
        <ElementsLibrary v-else />
      </template>
    </div>
  </Page>
</template>

<style scoped lang="scss">
@use '../asset/components/segmented.scss';

/* 锁高：分段卡固定高度，下面的面板卡占满剩余高度并内部滚动 */
.library-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

/* 页面级分段也用 Card 呈现，保持整页卡片风格 */
.library-tabs {
  flex: none;

  :deep(.ant-card-body) {
    padding: 8px 12px;
  }
}
</style>
