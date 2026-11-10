/**
 * 项目级设置（P2 契约）：项目画风与画面比例按小说维度读写。
 *
 * 链路位置：短剧工作台顶栏「项目画风 / 画面比例」→ ai_asset_project API → 后端 v2/project。
 * 字段名与后端冻结契约逐字对齐；effectivePrompt 由后端计算，前端只读展示。
 */

/** 项目可选画风预设（后端按项目返回） */
export interface ProjectVisualStylePreset {
  code: string;
  label: string;
  prompt: string;
  negativePrompt?: null | string;
}

/** 项目当前画风：custom=true 表示自定义（无预设 code） */
export interface ProjectVisualStyleCurrent {
  code?: string;
  label?: string;
  prompt?: string;
  negativePrompt?: null | string;
  custom?: boolean;
  /** 风格样图素材 ID；仅用于画风，不参与实体绑定 */
  styleReferenceMaterialId?: null | number | string;
  styleReferenceThumbnailUrl?: null | string;
  styleReferenceUrl?: null | string;
  updatedAt?: null | string;
}

/** GET/POST visual-style 的统一视图 */
export interface ProjectVisualStyleView {
  presets: ProjectVisualStylePreset[];
  current: null | ProjectVisualStyleCurrent;
  effectivePrompt: string;
}

/** 保存画风：预设 {code} / 自定义 {prompt, negativePrompt?} / 清除 {} */
export interface ProjectVisualStyleSaveRequest {
  code?: string;
  prompt?: string;
  negativePrompt?: string;
  /** 风格样图素材 ID；后端即将支持 */
  styleReferenceMaterialId?: null | number | string;
}

/** GET aspect-ratio 视图；可选值以系统字典 ai_aspect_ratio 为准 */
export interface ProjectAspectRatioView {
  aspectRatio: string;
}
