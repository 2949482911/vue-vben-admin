<script lang="ts" setup name="AiAssetDrama">
/**
 * 短剧制作工作台（P2 壳）。
 *
 * 链路位置：工作区内部菜单 `drama` → 本页。
 * 顶栏项目/主入口/项目级设置，左栏项目导航与剧集；剧情面版已接 P3（原文/核心情节）。
 * 工作流 P7、画布 P8、分镜板 P9 仍为明确接缝，不写死假数据；项目画风与画面比例已接 v2 契约。
 */
import type { EpisodeItem, NovelItem } from '#/api/models/ai_asset';
import type { EpisodeSummaryItem } from '#/api/models/ai_asset_episode';
import type { ProjectVisualStyleView } from '#/api/models/ai_asset_project';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  List,
  message,
  Modal,
  Segmented,
  Select,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { aiAssetProjectApi } from '#/api/core/ai_asset_project';

import AspectRatioModal from './components/AspectRatioModal.vue';
import EntityPanel from './components/EntityPanel.vue';
import EpisodePanel from './components/EpisodePanel.vue';
import PlotPanel from './components/PlotPanel.vue';
import ProjectStyleDrawer from './components/ProjectStyleDrawer.vue';
import StoryboardPanel from './components/StoryboardPanel.vue';
import WorkflowAgentPanel from './components/WorkflowAgentPanel.vue';
import { formatApiError, parseApiError } from './error';
import { useAspectRatioDict } from './useAspectRatioDict';

type PlotTab = 'entities' | 'episodes' | 'script' | 'storyboard';
type SurfaceKey = 'canvas' | 'plot' | 'storyboard' | 'workflow';

const SURFACES: Array<{ label: string; value: SurfaceKey }> = [
  { label: '剧情', value: 'plot' },
  { label: '工作流', value: 'workflow' },
  { label: '画布', value: 'canvas' },
  { label: '分镜板', value: 'storyboard' },
];

const PLOT_TABS: Array<{ label: string; value: PlotTab }> = [
  { label: '原文/核心情节', value: 'script' },
  { label: '实体', value: 'entities' },
  { label: '分集', value: 'episodes' },
  { label: '分镜', value: 'storyboard' },
];

const route = useRoute();
const router = useRouter();

const novels = ref<NovelItem[]>([]);
const novelsLoading = ref(false);
const novelId = ref<number | string | undefined>(
  typeof route.query.novelId === 'string' ? route.query.novelId : undefined,
);

const episodes = ref<EpisodeItem[]>([]);
const episodesLoading = ref(false);
const episodesError = ref('');
// 剧集是项目内的选择态，不进 URL；刷新后回到第一集
const episodeId = ref<number | string>();

const surface = ref<SurfaceKey>('plot');
const plotTab = ref<PlotTab>('script');
/** 剧情/实体子页有未保存修改时，切剧集/项目先确认，避免静默丢编辑 */
const plotDirty = ref(false);
const entityDirty = ref(false);
const storyboardDirty = ref(false);
const workspaceDirty = computed(
  () =>
    plotDirty.value || entityDirty.value || storyboardDirty.value,
);

const entityCount = ref<number>();
const storyboardStats = ref({ segmentCount: 0, shotCount: 0 });
const storyboardReloadKey = ref(0);

const plotWordLabel = computed(() => {
  const total = episodes.value.reduce(
    (sum, item) => sum + (item.words ?? 0),
    0,
  );
  if (total > 0) {
    return total.toLocaleString('zh-CN');
  }
  const novel = novels.value.find(
    (item) => String(item.id) === String(novelId.value),
  );
  return novel?.wordCount === undefined
    ? '—'
    : novel.wordCount.toLocaleString('zh-CN');
});

const entityCountLabel = computed(() =>
  entityCount.value === undefined ? '—' : String(entityCount.value),
);

const styleView = ref<ProjectVisualStyleView>();
const styleError = ref('');
const styleNotReady = ref(false);
const styleLoading = ref(false);
const { labelOf: aspectLabelOf, ready: aspectDictReady } =
  useAspectRatioDict();
