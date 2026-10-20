import type { ModelCapability, ModelSource } from '#/api/models/ai_model';

/** 模型能力选项 */
export const CAPABILITY_OPTIONS = [
  { label: '图片', value: 'image' as ModelCapability },
  { label: '视频', value: 'video' as ModelCapability },
  { label: '修图', value: 'edit' as ModelCapability },
  { label: '文本', value: 'text' as ModelCapability },
  { label: '打标', value: 'tag' as ModelCapability },
];

/** 模型能力 → { label, color } */
export const CAPABILITY_MAP: Record<string, { color: string; label: string }> = {
  image: { color: 'blue', label: '图片' },
  video: { color: 'purple', label: '视频' },
  edit: { color: 'cyan', label: '修图' },
  text: { color: 'gold', label: '文本' },
  tag: { color: 'geekblue', label: '打标' },
};

/** 模型来源选项 */
export const SOURCE_OPTIONS = [
  { label: '平台托管', value: 'platform' as ModelSource },
  { label: '自持 Key', value: 'self_key' as ModelSource },
  { label: '自建网关(newapi)', value: 'newapi' as ModelSource },
];

/** 模型来源 → { label, color } */
export const SOURCE_MAP: Record<string, { color: string; label: string }> = {
  platform: { color: 'blue', label: '平台托管' },
  self_key: { color: 'green', label: '自持 Key' },
  newapi: { color: 'purple', label: '自建网关' },
};
