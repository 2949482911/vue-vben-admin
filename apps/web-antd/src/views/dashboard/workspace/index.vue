<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';
import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';

import {onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {preferences} from '@vben/preferences';
import {useUserStore} from '@vben/stores';
import {openWindow} from '@vben/utils';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';
import type {NoticeItem, RepresentativeItem} from "#/api/models";
import {noticeApi, taskApi} from "#/api";
import { $t } from "#/locales";
import {noticeLevelText, noticeLevelTextClass, noticePlainText} from "#/utils/notice";

const userStore = useUserStore();

// 这是一个示例数据，实际项目中需要根据实际情况进行调整
// url 也可以是内部路由，在 navTo 方法中识别处理，进行内部跳转
// 例如：url: /dashboard/workspace
const projectItems: WorkbenchProjectItem[] = [
  {
    color: '',
    content: '不要等待机会，而要创造机会。',
    date: '2021-04-01',
    group: '开源组',
    icon: 'carbon:logo-github',
    title: 'Github',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: '现在的你决定将来的你。',
    date: '2021-04-01',
    group: '算法组',
    icon: 'ion:logo-vue',
    title: 'Vue',
    url: 'https://vuejs.org',
  },
  {
    color: '#e18525',
    content: '没有什么才能比努力更重要。',
    date: '2021-04-01',
    group: '上班摸鱼',
    icon: 'ion:logo-html5',
    title: 'Html5',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
  },
  {
    color: '#bf0c2c',
    content: '热情和欲望可以突破一切难关。',
    date: '2021-04-01',
    group: 'UI',
    icon: 'ion:logo-angular',
    title: 'Angular',
    url: 'https://angular.io',
  },
  {
    color: '#00d8ff',
    content: '健康的身体是实现目标的基石。',
    date: '2021-04-01',
    group: '技术牛',
    icon: 'bx:bxl-react',
    title: 'React',
    url: 'https://reactjs.org',
  },
  {
    color: '#EBD94E',
    content: '路是走出来的，而不是空想出来的。',
    date: '2021-04-01',
    group: '架构组',
    icon: 'ion:logo-javascript',
    title: 'Js',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  },
];

// 同样，这里的 url 也可以使用以 http 开头的外部链接
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: '仪表盘',
    url: '/dashboard',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: '组件',
    url: '/demos/features/icons',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    title: '系统管理',
    url: '/demos/features/login-expired', // 这里的 URL 是示例，实际项目中需要根据实际情况进行调整
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: '权限管理',
    url: '/demos/access/page-control',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: '图表',
    url: '/analytics',
  },
];

const todoItems = ref<RepresentativeItem[]>([])

// const todoItems = ref<WorkbenchTodoItem[]>([
//   {
//     completed: false,
//     content: `审查最近提交到Git仓库的前端代码，确保代码质量和规范。`,
//     date: '2024-07-30 11:00:00',
//     title: '审查前端代码提交',
//   },
//   {
//     completed: true,
//     content: `检查并优化系统性能，降低CPU使用率。`,
//     date: '2024-07-30 11:00:00',
//     title: '系统性能优化',
//   },
//   {
//     completed: false,
//     content: `进行系统安全检查，确保没有安全漏洞或未授权的访问。 `,
//     date: '2024-07-30 11:00:00',
//     title: '安全检查',
//   },
//   {
//     completed: false,
//     content: `更新项目中的所有npm依赖包，确保使用最新版本。`,
//     date: '2024-07-30 11:00:00',
//     title: '更新项目依赖',
//   },
//   {
//     completed: false,
//     content: `修复用户报告的页面UI显示问题，确保在不同浏览器中显示一致。 `,
//     date: '2024-07-30 11:00:00',
//     title: '修复UI显示问题',
//   },
// ]);
const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-1',
    content: `在 <a>开源组</a> 创建了项目 <a>Vue</a>`,
    date: '刚刚',
    title: '威廉',
  },
  {
    avatar: 'svg:avatar-2',
    content: `关注了 <a>威廉</a> `,
    date: '1个小时前',
    title: '艾文',
  },
  {
    avatar: 'svg:avatar-3',
    content: `发布了 <a>个人动态</a> `,
    date: '1天前',
    title: '克里斯',
  },
  {
    avatar: 'svg:avatar-4',
    content: `发表文章 <a>如何编写一个Vite插件</a> `,
    date: '2天前',
    title: 'Vben',
  },
  {
    avatar: 'svg:avatar-1',
    content: `回复了 <a>杰克</a> 的问题 <a>如何进行项目优化？</a>`,
    date: '3天前',
    title: '皮特',
  },
  {
    avatar: 'svg:avatar-2',
    content: `关闭了问题 <a>如何运行项目</a> `,
    date: '1周前',
    title: '杰克',
  },
  {
    avatar: 'svg:avatar-3',
    content: `发布了 <a>个人动态</a> `,
    date: '1周前',
    title: '威廉',
  },
  {
    avatar: 'svg:avatar-4',
    content: `推送了代码到 <a>Github</a>`,
    date: '2021-04-01 20:00',
    title: '威廉',
  },
  {
    avatar: 'svg:avatar-4',
    content: `发表文章 <a>如何编写使用 Admin Vben</a> `,
    date: '2021-03-01 20:00',
    title: 'Vben',
  },
];

