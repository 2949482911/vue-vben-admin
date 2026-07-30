import { requestClient } from '#/api/request';
import { BaseApi } from '#/api/core/baseapi';
import type {
  HostingTask,
  HostingTaskQueryParams,
  HostingLog,
  HostingLogQueryParams,
} from '#/api/models/ai_hosting';
import type { BatchOptions } from '#/api/models/core';
import type { PageResponse } from '#/api/models/marketing';

/**
 * AI 智能托管 API
 *
 * 后端服务前缀：/platform/ai_hosting
 * 需要后端配合实现以下接口：
 * - GET  /platform/ai_hosting/list          托管任务列表
 * - POST /platform/ai_hosting/create         创建托管任务
 * - POST /platform/ai_hosting/update         更新托管任务
 * - POST /platform/ai_hosting/batch_options  批量操作（暂停/恢复/删除）
 * - GET  /platform/ai_hosting/log/list       执行日志列表
 * - GET  /platform/ai_hosting/stats          托管统计概览
 */
class AiHostingApi extends BaseApi {
  /** 托管任务列表 */
  fetchTaskList(
    params: HostingTaskQueryParams,
  ): Promise<PageResponse<HostingTask>> {
    return requestClient.get<PageResponse<HostingTask>>(
      this.getServiceUrl('list'),
      { params },
    );
  }

  /** 创建托管任务 */
  fetchCreateTask(data: Partial<HostingTask>) {
    return requestClient.post(this.getServiceUrl('create'), data);
  }

  /** 更新托管任务 */
  fetchUpdateTask(data: Partial<HostingTask>) {
    return requestClient.post(this.getServiceUrl('update'), data);
  }

  /** 批量操作（暂停/恢复/删除） */
  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl('batch_options'), params);
  }

  /** 执行日志列表 */
  fetchLogList(
    params: HostingLogQueryParams,
  ): Promise<PageResponse<HostingLog>> {
    return requestClient.get<PageResponse<HostingLog>>(
      this.getServiceUrl('log/list'),
      { params },
    );
  }

  /** 托管统计概览 */
  fetchStats(params: { taskId?: string }) {
    return requestClient.get(this.getServiceUrl('stats'), { params });
  }
}

export const aiHostingApi: AiHostingApi =
  new AiHostingApi('/platform/ai_hosting');
