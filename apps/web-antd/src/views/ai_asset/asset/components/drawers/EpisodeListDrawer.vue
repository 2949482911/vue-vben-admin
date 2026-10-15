<script lang="ts" setup name="EpisodeListDrawer">
/**
 * 小说 → 分集 钻取抽屉（useVbenDrawer）
 *
 * 在「资产 › 小说」卡片点「分集」打开，管理该小说下的分集；新增/编辑走 EpisodeDrawer。
 * 接口：episode/list?novelId=、episode/save、episode/batch_options。
 */
import type { EpisodeItem, NovelItem } from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Empty, message, Spin, Tag } from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import { PICKER_PAGE_SIZE } from '../../../constants';
import EpisodeDrawer from './EpisodeDrawer.vue';

const emit = defineEmits(['changed']);

const [EpisodeForm, episodeFormApi] = useVbenDrawer({
  connectedComponent: EpisodeDrawer,
});

const loading = ref(false);
const episodes = ref<EpisodeItem[]>([]);
const novel = ref<NovelItem | null>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[560px]',
  closeOnPressEscape: true,
  footer: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData() as undefined | { novel?: NovelItem };
      novel.value = data?.novel ?? null;
      drawerApi.setState({ title: `分集 — ${novel.value?.name ?? ''}` });
      void load();
    } else {
      episodes.value = [];
      novel.value = null;
    }
  },
});

async function load() {
  if (!novel.value?.id) {
    return;
  }
  loading.value = true;
  try {
    const res = await aiAssetApi.fetchEpisodes({
      novelId: novel.value.id,
      page: 1,
      pageSize: PICKER_PAGE_SIZE,
    });
    episodes.value = res?.items ?? [];
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  episodeFormApi.setData({
    nextSeq: episodes.value.length + 1,
    novelId: novel.value?.id,
  });
  episodeFormApi.open();
}

function openEdit(row: EpisodeItem) {
  episodeFormApi.setData({ novelId: novel.value?.id, row });
  episodeFormApi.open();
}

async function remove(row: EpisodeItem) {
  await aiAssetApi.fetchAssetBatchOptions('episode', {
    targetIds: [String(row.id)],
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success('已删除');
  await load();
  emit('changed');
}

async function onSaved() {
  await load();
  emit('changed');
}
</script>

<template>
  <Drawer>
    <div class="ep-head">
      <Button type="primary" @click="openAdd">+ 新增分集</Button>
    </div>

    <Spin :spinning="loading">
      <div v-if="episodes.length" class="ep-list">
        <div v-for="ep in episodes" :key="ep.id" class="ep-item">
          <div class="ep-item__b">
            <Tag :bordered="false">第 {{ ep.seq ?? '-' }} 集</Tag>
            <span class="ep-item__t">{{ ep.title || '-' }}</span>
            <span class="ep-item__a">
              <Button size="small" type="link" @click="openEdit(ep)">编辑</Button>
              <Button danger size="small" type="link" @click="remove(ep)">删除</Button>
            </span>
          </div>
          <div v-if="ep.script" class="ep-item__s">{{ ep.script }}</div>
        </div>
      </div>
      <Empty v-else description="暂无分集，点击上方新增" />
    </Spin>

    <EpisodeForm @success="onSaved" />
  </Drawer>
</template>

<style scoped lang="scss">
.ep-head {
  margin-bottom: 12px;
}

.ep-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ep-item {
  padding: 10px 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.ep-item__b {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ep-item__t {
  font-size: 13px;
  font-weight: 600;
}

.ep-item__a {
  margin-left: auto;
}

.ep-item__s {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}
</style>
