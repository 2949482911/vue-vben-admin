import { requestClient } from '#/api/request';
import { BaseApi } from '#/api/core/baseapi';
import type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  SendMessageRequest,
  SuggestionExecuteRequest,
  SuggestionExecuteResponse,
} from '#/api/models/ai_chat';
import type { PageResponse } from '#/api/models/marketing';

/**
 * AI 投手对话助手 API
 *
 * 后端服务前缀：/platform/ai_chat（turbo 模块 aichat 包）
 * 已实现接口：
 * - GET  /ai_chat/sessions            会话列表（分页）
 * - POST /ai_chat/session/create       创建会话
 * - POST /ai_chat/session/delete       删除会话（软删）
 * - GET  /ai_chat/messages            消息历史
 * - POST /ai_chat/send                 发送消息（非流式，返回 AI 回复）
 * - POST /ai_chat/suggestion/execute   审批执行建议（确认/取消）
 */
class AiChatApi extends BaseApi {
  /** 会话列表 */
  fetchSessions(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
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

  /** 审批执行建议（确认/取消） */
  fetchExecuteSuggestion(data: SuggestionExecuteRequest) {
    return requestClient.post<SuggestionExecuteResponse>(
      this.getServiceUrl('suggestion/execute'),
      data,
    );
  }
}

export const aiChatApi: AiChatApi = new AiChatApi('/platform/ai_chat');
