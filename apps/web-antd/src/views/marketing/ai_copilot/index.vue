<script setup lang="ts" name="AiCopilot">
import type { ChatMessage, ChatSession, ChatSuggestion, ToolRecord } from "#/api/models/ai_chat";

/**
 * AI 投手对话助手（redesigned chat layout）
 *
 * 布局：整页锁高（Page auto-content-height），左会话 Card + 右对话 Card 各自内部滚动，
 *      输入区吸附底部。组件全部使用 ant-design-vue（Card/List/Input/Avatar/Button/
 *      Tag/Empty/Spin/Progress/Modal/Tooltip）；仅保留必要的布局高度链样式。
 * 风格：消息流参照主流 AI 对话界面——用户消息右侧彩色气泡、AI 消息左侧头像+内容流，
 *      执行记录/建议以 antd Card 平铺，hover 提供复制；light/dark 使用项目语义色自动适配。
 */
import { computed, nextTick, onMounted, ref } from "vue";

import { Page } from "@vben/common-ui";

import {
  ArrowDownOutlined,
  BarChartOutlined,
  BuildOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CommentOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  RedoOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  ThunderboltOutlined,
  UserOutlined
} from "@ant-design/icons-vue";
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
  Tooltip
} from "ant-design-vue";

import { aiChatApi } from "#/api/core";

// ==================== 平台文案 ====================

const PLATFORM_MAP: Record<string, string> = {
  bytedance: "巨量",
  oppo: "OPPO",
  tencent: "腾讯",
  vivo: "VIVO",
  huawei: "华为",
  rednote: "小红书"
};

function platformText(p?: string): string {
  return (p && PLATFORM_MAP[p]) || p || "";
}

/**
 * 会话列表平台圆点色：取色语义与项目既有 platformColor（blue/green/orange/purple/red）保持一致，
 * 仅把 Tag 换成小圆点以降低列表视觉噪音。
 */
const PLATFORM_DOT_COLOR: Record<string, string> = {
  bytedance: "#1677ff",
  huawei: "#f5222d",
  oppo: "#fa8c16",
  rednote: "#eb2f96",
  tencent: "#52c41a",
  vivo: "#722ed1"
};

function platformDotColor(p?: string): string {
  return (p && PLATFORM_DOT_COLOR[p]) || "hsl(var(--muted-foreground))";
}

// ==================== 会话管理 ====================

const sessions = ref<ChatSession[]>([]);
const currentSessionId = ref<string>("");
const loadingSessions = ref(false);
const sessionKeyword = ref("");

async function loadSessions(keyword?: string) {
  loadingSessions.value = true;
  try {
    const res = await aiChatApi.fetchSessions({
      page: 1,
      pageSize: 50,
      keyword: keyword ?? sessionKeyword.value
    });
    sessions.value = res.items || [];
    // 当前会话被过滤掉时，自动切到第一条
    if (
      currentSessionId.value &&
      !sessions.value.some((s) => s.id === currentSessionId.value)
    ) {
      currentSessionId.value = "";
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
    sessionKeyword.value = "";
  } catch {
    await message.error("创建会话失败");
  }
}

async function deleteSession(id: string) {
  Modal.confirm({
    title: "删除会话",
    content: "删除后该会话及消息将不可恢复，确定删除吗？",
    okText: "删除",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        await aiChatApi.fetchDeleteSession(id);
        sessions.value = sessions.value.filter((s) => s.id !== id);
        if (currentSessionId.value === id) {
          currentSessionId.value = "";
          messages.value = [];
        }
        await message.success("已删除");
        // 删除后自动切到第一条会话
        if (sessions.value.length > 0) {
          const firstId = sessions.value[0]?.id;
          if (firstId) {
            await selectSession(firstId);
          }
        }
      } catch {
        await message.error("删除失败");
      }
    }
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
  return session?.title || (currentSessionId.value ? "对话中" : "AI 投放助手");
});

// ==================== 消息管理 ====================

const messages = ref<ChatMessage[]>([]);
const loadingMessages = ref(false);
const inputValue = ref("");
const sending = ref(false);

/** 输入框占位：等待 AI 回复期间输入框被锁定，给出等待提示 */
const composerPlaceholder = computed(() =>
  sending.value
    ? "AI 正在回复，请稍候…"
    : "描述你的投放需求，例如：查看今天巨量各账户消耗…"
);

const messageScrollRef = ref<HTMLElement>();

/** 是否贴近消息底部（>=该距离才自动滚动，向上翻阅时不打扰） */
const BOTTOM_TOLERANCE = 80;

async function loadMessages(sessionId: string) {
  loadingMessages.value = true;
  try {
    messages.value = await aiChatApi.fetchMessages(sessionId);
    await scrollToBottom(true);
  } finally {
    loadingMessages.value = false;
  }
}

/** 发送输入框内容 */
async function sendMessage() {
  await sendText(inputValue.value);
}

