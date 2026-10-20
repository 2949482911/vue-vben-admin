<script lang="ts" setup name="AiAssetNovelStudio">
/**
 * 小说创作（工作区内）
 *
 * 小说 → 分集 → 剧本 三级 LLM 创作：
 * - AI 生成小说：novel/generate（同步 20~120s）→ 自动带出分集
 * - 批量生成分集：novel/episodes/generate
 * - 生成剧本：episode/script/generate（回写 EpisodeItem.script）
 * 列表：novel/list 与 episode/list 均为分页接口。
 */
import type { EpisodeItem, NovelItem } from '#/api/models/ai_asset';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  BookOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { Button, Card, Empty, Input, Pagination, Tag } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import EpisodeGenerateDrawer from './components/EpisodeGenerateDrawer.vue';
import EpisodeScriptDrawer from './components/EpisodeScriptDrawer.vue';
import NovelGenerateDrawer from './components/NovelGenerateDrawer.vue';

const [NovelDrawer, novelDrawerApi] = useVbenDrawer({
  connectedComponent: NovelGenerateDrawer,
});
const [EpisodeDrawer, episodeDrawerApi] = useVbenDrawer({
  connectedComponent: EpisodeGenerateDrawer,
});
const [ScriptDrawer, scriptDrawerApi] = useVbenDrawer({
  connectedComponent: EpisodeScriptDrawer,
});

// ==================== 小说 ====================

const novels = ref<NovelItem[]>([]);
const novelLoading = ref(false);
const novelKeyword = ref('');
const novelSearch = ref('');
const novelPage = ref(1);
const novelPageSize = ref(8);
const novelTotal = ref(0);
const selectedNovelId = ref<number | string>();

const selectedNovel = computed(() =>
  novels.value.find((item) => String(item.id) === String(selectedNovelId.value)),
);

async function loadNovels() {
  novelLoading.value = true;
  try {
    const res = await aiAssetApi.fetchNovelList({
      name: novelSearch.value || undefined,
      page: novelPage.value,
      pageSize: novelPageSize.value,
    });
    novels.value = res?.items ?? [];
    novelTotal.value = res?.total ?? novels.value.length;
    const stillThere = novels.value.some(
      (item) => String(item.id) === String(selectedNovelId.value),
    );
    if (!stillThere) {
      selectedNovelId.value = novels.value[0]?.id;
      void loadEpisodes();
    }
  } finally {
    novelLoading.value = false;
  }
}

function handleNovelSearch() {
  novelSearch.value = novelKeyword.value.trim();
  novelPage.value = 1;
  void loadNovels();
}

function handleNovelKeywordChange() {
  if (!novelKeyword.value) {
    handleNovelSearch();
  }
}

function selectNovel(row: NovelItem) {
  if (String(row.id) === String(selectedNovelId.value)) {
    return;
  }
  selectedNovelId.value = row.id;
  void loadEpisodes();
}

// ==================== 分集 ====================

const episodes = ref<EpisodeItem[]>([]);
const episodeLoading = ref(false);

async function loadEpisodes() {
  if (selectedNovelId.value === undefined) {
    episodes.value = [];
    return;
  }
  episodeLoading.value = true;
  try {
    const res = await aiAssetApi.fetchEpisodes({
      novelId: selectedNovelId.value,
      page: 1,
      pageSize: 200,
    });
    episodes.value = res?.items ?? [];
  } finally {
    episodeLoading.value = false;
  }
}

/** 小说生成成功：刷新列表并自动选中新小说 */
async function handleNovelGenerated(novelId: number | string) {
  if (novelId) {
    novelPage.value = 1;
    selectedNovelId.value = novelId;
  }
  await loadNovels();
  if (novelId) {
    await loadEpisodes();
  }
}

function openNovelGenerate() {
  novelDrawerApi.setData({});
  novelDrawerApi.open();
}

function openEpisodeGenerate() {
  if (!selectedNovel.value) {
    return;
  }
  episodeDrawerApi.setData({
    nextSeq: (episodes.value.at(-1)?.seq ?? episodes.value.length) + 1,
    novelId: selectedNovel.value.id,
    novelName: selectedNovel.value.name,
  });
  episodeDrawerApi.open();
}

