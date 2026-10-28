import type { PageRequestParams } from '#/api/models/core';

// ==================== 枚举 ====================

/**
 * 素材类型
 */
export type MaterialType = 'audio' | 'image' | 'text' | 'video';

/**
 * 生成任务状态（后端 TaskStatus：1~6）
 */
export type TaskStatusCode = 1 | 2 | 3 | 4 | 5 | 6;

// ==================== 工作区 ====================

/** 工作区（= 租户下的二级数据隔离域 main_id > workspace_id） */
export interface WorkspaceItem {
  id: number | string;
  name?: string;
  status?: number;
  createTime?: string;
  /** 拥有者用户 ID */
  ownerUserId?: number | string;
  /** 默认投放账户 */
  defaultAdvertiserId?: number | string;
  /** 成员 / 素材 / 资产计数（后端返回才有） */
  memberCount?: number;
  materialCount?: number;
  assetCount?: number;
  /** 当前用户在该工作区的角色：owner / member / viewer */
  role?: string;
}

/** 工作区创建请求 */
export interface WorkspaceCreateRequest {
  name: string;
}

// ==================== 素材（草稿区） ====================

/** 素材列表项 */
export interface MaterialItem {
  id: number | string;
  materialType?: MaterialType;
  storageUrl?: string;
  thumbnailUrl?: string;
  /** 原始文件名 */
  name?: string;
  /** 备注 */
  remark?: string;
  mediaSpec?: null | Record<string, any>;
  /** 1=草稿 2=已确认入库 3=已入库（推进营销素材库） */
  status?: number;
  createTime?: string;
  /** 媒体字段（后端按上传时登记的元数据返回） */
  /** 1 横版 / 2 竖版 */
  format?: number;
  width?: number;
  height?: number;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 可读大小，如 "12.3 MB" */
  fileSizeStr?: string;
  /** 视频时长（秒） */
  videoDurationSecond?: number;
  /** 可读时长，如 "00:15" */
  videoDuration?: string;

  // ---- 草稿区 UI 所需聚合字段（后端 material/list 待补充）----
  /** 生成提示词快照 */
  prompt?: string;
  /** 生成技能（text2img / img2video …） */
  skill?: string;
  /** 模型名 */
  model?: string;
  /** 模型库 ID */
  modelId?: number | string;
  /** 当前版本号（版本链 v1→v2→v3） */
  versionNo?: number;
  /** 生成态：由最近一次生成任务推导 */
  generationStatus?: 'draft' | 'failed' | 'ready' | 'running';
  /** 工作区（数据隔离域） */
  workspaceId?: number | string;
  workspaceName?: string;
  /** 更新时间（列表按此倒序，迭代生成会推进） */
  updateTime?: string;
}

/** 素材分页查询 */
export interface MaterialQuery extends PageRequestParams {
  materialType?: MaterialType;
  status?: number;
  /** 名称模糊搜索 */
  name?: string;
  /** 工作区筛选（不传 = 当前用户全部工作区） */
  workspaceId?: number | string;
  /** 生成态筛选（结果集与展示口径一致） */
  generationStatus?: 'draft' | 'failed' | 'ready' | 'running';
}

/**
 * 素材上传登记
 *
 * 前端先用 OSS STS 直传文件，再把完整 OSS 地址交给后端登记入库。
 */
export interface MaterialUploadRequest {
  materialType: MaterialType;
  /** OSS 完整地址（含域名） */
  storageUrl: string;
  /** 缩略图地址（缺省同 storageUrl） */
  thumbnailUrl?: string;
  /** 原始文件名 */
  name?: string;
  remark?: string;
  /** 媒体信息（尺寸/时长/大小等） */
  mediaSpec?: Record<string, any>;
  /** 文件 MD5（传 OSS 直传返回的 etag；缺省后端自行下载计算） */
  fileMd5?: string;
  /** 1 横版 / 2 竖版（不传后端按 width/height 推断） */
  format?: number;
  width?: number;
  height?: number;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 可读大小，如 "12.3 MB" */
  fileSizeStr?: string;
  /** 视频时长（秒） */
  videoDurationSecond?: number;
  /** 可读时长，如 "00:15" */
  videoDuration?: string;
}

