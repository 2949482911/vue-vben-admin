<script lang="ts" setup name="NovelAssetGraphDrawer">
/**
 * 设定资产抽屉：创作台「设定资产」与分镜校验打开，处于小说 → 分镜链路中的资产准备环节。
 * 负责提炼角色/场景/道具、生成形象、按角色类型筛选；角色类型与群演免图策略在此展示。
 * 依赖接口：novel/asset/graph、novel/asset/extract、asset/image/generate、character|scene|element save。
 */
import type {
  NovelAssetGraph,
  NovelCharacterAsset,
  NovelElementAsset,
  NovelSceneAsset,
} from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  Image,
  message,
  Modal,
  Pagination,
  Progress,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { CHARACTER_TYPE_OPTIONS, characterTypeLabel, isExtraCharacter } from '../characterTypes';
import AssetEditDrawerContent from './AssetEditDrawer.vue';

const emit = defineEmits<{ success: [] }>();

type AssetTab = 'characters' | 'elements' | 'scenes';
type AssetItem = NovelCharacterAsset | NovelElementAsset | NovelSceneAsset;

const loading = ref(false);
const extracting = ref(false);
const graph = ref<NovelAssetGraph>();
const activeTab = ref<AssetTab>('characters');
const generatingId = ref<string>();
const batchRunning = ref(false);
const batchTotal = ref(0);
const batchDone = ref(0);
const novelId = ref<number | string>();

const [AssetEditDrawer, assetEditApi] = useVbenDrawer({
  connectedComponent: AssetEditDrawerContent,
});

const TABS = [
  { key: 'characters', label: '角色' },
  { key: 'scenes', label: '场景' },
  { key: 'elements', label: '道具' },
] as const;

/** 角色类型筛选值：'' 表示全部，其余对应 characterType */
const characterFilter = ref<'' | number>('');
const characterTypeFilters = computed(() => [
  { label: '全部', value: '' as const },
  ...CHARACTER_TYPE_OPTIONS.map((item) => ({
    label: item.label,
    value: item.value as number,
  })),
]);

const items = computed<AssetItem[]>(() => {
  if (!graph.value) {
    return [];
  }
  const list = (graph.value[activeTab.value] ?? []) as AssetItem[];
  // 只有角色 Tab 支持按角色类型筛选，场景/道具保持全量
  if (activeTab.value !== 'characters' || characterFilter.value === '') {
    return list;
  }
  return (list as NovelCharacterAsset[]).filter(
    (item) => item.characterType === characterFilter.value,
  );
});

const PAGE_SIZE_OPTIONS = [30, 60, 90];
const currentPage = ref(1);
const pageSize = ref(30);
const scrollEl = ref<HTMLElement>();

/** 当前 Tab/筛选下的分页切片（数据一次性来自 graph，前端分页） */
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return items.value.slice(start, start + pageSize.value);
});

function scrollToTop() {
  scrollEl.value?.scrollTo({ top: 0 });
}

function onPageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  scrollToTop();
}

watch([activeTab, characterFilter], () => {
  currentPage.value = 1;
  scrollToTop();
});

watch(
  () => items.value.length,
  (length) => {
    const maxPage = Math.max(1, Math.ceil(length / pageSize.value));
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
  },
);

const readiness = computed(() => graph.value?.readiness);

function characterTypeCount(type: '' | number) {
  const list = graph.value?.characters ?? [];
  return type === ''
    ? list.length
    : list.filter((item) => item.characterType === type).length;
}

function isExtra(item: AssetItem) {
  return (
    activeTab.value === 'characters' &&
    isExtraCharacter((item as NovelCharacterAsset).characterType)
  );
}

/** 群演未出图不告警，统一显示灰色「无需形象」，避免用户误以为缺资产 */
function statusTag(item: AssetItem): { color?: string; text: string } {
  if (item.hasImage) {
    return { color: 'green', text: '已生成形象' };
  }
  if (isExtra(item)) {
    return { text: '无需形象' };
  }
  return { color: 'orange', text: '待生成' };
}

function itemImage(item: AssetItem) {
  return item.materialThumbnailUrl || item.materialUrl || '';
}

