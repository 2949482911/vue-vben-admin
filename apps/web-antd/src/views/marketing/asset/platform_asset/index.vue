<script setup lang="ts" name="PlatformAssetManager">
import type { PlatformAssetFilters } from './types';

/**
 * 媒体资产（首批：巨量引擎）
 *
 * 页面只负责媒体/资产类型切换与公共筛选；各资产类型表格由独立组件承载，
 * 媒体支持哪些资产由 config.ts 配置，新增媒体/类型只追加配置和组件。
 */
import type {
  PlatformAssetItem,
  PlatformAssetType,
} from '#/api/models/platform_asset';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, Input, Select, Space } from 'ant-design-vue';

import AssetDetailDrawer from './AssetDetailDrawer.vue';
import AssetTagDrawer from './AssetTagDrawer.vue';
import { MEDIA_ASSET_CONFIG } from './config';

const mediaOptions = MEDIA_ASSET_CONFIG.map((media) => ({
  label: media.label,
  value: media.key,
}));

const mediaKey = ref(MEDIA_ASSET_CONFIG[0]!.key);
const typeKey = ref(MEDIA_ASSET_CONFIG[0]!.types[0]!.key);

const activeMedia = computed(
  () =>
    MEDIA_ASSET_CONFIG.find((media) => media.key === mediaKey.value) ??
    MEDIA_ASSET_CONFIG[0]!,
);

const activeType = computed(
  () =>
    activeMedia.value.types.find((type) => type.key === typeKey.value) ??
    activeMedia.value.types[0]!,
);

const assetName = ref('');
const assetId = ref('');
const extraFilters = ref<Record<string, any>>({});
const appliedFilters = ref<PlatformAssetFilters>({});
const extraFields = computed(() => activeType.value.queryFields ?? []);
const refreshKey = ref(0);

const tagOpen = ref(false);
const tagTargets = ref<PlatformAssetItem[]>([]);
const detailOpen = ref(false);
const detailAsset = ref<null | PlatformAssetItem>(null);

function handleMediaChange(value: any) {
  mediaKey.value = String(value);
  typeKey.value = activeMedia.value.types[0]!.key;
  resetFilters();
}

function switchType(value: PlatformAssetType) {
  typeKey.value = value;
  resetFilters();
}

function applyFilters() {
  const extras = Object.fromEntries(
    Object.entries(extraFilters.value).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  );
  appliedFilters.value = {
    assetId: assetId.value.trim() || undefined,
    assetName: assetName.value.trim() || undefined,
    ...extras,
  };
}

function resetFilters() {
  assetName.value = '';
  assetId.value = '';
  extraFilters.value = {};
  appliedFilters.value = {};
}

function openBatchTag(rows: PlatformAssetItem[]) {
  tagTargets.value = rows;
  tagOpen.value = true;
}

function openSingleTag(asset: PlatformAssetItem) {
  tagTargets.value = [asset];
  tagOpen.value = true;
}

function openDetail(asset: PlatformAssetItem) {
  detailAsset.value = asset;
  detailOpen.value = true;
}

function handleTagSuccess() {
  detailOpen.value = false;
  // 重新挂载对应类型表格刷新数据，避免跨组件持有 Grid 实例
  refreshKey.value += 1;
}

function handleDetailTag(asset: PlatformAssetItem) {
  detailOpen.value = false;
  openSingleTag(asset);
}
</script>

<template>
  <Page auto-content-height content-class="p-5">
    <div class="flex h-full min-h-0 flex-col gap-3">
      <Card class="shrink-0">
        <div class="flex flex-wrap items-center gap-3">
          <Select
            v-model:value="mediaKey"
            class="!w-[150px]"
            :options="mediaOptions"
            @change="handleMediaChange"
          />
          <Space :size="8" wrap>
            <Button
              v-for="type in activeMedia.types"
              :key="type.key"
              :type="typeKey === type.key ? 'primary' : 'default'"
              @click="switchType(type.key)"
            >
              {{ type.label }}
            </Button>
          </Space>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-3">
          <Input
            v-model:value="assetName"
            allow-clear
            class="!w-[200px]"
            placeholder="资产名称（模糊）"
            @press-enter="applyFilters"
          />
          <Input
            v-model:value="assetId"
            allow-clear
            class="!w-[200px]"
            placeholder="资产 ID（精确）"
            @press-enter="applyFilters"
          />
          <template v-for="field in extraFields" :key="field.key">
            <Select
              v-if="field.type === 'select'"
              v-model:value="extraFilters[field.key]"
              allow-clear
              class="!w-[150px]"
              :options="field.options"
              :placeholder="field.label"
            />
            <Input
              v-else
              v-model:value="extraFilters[field.key]"
              allow-clear
              class="!w-[160px]"
              :placeholder="field.label"
              @press-enter="applyFilters"
            />
          </template>
          <Button type="primary" @click="applyFilters">查询</Button>
          <Button @click="resetFilters">重置</Button>
        </div>
      </Card>

      <div class="min-h-0 flex-1">
        <component
          :is="activeType.component"
          :key="`${mediaKey}-${typeKey}-${refreshKey}`"
          :filters="appliedFilters"
          :platform="mediaKey"
          @batch-tag="openBatchTag"
          @detail="openDetail"
          @tag="openSingleTag"
        />
      </div>

      <AssetTagDrawer
        v-model:open="tagOpen"
        :asset-type="typeKey"
        :targets="tagTargets"
        @success="handleTagSuccess"
      />
      <AssetDetailDrawer
        v-model:open="detailOpen"
        :asset="detailAsset"
        @tag="handleDetailTag"
      />
    </div>
  </Page>
</template>