/** 素材入库请求（推送到营销素材库；仅「已确认」素材可入库） */
export interface MaterialPushRequest {
  materialIds: Array<number | string>;
  /** 目标文件夹；与 newAlbumName 二选一 */
  albumId?: number | string;
  /** 内联新建文件夹：名称 + 父级 */
  newAlbumName?: string;
  newAlbumParentId?: number | string;
}

/** 素材入库逐条结果 */
export interface MaterialPushResult {
  materialId: number | string;
  /** 营销素材库里的素材 ID */
  pushedMaterialId?: number | string;
  success: boolean;
  message?: string;
}

/** 素材版本 */
export interface VersionItem {
  id: number | string;
  materialId?: number | string;
  versionNo?: number;
  parentVersionId?: number | string;
  storageUrl?: string;
  paramsSnapshot?: null | Record<string, any>;
  createTime?: string;
}

// ==================== 生成任务 ====================

/** 生成任务列表项 */
export interface GenerationTaskItem {
  id: number | string;
  idempotentKey?: string;
  /** 产物素材 ID（兼容：= materialIds[0]） */
  materialId?: number | string;
  /** 产物素材 ID 列表（一个 task 出 N 张时 N 个） */
  materialIds?: Array<number | string>;
  skill?: string;
  model?: string;
  /** 1=submitted 2=queued 3=running 4=succeeded 5=failed 6=cancelled */
  status?: number;
  /** 执行模式：同步（Java 内联）/ 异步（如视频，Airflow 轮询回调） */
  execMode?: 'async' | 'sync';
  /** 开始执行时间 */
  startedAt?: string;
  paramsSnapshot?: null | Record<string, any>;
  cost?: number;
  errorMsg?: string;
  finishedAt?: string;
  createTime?: string;
}

/** 生成任务分页查询 */
export interface TaskQuery extends PageRequestParams {
  status?: number;
  materialId?: number | string;
  skill?: string;
}

// ==================== 资产（角色 / 场景 / 分集 / 场景模板） ====================

/** 角色 */
export interface CharacterItem {
  id: number | string;
  name?: string;
  avatarUrl?: string;
  prompt?: string;
  /** 角色类型：0 主角 / 1 配角 / 2 反派 / 3 群演 / 4 功能性角色 */
  characterType?: number;
  consistencyAnchor?: null | Record<string, any>;
  createTime?: string;
}

/** 广告场景 */
export interface SceneItem {
  id: number | string;
  name?: string;
  refUrl?: string;
  description?: string;
  createTime?: string;
}

/** 分集节拍（结构化细纲） */
export interface EpisodeBeat {
  type: string;
  title: string;
  content: string;
}

/** 剧本场次 */
export interface ScriptScene {
  assetSceneId?: number | string;
  seq: number;
  heading: string;
  sceneType?: string;
  location?: string;
  timeOfDay?: string;
  characters?: string[];
  action?: string;
  dialogue?: Array<{ emotion?: string; line: string; role: string }>;
  durationSeconds?: number;
}

/** 分集（归属小说） */
export interface EpisodeItem {
  id: number | string;
  /** 归属小说 ID */
  novelId?: number | string;
  /** 集号 */
  seq?: number;
  title?: string;
  /** 剧情摘要（LLM 生成） */
  summary?: string;
  /** 剧本 / 分镜文本 */
  script?: string;
  /** 本集正文（按集懒生成） */
  content?: string;
  /** 结构化节拍 */
  beats?: EpisodeBeat[];
  /** 结构化剧本场次 */
  scenes?: ScriptScene[];
  /** 本集字数 */
  words?: number;
  /** 卷号 */
  volumeNo?: number;
  /** 本章走向要求（轻控制） */
  plotDirection?: string;
  /** 定稿后压缩的历史记忆（<=300字） */
  memory?: string;
  /** 是否已有历史记忆（列表/详情均返回） */
  hasMemory?: boolean;
  /** 乐观锁版本号 */
  version?: number;
  /** 成片素材 ID（后端可能回填，用于成片地址兼容回查） */
  finalMaterialId?: number | string;
  /** 成片直链（后端可能回填，优先使用） */
  finalUrl?: string;
  createTime?: string;
}

