<script lang="ts" setup name="NovelAssetGraphDrawer">
/**
 * 设定资产抽屉：创作台「设定资产」与分镜校验打开，处于小说 → 分镜链路中的资产准备环节。
 * 负责提炼角色/场景/道具、生成形象、按角色类型筛选；角色类型与群演免图策略在此展示。
 * 一键补图走后端批次任务（task_batch_center + Kafka），页面可关闭，重新打开按 active 恢复进度。
 * 依赖接口：novel/asset/graph、asset/image/generate、novel/asset/image/batch/*。
 */
import type {
  NovelAssetGraph,
  NovelCharacterAsset,
  NovelElementAsset,
  NovelSceneAsset,
} from '#/api/models/ai_asset';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
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
import {
  BATCH_TASK_ACTIVE_STATUSES,
  BATCH_TASK_FINAL_STATUSES,
  BATCH_TASK_STATUS,
} from '../status';
import AssetEditDrawerContent from './AssetEditDrawer.vue';

const emit = defineEmits<{ success: [] }>();

type AssetTab = 'characters' | 'elements' | 'scenes';
type AssetItem = NovelCharacterAsset | NovelElementAsset | NovelSceneAsset;
type AssetTypeKey = 'character' | 'element' | 'scene';

const loading = ref(false);
const extracting = ref(false);
const graph = ref<NovelAssetGraph>();
const activeTab = ref<AssetTab>('characters');
const generatingId = ref<string>();
const batchRunning = ref(false);
const batchTotal = ref(0);
const batchDone = ref(0);
const batchSuccess = ref(0);
const batchFailed = ref(0);
const batchPercent = ref(0);
const batchTaskId = ref<string>();
const batchError = ref('');
const BATCH_POLL_INTERVAL = 3000;
const BATCH_POLL_MAX_MS = 30 * 60 * 1000;
let batchPollTimer: ReturnType<typeof setTimeout> | undefined;
let batchPollStartedAt: number | undefined;
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

function typeOfTab(tab: AssetTab): AssetTypeKey {
  if (tab === 'characters') {
    return 'character';
  }
  return tab === 'scenes' ? 'scene' : 'element';
}

function typeOfItem(): AssetTypeKey {
  return typeOfTab(activeTab.value);
}

function assetKey(type: AssetTypeKey, item: AssetItem) {
  return `${type}#${item.id}`;
}

/** 选择集按 assetType#assetId 维护，切换标签页不会丢 */
const selectedKeys = ref<string[]>([]);
const selectedSet = computed(() => new Set(selectedKeys.value));

const selectedEntries = computed<Array<{ item: AssetItem; type: AssetTypeKey }>>(
  () => {
    const result: Array<{ item: AssetItem; type: AssetTypeKey }> = [];
    const sources: Array<[AssetTypeKey, AssetItem[]]> = [
      ['character', (graph.value?.characters ?? []) as AssetItem[]],
      ['scene', (graph.value?.scenes ?? []) as AssetItem[]],
      ['element', (graph.value?.elements ?? []) as AssetItem[]],
    ];
    for (const [type, list] of sources) {
      for (const item of list) {
        if (selectedSet.value.has(assetKey(type, item))) {
          result.push({ item, type });
        }
      }
    }
    return result;
  },
);
const selectedCount = computed(() => selectedEntries.value.length);
const selectedExistingCount = computed(
  () => selectedEntries.value.filter((entry) => entry.item.hasImage).length,
);
const selectedMissingCount = computed(
  () => selectedCount.value - selectedExistingCount.value,
);

function isSelected(item: AssetItem) {
  return selectedSet.value.has(assetKey(typeOfItem(), item));
}

function toggleSelected(item: AssetItem, checked: boolean) {
  const key = assetKey(typeOfItem(), item);
  selectedKeys.value = checked
    ? [...new Set([...selectedKeys.value, key])]
    : selectedKeys.value.filter((value) => value !== key);
}

