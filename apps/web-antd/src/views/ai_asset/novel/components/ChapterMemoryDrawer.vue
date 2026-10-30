<script lang="ts" setup name="ChapterMemoryDrawer">
/**
 * 章级结构化记忆抽屉：位于小说编辑器「本章记忆」卡片，定稿后人工校对用，不写回正文。
 * 后端当前提供 memory/status + memory/rebuild，人工修订保存接口未开放，因此本轮只读展示；
 * 重建按钮走单章重建，生成中由父级统一轮询 memory/status。
 */
import type { ChapterMemoryJson } from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import { Button, Drawer, Empty, message, Spin, Tag } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import {
  MEMORY_STATUS,
  MEMORY_STATUS_META as STATUS_META,
} from '../status';

const props = defineProps<{
  episodeId?: number | string;
  fallbackStatus?: number;
  modelId?: number | string;
}>();
const emit = defineEmits<{ updated: [] }>();
const open = defineModel<boolean>('open', { default: false });

const loading = ref(false);
const rebuilding = ref(false);
const status = ref<number>();
const source = ref('');
const contentVersion = ref<number>();
const shortMemory = ref('');
const errorMsg = ref('');
const loadError = ref('');
const memory = ref<ChapterMemoryJson>({});

/** 与父级 memoryStatusOf 保持一致：status 为 0 时沿用卡片推导出的状态 */
const displayStatus = computed(() => {
  const current = Number(status.value ?? MEMORY_STATUS.NONE);
  if (current !== MEMORY_STATUS.NONE) {
    return current;
  }
  const fallback = Number(props.fallbackStatus ?? MEMORY_STATUS.NONE);
  return fallback !== MEMORY_STATUS.NONE ? fallback : MEMORY_STATUS.NONE;
});

function applyDetail(detail: any) {
  status.value = detail?.memoryStatus;
  source.value = detail?.memorySource ?? '';
  contentVersion.value = detail?.contentVersion;
  shortMemory.value = detail?.shortMemory ?? '';
  errorMsg.value = detail?.errorMsg ?? '';
  memory.value = detail?.memoryJson ?? {};
}

function hasStructuredMemory(json?: ChapterMemoryJson) {
  return Boolean(
    json?.summary ||
      json?.endingState ||
      json?.events?.length ||
      json?.characters?.length ||
      json?.foreshadows?.length ||
      json?.timeline?.from ||
      json?.timeline?.to ||
      json?.timeline?.place,
  );
}

async function load() {
  if (!props.episodeId) {
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const res = await aiAssetApi.fetchEpisodeMemoryStatus(props.episodeId);
    applyDetail(res);
    const effectiveStatus =
      Number(res?.memoryStatus ?? MEMORY_STATUS.NONE) !== MEMORY_STATUS.NONE
        ? Number(res?.memoryStatus)
        : Number(props.fallbackStatus ?? MEMORY_STATUS.NONE);
    // 状态成功但内容为空或拉取失败时明确提示可重建，避免静默空白
    if (
      effectiveStatus === MEMORY_STATUS.SUCCESS &&
      !hasStructuredMemory(res?.memoryJson)
    ) {
      loadError.value = '记忆内容加载失败，可重建';
    }
  } catch (error: any) {
    const code = error?.response?.status ?? error?.code ?? error?.data?.code;
    loadError.value =
      Number(code) === 404
        ? '章节记忆状态接口未就绪，待后端开放后可用'
        : '记忆内容加载失败，可重建';
    // 保留父级传入的状态兜底，不把已知状态重置成未生成
  } finally {
    loading.value = false;
  }
}

async function rebuild() {
  if (!props.episodeId) {
    return;
  }
  rebuilding.value = true;
  try {
    const res = await aiAssetApi.rebuildChapterMemory({
      episodeId: props.episodeId,
      force: true,
      modelId: props.modelId,
    });
    applyDetail(res);
    message.success('已提交重建，正在后台生成记忆');
    emit('updated');
    await load();
  } catch (error: any) {
    const code = Number(error?.response?.status ?? error?.code ?? error?.data?.code);
    message.error(
      code === 404
        ? '重建接口未就绪，待后端上线后重试'
        : `${error?.message || '重建章节记忆失败'}${code === 400 ? '（请确认该章已定稿）' : ''}`,
    );
  } finally {
    rebuilding.value = false;
  }
}

