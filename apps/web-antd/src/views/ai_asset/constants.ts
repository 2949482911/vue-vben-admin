import type {
  AssetType,
  MaterialItem,
  MaterialType,
  NodeType,
} from '#/api/models/ai_asset';

/** 素材类型选项 */
export const MATERIAL_TYPE_OPTIONS = [
  { label: '图片', value: 'image' as MaterialType },
  { label: '视频', value: 'video' as MaterialType },
  { label: '音频', value: 'audio' as MaterialType },
  { label: '文本', value: 'text' as MaterialType },
];

/** 素材类型 → 中文 */
export const MATERIAL_TYPE_MAP: Record<string, string> = Object.fromEntries(
  MATERIAL_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);

/** 素材状态 → { label, color }（1=草稿 2=已确认 3=已入库） */
export const MATERIAL_STATUS_MAP: Record<
  number,
  { color: string; label: string }
> = {
  1: { color: 'default', label: '草稿' },
  2: { color: 'green', label: '已确认' },
  3: { color: 'blue', label: '已入库' },
};

/** 生成任务状态 → { label, color }（后端 TaskStatus 1~6） */
export const TASK_STATUS_MAP: Record<
  number,
  { color: string; label: string }
> = {
  1: { color: 'default', label: 'SUBMITTED' },
  2: { color: 'purple', label: 'QUEUED' },
  3: { color: 'processing', label: 'RUNNING' },
  4: { color: 'success', label: 'SUCCEEDED' },
  5: { color: 'error', label: 'FAILED' },
  6: { color: 'default', label: 'CANCELLED' },
};

/** 生成任务状态选项（筛选用） */
export const TASK_STATUS_OPTIONS = [
  { label: '提交中', value: 1 },
  { label: '排队中', value: 2 },
  { label: '运行中', value: 3 },
  { label: '已成功', value: 4 },
  { label: '失败', value: 5 },
  { label: '已取消', value: 6 },
];

/** 可取消的任务状态（未结束） */
export const CANCELABLE_TASK_STATUS = [1, 2, 3];

/** 生成 Skill 选项（与 system 侧 Skill 类型一致） */
export const ASSET_SKILL_OPTIONS = [
  { label: '文生图', value: 'text2img' },
  { label: '图生图', value: 'img2img' },
  { label: '修图', value: 'edit' },
  { label: '文生视频', value: 'text2video' },
  { label: '图生视频', value: 'img2video' },
  { label: '视频剪辑', value: 'clip' },
  { label: '素材打标', value: 'tag' },
];

/** 生成 Skill → 中文 */
export const ASSET_SKILL_MAP: Record<string, string> = Object.fromEntries(
  ASSET_SKILL_OPTIONS.map((item) => [item.value, item.label]),
);

// ==================== 工作流画布 ====================

/** 节点类型（MVP 仅 image/video，其余 P1 占位） */
export const NODE_TYPE_OPTIONS: Array<{
  label: string;
  mvp: boolean;
  value: NodeType;
}> = [
  { label: '图片', mvp: true, value: 'image' },
  { label: '视频', mvp: true, value: 'video' },
  { label: '文本', mvp: false, value: 'text' },
  { label: '音频', mvp: false, value: 'audio' },
  { label: '剧本', mvp: false, value: 'script' },
  { label: '剪辑', mvp: false, value: 'clip' },
  { label: '素材库', mvp: false, value: 'asset' },
  { label: '打标', mvp: false, value: 'tag' },
  { label: '推送', mvp: false, value: 'push' },
];

/** 节点类型 → 中文 */
export const NODE_TYPE_MAP: Record<string, string> = Object.fromEntries(
  NODE_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);

/** 运行 / 运行节点状态 → { label, color }（后端 1待运行 2运行中 3成功 4失败） */
export const RUN_STATUS_MAP: Record<number, { color: string; label: string }> =
  {
    1: { color: 'default', label: '待运行' },
    2: { color: 'processing', label: '运行中' },
    3: { color: 'success', label: '成功' },
    4: { color: 'error', label: '失败' },
  };

/** 画布节点配置项 —— 比例 / 清晰度 / 画质 / 时长 / 数量 */
export const RATIO_OPTIONS = ['1:1', '16:9', '9:16', '4:3', '3:4'].map((v) => ({
  label: v,
  value: v,
}));

export const RESOLUTION_OPTIONS = ['1K', '2K', '4K'].map((v) => ({
  label: v,
  value: v,
}));

export const QUALITY_OPTIONS = [
  '低画质',
  '标准画质',
  '高画质',
  '超高画质',
  '极致画质',
].map((v) => ({ label: v, value: v }));

export const DURATION_OPTIONS = [5, 10, 15].map((v) => ({
  label: `${v}s`,
  value: v,
}));

export const COUNT_OPTIONS = [1, 2, 4].map((v) => ({
  label: `${v}张`,
  value: v,
}));

/** 生成 Skill 选项（画布节点用） */
export const NODE_SKILL_OPTIONS = [
  'text2img',
  'img2img',
  'edit',
  'text2video',
  'img2video',
].map((v) => ({ label: v, value: v }));

// ==================== 素材库 / 资产（角色·场景·分集） ====================

/** 素材库类型分段（全部 / 图片 / 视频 / 音频） */
export const MEDIA_TAB_OPTIONS: Array<{ label: string; value: 'all' | MaterialType }> = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
];

/** 素材库状态筛选（后端持久化：1 草稿 / 2 已确认） */
export const MATERIAL_STATUS_OPTIONS = [
  { label: '已确认', value: 2 },
  { label: '草稿', value: 1 },
];

/**
 * 素材展示名：优先用后端 `name`（原始文件名），老数据没有时从 OSS 文件名派生。
 */
export function materialDisplayName(item: MaterialItem): string {
  if (item.name) {
    return item.name;
  }
  const base = (item.storageUrl ?? '').split('?')[0]?.split('/').pop() ?? '';
  return base ? decodeURIComponent(base) : `素材 #${item.id}`;
}

/** 资产类型（角色 / 场景 / 分集） */
export const ASSET_TYPE_OPTIONS: Array<{ label: string; value: AssetType }> = [
  { label: '角色', value: 'character' },
  { label: '场景', value: 'scene' },
  { label: '分集', value: 'episode' },
];

/**
 * 选择器 / 画布等需要「全量引用」的场景：后端 list 已统一分页，
 * 这里用足够大的页长一次取回；后端若补不分页的 options 接口再换掉。
 */
export const PICKER_PAGE_SIZE = 500;

/** 资产类型 → 新增/说明文案 */
export const ASSET_TYPE_META: Record<AssetType, { add: string; sub: string }> = {
  character: { add: '新增角色', sub: '用于多轮生成时保持人物一致（一致性锚）' },
  episode: { add: '新增分集', sub: '分集归属某部小说，用于剧集类批量生成' },
  novel: { add: '新增小说', sub: '小说/原著：含简介与正文，其下钻管理分集与剧本' },
  scene: { add: '新增场景', sub: '为生成提供统一背景与光线' },
};
