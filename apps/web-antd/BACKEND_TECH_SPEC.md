# 第三代AI广告营销中台 — 后端技术实现方案

> 供后端团队参照实现，前端代码已就绪，后端按本文档出接口即可联通。

---

## 一、总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端（已完成）                           │
│  统一数据看板 │ AI智能托管 │ 素材智能分析 │ AI投手对话         │
└──────────┬──────────────────────────────────────────────────┘
           │ HTTP API
┌──────────▼──────────────────────────────────────────────────┐
│                    Java 后端 (aegis-m3x)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ 看板聚合  │ │ 托管引擎  │ │ 素材分析  │ │ AI决策服务(LLM) │  │
│  │ Service  │ │ Service  │ │ Service  │ │                │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│       │            │            │               │            │
│  ┌────▼────────────▼────────────▼───────────────▼────────┐  │
│  │              平台API适配层 (巨量/腾讯/OPPO/VIVO/华为)    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│              Python Airflow (turbo_airflow)                  │
│        定时同步各平台投放数据 → 数据仓库 (MySQL/ClickHouse)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、服务前缀约定

所有新增接口统一挂载在以下服务前缀下，前端 `BaseApi` 会自动拼接：

| 模块 | 服务前缀 | 说明 |
|------|----------|------|
| 统一数据看板 | `/platform/dashboard` | 跨平台投放数据聚合 |
| AI智能托管 | `/platform/ai_hosting` | 托管任务+规则+日志+AI决策 |
| 素材智能分析 | `/platform/material_analysis` | 素材效果分析+标签+生命周期 |

> 微服务模式 (`VITE_MICRO_SERVICE=true`) 下，完整路径为 `{gateway}/{servicePrefix}/{endpoint}`。
> 非微服务模式下，路径为 `{baseUrl}/{endpoint}`（去掉第一段 service 前缀）。

---

## 三、数据库模型

### 3.1 统一数据看板

看板数据来源于 Airflow 同步的投放数据表，无需新建业务表，只需写聚合查询SQL。

**依赖的已有数据表（Airflow 同步）：**

```sql
-- 投放数据表（各平台统一格式，由 Airflow 同步）
-- 表名建议：ad_report_data
CREATE TABLE IF NOT EXISTS ad_report_data (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    platform        VARCHAR(32)   NOT NULL COMMENT '平台标识: bytedance/tencent/oppo/vivo/huawei_store',
    advertiser_id   VARCHAR(64)   NOT NULL COMMENT '广告主ID',
    advertiser_name VARCHAR(128)  COMMENT '广告主名称',
    ad_id           VARCHAR(64)   COMMENT '计划/广告ID',
    ad_name         VARCHAR(256)  COMMENT '计划/广告名称',
    material_id     VARCHAR(64)   COMMENT '素材ID',
    material_name   VARCHAR(256)  COMMENT '素材名称',
    material_type   VARCHAR(16)   COMMENT '素材类型: video/image',
    thumbnail_url   TEXT          COMMENT '缩略图URL',
    stat_date       DATE          NOT NULL COMMENT '统计日期',
    ad_cost         BIGINT        DEFAULT 0 COMMENT '消耗(分)',
    ad_show         BIGINT        DEFAULT 0 COMMENT '曝光',
    ad_click        BIGINT        DEFAULT 0 COMMENT '点击',
    ad_convert      BIGINT        DEFAULT 0 COMMENT '转化数',
    ad_pay          BIGINT        DEFAULT 0 COMMENT '转化金额(分)',
    ctr             DECIMAL(8,4)  DEFAULT 0 COMMENT '点击率',
    cvr             DECIMAL(8,4)  DEFAULT 0 COMMENT '转化率',
    cpa             BIGINT        DEFAULT 0 COMMENT 'CPA(分)',
    roi             DECIMAL(10,4) DEFAULT 0 COMMENT 'ROI',
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_platform_date (platform, stat_date),
    INDEX idx_advertiser (advertiser_id, stat_date),
    INDEX idx_material (material_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投放数据表(Airflow同步)';
```

