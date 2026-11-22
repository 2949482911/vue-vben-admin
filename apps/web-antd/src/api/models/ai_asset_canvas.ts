/**
 * P8 画布节点契约（前端类型，对齐后端 AiAssetCanvasGraphView / blueprints）。
 *
 * 链路位置：短剧工作台 → 画布 → CanvasSurface。
 * 图内引用统一 clientId；数据库 id 只作为后端行标识。
 */

export type CanvasNodeKind =
  | 'audio'
  | 'character'
  | 'codeVideo'
  | 'director3d'
  | 'entity'
  | 'image'
  | 'prompt'
  | 'scene3d'
  | 'shot'
  | 'storyboard'
  | 'subcanvas'
  | 'text'
  | 'timeline'
  | 'video'
  | 'workflow';

export interface CanvasPort {
  id: string;
  label: string;
  valueType: string;
  accepts?: null | string[];
}

export interface CanvasBlueprint {
  kind: CanvasNodeKind;
  label: string;
  width: number;
  height: number;
  inputs: CanvasPort[];
  outputs: CanvasPort[];
  acceptsAsset: boolean;
}

export interface CanvasSummary {
  id: string;
  novelId: string;
  title: string;
  viewportX: number;
  viewportY: number;
  zoom: number;
  revision: string;
}

export interface CanvasGraphNode {
  id: string;
  clientId: string;
  kind: CanvasNodeKind;
  label: string;
  body?: null | string;
  details?: null | Record<string, unknown>;
  assetId?: null | string;
  referenceIds?: Array<number | string> | null;
  x: number;
  y: number;
  width: number;
  height: number;
  groupClientId?: null | string;
  zIndex: number;
  nodeStatus?: null | string;
}

export interface CanvasGraphEdge {
  id: string;
  clientId: string;
  sourceNodeClientId: string;
  sourcePort: string;
  targetNodeClientId: string;
  targetPort: string;
  referenceType?: null | string;
  label?: null | string;
  style?: null | Record<string, unknown>;
}

export interface CanvasGroup {
  id: string;
  clientId: string;
  parentGroupClientId?: null | string;
  title: string;
  color?: null | string;
  collapsed: number;
  sort: number;
}

export interface CanvasGraph {
  canvas: CanvasSummary;
  nodes: CanvasGraphNode[];
  edges: CanvasGraphEdge[];
  groups: CanvasGroup[];
}

/** GET /canvas/{id}/context：紧凑上下文，不含 body/details/坐标 */
export interface CanvasContextPort {
  id: string;
  label: string;
  valueType: string;
}

export interface CanvasContextNode {
  clientId: string;
  kind: CanvasNodeKind;
  label: string;
  nodeStatus?: null | string;
  groupClientId?: null | string;
  inputs: CanvasContextPort[];
  outputs: CanvasContextPort[];
}

export interface CanvasContextEdge {
  clientId: string;
  sourceNodeClientId: string;
  sourcePort: string;
  targetNodeClientId: string;
  targetPort: string;
  referenceType?: null | string;
  label?: null | string;
}

export interface CanvasContextGroup {
  clientId: string;
  title: string;
  parentGroupClientId?: null | string;
  collapsed?: null | number;
  sort?: null | number;
  nodeCount: number;
  childGroupCount: number;
}

export interface CanvasContext {
  canvas: {
    id: string;
    novelId: string;
    revision: string;
    title: string;
  };
  counts: {
    edges: number;
    groups: number;
    nodeKinds: Record<string, number>;
    nodes: number;
  };
  nodes: CanvasContextNode[];
  edges: CanvasContextEdge[];
  groups: CanvasContextGroup[];
}

/** GET /canvas/{id}/agent/tools：确定性工具边界 */
export interface CanvasAgentToolParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface CanvasAgentTool {
  action: string;
  description?: string;
  write: boolean;
  params?: CanvasAgentToolParameter[];
}

