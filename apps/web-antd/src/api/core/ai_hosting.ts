import type {
  HostingAudit,
  HostingDecision,
  HostingDecisionQueryParams,
  HostingInsight,
  HostingReviewRequest,
  HostingStats,
  HostingTask,
  HostingTaskQueryParams,
} from '#/api/models/ai_hosting';
import type { BatchOptions } from '#/api/models/core';
import type { PageResponse } from '#/api/models/marketing';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * AI 智能托管 API
 *
 * 后端服务前缀：/platform/ai_hosting
 * 接口：
 * - GET  /platform/ai_hosting/list                托管任务列表（分页）
 * - POST /platform/ai_hosting/create               创建托管任务
 * - POST /platform/ai_hosting/update               更新托管任务
 * - POST /platform/ai_hosting/batch_options        批量操作（暂停/恢复/删除）
 * - GET  /platform/ai_hosting/stats                托管统计概览
 * - GET  /platform/ai_hosting/decision/list        决策单列表（分页）
 * - POST /platform/ai_hosting/decision/review      人工审核（批量）
 * - GET  /platform/ai_hosting/decision/audits      审核与执行留痕
 *
 * 说明：原 `log/list`（触发留痕）已随数据模型收敛移除；
 *       「触发留痕」并入审核台，统一读 `decision/list`。
 */
class AiHostingApi extends BaseApi {
  /** 批量操作（暂停/恢复/删除） */
  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl('batch_options'), params);
  }

  /** 创建托管任务 */
  fetchCreateTask(data: Partial<HostingTask>) {
    return requestClient.post(this.getServiceUrl('create'), data);
  }

  /** 审核与执行留痕（按时间升序） */
  fetchDecisionAudits(decisionId: number | string) {
    return requestClient.get<HostingAudit[]>(
      this.getServiceUrl('decision/audits'),
      { params: { decisionId } },
    );
  }

  /** 决策单列表（分页对象，与 list 一致） */
  fetchDecisionList(
    params: HostingDecisionQueryParams,
  ): Promise<PageResponse<HostingDecision>> {
    return requestClient.get<PageResponse<HostingDecision>>(
      this.getServiceUrl('decision/list'),
      { params },
    );
  }

  /** 决策洞察（命中率 / 平均 ROI 变化） */
  fetchInsight() {
    return requestClient.get<HostingInsight>(
      this.getServiceUrl('decision/insight'),
    );
  }

  /** 人工审核（批量）：通过并执行 / 拒绝，返回本次审批通过并执行成功的数量 */
  fetchReviewDecision(data: HostingReviewRequest) {
    return requestClient.post<number>(
      this.getServiceUrl('decision/review'),
      data,
    );
  }

  /** 人工回滚（批量），返回成功回滚数量 */
  fetchRollbackDecision(ids: Array<number | string>) {
    return requestClient.post<number>(this.getServiceUrl('decision/rollback'), {
      ids,
    });
  }

  /** 托管统计概览 */
  fetchStats(params: { taskId?: string }) {
    return requestClient.get<HostingStats>(this.getServiceUrl('stats'), {
      params,
    });
  }

  /** 托管任务列表 */
  fetchTaskList(
    params: HostingTaskQueryParams,
  ): Promise<PageResponse<HostingTask>> {
    return requestClient.get<PageResponse<HostingTask>>(
      this.getServiceUrl('list'),
      { params },
    );
  }

  /** 更新托管任务 */
  fetchUpdateTask(data: Partial<HostingTask>) {
    return requestClient.post(this.getServiceUrl('update'), data);
  }
}

export const aiHostingApi: AiHostingApi = new AiHostingApi(
  '/platform/ai_hosting',
);
