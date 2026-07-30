import { requestClient } from '#/api/request';
import { BaseApi } from '#/api/core/baseapi';
import type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  SendMessageRequest,
  ChatSuggestion,
} from '#/api/models/ai_chat';
import type { PageResponse } from '#/api/models/marketing';

/**
 * AI 投手对话助手 API
 *
 * 后端服务前缀：/platform/ai_chat
 * 需要后端配合实现以下接口：
 * - GET  /platform/ai_chat/sessions          会话列表
 * - POST /platform/ai_chat/session/create     创建会话
 * - POST /platform/ai_chat/session/delete     删除会话
 * - GET  /platform/ai_chat/messages           消息历史
 * - POST /platform/ai_chat/send               发送消息（非流式）
 * - GET  /platform/ai_chat/stream             流式对话（SSE）
 * - POST /platform/ai_chat/suggestion/execute 执行操作建议
 */
class AiChatApi extends BaseApi {
  /** 会话列表 */
  fetchSessions(params: {
    page?: number;
    pageSize?: number;
  }): Promise<PageResponse<ChatSession>> {
    return requestClient.get<PageResponse<ChatSession>>(
      this.getServiceUrl('sessions'),
      { params },
    );
  }

  /** 创建会话 */
  fetchCreateSession(data: CreateSessionRequest) {
    return requestClient.post<ChatSession>(
      this.getServiceUrl('session/create'),
      data,
    );
  }

  /** 删除会话 */
  fetchDeleteSession(sessionId: string) {
    return requestClient.post(this.getServiceUrl('session/delete'), {
      sessionId,
    });
  }

  /** 消息历史 */
  fetchMessages(sessionId: string): Promise<ChatMessage[]> {
    return requestClient.get<ChatMessage[]>(
      this.getServiceUrl('messages'),
      { params: { sessionId } },
    );
  }

  /** 发送消息（非流式，返回AI完整回复） */
  fetchSend(data: SendMessageRequest) {
    return requestClient.post<ChatMessage>(
      this.getServiceUrl('send'),
      data,
    );
  }

  /**
   * 流式对话（SSE）
   *
   * 后端需实现 SSE 端点，返回 StreamEvent 格式的事件流
   * 前端通过 EventSource 或 fetch + ReadableStream 消费
   */
  fetchStreamUrl(sessionId: string, content: string): string {
    const params = new URLSearchParams({
      sessionId,
      content,
    });
    return `${this.serviceUrl}/stream?${params.toString()}`;
  }

  /** 执行操作建议 */
  fetchExecuteSuggestion(suggestion: ChatSuggestion) {
    return requestClient.post(this.getServiceUrl('suggestion/execute'), suggestion);
  }
}

export const aiChatApi: AiChatApi = new AiChatApi('/platform/ai_chat');