// ==================== 小说 / 分集 LLM 生成 ====================

/** 建书向导第 1~5 步的创作设定（后端白名单校验） */
export interface NovelConfig {
  theme?: string[];
  tropes?: string[];
  languageStyle?: string;
  narrativeStructure?: string[];
  literaryGenre?: string[];
  tone?: string[];
  era?: string;
  narrativeTime?: string;
  narrativePov?: string;
  protagonist?: string[];
  conflict?: string[];
  payoff?: string[];
  taboo?: string[];
  openingType?: string;
  heroEntrance?: string;
  hook?: string;
  outlineType?: string;
  corePhilosophy?: string;
  storySummary?: string;
  rhythm?: string;
  loveLine?: string;
}

/** 小说生成（同步 LLM，20~120s） */
export interface NovelGenerateRequest {
  modelId: number | string;
  name?: string;
  author?: string;
  personaId?: number | string;
  audience?: string;
  genres?: string[];
  styles?: string[];
  episodeCount?: number;
  wordsPerEpisode?: number;
  volumeEnabled?: boolean;
  episodeDuration?: number;
  synopsis?: string;
  refNovelId?: number | string;
  config?: NovelConfig;
  prompt?: string;
}

/** 小说生成结果：novel（含世界观/总纲）+ 章节分集 */
export interface NovelGenerateResult {
  novel: NovelDetailItem;
  characters?: CharacterItem[];
  episodes: EpisodeItem[];
}

/** 分集（章节）批量生成 */
export interface EpisodeGenerateRequest {
  modelId: number | string;
  novelId: number | string;
  count?: number;
  fromSeq?: number;
  requirements?: string;
}

/** 按集懒生成正文 */
export interface EpisodeContentGenerateRequest {
  autoExtractAssets?: boolean;
  episodeId: number | string;
  modelId: number | string;
  requirements?: string;
  targetWords?: number;
}

/** 单集剧本生成（回写 EpisodeItem.script/scenes） */
export interface EpisodeScriptGenerateRequest {
  autoExtractAssets?: boolean;
  durationSeconds?: number;
  episodeId: number | string;
  modelId: number | string;
  requirements?: string;
}

/** 创作素材（element，非人物/场景） */
export interface ElementItem {
  attributes?: Record<string, any>;
  createTime?: string;
  description?: string;
  elementType?: string;
  id: number | string;
  materialId?: number | string;
  name: string;
  novelId?: number | string;
  refUrl?: string;
  status?: number;
  tags?: string[];
  updateTime?: string;
}

export interface ElementQuery extends PageRequestParams {
  keyword?: string;
  novelId: number | string;
  type?: string;
}

export interface ElementSaveRequest {
  attributes?: Record<string, any>;
  description?: string;
  elementType: string;
  id?: number | string;
  materialId?: number | string;
  name: string;
  novelId: number | string;
  refUrl?: string;
  tags?: string[];
}

/** 统一设定视图（character/scene/element 合并） */
export interface SettingItem {
  attributes?: Record<string, any>;
  createTime?: string;
  description?: string;
  hasMaterial?: boolean;
  id: number | string;
  materialId?: number | string;
  materialThumbnailUrl?: string;
  materialUrl?: string;
  name: string;
  novelId?: number | string;
  refUrl?: string;
  source: 'character' | 'element' | 'scene';
  tags?: string[];
  type: string;
  updateTime?: string;
}

export interface SettingQuery {
  keyword?: string;
  novelId: number | string;
  type?: string;
}