/** POST /canvas/{id}/agent/action：手动确认后的确定性写操作 */
export interface CanvasAgentActionRequest {
  action: string;
  baseRevision: string;
  clientId?: string;
  edge?: CanvasSaveEdge;
  group?: CanvasSaveGroup;
  node?: CanvasSaveNode;
}

/** POST /canvas/{id}/agent/chat：真实回复与可确认建议 */
export interface CanvasAgentChatRequest {
  baseRevision?: string;
  message: string;
}

export interface CanvasAgentChatSuggestion {
  action: string;
  description?: string;
  id?: string;
  params?: null | Record<string, unknown>;
  requiresConfirm?: boolean;
}

export interface CanvasAgentChatResult {
  reply: string;
  suggestions?: CanvasAgentChatSuggestion[];
}

/** POST /canvas/{id}/split-storyboard：后端按 textNodeClientId 读取节点 body */
export interface CanvasSplitStoryboardRequest {
  textNodeClientId: string;
  episodeId: number | string;
  mode?: string;
  shotCount?: number;
  totalDurationSeconds?: number;
  replace?: boolean;
}

export interface CanvasSplitShot {
  shotId: number | string;
  seq?: number;
  sceneSeq?: number;
  durationSeconds?: number;
  shotType?: string;
  camera?: string;
  description?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  dialogue?: string;
  characters?: string[];
  characterIds?: Array<number | string>;
  sceneId?: number | string;
  sceneName?: string;
  direction?: null | Record<string, unknown>;
}

export interface CanvasSplitStoryboardResult {
  episodeId?: number | string;
  textNodeClientId?: string;
  shotCount?: number;
  replaced?: boolean;
  shots?: CanvasSplitShot[];
  warnings?: string[];
}

export interface CanvasCreateRequest {
  novelId: number | string;
  title?: string;
}

export interface CanvasSaveNode {
  clientId: string;
  kind: CanvasNodeKind;
  label?: string;
  body?: null | string;
  details?: null | Record<string, unknown>;
  assetId?: null | number | string;
  referenceIds?: Array<number | string>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  groupClientId?: null | string;
  zIndex?: number;
  nodeStatus?: string;
}

export interface CanvasSaveEdge {
  clientId: string;
  sourceNodeClientId: string;
  sourcePort: string;
  targetNodeClientId: string;
  targetPort: string;
  referenceType?: string;
  label?: string;
  style?: Record<string, unknown>;
}

export interface CanvasSaveGroup {
  clientId: string;
  parentGroupClientId?: null | string;
  title?: string;
  color?: string;
  collapsed?: number;
  sort?: number;
}

export interface CanvasSaveRequest {
  baseRevision: string;
  viewport?: {
    x?: number;
    y?: number;
    zoom?: number;
  };
  nodes: CanvasSaveNode[];
  edges: CanvasSaveEdge[];
  groups: CanvasSaveGroup[];
}

/** P8-6b 画布分镜真实媒体状态 */
export interface CanvasShotBlocker {
  action?: null | string;
  code?: null | string;
  message: string;
  target?: null | string;
  targetId?: null | number | string;
}

export interface CanvasShotTake {
  errorMsg?: null | string;
  id?: number | string;
  index?: number;
  durationSeconds?: null | number;
  isSelected?: boolean;
  materialId?: null | number | string;
  reviewStatus?: null | number;
  subtitleText?: null | string;
  status?: null | number | string;
  takeId?: number | string;
  takeNo?: number;
  takeStatus?: null | number;
  thumbnailUrl?: null | string;
  url?: null | string;
}

export interface CanvasShotStatus {
  blockers?: CanvasShotBlocker[];
  episodeId?: null | number | string;
  generationStatus?: null | number;
  keyframeStatus?: null | number;
  keyframeTakes?: CanvasShotTake[];
  keyframeThumbnailUrl?: null | string;
  keyframeUrl?: null | string;
  segmentId?: null | number | string;
  segmentSeq?: null | number;
  segmentShotCount?: null | number;
  segmentTakes?: CanvasShotTake[];
  segmentVideoStatus?: null | number | string;
  segmentVideoThumbnailUrl?: null | string;
  segmentVideoUrl?: null | string;
  shotId: number | string;
  storyboardConfirmed?: boolean | null;
  storyboardStatus?: null | number | string;
  videoTakes?: CanvasShotTake[];
  videoThumbnailUrl?: null | string;
  videoUrl?: null | string;
}

