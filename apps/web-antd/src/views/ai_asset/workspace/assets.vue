<script lang="ts" setup name="AiAssetWorkspaceAssets">
/**
 * 工作区内 · 资产
 *
 * 复用现有「素材库 / 资产」页面（components 见 views/ai_asset/asset/components），
 * 数据由 request 拦截器自动带 X-Workspace-Id 过滤到当前工作区。
 * 操作按钮与筛选在各面板自己的工具栏里（对齐营销素材库）。
 */
import { Page } from '@vben/common-ui';

import { Card, Segmented } from 'ant-design-vue';

import AssetLibrary from '../asset/components/AssetLibrary.vue';
import MaterialLibrary from '../asset/components/MaterialLibrary.vue';
import {
  LIBRARY_PAGE_TABS,
  useLibraryPage,
} from '../asset/components/useLibraryPage';
import ElementsLibrary from '../elements/components/ElementsLibrary.vue';

const { topTab } = useLibraryPage('media');
</script>

<template>
  <Page auto-content-height>
    <div class="library-shell">
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