/** 剧本实体抽取 */
export interface EntityExtractRequest {
  episodeId: number | string;
  modelId?: number | string;
  overwrite?: boolean;
  source?: 'auto' | 'content' | 'scenes' | 'script';
}

export interface ExtractedEntity {
  created: boolean;
  description?: string;
  elementType?: string;
  id: number | string;
  name: string;
  role?: string;
}

export interface EntityExtractResult {
  characters: ExtractedEntity[];
  elements: ExtractedEntity[];
  episodeId: number | string;
  scenes: ExtractedEntity[];
}

/** P3 分镜 */
export interface ShotItem {
  assetsStale?: boolean;
  blankShot?: null | number;
  blankShotSource?: 'auto' | 'manual';
  camera?: string;
  characterIds?: Array<number | string>;
  characters?: string[];
  config?: Record<string, any>;
  createTime?: string;
  description?: string;
  dialogue?: string;
  durationSeconds?: number;
  episodeId?: number | string;
  generationStatus?: number;
  hasImage?: boolean;
  hasVideo?: boolean;
  id: number | string;
  imageMaterialId?: number | string;
  imagePrompt?: string;
  imageTaskId?: number | string;
  imageThumbnailUrl?: string;
  imageUrl?: string;
  refImageMaterialIds?: Array<number | string>;
  novelId?: number | string;
  sceneId?: number | string;
  sceneSeq?: number;
  seq?: number;
  shotType?: string;
  updateTime?: string;
  videoMaterialId?: number | string;
  videoPrompt?: string;
  videoTaskId?: number | string;
  videoThumbnailUrl?: string;
  videoUrl?: string;
}

export interface StoryboardGenerateRequest {
  episodeId: number | string;
  modelId?: number | string;
  replace?: boolean;
  requirements?: string;
  style?: string;
}

export interface StoryboardBindingCharacterGroup {
  bound: number;
  total: number;
  unmatched: string[];
}

export interface StoryboardBindingCharacterStat
  extends StoryboardBindingCharacterGroup {
  /** 群演分组（后端按 characterType 返回；缺省时前端用资产图谱兜底拆分） */
  extra?: StoryboardBindingCharacterGroup;
  /** 主要角色分组（主角/配角/反派/功能性） */
  main?: StoryboardBindingCharacterGroup;
}

export interface StoryboardBindingSceneStat {
  bound: number;
  total: number;
  unmatched: Array<{ heading?: string; sceneSeq: number }>;
}

/** 分镜生成后的资产绑定报告（后端未就绪时可能为空） */
export interface StoryboardBindingReport {
  characters: StoryboardBindingCharacterStat;
  scenes: StoryboardBindingSceneStat;
  shotsMissingCharacter?: Array<{
    characters: string[];
    seq?: number;
    shotId: number | string;
  }>;
  shotsMissingScene?: Array<{
    sceneSeq: number;
    seq?: number;
    shotId: number | string;
  }>;
}

export interface StoryboardGenerateResult {
  binding?: StoryboardBindingReport;
  episodeId: number | string;
  shotCount: number;
  shots: ShotItem[];
}

/** 批量生成目标：关键帧 / 视频 */
export type StoryboardBatchTarget = 'keyframe' | 'video';
/** 批量生成范围：补新 / 重生成（资产已更新） */
export type StoryboardBatchMode = 'new' | 'stale';

export interface StoryboardBatchPlanQuery {
  episodeId: number | string;
  mode: StoryboardBatchMode;
  target: StoryboardBatchTarget;
}

export interface StoryboardBatchPlanItem {
  seq: number;
  shotId: number | string;
}

export interface StoryboardBatchSkippedItem extends StoryboardBatchPlanItem {
  /** blank_unconfirmed / character_unbound / no_keyframe / already_has_image / already_has_video / generating / not_person_shot / scene_unbound */
  reason: string;
}

/** 批量生成计划：eligible/skipped 由后端规则决定，前端不重算 eligibility */
export interface StoryboardBatchPlan {
  eligible: StoryboardBatchPlanItem[];
  mode: StoryboardBatchMode;
  skipped: StoryboardBatchSkippedItem[];
  target: StoryboardBatchTarget;
}

