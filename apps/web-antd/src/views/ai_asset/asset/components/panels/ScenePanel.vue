<script lang="ts" setup name="ScenePanel">
/**
 * 资产 · 场景
 *
 * 场景列表（scene/list）+ 新增/编辑（SceneDrawer）+ 删除（scene/batch_options）。
 * 场景只有名称/参考图/描述，无一致性锚字段。
 */
import type { SceneItem } from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';

import { useVbenDrawer } from '@vben/common-ui';

import {
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
} from '@ant-design/icons-vue';
import { Col, Empty, message, Row } from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import AssetCard from '../AssetCard.vue';
import SceneDrawer from '../drawers/SceneDrawer.vue';

const props = defineProps<{ items: SceneItem[] }>();
const emit = defineEmits<{ changed: [] }>();

const [SceneForm, sceneApi] = useVbenDrawer({
  connectedComponent: SceneDrawer,
});

const ACTIONS = [
  { icon: EditOutlined, key: 'edit', label: '编辑' },
  { danger: true, icon: DeleteOutlined, key: 'remove', label: '删除' },
];

function openCreate() {
  sceneApi.setData({});
  sceneApi.open();
}

function openEdit(row: SceneItem) {
  sceneApi.setData(row);
  sceneApi.open();
}

async function remove(row: SceneItem) {
  await aiAssetApi.fetchAssetBatchOptions('scene', {
    targetIds: [String(row.id)],
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success('已删除');
  emit('changed');
}

function onAction(row: SceneItem, key: string) {
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
    description="暂无场景，点击右上角「新增场景」创建"
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
        :body="item.description || ''"
        :icon="PictureOutlined"
        :image-url="item.refUrl"
        :name="item.name || '-'"
        sub="场景 · 参考图"
        tint="scene"
        @action="onAction(item, $event)"
      />
    </Col>
  </Row>

  <SceneForm @success="emit('changed')" />
</template>

<style scoped lang="scss">
.panel-empty {
  padding: 56px 0;
}
</style>
