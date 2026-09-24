import type { NoticeLevel } from '#/api/models';

import { $t } from '#/locales';

/**
 * 公告级别 → ant-design-vue Tag 预设色
 */
export function noticeLevelColor(level?: string) {
  const colors: Record<NoticeLevel, string> = {
    error: 'error',
    info: 'blue',
    warm: 'warning',
  };
  return colors[level as NoticeLevel] ?? 'default';
}

/**
 * 公告级别文案
 */
export function noticeLevelText(level?: string) {
  return level ? $t(`system.notice.level.${level}`) : '';
}

/**
 * 公告级别 → 文本颜色类名，用于工作台卡片的纯文本风格
 */
export function noticeLevelTextClass(level?: string) {
  const classes: Record<NoticeLevel, string> = {
    error: 'text-destructive',
    info: 'text-primary',
    warm: 'text-warning',
  };
  return classes[level as NoticeLevel] ?? 'text-muted-foreground';
}

/**
 * 富文本正文 → 纯文本，用于列表与铃铛的省略展示
 */
export function noticePlainText(content?: string) {
  return (content ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