/** 提交后端批量任务（立即返回，生成在 Kafka 批次任务里异步执行） */
export interface StoryboardBatchSubmitRequest {
  duration?: null | number;
  episodeId: number | string;
  mode: StoryboardBatchMode;
  modelId?: null | number | string;
  target: StoryboardBatchTarget;
}

export interface StoryboardBatchSubmitResult {
  episodeId: number | string;
  /** 同分集同 target 已有活动任务时为 true，并返回旧 taskId */
  existing: boolean;
  mode: StoryboardBatchMode;
  optionType: string;
  /** 仅 submit 返回；不进任务总数 */
  skipped: StoryboardBatchSkippedItem[];
  target: StoryboardBatchTarget;
  taskId: number | string;
  totalCount: number;
}

/** 页面恢复：当前分集某 target 的活动批次（无任务时后端返回 null） */
export interface StoryboardBatchActiveResult {
  failedCount: number;
  optionType: string;
  pendingCount: number;
  progressPercent: number;
  successCount: number;
  taskId: number | string;
  taskStatus: number;
  totalCount: number;
}

export interface ShotImageGenerateRequest {
  modelId?: number | string;
  promptOverride?: string;
  referenceMaterialIds?: Array<number | string>;
  shotId: number | string;
}

export interface StoryboardIssue {
  characters?: string[];
  level: 'error' | 'warning' | string;
  message: string;
  sceneSeq?: number;
  seq?: number;
  shotId?: number | string;
  type: string;
}

export interface StoryboardValidateResult {
  /** 成片就绪（全部镜头有视频）；后端未部署时前端按分镜数据兜底 */
  composeReady?: boolean;
  episodeId: number | string;
  issues: StoryboardIssue[];
  /** 缺视频的镜头 seq（后端未返回时前端按镜头兜底） */
  missingVideoSeqs?: number[];
  passed: boolean;
}

export interface ShotVideoGenerateRequest {
  duration?: number;
  modelId?: number | string;
  promptOverride?: string;
  shotId: number | string;
}

export interface ShotVideoGenerateResult {
  shotId: number | string;
  status?: number | string;
  videoMaterialId?: number | string;
}

/** 小说设定资产图谱 */
export interface AssetReadinessStat {
  missing: number;
  total: number;
  withImage: number;
}

export interface NovelAssetBase {
  appearanceTags?: Record<string, any>;
  attributes?: Record<string, any>;
  description?: string;
  hasImage?: boolean;
  id: number | string;
  materialId?: number | string;
  materialThumbnailUrl?: string;
  materialUrl?: string;
  name: string;
  sceneTags?: Record<string, any>;
  visualPrompt?: string;
}

export interface NovelCharacterAsset extends NovelAssetBase {
  appearance?: string;
  avatarUrl?: string;
  /** 角色类型：0 主角 / 1 配角 / 2 反派 / 3 群演 / 4 功能性角色 */
  characterType?: number;
  consistencyAnchor?: Record<string, any>;
  episodeIds?: Array<number | string>;
  prompt?: string;
  role?: string;
  shotCount?: number;
}

export interface NovelSceneAsset extends NovelAssetBase {
  episodeIds?: Array<number | string>;
  location?: string;
  sceneSeqs?: number[];
  shotCount?: number;
}

export interface NovelElementAsset extends NovelAssetBase {
  elementType?: string;
}

export interface NovelAssetGraph {
  characters: NovelCharacterAsset[];
  elements: NovelElementAsset[];
  novelId: number | string;
  readiness: {
    characters: AssetReadinessStat;
    elements: AssetReadinessStat;
    ready: boolean;
    scenes: AssetReadinessStat;
  };
  scenes: NovelSceneAsset[];
}

