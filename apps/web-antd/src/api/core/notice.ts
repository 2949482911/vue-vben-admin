import type {
  CreateNoticeRequest,
  NoticeItem,
  NoticeSearchParams,
  UpdateNoticeRequest,
} from '#/api/models';

import { requestClient } from '#/api/request';

/**
 * list
 * @param params p
 */
export function getNoticeList(params: NoticeSearchParams) {
  return requestClient.get<NoticeItem[]>('/sys/notice/list', params);
}

/**
 * create
 * @param params create
 */
export function fetchCreateNotice(params: CreateNoticeRequest) {
  return requestClient.post('/sys/notice/create', params);
}

/**
 * update
 * @param params
 */
export function fetchUpdateNotice(params: UpdateNoticeRequest) {
  return requestClient.post('/sys/notice/update', params);
}
