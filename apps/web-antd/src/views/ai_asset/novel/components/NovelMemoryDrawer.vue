<script lang="ts" setup name="NovelMemoryDrawer">
/**
 * 全书记忆抽屉：位于小说工作台，承载长篇小说分层记忆的全局视图。
 * 数据来自记忆概览、伏笔台账、卷摘要与 Story Bible；批量重建依赖后端批次与 Airflow，
 * 当前入口保持禁用，不发请求也不轮询进度。
 */
import type {
  EpisodeItem,
  NovelForeshadowItem,
  NovelMemoryOverview,
  NovelStoryBible,
  NovelVolumeSummaryItem,
} from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Empty,
  message,
  Modal,
  Spin,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import {
  MEMORY_STATUS,
  MEMORY_STATUS_META as STATUS_META,
} from '../status';

const props = defineProps<{
  episodes: EpisodeItem[];
  novelId?: number | string;
}>();

const emit = defineEmits<{ updated: [] }>();

const TabPane = Tabs.TabPane;

const open = defineModel<boolean>('open', { default: false });

const loading = ref(false);
const activeTab = ref('overview');
const overview = ref<NovelMemoryOverview>();
const foreshadows = ref<NovelForeshadowItem[]>([]);
const volumes = ref<NovelVolumeSummaryItem[]>([]);
const bible = ref<NovelStoryBible>();
const foreshadowFilter = ref<'all' | 'open'>('open');

const importanceWeight: Record<string, number> = {
  high: 3,
  mid: 2,
  low: 1,
};

const visibleForeshadows = computed(() => {
  const list =
    foreshadowFilter.value === 'open'
      ? foreshadows.value.filter((item) => item.status === 'open')
      : foreshadows.value;
  return [...list].sort(
    (a, b) =>
      (importanceWeight[b.importance ?? ''] ?? 0) -
      (importanceWeight[a.importance ?? ''] ?? 0),
  );
});

/** 卷摘要接口未就绪时按 volumeNo 从章节目录生成占位卡 */
const volumeCards = computed<NovelVolumeSummaryItem[]>(() => {
  // 卷摘要不早于 30 章生成，不足 30 章不展示卷卡
  if (props.episodes.length < 30) {
    return [];
  }
  if (volumes.value.length) {
    return volumes.value;
  }
  const map = new Map<number, NovelVolumeSummaryItem>();
  for (const episode of props.episodes) {
    const volumeNo = Number(episode.volumeNo ?? 1);
    let card = map.get(volumeNo);
    if (!card) {
      card = {
        episodeFrom: episode.seq,
        episodeTo: episode.seq,
        status: 0,
        volumeNo,
      };
      map.set(volumeNo, card);
    }
    card.episodeFrom = Math.min(card.episodeFrom ?? episode.seq ?? 0, episode.seq ?? 0);
    card.episodeTo = Math.max(card.episodeTo ?? 0, episode.seq ?? 0);
  }
  return [...map.values()].sort((a, b) => a.volumeNo - b.volumeNo);
});

const stats = computed(() => ({
  characters: overview.value?.characterCount ?? '—',
  foreshadows: overview.value?.openForeshadowCount ?? '—',
  synced: overview.value?.syncedEpisodeSeq ?? '—',
}));

const bibleSections = computed(() => {
  const json = bible.value?.bibleJson ?? {};
  return [
    { label: '世界观规则', value: json.worldRules ?? json.worldview ?? json.world },
    { label: '势力 / 能力体系', value: json.factions ?? json.powerSystem ?? json.forces },
    { label: '术语表', value: json.terms ?? json.terminology },
    { label: '文风约束', value: json.style ?? json.writingStyle },
    { label: '核心冲突', value: json.coreConflict ?? json.conflict },
  ].filter((item) => item.value);
});

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join('；');
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value ?? '');
}