export interface NovelAssetExtractRequest {
  autoCreateElement?: boolean;
  autoCreateScene?: boolean;
  modelId?: number | string;
  novelId: number | string;
  overwrite?: boolean;
  sources?: Array<'episodes' | 'outline' | 'script'>;
}

export interface AssetImageGenerateRequest {
  assetId: number | string;
  assetType: 'character' | 'scene';
  modelId?: number | string;
  promptOverride?: string;
}

export interface AssetImageGenerateResult {
  assetId: number | string;
  assetType: string;
  hasImage?: boolean;
  materialId?: number | string;
  url?: string;
}

export interface EpisodeSceneBindRequest {
  applyToShots?: boolean;
  episodeId: number | string;
  mappings: Array<{ sceneId: number | string; sceneSeq: number }>;
}

export interface EpisodeCharacterBindRequest {
  applyToShots?: boolean;
  episodeId: number | string;
  mappings: Array<{ characterId: number | string; name: string }>;
}

export interface EpisodeBindResult {
  affectedShots?: number;
  /** 按场套用分镜时，跳过已单独绑定场景的镜头数（后端只填空，不覆盖） */
  skippedBoundShots?: number;
  /** 不在 episode.scenes 中的场次（仅写入镜头，重新生成分镜后失效） */
  episodeUnpersisted?: Array<number | string> | number | string;
  [key: string]: any;
}

/** 成片合成请求（P1 纯拼接，不含字幕与配音） */
export interface EpisodeComposeRequest {
  bgmMaterialId?: number | string;
  burnSubtitle?: boolean;
  episodeId: number | string;
  resolution?: string;
}

/** 成片合成状态：0 排队 / 1 合成中 / 2 成功 / 3 失败（与后端 AiAssetComposeStatus 一致） */
export interface EpisodeComposeStatus {
  durationSeconds?: number;
  episodeId?: number | string;
  errorMsg?: string;
  finalMaterialId?: number | string;
  finalUrl?: string;
  progress?: number;
  /** 分辨率（后端字段待确认，缺省时不展示） */
  resolution?: string;
  /** 本集镜头数（后端状态接口返回） */
  shotCount?: number;
  status: number;
  taskId?: number | string;
  /** 成片封面（后端字段待确认，缺省时用视频首帧） */
  thumbnailUrl?: string;
}

/** 合成预检失败时后端返回的缺失镜头 */
export interface EpisodeComposeMissingShot {
  reason?: string;
  seq?: number;
  shotId: number | string;
}

/** 写作工具参数字段 */
export interface WritingToolParamField {
  default?: any;
  key: string;
  label: string;
  options?: Array<string | { label: string; value: any }>;
  placeholder?: string;
  required?: boolean;
  type: 'number' | 'select' | 'text' | 'textarea';
}

export interface WritingToolItem {
  code: string;
  createTime?: string;
  description?: string;
  groupCode?: string;
  icon?: string;
  id: number | string;
  name: string;
  paramsSchema?: { fields: WritingToolParamField[] };
  sort?: number;
  status?: number;
}

export interface WritingToolQuery extends PageRequestParams {
  groupCode?: string;
  keyword?: string;
}

export interface WritingToolRunRequest {
  inputs: Record<string, any>;
  modelId?: number | string;
  refId?: number | string;
  refType?: 'episode' | 'novel';
  toolCode: string;
}

export interface WritingToolRunResult {
  content: string;
  createTime?: string;
  durationMs?: number;
  runId: number | string;
  toolCode: string;
}

export interface WritingToolRunItem extends WritingToolRunResult {
  groupCode?: string;
  inputs?: Record<string, any>;
  status?: number;
  toolName?: string;
}

export interface WritingToolRunQuery extends PageRequestParams {
  toolCode?: string;
}

/** 作者人设 */
export interface PersonaItem {
  createTime?: string;
  description?: string;
  id: number | string;
  isDefault?: boolean;
  name: string;
  profile?: Record<string, any>;
  status?: number;
  updateTime?: string;
  workspaceId?: number | string;
}

export interface PersonaQuery extends PageRequestParams {
  name?: string;
  workspaceId?: number | string;
}

