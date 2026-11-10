import type { ShotDirection, ShotScriptProp } from '#/api/models/ai_asset';

/**
 * 分镜台 v2 冻结契约（前端类型）。
 *
 * 链路位置：短剧工作台 → 剧情 → 分镜 → StoryboardPanel。
 * split/prompts/images/list 按后端 v2/storyboard 契约；列表额外返回 generationStatus 与关键帧状态。
 */
export interface StoryboardSegmentPrompt {
  prompt: string;
  segmentId: number | string;
}

export interface StoryboardShot {
  blocking?: string;
  camera?: string;
  /** 已绑定的角色实体 ID；展示名以资产图谱映射，不用 characters 冒充 */
  characterIds?: Array<number | string>;
  characters?: string[];
  description?: string;
  dialogue?: string;
  durationSeconds?: number;
  /** 列表返回：0 未生成 / 1 生成中 / 2 关键帧就绪 / 3 视频完成 / 5 失败 */
  generationStatus?: number;
  imagePrompt?: string;
  /** 拆分落库的视频提示词；实际生成 prompt 用 prompt-preview 查看 */
  videoPrompt?: string;
  imageThumbnailUrl?: string;
  imageUrl?: string;
  /** 关键帧状态（契约未细化枚举，前端做容错展示） */
  keyframeStatus?: number;
  keyframeThumbnailUrl?: string;
  keyframeUrl?: string;
  props?: ShotScriptProp[];
  /** 已绑定的场景实体 ID / 名称 */
  sceneId?: number | string;
  sceneName?: string;
  sceneSeq?: number;
  seq?: number;
  shotId: number | string;
  shotType?: string;
  sound?: string;
  transition?: string;
  /** 既有镜头 direction（v2 契约只明确 blocking；有则保留其它键） */
  direction?: ShotDirection;
}

export interface StoryboardSegment {
  durationSeconds?: number;
  segmentId: number | string;
  seq: number;
  shots: StoryboardShot[];
}

/** 可用图片模型；成功率为 0~1，平均耗时为秒，无真实任务时为 null */
export interface StoryboardModelItem {
  capability?: string;
  generateSpeed?: null | number;
  model?: string;
  modelId: number | string;
  provider?: string;
  successRate?: null | number;
}

export interface StoryboardListResult {
  models?: StoryboardModelItem[];
  segments: StoryboardSegment[];
}

export interface StoryboardSplitRequest {
  episodeId: number | string;
  mode: string;
  shotCount?: number;
  totalDurationSeconds?: number;
}

export interface StoryboardSplitResult {
  segments: StoryboardSegment[];
}

export interface StoryboardPromptRequest {
  episodeId: number | string;
  mode: string;
}

export interface StoryboardImageGenerateRequest {
  episodeId: number | string;
  modelId?: number | string;
  ratio?: string;
}

export interface StoryboardImageTaskResult {
  models?: StoryboardModelItem[];
  taskId: number | string;
}

/** 手动绑定镜头资产（v2 冻结契约）；解绑传空数组 / null */
export interface StoryboardShotAssetsSaveRequest {
  characterIds?: Array<number | string>;
  sceneId?: null | number | string;
  shotId: number | string;
}

export type StoryboardPromptPreviewType = 'image' | 'video';

export interface StoryboardPromptPreviewRequest {
  shotId: number | string;
  type: StoryboardPromptPreviewType;
}

export interface StoryboardPromptSkillMeta {
  id?: number | string;
  name?: string;
  type?: string;
  version?: string;
}

/** 最终实际生成 prompt；只读预览，不落库、不生成媒体 */
export interface StoryboardPromptPreviewResult {
  prompt: string;
  shotId: number | string;
  skillMeta?: null | StoryboardPromptSkillMeta;
  type: StoryboardPromptPreviewType;
}
