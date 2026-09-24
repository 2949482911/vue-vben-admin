<script lang="ts" setup name="NoticeCenter">
import type { NoticeItem } from '#/api/models';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page, VbenButton } from '@vben/common-ui';
import { EmptyIcon, Search } from '@vben/icons';
import { $t } from '@vben/locales';
import { VbenTiptapPreview } from '@vben/plugins/tiptap';

import { Input, Spin, Tag } from 'ant-design-vue';

import { noticeApi } from '#/api';
import {
  noticeLevelColor,
  noticeLevelText,
  noticePlainText,
} from '#/utils/notice';

const route = useRoute();

const notices = ref<NoticeItem[]>([]);
const loading = ref(false);
const detailLoading = ref(false);
const keyword = ref('');
const activeTab = ref('all');
const currentId = ref<string>();

const unreadCount = computed(
  () => notices.value.filter((item) => item.isRead !== 1).length,
);

const tabOptions = computed(() => [
  { count: 0, label: $t('system.notice.center.tabs.all'), value: 'all' },
  {
    count: unreadCount.value,
    label: $t('system.notice.center.tabs.unread'),
    value: 'unread',
  },
]);

const filteredNotices = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  return notices.value.filter((item) => {
    if (activeTab.value === 'unread' && item.isRead === 1) {
      return false;
    }
    if (!key) {
      return true;
    }
    return [item.title, item.createUsername, noticePlainText(item.content)].some(
      (value) => (value ?? '').toLowerCase().includes(key),
    );
  });
});

const currentNotice = computed(() =>
  notices.value.find((item) => item.id === currentId.value),
);

const emptyDescription = computed(() => {
  if (keyword.value.trim()) {
    return $t('system.notice.center.emptyFilter');
  }
  return activeTab.value === 'unread'
    ? $t('system.notice.center.emptyUnread')
    : $t('system.notice.center.emptyAll');
});

const emptyDescTip = computed(() =>
  keyword.value.trim()
    ? $t('system.notice.center.emptyFilterDesc')
    : $t('system.notice.center.emptyDesc'),
);

watch(
  filteredNotices,
  (list) => {
    if (!list.some((item) => item.id === currentId.value)) {
      currentId.value = list[0]?.id;
    }
  },
  { immediate: true },
);

async function loadNotices() {
  loading.value = true;
  try {
    const { items } = await noticeApi.fetchReadListNotice();
    notices.value = items ?? [];
    const queryId = route.query.id as string | undefined;
    if (queryId) {
      currentId.value = queryId;
    }
  } finally {
    loading.value = false;
  }
}

async function markRead(item: NoticeItem) {
  if (item.isRead === 1 || !item.id) {
    return;
  }
  await noticeApi.fetchReadNotice([item.id]);
  item.isRead = 1;
}

/** 页面内切换消息：不改动路由，仅切换详情并给出 loading */
async function handleSelect(item: NoticeItem) {
  // 点击的已是当前消息，只补标已读，不触发详情 loading
  if (item.id === currentId.value) {
    await markRead(item);
    return;
  }
  detailLoading.value = true;
  currentId.value = item.id;
  try {
    await markRead(item);
  } finally {
    detailLoading.value = false;
  }
}

async function handleMarkAllRead() {
  const unreadIds = notices.value
    .filter((item) => item.isRead !== 1 && item.id)
    .map((item) => item.id!);
  if (unreadIds.length === 0) {
    return;
  }
  await noticeApi.fetchReadNotice(unreadIds);
  notices.value.forEach((item) => {
    item.isRead = 1;
  });
}

onMounted(loadNotices);
</script>

