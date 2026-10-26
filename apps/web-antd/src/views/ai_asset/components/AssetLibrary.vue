<script lang="ts" setup name="AssetLibrary">
/**
 * 资产（角色 / 场景 / 分集）
 *
 * 三分段各自一个面板组件（components/assets/*），本组件只负责：
 * 拉取三份列表（计数用）、分段切换、以及右上角「新增 X」转发给当前面板。
 */
import type {
  AssetType,
  CharacterItem,
  EpisodeItem,
  SceneItem,
} from '#/api/models/ai_asset';

import { computed, onMounted, ref } from 'vue';

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, Spin } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { ASSET_TYPE_META, ASSET_TYPE_OPTIONS } from '../constants';
import CharacterPanel from './assets/CharacterPanel.vue';
import EpisodePanel from './assets/EpisodePanel.vue';
import ScenePanel from './assets/ScenePanel.vue';
import SegTabs from './SegTabs.vue';

/** 面板暴露的方法（右上角按钮转发用） */
interface PanelExpose {
  openCreate: () => void;
}

const activeTab = ref<AssetType>('character');
const loading = ref(false);
const characters = ref<CharacterItem[]>([]);
const scenes = ref<SceneItem[]>([]);
const episodes = ref<EpisodeItem[]>([]);

const panelRef = ref<null | PanelExpose>(null);

function countOf(type: AssetType): number {
  if (type === 'character') {
    return characters.value.length;
  }
  if (type === 'scene') {
    return scenes.value.length;
  }
  return episodes.value.length;
}

const tabOptions = computed(() =>
  ASSET_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
    count: countOf(option.value),
  })),
);

async function load() {
  loading.value = true;
  try {
    const [ch, sc, ep] = await Promise.all([
      aiAssetApi.fetchCharacters(),
      aiAssetApi.fetchScenes(),
      aiAssetApi.fetchEpisodes(),
    ]);
    characters.value = ch ?? [];
    scenes.value = sc ?? [];
    episodes.value = ep ?? [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  panelRef.value?.openCreate();
}

onMounted(load);
</script>

<template>
  <div class="page-head">
    <div>
      <h1 class="page-title">资产</h1>
      <p class="page-sub">角色 / 场景 / 分集 —— 多轮生成「一致性」的锚</p>
    </div>
    <Button type="primary" @click="openCreate">
      <template #icon><PlusOutlined /></template>
      {{ ASSET_TYPE_META[activeTab].add }}
    </Button>
  </div>

  <div class="filterbar">
    <SegTabs v-model="activeTab" :options="tabOptions" size="sm" />
  </div>

  <Spin :spinning="loading">
    <CharacterPanel
      v-if="activeTab === 'character'"
      ref="panelRef"
      :items="characters"
      @changed="load"
    />
    <ScenePanel
      v-else-if="activeTab === 'scene'"
      ref="panelRef"
      :items="scenes"
      @changed="load"
    />
    <EpisodePanel
      v-else
      ref="panelRef"
      :items="episodes"
      @changed="load"
    />
  </Spin>
</template>

<style scoped lang="scss">
.page-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.page-sub {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.filterbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
</style>
