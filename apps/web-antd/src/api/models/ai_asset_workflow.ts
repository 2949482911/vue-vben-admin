/**
 * P7 工作流任务 Agent 契约（前端类型，对齐后端真实 DTO）。
 *
 * 链路位置：短剧工作台 → 工作流 → 任务 Agent。
 * estimate 生成计划卡；tasks 提交计划；status/archive 驱动任务条与右侧实时档案。
 * 后端暂未返回的字段保持 optional，页面按空态展示，不本地拼业务数据。
 */

export type WorkflowEndpoint =
  | 'storyboard_image'
  | 'storyboard_prompt'
  | 'video';

export interface WorkflowBlocker {
  action?: string;
  code?: string;
  message: string;
  stage?: string;
  targetId?: number | string;
  targetType?: string;
}

export interface WorkflowDecisionOption {
  action: string;
  label: string;
  style?: string;
}

export interface WorkflowDecision {
  code?: string;
  decisionId?: string;
  message?: string;
  options?: WorkflowDecisionOption[];
  payload?: unknown;
  title?: string;
}

export interface WorkflowBrief {
  aspectRatio?: string;
  autoFinalizeEntities?: boolean;
  endpoint?: string;
  episodeIds?: Array<number | string>;
  maxRetries?: number;
  /** 只为前 N 镜生成图片/视频；可选 */
  maxShots?: number;
  missingFields?: string[];
  notes?: string;
  resolution?: string;
  shotCount?: number;
  story?: string;
  summary?: string;
  takeCount?: number;
  targetDurationSeconds?: number;
  targetEpisodeCount?: number;
  visualStyleCode?: string;
  whiteModel?: boolean;
}

export interface WorkflowPlanUnderstanding {
  story?: string;
  summary?: string;
}

export interface WorkflowPlanScope {
  episodeCount?: number;
  episodeIds?: Array<number | string>;
  maxShots?: number;
  targetEpisodeCount?: number;
}

export interface WorkflowPlanStage {
  action?: string;
  imageCount?: null | number;
  label?: string;
  message?: string;
  reusedCount?: number;
  stage: string;
  step?: number;
  videoSeconds?: null | number;
}

/** 后端 PlanCard.volume：预计产出，只展示、不阻断 */
export interface WorkflowVolume {
  imageCount?: null | number;
  shotCount?: null | number;
  videoSeconds?: null | number;
}

export interface WorkflowPlan {
  aspectRatio?: string;
  autoFinalizeEntities?: boolean;
  blockers?: WorkflowBlocker[];
  endpoint?: string;
  missingFields?: string[];
  planId: number | string;
  planVersion?: number;
  scope?: WorkflowPlanScope;
  stages?: WorkflowPlanStage[];
  styleReferenceThumbnailUrl?: null | string;
  styleReferenceUrl?: null | string;
  understanding?: WorkflowPlanUnderstanding;
  visualStyle?: string;
  volume?: WorkflowVolume;
  whiteModel?: boolean;
}

export interface WorkflowEstimateRequest {
  autoFinalizeEntities?: boolean;
  message?: string;
  novelId: number | string;
  overrides?: WorkflowBrief;
  sessionId?: number | string;
}

export interface WorkflowCreateTaskRequest {
  planId: number | string;
  planVersion: number;
}

export interface WorkflowCreateTaskResult {
  existing?: boolean;
  status?: string;
  taskId: number;
}

export interface WorkflowStageState {
  blockers?: WorkflowBlocker[];
  finishedAt?: string;
  message?: string;
  stage: string;
  startedAt?: string;
  status?: string;
  step?: number;
}

export interface WorkflowTask {
  agentMessage?: string;
  blockers?: WorkflowBlocker[];
  currentStage?: string;
  currentStep?: number;
  decision?: WorkflowDecision;
  endpoint?: string;
  finishedAt?: string;
  pauseReason?: string;
  progressPercent?: number;
  stages?: WorkflowStageState[];
  startedAt?: string;
  status: string;
  statusLabel?: string;
  stepIndex?: number;
  taskId: number | string;
  taskStatus?: number;
  totalSteps?: number;
}

export interface WorkflowTaskItem {
  attempts?: number;
  blockers?: WorkflowBlocker[];
  episodeId?: number | string;
  episodeSeq?: number;
  errorMsg?: string;
  failedCount?: number;
  finishedAt?: string;
  reusedCount?: number;
  skippedCount?: number;
  stage?: string;
  startedAt?: string;
  status?: string;
  step?: number;
  successCount?: number;
  targetId?: number | string;
  targetType?: string;
  taskIds?: Array<number | string>;
}

export interface WorkflowArchiveEntityItem {
  description?: string;
  id: number | string;
  imageUrl?: string;
  name?: string;
  reused?: boolean;
  status?: string;
  thumbnailUrl?: string;
  type?: string;
  voiceName?: string;
}

export interface WorkflowArchiveEpisodeBlock {
  projected?: number;
  shotCount?: number;
  total?: number;
}

export interface WorkflowArchiveEntityBlock {
  characters?: number;
  elements?: number;
  items?: WorkflowArchiveEntityItem[];
  processed?: number;
  scenes?: number;
  status?: string;
  total?: number;
  withImage?: number;
}

export interface WorkflowArchiveScriptBlock {
  finalized?: number;
  status?: string;
  total?: number;
}

export interface WorkflowArchiveStoryboardBlock {
  approvedEpisodes?: number;
  segmentCount?: number;
  shotCount?: number;
  status?: string;
}

export interface WorkflowArchiveAssetViewBlock {
  ready?: number;
  required?: number;
  status?: string;
}

export interface WorkflowArchiveMediaBlock {
  imageReady?: number;
  imageTotal?: number;
  videoReady?: number;
  videoTotal?: number;
}

export interface WorkflowArchiveResult {
  aspectRatio?: string;
  assetViews?: WorkflowArchiveAssetViewBlock;
  corePlot?: unknown[];
  entities?: WorkflowArchiveEntityBlock;
  episodes?: WorkflowArchiveEpisodeBlock;
  media?: WorkflowArchiveMediaBlock;
  novelId?: number | string;
  novelName?: string;
  script?: WorkflowArchiveScriptBlock;
  storyboard?: WorkflowArchiveStoryboardBlock;
  visualStyle?: string;
}

export interface WorkflowDecisionRequest {
  action: string;
  decisionId: string;
  message?: string;
}