<template>
  <Page
    auto-content-height
    :description="$t('system.notice.center.desc')"
    :title="$t('system.notice.center.title')"
  >
    <template #extra>
      <VbenButton
        :disabled="unreadCount === 0"
        size="sm"
        @click="handleMarkAllRead"
      >
        {{ $t('system.notice.center.markAllRead') }}
      </VbenButton>
    </template>

    <div class="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
      <!-- 左：通知列表卡片 -->
      <div
        class="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm lg:w-95"
      >
        <!-- 卡片头：标题 + 分段切换（全部 / 未读） -->
        <div
          class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3"
        >
          <span class="shrink-0 text-sm font-semibold text-foreground">
            {{ $t('system.notice.bell.title') }}
          </span>

          <div
            class="inline-grid shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-accent p-0.5"
          >
            <button
              v-for="tab in tabOptions"
              :key="tab.value"
              class="inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors"
              :class="
                activeTab === tab.value
                  ? 'bg-card font-semibold text-primary shadow-sm'
                  : 'font-medium text-muted-foreground hover:text-primary'
              "
              type="button"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
              <span
                v-if="tab.count > 0"
                class="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none"
                :class="
                  activeTab === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                "
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <div class="shrink-0 border-b border-border px-3 py-2.5">
          <Input
            v-model:value="keyword"
            allow-clear
            :placeholder="$t('system.notice.center.searchPlaceholder')"
          >
            <template #prefix>
              <Search class="size-3.5 text-muted-foreground" />
            </template>
          </Input>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <div v-if="loading" class="flex h-40 items-center justify-center">
            <Spin size="small" />
          </div>

          <ul
            v-else-if="filteredNotices.length > 0"
            class="divide-y divide-border"
          >
            <li
              v-for="item in filteredNotices"
              :key="item.id"
              class="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent"
              :class="{
                'bg-accent': item.id === currentId,
                'bg-primary/5': item.isRead !== 1 && item.id !== currentId,
              }"
              @click="handleSelect(item)"
            >
              <span class="relative flex size-9 shrink-0">
                <span
                  class="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {{ item.createUsername?.slice(0, 1) ?? '公' }}
                </span>
                <span
                  v-if="item.isRead !== 1"
                  class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary"
                ></span>
              </span>

              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span
                    class="truncate text-sm"
                    :class="
                      item.isRead === 1
                        ? 'font-normal text-muted-foreground'
                        : 'font-semibold text-foreground'
                    "
                  >
                    {{ item.title }}
                  </span>
                  <Tag
                    v-if="item.level"
                    :bordered="false"
                    :color="noticeLevelColor(item.level)"
                    class="m-0! shrink-0"
                  >
                    {{ noticeLevelText(item.level) }}
                  </Tag>
                </div>
                <p class="mt-1 truncate text-xs leading-4 text-muted-foreground">
                  {{ item.createUsername ?? '-' }} · {{ item.createTime }}
                </p>
                <p
                  class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground/80"
                >
                  {{ noticePlainText(item.content) }}
                </p>
              </div>
            </li>
          </ul>

          <div
            v-else
            class="flex flex-col items-center gap-2 px-4 py-14 text-center"
          >
            <EmptyIcon />
            <span class="text-sm text-muted-foreground">
              {{ emptyDescription }}
            </span>
            <span class="text-xs text-muted-foreground/80">
              {{ emptyDescTip }}
            </span>
          </div>
        </div>
      </div>

      <!-- 右：通知详情卡片 -->
      <div
        class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
      >
        <template v-if="currentNotice">
          <div class="shrink-0 border-b border-border px-6 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <Tag
                v-if="currentNotice.level"
                :bordered="false"
                :color="noticeLevelColor(currentNotice.level)"
                class="m-0!"
              >
                {{ noticeLevelText(currentNotice.level) }}
              </Tag>
              <Tag
                v-if="currentNotice.isRead !== 1"
                :bordered="false"
                class="m-0!"
                color="processing"
              >
                {{ $t('system.notice.center.tabs.unread') }}
              </Tag>
            </div>

            <h3
              class="mt-2.5 text-lg leading-snug font-semibold text-foreground"
            >
              {{ currentNotice.title }}
            </h3>

            <div class="mt-2.5 flex items-center gap-2">
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              >
                {{ currentNotice.createUsername?.slice(0, 1) ?? '公' }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ currentNotice.createUsername ?? '-' }}
              </span>
              <span class="text-xs text-muted-foreground/60">|</span>
              <span class="text-xs text-muted-foreground">
                {{ currentNotice.createTime }}
              </span>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div
              v-if="detailLoading"
              class="flex h-40 flex-col items-center justify-center gap-2"
            >
              <Spin size="small" />
              <span class="text-xs text-muted-foreground">
                {{ $t('system.notice.center.loading') }}
              </span>
            </div>
            <VbenTiptapPreview
              v-else-if="currentNotice.content"
              class="text-sm leading-relaxed"
              :content="currentNotice.content"
              :min-height="0"
            />
            <p v-else class="text-sm text-muted-foreground">
              {{ $t('system.notice.center.emptyAll') }}
            </p>
          </div>
        </template>

        <div
          v-else
          class="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
        >
          <EmptyIcon class="opacity-60" />
          <span class="text-sm text-muted-foreground">
            {{ $t('system.notice.center.selectTip') }}
          </span>
          <span class="max-w-70 text-xs text-muted-foreground/80">
            {{ $t('system.notice.center.selectDesc') }}
          </span>
        </div>
      </div>
    </div>
  </Page>
</template>