/** 当前页全选只作用于当前页可见项，不扩到全量/其他标签页 */
const pageEntries = computed(() =>
  pagedItems.value.map((item) => ({
    item,
    key: assetKey(typeOfItem(), item),
  })),
);
const allPageSelected = computed(
  () =>
    pageEntries.value.length > 0 &&
    pageEntries.value.every((entry) => selectedSet.value.has(entry.key)),
);
const pageIndeterminate = computed(
  () =>
    !allPageSelected.value &&
    pageEntries.value.some((entry) => selectedSet.value.has(entry.key)),
);

function togglePageSelection(checked: boolean) {
  const keys = pageEntries.value.map((entry) => entry.key);
  if (checked) {
    selectedKeys.value = [...new Set([...selectedKeys.value, ...keys])];
  } else {
    selectedKeys.value = selectedKeys.value.filter(
      (key) => !keys.includes(key),
    );
  }
}

function clearSelection() {
  selectedKeys.value = [];
}

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

async function generateImage(
  item: AssetItem,
  type: 'character' | 'element' | 'scene',
) {
  generatingId.value = String(item.id);
  try {
    await aiAssetApi.generateAssetImage({
      assetId: item.id,
      assetType: type,
    });
    message.success(type === 'element' ? '道具图已生成' : '形象已生成');
    await load();
    emit('success');
  } catch (error: any) {
    message.error(
      error?.message ||
        (type === 'element'
          ? '生成道具图失败'
          : '生成形象失败，请先补全角色/场景描述'),
    );
  } finally {
    generatingId.value = undefined;
  }
}

function missingList() {
  // 群演允许不出形象，批量补图跳过，避免无意义消耗；道具形象可选但可批量补
  const characters = (graph.value?.characters ?? [])
    .filter((item) => !item.hasImage && !isExtraCharacter(item.characterType))
    .map((item) => ({ item, type: 'character' as const }));
  const scenes = (graph.value?.scenes ?? [])
    .filter((item) => !item.hasImage)
    .map((item) => ({ item, type: 'scene' as const }));
  const elements = (graph.value?.elements ?? [])
    .filter((item) => !item.hasImage)
    .map((item) => ({ item, type: 'element' as const }));
  return [...characters, ...scenes, ...elements];
}

function stopBatchPoll() {
  if (batchPollTimer) {
    clearTimeout(batchPollTimer);
    batchPollTimer = undefined;
  }
}

function applyBatchProgress(payload: {
  failedCount?: number;
  processedCount?: number;
  progressPercent?: number;
  successCount?: number;
  taskStatus?: number;
  totalCount?: number;
}) {
  batchTotal.value = Number(payload.totalCount ?? batchTotal.value);
  batchSuccess.value = Number(payload.successCount ?? batchSuccess.value);
  batchFailed.value = Number(payload.failedCount ?? batchFailed.value);
  batchDone.value = Number(
    payload.processedCount ?? batchSuccess.value + batchFailed.value,
  );
  batchPercent.value = Number(
    payload.progressPercent ??
      (batchTotal.value
        ? Math.round((batchDone.value / batchTotal.value) * 100)
        : 0),
  );
}

/** 3s 轮询一次；任务完成/失败或超时即停，抽屉关闭与卸载会 cleanup */
function scheduleBatchPoll() {
  stopBatchPoll();
  if (!batchTaskId.value) {
    return;
  }
  if (!batchPollStartedAt) {
    batchPollStartedAt = Date.now();
  }
  batchPollTimer = setTimeout(async () => {
    if (Date.now() - batchPollStartedAt! > BATCH_POLL_MAX_MS) {
      stopBatchPoll();
      batchRunning.value = false;
      batchPollStartedAt = undefined;
      message.info('补图时间较长，可稍后回任务中心查看');
      return;
    }
    try {
      const res = await aiAssetApi.fetchAssetImageBatchProgress(
        batchTaskId.value!,
      );
      applyBatchProgress({
        failedCount: res.failedCount,
        processedCount: res.processedCount,
        progressPercent: res.progressPercent,
        successCount: res.successCount,
        taskStatus: res.taskStatus,
        totalCount: res.totalCount,
      });
      batchError.value = String(res.errorMsg ?? '');
      if (BATCH_TASK_FINAL_STATUSES.includes(Number(res.taskStatus))) {
        stopBatchPoll();
        batchRunning.value = false;
        batchPollStartedAt = undefined;
        await load();
        emit('success');
        if (res.taskStatus === BATCH_TASK_STATUS.SUCCESS) {
          const summary = `成功 ${batchSuccess.value}，失败 ${batchFailed.value}`;
          if (batchFailed.value > 0) {
            message.warning(`后台补图完成：${summary}；失败原因可在任务中心查看`);
          } else {
            message.success(`后台补图完成：${summary}`);
          }
        } else {
          message.error(
            `后台补图失败：成功 ${batchSuccess.value}，失败 ${batchFailed.value}；原因可在任务中心查看`,
          );
        }
        return;
      }
      scheduleBatchPoll();
    } catch {
      // 短暂失败继续轮询；下一次成功后自动恢复
      scheduleBatchPoll();
    }
  }, BATCH_POLL_INTERVAL);
}

