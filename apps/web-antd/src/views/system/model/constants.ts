import type {
  ModelCapabilities,
  ModelCapability,
  ModelSource,
} from '#/api/models/ai_model';

/** 模型供应商字典编码（系统字典管理里维护） */
export const MODEL_PROVIDER_DICT_CODE = 'system_model';

/** 模型名称字典编码（系统字典管理里维护） */
export const MODEL_NAME_DICT_CODE = 'model_name';

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

/**
 * 万相 wan3.0 视频能力模板。
 * 用途：视频模型首次配置能力时一键填满，避免逐项手填时误把「未配置」存成「不支持」。
 * 注意：段落生成固定 audio=true 且依赖尾帧，所以 supportsLastFrame / supportsAudio 必须为 true。
 */
export const VIDEO_CAPABILITY_PRESET: Required<ModelCapabilities> = {
  maxDurationSeconds: 30,
  maxRefAudios: 5,
  maxRefImages: 10,
  maxRefVideos: 5,
  supportsAudio: true,
  supportsFirstFrame: true,
  supportsLastFrame: true,
  supportsNegativePrompt: false,
  supportsRefAudio: true,
  supportsRefImage: true,
  supportsRefVideo: true,
};

/** 能力声明 → 列表展示标签；返回空数组表示未配置，由调用方显示「未配置」 */
export function capabilityTags(
  capabilities?: ModelCapabilities | null,
): Array<{ color: string; label: string }> {
  if (!capabilities) {
    return [];
  }
  const tags: Array<{ color: string; label: string }> = [];
  if (capabilities.supportsFirstFrame) {
    tags.push({ color: 'green', label: '首帧' });
  }
  if (capabilities.supportsLastFrame) {
    tags.push({ color: 'green', label: '尾帧' });
  }
  if (capabilities.supportsAudio) {
    tags.push({ color: 'cyan', label: '原生音频' });
  }
  if (capabilities.supportsRefImage) {
    tags.push({
      color: 'blue',
      label: `参考图${capabilities.maxRefImages ? `×${capabilities.maxRefImages}` : ''}`,
    });
  }
  if (capabilities.supportsRefVideo) {
    tags.push({
      color: 'blue',
      label: `参考视频${capabilities.maxRefVideos ? `×${capabilities.maxRefVideos}` : ''}`,
    });
  }
  if (capabilities.supportsRefAudio) {
    tags.push({
      color: 'blue',
      label: `参考音频${capabilities.maxRefAudios ? `×${capabilities.maxRefAudios}` : ''}`,
    });
  }
  if (capabilities.maxDurationSeconds) {
    tags.push({ color: 'gold', label: `≤${capabilities.maxDurationSeconds}s` });
  }
  return tags;
}