const aspectRatio = ref<string>();
const aspectLoading = ref(false);
const aspectNotReady = ref(false);

const styleOpen = ref(false);
const ratioOpen = ref(false);

const currentEpisode = computed(() =>
  episodes.value.find((item) => String(item.id) === String(episodeId.value)),
);

const currentSurfaceLabel = computed(
  () => SURFACES.find((item) => item.value === surface.value)?.label ?? '剧情',
);

const currentEpisodeLabel = computed(() => {
  const item = currentEpisode.value;
  return item
    ? `第 ${item.seq ?? '-'} 集 · ${item.title ?? '未命名'}`
    : '未选择剧集';
});

const styleLabel = computed(() => {
  if (!novelId.value) {
    return '项目画风';
  }
  if (styleNotReady.value) {
    return '项目画风·接口未就绪';
  }
  if (styleError.value) {
    return '项目画风·加载失败';
  }
  const current = styleView.value?.current;
  if (!current) {
    return '项目画风·无风格';
  }
  if (current.custom) {
    return '项目画风·自定义';
  }
  return `项目画风·${current.label ?? current.code ?? '无风格'}`;
});

const styleCurrentLabel = computed(() => {
  const current = styleView.value?.current;
  if (!current) {
    return '';
  }
  return current.custom ? '自定义' : (current.label ?? current.code ?? '');
});

const styleReferenceUrl = computed(
  () =>
    styleView.value?.current?.styleReferenceThumbnailUrl ??
    styleView.value?.current?.styleReferenceUrl ??
    '',
);

const aspectLabel = computed(() => {
  if (!aspectDictReady.value) {
    return '画面比例·待接入';
  }
  if (aspectNotReady.value) {
    return '画面比例·接口未就绪';
  }
  return aspectRatio.value
    ? `画面比例·${aspectLabelOf(aspectRatio.value)}`
    : '画面比例·未设置';
});

const novelOptions = computed(() =>
  novels.value.map((item) => ({
    label: item.name ?? `书 #${item.id}`,
    value: item.id,
  })),
);

async function loadNovels() {
  novelsLoading.value = true;
  try {
    const page = await aiAssetApi.fetchNovelList({ page: 1, pageSize: 50 });
    novels.value = page.items ?? [];
    if (!novels.value.length) {
      novelId.value = undefined;
      return;
    }
    if (
      !novels.value.some(
        (item) => String(item.id) === String(novelId.value),
      )
    ) {
      novelId.value = novels.value[0]?.id;
    }
  } catch (error) {
    novels.value = [];
    const info = parseApiError(error);
    if (!info.notReady) {
      message.error(info.message);
    }
  } finally {
    novelsLoading.value = false;
  }
}

async function loadEpisodes() {
  episodesError.value = '';
  if (!novelId.value) {
    episodes.value = [];
    episodeId.value = undefined;
    return;
  }
  episodesLoading.value = true;
  try {
    const page = await aiAssetApi.fetchEpisodes({
      novelId: novelId.value,
      page: 1,
      pageSize: 200,
    });
    episodes.value = (page.items ?? []).sort(
      (a, b) => (a.seq ?? 0) - (b.seq ?? 0),
    );
    if (
      !episodes.value.some(
        (item) => String(item.id) === String(episodeId.value),
      )
    ) {
      episodeId.value = episodes.value[0]?.id;
    }
  } catch (error) {
    episodes.value = [];
    episodeId.value = undefined;
    const info = parseApiError(error);
    episodesError.value = info.notReady ? '接口未就绪' : info.message;
  } finally {
    episodesLoading.value = false;
  }
}

async function loadEntityCount() {
  entityCount.value = undefined;
  if (!novelId.value) {
    return;
  }
  try {
    const graph = await aiAssetApi.fetchNovelAssetGraph(novelId.value, true);
    entityCount.value =
      (graph.characters?.length ?? 0) +
      (graph.scenes?.length ?? 0) +
      (graph.elements?.length ?? 0);
  } catch {
    entityCount.value = undefined;
  }
}