/** 核心发送：追加用户消息 → 请求 AI → 刷新 */
async function sendText(rawContent: string) {
  const content = (rawContent || "").trim();
  if (!content || sending.value) return;

  if (!currentSessionId.value) {
    await message.warning("请先创建会话");
    return;
  }

  const sessionId = currentSessionId.value;
  const now = Date.now();
  const userMsg: ChatMessage = {
    id: `temp_user_${now}`,
    sessionId,
    role: "user",
    content,
    createTime: new Date().toISOString()
  };
  const aiMsgPlaceholder: ChatMessage = {
    id: `temp_ai_${now}`,
    sessionId,
    role: "assistant",
    content: "",
    createTime: new Date().toISOString()
  };

  messages.value.push(userMsg, aiMsgPlaceholder);
  // 发送即刻清空输入框，并进入锁定态（模板 :disabled="sending"），待 AI 回复后再解锁
  inputValue.value = "";
  sending.value = true;
  await scrollToBottom(true);

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
      if (session.title === "新对话") {
        session.title = content.slice(0, 20);
      }
    }
    await scrollToBottom();
  } catch {
    messages.value = messages.value.filter(
      (m) => m.id !== aiMsgPlaceholder.id
    );
    await message.error("AI 回复失败，请重试");
  } finally {
    sending.value = false;
    // 解锁后回焦输入框，便于直接继续下一轮问答
    await nextTick();
    composerRef.value?.focus();
  }
}

// ==================== 工具方法 ====================

/** 滚动到消息底部；force=false 且用户远离底部时不打扰 */
async function scrollToBottom(force = false) {
  await nextTick();
  const el = messageScrollRef.value;
  if (!el) return;
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  if (force || distanceToBottom <= BOTTOM_TOLERANCE) {
    el.scrollTop = el.scrollHeight;
  }
}

/** 复制 AI 消息内容 */
async function copyMessage(content: string) {
  if (!content) return;
  try {
    await navigator.clipboard.writeText(content);
    await message.success("已复制");
  } catch {
    await message.error("复制失败");
  }
}

/** 格式化时间：今天显示 HH:mm，跨天显示 MM-DD */
function formatTime(time?: string): string {
  if (!time) return "";
  const d = new Date(time);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (sameDay) return hm;
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${hm}`;
}

/** 执行记录序号（v-for 索引兼容 string/number） */
function recordIndex(i: number | string): number {
  return Number(i) + 1;
}

/** 风险等级样式 */
function riskColor(level: string): string {
  return level === "high" ? "red" : level === "medium" ? "orange" : "green";
}

function riskText(level: string): string {
  return level === "high" ? "高风险" : level === "medium" ? "中风险" : "低风险";
}

/** 执行记录状态文案 */
function recordStatusText(status: string): string {
  const map: Record<string, string> = {
    success: "成功",
    failed: "失败",
    pending: "执行中",
    pending_approval: "待审批",
    skipped: "已跳过"
  };
  return map[status] || status || "";
}

function recordStatusColor(status: string): string {
  const map: Record<string, string> = {
    success: "green",
    failed: "red",
    pending: "blue",
    pending_approval: "orange",
    skipped: "default"
  };
  return map[status] || "default";
}

function onKeyup(e: KeyboardEvent) {
  // 等待 AI 回复期间输入框处于锁定态，忽略回车
  if (sending.value) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

/** 消息滚动时：若贴近底部则保持吸底；否则不打扰阅读 */
function onMessageScroll() {
  const el = messageScrollRef.value;
  if (!el) return;
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  stickToBottom.value = distanceToBottom <= BOTTOM_TOLERANCE;
}

/** 是否吸底（用于发送后是否回到底部） */
const stickToBottom = ref(true);

/** 输入框实例（追问自动聚焦） */
const composerRef = ref<{ focus: () => void }>();

// ==================== 富文本（极简安全渲染，防 XSS：先转义后按白名单解析） ====================

const MD_PLACEHOLDER = "__AI_MD_PLACEHOLDER__";

function escapeHtml(raw: string): string {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

/** 行内解析（粗体/斜体/行内码/链接），输入须已转义 */
function renderInline(text: string): string {
  // 保护行内代码
  const codes: string[] = [];
  let t = text.replace(/`([^`\n]+)`/g, (_m, c: string) => {
    codes.push(c);
    return `${MD_PLACEHOLDER}${codes.length - 1}${MD_PLACEHOLDER}`;
  });
  // 粗体
  t = t.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  // 斜体
  t = t.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  // 链接（仅 http/https）
  t = t.replace(
    /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,
    "<a href=\"$2\" target=\"_blank\" rel=\"noreferrer\">$1</a>"
  );
  // 还原行内码
  t = t.replace(
    new RegExp(`${MD_PLACEHOLDER}(\\d+)${MD_PLACEHOLDER}`, "g"),
    (_m, i: string) => `<code>${codes[Number(i)]}</code>`
  );
  return t;
}

/** 极简 Markdown：代码块/标题/引用/列表/分隔线/行内样式 */
function renderMarkdown(text: string): string {
  if (!text) return "";
  const safe = escapeHtml(text);
  const blocks: string[] = [];

  // 代码块保护
  const body = safe.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    blocks.push(
      `<pre class="md-pre"><div class="md-pre-lang">${lang || "code"}</div><code>${code.replace(/\n$/, "")}</code></pre>`
    );
    return `${MD_PLACEHOLDER}B${blocks.length - 1}${MD_PLACEHOLDER}`;
  });

  const lines = body.split("\n");
  const out: string[] = [];
  let listType = "";
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = "";
    }
  };

  for (const raw of lines) {
    // 块占位（代码块）
    const blockHit = raw.match(
      new RegExp(`^${MD_PLACEHOLDER}B(\\d+)${MD_PLACEHOLDER}$`)
    );
    const blockIdx = blockHit?.[1];
    if (blockHit && blockIdx) {
      closeList();
      const block = blocks[Number(blockIdx)];
      if (block) {
        out.push(block);
      }
      continue;
    }
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h && h[1] && h[2]) {
      closeList();
      const lv = h[1].length;
      out.push(`<h${lv}>${renderInline(h[2])}</h${lv}>`);
      continue;
    }
    // 分隔线
    if (/^(-{3,}|\*{3,})$/u.test(line)) {
      closeList();
      out.push("<hr/>");
      continue;
    }
    // 引用
    if (line.startsWith("&gt;")) {
      closeList();
      out.push(`<blockquote>${renderInline(line.replace(/^&gt;\s?/, ""))}</blockquote>`);
      continue;
    }
    // 列表
    const ul = line.match(/^[-*+]\s+(.*)$/);
    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    const item = (ul || ol)?.[1];
    if (item != null) {
      const type = ul ? "ul" : "ol";
      if (listType !== type) {
        closeList();
        listType = type;
        out.push(`<${type}>`);
      }
      out.push(`<li>${renderInline(item)}</li>`);
      continue;
    }
    // 普通段落
    closeList();
    out.push(`<p>${renderInline(line)}</p>`);
  }
  closeList();
  return out.join("");
}

