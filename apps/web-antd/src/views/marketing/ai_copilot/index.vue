<script setup lang="ts" name="AiCopilot">
/**
 * AI 投手对话助手
 *
 * 布局：左侧会话列表（Card + List） + 右侧聊天区（标题栏 / 消息流 / 输入区）
 * 组件：全部使用 ant-design-vue（Button/Input/List/Avatar/Card/Spin/Empty/Tag/Modal/Tooltip）
 * 图标：统一使用 <template #icon> 插槽写法
 * 样式：仅使用项目自身语义色（bg-background/bg-muted/border-border/text-muted-foreground 等），dark 模式自动适配
 */
import { computed, nextTick, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  List,
  ListItem,
  message,
  Modal,
  Progress,
  Spin,
  Tag,
  Tooltip,
} from 'ant-design-vue';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { aiChatApi } from '#/api/core';
import type {
  ChatSession,
  ChatMessage,
  ChatSuggestion,
  ToolRecord,
} from '#/api/models/ai_chat';

// ==================== 平台文案 ====================

const PLATFORM_MAP: Record<string, string> = {
  bytedance: '巨量',
  oppo: 'OPPO',
  tencent: '腾讯',
  vivo: 'VIVO',
  huawei: '华为',
  rednote: '小红书',
};

function platformText(p?: string): string {
  return (p && PLATFORM_MAP[p]) || p || '';
}

// ==================== 会话管理 ====================

const sessions = ref<ChatSession[]>([]);
const currentSessionId = ref<string>('');
const loadingSessions = ref(false);
const sessionKeyword = ref('');

async function loadSessions(keyword?: string) {
  loadingSessions.value = true;
  try {
    const res = await aiChatApi.fetchSessions({
      page: 1,
      pageSize: 50,
      keyword: keyword ?? sessionKeyword.value,
    });
    sessions.value = res.items || [];
    // 当前会话被过滤掉时，自动切到第一条
    if (
      currentSessionId.value &&
      !sessions.value.some((s) => s.id === currentSessionId.value)
    ) {
      currentSessionId.value = '';
      messages.value = [];
    }
    if (sessions.value.length > 0 && !currentSessionId.value) {
      const firstId = sessions.value[0]?.id;
      if (firstId) {
        await selectSession(firstId);
      }
    }
  } finally {
    loadingSessions.value = false;
  }
}

async function handleSearch() {
  await loadSessions();
}

async function createSession() {
  try {
    const session = await aiChatApi.fetchCreateSession({});
    sessions.value.unshift(session);
    if (session.id) {
      await selectSession(session.id);
    }
    sessionKeyword.value = '';
  } catch {
    message.error('创建会话失败');
  }
}

async function deleteSession(id: string) {
  Modal.confirm({
    title: '删除会话',
    content: '删除后该会话及消息将不可恢复，确定删除吗？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await aiChatApi.fetchDeleteSession(id);
        sessions.value = sessions.value.filter((s) => s.id !== id);
        if (currentSessionId.value === id) {
          currentSessionId.value = '';
          messages.value = [];
        }
        message.success('已删除');
        // 删除后自动切到第一条会话
        if (sessions.value.length > 0) {
          const firstId = sessions.value[0]?.id;
          if (firstId) {
            await selectSession(firstId);
          }
        }
      } catch {
        message.error('删除失败');
      }
    },
  });
}

async function selectSession(id: string) {
  currentSessionId.value = id;
  await loadMessages(id);
}

// ==================== 计算属性 ====================

/** 当前会话标题 */
const currentSessionTitle = computed(() => {
  const session = sessions.value.find((s) => s.id === currentSessionId.value);
  return session?.title || (currentSessionId.value ? '对话中' : 'AI 投放助手');
});

// ==================== 消息管理 ====================

const messages = ref<ChatMessage[]>([]);
const loadingMessages = ref(false);
const inputValue = ref('');
const sending = ref(false);

const chatScrollRef = ref<HTMLElement>();

async function loadMessages(sessionId: string) {
  loadingMessages.value = true;
  try {
    messages.value = await aiChatApi.fetchMessages(sessionId);
    await scrollToBottom();
  } finally {
    loadingMessages.value = false;
  }
}

