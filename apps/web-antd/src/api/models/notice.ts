import type {BaseItem, PageRequestParams} from '#/api/models/core';

/** 公告级别：通知 / 提醒 / 重要 */
export type NoticeLevel = 'error' | 'info' | 'warm';

export interface NoticeSearchParams extends PageRequestParams {
  title: string;
}

export interface NoticeItem extends BaseItem {
  title: string;
  /** 正文，富文本 HTML */
  content: string;
  level?: NoticeLevel;
  /** 1 已读 / 9 未读，仅 read_list 返回 */
  isRead?: number;
}

export interface CreateNoticeRequest {
  id?: string;
  title: string;
  content: string;
  level: NoticeLevel;
  status?: number;
}

export type UpdateNoticeRequest = CreateNoticeRequest;
