import type {
  CreateNoticeRequest,
  NoticeItem,
  NoticeSearchParams,
  UpdateNoticeRequest,
} from '#/api/models';

import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";

class NoticeApi extends BaseApi {

  constructor(serviceUrl: string) {
    super(serviceUrl);
  }


  getNoticeList(params: NoticeSearchParams) {
    return requestClient.get<NoticeItem[]>(this.getServiceUrl("list"), params);
  }

  fetchCreateNotice(params: CreateNoticeRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateNotice(params: UpdateNoticeRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

}

export const noticeApi: NoticeApi = new NoticeApi("/sys/notice");

