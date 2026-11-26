import type {
  AutoTaskItem,
  AutoTaskQuery,
  AutoTaskStats,
  AutoTaskStatus,
} from './types';

import type {
  AutoProxyAdsTaskItem,
  AutoProxyAdsTaskListResult,
} from '#/api/models/auto_proxy_ads';

import { autoProxyAdsApi } from '#/api/core';

export const AUTO_TASK_STATUS_META: Record<
  AutoTaskStatus,
  { color: string; label: string }
> = {
  archived: { color: 'default', label: '已归档' },
  draft: { color: 'default', label: '草稿' },
  enabled: { color: 'green', label: '启用中' },
  paused: { color: 'orange', label: '已暂停' },
};

export const AUTO_TASK_STATUS_OPTIONS = Object.entries(
  AUTO_TASK_STATUS_META,
).map(([value, meta]) => ({ label: meta.label, value }));

export const LAST_EXECUTE_STATUS_META: Record<
  string,
  { color: string; label: string }
> = {
  cancelled: { color: 'default', label: '已取消' },
  failed: { color: 'red', label: '失败' },
  partial: { color: 'orange', label: '部分成功' },
  running: { color: 'blue', label: '执行中' },
  success: { color: 'green', label: '成功' },
  waiting_approval: { color: 'orange', label: '待审批' },
};

export const PLATFORM_MODE_OPTIONS = [
  { label: '巨量引擎-全域', value: 'bytedance#uni' },
  { label: '巨量引擎-智擎', value: 'bytedance#std' },
];

export const ACCOUNT_STRATEGY_OPTIONS = [
  { label: '随机', value: 'random' },
  { label: '创建时间最新', value: 'newest' },
  { label: '创建时间最早', value: 'oldest' },
  { label: '余额最高', value: 'balance-high' },
  { label: '余额最低', value: 'balance-low' },
];

export const SCHEDULE_FREQUENCY_OPTIONS = [
  { label: '5 分钟', value: '5m' },
  { label: '10 分钟', value: '10m' },
  { label: '15 分钟', value: '15m' },
  { label: '30 分钟', value: '30m' },
  { label: '60 分钟', value: '60m' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '自定义', value: 'custom' },
];

export const WEEKDAYS = [
  { label: '周一', value: '周一' },
  { label: '周二', value: '周二' },
  { label: '周三', value: '周三' },
  { label: '周四', value: '周四' },
  { label: '周五', value: '周五' },
  { label: '周六', value: '周六' },
  { label: '周日', value: '周日' },
];

export const MEDIA_ASSET_DEFINITIONS = [
  {
    key: 'aweme',
    label: '抖音号',
    hint: '仅已授权抖音号',
    options: [
      { label: '抖音号：爱看剧场', value: '抖音号：爱看剧场' },
      { label: '抖音号：星火剧场', value: '抖音号：星火剧场' },
    ],
  },
  {
    key: 'productLibrary',
    label: '商品库',
    hint: '平台同步商品库',
    options: [
      { label: '商品库：小说推广商品库', value: '商品库：小说推广商品库' },
      { label: '商品库：甜宠短剧商品库', value: '商品库：甜宠短剧商品库' },
    ],
  },
  {
    key: 'product',
    label: '商品',
    hint: '仅在售且审核通过',
    options: [
      { label: '商品：转移笔记之横扫仙界', value: '商品：转移笔记之横扫仙界' },
      { label: '商品：甜宠短剧合集', value: '商品：甜宠短剧合集' },
    ],
  },
];

export function formatPlatformLabel(
  platform?: string,
  platformMode?: string,
) {
  if (platform === 'bytedance' && platformMode === 'uni') {
    return '巨量引擎-全域';
  }
  if (platform === 'bytedance' && platformMode === 'std') {
    return '巨量引擎-智擎';
  }
  return [platform, platformMode].filter(Boolean).join('-') || '—';
}

export function formatRunSetting(runSetting?: Record<string, any>) {
  if (!runSetting) {
    return '—';
  }
  if (runSetting.triggerMode === 'manual' || runSetting.trigger === 'manual') {
    return '手动运行';
  }
  const frequency = runSetting.frequency ?? runSetting.scheduleFrequency;
  const time = runSetting.time ?? runSetting.scheduleTime ?? '09:30';
  if (frequency === 'weekly') {
    const weekdays = runSetting.weekdays ?? runSetting.scheduleWeekdays ?? [];
    return `每周${weekdays.join('、') || '未选择'} ${time}`;
  }
  if (frequency === 'monthly') {
    const monthDay = runSetting.monthDay ?? runSetting.scheduleMonthDay ?? '1';
    return `每月 ${monthDay === 'last' ? '月末' : `${monthDay} 日`} ${time}`;
  }
  if (frequency === 'custom') {
    return '自定义周期';
  }
  if (['5m', '10m', '15m', '30m', '60m'].includes(String(frequency))) {
    return `每 ${String(frequency).replace('m', '')} 分钟`;
  }
  return `每天 ${time}`;
}

function mapTaskItem(item: AutoProxyAdsTaskItem): AutoTaskItem {
  return {
    id: String(item.id),
    lastExecuteStatus: item.lastExecuteStatus,
    lastExecuteTime: item.lastExecuteTime,
    localAsset: item.localAsset,
    mediaAsset: item.mediaAsset,
    name: item.name,
    nextExecuteTime: item.nextExecuteTime,
    platform: item.platform,
    platformMode: item.platformMode ?? 'uni',
    projectId: item.projectId,
    projectName: item.projectName ?? String(item.projectId ?? '—'),
    remark: item.remark,
    runSetting: item.runSetting,
    scheduleText: formatRunSetting(item.runSetting),
    status: (item.taskStatus as AutoTaskStatus) || 'draft',
    tagIds: (item.labelIds ?? []).map((id) => String(id)),
    tags: item.labelNames?.length
      ? item.labelNames
      : (item.labelIds ?? []).map((id) => String(id)),
    updatedAt: item.updateTime ?? item.createTime,
    updatedBy: item.updateUsername ?? item.createUsername,
  };
}

export async function queryAutoTasks(query: AutoTaskQuery) {
  const res: AutoProxyAdsTaskListResult = await autoProxyAdsApi.fetchTaskList({
    name: query.name,
    page: query.page,
    pageSize: query.pageSize,
    platform: query.platform,
    platformMode: query.platformMode,
    taskStatus: query.status,
  });
  const items = (res?.items ?? []).map(mapTaskItem);
  return {
    items,
    total: res?.total ?? items.length,
  };
}

export async function fetchAutoTaskStats(): Promise<AutoTaskStats> {
  const res: AutoProxyAdsTaskListResult = await autoProxyAdsApi.fetchTaskList({
    page: 1,
    pageSize: 1000,
  });
  if (res?.summary) {
    return {
      draftCount: res.summary.draftCount ?? 0,
      enabledCount: res.summary.enabledCount ?? 0,
      pausedCount: res.summary.pausedCount ?? 0,
      totalCount: res.summary.totalCount ?? res.total ?? 0,
    };
  }
  const items = res?.items ?? [];
  return {
    draftCount: items.filter((item) => item.taskStatus === 'draft').length,
    enabledCount: items.filter((item) => item.taskStatus === 'enabled').length,
    pausedCount: items.filter((item) => item.taskStatus === 'paused').length,
    totalCount: res?.total ?? items.length,
  };
}