export interface PersonaSaveRequest {
  description?: string;
  id?: number | string;
  isDefault?: boolean;
  name: string;
  profile?: Record<string, any>;
}

export interface PersonaCopyRequest {
  isDefault?: boolean;
  name?: string;
  sourceId: number | string;
}

/** 小说 / 原著（列表项，不含正文） */
export interface NovelItem {
  id: number | string;
  name?: string;
  author?: string;
  audience?: string;
  genres?: string[];
  styles?: string[];
  episodeCount?: number;
  episodeDuration?: number;
  wordsPerEpisode?: number;
  targetWords?: number;
  wordCount?: number;
  synopsis?: string;
  coverUrl?: string;
  createTime?: string;
}

/** 小说 / 原著（详情，含正文） */
export interface NovelDetailItem extends NovelItem {
  content?: string;
  worldSetting?: string;
  config?: NovelConfig;
}

/** 资产目录分页查询（角色 / 场景 / 小说：后端均支持 name 模糊） */
export interface CatalogNameQuery extends PageRequestParams {
  name?: string;
}

/** 分集分页查询 */
export interface EpisodeQuery extends PageRequestParams {
  novelId?: number | string;
  title?: string;
}

/** 场景模板分页查询（系统预置，只读） */
export interface ScenarioQuery extends PageRequestParams {
  code?: string;
  name?: string;
}

/** 工作区分页查询 */
export interface WorkspaceQuery extends PageRequestParams {
  name?: string;
}

// ==================== 小说 / 原著 ====================

/** 小说 保存请求 */
export interface NovelSaveRequest {
  id?: number | string;
  name?: string;
  synopsis?: string;
  content?: string;
  coverUrl?: string;
}

// ==================== 资产（角色 / 场景 / 分集）保存 ====================

/** 角色 新增/更新 */
export interface CharacterSaveRequest {
  appearance?: string;
  attributes?: Record<string, any>;
  appearanceTags?: Record<string, any>;
  avatarUrl?: string;
  /** 角色类型：0 主角 / 1 配角 / 2 反派 / 3 群演 / 4 功能性角色 */
  characterType?: number;
  consistencyAnchor?: Record<string, any>;
  description?: string;
  id?: number | string;
  name: string;
  prompt?: string;
  visualPrompt?: string;
}

/** 场景 新增/更新 */
export interface SceneSaveRequest {
  attributes?: Record<string, any>;
  description?: string;
  id?: number | string;
  location?: string;
  name: string;
  /** 归属小说（新建小说场景资产时必传，保证进入 asset/graph） */
  novelId?: number | string;
  refUrl?: string;
  sceneTags?: Record<string, any>;
  visualPrompt?: string;
}

/** 分集 新增/更新（归属小说 novelId） */
export interface EpisodeSaveRequest {
  id?: number | string;
  novelId?: number | string;
  seq?: number;
  title?: string;
  summary?: string;
  script?: string;
  content?: string;
  words?: number;
  beats?: EpisodeBeat[];
  scenes?: ScriptScene[];
  plotDirection?: string;
  /** 乐观锁：库里不一致时返回 409 */
  version?: number;
  /** 保存前把当前正文存一版手动历史 */
  saveVersion?: boolean;
}

/** 编辑器 AI 动作 */
export interface EpisodeAiActionRequest {
  action: 'continue' | 'detect' | 'idea' | 'polish' | 'proofread' | 'review' | 'title';
  episodeId: number | string;
  modelId: number | string;
  selection?: { end: number; start: number; text: string };
  instruction?: string;
  targetWords?: number;
  usePersona?: boolean;
}

export interface EpisodeAiIssue {
  end?: number;
  message: string;
  start?: number;
  suggestion?: string;
  type: string;
}

export interface EpisodeAiActionResponse {
  issues?: EpisodeAiIssue[];
  text?: string;
  title?: string;
}