function batchErrorMessage(error: any) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    '提交补图任务失败'
  );
}

async function submitBatch(
  assets?: Array<{ assetId: number | string; assetType: AssetTypeKey }>,
) {
  if (!novelId.value) {
    return;
  }
  if (batchRunning.value) {
    message.info('已有补图批次进行中');
    return;
  }
  batchRunning.value = true;
  batchError.value = '';
  try {
    const res = await aiAssetApi.submitAssetImageBatch({
      novelId: novelId.value,
      ...(assets?.length ? { assets } : {}),
    });
    batchTaskId.value = String(res.taskId);
    batchPollStartedAt = Date.now();
    applyBatchProgress({
      failedCount: 0,
      progressPercent: 0,
      successCount: 0,
      taskStatus: BATCH_TASK_STATUS.PENDING,
      totalCount: res.totalCount,
    });
    clearSelection();
    message.success(
      res.existing
        ? '已有补图批次进行中，已接上进度'
        : '补图任务已提交，可关闭页面，进度在任务中心查看',
    );
    scheduleBatchPoll();
  } catch (error: any) {
    batchRunning.value = false;
    const text = batchErrorMessage(error);
    batchError.value = text;
    // 后端 400 业务文案原样展示，不包成系统异常
    message.error(text);
  }
}

function batchSelected() {
  const entries = [...selectedEntries.value];
  if (!entries.length) {
    return;
  }
  const existing = selectedExistingCount.value;
  const missing = selectedMissingCount.value;
  const content =
    existing > 0
      ? `选中的 ${entries.length} 个中有 ${existing} 个已有形象，将跳过；实际补图 ${missing} 个。后台依次生成，可关闭页面。`
      : `实际补图 ${missing} 个。后台依次生成，可关闭页面。`;
  Modal.confirm({
    title: `补选中 ${entries.length} 个资产？`,
    content,
    async onOk() {
      await submitBatch(
        entries.map((entry) => ({
          assetId: entry.item.id,
          assetType: entry.type,
        })),
      );
    },
  });
}

function batchGenerate() {
  const list = missingList();
  if (!list.length) {
    message.info('没有缺图资产');
    return;
  }
  const countOf = (type: 'character' | 'element' | 'scene') =>
    list.filter((entry) => entry.type === type).length;
  Modal.confirm({
    title: `提交后台补图任务（${list.length} 个缺图资产）？`,
    content: `角色 ${countOf('character')} / 场景 ${countOf('scene')} / 道具 ${countOf('element')}；后台依次生成，可关闭页面，进度在任务中心查看。`,
    async onOk() {
      await submitBatch();
    },
  });
}

