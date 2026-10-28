import type {
  AssetImageGenerateRequest,
  AssetImageGenerateResult,
  AssetType,
  CatalogNameQuery,
  CharacterItem,
  CharacterSaveRequest,
  EdgeItem,
  ElementItem,
  ElementQuery,
  ElementSaveRequest,
  EntityExtractRequest,
  EntityExtractResult,
  EpisodeAiActionRequest,
  EpisodeAiActionResponse,
  EpisodeBindResult,
  EpisodeCharacterBindRequest,
  EpisodeComposeRequest,
  EpisodeComposeStatus,
  EpisodeContentGenerateRequest,
  EpisodeGenerateRequest,
  EpisodeItem,
  EpisodeMemoryGenerateRequest,
  EpisodePlanRequest,
  EpisodePlanResponse,
  EpisodeQuery,
  EpisodeSaveRequest,
  EpisodeSceneBindRequest,
  EpisodeScriptGenerateRequest,
  EpisodeVersionItem,
  GenerateRequest,
  GenerationTaskItem,
  MaterialItem,
  MaterialPushRequest,
  MaterialPushResult,
  MaterialQuery,
  MaterialUploadRequest,
  NodeItem,
  NovelAssetExtractRequest,
  NovelAssetGraph,
  NovelDetailItem,
  NovelGenerateRequest,
  NovelGenerateResult,
  NovelItem,
  NovelSaveRequest,
  PersonaCopyRequest,
  PersonaItem,
  PersonaQuery,
  PersonaSaveRequest,
  RunItem,
  RunNodeItem,
  RunQuery,
  ScenarioItem,
  ScenarioQuery,
  SceneItem,
  SceneSaveRequest,
  SettingItem,
  SettingQuery,
  ShotImageGenerateRequest,
  ShotItem,
  ShotVideoGenerateRequest,
  StoryboardBatchActiveResult,
  StoryboardBatchPlan,
  StoryboardBatchPlanQuery,
  StoryboardBatchSubmitRequest,
  StoryboardBatchSubmitResult,
  StoryboardBatchTarget,
  StoryboardBindingReport,
  StoryboardGenerateRequest,
  StoryboardGenerateResult,
  StoryboardValidateResult,
  TaskQuery,
  VersionItem,
  WorkflowItem,
  WorkflowQuery,
  WorkflowSaveRequest,
  WorkspaceCreateRequest,
  WorkspaceItem,
  WorkspaceQuery,
  WritingToolItem,
  WritingToolQuery,
  WritingToolRunItem,
  WritingToolRunQuery,
  WritingToolRunRequest,
  WritingToolRunResult,
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
  /** 创作素材：批量操作（删除等） */
  batchElementOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('element/batch_options'),
      params,
    );
  }

  /** 人设批量操作（删除等） */
  batchPersonaOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('persona/batch_options'),
      params,
    );
  }

  /** 角色绑定生成素材 */
  bindCharacterMaterial(data: { id: number | string; materialId?: null | number | string }) {
    return requestClient.post(
      this.getServiceUrl('character/bind_material'),
      data,
    );
  }

  /** 创作素材：绑定生成素材 */
  bindElementMaterial(data: { id: number | string; materialId?: null | number | string }) {
    return requestClient.post(
      this.getServiceUrl('element/bind_material'),
      data,
    );
  }

  /** 分集人物名与角色资产绑定（补绑未匹配角色） */
  bindEpisodeCharacters(
    data: EpisodeCharacterBindRequest,
  ): Promise<EpisodeBindResult | undefined> {
    return requestClient.post<EpisodeBindResult>(
      this.getServiceUrl('episode/characters/bind'),
      data,
    );
  }

  /** 分集场景与场景资产绑定（applyToShots=true 时同步套用到已生成分镜） */
  bindEpisodeScenes(
    data: EpisodeSceneBindRequest,
  ): Promise<EpisodeBindResult | undefined> {
    return requestClient.post<EpisodeBindResult>(
      this.getServiceUrl('episode/scenes/bind'),
      data,
    );
  }

  /** 场景绑定生成素材 */
  bindSceneMaterial(data: { id: number | string; materialId?: null | number | string }) {
    return requestClient.post(
      this.getServiceUrl('scene/bind_material'),
      data,
    );
  }

  /** P3：分镜绑定图片/视频素材（null 解绑） */
  bindShotMaterial(data: {
    id: number | string;
    imageMaterialId?: null | number | string;
    videoMaterialId?: null | number | string;
  }) {
    return requestClient.post(this.getServiceUrl('shot/bind_material'), data);
  }

  /** 取消生成任务 */
  cancelTask(taskId: number | string) {
    return requestClient.post(this.getServiceUrl('task/cancel'), null, {
      params: { taskId },
    });
  }

  /** 合成成片（P1 纯拼接）：预检失败抛 400，调用方从错误体读取 missingShots */
  composeEpisode(
    data: EpisodeComposeRequest,
  ): Promise<EpisodeComposeStatus | undefined> {
    return requestClient.post<EpisodeComposeStatus>(
      this.getServiceUrl('episode/compose'),
      data,
    );
  }

  /** 确认入库（AI 打标 + 单向进正式素材库） */
  confirmMaterial(materialId: number | string) {
    return requestClient.post(
      this.getServiceUrl('material/confirm'),
      null,
      { params: { materialId } },
    );
  }

  /** 复制人设 */
  copyPersona(data: PersonaCopyRequest) {
    return requestClient.post(this.getServiceUrl('persona/copy'), data);
  }

  /** 创建工作区 */
  createWorkspace(data: WorkspaceCreateRequest) {
    return requestClient.post(this.getServiceUrl('workspace/create'), data);
  }

  /** 编辑器 AI 动作（续写/润色/校对/审校/检测/想法/标题） */
  episodeAiAction(
    data: EpisodeAiActionRequest,
  ): Promise<EpisodeAiActionResponse> {
    return requestClient.post<EpisodeAiActionResponse>(
      this.getServiceUrl('episode/ai/action'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 剧本实体抽取（角色/场景/道具 upsert） */
  extractEpisodeEntities(
    data: EntityExtractRequest,
  ): Promise<EntityExtractResult> {
    return requestClient.post<EntityExtractResult>(
      this.getServiceUrl('episode/entity/extract'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 从小说/分集/剧本提炼角色、场景、道具 */
  extractNovelAssets(data: NovelAssetExtractRequest) {
    return requestClient.post(this.getServiceUrl('novel/assets/extract'), data, {
      timeout: 300_000,
    });
  }

  /** 当前分集某 target 的活动批量任务（无则 null），用于刷新后恢复进度 */
  fetchActiveStoryboardBatch(params: {
    episodeId: number | string;
    target: StoryboardBatchTarget;
  }): Promise<null | StoryboardBatchActiveResult> {
    return requestClient.get<null | StoryboardBatchActiveResult>(
      this.getServiceUrl('episode/storyboard/batch/active'),
      { params },
    );
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

  /** 创作素材分页列表（element 类型） */
  fetchElements(params: ElementQuery): Promise<PageResponse<ElementItem>> {
    return requestClient.get<PageResponse<ElementItem>>(
      this.getServiceUrl('novel/element/list'),
      { params },
    );
  }

  /** 成片合成状态（前端 2s 轮询；页面离开即停） */
  fetchEpisodeComposeStatus(
    episodeId: number | string,
  ): Promise<EpisodeComposeStatus> {
    return requestClient.get<EpisodeComposeStatus>(
      this.getServiceUrl('episode/compose/status'),
      { params: { episodeId } },
    );
  }

  /** 分集详情（含 content/beats/scenes 全量） */
  fetchEpisodeDetail(id: number | string): Promise<EpisodeItem> {
    return requestClient.get<EpisodeItem>(
      this.getServiceUrl('episode/detail'),
      { params: { id } },
    );
  }

  /** 分集列表（分页；可按小说 / 标题过滤） */
  fetchEpisodes(params: EpisodeQuery): Promise<PageResponse<EpisodeItem>> {
    return requestClient.get<PageResponse<EpisodeItem>>(
      this.getServiceUrl('episode/list'),
      { params },
    );
  }

  /** 章节版本详情（含 content） */
  fetchEpisodeVersionDetail(id: number | string): Promise<EpisodeVersionItem> {
    return requestClient.get<EpisodeVersionItem>(
      this.getServiceUrl('episode/version/detail'),
      { params: { id } },
    );
  }

  /** 章节版本列表（不含 content） */
  fetchEpisodeVersions(
    episodeId: number | string,
  ): Promise<EpisodeVersionItem[]> {
    return requestClient.get<EpisodeVersionItem[]>(
      this.getServiceUrl('episode/version/list'),
      { params: { episodeId } },
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

  /** 小说设定资产图谱 + 准备度 */
  fetchNovelAssetGraph(novelId: number | string): Promise<NovelAssetGraph> {
    return requestClient.get<NovelAssetGraph>(
      this.getServiceUrl('novel/asset/graph'),
      { params: { novelId } },
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

  /** 统一设定视图：角色 + 场景 + 创作素材 */
  fetchNovelSettings(params: SettingQuery): Promise<SettingItem[]> {
    return requestClient.get<SettingItem[]>(
      this.getServiceUrl('novel/setting/list'),
      { params },
    );
  }

  /** 作者人设详情 */
  fetchPersonaDetail(id: number | string): Promise<PersonaItem> {
    return requestClient.get<PersonaItem>(
      this.getServiceUrl('persona/detail'),
      { params: { id } },
    );
  }

  /** 作者人设列表 */
  fetchPersonas(params: PersonaQuery): Promise<PageResponse<PersonaItem>> {
    return requestClient.get<PageResponse<PersonaItem>>(
      this.getServiceUrl('persona/list'),
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

  /** P3：分镜详情（轮询视频状态） */
  fetchShotDetail(id: number | string): Promise<ShotItem> {
    return requestClient.get<ShotItem>(this.getServiceUrl('shot/detail'), {
      params: { id },
    });
  }

  /** P3：分镜列表 */
  fetchStoryboard(episodeId: number | string): Promise<ShotItem[]> {
    return requestClient.get<ShotItem[]>(
      this.getServiceUrl('episode/storyboard/list'),
      { params: { episodeId } },
    );
  }

  /** 分镜批量生成计划（后端规则为准；未就绪时调用方本地粗筛降级） */
  fetchStoryboardBatchPlan(
    params: StoryboardBatchPlanQuery,
  ): Promise<StoryboardBatchPlan> {
    return requestClient.get<StoryboardBatchPlan>(
      this.getServiceUrl('episode/storyboard/batch/plan'),
      { params },
    );
  }

  /** 分镜资产绑定报告（进入分镜页/生成后刷新） */
  fetchStoryboardBindingReport(
    episodeId: number | string,
  ): Promise<StoryboardBindingReport> {
    return requestClient.get<StoryboardBindingReport>(
      this.getServiceUrl('episode/storyboard/binding/report'),
      { params: { episodeId } },
    );
  }

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

  // ==================== 工作流（创作工作台画布） ====================

  /** 工作区列表（当前租户，分页；域外接口，不带 X-Workspace-Id） */
  fetchWorkspaces(params: WorkspaceQuery): Promise<PageResponse<WorkspaceItem>> {
    return requestClient.get<PageResponse<WorkspaceItem>>(
      this.getServiceUrl('workspace/list'),
      { params },
    );
  }

  /** 写作工具箱：工具详情（含 paramsSchema） */
  fetchWritingToolDetail(id: number | string): Promise<WritingToolItem> {
    return requestClient.get<WritingToolItem>(
      this.getServiceUrl('writing/tool/detail'),
      { params: { id } },
    );
  }

  /** 写作工具箱：运行记录 */
  fetchWritingToolRuns(
    params: WritingToolRunQuery,
  ): Promise<PageResponse<WritingToolRunItem>> {
    return requestClient.get<PageResponse<WritingToolRunItem>>(
      this.getServiceUrl('writing/run/list'),
      { params },
    );
  }

  /** 写作工具箱：工具列表 */
  fetchWritingTools(
    params: WritingToolQuery,
  ): Promise<PageResponse<WritingToolItem>> {
    return requestClient.get<PageResponse<WritingToolItem>>(
      this.getServiceUrl('writing/tool/list'),
      { params },
    );
  }

  /** 生成角色/场景形象图 */
  generateAssetImage(
    data: AssetImageGenerateRequest,
  ): Promise<AssetImageGenerateResult> {
    return requestClient.post<AssetImageGenerateResult>(
      this.getServiceUrl('asset/image/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 按集懒生成正文（回写 content/words） */
  generateEpisodeContent(
    data: EpisodeContentGenerateRequest,
  ): Promise<EpisodeItem> {
    return requestClient.post<EpisodeItem>(
      this.getServiceUrl('episode/content/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 生成章节记忆（定稿压缩；force 覆盖已有） */
  generateEpisodeMemory(
    data: EpisodeMemoryGenerateRequest,
  ): Promise<EpisodeItem> {
    return requestClient.post<EpisodeItem>(
      this.getServiceUrl('episode/memory/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 章节规划（默认只返回，persist=true 直接回写） */
  generateEpisodePlan(
    data: EpisodePlanRequest,
  ): Promise<EpisodePlanResponse> {
    return requestClient.post<EpisodePlanResponse>(
      this.getServiceUrl('episode/plan/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 分集（章节）批量 LLM 生成 */
  generateEpisodes(data: EpisodeGenerateRequest): Promise<EpisodeItem[]> {
    return requestClient.post<EpisodeItem[]>(
      this.getServiceUrl('novel/episodes/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 单集剧本 LLM 生成（回写 script） */
  generateEpisodeScript(
    data: EpisodeScriptGenerateRequest,
  ): Promise<EpisodeItem> {
    return requestClient.post<EpisodeItem>(
      this.getServiceUrl('episode/script/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 提交生成（首轮生成 / 多轮调整；返回 TaskItem） */
  generateMaterial(data: GenerateRequest): Promise<GenerationTaskItem> {
    return requestClient.post<GenerationTaskItem>(
      this.getServiceUrl('material/generate'),
      data,
    );
  }

  /** 小说 LLM 生成（同步，20~120s，前端超时 ≥300s） */
  generateNovel(data: NovelGenerateRequest): Promise<NovelGenerateResult> {
    return requestClient.post<NovelGenerateResult>(
      this.getServiceUrl('novel/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** P3：生成镜头关键帧（角色/场景参考图） */
  generateShotImage(data: ShotImageGenerateRequest): Promise<ShotItem> {
    return requestClient.post<ShotItem>(
      this.getServiceUrl('shot/image/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** P3：分镜生成视频 */
  generateShotVideo(data: ShotVideoGenerateRequest): Promise<ShotItem> {
    return requestClient.post<ShotItem>(
      this.getServiceUrl('shot/video/generate'),
      data,
    );
  }

  // ==================== 素材上传 / 资产保存（契约见研发计划接口文档） ====================

  /** P3：生成分镜 */
  generateStoryboard(
    data: StoryboardGenerateRequest,
  ): Promise<StoryboardGenerateResult> {
    return requestClient.post<StoryboardGenerateResult>(
      this.getServiceUrl('episode/storyboard/generate'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 素材入库：推送到营销素材库（仅「已确认」可入库；返回逐条结果） */
  pushMaterials(
    data: MaterialPushRequest,
  ): Promise<MaterialPushResult[]> {
    return requestClient.post<MaterialPushResult[]>(
      this.getServiceUrl('material/push'),
      data,
    );
  }

  /** 恢复历史版本（恢复前自动备份） */
  restoreEpisodeVersion(versionId: number | string) {
    return requestClient.post(this.getServiceUrl('episode/version/restore'), {
      versionId,
    });
  }

  /** 运行工作流（返回 runId） */
  runWorkflow(workflowId: number | string): Promise<number | string> {
    return requestClient.post<number | string>(
      this.getServiceUrl('workflow/run'),
      null,
      { params: { workflowId } },
    );
  }

  /** 写作工具箱：执行工具 */
  runWritingTool(data: WritingToolRunRequest): Promise<WritingToolRunResult> {
    return requestClient.post<WritingToolRunResult>(
      this.getServiceUrl('writing/tool/run'),
      data,
      { timeout: 300_000 },
    );
  }

  /** 角色 新增/更新 */
  saveCharacter(data: CharacterSaveRequest) {
    return requestClient.post(this.getServiceUrl('character/save'), data);
  }

  /** 创作素材：新增/更新（element 类型） */
  saveElement(data: ElementSaveRequest) {
    return requestClient.post(this.getServiceUrl('element/save'), data);
  }

  /** 分集 新增/更新 */
  saveEpisode(data: EpisodeSaveRequest) {
    return requestClient.post(this.getServiceUrl('episode/save'), data);
  }

  /** 小说 新增/更新 */
  saveNovel(data: NovelSaveRequest) {
    return requestClient.post(this.getServiceUrl('novel/save'), data);
  }

  /** 作者人设 新增/更新 */
  savePersona(data: PersonaSaveRequest) {
    return requestClient.post(this.getServiceUrl('persona/save'), data);
  }

  /** 场景 新增/更新 */
  saveScene(data: SceneSaveRequest) {
    return requestClient.post(this.getServiceUrl('scene/save'), data);
  }

  /** P3：保存分镜（手动编辑/排序） */
  saveShot(data: Partial<ShotItem>) {
    return requestClient.post(this.getServiceUrl('shot/save'), data);
  }

  /** 保存工作流（覆盖式；返回 workflowId） */
  saveWorkflow(data: WorkflowSaveRequest): Promise<number | string> {
    return requestClient.post<number | string>(
      this.getServiceUrl('workflow/save'),
      data,
    );
  }

  /** 设为默认人设 */
  setDefaultPersona(id: number | string) {
    return requestClient.post(
      this.getServiceUrl('persona/set_default'),
      null,
      { params: { id } },
    );
  }

  /** 提交分镜批量任务（立即返回 taskId，生成由后端批次任务异步执行） */
  submitStoryboardBatch(
    data: StoryboardBatchSubmitRequest,
  ): Promise<StoryboardBatchSubmitResult> {
    return requestClient.post<StoryboardBatchSubmitResult>(
      this.getServiceUrl('episode/storyboard/batch/submit'),
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

  /** P3：分镜一致性校验 */
  validateStoryboard(
    episodeId: number | string,
  ): Promise<StoryboardValidateResult> {
    return requestClient.get<StoryboardValidateResult>(
      this.getServiceUrl('episode/storyboard/validate'),
      { params: { episodeId } },
    );
  }
}

export const aiAssetApi: AiAssetApi = new AiAssetApi('/platform/ai_asset');
