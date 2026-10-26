<script lang="ts" setup name="EpisodePanel">
/**
 * 资产 · 分集
 *
 * 分集列表（episode/list，不传 novelId 即全部）+ 新增/编辑（EpisodeDrawer，归属小说在抽屉内选择）
 * + 删除（episode/batch_options）。
 */
import type { EpisodeItem } from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';

import { useVbenDrawer } from '@vben/common-ui';

import {
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
} from '@ant-design/icons-vue';
import { Col, Empty, message, Row } from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import AssetCard from '../AssetCard.vue';
import EpisodeDrawer from '../EpisodeDrawer.vue';

const props = defineProps<{ items: EpisodeItem[] }>();
const emit = defineEmits<{ changed: [] }>();

const [EpisodeForm, episodeApi] = useVbenDrawer({
  connectedComponent: EpisodeDrawer,
});

const ACTIONS = [
  { icon: EditOutlined, key: 'edit', label: '编辑' },
  { danger: true, icon: DeleteOutlined, key: 'remove', label: '删除' },
];

function title(item: EpisodeItem): string {
  const seq = item.seq === undefined ? '' : `第 ${item.seq} 集`;
  return [seq, item.title].filter(Boolean).join(' · ') || `分集 #${item.id}`;
}

function tags(item: EpisodeItem): string[] {
  return item.script ? [`剧本 ${item.script.length} 字`] : [];
}

function openCreate() {
  episodeApi.setData({});
  episodeApi.open();
}

function openEdit(row: EpisodeItem) {
  episodeApi.setData(row);
  episodeApi.open();
}

async function remove(row: EpisodeItem) {
  await aiAssetApi.fetchAssetBatchOptions('episode', {
    targetIds: [String(row.id)],
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success('已删除');
  emit('changed');
}

function onAction(row: EpisodeItem, key: string) {
  if (key === 'edit') {
    openEdit(row);
    return;
  }
  if (key === 'remove') {
    void remove(row);
  }
}

defineExpose({ openCreate });
</script>

<template>
  <Empty
    v-if="props.items.length === 0"
    class="panel-empty"
    description="暂无分集，点击右上角「新增分集」创建"
  />
  <Row v-else :gutter="[14, 14]">
    <Col
      v-for="item in props.items"
      :key="item.id"
      :lg="6"
      :md="8"
      :sm="12"
      :xs="24"
    >
      <AssetCard
        :actions="ACTIONS"
        :body="item.script || ''"
        :icon="FolderOutlined"
        :name="title(item)"
        :sub="item.novelId ? `分集 · 小说 #${item.novelId}` : '分集'"
        :tags="tags(item)"
        tint="episode"
        @action="onAction(item, $event)"
      />
    </Col>
  </Row>

  <EpisodeForm @success="emit('changed')" />
</template>

<style scoped lang="scss">
.panel-empty {
  padding: 56px 0;
}
</style>
