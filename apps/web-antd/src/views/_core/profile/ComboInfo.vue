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
  <div v-if="combo" class="mt-4">
    <!-- VIP 金色横幅：套餐名 + 到期时间 -->
    <div
      class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f9e9a8] via-[#f2cd5c] to-[#d9a514] px-3 py-2.5 shadow-md"
    >
      <IconifyIcon
        icon="lucide:crown"
        class="size-5 shrink-0 text-[#5c4300]"
      />
      <div class="flex min-w-0 flex-1 flex-col leading-tight">
        <span class="truncate text-sm font-bold text-[#5c4300]">
          {{ combo.name }}
        </span>
        <span class="truncate text-xs text-[#5c4300]/80">
          {{ $t('page.profile.expiresAt') }} {{ combo.endTime }}
        </span>
      </div>
    </div>

    <!-- 权益列表 -->
    <div
      v-if="combo.privileges?.length"
      class="mt-3 rounded-xl border border-border bg-card px-3 py-2.5"
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
</template>
