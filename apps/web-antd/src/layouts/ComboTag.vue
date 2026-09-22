<script lang="ts" setup name="ComboTag">
import { computed } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();

const combo = computed(() => userStore.userInfo?.mainBodyComboVo);

// 剩余天数
const remainDays = computed(() => {
  const endTime = combo.value?.endTime;
  if (!endTime) {
    return null;
  }
  const end = new Date(endTime.replace(/-/g, '/')).getTime();
  if (Number.isNaN(end)) {
    return null;
  }
  return Math.ceil((end - Date.now()) / 86_400_000);
});

// 'soon' | 'half' | 'week' | ''
const expireStatus = computed(() => {
  const days = remainDays.value;
  if (days === null) {
    return '';
  }
  if (days < 7) {
    return 'week';
  }
  if (days < 15) {
    return 'half';
  }
  if (days < 30) {
    return 'soon';
  }
  return '';
});
</script>

<template>
  <span v-if="combo" class="ml-2 inline-flex items-center gap-1">
    <IconifyIcon
      icon="lucide:crown"
      class="size-3.5 shrink-0 text-[#d4a017]"
    />
    <span class="max-w-32 truncate font-semibold text-[#d4a017]">
      {{ combo.name }}
    </span>
    <span
      v-if="expireStatus === 'soon'"
      class="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-600"
    >
      {{ $t('page.profile.expiringSoon') }}
    </span>
    <span
      v-else-if="expireStatus === 'half'"
      class="shrink-0 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[11px] font-medium text-orange-600"
    >
      {{ $t('page.profile.lessThanHalfMonth') }}
    </span>
    <span
      v-else-if="expireStatus === 'week'"
      class="shrink-0 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[11px] font-medium text-red-600"
    >
      {{ $t('page.profile.lessThanWeek') }}
    </span>
  </span>
</template>
