# 智能投放中台 — 阶段 0（Agent 运行时骨架）前后端开发计划

> 交付对象：后端团队（starfiread 工程）
> 配合方式：后端按本计划实现 `/platform/ai_chat/*` 接口与 Agent 运行时；前端 ai_copilot 页面已就绪，联调时对齐契约
> 依据：`DEVELOPMENT_PLAN.md`（阶段 0：P0 搭架子）+ `PRODUCT_DESIGN_V3.md`（全链路 AI 托管投放）
> 日期：2026-08-15

---

## 一、背景与目标

前端 AI 投手助手（`ai_copilot` 页面）已完成开发，调用 `/platform/ai_chat/*` 接口，但**后端接口全部为空**，页面当前不可用。

本阶段目标（里程碑 M1 的前置）：
1. 打通「会话 → 发送消息 → AI 意图解析 → 规划 → 工具执行 → 回复（含操作建议）」全链路
2. 搭建 Agent 运行时骨架：**Tool 注册中心 / 意图解析 / 任务规划器 / 执行器 / 护栏 / LLM 客户端**
3. 先以低风险只读 Tool 验证链路，为阶段 1（一句话创建广告）铺路

三个硬要求（与 DEVELOPMENT_PLAN 一致）：
- **Tool 注册中心**：每个 Tool 声明 schema（名称/入参/出参/权限/风险等级），AI 只能调用已注册 Tool
- **意图 schema 化**：自然语言 → 结构化 JSON（动作/目标/平台/产品/预算/KPI），动作集收敛，LLM 只填槽不自由发挥
- **护栏内置**：风险分级（创建=低、改价=中、关停=高），高敏操作默认人工确认，全程审计

---

## 二、技术选型

| 项 | 方案 | 说明 |
|---|---|---|
| AI 框架 | **Spring AI**（`spring-ai-starter-model-deepseek` 1.1.x） | Spring AI 官方 DeepSeek starter，原生支持 Function Calling / `@Tool` 工具调用 |
| 模型供应商 | **DeepSeek**（`https://api.deepseek.com`） | 模型：`deepseek-chat`（对话） / `deepseek-reasoner`（推理）；需 api-key |
| 后端 | Java 21 / Spring Boot 3.5.11 / MyBatis-Plus / tangzc 自动建表 / MapStruct / hutool | 沿用 turbo 模块现有风格 |
| 前端 | Vue3 / AntD / vben 框架，复用 `ai_copilot` 页面 | 需新增：执行进度卡片、审批确认按钮、SSE 流式展示 |

> 依赖提示：`spring-ai-starter-model-deepseek` 发布在 Maven Central / Spring 官方仓库；项目需引入 `spring-ai-bom` 统一版本，并视需要配置 Spring 官方仓库（`https://repo.spring.io/release`）。

---

## 三、接口契约（前端已定义，后端按此实现）

> 响应统一走 `R` 包装：`{ code: 0, data: ..., message: "success" }`（`@ResponseResult` + `R.autoData`）
> Controller 路径用 `@RequestMapping("ai_chat")`（与 `ai_hosting` 一致；网关带 `/platform` 前缀）

### 3.1 会话列表
- `GET /ai_chat/sessions?page=1&pageSize=50`
- 响应 data：
```json
{
  "items": [ { "id": 1, "title": "新对话", "platform": "bytedance", "advertiserId": "176..." , "messageCount": 2, "lastMessageAt": "2026-08-15 10:00:00", "createTime": "..." } ],
  "page": 1,
  "pageSize": 50,
  "total": 1
}
```

### 3.2 创建会话
- `POST /ai_chat/session/create`，请求体：`{ "platform"?, "advertiserId"?, "title"? }`
- 响应 data：会话对象（同 3.1 item）

### 3.3 删除会话（软删）
- `POST /ai_chat/session/delete`，请求体：`{ "sessionId": 1 }`
- 返回 `R.success()`

### 3.4 消息历史
- `GET /ai_chat/messages?sessionId=1`
- 响应 data：消息数组
```json
[ { "id": 1, "sessionId": 1, "role": "user", "content": "今天巨量消耗如何？", "createTime": "..." } ]
```

### 3.5 发送消息（核心，非流式）
- `POST /ai_chat/send`，请求体：`{ "sessionId": 1, "content": "帮我查一下今天巨量的消耗", "context"?: ChatMessage[] }`
- 后端处理：保存 user 消息 → 意图解析 → 规划 → 执行 → 生成回复 → 保存 assistant 消息 → 返回
- 响应 data：assistant 消息
```json
{
  "id": 2,
  "sessionId": 1,
  "role": "assistant",
  "content": "已查询今日巨量消耗，总计 ¥1,234…",
  "suggestions": [ {
    "id": "sug_1",
    "type": "view_report",
    "title": "查看巨量报表详情",
    "description": "跳转统一看板查看明细",
    "params": { "platform": "bytedance" },
    "riskLevel": "low",
    "executed": false
  } ],
  "dataSnapshot": { "intent": "query_report", "records": [ { "stepName": "查询报表", "toolName": "query_report", "status": "success" } ] },
  "createTime": "..."
}
```