async function loadStyle() {
  styleView.value = undefined;
  styleError.value = '';
  styleNotReady.value = false;
  styleLoading.value = false;
  if (!novelId.value) {
    return;
  }
  styleLoading.value = true;
  try {
    styleView.value = await aiAssetProjectApi.fetchProjectVisualStyle(
      novelId.value,
    );
  } catch (error) {
    const info = parseApiError(error);
    styleNotReady.value = info.notReady;
    styleError.value = info.notReady ? '' : info.message;
  } finally {
    styleLoading.value = false;
  }
}

async function loadAspectRatio() {
  aspectLoading.value = false;
  aspectNotReady.value = false;
  if (!novelId.value) {
    aspectRatio.value = undefined;
    return;
  }
  aspectLoading.value = true;
  try {
    const result = await aiAssetProjectApi.fetchProjectAspectRatio(
      novelId.value,
    );
    aspectRatio.value = result.aspectRatio || undefined;
  } catch (error) {
    const info = parseApiError(error);
    aspectNotReady.value = info.notReady;
    aspectRatio.value = undefined;
    if (!info.notReady) {
      message.error(formatApiError(info));
    }
  } finally {
    aspectLoading.value = false;
  }
}

async function changeNovel(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return;
  }
  if (String(value) === String(novelId.value)) {
    return;
  }
  if (workspaceDirty.value) {
    Modal.confirm({
      title: '切换项目？',
      content: '当前面版有未保存修改，切换后将丢弃。',
      okText: '丢弃并切换',
      cancelText: '取消',
      onOk: () => {
        plotDirty.value = false;
        entityDirty.value = false;
        storyboardDirty.value = false;
        void applyNovelChange(value);
      },
    });
    return;
  }
  await applyNovelChange(value);
}

async function applyNovelChange(value: number | string) {
  novelId.value = value;
  episodeId.value = undefined;
  // 先清空上一本书的比例，等新项目 GET 返回后再显示
  aspectRatio.value = undefined;
  aspectNotReady.value = false;
  await router.replace({
    query: { ...route.query, episodeId: undefined, novelId: String(value) },
  });
  await Promise.all([
    loadEpisodes(),
    loadEntityCount(),
    loadStyle(),
    loadAspectRatio(),
  ]);
}

/** 剧集只切本地状态：不写 URL、不触发路由导航；有未保存修改时先确认 */
function requestEpisodeChange(id: number | string) {
  if (String(id) === String(episodeId.value)) {
    return;
  }
  if (!workspaceDirty.value) {
    episodeId.value = id;
    return;
  }
  Modal.confirm({
    title: '切换剧集？',
    content: '当前面版有未保存修改，切换后将丢弃。',
    okText: '丢弃并切换',
    cancelText: '取消',
    onOk: () => {
      plotDirty.value = false;
      entityDirty.value = false;
      storyboardDirty.value = false;
      episodeId.value = id;
    },
  });
}

function selectEpisode(item: EpisodeItem) {
  requestEpisodeChange(item.id);
}

const entityFocusGroup = ref<'character' | 'element' | 'scene'>();
const entityFocusId = ref<number | string>();

function onWorkflowNavigate(payload: {
  entityId?: number | string;
  group?: 'character' | 'element' | 'scene';
  target: 'entities' | 'episodes' | 'script' | 'storyboard' | 'style';
}) {
  entityFocusGroup.value = payload.group;
  entityFocusId.value = payload.entityId;
  if (payload.target === 'style') {
    styleOpen.value = true;
    return;
  }
  surface.value = 'plot';
  if (payload.target === 'entities') {
    plotTab.value = 'entities';
  } else if (payload.target === 'episodes') {
    plotTab.value = 'episodes';
  } else if (payload.target === 'storyboard') {
    plotTab.value = 'storyboard';
  } else {
    plotTab.value = 'script';
  }
}

/** 分集重排后：清空未保存态与分镜展开态，默认切到新第一集 */
async function onEpisodeSplitApplied(summary: EpisodeSummaryItem[]) {
  plotDirty.value = false;
  entityDirty.value = false;
  storyboardDirty.value = false;
  storyboardReloadKey.value += 1;
  episodeId.value = summary[0]?.episodeId;
  await loadEpisodes();
}

