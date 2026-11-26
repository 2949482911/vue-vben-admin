<script setup lang="ts" name="AutoAdsPage">
import type { AutoTaskStats } from './types';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import AutoTaskList from './components/AutoTaskList.vue';
import AutoTaskSummary from './components/AutoTaskSummary.vue';
import { fetchAutoTaskStats } from './data';

const listRef = ref<null | { createTask: () => void }>(null);
const stats = ref<AutoTaskStats>({
  draftCount: 0,
  enabledCount: 0,
  pausedCount: 0,
  totalCount: 0,
});

async function refreshStats() {
  try {
    stats.value = await fetchAutoTaskStats();
  } catch {
    stats.value = {
      draftCount: 0,
      enabledCount: 0,
      pausedCount: 0,
      totalCount: 0,
    };
  }
}

function handleCreate() {
  listRef.value?.createTask();
}

onMounted(() => {
  void refreshStats();
});
</script>

<template>
  <Page auto-content-height content-class="p-5">
    <div class="flex h-full min-h-0 flex-col gap-4">
      <AutoTaskSummary :stats="stats" @create="handleCreate" />
      <div class="min-h-0 flex-1">
        <AutoTaskList ref="listRef" @changed="refreshStats" />
      </div>
    </div>
  </Page>
</template>
