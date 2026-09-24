<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
// import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences, usePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
// import { openWindow } from '@vben/utils';

import { noticeApi } from '#/api';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import { noticePlainText } from '#/utils/notice';
import LoginForm from '#/views/_core/authentication/login.vue';

import ComboTag from './ComboTag.vue';

const notices = ref<NotificationItem[]>([]);

/** 发布人头像：用姓名首字生成 SVG，避免额外图片依赖 */
function publisherAvatar(name?: string) {
  const char = (name ?? '公').trim().charAt(0) || '公';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#006be6"/><text x="40" y="40" dy="0.35em" font-family="sans-serif" font-size="36" fill="#ffffff" text-anchor="middle">${char}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** 铃铛面板数据：read_list 返回分页结构，items 内每条带当前用户已读标记 */
async function loadNotices() {
  try {
    const { items } = await noticeApi.fetchReadListNotice();
    notices.value = (items ?? []).map((item) => ({
      id: item.id ?? item.title,
      avatar: publisherAvatar(item.createUsername),
      date: `${item.createUsername ?? '-'} · ${item.createTime ?? ''}`,
      isRead: item.isRead === 1,
      message: noticePlainText(item.content),
      title: item.title,
      link: '/system/notice/center',
      query: { id: item.id },
    }));
  } catch {
    notices.value = [];
  }
}

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { isDark } = usePreferences();
const showDot = computed(() => notices.value.some((item) => !item.isRead));

// 菜单
const menus = computed(() => [
  {
    handler: () => {
      router.push({ name: 'Profile' });
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  // {
  //   handler: () => {
  //     openWindow(VBEN_DOC_URL, {
  //       target: '_blank',
  //     });
  //   },
  //   icon: BookOpenText,
  //   text: $t('ui.widgets.document'),
  // },
  // {
  //   handler: () => {
  //     openWindow(VBEN_GITHUB_URL, {
  //       target: '_blank',
  //     });
  //   },
  //   icon: SvgGithubIcon,
  //   text: 'GitHub',
  // },
  // {
  //   handler: () => {
  //     openWindow(`${VBEN_GITHUB_URL}/issues`, {
  //       target: '_blank',
  //     });
  //   },
  //   icon: CircleHelp,
  //   text: $t('ui.widgets.qa'),
  // },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notices.value = [];
}

async function markRead(id: number | string) {
  const item = notices.value.find((notice) => notice.id === id);
  if (!item || item.isRead) {
    return;
  }
  await noticeApi.fetchReadNotice([id]);
  item.isRead = true;
}

function remove(id: number | string) {
  notices.value = notices.value.filter((notice) => notice.id !== id);
}

async function handleMakeAll() {
  const unreadIds = notices.value
    .filter((notice) => !notice.isRead)
    .map((notice) => notice.id);
  if (unreadIds.length === 0) {
    return;
  }
  await noticeApi.fetchReadNotice(unreadIds);
  notices.value.forEach((notice) => {
    notice.isRead = true;
  });
}

const viewAll = () => {
  router.push('/system/notice/center');
};

const handleClick = (item: NotificationItem) => {
  // 点击通知项跳转到站内通知中心对应详情
  if (item.link) {
    router.push({ path: item.link, query: item.query });
  }
};

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
    isDark: isDark.value,
  }),
  async ({ enable, content, isDark: isDarkValue }) => {
    if (enable) {
      const watermarkColor = isDarkValue
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)';

      await updateWatermark({
        advancedStyle: {
          colorStops: [
            {
              color: watermarkColor,
              offset: 0,
            },
            {
              color: watermarkColor,
              offset: 1,
            },
          ],
          type: 'linear',
        },
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);

onMounted(loadNotices);
</script>

<template>
  <BasicLayout
    :avatar
    :text="userStore.userInfo?.nickname"
    @clear-preferences-and-logout="handleLogout"
    @logout="handleLogout"
  >
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.nickname"
        :description="userStore.userInfo?.email"
        @clear-preferences-and-logout="handleLogout"
        @logout="handleLogout"
      >
        <template #tagText>
          <ComboTag />
        </template>
      </UserDropdown>
    </template>

    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notices"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
        @on-click="handleClick"
        @view-all="viewAll"
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