export interface CanvasShotGenerateRequest {
  confirmStoryboard?: boolean;
  modelId?: null | number | string;
  params?: null | Record<string, unknown>;
  takeCount?: number;
}

export interface CanvasShotGenerateResult {
  shotId: number | string;
  storyboardConfirmed?: boolean;
  takeIds?: Array<number | string>;
}

export interface CanvasShotApproveResult {
  keyframeStatus?: null | number;
  shotId: number | string;
}

export interface CanvasShotSaveRequest {
  camera?: null | string;
  characters?: string[];
  description?: null | string;
  dialogue?: null | string;
  direction?: null | Record<string, unknown>;
  durationSeconds?: null | number;
  imagePrompt?: null | string;
  sceneId?: null | number | string;
  sceneName?: null | string;
  sceneSeq?: null | number;
  shotType?: null | string;
  videoPrompt?: null | string;
}



/** P8-6c 视频节点 / 时间轴 / 合成 */
export interface CanvasVideoAssetItem {
  durationSeconds?: null | number;
  materialId?: null | number | string;
  reviewStatus?: null | number;
  segmentId?: null | number | string;
  segmentSeq?: null | number;
  selected?: boolean;
  shotIds?: Array<number | string>;
  subtitleText?: null | string;
  takeId?: number | string;
  thumbnailUrl?: null | string;
  url?: null | string;
}

export interface CanvasVideoAssetResult {
  blockers?: CanvasShotBlocker[];
  items: CanvasVideoAssetItem[];
}

export interface CanvasBindTakeResult {
  durationSeconds?: null | number;
  materialId?: null | number | string;
  nodeClientId?: string;
  segmentId?: null | number | string;
  segmentSeq?: null | number;
  shotIds?: Array<number | string>;
  subtitleText?: null | string;
  takeId?: number | string;
  thumbnailUrl?: null | string;
  url?: null | string;
}

export interface CanvasTimelineItem {
  durationSeconds?: null | number;
  materialId?: null | number | string;
  order: number;
  segmentId?: null | number | string;
  segmentSeq?: null | number;
  subtitleText?: null | string;
  takeId?: number | string;
  videoNodeClientId: string;
}

export interface CanvasTimelineComposeRequest {
  burnSubtitles?: boolean;
  confirm: true;
  episodeId: number | string;
  resolution?: string;
  timelineNodeClientId: string;
}

export interface CanvasTimelineComposeResult {
  composeStatus?: null | number;
  durationSeconds?: null | number;
  planVersion?: null | number;
  segmentCount?: null | number;
  taskId?: null | number | string;
}

export interface CanvasTimelineComposeStatus {
  blockers?: CanvasShotBlocker[];
  composeStatus?: null | number;
  durationSeconds?: null | number;
  errorMsg?: null | string;
  finalMaterialId?: null | number | string;
  finalUrl?: null | string;
  planVersion?: null | number;
  progress?: null | number;
  segmentCount?: null | number;
  taskId?: null | number | string;
}


/** POST /canvas/{id}/sync-episode：按当前集幂等补齐画布节点/边 */
export interface CanvasSyncEpisodeRequest {
  episodeId: number | string;
  includeVideos: boolean;
}

export interface CanvasSyncEpisodeResult {
  createdEdges?: Array<number | string>;
  createdGroups?: Array<{
    clientId?: string;
    nodeCount?: number;
    title?: string;
  }>;
  createdShots?: Array<number | string>;
  createdVideos?: Array<number | string>;
  groupClientId?: null | string;
  groupId?: null | string;
  revision?: null | number | string;
  skippedShots?: null | number;
  skippedVideos?: null | number;
}
