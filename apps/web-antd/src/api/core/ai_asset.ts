import type {
  AssetType,
  CatalogNameQuery,
  CharacterItem,
  CharacterSaveRequest,
  EdgeItem,
  EpisodeItem,
  EpisodeQuery,
  EpisodeSaveRequest,
  GenerateRequest,
  GenerationTaskItem,
  MaterialItem,
  MaterialQuery,
  MaterialUploadRequest,
  NodeItem,
  NovelDetailItem,
  NovelItem,
  NovelSaveRequest,
  RunItem,
  RunNodeItem,
  RunQuery,
  ScenarioItem,
  ScenarioQuery,
  SceneItem,
  SceneSaveRequest,
  TaskQuery,
  VersionItem,
  WorkflowItem,
  WorkflowQuery,
  WorkflowSaveRequest,
  WorkspaceCreateRequest,
  WorkspaceItem,
  WorkspaceQuery,
} from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';
import type { PageResponse } from '#/api/models/marketing';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * AI 素材资产工作台 API
 *
 * 后端服务前缀：/platform/ai_asset（turbo 模块 AiAssetController）
 * - 工作区：create / list
 * - 素材（草稿区）：list（分页）/ version / confirm
 * - 生成任务：list（分页）/ cancel
 * - 资产：scenario / character / scene / episode / novel（均分页；结构性列表除外）
 *
 * 说明：素材生成（material/generate）需在「创作工作台」承载，本期未接入。
 * 分页约定：浏览型 list 一律带 page/pageSize 并返回 PageResponse（后端 PageIntercept 包装）；
 *          workflow/node、workflow/edge、workflow/run/node、material/version 为结构性列表，不分页。
 */
class AiAssetApi extends BaseApi {
  /** 取消生成任务 */
  cancelTask(taskId: number | string) {
    return requestClient.post(this.getServiceUrl('task/cancel'), null, {
      params: { taskId },
    });
  }

  /** 确认入库（AI 打标 + 单向进正式素材库） */
  confirmMaterial(materialId: number | string) {
    return requestClient.post(
      this.getServiceUrl('material/confirm'),
      null,
      { params: { materialId } },
    );
  }

  /** 创建工作区 */
  createWorkspace(data: WorkspaceCreateRequest) {
    return requestClient.post(this.getServiceUrl('workspace/create'), data);
  }

