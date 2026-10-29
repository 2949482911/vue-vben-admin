import type { PageRequestParams } from '#/api/models/core';

// ==================== 枚举 ====================

/**
 * 模型能力
 */
export type ModelCapability = 'edit' | 'image' | 'tag' | 'text' | 'video';

/**
 * 模型来源：平台托管 / 用户自持 Key / 自建网关(newapi)
 */
export type ModelSource = 'newapi' | 'platform' | 'self_key';

/**
 * Skill 类型
 */
export type SkillType =
  | 'clip' // 视频剪辑
  | 'edit' // 修图
  | 'img2img' // 图生图
  | 'img2video' // 图生视频
  | 'push' // 推送正式库
  | 'tag' // 素材打标
  | 'text2img' // 文生图
  | 'text2video' // 文生视频
;

// ==================== 模型配置 ====================

/**
 * 模型能力声明（P0 模型无关地基）
 * 后端 AiModelConfig.capabilities JSON 列；未声明时前端不阻塞生成
 */
export interface ModelCapabilities {
  maxDurationSeconds?: number;
  maxRefAudios?: number;
  maxRefImages?: number;
  maxRefVideos?: number;
  supportsAudio?: boolean;
  supportsFirstFrame?: boolean;
  supportsLastFrame?: boolean;
  supportsNegativePrompt?: boolean;
  supportsRefAudio?: boolean;
  supportsRefImage?: boolean;
  supportsRefVideo?: boolean;
}

/** 能力自检结果：rawCapabilities 为库内原文，其余为后端生效值 */
export interface ModelCapabilityCheck extends ModelCapabilities {
  configured?: boolean;
  rawCapabilities?: null | Record<string, any>;
}

/**
 * 模型配置（列表项；后端不返回 apiKey）
 */
export interface ModelConfigItem {
  id: number | string;
  /** 供应商标识 */
  provider?: string;
  /** 网关地址（OpenAI 兼容） */
  baseUrl?: string;
  /** 模型名 */
  model?: string;
  /** 能力 */
  capability?: ModelCapability;
  /** 模型能力声明 */
  capabilities?: ModelCapabilities;
  /** 来源 */
  source?: ModelSource;
  /** 状态：1 可用 / 9 不可用 */
  status?: number;
  createTime?: string;
}

/**
 * 模型配置（新增/更新；含明文 apiKey，仅提交用）
 */
export interface ModelConfigSaveRequest {
  id?: number | string;
  provider?: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  capability?: ModelCapability;
  /** 模型能力声明；仅视频模型提交，未传时后端保留原值 */
  capabilities?: ModelCapabilities;
  source?: ModelSource;
}

/**
 * 模型配置分页查询
 */
export interface ModelConfigQuery extends PageRequestParams {
  model?: string;
  capability?: ModelCapability;
  source?: ModelSource;
}

// ==================== Skill ====================

/**
 * Skill（列表项 / 实体）
 */
export interface SkillItem {
  id: number | string;
  /** Skill 名称 */
  name?: string;
  /** 类型 */
  type?: SkillType;
  /** 参数 schema */
  paramSchema?: null | Record<string, any>;
  /** 提示词模板 */
  promptTemplate?: string;
  /** 默认模型 */
  defaultModel?: string;
  /** 状态：1 可用 / 9 不可用 */
  status?: number;
  createTime?: string;
}

/**
 * Skill（新增/更新）
 */
export interface SkillSaveRequest {
  id?: number | string;
  name?: string;
  type?: SkillType;
  paramSchema?: null | Record<string, any>;
  promptTemplate?: string;
  defaultModel?: string;
}

/**
 * Skill 分页查询
 */
export interface SkillQuery extends PageRequestParams {
  name?: string;
  type?: SkillType;
}
