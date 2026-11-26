<script setup lang="ts" name="AwemeAssetCard">
import type { AssetCommonProps, MediaAssetConfig } from './types';

import MediaAssetCardBase from './MediaAssetCardBase.vue';

defineProps<AssetCommonProps & { config: MediaAssetConfig }>();
</script>

<template>
  <MediaAssetCardBase
    :asset="asset"
    :config="config"
    :platform="platform"
    :platform-mode="platformMode"
    :project-id="projectId"
    :tag-ids="tagIds"
    :tag-names="tagNames"
  />
</template>
