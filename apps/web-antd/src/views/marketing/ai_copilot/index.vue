<script setup lang="ts" name="AiCopilot">
/**
 * AI 投手对话助手
 *
 * 左侧会话列表 + 右侧对话区
 * 全部使用 AntD Card 组件布局，不自定义背景色
 */
import { nextTick, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  Button,
  Card,
  Empty,
  Input,
  List,
  ListItem,
  message,
  Spin,
  Tag,
} from 'ant-design-vue';
import {
  PlusOutlined,
  DeleteOutlined,
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue';
import { aiChatApi } from '#/api/core';
import type {
  ChatSession,
  ChatMessage,
  ChatSuggestion,
} from '#/api/models/ai_chat';

// ==================== 会话管理 ====================

const sessions = ref<ChatSession[]>([]);
const currentSessionId = ref<string>('');
const loadingSessions = ref(false);

async function loadSessions() {
  loadingSessions.value = true;
  try {
    const res = await aiChatApi.fetchSessions({ page: 1, pageSize: 50 });
    sessions.value = res.items || [];
    if (sessions.value.length > 0 && !currentSessionId.value) {
      await selectSession(sessions.value[0].id);
    }
  } finally {
    loadingSessions.value = false;
  }
}

async function createSession() {
  try {
    const session = await aiChatApi.fetchCreateSession({});
    sessions.value.unshift(session);
    await selectSession(session.id);
  } catch {
    message.error('创建会话失败');
  }
}

async function deleteSession(id: string) {
  try {
    await aiChatApi.fetchDeleteSession(id);
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (currentSessionId.value === id) {
      currentSessionId.value = '';
      messages.value = [];
    }
    message.success('已删除');
  } catch {
    message.error('删除失败');
  }
}

async function selectSession(id: string) {
  currentSessionId.value = id;
  await loadMessages(id);
}

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

  const userMsg: ChatMessage = {
    id: `temp_${Date.now()}`,
    sessionId: currentSessionId.value,
    role: 'user',
    content,
    createTime: new Date().toISOString(),
  };
  messages.value.push(userMsg);
  inputValue.value = '';
  sending.value = true;
  await scrollToBottom();

  try {
    const aiMsgPlaceholder: ChatMessage = {
      id: `temp_ai_${Date.now()}`,
      sessionId: currentSessionId.value,
      role: 'assistant',
      content: '',
      createTime: new Date().toISOString(),
    };
    messages.value.push(aiMsgPlaceholder);
    await scrollToBottom();

    const aiReply = await aiChatApi.fetchSend({
      sessionId: currentSessionId.value,
      content,
    });

    const idx = messages.value.findIndex((m) => m.id === aiMsgPlaceholder.id);
    if (idx >= 0) {
      messages.value[idx] = aiReply;
    } else {
      messages.value.push(aiReply);
    }
    await scrollToBottom();
  } catch {
    messages.value = messages.value.filter(
      (m) => m.id !== `temp_ai_${Date.now()}`,
    );
    message.error('AI 回复失败，请重试');
  } finally {
    sending.value = false;
  }
}

/** 执行操作建议 */
async function executeSuggestion(_msgId: string, suggestion: ChatSuggestion) {
  try {
    await aiChatApi.fetchExecuteSuggestion(suggestion);
    suggestion.executed = true;
    message.success(`已执行：${suggestion.title}`);
  } catch {
    message.error('执行失败');
  }
}

// ==================== 工具方法 ====================

async function scrollToBottom() {
  await nextTick();
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
  }
}

