import { BasicPageParams, BasicFetchResult } from '@/api/model/baseModel';

export type NoticePageParams = BasicPageParams & {
  title: string;
  status: number;
};

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  createUserName: string;
  createTime: string;
  updateTime: string;
  updateUserName: string;
  status: number;
  isRead: boolean;
}

export type NoticeItemList = BasicFetchResult<NoticeItem>;

export interface CreateNotice {
  title: string;
  content: string;
  status: number;
}

export type UpdateNotice = CreateNotice & {
  id: string;
};