async function load() {
  if (!props.novelId) {
    return;
  }
  loading.value = true;
  const novelId = props.novelId;
  const [overviewRes, foreshadowRes, volumeRes, bibleRes] =
    await Promise.allSettled([
      aiAssetApi.fetchNovelMemoryOverview(novelId),
      aiAssetApi.fetchNovelForeshadows(novelId),
      aiAssetApi.fetchNovelVolumeSummaries(novelId),
      aiAssetApi.fetchNovelStoryBible(novelId),
    ]);
  if (overviewRes.status === 'fulfilled') {
    overview.value = overviewRes.value;
  }
  if (foreshadowRes.status === 'fulfilled') {
    foreshadows.value = foreshadowRes.value ?? [];
  }
  if (volumeRes.status === 'fulfilled') {
    volumes.value = volumeRes.value ?? [];
  }
  if (bibleRes.status === 'fulfilled') {
    bible.value = bibleRes.value;
  }
  loading.value = false;
}

function countImportance(list: NovelForeshadowItem[], importance: string) {
  return list.filter((item) => item.importance === importance).length;
}

function failText(error: any, fallback: string) {
  const code = Number(error?.response?.status ?? error?.code ?? error?.data?.code);
  return code === 404 ? '接口未就绪，待后端上线后重试' : error?.message || fallback;
}

function confirmResolve(item: NovelForeshadowItem) {
  Modal.confirm({
    title: '确认该伏笔已回收？',
    content: item.text,
    okText: '确认已回收',
    async onOk() {
      if (!props.novelId) {
        return;
      }
      try {
        await aiAssetApi.resolveNovelForeshadow({
          foreshadowId: item.id,
          novelId: props.novelId,
        });
        message.success('已人工确认伏笔回收');
        await load();
        emit('updated');
      } catch (error: any) {
        message.error(failText(error, '标记伏笔失败'));
      }
    },
  });
}

async function rebuildVolume(volumeNo: number) {
  if (!props.novelId) {
    return;
  }
  try {
    await aiAssetApi.rebuildNovelVolume({ novelId: props.novelId, volumeNo });
    message.success('本卷摘要重算已提交');
    await load();
  } catch (error: any) {
    message.error(failText(error, '重算卷摘要失败'));
  }
}

watch(open, (value) => {
  if (value) {
    activeTab.value = 'overview';
    void load();
  }
});
</script>

