import type {
  WorkflowArchiveResult,
  WorkflowCreateTaskRequest,
  WorkflowCreateTaskResult,
  WorkflowDecisionRequest,
  WorkflowEstimateRequest,
  WorkflowPlan,
  WorkflowTask,
  WorkflowTaskItem,
} from '#/api/models/ai_asset_workflow';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * P7 工作流任务 Agent API。
 *
 * 链路位置：短剧工作台 → 工作流 → WorkflowAgentPanel。
 * 错误一律 skipErrorMessage=true，由页面按 parseApiError 口径内联展示。
 */
class AiAssetWorkflowApi extends BaseApi {
  /** 取消任务 */
  cancelWorkflowTask(taskId: number | string): Promise<void> {
    return requestClient.post<void>(
      this.getServiceUrl(`tasks/${taskId}/cancel`),
      undefined,
      { skipErrorMessage: true },
    );
  }

  /** 确认计划并创建任务 */
  createWorkflowTask(
    data: WorkflowCreateTaskRequest,
  ): Promise<WorkflowCreateTaskResult> {
    return requestClient.post<WorkflowCreateTaskResult>(
      this.getServiceUrl('tasks'),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 任务决策（实体定稿、补预算、视频报价、重试等） */
  decideWorkflowTask(
    taskId: number | string,
    data: WorkflowDecisionRequest,
  ): Promise<void> {
    return requestClient.post<void>(
      this.getServiceUrl(`tasks/${taskId}/decisions`),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 下单解析 + 计划卡 + 预估 */
  estimateWorkflow(data: WorkflowEstimateRequest): Promise<WorkflowPlan> {
    return requestClient.post<WorkflowPlan>(
      this.getServiceUrl('estimate'),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 当前项目未终态的最新任务；无任务返回 null */
  fetchActiveWorkflowTask(
    novelId: number | string,
  ): Promise<null | WorkflowTask> {
    return requestClient.get<null | WorkflowTask>(
      this.getServiceUrl('tasks/active'),
      { params: { novelId }, skipErrorMessage: true },
    );
  }

  /** 右侧实时档案 */
  fetchWorkflowArchive(
    novelId: number | string,
  ): Promise<WorkflowArchiveResult> {
    return requestClient.get<WorkflowArchiveResult>(
      this.getServiceUrl('archive'),
      { params: { novelId }, skipErrorMessage: true },
    );
  }

  /** 阶段明细 */
  fetchWorkflowItems(
    taskId: number | string,
    stage?: string,
  ): Promise<WorkflowTaskItem[]> {
    return requestClient.get<WorkflowTaskItem[]>(
      this.getServiceUrl(`tasks/${taskId}/items`),
      { params: stage ? { stage } : undefined, skipErrorMessage: true },
    );
  }

  /** 任务状态 */
  fetchWorkflowTask(taskId: number | string): Promise<WorkflowTask> {
    return requestClient.get<WorkflowTask>(
      this.getServiceUrl(`tasks/${taskId}`),
      { skipErrorMessage: true },
    );
  }
}

export const aiAssetWorkflowApi: AiAssetWorkflowApi = new AiAssetWorkflowApi(
  '/platform/ai_asset/v2/workflow',
);
