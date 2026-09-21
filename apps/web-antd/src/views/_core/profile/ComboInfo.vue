<script lang="ts" setup name="ComboInfo">
import { computed } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { useUserStore } from '@vben/stores';

import { getComboPrivilegeUnitName } from '../../system/sysenums';

interface ComboPrivilege {
  privilegeName: string;
  quota: number;
  unit: string;
}

interface ComboVo {
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  privileges: ComboPrivilege[];
}

const userStore = useUserStore();

const combo = computed<ComboVo | undefined>(
  () => userStore.userInfo?.mainBodyComboVo,
);
</script>

<template>
  <div
    v-if="combo"
    class="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
  >
    <!-- 顶部渐变横幅 -->
    <div
      class="flex items-center justify-between bg-gradient-to-r from-primary via-primary to-primary/70 px-4 py-2.5 text-primary-foreground"
    >
      <div class="flex items-center gap-1.5">
        <IconifyIcon icon="lucide:gem" class="size-4" />
        <span class="text-xs font-semibold tracking-wide">
          {{ $t('page.profile.currentCombo') }}
        </span>
      </div>
      <IconifyIcon icon="lucide:sparkles" class="size-3.5 opacity-80" />
    </div>

    <div class="px-4 py-3">
      <div class="text-base font-bold leading-tight">
        {{ combo.name }}
      </div>

      <div class="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconifyIcon icon="lucide:calendar-clock" class="size-3.5 shrink-0" />
        <span class="truncate">
          {{ combo.endTime }} {{ $t('page.profile.expiresAt') }}
        </span>
      </div>

      <div
        v-if="combo.privileges?.length"
        class="mt-3 border-t border-border pt-2.5"
      >
        <div class="mb-1.5 text-xs font-medium text-muted-foreground">
          {{ $t('page.profile.privileges') }}
        </div>
        <ul class="space-y-1.5">
          <li
            v-for="(item, index) in combo.privileges"
            :key="index"
            class="flex items-center gap-1.5 text-sm"
          >
            <IconifyIcon
              icon="lucide:circle-check"
              class="size-3.5 shrink-0 text-primary"
            />
            <span class="flex-1 truncate text-foreground/90">
              {{ item.privilegeName }}
            </span>
            <span class="shrink-0 text-xs font-medium text-foreground/60">
                  {{ item.quota }}{{ getComboPrivilegeUnitName(item.unit) }}
                </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
