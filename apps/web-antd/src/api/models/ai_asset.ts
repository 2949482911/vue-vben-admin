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
}

/** 素材分页查询 */
export interface MaterialQuery extends PageRequestParams {
  materialType?: MaterialType;
  status?: number;
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

/** 分集（归属小说） */
export interface EpisodeItem {
  id: number | string;
  /** 归属小说 ID */
  novelId?: number | string;
  /** 集号 */
  seq?: number;
  title?: string;
  /** 剧本 / 分镜文本 */
  script?: string;
  createTime?: string;
}

/** 小说 / 原著（列表项，不含正文） */
export interface NovelItem {
  id: number | string;
  name?: string;
  synopsis?: string;
  coverUrl?: string;
  createTime?: string;
}

/** 小说 / 原著（详情，含正文） */
export interface NovelDetailItem extends NovelItem {
  content?: string;
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
  id?: number | string;
  name: string;
  avatarUrl?: string;
  prompt?: string;
  /** 一致性锚（键:值） */
  consistencyAnchor?: Record<string, any>;
}

/** 场景 新增/更新 */
export interface SceneSaveRequest {
  id?: number | string;
  name: string;
  refUrl?: string;
  description?: string;
}

/** 分集 新增/更新（归属小说 novelId） */
export interface EpisodeSaveRequest {
  id?: number | string;
  novelId?: number | string;
  seq?: number;
  title?: string;
  script?: string;
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