function formatTime(time: string): string {
  if (!time) return '';
  const d = new Date(time);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function riskColor(level: string): string {
  return level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green';
}

function riskText(level: string): string {
  return level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险';
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

onMounted(() => {
  loadSessions();
});
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full gap-4">
      <!-- 左侧：会话列表 -->
      <Card class="session-card" :bordered="false">
        <template #title>对话会话</template>
        <template #extra>
          <Button
            type="primary"
            size="small"
            :icon="PlusOutlined"
            @click="createSession"
          >
            新建
          </Button>
        </template>

        <Spin :spinning="loadingSessions">
          <List
            v-if="sessions.length > 0"
            :data-source="sessions"
            size="small"
            :split="true"
          >
            <template #renderItem="{ item }">
              <ListItem
                class="cursor-pointer"
                :class="{ 'bg-primary/10': item.id === currentSessionId }"
                @click="selectSession(item.id)"
              >
                <div class="flex-1 min-w-0">
                  <div class="truncate text-sm">
                    {{ item.title || '新对话' }}
                  </div>
                  <div class="flex gap-2 text-xs opacity-45 mt-1">
                    <span>{{ item.messageCount }} 条消息</span>
                    <span>{{ formatTime(item.lastMessageAt) }}</span>
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  danger
                  @click.stop="deleteSession(item.id)"
                >
                  <template #icon><DeleteOutlined /></template>
                </Button>
              </ListItem>
            </template>
          </List>
          <Empty v-else description="暂无会话" />
        </Spin>
      </Card>

      <!-- 右侧：对话区 -->
      <Card class="chat-card flex-1" :bordered="false">
        <!-- 消息流 -->
        <div ref="chatScrollRef" class="flex-1 overflow-y-auto p-4">
          <Empty
            v-if="messages.length === 0 && !loadingMessages"
            description="开始与 AI 投手对话"
            class="mt-20"
          />
          <Spin :spinning="loadingMessages" />

          <!-- 快捷提问（空会话时展示） -->
          <div
            v-if="messages.length === 0 && !loadingMessages"
            class="flex flex-wrap gap-2 justify-center mt-6"
          >
            <Button
              v-for="prompt in quickPrompts"
              :key="prompt"
              size="small"
              @click="inputValue = prompt; sendMessage()"
            >
              {{ prompt }}
            </Button>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex gap-3 mb-5"
            :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
          >
            <!-- 头像 -->
            <div
              class="flex items-center justify-center w-9 h-9 rounded-full shrink-0 text-white text-base"
              :class="msg.role === 'user' ? 'bg-primary' : ''"
              :style="
                msg.role === 'assistant'
                  ? 'background-color: #52c41a'
                  : ''
              "
            >
              <RobotOutlined v-if="msg.role === 'assistant'" />
              <UserOutlined v-else />
            </div>

            <!-- 消息内容 -->
            <div
              class="flex flex-col gap-1.5 max-w-[70%]"
              :class="msg.role === 'user' ? 'items-end' : ''"
            >
              <!-- 消息气泡 -->
              <div
                class="px-4 py-2.5 rounded-lg text-sm leading-relaxed break-words"
                :class="
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100'
                "
              >
                <span
                  v-if="msg.role === 'assistant' && !msg.content && sending"
                  class="italic opacity-45"
                >
                  AI 正在分析...
                </span>
                <span v-else>{{ msg.content }}</span>
              </div>

              <!-- 操作建议卡片 -->
              <div
                v-if="msg.suggestions && msg.suggestions.length > 0"
                class="flex flex-col gap-2 w-full"
              >
                <Card
                  v-for="s in msg.suggestions"
                  :key="s.id"
                  size="small"
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
                  </div>
                  <div class="text-xs opacity-45 leading-relaxed mb-2">
                    {{ s.description }}
                  </div>
                  <div class="flex justify-end">
                    <Button
                      v-if="!s.executed"
                      type="primary"
                      size="small"
                      @click="executeSuggestion(msg.id, s)"
                    >
                      执行
                    </Button>
                    <Tag v-else color="green" :bordered="false" size="small">
                      <CheckCircleOutlined /> 已执行
                    </Tag>
                  </div>
                </Card>
              </div>

              <div class="text-xs opacity-35">
                {{ formatTime(msg.createTime) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="flex gap-2 px-4 py-3 border-t border-gray-100">
          <Input.TextArea
            v-model:value="inputValue"
            placeholder="输入你的问题，如：今天巨量的消耗情况如何？帮我关停ROI低于0.5的计划"
            :auto-size="{ minRows: 1, maxRows: 4 }"
            :disabled="sending"
            @keyup="onKeyup"
          />
          <Button
            type="primary"
            :icon="SendOutlined"
            :loading="sending"
            :disabled="!inputValue.trim()"
            @click="sendMessage"
          />
        </div>
      </Card>
    </div>
  </Page>
</template>

<style scoped lang="scss">
.session-card {
  width: 280px;
  flex-shrink: 0;

  :deep(.ant-card-body) {
    padding: 0;
    overflow-y: auto;
    max-height: calc(100vh - 220px);
  }
}

.chat-card {
  display: flex;
  flex-direction: column;

  :deep(.ant-card-body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0;
    overflow: hidden;
  }
}
</style>
