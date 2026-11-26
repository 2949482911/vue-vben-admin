<script setup lang="ts" name="AudiencePackageAssetCard">
import type { AssetCommonProps, TagAssetConfig } from './types';

import { ref, watch } from 'vue';

import { targetedPackageApi } from '#/api/core';

import TagSelectAssetCard from './TagSelectAssetCard.vue';

const props = defineProps<AssetCommonProps & { config: TagAssetConfig }>();

const options = ref<Array<{ label: string; value: string }>>([]);
const loading = ref(false);

async function loadOptions() {
  loading.value = true;
  try {
    const res: any = await targetedPackageApi.fetchGetTitleTargetedPackage({
      page: 1,
      pageSize: 200,
      platform: props.platform,
    });
    options.value = (res?.items ?? []).map((item: any) => ({
      label: item.name,
      value: String(item.id),
    }));
  } catch {
    options.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.platform],
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