**告警表：**

```sql
CREATE TABLE IF NOT EXISTS ai_alert (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    type            VARCHAR(32)   NOT NULL COMMENT '告警类型: over_cost/empty_spend/budget_limit/material_decline/account_anomaly',
    level           VARCHAR(16)   NOT NULL DEFAULT 'warning' COMMENT '级别: info/warning/error',
    title           VARCHAR(256)  NOT NULL COMMENT '告警标题',
    content         TEXT          COMMENT '告警内容',
    platform        VARCHAR(32)   COMMENT '平台',
    advertiser_id   VARCHAR(64)   COMMENT '广告主ID',
    advertiser_name VARCHAR(128)  COMMENT '广告主名称',
    status          VARCHAR(16)   NOT NULL DEFAULT 'unread' COMMENT '状态: unread/read/resolved',
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能告警表';
```

### 3.2 AI智能托管

```sql
-- 托管任务表
CREATE TABLE IF NOT EXISTS ai_hosting_task (
    name            VARCHAR(128)  NOT NULL COMMENT '任务名称',
    platform        VARCHAR(32)   NOT NULL COMMENT '平台',
    execution_mode  VARCHAR(16)   NOT NULL DEFAULT 'auto' COMMENT '执行模式: auto/manual/hybrid',
    advertiser_ids  JSON          COMMENT '托管账户ID列表 ["id1","id2"]',
    project_id      JSON          COMMENT '托管计划ID列表 ["id1","id2"]',
    promotion_id    JSON          COMMENT '托管广告ID列表 ["id1","id2"]',
    rules           JSON          NOT NULL COMMENT '规则列表(见下方JSON结构)',
    task_status          VARCHAR(16)   NOT NULL DEFAULT 'paused' COMMENT '状态: running/paused/ended/error',
    poll_interval   INT           NOT NULL DEFAULT 15 COMMENT '轮询间隔(分钟)',
    -- 统计字段（实时计算或定时更新）
    today_exec_count   INT        DEFAULT 0 COMMENT '今日执行次数',
    total_exec_count   INT        DEFAULT 0 COMMENT '累计执行次数',
    today_saved_spend  BIGINT     DEFAULT 0 COMMENT '今日节省消耗(分)',
    total_saved_spend  BIGINT     DEFAULT 0 COMMENT '累计节省消耗(分)',
    managed_ad_count   INT        DEFAULT 0 COMMENT '管理计划数',
    remark  varchar(500) COMMENT '备注',

  `main_id` bigint NOT NULL COMMENT '主体ID',
  `org_id` bigint DEFAULT NULL COMMENT '组织ID',
  `org_code` varchar(2048) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '组织编码',
  `id` bigint NOT NULL COMMENT '主键',
  `created_by` bigint NOT NULL DEFAULT '0' COMMENT '创建人',
  `create_user_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint NOT NULL DEFAULT '0' COMMENT '修改人',
  `update_user_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '修改人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态 1 可用 9 不可用',
  `del` tinyint NOT NULL DEFAULT '1' COMMENT '1 可用 9 删除',
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI托管任务表';


-- 托管执行日志表
CREATE TABLE IF NOT EXISTS ai_hosting_log (
    `id` bigint NOT NULL COMMENT '主键',
    task_id         VARCHAR(32)   NOT NULL COMMENT '所属任务ID',
    task_name       VARCHAR(128)  COMMENT '任务名称(冗余)',
    platform        VARCHAR(32)   COMMENT '平台',
    advertiser_id   VARCHAR(64)   COMMENT '广告主ID',
    advertiser_name VARCHAR(128)  COMMENT '广告主名称',
    ad_id           VARCHAR(64)   COMMENT '计划/广告ID',
    ad_name         VARCHAR(256)  COMMENT '计划/广告名称',
    rule_name       VARCHAR(128)  COMMENT '触发的规则名称',
    rule_type       VARCHAR(32)   COMMENT '规则类型: stop_loss/budget_optimize/bid_adjust/scale_up',
    action          VARCHAR(32)   COMMENT '执行动作: pause_ad/resume_ad/increase_budget/decrease_budget/increase_bid/decrease_bid/duplicate_ad/alert',
    reason          TEXT          COMMENT '触发原因(AI生成的决策理由)',
    before_value    JSON          COMMENT '执行前的值 {"bid":3000,"budget":50000}',
    after_value     JSON          COMMENT '执行后的值 {"bid":2700,"budget":50000}',
    result          VARCHAR(16)   NOT NULL DEFAULT 'pending' COMMENT '结果: success/failed/pending/rollback',
    error_msg       TEXT          COMMENT '错误信息',
    executed_at     DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '执行时间',
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task (task_id),
    INDEX idx_executed (executed_at),
    INDEX idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI托管执行日志';


-- AI决策记录表（用于反馈学习）
CREATE TABLE IF NOT EXISTS ai_decision_record (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id         VARCHAR(32)   NOT NULL COMMENT '任务ID',
    ad_id           VARCHAR(64)   NOT NULL COMMENT '计划ID',
    snapshot        JSON          NOT NULL COMMENT '决策时的广告状态快照',
    decision        JSON          NOT NULL COMMENT 'AI决策结果',
    action_result   VARCHAR(16)   COMMENT '执行结果: success/failed',
    -- 反馈：操作15分钟后的效果对比
    before_roi      DECIMAL(10,4) COMMENT '操作前ROI',
    after_roi       DECIMAL(10,4) COMMENT '操作后ROI',
    before_cost     BIGINT        COMMENT '操作前消耗',
    after_cost      BIGINT        COMMENT '操作后消耗',
    feedback_evaluated TINYINT    DEFAULT 0 COMMENT '是否已评估反馈: 0=否 1=是',
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task (task_id),
    INDEX idx_evaluated (feedback_evaluated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI决策记录表(反馈学习用)';
```