/** 生成章节记忆（定稿压缩） */
export interface EpisodeMemoryGenerateRequest {
  episodeId: number | string;
  modelId?: number | string;
  force?: boolean;
}

/** 章节规划 */
export interface EpisodePlanRequest {
  episodeId: number | string;
  modelId: number | string;
  requirements?: string;
  usePersona?: boolean;
  /** true=直接回写 summary+beats */
  persist?: boolean;
}

export interface EpisodePlanResponse {
  beats?: EpisodeBeat[];
  episodeId?: number | string;
  persisted?: boolean;
  summary?: string;
}

/** 章节版本 */
export interface EpisodeVersionItem {
  content?: string;
  createTime?: string;
  episodeId?: number | string;
  id: number | string;
  remark?: string;
  source?: string;
  versionNo?: number;
  words?: number;
}

/** 资产类型（用于 save / batch_options 路径） */
export type AssetType = 'character' | 'episode' | 'novel' | 'scene';

/** 场景模板（电商/短剧/小游戏…） */
export interface ScenarioItem {
  id: number | string;
  name?: string;
  code?: string;
  description?: string;
  createTime?: string;
}

// ==================== 工作流（创作工作台画布） ====================

/**
 * 节点类型（MVP 仅 image/video，其余为占位）
 */
export type NodeType =
  | 'asset'
  | 'audio'
  | 'clip'
  | 'director'
  | 'image'
  | 'push'
  | 'script'
  | 'tag'
  | 'text'
  | 'video';

/** 工作流 */
export interface WorkflowItem {
  id: number | string;
  name?: string;
  scenario?: string;
  status?: number;
  createTime?: string;
}

/** 工作流节点 */
export interface NodeItem {
  id: number | string;
  workflowId?: number | string;
  nodeType?: NodeType;
  name?: string;
  posX?: number;
  posY?: number;
  config?: null | Record<string, any>;
}

/** 工作流连线 */
export interface EdgeItem {
  id?: number | string;
  workflowId?: number | string;
  fromNodeId?: number | string;
  toNodeId?: number | string;
  fromPort?: string;
  toPort?: string;
}

/** 保存请求（前端为节点分配临时 id，edges 引用该临时 id） */
export interface WorkflowSaveRequest {
  id?: null | number | string;
  name?: string;
  scenario?: string;
  nodes: Array<{
    id: number;
    nodeType: NodeType;
    name: string;
    posX: number;
    posY: number;
    config: Record<string, any>;
  }>;
  edges: Array<{
    fromNodeId: number;
    toNodeId: number;
    fromPort: string;
    toPort: string;
  }>;
}

/** 工作流分页查询 */
export interface WorkflowQuery extends PageRequestParams {
  name?: string;
  scenario?: string;
}

/** 工作流运行记录 */
export interface RunItem {
  id: number | string;
  workflowId?: number | string;
  /** 1待运行 2运行中 3成功 4失败 */
  status?: number;
  startedAt?: string;
  finishedAt?: string;
  createTime?: string;
}

/** 运行节点级进度 */
export interface RunNodeItem {
  id: number | string;
  runId?: number | string;
  nodeId?: number | string;
  /** 1待运行 2运行中 3成功 4失败 */
  status?: number;
  outputMaterialId?: number | string;
  errorMsg?: string;
  startedAt?: string;
  finishedAt?: string;
}

/** 运行记录分页查询 */
export interface RunQuery extends PageRequestParams {
  workflowId?: number | string;
  status?: number;
}

/**
 * 生成请求（首轮生成 / 多轮调整共用；modelId 为模型库 ID，baseUrl/apiKey 后端配置）
 */
export interface GenerateRequest {
  /** 每次点击都要新的 requestId（后端幂等键 = materialId + requestId + 参数） */
  requestId?: string;
  skill: string;
  modelId: number | string;
  prompt?: string;
  negativePrompt?: string;
  refImages?: string[];
  size?: string;
  seed?: number;
  params?: Record<string, any>;
  /** 多轮调整时传入，首轮为空 */
  materialId?: number | string;
}
