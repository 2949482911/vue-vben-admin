<script lang="ts" setup name="AiAssetPage">
/**
 * AI 资产 · 资产（菜单入口）
 *
 * 素材库 / 资产 是同一页面的两个分段，另一个入口是 material/index.vue，
 * 页面状态与页头文案见 components/useLibraryPage。
 */
import { Page } from "@vben/common-ui";

import { PlusOutlined } from "@ant-design/icons-vue";
import { Button, Segmented } from "ant-design-vue";

import AssetLibrary from "./components/AssetLibrary.vue";
import MaterialLibrary from "./components/MaterialLibrary.vue";
import { LIBRARY_PAGE_TABS, useLibraryPage } from "./components/useLibraryPage";

const { addLabel, meta, openCreate, setPanelRef, topTab } =
  useLibraryPage("catalog");
</script>

<template>
  <Page :description="meta.description" :title="meta.title" auto-content-height>
    <template #extra>
      <Button type="primary" @click="openCreate">
        <template #icon>
          <PlusOutlined />
        </template>
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
@use './components/segmented.scss';
</style>