watch(open, (value) => {
  if (value) {
    void load();
  }
});
</script>

<template>
  <Drawer
    v-model:open="open"
    :width="760"
    destroy-on-close
    title="本章结构化记忆"
  >
    <Spin :spinning="loading">
      <div class="chapter-memory">
        <div class="chapter-memory__status">
          <Tag
            :bordered="false"
            :color="STATUS_META[displayStatus]?.color"
          >
            {{ STATUS_META[displayStatus]?.label ?? '未知' }}
          </Tag>
          <span v-if="source">来源：{{ source }}</span>
          <span v-if="contentVersion">
            contentVersion：{{ contentVersion }}
          </span>
          <Tag :bordered="false">只读（人工修订接口待开放）</Tag>
          <Button size="small" :loading="rebuilding" @click="rebuild">
            重建本章记忆
          </Button>
        </div>
        <p v-if="errorMsg" class="chapter-memory__error">{{ errorMsg }}</p>
        <p v-if="loadError" class="chapter-memory__error">{{ loadError }}</p>
        <p class="nwb-tip">
          记忆状态 1=生成中；超过 10 分钟仍生成中可在章节目录点状态点重建。
        </p>

        <div class="chapter-memory__card">
          <b>摘要</b>
          <p>{{ memory.summary || '暂无结构化摘要' }}</p>
          <p v-if="shortMemory" class="chapter-memory__short">
            短记忆（下一章上下文使用）：{{ shortMemory }}
          </p>
        </div>

        <div class="chapter-memory__card">
          <b>事件（带因果）</b>
          <Empty
            v-if="!memory.events?.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无事件"
          />
          <div
            v-for="item in memory.events ?? []"
            :key="item.id"
            class="chapter-memory__line"
          >
            <Tag :bordered="false">{{ item.type || '事件' }}</Tag>
            <span>{{ item.text }}</span>
            <em v-if="item.causedBy?.length">
              因：{{ item.causedBy.join('、') }}
            </em>
          </div>
        </div>

        <div class="chapter-memory__card">
          <b>人物状态变化</b>
          <Empty
            v-if="!memory.characters?.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无人物状态"
          />
          <div
            v-for="(item, index) in memory.characters ?? []"
            :key="index"
            class="chapter-memory__line"
          >
            <Tag :bordered="false" color="blue">{{ item.name }}</Tag>
            <span>{{ item.state || '状态未记录' }}</span>
          </div>
        </div>

        <div class="chapter-memory__card">
          <b>伏笔埋收</b>
          <Empty
            v-if="!memory.foreshadows?.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无伏笔"
          />
          <div
            v-for="item in memory.foreshadows ?? []"
            :key="item.id"
            class="chapter-memory__line"
          >
            <Tag
              :bordered="false"
              :color="item.action === 'resolve' ? 'green' : 'orange'"
            >
              {{ item.action === 'plant' ? '埋设' : item.action === 'resolve' ? '回收' : '推进' }}
            </Tag>
            <span>{{ item.text }}</span>
            <em v-if="item.importance">重要度：{{ item.importance }}</em>
          </div>
        </div>

        <div class="chapter-memory__card">
          <b>时空推进</b>
          <p>
            {{ memory.timeline?.from || '-' }} → {{ memory.timeline?.to || '-' }}
            <template v-if="memory.timeline?.place">
              · {{ memory.timeline.place }}
            </template>
          </p>
        </div>

        <div class="chapter-memory__card">
          <b>结尾未完成动作 / 悬念</b>
          <p>{{ memory.endingState || '暂无' }}</p>
        </div>
      </div>
    </Spin>
  </Drawer>
</template>

<style scoped lang="scss">
.chapter-memory {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.chapter-memory__status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.chapter-memory__error {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--destructive));
}

.chapter-memory__card {
  padding: 10px;
  background: hsl(var(--accent));
  border-radius: 8px;

  p {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
  }
}

.chapter-memory__short {
  padding-top: 6px;
  border-top: 1px dashed hsl(var(--border));
}

.chapter-memory__line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-start;
  margin-top: 6px;
  font-size: 12px;

  em {
    color: hsl(var(--muted-foreground));
    font-style: normal;
  }
}
</style>