### 3.6 执行操作建议
- `POST /ai_chat/suggestion/execute`，请求体即 `ChatSuggestion` 对象（含 type/params/riskLevel）
- 后端：按 suggestion.type 找到对应 Tool 执行，返回 `R.success()`

### 3.7 流式对话（可选，SSE，后续迭代）
- `GET /ai_chat/stream?sessionId=1&content=xxx`
- 事件类型 `StreamEvent`：`message | suggestion | data | done | error`（本期可只做非流式，前端 send 用非流式即可）

---

## 四、数据库设计（tangzc 自动建表）

### 4.1 `ai_chat_session` AI 对话会话表
| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT | 主键 |
| title | VARCHAR(128) | 会话标题（取首条消息摘要，缺省"新对话"） |
| platform | VARCHAR(32) | 关联平台（bytedance/oppo/tencent/vivo/huawei） |
| advertiser_id | VARCHAR(64) | 关联账户ID |
| last_message_at | DATETIME | 最后消息时间 |
| message_count | INT | 消息数量（默认 0） |
| 公共字段 | — | created_by/create_time/updated_by/update_time/status/del/main_id/org_id/org_code（继承 BaseEntity/OMEntity） |

### 4.2 `ai_chat_message` AI 对话消息表
| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT | 主键 |
| session_id | BIGINT | 会话ID |
| role | VARCHAR(16) | user/assistant/system |
| content | TEXT | 消息内容 |
| suggestions | JSON | AI 操作建议列表（ChatSuggestion[]） |
| data_snapshot | JSON | 投放数据快照/执行记录 |
| 公共字段 | — | 同上 |

> 实体放 `aegis-module-starfiread-common` 的 `infrastructure/entity`，用 `@Table` + `@AutoMapper` 自动建表并生成 Mapper。

---

## 五、后端模块结构（turbo，DDD 分层）

```
aegis-module-starfiread-turbo
└── src/main/java/com/aegis/m3x/starfiread/turbo
    ├── ai_chat/                              # 对话 API（新增，风格参照 aihosting）
    │   ├── api/AiChatController.java
    │   ├── application/AiChatApplication.java
    │   │   └── request/CreateSessionRequest.java / SendMessageRequest.java
    │   └── domain/AiChatDomain.java
    │       ├── converter/AiChatConverter.java        (MapStruct)
    │       └── response/AiChatSessionItem / AiChatMessageItem / AiChatSuggestionItem / StreamEvent
    ├── agent/                                 # Agent 运行时（新增，核心）
    │   ├── tool/                              # 0.1 Tool 注册中心
    │   │   ├── ToolDefinition.java            (name/desc/入参schema/出参schema/权限/风险等级)
    │   │   ├── ToolExecutor.java              (接口: execute(ToolContext))
    │   │   ├── ToolRegistry.java              (注册表: 名称→执行器, schema 索引)
    │   │   ├── ToolExecuteResult.java
    │   │   └── impl/QueryReportTool.java, AssetSearchTool.java   (首批示例 Tool)
    │   ├── intent/                            # 0.2 意图解析
    │   │   ├── IntentType.java                (枚举收敛: create_ad/query_asset/query_report/control_ad/generate_report/chat)
    │   │   ├── IntentParseResult.java         (intent + slots JSON)
    │   │   └── IntentParser.java              (Spring AI Alibaba 填槽)
    │   ├── plan/                              # 0.3 任务规划器
    │   │   ├── PlanStep.java
    │   │   └── TaskPlanner.java               (意图→工作流模板)
    │   ├── executor/                          # 0.4 执行器
    │   │   ├── ExecutionRecord.java           (tool/入参/出参/耗时/状态/风险)
    │   │   └── AgentExecutor.java             (逐步执行/失败重试/中断/回滚)
    │   ├── guardrail/                         # 0.4 护栏
    │   │   └── Guardrail.java                 (风险分级+审批判定+审计)
    │   └── llm/                               # 0.6 LLM 客户端（Spring AI Alibaba）
    │       └── LlmClient.java                 (封装 ChatClient: 系统提示/历史上下文/流式)
    └── infrastructure/repository/
        ├── AiChatSessionRepository.java
        └── AiChatMessageRepository.java
```

---

## 六、Agent 运行时设计要点（后端实现参考）

