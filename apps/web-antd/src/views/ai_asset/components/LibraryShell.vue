<script lang="ts" setup name="LibraryShell">
/**
 * AI 资产 —— 素材库 / 资产 页面壳
 *
 * 顶部「素材库 / 资产」分段 + 对应面板。两个菜单入口（素材库、资产）共用本组件，
 * 只靠 defaultTab 决定进来先落在哪一段，保证哪一侧都能切到另一侧。
 */
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import AssetLibrary from './AssetLibrary.vue';
import MaterialLibrary from './MaterialLibrary.vue';
import SegTabs from './SegTabs.vue';

const props = withDefaults(
  defineProps<{ defaultTab?: 'catalog' | 'media' }>(),
  { defaultTab: 'media' },
);

const PAGE_TABS = [
  { label: '素材库', value: 'media' },
  { label: '资产', value: 'catalog' },
];

const topTab = ref<string>(props.defaultTab);
</script>

<template>
  <Page>
    <SegTabs v-model="topTab" :options="PAGE_TABS" />
    <MaterialLibrary v-if="topTab === 'media'" />
    <AssetLibrary v-else />
  </Page>
</template>