**rules 字段 JSON 结构：**

```json
[
  {
    "id": "rule_uuid_1",
    "name": "超成本止损",
    "type": "stop_loss",
    "conditions": [
      { "metric": "cost", "operator": "gt", "threshold": 10000, "duration": 30 },
      { "metric": "roi", "operator": "lt", "threshold": 0.5, "duration": 30 }
    ],
    "conditionLogic": "AND",
    "actions": [
      { "type": "pause_ad", "params": {} }
    ],
    "enabled": true
  }
]
```

### 3.3 素材智能分析

```sql
-- 素材标签表
CREATE TABLE IF NOT EXISTS material_tag (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_id     VARCHAR(64)   NOT NULL COMMENT '素材ID',
    tag_name        VARCHAR(64)   NOT NULL COMMENT '标签名',
    tag_type        VARCHAR(16)   NOT NULL DEFAULT 'manual' COMMENT '类型: auto/manual',
    tag_group       VARCHAR(64)   COMMENT '标签分组',
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_material_tag (material_id, tag_name),
    INDEX idx_material (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='素材标签表';

-- 素材生命周期状态表（定时计算更新）
CREATE TABLE IF NOT EXISTS material_lifecycle (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_id     VARCHAR(64)   NOT NULL UNIQUE COMMENT '素材ID',
    platform        VARCHAR(32)   COMMENT '平台',
    lifecycle       VARCHAR(16)   NOT NULL DEFAULT 'new' COMMENT '生命周期: new/growing/peak/declining/dead',
    first_delivery_at DATETIME    COMMENT '首次投放时间',
    last_delivery_at  DATETIME    COMMENT '最近投放时间',
    updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lifecycle (lifecycle),
    INDEX idx_material (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='素材生命周期表';
```

---

## 四、接口定义

> 响应统一格式：`{ "code": 0, "data": <T>, "msg": "success" }`
> 前端 `requestClient` 会自动取 `data` 字段。
> 金额单位统一用 **分**（BIGINT），前端负责转元展示。

