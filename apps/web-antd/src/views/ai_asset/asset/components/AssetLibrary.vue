<script lang="ts" setup name="AssetLibrary">
/**
 * 资产（角色 / 场景 / 分集）
 *
 * 三分段各自一个面板组件（components/assets/*），本组件负责：
 * 服务端分页拉取（每次只取当前段当前页）、分段计数、分段切换、右上角「新增 X」转发给当前面板。
 * 后端：character / scene / episode 的 list 均为分页接口（page/pageSize → PageResponse）。
 */
import type {
  AssetType,
  CharacterItem,
  EpisodeItem,
  SceneItem,
} from '#/api/models/ai_asset';

import { computed, onMounted, ref, watch } from 'vue';

import { VbenLoading } from '@vben/common-ui';

import { Pagination, Segmented } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { ASSET_TYPE_META, ASSET_TYPE_OPTIONS } from '../../constants';
import CharacterPanel from './panels/CharacterPanel.vue';
import EpisodePanel from './panels/EpisodePanel.vue';
import ScenePanel from './panels/ScenePanel.vue';

/** 面板暴露的方法（右上角按钮转发用） */
interface PanelExpose {
  openCreate: () => void;
}

const activeTab = ref<AssetType>('character');
const loading = ref(false);
const page = ref(1);
const pageSize = ref(12);
const total = ref(0);

// 当前分段的列表（每次只加载一段）
const characters = ref<CharacterItem[]>([]);
const scenes = ref<SceneItem[]>([]);
const episodes = ref<EpisodeItem[]>([]);
// 各分段总数（分段计数徽标；pageSize=1 只取 total）
const counts = ref<Record<string, number>>({});

const panelRef = ref<null | PanelExpose>(null);

const tabOptions = computed(() =>
  ASSET_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
);

function labelOf(value: any): string {
  return tabOptions.value.find((option) => option.value === value)?.label ?? '';
}

async function loadCounts() {
  const [ch, sc, ep] = await Promise.all([
    aiAssetApi.fetchCharacters({ page: 1, pageSize: 1 }),
    aiAssetApi.fetchScenes({ page: 1, pageSize: 1 }),
    aiAssetApi.fetchEpisodes({ page: 1, pageSize: 1 }),
  ]);
  counts.value = {
    character: ch?.total ?? 0,
    episode: ep?.total ?? 0,
    scene: sc?.total ?? 0,
  };
}

/** 只加载当前分段的当前页 */
async function load() {
  loading.value = true;
  try {
    const params = { page: page.value, pageSize: pageSize.value };
    if (activeTab.value === 'character') {
      const res = await aiAssetApi.fetchCharacters(params);
      characters.value = res?.items ?? [];
      total.value = res?.total ?? 0;
    } else if (activeTab.value === 'scene') {
      const res = await aiAssetApi.fetchScenes(params);
      scenes.value = res?.items ?? [];
      total.value = res?.total ?? 0;
    } else {
      const res = await aiAssetApi.fetchEpisodes(params);
      episodes.value = res?.items ?? [];
      total.value = res?.total ?? 0;
    }
  } finally {
    loading.value = false;
  }
  // 新增/删除后当前页可能越界，回到最后一页
  const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value));
  if (page.value > maxPage) {
    page.value = maxPage;
    void load();
  }
}

/** 增删改后：当前页 + 计数一起刷新 */
function onChanged() {
  void Promise.all([load(), loadCounts()]);
}

function switchTab(value: any) {
  if (value === activeTab.value) {
    return;
  }
  activeTab.value = value as AssetType;
  page.value = 1;
  void load();
}

function handlePageChange(current: number, size: number) {
  page.value = current;
  pageSize.value = size;
}

function openCreate() {
  panelRef.value?.openCreate();
}

/** 右上角「新增 X」按钮文案随分段变化 */
const addLabel = computed(() => ASSET_TYPE_META[activeTab.value].add);

watch([page, pageSize], () => {
  void load();
});

onMounted(() => {
  void loadCounts();
  void load();
});

defineExpose({ addLabel, openCreate });
</script>

<template>
  <div class="library-body">
    <div class="filterbar">
      <Segmented
        class="library-segmented"
        :options="tabOptions"
        :value="activeTab"
        @change="switchTab"
      >
        <template #label="{ value }">
          <span class="seg-label">
            {{ labelOf(value) }}
            <span class="seg-count">{{ counts[value] ?? 0 }}</span>
          </span>
        </template>
      </Segmented>
    </div>

    <CharacterPanel
      v-if="activeTab === 'character'"
      ref="panelRef"
      :items="characters"
      @changed="onChanged"
    />
    <ScenePanel
      v-else-if="activeTab === 'scene'"
      ref="panelRef"
      :items="scenes"
      @changed="onChanged"
    />
    <EpisodePanel
      v-else
      ref="panelRef"
      :items="episodes"
      @changed="onChanged"
    />

    <div v-if="total > 0" class="pager">
      <Pagination
        :current="page"
        :page-size="pageSize"
        show-size-changer
        :show-total="(t: number) => `共 ${t} 项`"
        :total="total"
        @change="handlePageChange"
      />
    </div>

    <VbenLoading :spinning="loading" />
  </div>
</template>

<style scoped lang="scss">
@use './segmented.scss';

.library-body {
  position: relative;
  min-height: 200px;
}

.filterbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