function itemMeta(item: AssetItem) {
  if (activeTab.value === 'characters') {
    const character = item as NovelCharacterAsset;
    return [
      characterTypeLabel(character.characterType),
      character.role,
      character.appearance,
      character.shotCount ? `${character.shotCount} 个镜头` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }
  if (activeTab.value === 'scenes') {
    const scene = item as NovelSceneAsset;
    return [
      scene.location,
      scene.description,
      scene.shotCount ? `${scene.shotCount} 个镜头` : '',
      scene.sceneSeqs?.length ? `场次 ${scene.sceneSeqs.join('/')}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }
  const element = item as NovelElementAsset;
  return element.elementType ?? '道具';
}

function openEdit(item: AssetItem, type: 'character' | 'element' | 'scene') {
  assetEditApi.setData({
    item,
    novelId: novelId.value,
    type,
  });
  assetEditApi.open();
}

async function load() {
  const data = drawerApi.getData() as undefined | { novelId: number | string };
  if (!data?.novelId) {
    return;
  }
  novelId.value = data.novelId;
  loading.value = true;
  try {
    graph.value = await aiAssetApi.fetchNovelAssetGraph(data.novelId);
  } catch (error: any) {
    message.error(error?.message || '加载设定资产失败');
  } finally {
    loading.value = false;
  }
}

async function extract() {
  const data = drawerApi.getData() as undefined | { novelId: number | string };
  if (!data?.novelId) {
    return;
  }
  extracting.value = true;
  try {
    const res: any = await aiAssetApi.extractNovelAssets({
      autoCreateElement: true,
      autoCreateScene: true,
      novelId: data.novelId,
      sources: ['outline', 'episodes', 'script'],
    });
    const created =
      (res?.characters?.filter((item: any) => item.created).length ?? 0) +
      (res?.scenes?.filter((item: any) => item.created).length ?? 0) +
      (res?.elements?.filter((item: any) => item.created).length ?? 0);
    message.success(`设定提炼完成，新增 ${created} 个`);
    await load();
    emit('success');
  } catch (error: any) {
    message.error(error?.message || '提炼设定失败');
  } finally {
    extracting.value = false;
  }
}

async function generateImage(item: AssetItem, type: 'character' | 'scene') {
  generatingId.value = String(item.id);
  try {
    await aiAssetApi.generateAssetImage({
      assetId: item.id,
      assetType: type,
    });
    message.success('形象已生成');
    await load();
    emit('success');
  } catch (error: any) {
    message.error(error?.message || '生成形象失败，请先补全角色/场景描述');
  } finally {
    generatingId.value = undefined;
  }
}

function missingList() {
  // 群演允许不出形象，批量补图跳过，避免无意义消耗
  const characters = (graph.value?.characters ?? [])
    .filter((item) => !item.hasImage && !isExtraCharacter(item.characterType))
    .map((item) => ({ item, type: 'character' as const }));
  const scenes = (graph.value?.scenes ?? [])
    .filter((item) => !item.hasImage)
    .map((item) => ({ item, type: 'scene' as const }));
  return [...characters, ...scenes];
}

function batchGenerate() {
  const list = missingList();
  if (!list.length) {
    message.info('没有缺图资产');
    return;
  }
  Modal.confirm({
    title: `为 ${list.length} 个缺图资产生成形象？`,
    content: '将逐张调用图片模型，耗时较长，请保持页面打开。',
    async onOk() {
      batchRunning.value = true;
      batchTotal.value = list.length;
      batchDone.value = 0;
      for (const entry of list) {
        try {
          await aiAssetApi.generateAssetImage({
            assetId: entry.item.id,
            assetType: entry.type,
          });
        } catch {
          // 单张失败不阻断，最后统一看结果
        } finally {
          batchDone.value += 1;
        }
      }
      batchRunning.value = false;
      await load();
      emit('success');
      message.success(`批量生成完成：${batchDone.value}/${batchTotal.value}`);
    },
  });
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[920px]',
  contentClass: 'flex min-h-0 flex-col gap-3 p-3',
  closeOnPressEscape: true,
  async onOpenChange(open) {
    if (!open) {
      return;
    }
    graph.value = undefined;
    activeTab.value = 'characters';
    currentPage.value = 1;
    await load();
  },
});
</script>

<template>
  <Drawer title="设定资产">
    <div class="asset-graph">
      <div v-if="readiness" class="asset-graph__readiness">
        <div class="asset-graph__stats">
          <span>
            角色 {{ readiness.characters.withImage }}/{{ readiness.characters.total }}
          </span>
          <span>
            场景 {{ readiness.scenes.withImage }}/{{ readiness.scenes.total }}
          </span>
          <span>
            道具 {{ readiness.elements.withImage }}/{{ readiness.elements.total }}
          </span>
          <Tag :bordered="false" :color="readiness.ready ? 'green' : 'orange'">
            {{ readiness.ready ? '可生成分镜视频' : '仍有缺图' }}
          </Tag>
        </div>
        <Progress
          :percent="
            readiness.characters.total + readiness.scenes.total === 0
              ? 0
              : Math.round(
                  ((readiness.characters.withImage + readiness.scenes.withImage) /
                    (readiness.characters.total + readiness.scenes.total)) *
                    100,
                )
          "
          size="small"
        />
        <div class="asset-graph__actions">
          <Button size="small" :loading="extracting" @click="extract">
            初始化 / 重新提炼设定
          </Button>
          <Button
            size="small"
            type="primary"
            :loading="batchRunning"
            :disabled="batchRunning"
            @click="batchGenerate"
          >
            一键补图
          </Button>
          <span v-if="batchRunning" class="asset-graph__progress">
            {{ batchDone }}/{{ batchTotal }}
          </span>
        </div>
      </div>

      <div class="asset-graph__tabs">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          class="asset-graph__tab"
          :class="{ 'is-on': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span>{{ graph?.[tab.key]?.length ?? 0 }}</span>
        </button>
      </div>

      <div v-if="activeTab === 'characters'" class="asset-graph__filters">
        <button
          v-for="filter in characterTypeFilters"
          :key="String(filter.value)"
          type="button"
          class="asset-filter"
          :class="{ 'is-on': characterFilter === filter.value }"
          @click="characterFilter = filter.value"
        >
          {{ filter.label }}
          <span>{{ characterTypeCount(filter.value) }}</span>
        </button>
      </div>

      <div ref="scrollEl" class="asset-graph__scroll">
        <Empty
          v-if="!items.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="还没有设定资产；先「初始化 / 重新提炼设定」"
        />
        <div v-else class="asset-graph__grid">
          <Card v-for="item in pagedItems" :key="item.id" size="small" class="asset-card">
            <div class="asset-card__hd">
              <span class="asset-card__thumb">
                <Image
                  v-if="itemImage(item)"
                  :preview="false"
                  :src="itemImage(item)"
                />
                <template v-else>{{ item.name.slice(0, 1) }}</template>
              </span>
              <div class="asset-card__name">
                <b>{{ item.name }}</b>
                <span>{{ itemMeta(item) }}</span>
              </div>
              <Tag
                :bordered="false"
                :color="statusTag(item).color"
              >
                {{ statusTag(item).text }}
              </Tag>
            </div>
            <div v-if="!item.visualPrompt && activeTab !== 'elements'" class="asset-card__warn">
              <Tag :bordered="false" color="orange">缺提示词</Tag>
            </div>
            <p class="asset-card__desc">{{ item.description || '暂无描述' }}</p>
            <p v-if="isExtra(item)" class="asset-card__hint">
              群演可不生成形象，关键帧将用场景图 + 文字生成
            </p>
            <div class="asset-card__foot">
              <span class="asset-card__usage">
                {{ (item as any).episodeIds?.length ? `出现在 ${(item as any).episodeIds.length} 集` : '未关联分集' }}
              </span>
              <Button
                type="link"
                size="small"
                @click="
                  openEdit(
                    item,
                    activeTab === 'characters'
                      ? 'character'
                      : activeTab === 'scenes'
                        ? 'scene'
                        : 'element',
                  )
                "
              >
                编辑设定
              </Button>
              <Button
                v-if="activeTab !== 'elements'"
                type="link"
                size="small"
                :loading="generatingId === String(item.id)"
                @click="
                  generateImage(
                    item,
                    activeTab === 'characters' ? 'character' : 'scene',
                  )
                "
              >
                {{ item.hasImage ? '重新生成形象' : isExtra(item) ? '生成群演形象' : '生成形象' }}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div v-if="items.length" class="asset-graph__pager">
        <Pagination
          :current="currentPage"
          :page-size="pageSize"
          :page-size-options="PAGE_SIZE_OPTIONS.map(String)"
          show-size-changer
          :show-total="(total: number) => `共 ${total} 个资产`"
          :total="items.length"
          @change="onPageChange"
        />
      </div>

      <div v-if="loading" class="asset-graph__loading">
        <Spin />
      </div>
    </div>
  </Drawer>

  <AssetEditDrawer @success="load" />
</template>

<style scoped lang="scss">
.asset-graph {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.asset-graph__loading {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, hsl(var(--card)) 65%, transparent);
}

.asset-graph__readiness {
  flex: none;
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 10px;
}

.asset-graph__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.asset-graph__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.asset-graph__progress {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.asset-graph__tabs {
  display: flex;
  flex: none;
  gap: 4px;
}

.asset-graph__tab {
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 8px;

  span {
    margin-left: 4px;
    font-size: 11px;
    opacity: 0.7;
  }

  &.is-on {
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
  }
}

.asset-graph__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 与素材库分页一致：右对齐、无分割线，与列表留 16px 间距 */
.asset-graph__pager {
  display: flex;
  flex: none;
  justify-content: flex-end;
  margin-top: 4px;
}

.asset-graph__filters {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 6px;
}

.asset-filter {
  padding: 3px 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--accent));
  border: 1px solid transparent;
  border-radius: 999px;

  span {
    margin-left: 4px;
    font-size: 11px;
    opacity: 0.7;
  }

  &.is-on {
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
    border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
  }
}

.asset-graph__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.asset-card {
  display: flex;
  flex-direction: column;

  &__hd {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }

  &__thumb {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, hsl(var(--c-violet)), hsl(var(--primary)));
    border-radius: 9px;

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__name {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 13px;
    }

    span {
      font-size: 11px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__desc {
    display: -webkit-box;
    margin: 0 0 8px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__hint {
    margin: 0 0 8px;
    font-size: 11px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    border-top: 1px dashed hsl(var(--border));
  }

  &__usage {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }
}

@media (width <= 1080px) {
  .asset-graph__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