### 4.1 统一数据看板（`/platform/dashboard`）

#### GET `/platform/dashboard/overview` — 核心指标概览

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dateRange | String[] | 是 | 日期范围 `["2026-07-01","2026-07-29"]` |
| platforms | String[] | 否 | 平台筛选 `["bytedance","tencent"]` |
| advertiserIds | String[] | 否 | 账户ID筛选 |

**响应：**

```json
{
  "adCost": 50000000,
  "adConvertAppCustom": 3200,
  "adPayRoi": 1.85,
  "adShow": 12000000,
  "adClick": 450000,
  "adCostChange": 12.5,
  "adConvertChange": 8.3,
  "adPayRoiChange": -3.2,
  "adShowChange": 15.0
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| adCost | Long | 总消耗（分） |
| adConvertAppCustom | Integer | 总转化数 |
| adPayRoi | Decimal | 综合ROI |
| adShow | Long | 总曝光 |
| adClick | Long | 总点击 |
| adCostChange | Decimal | 消耗环比（%，正=增长） |
| adConvertChange | Decimal | 转化环比 |
| adPayRoiChange | Decimal | ROI环比 |
| adShowChange | Decimal | 曝光环比 |

#### GET `/platform/dashboard/trend` — 消耗趋势

**Query 参数：** 同 overview

**响应：`Array<TrendDataPoint>`**

```json
[
  {
    "day": "2026-07-23",
    "adCost": 5000000,
    "adConvertAppCustom": 320,
    "adPayRoi": 1.85,
    "adShow": 1200000,
    "adClick": 45000
  }
]
```

#### GET `/platform/dashboard/platform_compare` — 平台对比

**Query 参数：** 同 overview

**响应：`Array<PlatformCompareItem>`**

```json
[
  {
    "platform": "bytedance",
    "adCost": 30000000,
    "adConvertAppCustom": 2000,
    "adPayRoi": 2.1,
    "adShow": 8000000
  }
]
```

#### GET `/platform/dashboard/account_top` — 账户排行 Top N

**Query 参数：** 同 overview + `topN` (Integer, 默认10)

**响应：`Array<AccountTopItem>`**

```json
[
  {
    "platform_account_id": "advertiser_001",
    "advertiserName": "某游戏公司",
    "platform": "bytedance",
    "adCost": 5000000,
    "dConvertAppCustom": 320,
    "adPayRoi": 1.85,
    "adShow": 1200000
  }
]
```

#### GET `/platform/dashboard/material_rank` — 素材排行 Top N

**Query 参数：** 同 overview + `topN` (Integer, 默认10)

**响应：`Array<MaterialRankItem>`**

```json
[
  {
    "materialId": "mat_001",
    "materialName": "暑期大促素材A.mp4",
    "materialType": "video",
    "thumbnailUrl": "https://...",
    "spend": 800000,
    "ctr": 3.5,
    "cvr": 1.2,
    "roi": 2.1
  }
]
```

#### GET `/platform/dashboard/alerts` — 告警列表

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dateRange | String[] | 是 | 日期范围 |
| platforms | String[] | 否 | 平台筛选 |
| status | String | 否 | `unread` / `read` / `resolved` |
| type | String | 否 | `over_cost` / `empty_spend` / `budget_limit` / `material_decline` / `account_anomaly` |
| page | Integer | 否 | 默认1 |
| pageSize | Integer | 否 | 默认20 |

**响应：`AlertListResponse`**

```json
{
  "items": [
    {
      "id": "1",
      "type": "over_cost",
      "level": "error",
      "title": "计划「暑期大促」超成本",
      "content": "当前CPA ¥58.3，目标CPA ¥30.0，超目标94%",
      "platform": "bytedance",
      "advertiserId": "advertiser_001",
      "advertiserName": "某游戏公司",
      "createdAt": "2026-07-29 14:30:00",
      "status": "unread"
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20
}
```

---

### 4.2 AI智能托管（`/platform/ai_hosting`）

#### GET `/platform/ai_hosting/list` — 托管任务列表

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| name | String | 否 | 任务名称模糊搜索 |
| platform | String | 否 | 平台筛选 |
| status | String | 否 | `running` / `paused` / `ended` / `error` |

**响应：`PageResponse<HostingTask>`**

```json
{
  "items": [
    {
      "id": "task_uuid_1",
      "name": "巨量自动止损",
      "platform": "bytedance",
      "executionMode": "auto",
      "advertiserIds": ["adv_001", "adv_002"],
      "projectId": "proj_1",
      "rules": [ /* 规则JSON数组，见3.2 */ ],
      "status": "running",
      "pollInterval": 15,
      "stats": {
        "todayExecCount": 12,
        "totalExecCount": 156,
        "todaySavedSpend": 300000,
        "totalSavedSpend": 4500000,
        "managedAdCount": 48
      },
      "createUsername": "admin",
      "createTime": "2026-07-20 10:00:00",
      "updateUsername": "admin",
      "updateTime": "2026-07-29 14:00:00",
      "status_flag": 1
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

#### POST `/platform/ai_hosting/create` — 创建托管任务

**Body：**

```json
{
  "name": "巨量自动止损",
  "platform": "bytedance",
  "executionMode": "auto",
  "advertiserIds": ["adv_001", "adv_002"],
  "projectId": "proj_1",
  "rules": [
    {
      "name": "超成本止损",
      "type": "stop_loss",
      "conditions": [
        { "metric": "cost", "operator": "gt", "threshold": 10000, "duration": 30 }
      ],
      "conditionLogic": "AND",
      "actions": [
        { "type": "pause_ad", "params": {} }
      ],
      "enabled": true
    }
  ],
  "pollInterval": 15,
  "status": "paused"
}
```

#### POST `/platform/ai_hosting/update` — 更新托管任务

**Body：** 同 create，但必须包含 `id` 字段

#### POST `/platform/ai_hosting/batch_options` — 批量操作

**Body：**

```json
{
  "targetIds": ["task_uuid_1"],
  "type": "disable",
  "values": {}
}
```

| type 值 | 说明 |
|---------|------|
| `enable` | 恢复运行（status → running） |
| `disable` | 暂停（status → paused） |
| `delete` | 删除（逻辑删除 status_flag → 9） |

#### GET `/platform/ai_hosting/log/list` — 执行日志列表

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| taskId | String | 是 | 任务ID |
| platform | String | 否 | 平台筛选 |
| ruleType | String | 否 | 规则类型筛选 |
| result | String | 否 | `success` / `failed` / `pending` / `rollback` |

**响应：`PageResponse<HostingLog>`**

```json
{
  "items": [
    {
      "id": 1,
      "taskId": "task_uuid_1",
      "taskName": "巨量自动止损",
      "platform": "bytedance",
      "advertiserId": "adv_001",
      "advertiserName": "某游戏公司",
      "adId": "ad_123",
      "adName": "暑期大促计划A",
      "ruleName": "超成本止损",
      "ruleType": "stop_loss",
      "action": "pause_ad",
      "reason": "AI判断：该计划连续30分钟消耗超100元且ROI=0.3，低于止损线0.5，建议暂停",
      "beforeValue": "{\"bid\":3000,\"budget\":50000,\"status\":\"ENABLE\"}",
      "afterValue": "{\"bid\":3000,\"budget\":50000,\"status\":\"DISABLE\"}",
      "result": "success",
      "errorMsg": null,
      "executedAt": "2026-07-29 14:30:00"
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20
}
```

#### GET `/platform/ai_hosting/stats` — 托管统计概览

**Query 参数：** `taskId` (可选，不传则查全部)

**响应：**

```json
{
  "todayExecCount": 45,
  "totalExecCount": 1200,
  "todaySavedSpend": 800000,
  "totalSavedSpend": 15000000,
  "managedAdCount": 120
}
```

---

### 4.3 素材智能分析（`/platform/material_analysis`）

#### GET `/platform/material_analysis/overview` — 素材概览统计

**Query 参数：** `platform` (可选), `dateRange` (可选)

**响应：**

```json
{
  "totalMaterials": 500,
  "activeMaterials": 280,
  "growingMaterials": 35,
  "decliningMaterials": 42,
  "avgCtr": 2.8,
  "avgCvr": 1.1,
  "avgRoi": 1.5
}
```

#### GET `/platform/material_analysis/lifecycle` — 生命周期分布

**Query 参数：** `platform` (可选), `dateRange` (可选)

**响应：**

```json
{
  "newCount": 120,
  "growingCount": 35,
  "peakCount": 80,
  "decliningCount": 42,
  "deadCount": 223
}
```

#### GET `/platform/material_analysis/list` — 素材效果列表

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| platform | String | 否 | 平台 |
| materialType | String | 否 | `video` / `image` |
| dateRange | String[] | 否 | 日期范围 |
| sortBy | String | 否 | `spend` / `ctr` / `cvr` / `roi` |
| sortOrder | String | 否 | `asc` / `desc` |

**响应：`PageResponse<MaterialAnalysisItem>`**

```json
{
  "items": [
    {
      "id": "1",
      "materialId": "mat_001",
      "materialName": "暑期大促素材A.mp4",
      "materialType": "video",
      "thumbnailUrl": "https://...",
      "fileUrl": "https://...",
      "platform": "bytedance",
      "spend": 800000,
      "impression": 2000000,
      "click": 70000,
      "convert": 840,
      "ctr": 3.5,
      "cvr": 1.2,
      "cpa": 952,
      "roi": 2.1,
      "deliveryStatus": "ACTIVE",
      "lifecycle": "peak",
      "tags": [
        { "id": "1", "name": "游戏", "type": "manual" },
        { "id": "2", "name": "真人出镜", "type": "auto" }
      ],
      "firstDeliveryAt": "2026-07-01 00:00:00",
      "lastDeliveryAt": "2026-07-29 14:00:00"
    }
  ],
  "total": 500,
  "page": 1,
  "pageSize": 20
}
```

#### POST `/platform/material_analysis/compare` — 素材对比

**Body：**

```json
{
  "materialIds": ["mat_001", "mat_002", "mat_003"],
  "dateRange": ["2026-07-01", "2026-07-29"]
}
```

#### POST `/platform/material_analysis/tag` — 添加标签

**Body：**

```json
{
  "materialId": "mat_001",
  "tag": "真人出镜",
  "group": "内容风格"
}
```

#### POST `/platform/material_analysis/tag/batch` — 批量打标签

**Body：**

```json
{
  "materialIds": ["mat_001", "mat_002"],
  "tags": ["游戏", "暑期"],
  "group": "内容风格"
}
```

---

## 五、AI决策引擎实现方案

### 5.1 整体流程

```
定时调度器（每 pollInterval 分钟）
    │
    ├── 1. 查询所有 status=running 的托管任务
    │
    ├── 2. 对每个任务：
    │   ├── 获取任务关联账户的计划列表
    │   ├── 调用平台 Report API 获取最新数据（15分钟粒度）
    │   ├── 构建 AdSnapshot（广告状态快照）
    │   │
    │   ├── 3. AI 决策
    │   │   ├── 先走规则引擎（处理确定性场景）
    │   │   │   └── 遍历 rules，匹配 conditions
    │   │   │
    │   │   ├── 规则未命中时走 LLM（处理模糊场景）
    │   │   │   ├── 构建 Prompt（快照 + 目标 + 历史经验）
    │   │   │   ├── 调用豆包 API（Function Calling）
    │   │   │   └── 解析工具调用为决策
    │   │   │
    │   │   └── 规则命中但 executionMode=manual/hybrid → 待确认
    │   │
    │   ├── 4. 执行操作
    │   │   ├── auto → 直接调用平台API
    │   │   ├── manual → 写入待确认队列，推送通知
    │   │   └── hybrid → 小操作(调价<5%)自动，大操作待确认
    │   │
    │   ├── 5. 记录日志
    │   │   └── 写入 ai_hosting_log + ai_decision_record
    │   │
    │   └── 6. 反馈收集
    │       └── 15分钟后拉取数据，更新 ai_decision_record 的 after_roi/after_cost
    │
    └── 循环
```

### 5.2 LLM 接入方案（豆包 API）

**推荐使用豆包 API 的 Function Calling 能力。**

**API 端点：** `POST https://ark.cn-beijing.volces.com/api/v3/chat/completions`

**请求示例：**

```java
// Java 伪代码
public class DoubaoLlmClient {

    private static final String API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    private static final String MODEL = "doubao-pro-32k"; // 或 doubao-pro-128k
    private static final String API_KEY = "your-api-key";

    public LlmResponse chat(String systemPrompt, String userPrompt, List<Tool> tools) {
        Map<String, Object> request = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "tools", tools,
            "tool_choice", "auto"
        );

        // HTTP POST 调用
        return httpClient.post(API_URL, request, headers -> {
            headers.set("Authorization", "Bearer " + API_KEY);
        });
    }
}
```

**System Prompt：**

```
你是一个专业的广告投放优化AI助手，负责监控广告投放数据并自动优化。

## 你的职责
1. 分析广告数据，识别异常和优化机会
2. 根据用户设定的目标(ROI/CPA/预算)，做出最优调整决策
3. 每次决策必须说明理由，评估风险等级

## 可用工具
- pause_ad: 暂停广告。参数: ad_id (string)
- resume_ad: 恢复广告。参数: ad_id (string)
- adjust_bid: 调整出价。参数: ad_id (string), ratio (int, 范围-50~50, 正=提高负=降低)
- adjust_budget: 调整预算。参数: ad_id (string), ratio (int, 范围-80~100)
- duplicate_ad: 复制爆量计划。参数: ad_id (string), count (int)
- alert_only: 仅告警不操作。参数: message (string), level (string: info/warning/error)

## 决策原则
- 保本优先：ROI持续低于0.5且无改善趋势 → 果断暂停
- 谨慎扩量：ROI>1.2 且消耗率<80% → 可追加预算
- 素材衰退：CTR连续3天下降>30% → 建议换新
- 不确定时选择 alert_only，绝不盲目操作
- 考虑全局：一个账户内不要同时暂停过多计划
```

**Tool 定义 (Function Calling)：**

```json
[
  {
    "type": "function",
    "function": {
      "name": "pause_ad",
      "description": "暂停指定广告计划",
      "parameters": {
        "type": "object",
        "properties": {
          "ad_id": { "type": "string", "description": "广告计划ID" }
        },
        "required": ["ad_id"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "adjust_bid",
      "description": "调整广告出价，ratio为正表示提高，负表示降低",
      "parameters": {
        "type": "object",
        "properties": {
          "ad_id": { "type": "string", "description": "广告计划ID" },
          "ratio": { "type": "integer", "description": "调整比例(-50~50)" }
        },
        "required": ["ad_id", "ratio"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "adjust_budget",
      "description": "调整广告预算",
      "parameters": {
        "type": "object",
        "properties": {
          "ad_id": { "type": "string", "description": "广告计划ID" },
          "ratio": { "type": "integer", "description": "调整比例(-80~100)" }
        },
        "required": ["ad_id", "ratio"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "alert_only",
      "description": "仅告警不执行操作，当不确定时使用",
      "parameters": {
        "type": "object",
        "properties": {
          "message": { "type": "string", "description": "告警内容" },
          "level": { "type": "string", "enum": ["info", "warning", "error"] }
        },
        "required": ["message", "level"]
      }
    }
  }
]
```

**User Prompt 模板：**

```
## 当前广告状态
计划ID: {adId}
计划名称: {adName}
平台: {platform}
今日消耗: ¥{spend}
转化数: {convert}
ROI: {roi}
CTR: {ctr}%
CPA: ¥{cpa}
日预算: ¥{budget}
消耗率: {spendRate}%
已运行: {runHours}小时

## 用户目标
目标ROI: {targetRoi}
目标CPA: ¥{targetCpa}
执行模式: {executionMode}

## 历史参考
同类计划平均ROI: {avgRoi}
同类计划平均CPA: ¥{avgCpa}
该素材已投放天数: {deliveryDays}
近3天CTR趋势: {ctrTrend}

## 请分析当前状态并做出决策
```

### 5.3 平台 API 适配器

每个平台需实现以下接口：

```java
public interface PlatformApiAdapter {

    /** 获取广告数据快照 */
    AdSnapshot getAdSnapshot(String advertiserId, String adId);

    /** 暂停广告 */
    void pauseAd(String advertiserId, String adId);

    /** 恢复广告 */
    void resumeAd(String advertiserId, String adId);

    /** 调整出价 */
    void updateBid(String advertiserId, String adId, long newBid);

    /** 调整预算 */
    void updateBudget(String advertiserId, String adId, long newBudget);

    /** 复制计划 */
    String duplicateAd(String advertiserId, String adId, int count);
}
```

已有平台 API 对接参考：
- 巨量引擎：已有批投 API 体系，可复用广告状态修改接口
- OPPO/VIVO/腾讯/华为：各平台 API 文档参考已有对接代码

### 5.4 调度方案

使用项目已有的 XXL-Job 或 Quartz：

```java
@XxlJob("aiHostingScheduler")
public void execute() {
    List<HostingTask> tasks = taskService.getRunningTasks();
    for (HostingTask task : tasks) {
        try {
            // 1. 获取监控数据
            List<AdSnapshot> snapshots = collectSnapshots(task);

            // 2. AI 决策
            for (AdSnapshot snap : snapshots) {
                AiDecision decision = decisionEngine.decide(snap, task);

                // 3. 执行
                if (decision.hasAction()) {
                    executionEngine.execute(decision, task.getExecutionMode());
                }
            }

            // 4. 更新统计
            taskService.updateStats(task.getId());
        } catch (Exception e) {
            log.error("托管任务执行异常: taskId={}", task.getId(), e);
            taskService.markError(task.getId(), e.getMessage());
        }
    }
}
```

调度频率：每分钟检查一次，按各任务的 `pollInterval` 判断是否到执行时间。

---

## 六、实现优先级

| 优先级 | 模块 | 接口数 | 预估工时 |
|--------|------|--------|----------|
| P0 | 统一数据看板（6个GET） | 6 | 2-3天 |
| P0 | AI托管任务CRUD（4个） | 4 | 2天 |
| P0 | 托管日志查询（1个GET） | 1 | 0.5天 |
| P1 | AI决策引擎（LLM接入+调度） | - | 5-7天 |
| P1 | 素材分析（6个接口） | 6 | 3天 |
| P2 | 告警规则引擎 | - | 3天 |
| P2 | 反馈学习层 | - | 3天 |

**建议后端按 P0 → P1 → P2 顺序实现，前端已全部就绪可随时联调。**

---

## 七、数据来源说明

看板和素材分析的数据来源：

```
各平台 Report API
    │
    ▼ (Airflow 定时同步，turbo_airflow 项目)
数据仓库 (ad_report_data 表)
    │
    ▼ (Java 后端聚合查询)
前端展示
```

Airflow 需要保证以下同步频率：
- **看板数据**：每小时同步一次当天数据
- **托管监控数据**：每 15 分钟同步一次（配合 AI 托管轮询）
- **素材数据**：每天同步一次

---

> 文档版本：V1.0
> 日期：2026-07-29
> 前端代码已全部就绪，后端按本文档实现接口即可联通
