import type { SkillType } from '#/api/models/ai_model';

/** Skill 类型选项 */
export const SKILL_TYPE_OPTIONS = [
  { label: '文生图', value: 'text2img' as SkillType },
  { label: '图生图', value: 'img2img' as SkillType },
  { label: '修图', value: 'edit' as SkillType },
  { label: '文生视频', value: 'text2video' as SkillType },
  { label: '图生视频', value: 'img2video' as SkillType },
  { label: '视频剪辑', value: 'clip' as SkillType },
  { label: '素材打标', value: 'tag' as SkillType },
  { label: '推送正式库', value: 'push' as SkillType },
];

/** Skill 类型 → 中文 */
export const SKILL_TYPE_MAP: Record<string, string> = Object.fromEntries(
  SKILL_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);
