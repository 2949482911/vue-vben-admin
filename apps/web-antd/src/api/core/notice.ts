import type {
  CreateNoticeRequest,
  NoticeItem,
  NoticeSearchParams,
  UpdateNoticeRequest,
} from '#/api/models';

import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";

class NoticeApi extends BaseApi {

  getNoticeList(params: NoticeSearchParams) {
    return requestClient.get<NoticeItem[]>(this.getServiceUrl("list"), {params});
  }

  fetchCreateNotice(params: CreateNoticeRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateNotice(params: UpdateNoticeRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchReadListNotice(): Promise<NoticeItem[]> {
    return requestClient.get(this.getServiceUrl("read_list"));
  }

  fetchReadNotice(ids: string[]) {
    return requestClient.get(this.getServiceUrl("read_notice"), {params: {ids: ids}});
  }
}

export const noticeApi: NoticeApi = new NoticeApi("/sys/notice");

