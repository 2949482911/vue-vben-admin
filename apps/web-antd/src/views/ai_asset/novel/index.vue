<script lang="ts" setup name="AiAssetNovelStudio">
import type { NovelItem } from '#/api/models/ai_asset';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, VbenLoading } from '@vben/common-ui';

import {
  AppstoreOutlined,
  BookOutlined,
  PlusOutlined,
  SearchOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  Input,
  message,
  Pagination,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';
import { useWorkspaceStore } from '#/store';

import { workspacePagePath } from '../workspace/menu';
import BookWizard from './components/BookWizard.vue';
import BookWorkbench from './components/BookWorkbench.vue';
import { useNovelDicts } from './useNovelDicts';

const { options, labelOf } = useNovelDicts();
const router = useRouter();
const workspaceStore = useWorkspaceStore();

const mode = ref<'book' | 'desk'>('desk');
const loading = ref(false);
const novels = ref<NovelItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const keyword = ref('');
const search = ref('');
const activeNovelId = ref<number | string>();
const wizardOpen = ref(false);
const models = ref<Array<{ label: string; value: number | string }>>([]);
const personas = ref<Array<{ label: string; value: number | string }>>([]);

const stats = computed(() => {
  const episodes = novels.value.reduce(
    (sum, item) => sum + (item.episodeCount || 0),
    0,
  );
  const words = novels.value.reduce((sum, item) => sum + (item.wordCount || 0), 0);
  const known = novels.value.some((item) => item.episodeCount !== undefined);
  return {
    count: total.value,
    episodes: known ? episodes : undefined,
    words: known ? words : undefined,
    average: known && novels.value.length ? Math.round(episodes / novels.value.length) : undefined,
  };
});

async function loadNovels() {
  loading.value = true;
  try {
    const res = await aiAssetApi.fetchNovelList({
      name: search.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    novels.value = res?.items ?? [];
    total.value = res?.total ?? novels.value.length;
  } catch (error: any) {
    message.error(error?.message || '加载书籍失败');
  } finally {
    loading.value = false;
  }
}

async function loadPersonas() {
  try {
    const res = await aiAssetApi.fetchPersonas({ page: 1, pageSize: 200 });
    personas.value = (res?.items ?? []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  } catch {
    personas.value = [];
  }
}

async function loadModels() {
  try {
    const res = await aiModelApi.fetchModelConfigList({
      page: 1,
      pageSize: 500,
    });
    const usable = (res?.items ?? []).filter(
      (item) => item.status === undefined || item.status === 1,
    );
    models.value = usable
      .filter((item) => item.capability === 'text')
      .map((item) => ({
        label: `${item.model ?? ''}（${item.provider ?? item.source ?? ''}）`,
        value: item.id,
      }));
  } catch {
    models.value = [];
  }
}

function doSearch() {
  search.value = keyword.value.trim();
  page.value = 1;
  void loadNovels();
}

function handlePage(next: number) {
  page.value = next;
  void loadNovels();
}

function onKeywordChange() {
  if (!keyword.value) {
    doSearch();
  }
}

function openNovel(novel: NovelItem) {
  activeNovelId.value = novel.id;
  mode.value = 'book';
}

function backToDesk() {
  mode.value = 'desk';
  void loadNovels();
}

function onGenerated(novelId: number | string) {
  wizardOpen.value = false;
  void loadNovels();
  activeNovelId.value = novelId;
  mode.value = 'book';
}

function goPage(key: string) {
  const workspaceId = workspaceStore.workspaceId;
  if (workspaceId === undefined) {
    message.warning('请先进入工作区');
    return;
  }
  void router.push(workspacePagePath(workspaceId, key));
}

onMounted(() => {
  void loadNovels();
  void loadModels();
  void loadPersonas();
});
</script>

<template>
  <Page auto-content-height>
    <div v-if="mode === 'desk'" class="novel-page">
      <div class="novel-stats">
        <Card class="novel-stat">
          <div class="novel-stat__body">
            <span class="novel-stat__ic"><BookOutlined /></span>
            <div><b>{{ stats.count }}</b><span>作品</span></div>
          </div>
        </Card>
        <Card class="novel-stat">
          <div class="novel-stat__body">
            <span class="novel-stat__ic is-violet"><AppstoreOutlined /></span>
            <div><b>{{ stats.episodes ?? '—' }}</b><span>总集数</span></div>
          </div>
        </Card>
        <Card class="novel-stat">
          <div class="novel-stat__body">
            <span class="novel-stat__ic is-cyan"><ToolOutlined /></span>
            <div>
              <b>{{ stats.words === undefined ? '—' : stats.words.toLocaleString() }}</b>
              <span>总字数</span>
            </div>
          </div>
        </Card>
        <Card class="novel-stat">
          <div class="novel-stat__body">
            <span class="novel-stat__ic is-amber"><UserOutlined /></span>
            <div><b>{{ stats.average ?? '—' }}</b><span>平均集数</span></div>
          </div>
        </Card>
      </div>

      <Card class="novel-quick" :body-style="{ padding: '10px 12px' }">
        <div class="novel-quick__grid">
          <button type="button" class="novel-quick__tile" @click="wizardOpen = true">
            <span class="novel-stat__ic"><PlusOutlined /></span>
            <span><b>写小说</b><span>6 步建书向导</span></span>
          </button>
          <button type="button" class="novel-quick__tile" @click="goPage('tools')">
            <span class="novel-stat__ic is-violet"><ToolOutlined /></span>
            <span><b>写作工具箱</b><span>扩写 / 大纲 / 起名</span></span>
          </button>
          <button type="button" class="novel-quick__tile" @click="goPage('elements')">
            <span class="novel-stat__ic is-cyan"><AppstoreOutlined /></span>
            <span><b>创作素材</b><span>人物 / 场景 / 道具</span></span>
          </button>
          <button type="button" class="novel-quick__tile" @click="goPage('persona')">
            <span class="novel-stat__ic is-amber"><UserOutlined /></span>
            <span><b>作者人设</b><span>文风与叙事偏好</span></span>
          </button>
        </div>
      </Card>

      <Card class="novel-books">
        <template #title>
          <span class="novel-books__title">我的书籍</span>
        </template>
        <template #extra>
          <div class="novel-books__tools">
            <Input
              v-model:value="keyword"
              allow-clear
              placeholder="搜索书名"
              style="width: 220px"
              @change="onKeywordChange"
              @press-enter="doSearch"
            >
              <template #prefix><SearchOutlined /></template>
            </Input>
            <Button type="primary" @click="wizardOpen = true">
              <template #icon><PlusOutlined /></template>
              新建书籍
            </Button>
          </div>
        </template>

        <div class="novel-books__scroll">
          <div v-if="!novels.length && !loading" class="novel-empty">
            <Empty
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="还没有书籍，从第一本开始"
            >
              <Button type="primary" @click="wizardOpen = true">
                <template #icon><PlusOutlined /></template>
                新建书籍
              </Button>
            </Empty>
          </div>
          <div v-else class="novel-grid">
            <article
              v-for="(novel, index) in novels"
              :key="novel.id"
              class="novel-card"
              tabindex="0"
              @click="openNovel(novel)"
            >
              <div class="novel-card__cover" :class="`tint-${index % 5}`">
                <span v-if="novel.episodeCount">{{ novel.episodeCount }} 集</span>
                <b>{{ novel.name || `书籍 #${novel.id}` }}</b>
              </div>
              <div class="novel-card__body">
                <div class="novel-card__name">《{{ novel.name || `书籍 #${novel.id}` }}》</div>
                <div class="novel-card__tags">
                  <Tag v-for="genre in novel.genres || []" :key="genre" :bordered="false">
                    {{ labelOf('genre', genre) }}
                  </Tag>
                  <Tag v-if="!novel.genres?.length" :bordered="false">未分类</Tag>
                </div>
                <p class="novel-card__desc">{{ novel.synopsis || '暂无简介' }}</p>
                <div class="novel-card__foot">
                  <span>{{ novel.wordCount ? `${novel.wordCount.toLocaleString()} 字` : novel.createTime || '' }}</span>
                  <span class="novel-card__go">打开 →</span>
                </div>
              </div>
            </article>

            <button type="button" class="novel-card novel-card--new" @click="wizardOpen = true">
              <span class="novel-card__plus"><PlusOutlined /></span>
              <b>新建书籍</b>
              <span>6 步设定，一次生成世界观与分集</span>
            </button>
          </div>
        </div>

        <div v-if="total > pageSize" class="novel-pager">
          <Pagination
            :current="page"
            :page-size="pageSize"
            :total="total"
            show-size-changer
            :show-total="(value: number) => `共 ${value} 本`"
            @change="handlePage"
          />
        </div>
      </Card>

      <VbenLoading :spinning="loading" />
    </div>

    <BookWorkbench
      v-else-if="activeNovelId"
      :models="models"
      :novel-id="activeNovelId"
      @back="backToDesk"
    />

    <BookWizard
      v-model:open="wizardOpen"
      :models="models"
      :novels="novels"
      :options="options"
      :personas="personas"
      @generated="onGenerated"
    />
  </Page>
</template>

<style scoped lang="scss">
.novel-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.novel-stats {
  display: grid;
  flex: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.novel-stat {
  :deep(.ant-card-body) {
    padding: 13px 16px;
  }

  &__body {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__ic {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    font-size: 17px;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
    border-radius: 11px;

    &.is-violet {
      color: hsl(var(--c-violet));
      background: color-mix(in srgb, hsl(var(--c-violet)) 12%, transparent);
    }

    &.is-cyan {
      color: hsl(var(--c-cyan));
      background: color-mix(in srgb, hsl(var(--c-cyan)) 12%, transparent);
    }

    &.is-amber {
      color: hsl(var(--warning));
      background: color-mix(in srgb, hsl(var(--warning)) 14%, transparent);
    }
  }

  b {
    display: block;
    font-size: 19px;
    font-weight: 700;
    line-height: 1.25;
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.novel-quick {
  flex: none;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  &__tile {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 9px 12px;
    text-align: left;
    cursor: pointer;
    background: hsl(var(--accent));
    border: 1px solid transparent;
    border-radius: 10px;

    &:hover {
      border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
    }

    b {
      display: block;
      font-size: 13px;
      font-weight: 600;
    }

    span span {
      display: block;
      font-size: 11px;
      color: hsl(var(--muted-foreground));
    }
  }
}

.novel-books {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 12px 16px 14px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
  }

  &__tools {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

.novel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.tint-0 { --tint-a: 213 82% 58%; --tint-b: 194 80% 54%; }
.tint-1 { --tint-a: 260 68% 64%; --tint-b: 226 76% 64%; }
.tint-2 { --tint-a: 26 84% 60%; --tint-b: 42 86% 58%; }
.tint-3 { --tint-a: 152 52% 46%; --tint-b: 178 58% 50%; }
.tint-4 { --tint-a: 334 62% 62%; --tint-b: 302 58% 62%; }

.novel-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
    box-shadow: var(--shadow);
  }

  &__cover {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 86px;
    padding: 9px 12px;
    color: #fff;
    background: linear-gradient(135deg, hsl(var(--tint-a)), hsl(var(--tint-b)));

    b {
      overflow: hidden;
      font-size: 15px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      align-self: flex-end;
      font-size: 11px;
      opacity: 0.9;
    }
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px 12px;
  }

  &__name {
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__desc {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__go {
    color: hsl(var(--primary));
  }
}

.novel-card--new {
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  background: transparent;
  border-style: dashed;

  b {
    margin: 8px 0 2px;
    font-size: 14px;
    color: hsl(var(--foreground));
  }

  span {
    font-size: 12px;
  }
}

.novel-card__plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-size: 17px;
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  border-radius: 50%;
}

.novel-pager {
  display: flex;
  flex: none;
  justify-content: flex-end;
  padding-top: 10px;
}

@media (width <= 1280px) {
  .novel-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .novel-stats,
  .novel-quick__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
