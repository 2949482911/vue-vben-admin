/**
 * 分集 v2 冻结契约（前端类型）。
 *
 * 链路位置：短剧工作台 → 剧情 → 分集 → EpisodePanel。
 * 全项目镜头重新分集：summary 只读、split-preview 只预览、split-apply 才写入。
 */

export type EpisodeSplitMode = 'even' | 'smart';
export type EpisodeSplitStrategy = 'preserve' | 'redivide';

export interface EpisodeShotRange {
  firstSeq?: null | number;
  lastSeq?: null | number;
}

export interface EpisodeSummaryItem {
  durationSeconds?: number;
  episodeId: number | string;
  /** 投影状态只以该字段为准；true=已投影 */
  projected: boolean;
  /** 未投影原因 code（如 no_shots） */
  projectedReason?: string;
  /** 未投影原因文案，优先展示 */
  projectedMessage?: string;
  sceneSeqs?: number[];
  seq: number;
  shotCount: number;
  shotRange?: EpisodeShotRange;
  title?: string;
}

export interface EpisodeSplitBlocker {
  action?: string;
  code?: string;
  message: string;
  seq?: number;
  targetId?: number | string;
  targetType?: string;
}

/** 后端的 blockers/warnings 可能给对象或字符串，前端统一归一 */
export type EpisodeSplitMessage = EpisodeSplitBlocker | string;

export interface EpisodeSplitRequest {
  /** redivide 且存在已完成集时，二次确认后传 true */
  confirmRedivide?: boolean;
  mode: EpisodeSplitMode;
  novelId: number | string;
  strategy: EpisodeSplitStrategy;
  targetDurationSeconds?: number;
  targetEpisodeCount?: number;
}

export interface EpisodeSplitProposed {
  durationSeconds?: number;
  sceneSeqs?: number[];
  seq: number;
  shotIds?: Array<number | string>;
  shotRange?: EpisodeShotRange;
  title?: string;
}

export interface EpisodePreservedItem {
  episodeId: number | string;
  reason?: string;
  seq: number;
  title?: string;
}

export interface EpisodeSplitPreviewResult {
  /** 当前后端可能不返回；409 时会走错误 blockers */
  blockers?: EpisodeSplitMessage[];
  mode: EpisodeSplitMode;
  proposedEpisodes: EpisodeSplitProposed[];
  /** 应用时将保留的有内容/产物旧集 */
  preservedEpisodes?: EpisodePreservedItem[];
  totalShots: number;
}

export type EpisodeSplitApplyRequest = EpisodeSplitRequest;

export interface EpisodeSplitApplyResult {
  /** 冻结契约为 summary；当前后端实现使用 episodes，前端两者兼容 */
  episodes?: EpisodeSummaryItem[];
  /** 应用后最终集数 = 新划分 + 保留旧集 */
  totalEpisodes?: number;
  preservedEpisodes?: EpisodePreservedItem[];
  summary?: EpisodeSummaryItem[];
  warnings?: EpisodeSplitMessage[];
}

/** 本集提示词：segment 级十要素编译结果 */
export interface EpisodeSegmentPrompt {
  prompt: string;
  segmentId: number | string;
  seq: number;
}