/** 兼容旧链接：episodeId 已不再是路由状态，进页时清掉残留 query */
function cleanLegacyEpisodeQuery() {
  if (route.query.episodeId !== undefined) {
    void router.replace({ query: { ...route.query, episodeId: undefined } });
  }
}

function onStyleSaved(view: ProjectVisualStyleView) {
  styleView.value = view;
  styleNotReady.value = false;
  styleError.value = '';
}

function onAspectSaved(value: string) {
  aspectRatio.value = value;
  aspectNotReady.value = false;
}

onMounted(async () => {
  await loadNovels();
  await Promise.all([
    loadEpisodes(),
    loadEntityCount(),
    loadStyle(),
    loadAspectRatio(),
  ]);
  cleanLegacyEpisodeQuery();
});
</script>

<template>
  <Page auto-content-height>
    <div class="drama">
      <Card class="drama__top" :body-style="{ padding: '8px 12px' }">
        <div class="drama__top-row">
          <span class="drama__project-label">项目</span>
          <Select
            :loading="novelsLoading"
            :value="novelId"
            :options="novelOptions"
            class="drama__novel"
            option-filter-prop="label"
            placeholder="选择小说"
            show-search
            @change="changeNovel"
          />
          <Tooltip
            :title="workspaceDirty ? '当前面版有未保存修改' : '当前面版已保存'"
          >
            <Tag
              :bordered="false"
              :color="workspaceDirty ? 'warning' : 'success'"
            >
              {{ workspaceDirty ? '未保存' : '已保存' }}
            </Tag>
          </Tooltip>
          <Segmented v-model:value="surface" :options="SURFACES" />
          <span class="drama__spacer"></span>
          <Button
            size="small"
            :disabled="!novelId"
            :loading="styleLoading"
            @click="styleOpen = true"
          >
            {{ styleLabel }}
          </Button>
          <Button
            size="small"
            :disabled="!novelId || !aspectDictReady || aspectNotReady"
            :loading="aspectLoading"
            @click="ratioOpen = true"
          >
            {{ aspectLabel }}
          </Button>
        </div>
      </Card>

      <div class="drama__body">
        <Card class="drama__nav" :body-style="{ padding: '8px 12px' }">
          <div class="drama__nav-label">项目概览</div>
          <div class="drama__stats">
            <div class="drama__stat">
              <span>剧情</span>
              <b>{{ plotWordLabel }}字</b>
            </div>
            <div class="drama__stat">
              <span>实体</span>
              <b>{{ entityCountLabel }}个</b>
            </div>
            <div class="drama__stat">
              <span>分镜</span>
              <b>{{ storyboardStats.shotCount }}镜</b>
            </div>
            <div class="drama__stat">
              <span>分集</span>
              <b>{{ episodes.length }}集</b>
            </div>
          </div>

          <div class="drama__nav-label">剧集</div>
          <div v-if="!novelId" class="drama__nav-hint">先选择小说</div>
          <div v-else-if="episodesLoading" class="drama__nav-hint">
            加载中…
          </div>
          <div
            v-else-if="episodesError"
            class="drama__nav-hint drama__nav-hint--error"
          >
            {{ episodesError }}
          </div>
          <Empty
            v-else-if="!episodes.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无剧集"
          />
          <List
            v-else
            :data-source="episodes"
            :split="false"
            class="drama__episodes"
            size="small"
          >
            <template #renderItem="{ item }">
              <List.Item
                class="episode"
                :class="{ 'is-active': String(item.id) === String(episodeId) }"
                tabindex="0"
                @click="selectEpisode(item)"
                @keydown.enter="selectEpisode(item)"
              >
                第 {{ item.seq ?? '-' }} 集 · {{ item.title ?? '未命名' }}
              </List.Item>
            </template>
          </List>
        </Card>

        <Card class="drama__main" :body-style="{ padding: 0 }">
          <div class="drama__main-head">
            <span class="drama__surface">{{ currentSurfaceLabel }}</span>
            <span class="drama__episode-hint">{{ currentEpisodeLabel }}</span>
          </div>

          <div class="drama__surface-body">
            <!-- 用 v-show 保活编辑内容：切到工作流/画布再回来不丢草稿 -->
            <div v-show="surface === 'plot'" class="drama__plot-surface">
              <Segmented
                v-model:value="plotTab"
                :options="PLOT_TABS"
                class="drama__plot-tabs"
                size="small"
              />
              <div class="drama__plot-body">
                <PlotPanel
                  v-show="plotTab === 'script'"
                  :episode-id="episodeId"
                  :episodes="episodes"
                  @dirty-change="plotDirty = $event"
                  @select-episode="requestEpisodeChange"
                />
                <EntityPanel
                  v-show="plotTab === 'entities'"
                  :active="plotTab === 'entities'"
                  :episode-id="episodeId"
                  :focus-entity-id="entityFocusId"
                  :focus-type="entityFocusGroup"
                  :novel-id="novelId"
                  @dirty-change="entityDirty = $event"
                />
                <EpisodePanel
                  v-show="plotTab === 'episodes'"
                  :episode-id="episodeId"
                  :episodes="episodes"
                  :novel-id="novelId"
                  @applied="onEpisodeSplitApplied"
                  @select-episode="requestEpisodeChange"
                />
                <StoryboardPanel
                  :key="storyboardReloadKey"
                  v-show="plotTab === 'storyboard'"
                  :episode-id="episodeId"
                  :novel-id="novelId"
                  :project-ratio="aspectRatio"
                  :project-style="styleCurrentLabel"
                  @dirty-change="storyboardDirty = $event"
                  @stats-change="storyboardStats = $event"
                />
              </div>
            </div>
            <div
              v-if="surface === 'workflow'"
              class="drama__workflow-surface"
            >
              <WorkflowAgentPanel
                :novel-id="novelId"
                :open="surface === 'workflow'"
                :project-ratio="aspectRatio"
                :style-reference-url="styleReferenceUrl"
                @navigate="onWorkflowNavigate"
              />
            </div>
            <div v-else-if="surface === 'canvas'" class="surface-empty">
              <Empty
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="节点画布 P8 实现"
              />
            </div>
            <div
              v-else-if="surface === 'storyboard'"
              class="surface-empty"
            >
              <Empty
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="3D 导演台将在新页面实现（P9）"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>

    <ProjectStyleDrawer
      v-model:open="styleOpen"
      :novel-id="novelId"
      @saved="onStyleSaved"
    />
    <AspectRatioModal
      v-model:open="ratioOpen"
      :novel-id="novelId"
      :value="aspectRatio ?? ''"
      @saved="onAspectSaved"
    />
  </Page>
