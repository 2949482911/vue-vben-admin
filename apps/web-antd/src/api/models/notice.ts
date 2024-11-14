import type {BaseItem, PageRequestParams} from '#/api/models/core';

export interface NoticeSearchParams extends PageRequestParams {
  title: string;
}

export interface NoticeItem extends BaseItem {
  title: string;
  content: string;
}

export interface CreateNoticeRequest {
  id: string;
  title: string;
  content: string;
  status: number;
}


export interface NotificationItem extends NoticeItem {
  isRead?: boolean;
}


export type UpdateNoticeRequest = CreateNoticeRequest;
