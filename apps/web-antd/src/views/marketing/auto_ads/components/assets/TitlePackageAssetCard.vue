<script setup lang="ts" name="TitlePackageAssetCard">
import type { AssetCommonProps, TagAssetConfig } from './types';

import { ref, watch } from 'vue';

import { titlePackApi } from '#/api/core';

import TagSelectAssetCard from './TagSelectAssetCard.vue';

const props = defineProps<AssetCommonProps & { config: TagAssetConfig }>();

const options = ref<Array<{ label: string; value: string }>>([]);
const loading = ref(false);

async function loadOptions() {
  loading.value = true;
  try {
    const res: any = await titlePackApi.fetchGetTitlePack({
      page: 1,
      pageSize: 200,
      platform: props.platform,
      projectId: props.projectId,
    });
    options.value = (res?.items ?? []).map((item: any) => ({
      label: item.title || item.name,
      value: String(item.id),
    }));
  } catch {
    options.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.platform, props.projectId],
  () => {
    void loadOptions();
  },
  { immediate: true },
);
</script>

<template>
  <TagSelectAssetCard
    :asset="asset"
    :config="config"
    :loading="loading"
    :options="options"
    :tag-names="tagNames"
  />
</template>