/** 发送消息 */
async function sendMessage() {
  const content = inputValue.value.trim();
  if (!content || sending.value) return;

  if (!currentSessionId.value) {
    message.warning('请先创建会话');
    return;
  }

  const sessionId = currentSessionId.value;
  const now = Date.now();
  const userMsg: ChatMessage = {
    id: `temp_user_${now}`,
    sessionId,
    role: 'user',
    content,
    createTime: new Date().toISOString(),
  };
  const aiMsgPlaceholder: ChatMessage = {
    id: `temp_ai_${now}`,
    sessionId,
    role: 'assistant',
    content: '',
    createTime: new Date().toISOString(),
  };

  messages.value.push(userMsg, aiMsgPlaceholder);
  inputValue.value = '';
  sending.value = true;
  await scrollToBottom();

  try {
    const aiReply = await aiChatApi.fetchSend({ sessionId, content });
    const idx = messages.value.findIndex((m) => m.id === aiMsgPlaceholder.id);
    if (idx >= 0) {
      messages.value[idx] = aiReply;
    } else {
      messages.value.push(aiReply);
    }
    // 刷新会话列表：消息数/最后时间/标题变化
    const session = sessions.value.find((s) => s.id === sessionId);
    if (session) {
      session.messageCount = (session.messageCount || 0) + 2;
      session.lastMessageAt = new Date().toISOString();
      if (session.title === '新对话') {
        session.title = content.slice(0, 20);
      }
    }
    await scrollToBottom();
  } catch {
    messages.value = messages.value.filter(
      (m) => m.id !== aiMsgPlaceholder.id,
    );
    message.error('AI 回复失败，请重试');
  } finally {
    sending.value = false;
  }
}

// ==================== 工具方法 ====================

async function scrollToBottom() {
  await nextTick();
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
  }
}