function openScriptGenerate(row: EpisodeItem) {
  scriptDrawerApi.setData({ episodeId: row.id, title: row.title });
  scriptDrawerApi.open();
}

onMounted(loadNovels);
</script>

<template>
  <Page
    auto-content-height
    description="小说 → 分集 → 剧本，由文本模型同步生成（单次约 20~120 秒）"
    title="小说创作"
  >
    <div class="novel-page">
      <!-- 左：小说列表 -->
      <Card class="novel-col novel-col--list" title="小说">
        <template #extra>
          <Button size="small" type="primary" @click="openNovelGenerate">
            <template #icon><PlusOutlined /></template>
            AI 生成小说
          </Button>
        </template>

        <div class="novel-search">
          <Input
            v-model:value="novelKeyword"
            allow-clear
            placeholder="搜索小说名称"
            @change="handleNovelKeywordChange"
            @press-enter="handleNovelSearch"
          >
            <template #prefix><SearchOutlined /></template>
          </Input>
        </div>

        <div class="novel-scroll">
          <Empty
            v-if="!novelLoading && novels.length === 0"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="还没有小说，点右上角 AI 生成"
          />
          <button
            v-for="row in novels"
            :key="row.id"
            class="novel-item"
            :class="{ 'is-on': String(row.id) === String(selectedNovelId) }"
            type="button"
            @click="selectNovel(row)"
          >
            <span class="novel-item__name">
              <BookOutlined />
              {{ row.name || `小说 #${row.id}` }}
            </span>
            <span v-if="row.synopsis" class="novel-item__desc">
              {{ row.synopsis }}
            </span>
          </button>
        </div>

        <div v-if="novelTotal > novelPageSize" class="novel-pager">
          <Pagination
            v-model:current="novelPage"
            :page-size="novelPageSize"
            simple
            :total="novelTotal"
            @change="loadNovels"
          />
        </div>
      </Card>

      <!-- 右：分集列表 -->
      <Card class="novel-col novel-col--episodes" :title="selectedNovel?.name || '分集'">
        <template #extra>
          <Button :disabled="!selectedNovel" size="small" @click="openEpisodeGenerate">
            批量生成分集
          </Button>
        </template>

        <div class="episode-scroll">
          <Empty
            v-if="!episodeLoading && episodes.length === 0"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无分集，可批量生成"
          />
          <div v-for="row in episodes" :key="row.id" class="episode-item">
            <div class="episode-item__hd">
              <Tag :bordered="false">第 {{ row.seq ?? '-' }} 集</Tag>
              <span class="episode-item__title">{{ row.title || '未命名' }}</span>
              <Button size="small" type="link" @click="openScriptGenerate(row)">
                {{ row.script ? '重新生成剧本' : '生成剧本' }}
              </Button>
            </div>
            <p v-if="row.summary" class="episode-item__summary">
              <FileTextOutlined /> {{ row.summary }}
            </p>
            <p v-if="row.script" class="episode-item__script">{{ row.script }}</p>
            <p v-else class="episode-item__empty">还没有剧本</p>
          </div>
        </div>
      </Card>
    </div>

    <NovelDrawer @success="handleNovelGenerated" />
    <EpisodeDrawer @success="loadEpisodes" />
    <ScriptDrawer @success="loadEpisodes" />
  </Page>
</template>

<style scoped lang="scss">
.novel-page {
  display: flex;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.novel-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 12px;
  }
}

.novel-col--list {
  flex: none;
  width: 320px;
}

.novel-col--episodes {
  flex: 1;
  min-width: 0;
}

.novel-search {
  flex: none;
  margin-bottom: 10px;
}

.novel-scroll,
.episode-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.novel-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.novel-item.is-on {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 16%, transparent);
}

.novel-item__name {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
}

.novel-item__desc {
  display: -webkit-box;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.novel-pager {
  flex: none;
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.episode-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.episode-item__hd {
  display: flex;
  gap: 8px;
  align-items: center;
}

.episode-item__title {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.episode-item__hd :last-child {
  margin-left: auto;
}

.episode-item__summary {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

.episode-item__script {
  display: -webkit-box;
  margin: 6px 0 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.7;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.episode-item__empty {
  margin: 6px 0 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