// ==================== 会话分组 ====================

const SESSION_WEEK_MS = 7 * 24 * 3600 * 1000;

/** 最近(7天内) / 更早 分组 */
const sessionGroups = computed(() => {
  const groups: { key: string; title: string; items: ChatSession[] }[] = [
    { key: "recent", title: "最近", items: [] },
    { key: "earlier", title: "更早", items: [] }
  ];
  const now = Date.now();
  for (const s of sessions.value) {
    const t = s.lastMessageAt ? new Date(s.lastMessageAt).getTime() : now;
    const bucket = now - t <= SESSION_WEEK_MS ? groups[0] : groups[1];
    if (bucket) {
      bucket.items.push(s);
    }
  }
  return groups.filter((g) => g.items.length > 0);
});

/** 当前会话的平台 chip 文案 */
const currentSession = computed(() =>
  sessions.value.find((s) => s.id === currentSessionId.value)
);

// ==================== 话术模板 ====================

interface PromptCard {
  icon: string;
  title: string;
  desc: string;
  prompt: string;
}

const promptCards: PromptCard[] = [
  {
    icon: "bar",
    title: "今日消耗概览",
    desc: "消耗 / 转化 / ROI 一眼看完",
    prompt: "今天各平台消耗情况如何？分别列出消耗、转化数和 ROI。"
  },
  {
    icon: "thunder",
    title: "超成本诊断",
    desc: "自动定位超成本计划并给建议",
    prompt: "哪些计划超成本了？帮我列出并按严重程度给出优化建议。"
  },
  {
    icon: "close",
    title: "低效计划处置",
    desc: "筛选低 ROI / 零展现计划",
    prompt: "查看 ROI 低于 0.8 或零展现的计划有多少，并建议如何处置。"
  },
  {
    icon: "build",
    title: "AI 批量搭建",
    desc: "一句话按账户/预算/素材批量建广告",
    prompt: "帮我在「巨量」用项目下的账户各搭建 10 个计划、每计划 5 个广告，账户日预算 500，CPA 30，素材按产品名检索。"
  }
];

const promptIconMap: Record<string, any> = {
  bar: BarChartOutlined,
  thunder: ThunderboltOutlined,
  close: CloseCircleOutlined,
  build: BuildOutlined
};

function sendPrompt(prompt: string) {
  // 回复期间不接管输入框，避免留下未发送的残留文案
  if (sending.value) return;
  inputValue.value = prompt;
  sendMessage();
}

// ==================== 消息动作 ====================

/** 重新生成：基于上下文再次请求（保留对话记录，模型结合历史重新回答） */
function regenerateMessage() {
  sendText("请重新生成你刚才的回答：基于同样的上下文和条件，补充更完整的数据口径与可执行建议。");
}

/** 追问：把该条消息内容带进输入框，让用户补充提问 */
function askFollowUp(content: string) {
  if (sending.value) return;
  const head = content.length > 60 ? `${content.slice(0, 60)}…` : content;
  inputValue.value = `请针对你上面的「${head}」，进一步说明`;
  composerRef.value?.focus();
}

// ==================== 建议审批 ====================

/** 正在执行的建议 ID（防止重复点击） */
const executingSuggestionId = ref<string>("");

/** 执行进度百分比 */
function execProgress(ds?: any): number {
  if (!ds?.records?.length) return 0;
  if (!ds.totalSteps) return 0;
  return Math.round(((ds.successSteps || 0) / ds.totalSteps) * 100);
}

/** 执行进度状态 */
function execProgressStatus(ds?: any): "active" | "exception" | "success" {
  if (!ds?.records?.length) return "active";
  const failed = ds.records.filter((r: ToolRecord) => r.status === "failed").length;
  if (failed > 0) return "exception";
  return "success";
}

/** 确认执行建议 */
async function handleConfirmSuggestion(msg: ChatMessage, suggestion: ChatSuggestion) {
  if (executingSuggestionId.value) return;
  executingSuggestionId.value = suggestion.id;
  try {
    const res = await aiChatApi.fetchExecuteSuggestion({
      messageId: msg.id!,
      suggestionId: suggestion.id,
      action: "confirm"
    });
    // 更新本地建议状态
    suggestion.executed = true;
    suggestion.status = "executed";
    suggestion.execResult = res.message;
    message.success(res.message || "执行成功");
  } catch {
    message.error("执行失败，请重试");
  } finally {
    executingSuggestionId.value = "";
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
      action: "cancel"
    });
    suggestion.executed = false;
    suggestion.status = "cancelled";
    message.info("已取消该建议");
  } catch {
    message.error("取消失败，请重试");
  } finally {
    executingSuggestionId.value = "";
  }
}