</template>

<style scoped lang="scss">
.drama {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;

  &__top {
    flex: none;
  }

  &__top-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__project-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__novel {
    width: 240px;
  }

  &__spacer {
    flex: 1;
  }

  &__body {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;
  }

  &__nav {
    display: flex;
    flex: none;
    flex-direction: column;
    width: 248px;

    :deep(.ant-card-body) {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 100%;
      min-height: 0;
    }
  }

  &__nav-label {
    font-size: 12px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  &__stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: hsl(var(--accent));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  &__stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    b {
      font-weight: 500;
      color: hsl(var(--foreground));
    }
  }

  &__nav-hint {
    padding: 8px 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__nav-hint--error {
    color: hsl(var(--destructive));
  }

  &__episodes {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;

    :deep(.ant-card-body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
  }

  &__main-head {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__surface {
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__episode-hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__surface-body {
    flex: 1;
    min-height: 0;
    padding: 12px;
    overflow-y: auto;
  }

  &__plot-surface {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    min-height: 0;
  }

  &__plot-tabs {
    flex: none;
  }

  &__plot-body {
    flex: 1;
    min-height: 0;
  }

  &__workflow-surface {
    height: 100%;
    min-height: 0;
  }
}

.episode {
  padding: 6px 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: hsl(var(--foreground));
  cursor: pointer;
  border-bottom: 0;
  border-radius: 6px;
}

.episode:hover {
  background: hsl(var(--accent));
}

.episode:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: -2px;
}

.episode.is-active {
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
}

.surface-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

</style>
