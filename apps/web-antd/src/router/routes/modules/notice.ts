import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bell',
      order: 60,
      title: '站内通知',
    },
    name: 'Notice',
    path: '/system/notice',
    redirect: '/system/notice/center',
    children: [
      {
        name: 'NoticeCenter',
        path: 'center',
        component: () => import('#/views/system/notice/notice-center.vue'),
        meta: {
          icon: 'lucide:inbox',
          title: '通知中心',
        },
      },
    ],
  },
];

export default routes;
