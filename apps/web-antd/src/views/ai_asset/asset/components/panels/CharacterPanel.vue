<script lang="ts" setup name="CharacterPanel">
/**
 * 资产 · 角色
 *
 * 角色列表（character/list）+ 新增/编辑（CharacterDrawer）+ 删除（character/batch_options）。
 * 一致性锚（consistencyAnchor）以键:值 标签展示，最多 4 项。
 */
import type { CharacterItem } from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';

import { useVbenDrawer } from '@vben/common-ui';

import {
  DeleteOutlined,
  EditOutlined,
  RobotOutlined,
} from '@ant-design/icons-vue';
import { Col, Empty, message, Row } from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import AssetCard from '../AssetCard.vue';
import CharacterDrawer from '../drawers/CharacterDrawer.vue';

const props = defineProps<{ items: CharacterItem[] }>();
const emit = defineEmits<{ changed: [] }>();

const [CharacterForm, characterApi] = useVbenDrawer({
  connectedComponent: CharacterDrawer,
});

const ACTIONS = [
  { icon: EditOutlined, key: 'edit', label: '编辑' },
  { danger: true, icon: DeleteOutlined, key: 'remove', label: '删除' },
];

/** 一致性锚 → 标签（键:值） */
function anchorTags(anchor?: null | Record<string, any>): string[] {
  return Object.entries(anchor ?? {})
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .slice(0, 4)
    .map(([k, v]) => `${k}:${String(v)}`);
}

function openCreate() {
  characterApi.setData({});
  characterApi.open();
}

function openEdit(row: CharacterItem) {
  characterApi.setData(row);
  characterApi.open();
}

async function remove(row: CharacterItem) {
  await aiAssetApi.fetchAssetBatchOptions('character', {
    targetIds: [String(row.id)],
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success('已删除');
  emit('changed');
}

function onAction(row: CharacterItem, key: string) {
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
    description="暂无角色，点击右上角「新增角色」创建"
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
        :body="item.prompt || ''"
        :icon="RobotOutlined"
        :image-url="item.avatarUrl"
        :name="item.name || '-'"
        :sub="`角色 · 一致性锚 ${anchorTags(item.consistencyAnchor).length} 项`"
        :tags="anchorTags(item.consistencyAnchor)"
        tint="character"
        @action="onAction(item, $event)"
      />
    </Col>
  </Row>

  <CharacterForm @success="emit('changed')" />
</template>

<style scoped lang="scss">
.panel-empty {
  padding: 56px 0;
}
</style>
