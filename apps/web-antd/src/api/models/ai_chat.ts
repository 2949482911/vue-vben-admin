import type { BaseItem } from '#/api/models/core';

// ==================== 对话消息 ====================

/**
 * 消息角色
 */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * 对话消息
 */
export interface ChatMessage extends BaseItem {
  /** 会话ID */
  sessionId: string;
  /** 消息角色 */
  role: ChatRole;
  /** 消息内容 */
  content: string;
  /** AI 返回的操作建议（如果有） */
  suggestions?: ChatSuggestion[];
  /** 关联的投放数据快照/执行记录（如果有） */
  dataSnapshot?: Record<string, any>;
}

/**
 * AI 操作建议
 */
export interface ChatSuggestion {
  /** 建议ID */
  id: string;
  /** 建议类型 */
  type: string;
  /** 建议标题 */
  title: string;
  /** 建议描述 */
  description: string;
  /** 操作参数 */
  params: Record<string, any>;
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high';
  /** 是否已执行 */
  executed: boolean;
}

// ==================== 会话 ====================

/**
 * 对话会话
 */
export interface ChatSession extends BaseItem {
  /** 会话标题（取首条消息摘要） */
  title: string;
  /** 关联平台 */
  platform?: string;
  /** 关联账户ID */
  advertiserId?: string;
  /** 消息数量 */
  messageCount: number;
  /** 最后消息时间 */
  lastMessageAt: string;
}

/**
 * 创建会话请求
 */
export interface CreateSessionRequest {
  platform?: string;
  advertiserId?: string;
  title?: string;
}

/**
 * 发送消息请求
 */
export interface SendMessageRequest {
  /** 会话ID */
  sessionId: string;
  /** 用户消息 */
  content: string;
  /** 上下文消息（可选，缺省时后端取会话历史） */
  context?: ChatMessage[];
}