/** 格式化时间：今天显示 HH:mm，跨天显示 MM-DD */
function formatTime(time?: string): string {
  if (!time) return '';
  const d = new Date(time);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (sameDay) return hm;
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${hm}`;
}

/** 执行记录序号（v-for 索引兼容 string/number） */
function recordIndex(i: number | string): number {
  return Number(i) + 1;
}

/** 风险等级样式 */
function riskColor(level: string): string {
  return level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green';
}

function riskText(level: string): string {
  return level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险';
}

/** 执行记录状态文案 */
function recordStatusText(status: string): string {
  const map: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '执行中',
    pending_approval: '待审批',
    skipped: '已跳过',
  };
  return map[status] || status || '';
}

function recordStatusColor(status: string): string {
  const map: Record<string, string> = {
    success: 'green',
    failed: 'red',
    pending: 'blue',
    pending_approval: 'orange',
    skipped: 'default',
  };
  return map[status] || 'default';
}

function onKeyup(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

const quickPrompts = [
  '今天各平台消耗情况如何？',
  '帮我查看ROI最低的5个计划',
  '哪些计划超成本了？',
  '推荐一些优化建议',
];

// ==================== 建议审批 ====================

/** 正在执行的建议 ID（防止重复点击） */
const executingSuggestionId = ref<string>('');

/** 执行进度百分比 */
function execProgress(ds?: any): number {
  if (!ds?.records?.length) return 0;
  if (!ds.totalSteps) return 0;
  return Math.round(((ds.successSteps || 0) / ds.totalSteps) * 100);
}

/** 执行进度状态 */
function execProgressStatus(ds?: any): 'active' | 'success' | 'exception' {
  if (!ds?.records?.length) return 'active';
  const failed = ds.records.filter((r: ToolRecord) => r.status === 'failed').length;
  if (failed > 0) return 'exception';
  return 'success';
}

/** 确认执行建议 */
async function handleConfirmSuggestion(msg: ChatMessage, suggestion: ChatSuggestion) {
  if (executingSuggestionId.value) return;
  executingSuggestionId.value = suggestion.id;
  try {
    const res = await aiChatApi.fetchExecuteSuggestion({
      messageId: msg.id!,
      suggestionId: suggestion.id,
      action: 'confirm',
    });
    // 更新本地建议状态
    suggestion.executed = true;
    suggestion.status = 'executed';
    suggestion.execResult = res.message;
    message.success(res.message || '执行成功');
  } catch {
    message.error('执行失败，请重试');
  } finally {
    executingSuggestionId.value = '';
  }
}

/** 取消建议 */
async function handleCancelSuggestion(msg: ChatMessage, suggestion: ChatSuggestion) {
  if (executingSuggestionId.value) return;
  executingSuggestionId.value = suggestion.id;
  try {
    await aiChatApi.fetchExecuteSuggestion({
      messageId: msg.id!,
      suggestionId: suggestion.id,
      action: 'cancel',
    });
    suggestion.executed = false;
    suggestion.status = 'cancelled';
    message.info('已取消该建议');
  } catch {
    message.error('取消失败，请重试');
  } finally {
    executingSuggestionId.value = '';
  }
}

onMounted(() => {
  loadSessions();
});
</script>

<template>
  <Page auto-content-height>
    <div class="chat-layout">
      <!-- 左侧：会话列表 -->
      <Card class="session-panel" :bordered="false">
        <template #title>
          <span class="text-sm font-medium">对话会话</span>
        </template>
        <template #extra>
          <Button
            type="primary"
            size="small"
            @click="createSession"
          >
            <template #icon><PlusOutlined /></template>
            新建
          </Button>
        </template>

        <Spin :spinning="loadingSessions">
          <Input
            v-model:value="sessionKeyword"
            placeholder="搜索标题/平台/账户"
            allow-clear
            size="small"
            class="mb-3"
            @change="handleSearch"
            @pressEnter="handleSearch"
          >
            <template #prefix><SearchOutlined /></template>
          </Input>
          <List
            v-if="sessions.length > 0"
            :data-source="sessions"
            size="small"
            :split="true"
          >
            <template #renderItem="{ item }">
              <ListItem
                class="session-item"
                :class="{ 'session-active': item.id === currentSessionId }"
                @click="selectSession(item.id)"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="truncate text-sm font-medium">
                      {{ item.title || '新对话' }}
                    </span>
                    <Tag
                      v-if="platformText(item.platform)"
                      color="blue"
                      :bordered="false"
                      size="small"
                    >
                      {{ platformText(item.platform) }}
                    </Tag>
                  </div>
                  <div class="session-meta">
                    <span>{{ item.messageCount || 0 }} 条消息</span>
                    <span>{{ formatTime(item.lastMessageAt) }}</span>
                  </div>
                </div>
                <Tooltip title="删除会话">
                  <Button
                    type="text"
                    size="small"
                    danger
                    @click.stop="deleteSession(item.id)"
                  >
                    <template #icon><DeleteOutlined /></template>
                  </Button>
                </Tooltip>
              </ListItem>
            </template>
          </List>
          <Empty v-else description="暂无会话" />
        </Spin>
      </Card>

      <!-- 右侧：聊天区 -->
      <Card class="chat-panel" :bordered="false">
        <!-- 标题栏 -->
        <template #title>
          <div class="flex items-center gap-2">
            <Avatar
              :size="26"
              class="bg-primary text-primary-foreground"
            >
              <template #icon><RobotOutlined /></template>
            </Avatar>
            <span class="text-sm font-medium">
              {{ currentSessionTitle }}
            </span>
          </div>
        </template>

        <!-- 消息流 -->
        <div ref="chatScrollRef" class="chat-scroll bg-background-deep">
          <!-- 空状态 + 快捷提问 -->
          <div
            v-if="messages.length === 0 && !loadingMessages"
            class="chat-empty"
          >
            <Avatar :size="56" class="bg-primary text-primary-foreground">
              <template #icon>
                <RobotOutlined style="font-size: 28px" />
              </template>
            </Avatar>
            <div class="text-base font-medium mt-4">
              你好，我是 AI 投放助手
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              可以问我投放数据、计划状态、优化建议等问题
            </div>
            <div class="quick-prompts">
              <Button
                v-for="prompt in quickPrompts"
                :key="prompt"
                class="quick-btn"
                @click="inputValue = prompt; sendMessage()"
              >
                {{ prompt }}
              </Button>
            </div>
          </div>

          <Spin :spinning="loadingMessages" />

          <!-- 消息列表 -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-msg"
            :class="msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'"
          >
            <!-- 头像 -->
            <Avatar
              :size="32"
              class="chat-avatar"
              :class="
                msg.role === 'assistant'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              "
            >
              <template #icon>
                <RobotOutlined v-if="msg.role === 'assistant'" />
                <UserOutlined v-else />
              </template>
            </Avatar>

            <!-- 内容列 -->
            <div class="chat-body">
              <!-- 气泡 -->
              <div
                class="chat-bubble"
                :class="
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border'
                "
              >
                <span
                  v-if="msg.role === 'assistant' && !msg.content && sending"
                  class="chat-thinking"
                >
                  AI 正在思考
                  <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
                </span>
                <span v-else>{{ msg.content }}</span>
              </div>

              <!-- 执行记录（dataSnapshot.records） -->
              <Card
                v-if="
                  msg.dataSnapshot && msg.dataSnapshot.records
                    && msg.dataSnapshot.records.length > 0
                "
                size="small"
                class="exec-card"
              >
                <template #title>
                  <div class="flex items-center justify-between w-full">
                    <span class="text-xs text-muted-foreground">执行记录</span>
                    <span class="text-xs text-muted-foreground">
                      {{ msg.dataSnapshot.successSteps || 0 }}/{{ msg.dataSnapshot.totalSteps || msg.dataSnapshot.records.length }} 步
                    </span>
                  </div>
                </template>
                <!-- 进度条 -->
                <Progress
                  :percent="execProgress(msg.dataSnapshot)"
                  :status="execProgressStatus(msg.dataSnapshot)"
                  :show-info="false"
                  size="small"
                  class="mb-2"
                />
                <div
                  v-for="(rec, i) in msg.dataSnapshot.records"
                  :key="i"
                  class="exec-record"
                >
                  <span class="text-muted-foreground">{{ recordIndex(i) }}.</span>
                  <span class="exec-record-name">{{ rec.stepName || rec.toolName }}</span>
                  <span v-if="rec.duration" class="exec-record-dur">
                    {{ rec.duration }}ms
                  </span>
                  <Tag
                    :color="recordStatusColor(rec.status)"
                    :bordered="false"
                    size="small"
                  >
                    {{ recordStatusText(rec.status) }}
                  </Tag>
                </div>
              </Card>

              <!-- 操作建议卡片 -->
              <div
                v-if="msg.suggestions && msg.suggestions.length > 0"
                class="suggestion-list"
              >
                <Card
                  v-for="s in msg.suggestions"
                  :key="s.id"
                  size="small"
                  class="suggestion-card"
                >
                  <div class="flex items-center gap-2 mb-1.5">
                    <Tag
                      :color="riskColor(s.riskLevel)"
                      :bordered="false"
                      size="small"
                    >
                      {{ riskText(s.riskLevel) }}
                    </Tag>
                    <span class="text-sm font-medium">
                      {{ s.title }}
                    </span>
                    <!-- 已执行/已取消状态 -->
                    <Tag
                      v-if="s.status === 'executed'"
                      color="green"
                      :bordered="false"
                      size="small"
                    >
                      已执行
                    </Tag>
                    <Tag
                      v-else-if="s.status === 'cancelled'"
                      color="default"
                      :bordered="false"
                      size="small"
                    >
                      已取消
                    </Tag>
                    <Tag
                      v-else-if="s.status === 'failed'"
                      color="red"
                      :bordered="false"
                      size="small"
                    >
                      执行失败
                    </Tag>
                  </div>
                  <div class="text-xs text-muted-foreground leading-relaxed mb-2">
                    {{ s.description }}
                  </div>
                  <!-- 执行结果 -->
                  <div
                    v-if="s.execResult"
                    class="text-xs text-muted-foreground bg-muted rounded px-2 py-1.5 mb-2"
                  >
                    {{ s.execResult }}
                  </div>
                  <!-- 审批按钮（未执行时显示） -->
                  <div
                    v-if="!s.executed && s.status !== 'cancelled' && s.status !== 'executed'"
                    class="flex justify-end gap-2"
                  >
                    <Button
                      size="small"
                      :loading="executingSuggestionId === s.id"
                      :disabled="!!executingSuggestionId"
                      @click="handleCancelSuggestion(msg, s)"
                    >
                      <template #icon><CloseOutlined /></template>
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      danger
                      :loading="executingSuggestionId === s.id"
                      :disabled="!!executingSuggestionId"
                      @click="handleConfirmSuggestion(msg, s)"
                    >
                      <template #icon><CheckOutlined /></template>
                      确认执行
                    </Button>
                  </div>
                </Card>
              </div>

              <div class="chat-time">
                {{ formatTime(msg.createTime) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input border-t border-border bg-background">
          <Input.TextArea
            v-model:value="inputValue"
            placeholder="输入你的问题，如：今天巨量的消耗情况如何？帮我关停ROI低于0.5的计划"
            :auto-size="{ minRows: 1, maxRows: 4 }"
            :disabled="sending"
            @keyup="onKeyup"
          />
          <Button
            type="primary"
            :loading="sending"
            :disabled="!inputValue.trim()"
            @click="sendMessage"
          >
            <template #icon><SendOutlined /></template>
          </Button>
        </div>
      </Card>
    </div>
  </Page>
</template>

<style scoped lang="scss">
.chat-layout {
  display: flex;
  gap: 16px;
  height: 100%;

  // 左侧会话列表
  .session-panel {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    :deep(.ant-card-body) {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      max-height: calc(100vh - 220px);
    }

    .session-item {
      border-radius: 8px;
      cursor: pointer;
      padding: 10px 8px;
      transition: background-color 0.2s;

      &:hover {
        background: hsl(var(--muted));
      }

      &.session-active {
        background: hsl(var(--primary));

        .truncate,
        .session-meta,
        .ant-tag {
          color: hsl(var(--primary-foreground));
        }
      }
    }

    .session-meta {
      display: flex;
      gap: 8px;
      margin-top: 4px;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }
  }

  // 右侧聊天区
  .chat-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    :deep(.ant-card-body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    // 消息滚动区
    .chat-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;

      .chat-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px 0 30px;

        .quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 28px;
          max-width: 560px;

          .quick-btn {
            border-radius: 16px;
          }
        }
      }

      // 单条消息
      .chat-msg {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;

        &.chat-msg-user {
          flex-direction: row-reverse;

          .chat-body {
            align-items: flex-end;
          }

          .chat-bubble {
            border-top-right-radius: 4px;
          }
        }

        &.chat-msg-ai {
          .chat-bubble {
            border-top-left-radius: 4px;
          }
        }

        .chat-avatar {
          flex-shrink: 0;
        }

        .chat-body {
          max-width: 72%;
          display: flex;
          flex-direction: column;

          .chat-bubble {
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .chat-thinking {
            font-style: italic;
            color: hsl(var(--muted-foreground));

            .dot {
              animation: blink 1.4s infinite both;

              &:nth-child(2) {
                animation-delay: 0.2s;
              }

              &:nth-child(3) {
                animation-delay: 0.4s;
              }
            }
          }

          .chat-time {
            margin-top: 6px;
            font-size: 12px;
            color: hsl(var(--muted-foreground));
          }
        }
      }

      @keyframes blink {
        0%,
        80%,
        100% {
          opacity: 0;
        }
        40% {
          opacity: 1;
        }
      }
    }

    // 执行记录/建议卡片
    .exec-card,
    .suggestion-card {
      margin-top: 8px;

      :deep(.ant-card-body) {
        padding: 10px 12px;
      }
    }

    // 执行记录条目
    .exec-record {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      font-size: 12px;

      .exec-record-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .exec-record-dur {
        flex-shrink: 0;
        color: hsl(var(--muted-foreground));
        font-size: 11px;
      }
    }

    .suggestion-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }

    // 输入区
    .chat-input {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
    }
  }
}
</style>