onMounted(() => {
  loadSessions();
});
</script>

<template>
  <Page auto-content-height>
    <div class="chat-root">
      <!-- ==================== 左：会话列表（固定，内部滚动） ==================== -->
      <Card class="session-card" :bordered="false">
        <div class="session-head">
          <span class="brand-logo">
            <RobotOutlined />
          </span>
          <div class="brand-meta">
            <div class="brand-title">AI 投放助手</div>
            <div class="brand-sub">共 {{ sessions.length }} 个会话</div>
          </div>
        </div>

        <div class="session-pad">
          <Button class="btn-new" @click="createSession">
            <template #icon>
              <PlusOutlined />
            </template>
            新建对话
          </Button>

          <Input
            v-model:value="sessionKeyword"
            class="session-search"
            placeholder="搜索会话"
            allow-clear
            @change="handleSearch"
            @press-enter="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>

          <div class="session-scroll vben-scrollbar">
            <Spin :spinning="loadingSessions">
              <template v-for="group in sessionGroups" :key="group.key">
                <div class="session-group-title">{{ group.title }}</div>
                <List
                  :data-source="group.items"
                  size="small"
                  :split="false"
                >
                  <template #renderItem="{ item }">
                    <ListItem
                      class="session-item"
                      :class="{ 'session-item-active': item.id === currentSessionId }"
                      @click="selectSession(item.id)"
                    >
                      <div class="session-item-main">
                        <div class="session-item-title">
                          <span class="session-item-name">{{ item.title || "新对话" }}</span>
                          <span
                            v-if="item.platform"
                            class="session-item-dot"
                            :style="{ background: platformDotColor(item.platform) }"
                            :title="platformText(item.platform)"
                          ></span>
                        </div>
                        <div class="session-item-meta">
                          <span>{{ item.messageCount || 0
                            }} 条消息 · {{ formatTime(item.lastMessageAt) }}</span>
                        </div>
                      </div>
                      <Tooltip title="删除会话">
                        <Button
                          type="text"
                          size="small"
                          danger
                          class="session-item-del"
                          @click.stop="deleteSession(item.id)"
                        >
                          <template #icon>
                            <DeleteOutlined />
                          </template>
                        </Button>
                      </Tooltip>
                    </ListItem>
                  </template>
                </List>
              </template>
              <Empty
                v-if="!loadingSessions && sessions.length === 0"
                description="暂无会话，点上方新建"
              />
            </Spin>
          </div>
        </div>
      </Card>

      <!-- ==================== 右：对话区（固定，消息内部滚动） ==================== -->
      <Card class="chat-card" :bordered="false">
        <!-- 标题栏：上下文条（固定） -->
        <div class="chat-head">
          <span class="chat-head-logo">
            <RobotOutlined />
          </span>
          <div class="chat-head-meta">
            <span class="chat-head-title">{{ currentSessionTitle }}</span>
            <span class="chat-head-sub">
              <template v-if="messages.length > 0">
                {{ messages.length }} 条消息
              </template>
              <template v-else>新对话 · 随时开始</template>
            </span>
          </div>
          <div class="chat-head-actions">
            <Tag
              v-if="currentSession?.platform"
              color="blue"
              :bordered="false"
              class="head-platform"
            >
              {{ platformText(currentSession.platform) }}
            </Tag>
            <Tooltip title="新对话">
              <Button type="text" class="head-icon-btn" @click="createSession">
                <template #icon>
                  <PlusOutlined />
                </template>
              </Button>
            </Tooltip>
          </div>
        </div>

        <!-- 消息流（仅此滚动） -->
        <div
          ref="messageScrollRef"
          class="message-scroll vben-scrollbar"
          @scroll="onMessageScroll"
        >
          <!-- 空状态 + 快捷提问 -->
          <div v-if="messages.length === 0 && !loadingMessages" class="chat-welcome">
            <span class="chat-welcome-logo">
              <RobotOutlined />
            </span>
            <div class="chat-welcome-title">你好，我是 AI 投放助手</div>
            <div class="chat-welcome-sub">
              一句话查数据、诊断计划、批量操作、搭建广告
            </div>
            <div class="chat-welcome-cards">
              <Card
                v-for="card in promptCards"
                :key="card.title"
                :bordered="false"
                class="prompt-card"
                role="button"
                tabindex="0"
                @click="sendPrompt(card.prompt)"
                @keydown.enter.prevent="sendPrompt(card.prompt)"
                @keydown.space.prevent="sendPrompt(card.prompt)"
              >
                <div class="prompt-card-icon">
                  <component :is="promptIconMap[card.icon]" />
                </div>
                <div class="prompt-card-body">
                  <div class="prompt-card-title">{{ card.title }}</div>
                  <div class="prompt-card-desc">{{ card.desc }}</div>
                </div>
              </Card>
            </div>
          </div>

          <Spin v-if="loadingMessages" class="mt-4" />

          <!-- 消息列表 -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="msg-row"
            :class="msg.role === 'user' ? 'msg-row-user' : 'msg-row-ai'"
          >
            <Avatar
              :size="30"
              class="msg-avatar"
              :class="msg.role === 'assistant' ? 'msg-avatar-ai' : 'msg-avatar-user'"
            >
              <template #icon>
                <RobotOutlined v-if="msg.role === 'assistant'" />
                <UserOutlined v-else />
              </template>
            </Avatar>

            <div class="msg-main">
              <!-- AI：思考中 / 富文本内容 + 动作组 -->
              <div v-if="msg.role === 'assistant'">
                <span v-if="!msg.content && sending" class="msg-thinking">
                  <span class="msg-thinking-text">正在分析</span>
                  <span class="msg-thinking-dots">
                    <i></i><i></i><i></i>
                  </span>
                </span>
                <div
                  v-else-if="msg.content"
                  class="md"
                  v-html="renderMarkdown(msg.content)"
                ></div>
                <div v-else class="msg-ai-text msg-ai-text-empty"></div>

                <!-- hover 动作组 -->
                <div v-if="msg.content" class="msg-actions">
                  <Tooltip title="复制">
                    <Button type="text" class="msg-act-btn" @click="copyMessage(msg.content)">
                      <template #icon>
                        <CopyOutlined />
                      </template>
                    </Button>
                  </Tooltip>
                  <Tooltip title="重新生成">
                    <Button type="text" class="msg-act-btn" @click="regenerateMessage">
                      <template #icon>
                        <RedoOutlined />
                      </template>
                    </Button>
                  </Tooltip>
                  <Tooltip title="追问">
                    <Button type="text" class="msg-act-btn" @click="askFollowUp(msg.content)">
                      <template #icon>
                        <CommentOutlined />
                      </template>
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <!-- User 气泡 -->
              <div v-else class="msg-user-bubble bg-primary text-primary-foreground">
                {{ msg.content }}
              </div>

              <!-- 执行记录（dataSnapshot.records） -->
              <div
                v-if="msg.dataSnapshot && msg.dataSnapshot.records && msg.dataSnapshot.records.length > 0"
                class="exec-card"
              >
                <div class="exec-head">
                  <span class="exec-head-left">
                    <ThunderboltOutlined />
                    执行记录
                  </span>
                  <span class="exec-pill">
                    {{ msg.dataSnapshot.successSteps || 0
                    }}/{{ msg.dataSnapshot.totalSteps || msg.dataSnapshot.records.length }} 步
                  </span>
                </div>
                <Progress
                  :percent="execProgress(msg.dataSnapshot)"
                  :status="execProgressStatus(msg.dataSnapshot)"
                  :show-info="false"
                  size="small"
                  class="exec-progress"
                />
                <div
                  v-for="(rec, i) in msg.dataSnapshot.records"
                  :key="i"
                  class="exec-record"
                >
                  <span class="exec-record-idx">{{ recordIndex(i) }}.</span>
                  <span class="exec-record-name">{{ rec.stepName || rec.toolName }}</span>
                  <span v-if="rec.duration" class="exec-record-dur">{{ rec.duration }}ms</span>
                  <Tag
                    :color="recordStatusColor(rec.status)"
                    :bordered="false"
                    class="exec-tag"
                  >
                    {{ recordStatusText(rec.status) }}
                  </Tag>
                </div>
              </div>

              <!-- 操作建议 -->
              <div
                v-if="msg.suggestions && msg.suggestions.length > 0"
                class="suggestion-list"
              >
                <Card
                  v-for="s in msg.suggestions"
                  :key="s.id"
                  size="small"
                  class="suggestion-card"
                  :class="`sug-${s.riskLevel}`"
                >
                  <div class="sug-head">
                    <Tag
                      :color="riskColor(s.riskLevel)"
                      :bordered="false"
                      class="sug-tag"
                    >
                      {{ riskText(s.riskLevel) }}
                    </Tag>
                    <span class="suggestion-title">{{ s.title }}</span>
                    <Tag
                      v-if="s.status === 'executed'"
                      color="green"
                      :bordered="false"
                      class="sug-tag"
                    >
