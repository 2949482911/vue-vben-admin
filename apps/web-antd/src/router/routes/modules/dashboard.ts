import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'UnifiedDashboard',
        path: 'unified',
        component: () => import('#/views/dashboard/unified/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:chart-line',
          title: '统一看板',
        },
      },
      {
        name: 'AiCopilot',
        path: 'ai-copilot',
        component: () => import('#/views/marketing/ai_copilot/index.vue'),
        meta: {
          icon: 'lucide:message-circle',
          title: 'AI 投手',
        },
      },
      {
        name: 'Analytics',
        path: 'analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: 'workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
];

export default routes;
