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

/** 一张卡的生成结果（前端聚合，非后端实体） */
export interface ChatTaskItem {
  id: number | string;
  prompt: string;
  modelLabel: string;
  ratio: string;
  resolution: string;
  count: number;
  skill: string;
  /** 后端任务状态 1~6（见 TASK_STATUS_MAP） */
  status: number;
  errorMsg?: string;
  materialId?: number | string;
  /** 成功后回查到的产物地址 */
  outputs?: string[];
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
  cover?: string;
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