已执行
                    </Tag>
                    <Tag
                      v-else-if="s.status === 'cancelled'"
                      color="default"
                      :bordered="false"
                      class="sug-tag"
                    >
已取消
                    </Tag>
                    <Tag
                      v-else-if="s.status === 'failed'"
                      color="red"
                      :bordered="false"
                      class="sug-tag"
                    >
执行失败
                    </Tag>
                  </div>
                  <div class="suggestion-desc">{{ s.description }}</div>
                  <div
                    v-if="s.execResult"
                    class="suggestion-result"
                  >
                    {{ s.execResult }}
                  </div>
                  <div
                    v-if="!s.executed && s.status !== 'cancelled' && s.status !== 'executed'"
                    class="sug-foot"
                  >
                    <Button
                      size="small"
                      :loading="executingSuggestionId === s.id"
                      :disabled="!!executingSuggestionId"
                      @click="handleCancelSuggestion(msg, s)"
                    >
                      <template #icon>
                        <CloseOutlined />
                      </template>
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
                      <template #icon>
                        <CheckOutlined />
                      </template>
                      确认执行
                    </Button>
                  </div>
                </Card>
              </div>

              <div class="msg-time">
                {{ formatTime(msg.createTime) }}
                <span v-if="msg.role === 'assistant'">· AI 投放助手</span>
              </div>
            </div>
          </div>

          <!-- 底部吸底提示 -->
          <div v-if="messages.length > 0 && !stickToBottom" class="scroll-to-bottom-btn">
            <Button class="to-bottom-btn" @click="scrollToBottom(true)">
              <template #icon>
                <ArrowDownOutlined />
              </template>
              回到最新
            </Button>
          </div>
        </div>

        <!-- 输入区（吸附底部）：快捷 chip + 浮起编辑卡片 -->
        <div class="chat-composer">
          <div class="composer-shell">
            <div v-if="messages.length > 0 && !sending" class="composer-chips">
              <button
                v-for="card in promptCards"
                :key="card.title"
                type="button"
                class="composer-chip"
                @click="sendPrompt(card.prompt)"
              >
                {{ card.title }}
              </button>
            </div>
            <div
              class="composer-inner"
              :class="{ 'composer-inner-locked': sending }"
            >
              <Input.TextArea
                ref="composerRef"
                v-model:value="inputValue"
                :placeholder="composerPlaceholder"
                :bordered="false"
                :auto-size="{ minRows: 1, maxRows: 6 }"
                :disabled="sending"
                @keyup="onKeyup"
              />
              <div class="composer-toolbar">
                <span class="composer-tips" :class="{ 'composer-tips-busy': sending }">
                  {{
                    sending
                      ? "AI 正在回复中，请稍候…"
                      : "Enter 发送 · Shift+Enter 换行"
                  }}
                </span>
                <Tooltip title="发送">
                  <Button
                    type="primary"
                    shape="circle"
                    :loading="sending"
                    :disabled="!inputValue.trim()"
                    class="composer-send"
                    @click="sendMessage"
                  >
                    <template #icon>
                      <SendOutlined />
                    </template>
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </Page>
</template>

