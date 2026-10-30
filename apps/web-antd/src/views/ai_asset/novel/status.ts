/**
 * 创作台状态码唯一来源。
 * 数字逐字对应后端枚举，禁止在组件/composable 里再写裸数字。
 */

/** 与后端 AiAssetConstants.ScriptStatus 逐字对应，勿自行改数字 */
export const SCRIPT_STATUS = {
  /** 未生成 */
  NONE: 0,
  /** 已生成，未定稿 */
  GENERATED: 1,
  /** 已定稿，允许生成分镜 */
  FINALIZED: 2,
  /** 剧本内容变更后过期 */
  EXPIRED: 3,
} as const;

export const SCRIPT_STATUS_META: Record<
  number,
  { color: string; label: string }
> = {
  [SCRIPT_STATUS.NONE]: { color: 'default', label: '未生成' },
  [SCRIPT_STATUS.GENERATED]: { color: 'blue', label: '已生成（未定稿）' },
  [SCRIPT_STATUS.FINALIZED]: { color: 'green', label: '已定稿' },
  [SCRIPT_STATUS.EXPIRED]: { color: 'orange', label: '已过期' },
};

/** 与后端 AiAssetConstants.MemoryStatus 逐字对应，勿自行改数字 */
export const MEMORY_STATUS = {
  NONE: 0,
  GENERATING: 1,
  SUCCESS: 2,
  STALE: 3,
  FAILED: 4,
} as const;

export const MEMORY_STATUS_META: Record<
  number,
  { color: string; label: string }
> = {
  [MEMORY_STATUS.NONE]: { color: 'default', label: '未定稿 / 未生成' },
  [MEMORY_STATUS.GENERATING]: { color: 'blue', label: '生成中' },
  [MEMORY_STATUS.SUCCESS]: { color: 'green', label: '成功' },
  [MEMORY_STATUS.STALE]: { color: 'orange', label: '过期' },
  [MEMORY_STATUS.FAILED]: { color: 'red', label: '失败' },
};

/** 与后端 AiAssetComposeStatus 逐字对应，勿自行改数字 */
export const COMPOSE_STATUS = {
  QUEUED: 0,
  RUNNING: 1,
  SUCCESS: 2,
  FAILED: 3,
} as const;

export const COMPOSE_STATUS_META: Record<
  number,
  { color: string; label: string }
> = {
  [COMPOSE_STATUS.QUEUED]: { color: 'orange', label: '排队中' },
  [COMPOSE_STATUS.RUNNING]: { color: 'blue', label: '合成中' },
  [COMPOSE_STATUS.SUCCESS]: { color: 'green', label: '已完成' },
  [COMPOSE_STATUS.FAILED]: { color: 'red', label: '合成失败' },
};

/** 成片仍占用轮询的状态 */
export const COMPOSE_ACTIVE_STATUSES: number[] = [
  COMPOSE_STATUS.QUEUED,
  COMPOSE_STATUS.RUNNING,
];

/** episode.needs_recompose：0 否 / 1 是（数据库标记，非枚举） */
export const NEEDS_RECOMPOSE = {
  NO: 0,
  YES: 1,
} as const;

/**
 * 段落生成状态：与后端 AiAssetSegmentGenerationStatus 逐字对应。
 * 0 未生成 / 1 生成中 / 2 完成 / 5 失败。
 */
export const SEGMENT_GENERATION_STATUS = {
  NONE: 0,
  RUNNING: 1,
  SUCCEEDED: 2,
  FAILED: 5,
} as const;

/**
 * 镜头生成状态：与后端 AiAssetShotGenerationStatus 逐字对应。
 * 0 未生成 / 1 生成中 / 2 关键帧就绪 / 3 视频完成 / 5 失败。
 */
export const SHOT_GENERATION_STATUS = {
  NONE: 0,
  RUNNING: 1,
  IMAGE_READY: 2,
  VIDEO_READY: 3,
  FAILED: 5,
} as const;

/** 与后端 TaskBatchCenter.STATUS_* 逐字对应：1 待处理 / 2 处理中 / 3 成功 / 4 失败 */
export const BATCH_TASK_STATUS = {
  PENDING: 1,
  RUNNING: 2,
  SUCCESS: 3,
  FAILED: 4,
} as const;

export const BATCH_TASK_STATUS_META: Record<number, string> = {
  [BATCH_TASK_STATUS.PENDING]: '待处理',
  [BATCH_TASK_STATUS.RUNNING]: '处理中',
  [BATCH_TASK_STATUS.SUCCESS]: '已完成',
  [BATCH_TASK_STATUS.FAILED]: '失败',
};

/** 批次仍在执行的状态 */
export const BATCH_TASK_ACTIVE_STATUSES: number[] = [
  BATCH_TASK_STATUS.PENDING,
  BATCH_TASK_STATUS.RUNNING,
];

/** 批次终态 */
export const BATCH_TASK_FINAL_STATUSES: number[] = [
  BATCH_TASK_STATUS.SUCCESS,
  BATCH_TASK_STATUS.FAILED,
];

/** novel.finished / episode.finalized：0 否 / 1 是（数据库标记，非枚举） */
export const FINISHED_FLAG = {
  NO: 0,
  YES: 1,
} as const;

/** compose_task.burn_subtitles 状态回显：0 否 / 1 是（提交请求仍传 boolean） */
export const BURN_SUBTITLE = {
  OFF: 0,
  ON: 1,
} as const;