const router = useRouter();

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}

/**
 * 代办任务
 */
const getRepresentative = async () => {
  const { items } = await taskApi.fetchRepresentative({page: 1, pageSize: 20})
  todoItems.value = items
}

/**
 * 最新公告：取前 4 条，点击进入站内通知中心对应详情
 */
const noticeItems = ref<NoticeItem[]>([])

const getLatestNotices = async () => {
  try {
    const { items } = await noticeApi.fetchReadListNotice()
    noticeItems.value = (items ?? []).slice(0, 4)
  } catch {
    noticeItems.value = []
  }
}

function openNotice(item: NoticeItem) {
  router.push({path: '/system/notice/center', query: {id: item.id}})
}

function openNoticeCenter() {
  router.push('/system/notice/center')
}

onMounted(() => {
  getRepresentative()
  getLatestNotices()
})

</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.realName }}, 开始您一天的工作吧！
      </template>
      <template #description> 今日晴，20℃ - 32℃！</template>
    </WorkbenchHeader>

    <div class="flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="项目" @click="navTo"/>
        <WorkbenchTrends :items="trendItems" class="mt-5" title="最新动态"/>
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />

        <!-- 最新公告：沿用工作台其它卡片（shadcn Card）的结构与类名，保证观感一致 -->
        <div
          class="mt-5 flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm"
        >
          <div class="grid grid-cols-[1fr_auto] items-start gap-1.5 px-6">
            <h3 class="text-lg leading-none font-semibold">
              {{ $t('system.notice.workbench.latest') }}
            </h3>
            <button
              class="justify-self-end text-sm text-primary hover:opacity-80"
              type="button"
              @click="openNoticeCenter"
            >
              {{ $t('system.notice.workbench.viewAll') }}
            </button>
          </div>

          <div class="px-6 pt-0">
            <ul
              v-if="noticeItems.length > 0"
              class="w-full divide-y divide-border"
              role="list"
            >
              <li
                v-for="item in noticeItems"
                :key="item.id"
                class="flex cursor-pointer justify-between gap-x-6 py-5"
                @click="openNotice(item)"
              >
                <div class="flex min-w-0 items-center gap-x-4">
                  <span class="relative flex size-10 flex-none">
                    <span
                      class="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
                    >
                      {{ item.createUsername?.slice(0, 1) ?? '公' }}
                    </span>
                    <span
                      v-if="item.isRead !== 1"
                      class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary"
                    ></span>
                  </span>
                  <div class="min-w-0 flex-auto">
                    <p class="flex items-center gap-x-2 text-sm/6 font-semibold text-foreground">
                      <span class="truncate">{{ item.title }}</span>
                      <span
                        class="shrink-0 text-xs font-normal"
                        :class="noticeLevelTextClass(item.level)"
                      >
                        {{ noticeLevelText(item.level) }}
                      </span>
                    </p>
                    <p class="mt-1 flex items-center gap-x-1 text-xs/5 text-foreground/80">
                      <span class="shrink-0 font-medium text-foreground">
                        {{ item.createUsername ?? '-' }}
                      </span>
                      <span class="truncate">
                        {{ noticePlainText(item.content) }}
                      </span>
                    </p>
                  </div>
                </div>
                <div class="hidden h-full shrink-0 sm:flex sm:flex-col sm:items-end">
                  <span class="mt-6 text-xs/6 text-foreground/80">
                    {{ item.createTime }}
                  </span>
                </div>
              </li>
            </ul>

            <p v-else class="py-8 text-center text-sm text-muted-foreground">
              {{ $t('system.notice.workbench.empty') }}
            </p>
          </div>
        </div>

        <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项"/>
        <AnalysisChartCard class="mt-5" title="访问来源">
          <AnalyticsVisitsSource/>
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>