<style scoped lang="scss">
/* ==================== 整体高度链：页面锁高 → 卡片内滚动 ==================== */
.chat-root {
  display: flex;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  /* 纵深分级（中性阴影统一用黑色低透明度，深浅色都成立）：
     L1 卡片底 / L2 浮层（输入框、粘性条） / L3 悬浮操作（回到最新） */
  --chat-shadow-l1: 0 1px 2px rgb(0 0 0 / 4%);
  --chat-shadow-l2: 0 4px 16px rgb(0 0 0 / 6%);
  --chat-shadow-l3: 0 6px 18px rgb(0 0 0 / 12%);
}

/* 字号层级（全页仅 4 档，靠字重与颜色区分主次）：
   20 主标题 / 14 正文 / 13 次要标题与小正文 / 12 辅助信息 */

/* 两张主卡片统一用 L1 阴影，和以下各层的浮起程度拉开档位 */
.session-card,
.chat-card {
  box-shadow: var(--chat-shadow-l1);
}

/* 项目既有滚动条写法（对齐 VivoCampaign.vue / creativeProduction.vue） */
.vben-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 3px;

    &:hover {
      background: hsl(var(--muted-foreground) / 0.5);
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

/* ---------- 左：会话卡片 ---------- */
.session-card {
  width: 292px;
  flex: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  :deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

/* 顶部品牌区：替代原「对话会话」卡片标题 */
.session-head {
  flex: none;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 14px 12px;
}

.brand-logo {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 9px;
  font-size: 16px;
  color: hsl(var(--primary-foreground));
  background: linear-gradient(140deg, hsl(var(--primary)), hsl(var(--primary) / 0.62));
}

.brand-meta {
  min-width: 0;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: hsl(var(--foreground));
}

.brand-sub {
  margin-top: 3px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.session-pad {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px 12px;
}

/* 新建对话：整行软主色按钮 */
.btn-new {
  width: 100%;
  height: 34px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.09);
  border-color: hsl(var(--primary) / 0.22);

  &:hover {
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.15);
    border-color: hsl(var(--primary) / 0.4);
  }
}

/* 搜索框：无边框灰底，聚焦才出主色描边 */
.session-search {
  :deep(.ant-input-affix-wrapper) {
    padding: 5px 10px;
    background: hsl(var(--muted) / 0.7);
    border-color: transparent;
    border-radius: 8px;
    box-shadow: none;

    &:hover {
      background: hsl(var(--muted));
      border-color: transparent;
    }

    &.ant-input-affix-wrapper-focused {
      background: hsl(var(--background));
      border-color: hsl(var(--primary) / 0.45);
      box-shadow: none;
    }
  }

  :deep(.ant-input) {
    font-size: 13px;
    background: transparent;
  }
}

.session-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;

  :deep(.ant-list) {
    .ant-list-item {
      border-block-end: none !important;
    }
  }
}

.session-item {
  border-radius: 9px;
  cursor: pointer;
  padding: 8px 9px !important;
  transition: background-color 0.15s ease;

  &:hover {
    background: hsl(var(--muted) / 0.7);

    .session-item-del {
      opacity: 1;
    }
  }

  &.session-item-active {
    background: hsl(var(--primary) / 0.1);
  }

  &-main {
    flex: 1;
    min-width: 0;
  }

  &-title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  &-name {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: hsl(var(--foreground));
  }

  &.session-item-active &-name {
    color: hsl(var(--primary));
  }

  /* 平台标识：小圆点降噪，title 悬浮可见平台名 */
  &-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
  }

  &-meta {
    margin-top: 3px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &-del {
    opacity: 0;
    transition: opacity 0.15s ease;
    align-self: flex-start;
  }
}

/* ---------- 右：对话卡片 ---------- */
.chat-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  :deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.chat-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  line-height: 1.25;
  border-bottom: 1px solid hsl(var(--border));

  &-logo {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 9px;
    font-size: 16px;
    color: hsl(var(--primary-foreground));
    background: linear-gradient(140deg, hsl(var(--primary)), hsl(var(--primary) / 0.62));
  }

  &-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &-title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-sub {
    margin-top: 3px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }
}

