import type {
  CreateNoticeRequest,
  NoticeItem,
  NoticeSearchParams,
  UpdateNoticeRequest,
} from '#/api/models';
import type {BatchOptions, PageResult} from "#/api/models/core";

import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';

class NoticeApi extends BaseApi {

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }

  fetchCreateNotice(params: CreateNoticeRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  /**
   * 公告列表 + 当前登录用户已读标记（isRead：1 已读 / 9 未读）
   * 后端 PageIntercept 会把 `*List` 方法统一包装为 { items, page, pageCount, pageSize, total }
   */
  fetchReadListNotice(): Promise<PageResult<NoticeItem>> {
    return requestClient.get(this.getServiceUrl("read_list"));
  }

  /** 标记已读，后端按「当前登录用户」维度写入 notice_read */
  fetchReadNotice(noticeIds: Array<number | string>) {
    return requestClient.get(this.getServiceUrl("read_notice"), {
      params: {noticeIds: noticeIds.join(",")},
    });
  }

  fetchUpdateNotice(params: UpdateNoticeRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  getNoticeList(params: NoticeSearchParams): Promise<PageResult<NoticeItem>> {
    return requestClient.get(this.getServiceUrl("list"), {params});
  }
}

export const noticeApi: NoticeApi = new NoticeApi("/sys/notice");