/** 打开抽屉时恢复进行中的补图批次 */
async function loadActiveBatch() {
  if (!novelId.value) {
    return;
  }
  try {
    const active = await aiAssetApi.fetchAssetImageBatchActive(novelId.value);
    if (
      !active ||
      !BATCH_TASK_ACTIVE_STATUSES.includes(Number(active.taskStatus))
    ) {
      return;
    }
    batchRunning.value = true;
    batchTaskId.value = String(active.taskId);
    applyBatchProgress({
      failedCount: active.failedCount,
      progressPercent: active.progressPercent,
      successCount: active.successCount,
      taskStatus: active.taskStatus,
      totalCount: active.totalCount,
    });
    scheduleBatchPoll();
  } catch {
    // active 接口未就绪时静默；不影响手动补图
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[920px]',
  contentClass: 'flex min-h-0 flex-col gap-3 p-3',
  closeOnPressEscape: true,
  async onOpenChange(open) {
    if (!open) {
      // 抽屉关闭后停止前端轮询，任务仍在后端继续
      stopBatchPoll();
      return;
    }
    graph.value = undefined;
    activeTab.value = 'characters';
    currentPage.value = 1;
    // 先清空前端进度，再由 active 决定是否恢复进行中的批次
    batchRunning.value = false;
    batchTaskId.value = undefined;
    batchTotal.value = 0;
    batchDone.value = 0;
    batchSuccess.value = 0;
    batchFailed.value = 0;
    batchPercent.value = 0;
    batchError.value = '';
    batchPollStartedAt = undefined;
    selectedKeys.value = [];
    await load();
    await loadActiveBatch();
  },
});

onBeforeUnmount(() => {
  stopBatchPoll();
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
            {{ batchRunning ? '补图中' : '一键补图' }}
          </Button>
          <Button
            size="small"
            :disabled="batchRunning || selectedCount === 0"
            @click="batchSelected"
          >
            补选中 {{ selectedCount }}
          </Button>
          <span v-if="batchRunning" class="asset-graph__progress">
            补图中 {{ batchDone }}/{{ batchTotal }}（成功
            {{ batchSuccess }} · 失败 {{ batchFailed }}）
          </span>
        </div>
        <div v-if="batchRunning" class="asset-graph__progress">
          <Progress :percent="batchPercent" size="small" />
        </div>
        <p v-if="batchError" class="asset-graph__error">
          {{ batchError }}
        </p>
        <p class="asset-graph__hint">道具形象可选，不影响分镜/合成</p>
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

      <div class="asset-graph__selection">
        <Checkbox
          :checked="allPageSelected"
          :disabled="pageEntries.length === 0"
          :indeterminate="pageIndeterminate"
          @change="
            (event) => togglePageSelection(Boolean(event.target.checked))
          "
        >
          当前页全选
        </Checkbox>
        <Button
          type="link"
          size="small"
          :disabled="selectedCount === 0"
          @click="clearSelection"
        >
          清空选择
        </Button>
        <span v-if="selectedCount" class="asset-graph__selected">
          已选 {{ selectedCount }} 个
        </span>
      </div>

      <div ref="scrollEl" class="asset-graph__scroll">
        <Empty
          v-if="!items.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="还没有设定资产；先「初始化 / 重新提炼设定」"
        />
        <div v-else class="asset-graph__grid">
          <Card
            v-for="item in pagedItems"
            :key="item.id"
            size="small"
            class="asset-card"
            :class="{ 'is-selected': isSelected(item) }"
          >
            <div class="asset-card__hd">
              <Checkbox
                class="asset-card__check"
                :checked="isSelected(item)"
                @change="
                  (event) =>
                    toggleSelected(item, Boolean(event.target.checked))
                "
              />
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
                type="link"
                size="small"
                :loading="generatingId === String(item.id)"
                @click="
                  generateImage(
                    item,
                    activeTab === 'characters'
                      ? 'character'
                      : activeTab === 'scenes'
                        ? 'scene'
                        : 'element',
                  )
                "
              >
                <template v-if="activeTab === 'elements'">
                  {{ item.hasImage ? '重新生成道具图' : '生成道具图' }}
                </template>
                <template v-else>
                  {{ item.hasImage ? '重新生成形象' : isExtra(item) ? '生成群演形象' : '生成形象' }}
                </template>
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

.asset-graph__error {
  margin: 6px 0 0;
  font-size: 12px;
  color: hsl(var(--destructive));
}

.asset-graph__hint {
  margin: 6px 0 0;
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

.asset-graph__selection {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.asset-graph__selected {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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

  &.is-selected {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--primary));
  }

  &__check {
    flex: none;
  }

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
