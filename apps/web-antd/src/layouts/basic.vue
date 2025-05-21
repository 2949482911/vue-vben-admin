<script lang="ts" setup>
import type {NotificationItem} from '@vben/layouts';
import {BasicLayout, LockScreen, Notification, UserDropdown,} from '@vben/layouts';

import {computed, onMounted, ref, watch} from 'vue';

import {AuthenticationLoginExpiredModal} from '@vben/common-ui';
import {VBEN_DOC_URL, VBEN_GITHUB_URL} from '@vben/constants';
import {useWatermark} from '@vben/hooks';
import {BookOpenText, CircleHelp, MdiGithub} from '@vben/icons';
import {preferences} from '@vben/preferences';
import {useAccessStore, useUserStore} from '@vben/stores';
import {openWindow} from '@vben/utils';
import {noticeApi, userApi} from "#/api";

import {$t} from '#/locales';
import {useAuthStore} from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([]);

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() => {
  if (notifications.value.length) {
    notifications.value.some((item) => !item.isRead);
  }
});

const menus = computed(() => [
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: MdiGithub,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

/**
 * 退出登录
 */
async function handleLogout() {
  await authStore.logout(false);
}

/**
 * 修改密码
 * @param values
 */
async function handlerUpdatePassword(values: Record<string, any>) {
  await userApi.fetchUpdatePassword(values)
  await handleLogout()
}

function handleNoticeClear() {
  notifications.value = [];
}

async function handleMakeAll() {
  const ids: string[] = []
  notifications.value.forEach((item) => (ids.push(item.id)));
  await noticeApi.fetchReadNotice(ids)
  notifications.value.forEach((item) => (item.isRead = true));
}

watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  noticeApi.fetchReadListNotice().then(res => {
    notifications.value = res;
  })
})

</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :description="userStore.userInfo?.authName"
        :menus
        :text="userStore.userInfo?.nickname"
        tag-text="Pro"
        @logout="handleLogout"
        @update-password="handlerUpdatePassword"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
