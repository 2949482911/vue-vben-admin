import { ASSET_SKILL_OPTIONS } from '../constants';

/**
 * 对话式创作 —— 参数选项
 *
 * 比例里的「智能」= 交给模型决定，请求不带 size（与画布节点同一约定：size 传比例字符串）。
 */
export const SMART_RATIO = 'smart';

export const RATIO_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '智能', value: SMART_RATIO },
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: '9:16', value: '9:16' },
  { label: '2:3', value: '2:3' },
  { label: '3:2', value: '3:2' },
  { label: '21:9', value: '21:9' },
];

export const RESOLUTION_OPTIONS = ['1.5K', '2K', '4K'].map((value) => ({
  label: value,
  value,
}));

export const COUNT_OPTIONS = [1, 2, 3, 4].map((value) => ({
  label: `${value} 张`,
  value,
}));

/** 图片类生成技能（后端 GenerateRequest.skill 用的就是这些 SkillType） */
export const IMAGE_SKILL_OPTIONS = ASSET_SKILL_OPTIONS.filter((option) =>
  ['edit', 'img2img', 'text2img'].includes(option.value),
);

/** 视频类生成技能 */
export const VIDEO_SKILL_OPTIONS = ASSET_SKILL_OPTIONS.filter((option) =>
  ['img2video', 'text2video'].includes(option.value),
);

/** 对话式创作可选的全部技能（图片 + 视频） */
export const CHAT_SKILL_OPTIONS = [
  ...IMAGE_SKILL_OPTIONS,
  ...VIDEO_SKILL_OPTIONS,
];

/** 技能 → 产出类型（决定参数与模型筛选） */
export function skillKind(skill: string): 'image' | 'video' {
  return ['img2video', 'text2video'].includes(skill) ? 'video' : 'image';
}

/** 视频比例（视频用 adaptive 表示由模型决定） */
export const VIDEO_RATIO_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '自适应', value: 'adaptive' },
  { label: '21:9', value: '21:9' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '9:16', value: '9:16' },
];

export const VIDEO_RATIO_DEFAULT = 'adaptive';

/** 视频清晰度 */
export const VIDEO_RESOLUTION_OPTIONS = ['480P', '720P', '1080P'].map(
  (value) => ({ label: value, value }),
);

export const VIDEO_RESOLUTION_DEFAULT = '720P';

/** 视频时长：-1 = 智能，其余 2~30 秒 */
export const VIDEO_DURATION_OPTIONS = [
  { label: '智能', value: -1 },
  ...Array.from({ length: 29 }, (_, index) => {
    const seconds = index + 2;
    return { label: `${seconds}s`, value: seconds };
  }),
];

export const VIDEO_DURATION_DEFAULT = -1;

/** 图生视频最多 1 张首帧 */
export const MAX_VIDEO_REF_COUNT = 1;

/** 参考素材（图生图 / 图编辑）：URL 直接进 GenerateRequest.refImages */
export interface RefAsset {
  id: number | string;
  name: string;
  url: string;
  /** 卡片副标题：尺寸 / 大小 / 状态 */
  description?: string;
}

/** 参考图上限（与原型一致） */
export const MAX_REF_COUNT = 3;

/** 单个产物（一张图 / 一段视频）：素材 ID + 地址 + 当前状态 */
export interface ChatOutput {
  materialId: number | string;
  url: string;
  /** 1 草稿 / 2 已确认 / 3 已入库 */
  status?: number;
  /** 媒体类型（image / video ...） */
  materialType?: string;
  /** 视频时长（可读，如 00:15） */
  duration?: string;
  /** 封面（视频用缩略图） */
  cover?: string;
}

/** 一张卡的生成结果（前端聚合，非后端实体） */
export interface ChatTaskItem {
  id: number | string;
  prompt: string;
  modelId?: number | string;
  modelLabel: string;
  ratio: string;
  resolution: string;
  count: number;
  skill: string;
  /** 提交时的参考图（再次生成/迭代要带回去） */
  refImages?: string[];
  /** 视频参数（再次生成要带回去） */
  duration?: number;
  audio?: boolean;
  /** 后端任务状态 1~6（见 TASK_STATUS_MAP） */
  status: number;
  errorMsg?: string;
  /** 产物素材 ID：多图时多个（一个 task 出 N 张） */
  materialIds?: Array<number | string>;
  /** 本条用的参考图数量 */
  refCount?: number;
  /** 成功后回查到的产物（与 materialIds 对应，按就绪顺序填） */
  outputs?: ChatOutput[];
  createTime?: string;
}

/**
 * 成品展示区的一格
 *
 * 有 cover 展示真实产物；没有 cover 时按 tintIndex 渲染渐变占位块。
 */
export interface GalleryTile {
  id: string;
  title: string;
  description: string;
  /** 单图封面（兼容） */
  cover?: string;
  /** 多图封面（宫格，最多 4 张） */
  covers?: string[];
  /** 真实生成任务（点击打开结果抽屉）；占位卡没有 */
  task?: ChatTaskItem;
  /** 是否视频产物（渲染 <video> 预览） */
  isVideo?: boolean;
  /** 左上角角标（生成中 / 失败 / 分类名） */
  badge?: string;
  tintIndex?: number;
}

/**
 * 展示区占位卡片（真实产物接上前的假数据；后续换成工作区已确认素材/精选作品）
 */
export const PLACEHOLDER_WORKS: GalleryTile[] = [
  { description: '未生成 · 示例位', id: 'ph-1', tintIndex: 0, title: '电商主图' },
  { description: '未生成 · 示例位', id: 'ph-2', tintIndex: 1, title: '信息流图文' },
  { description: '未生成 · 示例位', id: 'ph-3', tintIndex: 2, title: '短剧分镜' },
  { description: '未生成 · 示例位', id: 'ph-4', tintIndex: 3, title: '口播封面' },
  { description: '未生成 · 示例位', id: 'ph-5', tintIndex: 1, title: '产品场景图' },
  { description: '未生成 · 示例位', id: 'ph-6', tintIndex: 2, title: '模特上身图' },
  { description: '未生成 · 示例位', id: 'ph-7', tintIndex: 3, title: '促销角标' },
  { description: '未生成 · 示例位', id: 'ph-8', tintIndex: 0, title: '品牌 KV' },
  { description: '未生成 · 示例位', id: 'ph-8', tintIndex: 0, title: '品牌 KV' },
  { description: '未生成 · 示例位', id: 'ph-8', tintIndex: 0, title: '品牌 KV' },
  { description: '未生成 · 示例位', id: 'ph-8', tintIndex: 0, title: '品牌 KV' },
  { description: '未生成 · 示例位', id: 'ph-8', tintIndex: 0, title: '品牌 KV' },
  { description: '未生成 · 示例位', id: 'ph-8', tintIndex: 0, title: '品牌 KV' },
];