### 6.1 意图 schema 收敛（LLM 只填槽）
动作集固定为 6 个意图，LLM 输出 JSON 填槽，禁止自由发挥：

| IntentType | 触发示例 | 关键 slots |
|---|---|---|
| create_ad | "帮我创建一条巨量广告，预算500" | platform / product / budget / kpi |
| query_asset | "查一下有哪些高CTR素材" | platform / asset_type / keyword |
| query_report | "今天巨量消耗多少" | platform / advertiser_id / date |
| control_ad | "关停ROI最低的计划" | platform / ad_id / action(pause/bid/budget) |
| generate_report | "出一份本周复盘报告" | platform / date_range |
| chat | 其他兜底 | — |

### 6.2 任务规划器（确定性优先）
工作流模板化，而非让 LLM 自由规划。示例：
- `create_ad` 模板 = 选素材 → 选文案 → 选定向 → 构建参数 → 配置监测 → 创建广告
- `query_report` 模板 = 查询报表 → 汇总摘要
- 每步映射到已注册 Tool，参数从 slots 注入

### 6.3 执行器 + 护栏
- 每步生成 `ExecutionRecord`（tool/入参/出参/耗时/状态），前端可展示进度
- 护栏判定：风险等级 = 创建(低)/改价(中)/关停(高)；高风险步默认置为「待人工确认」，返回 suggestion 由前端确认后执行
- 全程审计：执行记录写入 message.dataSnapshot

### 6.4 LLM 客户端（Spring AI + DeepSeek）
- 依赖：`org.springframework.ai:spring-ai-starter-model-deepseek:1.1.x` + `spring-ai-bom` 版本管理
- 配置：
```yaml
spring:
  ai:
    deepseek:
      base-url: https://api.deepseek.com
      api-key: ${DEEPSEEK_API_KEY}
      chat:
        options:
          model: deepseek-chat   # 或 deepseek-reasoner
```
- 用 `ChatClient.Builder` + `@Tool` 注解方法（QueryReportTool/AssetSearchTool 等）注册为 Function Callback
- 上下文：取该 session 最近 N 条消息注入
- 兜底：模型不可用时降级为规则解析（关键词→意图），保证链路可测

---

## 七、前端配合点（前端工程师负责，后端只对齐契约）

1. `ai_copilot` 页面已实现：会话列表 / 消息流 / 快捷提问 / 建议执行按钮 —— **无需重构**，仅联调字段
2. 待增强（阶段 0.6）：
   - 执行进度卡片：展示 `dataSnapshot.records` 逐步状态（进行中/成功/失败/待审批）
   - 审批确认：高风险 suggestion 点击"执行"前二次确认（`Modal.confirm`）
   - SSE 流式接入：`fetchStreamUrl` 消费 `StreamEvent`（可放二期）

---

## 八、任务拆解与执行顺序

| 步骤 | 任务 | 负责 | 产出 | 验证 |
|---|---|---|---|---|
| 1 | 数据层：建表 + 会话/消息 CRUD | 后端 | ai_chat_session/message 表 + Repository | 前端会话列表/消息历史可通 |
| 2 | Tool 注册中心 + 意图解析 + 规划器 | 后端 | agent/tool + intent + plan | 单元可测：意图→规划→Tool 注册表 |
| 3 | 执行器 + 护栏 + send 接口 | 后端 | agent/executor + guardrail + `/ai_chat/send` | 发送"查消耗"得到结构化回复 |
| 4 | 首批示例 Tool 落地 | 后端 | QueryReportTool / AssetSearchTool（只读） | 回复含真实数据摘要 |
| 5 | 前端升级 | 前端 | 执行卡片 + 审批确认 | 端到端对话含进度展示 |
| 6 | 联调 + 验收 | 前后端 | — | 低风险查询全链路成功；高风险停在审批 |

## 九、验收标准（阶段 0）
1. 前端可在 ai_copilot 新建会话、发消息、收到 AI 回复与操作建议
2. 低风险意图（query_report/query_asset）全自动执行并展示执行记录
3. 高风险操作（control_ad 等）默认停在"待人工确认"，确认后才执行
4. Tool 只能调用注册中心内已注册的 Tool，未注册名称直接拒绝
5. 全链路可审计：执行记录可回溯

## 十、风险与注意事项
1. **api-key 依赖**：DeepSeek key 未配置时功能不可用 → 先做规则解析降级，保证链路可联调
2. **依赖拉取**：`spring-ai-starter-model-deepseek` 需引入 `spring-ai-bom` 并配置 Spring 官方仓库（或中央仓库），否则无法下载
3. **SSE**：本期可做非流式（前端 send 已是非流式调用），流式二期补充
4. **模型质量**：意图填槽可能不准 → 严守 schema + 工作流模板，LLM 只填槽
