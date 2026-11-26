<script setup lang="ts" name="AssetDetailDrawer">
/**
 * 媒体资产 — 详情（按 assetType 展示巨量返回字段，枚举值首版直接展示原值）
 */
import type {
  PlatformAssetItem,
  PlatformAssetType,
} from '#/api/models/platform_asset';

import { computed } from 'vue';

import {
  Avatar,
  Button,
  Descriptions,
  Drawer,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';

import { getLabelColor } from '#/views/marketing/account/label/constants';

const props = defineProps<{
  asset: null | PlatformAssetItem;
  open: boolean;
}>();

const emit = defineEmits<{
  'tag': [PlatformAssetItem];
  'update:open': [boolean];
}>();

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const TYPE_LABEL: Record<PlatformAssetType, string> = {
  aweme: '抖音号',
  product: '商品',
  product_library: '商品库',
};

const typeLabel = computed(() =>
  props.asset ? TYPE_LABEL[props.asset.assetType] : '-',
);

const thumb = computed(
  () =>
    props.asset?.imageUrl ??
    props.asset?.imagesUrl?.[0] ??
    props.asset?.backupImages?.[0],
);

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const detailFields = computed(() => {
  const asset = props.asset;
  if (!asset) return [];
  const base = [
    { label: '媒体平台', value: '巨量引擎' },
    { label: '资产类型', value: typeLabel.value },
    { label: '资产 ID', value: asset.assetId },
  ];
  if (asset.assetType === 'aweme') {
    return [
      ...base,
      { label: '账号类型', value: text(asset.awemeUserType) },
      { label: '授权类型', value: text(asset.authType) },
      { label: '授权状态', value: text(asset.authStatus) },
      { label: '共享类型', value: text(asset.shareType) },
      { label: '授权到期', value: text(asset.authAutoExpireDate) },
      { label: '开始时间', value: text(asset.startTime) },
      { label: '结束时间', value: text(asset.endTime) },
      { label: '授权场景', value: text(asset.authScenarios) },
      { label: '备注', value: text(asset.note) },
    ];
  }
  if (asset.assetType === 'product_library') {
    return [
      ...base,
      { label: '店铺类型', value: text(asset.storeType) },
      { label: '来源', value: text(asset.source) },
      { label: '账号类型', value: text(asset.accountType) },
      { label: '创建时间', value: text(asset.platformCreateTime) },
      { label: '修改时间', value: text(asset.platformModifyTime) },
      { label: '历史账号类型', value: text(asset.historyAccountType) },
    ];
  }
  return [
    ...base,
    { label: '商品状态', value: text(asset.productStatus) },
    { label: '审核状态', value: text(asset.auditStatus) },
    { label: '类目 ID', value: text(asset.categoryId) },
    { label: '品牌 ID', value: text(asset.brandId) },
    { label: '库存', value: text(asset.stock) },
    { label: '创建时间', value: text(asset.platformCreateTime) },
    { label: '修改时间', value: text(asset.platformModifyTime) },
    { label: '拒绝原因', value: text(asset.reason) },
  ];
});
</script>

<template>
  <Drawer v-model:open="visible" :width="480">
    <template #title>
      <div class="flex items-center gap-2">
        <span>资产详情</span>
        <Tag :bordered="false" color="blue">{{ typeLabel }}</Tag>
      </div>
    </template>

    <template v-if="asset">
      <div class="flex items-start gap-3">
        <Avatar
          :size="48"
          :src="thumb"
          class="shrink-0 !bg-primary/10 !text-primary"
          shape="square"
        >
          {{ asset.assetName?.slice(0, 1) }}
        </Avatar>
        <div class="min-w-0 flex-1">
          <Typography.Title :level="5" class="!mb-0 break-all">
            {{ asset.assetName }}
          </Typography.Title>
          <div class="mt-1 text-xs text-muted-foreground">
            巨量引擎 · {{ typeLabel }} · {{ asset.assetId }}
          </div>
        </div>
      </div>

      <Descriptions :column="1" bordered class="mt-4" size="small">
        <Descriptions.Item
          v-for="field in detailFields"
          :key="field.label"
          :label="field.label"
        >
          {{ field.value }}
        </Descriptions.Item>
      </Descriptions>

      <div class="mt-4">
        <div class="mb-2 text-sm font-medium">本地标签</div>
        <Space v-if="(asset.labelNames ?? []).length" :size="[4, 4]" wrap>
          <Tag
            v-for="name in asset.labelNames"
            :key="name"
            :bordered="false"
            :color="getLabelColor(name)"
          >
            {{ name }}
          </Tag>
        </Space>
        <Typography.Text v-else type="secondary" class="text-xs">
          暂无本地标签
        </Typography.Text>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button v-if="asset" @click="emit('tag', asset)">打标签</Button>
        <Button type="primary" @click="visible = false">关闭</Button>
      </div>
    </template>
  </Drawer>
</template>
