<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Avatar, Card, Divider, Menu, MenuItem } from 'ant-design-vue';

import ComboInfo from './ComboInfo.vue';
import ProfileBase from './base-setting.vue';
import ProfileNotificationSetting from './notification-setting.vue';
import ProfilePasswordSetting from './password-setting.vue';
import ProfileSecuritySetting from './security-setting.vue';

const userStore = useUserStore();

const tabsValue = ref<string>('basic');

function onMenuClick({ key }: { key: string | number }) {
  tabsValue.value = String(key);
}
</script>

<template>
  <Page auto-content-height>
    <div class="flex size-full">
      <Card
        class="w-1/5 flex-none self-start"
        :body-style="{ padding: '16px' }"
      >
        <div class="flex flex-col items-center gap-3">
          <Avatar :size="80" :src="userStore.userInfo?.avatar">
            {{ userStore.userInfo?.nickname?.charAt(0) ?? '' }}
          </Avatar>
          <div class="flex flex-col items-center">
            <span class="text-lg font-semibold">
              {{ userStore.userInfo?.authName ?? '' }}
            </span>
            <span class="text-sm text-gray-500">
              {{ userStore.userInfo?.nickname ?? '' }}
            </span>
          </div>
        </div>

        <ComboInfo />

        <Divider class="my-4" />

        <Menu
          mode="inline"
          :selected-keys="[tabsValue]"
          class="border-0"
          @click="onMenuClick"
        >
          <MenuItem key="basic">基本设置</MenuItem>
          <MenuItem key="security">安全设置</MenuItem>
          <MenuItem key="password">修改密码</MenuItem>
          <MenuItem key="notice">新消息提醒</MenuItem>
        </Menu>
      </Card>

      <Card class="ml-4 w-4/5 flex-auto p-8">
        <ProfileBase v-if="tabsValue === 'basic'" />
        <ProfileSecuritySetting v-if="tabsValue === 'security'" />
        <ProfilePasswordSetting v-if="tabsValue === 'password'" />
        <ProfileNotificationSetting v-if="tabsValue === 'notice'" />
      </Card>
    </div>
  </Page>
</template>