/* 平台 Tag：压掉 antd 默认右边距 */
.head-platform {
  margin: 0;
}

.head-icon-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: hsl(var(--muted-foreground));
  border-radius: 8px;

  &:hover {
    color: hsl(var(--primary));
    background: hsl(var(--muted));
  }

  &:focus-visible {
    outline: 2px solid hsl(var(--primary) / 0.5);
    outline-offset: 1px;
  }
}

/* 会话分组标题 */
.session-group-title {
  padding: 6px 8px 4px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  user-select: none;
}

/* ---------- 消息滚动区 ---------- */
.message-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px 24px 26px;
  /* 顶部极淡主色光晕：给平面白底一点纵深，深浅色模式都成立 */
  background:
    radial-gradient(120% 60% at 50% 0%, hsl(var(--primary) / 0.05), transparent 60%),
    hsl(var(--background));
  position: relative;
}

/* 居中定宽内容列：对齐主流 AI 对话界面的阅读宽度 */
.message-scroll > * {
  max-width: 880px;
  margin-right: auto;
  margin-left: auto;
}

/* 空状态 + 快捷提问（入场编排：logo → 标题 → 副标题 → 卡片依次上浮） */
.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 46px 0 24px;
  text-align: center;

  &-logo {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 18px;
    font-size: 26px;
    color: hsl(var(--primary-foreground));
    background: linear-gradient(140deg, hsl(var(--primary)), hsl(var(--primary) / 0.55));
    box-shadow: 0 10px 24px hsl(var(--primary) / 0.22);
    animation: chat-rise 0.34s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  &-title {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.2px;
    color: hsl(var(--foreground));
    animation: chat-rise 0.34s cubic-bezier(0.16, 1, 0.3, 1) 60ms backwards;
  }

  &-sub {
    margin-top: 8px;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
    animation: chat-rise 0.34s cubic-bezier(0.16, 1, 0.3, 1) 110ms backwards;
  }
}

/* 单条消息行 */
.msg-row {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  /* fill-mode 用 backwards：动画结束后不占用 transform，避免压掉 :hover 的位移 */
  animation: chat-rise 0.22s ease-out backwards;

  &-user {
    flex-direction: row-reverse;
  }
}

.msg-avatar {
  flex-shrink: 0;

  &-ai {
    color: hsl(var(--primary-foreground));
    background: linear-gradient(140deg, hsl(var(--primary)), hsl(var(--primary) / 0.62));
  }

  &-user {
    color: hsl(var(--muted-foreground));
    background: hsl(var(--muted));
    border: 1px solid hsl(var(--border));
  }
}

.msg-main {
  max-width: min(78%, 900px);
  display: flex;
  flex-direction: column;
  min-width: 0;

  .msg-row-user & {
    align-items: flex-end;
  }
}

/* AI 消息：透明文本流 + hover 复制 */
.msg-ai-text {
  font-size: 14px;
  line-height: 1.75;
  color: hsl(var(--foreground));
  white-space: pre-wrap;
  word-break: break-word;

  &-empty {
    min-height: 20px;
  }
}

/* AI 消息 hover 动作组：图标按钮 */
.msg-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.msg-act-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  color: hsl(var(--muted-foreground));

  &:hover {
    color: hsl(var(--primary));
    background: hsl(var(--muted));
  }

  &:focus-visible {
    outline: 2px solid hsl(var(--primary) / 0.5);
    outline-offset: 1px;
  }
}

.msg-row-ai:hover .msg-actions,
.msg-actions:focus-within {
  opacity: 1;
}

/* 用户气泡 */
.msg-user-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 100%;
}

