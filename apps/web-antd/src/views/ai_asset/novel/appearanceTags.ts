export interface TagDimension {
  dictCode: string;
  key: string;
  label: string;
  max?: number;
  mode: 'multi' | 'single';
}

/** 角色外观标签（9 维） */
export const CHARACTER_TAG_DIMENSIONS: TagDimension[] = [
  { dictCode: 'ai_char_gender', key: 'gender', label: '性别', mode: 'single' },
  { dictCode: 'ai_char_age_group', key: 'ageGroup', label: '年龄段', mode: 'single' },
  { dictCode: 'ai_char_build', key: 'build', label: '体型', mode: 'single' },
  { dictCode: 'ai_char_hair_style', key: 'hairStyle', label: '发型', mode: 'single' },
  { dictCode: 'ai_char_hair_color', key: 'hairColor', label: '发色', mode: 'single' },
  { dictCode: 'ai_char_outfit_style', key: 'outfitStyle', label: '服装风格', mode: 'multi', max: 2 },
  { dictCode: 'ai_char_palette', key: 'palette', label: '配色', mode: 'multi', max: 2 },
  { dictCode: 'ai_char_feature', key: 'features', label: '特征', mode: 'multi', max: 3 },
  { dictCode: 'ai_char_expression', key: 'expression', label: '神态', mode: 'multi', max: 2 },
  { dictCode: 'ai_char_face_style', key: 'faceStyle', label: '脸型风格', mode: 'single' },
  { dictCode: 'ai_char_height', key: 'height', label: '身形身高', mode: 'single' },
  { dictCode: 'ai_char_body_detail', key: 'bodyDetails', label: '身材细节', mode: 'multi', max: 3 },
  { dictCode: 'ai_char_facial_feature', key: 'facialFeatures', label: '五官特征', mode: 'multi', max: 3 },
  { dictCode: 'ai_char_style', key: 'style', label: '风格气质', mode: 'multi', max: 2 },
];

/** 场景标签（6 维） */
export const SCENE_TAG_DIMENSIONS: TagDimension[] = [
  { dictCode: 'ai_scene_indoor_outdoor', key: 'indoorOutdoor', label: '内外景', mode: 'single' },
  { dictCode: 'ai_scene_time_of_day', key: 'timeOfDay', label: '时间', mode: 'single' },
  { dictCode: 'ai_scene_weather', key: 'weather', label: '天气', mode: 'single' },
  { dictCode: 'ai_scene_mood', key: 'mood', label: '氛围', mode: 'multi', max: 2 },
  { dictCode: 'ai_scene_architecture', key: 'architecture', label: '建筑/地域', mode: 'single' },
  { dictCode: 'ai_scene_lighting', key: 'lighting', label: '光线', mode: 'single' },
];