<template>
  <Drawer
    v-model:open="open"
    :width="960"
    destroy-on-close
    title="全书记忆"
  >
    <Spin :spinning="loading">
      <div class="novel-memory">
        <div class="novel-memory__stats">
          <span>人物 <b>{{ stats.characters }}</b></span>
          <span>未回收伏笔 <b>{{ stats.foreshadows }}</b></span>
          <span>记忆同步至第 <b>{{ stats.synced }}</b> 章</span>
          <Tag :bordered="false" color="purple">Story Bible</Tag>
        </div>
        <p v-if="!overview" class="novel-memory__muted">
          全书记忆接口待后端最终清单确认；当前仅章级 memory/status 与 memory/rebuild 可用。
        </p>

        <Tabs v-model:active-key="activeTab">
          <TabPane key="overview" tab="概览">
            <div class="novel-memory__blocks">
              <div class="novel-memory__card">
                <b>记忆覆盖</b>
                <p>
                  已同步到第 {{ stats.synced }} 章；未回收伏笔
                  {{ stats.foreshadows }} 条。
                </p>
              </div>
              <div class="novel-memory__card">
                <b>冲突处理原则</b>
                <p>
                  硬冲突（死亡人物复现、已回收伏笔重提、时间线倒错）在细纲阶段阻断；
                  软冲突（性格/称谓漂移）只做黄色提示。
                </p>
              </div>
            </div>
          </TabPane>

          <TabPane key="foreshadow" tab="未回收伏笔">
            <div class="novel-memory__bar">
              <Tag
                :bordered="false"
                :color="foreshadowFilter === 'open' ? 'orange' : 'default'"
                class="novel-memory__clickable"
                @click="foreshadowFilter = 'open'"
              >
                未回收
                {{ foreshadows.filter((item) => item.status === 'open').length }}
              </Tag>
              <Tag
                :bordered="false"
                :color="foreshadowFilter === 'all' ? 'blue' : 'default'"
                class="novel-memory__clickable"
                @click="foreshadowFilter = 'all'"
              >
                全部 {{ foreshadows.length }}
              </Tag>
              <span class="novel-memory__muted">
                高 {{ countImportance(visibleForeshadows, 'high') }} · 中
                {{ countImportance(visibleForeshadows, 'mid') }} · 低
                {{ countImportance(visibleForeshadows, 'low') }}
              </span>
            </div>
            <Empty
              v-if="!visibleForeshadows.length"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="暂无未回收伏笔"
            />
            <div v-else class="novel-memory__list">
              <div
                v-for="item in visibleForeshadows"
                :key="item.id"
                class="foreshadow-row"
                :class="{ 'is-closed': item.status !== 'open' }"
              >
                <Tag
                  :bordered="false"
                  :color="
                    item.importance === 'high'
                      ? 'red'
                      : item.importance === 'mid'
                        ? 'orange'
                        : 'default'
                  "
                >
                  {{ item.importance === 'high' ? '高' : item.importance === 'mid' ? '中' : '低' }}
                </Tag>
                <div class="foreshadow-row__text">
                  <b>{{ item.text }}</b>
                  <span>
                    埋点第 {{ item.plantEpisodeSeq ?? '-' }} 章
                    <template v-if="item.lastSeenSeq">
                      · 最近出现第 {{ item.lastSeenSeq }} 章
                    </template>
                    <template v-if="item.status !== 'open'">
                      · {{ item.status === 'closed' ? '已回收' : '已废弃' }}
                    </template>
                  </span>
                </div>
                <Button
                  v-if="item.status === 'open'"
                  size="small"
                  @click="confirmResolve(item)"
                >
                  标记已回收
                </Button>
              </div>
            </div>
          </TabPane>

          <TabPane key="volume" tab="卷摘要">
            <Empty
              v-if="!volumeCards.length"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="章节不足 30 章或卷摘要接口未就绪"
            />
            <div v-else class="novel-memory__blocks">
              <div
                v-for="volume in volumeCards"
                :key="volume.volumeNo"
                class="volume-card"
              >
                <div class="volume-card__hd">
                  <b>第 {{ volume.volumeNo }} 卷</b>
                  <Tag
                    :bordered="false"
                    :color="STATUS_META[volume.status ?? MEMORY_STATUS.NONE]?.color"
                  >
                    {{
                      STATUS_META[volume.status ?? MEMORY_STATUS.NONE]?.label ??
                      '未生成'
                    }}
                  </Tag>
                  <span class="novel-memory__muted">
                    第 {{ volume.episodeFrom ?? '-' }}–{{ volume.episodeTo ?? '-' }} 章
                  </span>
                  <Button
                    size="small"
                    @click="rebuildVolume(volume.volumeNo)"
                  >
                    重算本卷
                  </Button>
                </div>
                <p>{{ volume.summary || '暂无卷摘要' }}</p>
              </div>
            </div>
          </TabPane>

          <TabPane key="bible" tab="Story Bible">
            <p class="novel-memory__muted">
              由系统提炼，只读展示；人物基础设定请在资产里修改。
            </p>
            <Empty
              v-if="!bibleSections.length"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="Story Bible 接口未就绪或尚未生成"
            />
            <div v-else class="novel-memory__blocks">
              <div
                v-for="section in bibleSections"
                :key="section.label"
                class="novel-memory__card"
              >
                <b>{{ section.label }}</b>
                <pre>{{ formatValue(section.value) }}</pre>
              </div>
            </div>
          </TabPane>

          <TabPane key="rebuild" tab="批量重建">
            <div class="novel-memory__bar">
              <Button type="primary" disabled>重建全书记忆（未开放）</Button>
              <span class="novel-memory__muted">
                功能未开放：后端批量任务与 Airflow 执行接口尚未上线
              </span>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  </Drawer>
</template>

<style scoped lang="scss">
.novel-memory {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.novel-memory__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding: 8px 10px;
  font-size: 13px;
  background: hsl(var(--accent));
  border-radius: 8px;
}

.novel-memory__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.novel-memory__muted {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.novel-memory__clickable {
  cursor: pointer;
}

.novel-memory__blocks,
.novel-memory__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.novel-memory__card,
.volume-card {
  padding: 10px;
  background: hsl(var(--accent));
  border-radius: 8px;

  p {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
  }

  pre {
    margin: 6px 0 0;
    overflow: auto;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.volume-card__hd {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.foreshadow-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  background: hsl(var(--accent));
  border-radius: 8px;

  &.is-closed {
    opacity: 0.6;
  }

  &__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;

    span {
      color: hsl(var(--muted-foreground));
    }
  }
}
</style>