/* 思考中：灰底胶囊 + 弹性三点 */
.msg-thinking {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  background: hsl(var(--muted) / 0.7);
  border-radius: 12px;

  &-text {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &-dots {
    display: inline-flex;
    gap: 3px;

    i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: hsl(var(--primary));
      animation: msg-blink 1.4s infinite both;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes msg-blink {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* 消息时间戳 */
.msg-time {
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 回到最新 */
.scroll-to-bottom-btn {
  position: sticky;
  bottom: 12px;
  display: flex;
  justify-content: center;
  margin-top: -6px;
  z-index: 2;
}

.to-bottom-btn {
  border-radius: 999px;
  color: hsl(var(--primary));
  box-shadow: var(--chat-shadow-l3);

  &:focus-visible {
    outline: 2px solid hsl(var(--primary) / 0.5);
    outline-offset: 1px;
  }
}

/* 执行记录：灰底圆角块（替代 antd Card，弱化「后台表格感」） */
.exec-card {
  margin-top: 12px;
  padding: 12px 14px;
  background: hsl(var(--muted) / 0.45);
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.exec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.exec-head-left {
  display: flex;
  gap: 7px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.exec-pill {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
}

.exec-progress {
  margin-bottom: 10px;

  :deep(.ant-progress-bg) {
    border-radius: 999px;
  }
}

.exec-record {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;

  &-idx {
    width: 14px;
    flex: none;
    color: hsl(var(--muted-foreground));
  }

  &-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: hsl(var(--foreground));
  }

  &-dur {
    flex-shrink: 0;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
  }
}

.exec-tag {
  flex: none;
  margin: 0;
  font-size: 12px;
}

/* 操作建议：左侧风险色条 */
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 10px;
}

.suggestion-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;

  :deep(.ant-card-body) {
    padding: 12px 14px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
  }

  &.sug-high::before {
    background: hsl(var(--destructive));
  }

  &.sug-medium::before {
    background: hsl(var(--warning));
  }

  &.sug-low::before {
    background: hsl(var(--success));
  }
}

.sug-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sug-tag {
  flex: none;
  margin: 0;
  font-size: 12px;
}

.sug-foot {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 11px;
}

.suggestion-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.suggestion-desc {
  margin-top: 7px;
  font-size: 13px;
  line-height: 1.65;
  color: hsl(var(--muted-foreground));
}

.suggestion-result {
  margin-top: 9px;
  padding: 7px 10px;
  border-radius: 8px;
  background: hsl(var(--muted) / 0.6);
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  word-break: break-all;
}

/* 输入区（吸附底部）：快捷 chip + 浮起编辑卡片 */
.chat-composer {
  flex: none;
  padding: 0 24px 16px;
  background: hsl(var(--background));
}

/* 与消息列同宽（880px），保证输入框与内容左右对齐 */
.composer-shell {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
}

/* 快捷提问 chip：仅在有消息时出现，避免与欢迎卡片重复 */
.composer-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 9px;
  overflow: hidden;
}

.composer-chip {
  flex: none;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: hsl(var(--primary));
    border-color: hsl(var(--primary) / 0.5);
  }

  &:focus-visible {
    outline: 2px solid hsl(var(--primary) / 0.5);
    outline-offset: 1px;
  }
}

.composer-inner {
  padding: 8px 8px 8px 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  background: hsl(var(--card));
  box-shadow: var(--chat-shadow-l2);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus-within {
    border-color: hsl(var(--primary));
    box-shadow:
      0 0 0 3px hsl(var(--primary) / 0.12),
      var(--chat-shadow-l2);
  }

  /* AI 回复中：锁定态 */
  &-locked,
  &-locked:focus-within {
    background: hsl(var(--muted) / 0.45);
    border-color: hsl(var(--primary) / 0.35);
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.08);
  }
}

.composer-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.composer-tips {
  flex: 1;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  user-select: none;

  &-busy {
    color: hsl(var(--primary));
  }
}

.composer-send {
  flex-shrink: 0;
}

/* ==================== 富文本排版（v-html 白名单产物） ==================== */
.md {
  font-size: 14px;
  line-height: 1.75;
  color: hsl(var(--foreground));
  word-break: break-word;

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }

  p {
    margin: 0 0 10px;
  }

  h1,
  h2,
  h3,
  h4 {
    margin: 14px 0 8px;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 {
    font-size: 18px;
  }

  h2 {
    font-size: 16px;
  }

  h3 {
    font-size: 15px;
  }

  h4 {
    font-size: 14px;
  }

  ul,
  ol {
    margin: 0 0 10px;
    padding-left: 22px;
  }

  li {
    margin: 3px 0;
  }

  a {
    color: hsl(var(--primary));
    text-decoration: underline;
  }

  hr {
    margin: 12px 0;
    border: none;
    border-top: 1px solid hsl(var(--border));
  }

  blockquote {
    margin: 0 0 10px;
    padding: 4px 12px;
    border-left: 3px solid hsl(var(--border));
    border-radius: 0 8px 8px 0;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--muted) / 0.35);
  }

  code {
    padding: 1px 6px;
    border-radius: 5px;
    background: hsl(var(--muted));
    font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .md-pre {
    margin: 0 0 10px;
    padding: 10px 12px;
    border: 1px solid hsl(var(--border));
    border-radius: 10px;
    background: hsl(var(--muted) / 0.5);
    overflow-x: auto;

    .md-pre-lang {
      margin-bottom: 6px;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    code {
      padding: 0;
      background: transparent;
    }
  }
}

/* ==================== 欢迎区模板卡片 ==================== */
.chat-welcome-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 660px;
  margin-top: 30px;
  text-align: left;
}

/* 模板卡片：接续副标题错峰入场（第 4 个编排点） */
.chat-welcome-cards > * {
  animation: chat-rise 0.34s cubic-bezier(0.16, 1, 0.3, 1) 160ms backwards;

  &:nth-child(2) {
    animation-delay: 200ms;
  }

  &:nth-child(3) {
    animation-delay: 240ms;
  }

  &:nth-child(4) {
    animation-delay: 280ms;
  }
}

.prompt-card {
  cursor: pointer;
  border: 1px solid hsl(var(--border)) !important;
  border-radius: 12px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &:hover {
    border-color: hsl(var(--primary) / 0.55) !important;
    box-shadow: 0 6px 18px hsl(var(--primary) / 0.1);
    transform: translateY(-2px);
  }

  /* 键盘聚焦：与 hover 同款反馈 + 主色焦点环 */
  &:focus-visible {
    border-color: hsl(var(--primary) / 0.55) !important;
    outline: 2px solid hsl(var(--primary) / 0.5);
    outline-offset: 2px;
  }

  :deep(.ant-card-body) {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 14px;
  }

  &-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    font-size: 17px;
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.1);
  }

  &-body {
    min-width: 0;
  }

  &-title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }
}

/* ==================== 动效：入场编排 + 降级 ==================== */
@keyframes chat-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 系统开启「减少动态效果」时：取消入场动画与所有过渡 */
@media (prefers-reduced-motion: reduce) {
  .chat-welcome-logo,
  .chat-welcome-title,
  .chat-welcome-sub,
  .chat-welcome-cards > *,
  .msg-row,
  .msg-thinking-dots i {
    animation: none !important;
  }

  * {
    transition-duration: 0ms !important;
  }
}
</style>