  /** 资产（角色/场景/分集/小说）批量操作（删除/启停） */
  fetchAssetBatchOptions(assetType: AssetType, params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl(`${assetType}/batch_options`),
      params,
    );
  }

  /** 角色列表（分页） */
  fetchCharacters(params: CatalogNameQuery): Promise<PageResponse<CharacterItem>> {
    return requestClient.get<PageResponse<CharacterItem>>(
      this.getServiceUrl('character/list'),
      { params },
    );
  }

  /** 分集列表（分页；可按小说 / 标题过滤） */
  fetchEpisodes(params: EpisodeQuery): Promise<PageResponse<EpisodeItem>> {
    return requestClient.get<PageResponse<EpisodeItem>>(
      this.getServiceUrl('episode/list'),
      { params },
    );
  }

  /** 素材：批量操作（删除等） */
  fetchMaterialBatchOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('material/batch_options'),
      params,
    );
  }

  /** 素材列表（分页；草稿区用 status=1） */
  fetchMaterialList(params: MaterialQuery): Promise<PageResponse<MaterialItem>> {
    return requestClient.get<PageResponse<MaterialItem>>(
      this.getServiceUrl('material/list'),
      { params },
    );
  }

  /** 小说详情（含正文，编辑回显用） */
  fetchNovelDetail(id: number | string): Promise<NovelDetailItem> {
    return requestClient.get<NovelDetailItem>(
      this.getServiceUrl('novel/detail'),
      { params: { id } },
    );
  }

  /** 小说列表（分页，不含正文） */
  fetchNovelList(params: CatalogNameQuery): Promise<PageResponse<NovelItem>> {
    return requestClient.get<PageResponse<NovelItem>>(
      this.getServiceUrl('novel/list'),
      { params },
    );
  }

  /** 运行记录列表（分页） */
  fetchRunList(params: RunQuery): Promise<PageResponse<RunItem>> {
    return requestClient.get<PageResponse<RunItem>>(
      this.getServiceUrl('workflow/run/list'),
      { params },
    );
  }

  /** 运行节点级进度 */
  fetchRunNodes(runId: number | string): Promise<RunNodeItem[]> {
    return requestClient.get<RunNodeItem[]>(
      this.getServiceUrl('workflow/run/node/list'),
      { params: { runId } },
    );
  }

  /** 场景模板列表（分页） */
  fetchScenarios(params: ScenarioQuery): Promise<PageResponse<ScenarioItem>> {
    return requestClient.get<PageResponse<ScenarioItem>>(
      this.getServiceUrl('scenario/list'),
      { params },
    );
  }

  /** 广告场景列表（分页） */
  fetchScenes(params: CatalogNameQuery): Promise<PageResponse<SceneItem>> {
    return requestClient.get<PageResponse<SceneItem>>(
      this.getServiceUrl('scene/list'),
      { params },
    );
  }

  // ==================== 工作流（创作工作台画布） ====================

  /** 生成任务列表（分页） */
  fetchTaskList(
    params: TaskQuery,
  ): Promise<PageResponse<GenerationTaskItem>> {
    return requestClient.get<PageResponse<GenerationTaskItem>>(
      this.getServiceUrl('task/list'),
      { params },
    );
  }

  /** 素材版本链 */
  fetchVersions(materialId: number | string): Promise<VersionItem[]> {
    return requestClient.get<VersionItem[]>(
      this.getServiceUrl('material/version'),
      { params: { materialId } },
    );
  }

  /** 工作流批量操作（启用/禁用/删除） */
  fetchWorkflowBatchOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('workflow/batch_options'),
      params,
    );
  }

  /** 工作流详情 */
  fetchWorkflowDetail(id: number | string): Promise<WorkflowItem> {
    return requestClient.get<WorkflowItem>(
      this.getServiceUrl('workflow/detail'),
      { params: { id } },
    );
  }

  /** 工作流连线列表 */
  fetchWorkflowEdges(workflowId: number | string): Promise<EdgeItem[]> {
    return requestClient.get<EdgeItem[]>(
      this.getServiceUrl('workflow/edge/list'),
      { params: { workflowId } },
    );
  }

  /** 工作流列表（分页） */
  fetchWorkflowList(
    params: WorkflowQuery,
  ): Promise<PageResponse<WorkflowItem>> {
    return requestClient.get<PageResponse<WorkflowItem>>(
      this.getServiceUrl('workflow/list'),
      { params },
    );
  }

  /** 工作流节点列表 */
  fetchWorkflowNodes(workflowId: number | string): Promise<NodeItem[]> {
    return requestClient.get<NodeItem[]>(
      this.getServiceUrl('workflow/node/list'),
      { params: { workflowId } },
    );
  }

  /** 工作区详情（含名称等；域外接口，不带 X-Workspace-Id） */
  fetchWorkspaceDetail(id: number | string): Promise<WorkspaceItem> {
    return requestClient.get<WorkspaceItem>(
      this.getServiceUrl('workspace/detail'),
      { params: { id } },
    );
  }

  /** 工作区列表（当前租户，分页；域外接口，不带 X-Workspace-Id） */
  fetchWorkspaces(params: WorkspaceQuery): Promise<PageResponse<WorkspaceItem>> {
    return requestClient.get<PageResponse<WorkspaceItem>>(
      this.getServiceUrl('workspace/list'),
      { params },
    );
  }

  /** 提交生成（首轮生成 / 多轮调整；返回 TaskItem） */
  generateMaterial(data: GenerateRequest): Promise<GenerationTaskItem> {
    return requestClient.post<GenerationTaskItem>(
      this.getServiceUrl('material/generate'),
      data,
    );
  }

  /** 运行工作流（返回 runId） */
  runWorkflow(workflowId: number | string): Promise<number | string> {
    return requestClient.post<number | string>(
      this.getServiceUrl('workflow/run'),
      null,
      { params: { workflowId } },
    );
  }

  // ==================== 素材上传 / 资产保存（契约见研发计划接口文档） ====================

  /** 角色 新增/更新 */
  saveCharacter(data: CharacterSaveRequest) {
    return requestClient.post(this.getServiceUrl('character/save'), data);
  }

  /** 分集 新增/更新 */
  saveEpisode(data: EpisodeSaveRequest) {
    return requestClient.post(this.getServiceUrl('episode/save'), data);
  }

  /** 小说 新增/更新 */
  saveNovel(data: NovelSaveRequest) {
    return requestClient.post(this.getServiceUrl('novel/save'), data);
  }

  /** 场景 新增/更新 */
  saveScene(data: SceneSaveRequest) {
    return requestClient.post(this.getServiceUrl('scene/save'), data);
  }

  /** 保存工作流（覆盖式；返回 workflowId） */
  saveWorkflow(data: WorkflowSaveRequest): Promise<number | string> {
    return requestClient.post<number | string>(
      this.getServiceUrl('workflow/save'),
      data,
    );
  }

  /** 素材：上传登记（OSS STS 直传后，把完整地址交后端登记） */
  uploadMaterial(data: MaterialUploadRequest): Promise<MaterialItem> {
    return requestClient.post<MaterialItem>(
      this.getServiceUrl('material/upload'),
      data,
    );
  }
}

export const aiAssetApi: AiAssetApi = new AiAssetApi('/platform/ai_asset');
