# Auto Proxy Ads (APA) — Code Wiki

> 基于 [Vben Admin v5](https://vben.pro) 框架构建的广告投放代理平台，使用 Vue 3 + TypeScript + Ant Design Vue + VxeTable 技术栈。

---

## 目录

1. [项目概览](#1-项目概览)
2. [项目架构](#2-项目架构)
3. [目录结构详解](#3-目录结构详解)
4. [核心模块说明](#4-核心模块说明)
   - 4.1 [应用启动流程](#41-应用启动流程)
   - 4.2 [路由系统](#42-路由系统)
   - 4.3 [权限控制](#43-权限控制)
   - 4.4 [状态管理](#44-状态管理)
   - 4.5 [HTTP 请求层](#45-http-请求层)
   - 4.6 [API 服务层](#46-api-服务层)
   - 4.7 [国际化 (i18n)](#47-国际化-i18n)
   - 4.8 [组件适配器](#48-组件适配器)
   - 4.9 [布局系统](#49-布局系统)
   - 4.10 [偏好设置](#410-偏好设置)
5. [业务视图模块](#5-业务视图模块)
6. [关键依赖关系](#6-关键依赖关系)
7. [项目运行方式](#7-项目运行方式)
8. [构建与部署](#8-构建与部署)
9. [配置说明](#9-配置说明)

---

## 1. 项目概览

| 属性 | 值 |
|------|-----|
| **项目名称** | Auto Proxy Ads (APA) |
| **包名** | `@vben/web-antd` |
| **版本** | 5.7.0 |
| **框架** | Vue 3 + TypeScript |
| **UI 库** | Ant Design Vue 4.x |
| **构建工具** | Vite |
| **包管理** | pnpm (monorepo workspace) |
| **状态管理** | Pinia |
| **路由** | Vue Router 4 (Hash 模式) |
| **HTTP 客户端** | Axios (二次封装的 `@vben/request`) |
| **表格组件** | VxeTable + VxePCUI |
| **国际化** | vue-i18n + 自定义 `@vben/locales` |
| **图标** | Iconify + Lucide Icons |
| **样式** | SCSS + TailwindCSS |

---

## 2. 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                        main.ts                              │
│              (初始化偏好 → bootstrap → mount)                 │
├─────────────────────────────────────────────────────────────┤
│                      app.vue                                │
│         ConfigProvider(antd) + RouterView                   │
├───────────┬──────────┬──────────┬──────────┬───────────────┤
│  Router   │  Store   │   API    │ Locales  │   Adapter     │
│ (路由守卫) │ (Pinia)  │ (请求层)  │ (i18n)  │ (组件适配器)   │
├───────────┴──────────┴──────────┴──────────┴───────────────┤
│                       Views / Layouts                       │
│              (业务视图页面 + 基础布局组件)                     │
├─────────────────────────────────────────────────────────────┤
│               Packages (@vben/*)                            │
│    共享包：preferences, stores, request, layouts, ...        │
└─────────────────────────────────────────────────────────────┘
```

项目为 **monorepo** 架构，根目录位于 [vue-vben-admin](file:///Users/imac/WebstormProjects/vue-vben-admin)，`apps/web-antd` 是其中的一个应用子包。框架共享代码封装在 `packages/` 中，通过 `@vben/*` workspace 引用。

---

## 3. 目录结构详解

```
apps/web-antd/
├── public/favicon.ico                  # 站点图标
├── src/
│   ├── main.ts                         # 应用入口：初始化偏好并启动
│   ├── bootstrap.ts                    # 应用引导：创建Vue实例、注册插件
│   ├── app.vue                         # 根组件：ConfigProvider + RouterView
│   ├── preferences.ts                  # 偏好设置覆盖配置（主题、布局等）
│   ├── vue-shims.d.ts                  # Vue 类型声明
│   │
│   ├── adapter/                        # 适配器层
│   │   ├── component/index.ts          # 组件适配：Antd组件注册到全局共享状态
│   │   ├── form.ts                     # 表单适配：VbenForm 与 Antd 对接
│   │   └── vxe-table.ts               # 表格适配：VxeTable 配置
│   │
│   ├── api/                            # API 层
│   │   ├── request.ts                  # HTTP 客户端封装（拦截器、token刷新）
│   │   ├── customRequest.ts            # 自定义 Axios 实例（文件上传等）
│   │   ├── index.ts                    # API 统一导出入口
│   │   ├── core/                       # 核心 API 服务类
│   │   │   ├── baseapi.ts             # BaseApi 基类（URL构造器）
│   │   │   ├── auth.ts               # 认证 API
│   │   │   ├── user.ts               # 用户/组织/数据范围 API
│   │   │   ├── role.ts               # 角色 API
│   │   │   ├── menu.ts               # 菜单 API
│   │   │   ├── notice.ts             # 通知 API
│   │   │   ├── dashboard.ts          # 仪表盘 API
│   │   │   ├── main-body.ts          # 主体/套餐 API
│   │   │   ├── bpm.ts                # BPM 流程 API
│   │   │   ├── marketing.ts          # 营销 API（含开发/广告主/素材/报表等）
│   │   │   ├── ocpx.ts               # OCPX 转化 API
│   │   │   ├── adx.ts                # ADX 广告交易 API
│   │   │   ├── attribution.ts        # 归因 API
│   │   │   ├── tools.ts              # 工具 API
│   │   │   ├── pay.ts                # 支付 API
│   │   │   └── index.ts              # 统一导出
│   │   └── models/                    # 类型定义（请求/响应类型）
│   │
│   ├── components/                     # 全局公共组件
│   │   └── textarea_tags/
│   │
│   ├── constants/                      # 常量定义
│   │   ├── enums.ts                   # 枚举（平台、规则类型等）
│   │   └── locales.ts
│   │
│   ├── layouts/                        # 布局组件
│   │   ├── index.ts                   # 导出 BasicLayout / AuthPageLayout / IFrameView
│   │   ├── basic.vue                  # 主布局（侧边栏+顶栏+内容区）
│   │   └── auth.vue                   # 登录页布局
│   │
│   ├── locales/                        # 国际化
│   │   ├── index.ts                   # i18n 初始化（加载antd/dayjs语言包）
│   │   └── langs/                     # 语言文件
│   │       ├── zh-CN/                 # 中文
│   │       └── en-US/                 # 英文
│   │
│   ├── router/                         # 路由系统
│   │   ├── index.ts                   # 路由实例创建
│   │   ├── guard.ts                   # 路由守卫（权限/进度条）
│   │   ├── access.ts                  # 动态权限路由生成
│   │   └── routes/
│   │       ├── index.ts               # 路由聚合
│   │       ├── core.ts                # 核心路由（登录、404等）
│   │       └── modules/               # 动态路由模块定义
│   │
│   ├── store/                          # Pinia Store
│   │   ├── index.ts
│   │   └── auth.ts                    # 认证 Store（登录/登出/获取用户信息）
│   │
│   ├── types/                          # 第三方类型声明
│   │   ├── ali-oss.d.ts
│   │   └── spark-md5.d.ts
│   │
│   ├── utils/                          # 工具函数
│   │   ├── calcFileMd5.ts
│   │   ├── fileMd5.ts
│   │   ├── fileMeta.ts
│   │   ├── fileImageInfo.ts
│   │   ├── uploadToOss.ts             # OSS 上传
│   │   ├── pagination.ts
│   │   ├── trim.ts
│   │   └── customName.ts
│   │
│   └── views/                          # 页面视图
│       ├── _core/                      # 核心视图（登录、个人中心、错误页）
│       ├── dashboard/                  # 仪表盘
│       ├── system/                     # 系统管理
│       ├── marketing/                  # 营销管理
│       ├── ocpx/                       # OCPX 转化
│       ├── adx/                        # ADX 广告交易
│       ├── attribution/               # 归因分析
│       ├── demos/                      # 示例页面
│       └── tools/                      # 工具页面
│
├── .env                                # 公共环境变量
├── .env.development                    # 开发环境变量
├── .env.production                     # 生产环境变量
├── .env.analyze                        # 打包分析环境变量
├── vite.config.ts                      # Vite 配置
├── tsconfig.json                       # TypeScript 配置
├── tsconfig.node.json                  # Node TypeScript 配置
├── package.json                        # 项目依赖
├── index.html                          # HTML 入口
├── Dockerfile                          # Docker 构建文件
├── nginx.conf                          # Nginx 配置
├── build-frontend.sh                   # 构建脚本
└── deployment.yaml                     # K8s 部署文件
```

---

## 4. 核心模块说明

### 4.1 应用启动流程

启动入口文件是 [main.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/main.ts)。

**时序流程：**

```
main.ts
  │
  ├─ 1. initPreferences()
  │     ├─ 读取 .env 生成 namespace（APA-{version}-{env}）
  │     ├─ 合并 overridesPreferences（主题、布局、紧凑模式等）
  │     └─ 注册 preferencesExtension（表单全屏、租户模式等扩展）
  │
  ├─ 2. bootstrap(namespace)
  │     ├─ initComponentAdapter()    —— 注册 Antd 组件到全局共享状态
  │     ├─ initSetupVbenForm()       —— 表单 v-model 映射 + 校验规则
  │     ├─ createApp(App)            —— 创建 Vue 应用
  │     ├─ registerLoadingDirective()—— 注册 v-loading / v-spinning 指令
  │     ├─ setupI18n(app)            —— 初始化国际化（vue-i18n + antd/dayjs）
  │     ├─ initStores(app)           —— 初始化 Pinia 状态管理
  │     ├─ registerAccessDirective() —— 注册权限指令
  │     ├─ initTippy()               —— Tooltip 插件
  │     ├─ app.use(router)           —— 安装路由（触发路由守卫）
  │     ├─ app.use(MotionPlugin)     —— 动效插件
  │     └─ app.mount('#app')         —— 挂载到 DOM
  │
  └─ 3. unmountGlobalLoading()       —— 移除全局加载动画
```

---

### 4.2 路由系统

#### 路由实例 ([router/index.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/router/index.ts))

- **路由模式**：Hash 模式（`createWebHashHistory`），可通过 `VITE_ROUTER_HISTORY` 环境变量切换
- **scrollBehavior**：支持保存滚动位置和锚点跳转

#### 路由分层：

| 层级 | 位置 | 说明 |
|------|------|------|
| **核心路由** | [routes/core.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/router/routes/core.ts) | 登录(`/auth/*`)、根容器(`/`)、404 兜底，无需权限验证 |
| **动态路由** | [routes/modules/*.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/router/routes/modules/) | 业务模块路由定义，自动 glob 导入，需权限校验 |

#### 路由守卫 ([router/guard.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/router/guard.ts))

- `setupCommonGuard`：页面加载进度条控制，记录已加载路径用于动画优化
- `setupAccessGuard`：
  1. 核心路由（白名单）直接放行
  2. 已登录用户访问登录页自动重定向到首页
  3. 未登录用户访问需权限页面 → 重定向到登录页
  4. 已登录 → 从后端获取用户菜单数据 → 调用 `generateAccess()` 生成动态路由

---

### 4.3 权限控制

#### 权限模式

配置在 [preferences.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/preferences.ts)，`accessMode: 'backend'` 表示权限完全由后端控制。

#### 权限生成 ([router/access.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/router/access.ts))

```
generateAccess(options)
  ├─ 从后端获取用户菜单 (fetchMenuListAsync)
  ├─ generateAccessible() — @vben/access 库
  │   ├─ 根据用户角色过滤路由
  │   ├─ 将后端菜单树转为 Vue Router 路由
  │   └─ 生成 accessibleMenus & accessibleRoutes
  └─ 存入 accessStore
```

- **无权限页面**：重定向到 [forbidden.vue](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/views/_core/fallback/forbidden.vue)
- **权限指令**：`registerAccessDirective()` 注册 `v-access` 指令

---

### 4.4 状态管理

项目使用 **Pinia** 作为状态管理，分为框架级 Store 和业务级 Store。

#### 框架级 Store（`@vben/stores`）

| Store | 职责 |
|-------|------|
| `useAccessStore` | accessToken、accessCodes、accessMenus、accessRoutes、登录过期状态 |
| `useUserStore` | 用户信息（`userInfo`） |
| `useTabbarStore` | 多标签页状态 |

#### 业务级 Store

| 文件 | Store Name | 职责 |
|------|-----------|------|
| [store/auth.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/store/auth.ts) | `auth` | 登录、登出、获取用户信息 |

**AuthStore 核心方法：**

- `authLogin(params)` — 调用登录 API → 存储 token → 获取用户信息 → 存储权限码 → 跳转首页
- `logout(redirect)` — 调用登出 API → 重置所有 Store → 跳转登录页
- `fetchUserInfo()` — 调用 `getUserInfoApi` → 存入 `userStore`

---

### 4.5 HTTP 请求层

#### 主请求客户端 ([api/request.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/api/request.ts))

基于 `@vben/request` 的 `RequestClient` 封装：

```
requestClient = createRequestClient(apiURL, { responseReturn: 'data' })
baseRequestClient = new RequestClient({ baseURL: apiURL })
```

**拦截器链：**

| 拦截器 | 类型 | 功能 |
|--------|------|------|
| `Authorization` Header | 请求 | 自动携带 `Bearer {token}` 和 `Accept-Language` |
| `defaultResponseInterceptor` | 响应 | 统一响应格式解析 `{ code, data }`，successCode=0 |
| `authenticateResponseInterceptor` | 响应 | Token 过期处理：刷新 token / 重新认证 |
| `errorMessageResponseInterceptor` | 响应 | 通用错误消息提示 |

**Token 过期处理策略（`preferences.app.loginExpiredMode`）：**
- `modal`：弹窗重新登录（不跳转页面）
- 其他：直接登出跳转登录页

#### 自定义 Axios 实例 ([api/customRequest.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/api/customRequest.ts))

适用于文件上传等不需要 `responseReturn: 'data'` 的场景，独立携带 token 和统一错误处理。

---

### 4.6 API 服务层

所有 API 服务类继承自 `BaseApi` 基类。

#### BaseApi ([api/core/baseapi.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/api/core/baseapi.ts))

```typescript
class BaseApi {
  constructor(serviceUrl: string)
  getServiceUrl(url: string): string  // 根据微服务开关拼接完整URL
}
```

- 支持微服务路由：当 `VITE_MICRO_SERVICE=true` 时，将 `serviceUrl` 作为完整前缀
- 否则只取 `serviceUrl` 后半段作为请求路径前缀

#### API 服务清单：

| 服务 | 实例名 | serviceUrl | 功能 |
|------|--------|-----------|------|
| 认证 | `authApi` | `/auth/auth` | 登录、注册、刷新token、修改密码 |
| 用户 | `userApi` | `/sys/user` | 用户CRUD、批量操作 |
| 组织 | `orgApi` | `/sys/org` | 组织树、启用/禁用/删除 |
| 角色 | `roleApi` | `/sys/role` | 角色CRUD、启用/禁用 |
| 菜单 | `menuApi` | `/sys/menu` | 菜单树、菜单CRUD |
| 通知 | `noticeApi` | `/sys/notice` | 通知列表、已读标记 |
| 主体 | `mainBodyApi` | `/sys/main` | 主体管理CRUD |
| 套餐 | `mainBodyComboApi` | `/sys/main_body_combo` | 主体套餐管理 |
| 数据范围 | `dataRangeApi` | `/sys/data/range` | 数据范围、用户分配 |
| 操作日志 | `operatorApi` | `/sys/operator` | 操作记录列表 |
| 流程 | `flowableProcessApi` | `/sys/process` | BPM流程管理 |
| 表单 | `flowableFormApi` | `/sys/process_form` | BPM表单管理 |
| 仪表盘 | `taskApi` | `/sys/task` | 待办/已办事项 |
| 开发者 | `developerApi` | `/platform/developer` | 开发者管理 |
| 广告主 | `advertiserApi` | `/platform/advertiser` | 广告主CRUD、授权、导入导出 |
| 指标 | `metricApi` | `/platform/metric` | 自定义指标管理 |
| 指标类目 | `metricGroupApi` | `/platform/metric_group` | 指标分组管理 |
| 报表 | `reportApi` | `/platform/report` | 广告效果报表 |
| 项目 | `projectApi` | `/platform/project` | 项目管理 |
| 模板 | `reportTemplateApi` | `/platform/report_configuration` | 报表模板 |
| 素材库 | `materialLibraryApi` | `/platform/album` | 素材目录管理 |
| 素材 | `uploadEditApi` | `/platform/material` | 素材上传/编辑 |
| 上传凭证 | `uploadCredentialsApi` | `/platform/aliyun` | OSS STS Token |
| 标题包 | `titlePackApi` | `/platform/titlePackage` | 标题包管理 |
| 定向包 | `targetedPackageApi` | `/platform/audience_package` | 定向包管理 |
| 创编任务 | `creationTaskApi` | `/platform/advertisement_batch_create` | 批投任务 |
| 标签 | `accountLabelApi` | `/platform/advertiser_tag` | 账户标签 |
| 策略组 | `strategyGropApi` | `/platform/advertisement_batch/strategy/group` | vivo策略组 |
| 订阅 | `subscribeApi` | `/platform/report_subscribe` | 报表订阅 |
| 落地页 | `loadingPageApi` | `/platform/loading_page` | 落地页管理 |
| 广告管理 | `aManagementApi` | `/platform/promotion` | 广告查询/导出 |
| Oppo广告 | `oppo_advertisementApi` | `/platform/oppo_advertisement` | Oppo定向元数据 |
| 素材推送 | `materialPushApi` | `/platform/material_push` | 批量素材推送 |
| OCPX回传 | `platformCallbackApi` | `/platform/platformcallback` | 平台回传配置 |
| 转化平台 | `behavioraPlatformApi` | `/platform/platformbehaviora` | 转化平台管理 |
| OCPX任务 | `ocpxTaskApi` | `/platform/ocpxtask` | OCPX任务/回调记录 |
| 点击监测 | `clickMonitorApi` | `/platform/clickmonitor` | 点击URL生成/联调 |
| 事件结算 | `eventSettlementApi` | `/platform/event_settlement` | 事件结算配置 |
| DSP | `dspApi` | `/platform/dsp_channel` | DSP渠道管理 |
| RTB | `rtbApi` | `/platform/rtb_channel` | RTB渠道管理 |
| 广告策略 | `campaignApi` | `/platform/adx_campaign_strategy` | ADX广告计划策略 |
| Push计划 | `pushCampaignApi` | `/platform/push_campaign` | Push推送计划 |
| 归因事件 | `eventConfigApi` | `/platform/attribution` | 事件配置 |
| 归因属性 | `eventAttributeApi` | `/platform/attribution` | 事件属性 |
| 归因配置 | `attributionConfigApi` | `/platform/attribution` | 归因模板 |
| SDK | `sdkConfigApi` | `/platform/attribution_app` | SDK应用配置 |
| 穿山甲 | `pangolinApi` | `/csjp` | 穿山甲商品查询 |
| 下载中心 | `downloadCenterApi` | `/platform/download_center` | 文件下载/数据导出 |

---

### 4.7 国际化 (i18n)

入口：[locales/index.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/locales/index.ts)

**支持语言**：`zh-CN`（中文）、`en-US`（英文）

**加载流程**：
```
setupI18n(app)
  ├─ loadMessages(lang)
  │   ├─ 从 ./langs/{lang}/*.json 加载业务语言包
  │   └─ loadThirdPartyMessage(lang)
  │       ├─ loadAntdLocale(lang) —— Ant Design Vue 组件语言
  │       └─ loadDayjsLocale(lang) —— dayjs 日期语言
  └─ coreSetup(app, options) —— 注册 vue-i18n 到应用
```

**语言包**（[locales/langs/](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/locales/langs/)）：

| 文件 | 中文 | 英文 |
|------|------|------|
| `core.json` | 公共/认证/AI文案/通用 | 同 |
| `page.json` | 登录/仪表盘/系统管理等页面文案 | 同 |
| `system.json` | 系统管理文案 | 同 |
| `marketing.json` | 营销模块文案 | 同 |
| `ocpx.json` | OCPX 模块文案 | 同 |
| `adx.json` | ADX 模块文案(仅中文) | — |
| `attribution.json` | 归因模块文案 | 同 |
| `pay.json` | 支付模块文案 | 同 |
| `bpm.json` | BPM 流程文案 | 同 |
| `demos.json` | 示例/框架页面 | 同 |
| `tools.json` | 工具页面文案(仅中文) | — |

---

### 4.8 组件适配器

适配器层解决 Vben 框架组件与 Ant Design Vue 的对接。

#### 组件适配 ([adapter/component/index.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/adapter/component/index.ts))

`initComponentAdapter()` 将所有 Antd 组件注册到 `globalShareState`，主要包含：

| 组件类型 | Antd 组件 | 额外处理 |
|---------|----------|---------|
| 输入类 | Input, InputNumber, InputPassword, Textarea, Mentions | 自动添加 placeholder |
| 选择类 | Select, TreeSelect, Cascader, Radio, Checkbox | 自动添加 placeholder |
| 日期类 | DatePicker, RangePicker, TimePicker | - |
| 按钮类 | DefaultButton, PrimaryButton | 封装为 Antd Button |
| API选择 | ApiSelect, ApiCascader, ApiTreeSelect | 封装了 ApiComponent + loading |
| 上传 | Upload | 支持裁剪、预览、拖拽排序 |
| 业务组件 | MetricFormulaEditor, lazyLoadSelect, HybridSearchSelect, AdNameGen, TextareaTags | 异步加载自定义组件 |
| 其他 | Switch, Rate, Slider, Tree, Divider, IconPicker | - |

#### 表单适配 ([adapter/form.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/adapter/form.ts))

- `setupVbenForm()` 配置：
  - `baseModelPropName: 'value'` — Antd 默认 v-model 绑定
  - `modelPropNameMap` — 特殊组件的绑定属性映射（如 Checkbox→checked, Upload→fileList）
  - `defineRules` — 国际化必填校验规则

#### 表格适配 ([adapter/vxe-table.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/adapter/vxe-table.ts))

- 注册 `VXETablePluginExportXLSX` 导出插件（基于 ExcelJS）
- 注册自定义渲染器 `CellImage`、`CellLink`
- 配置分页代理规则：`result: 'items'`, `total: 'total'`

---

### 4.9 布局系统

#### BasicLayout ([layouts/basic.vue](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/layouts/basic.vue))

项目主布局，从 `@vben/layouts` 获取 `BasicLayout` 组件。配置了：

- **用户下拉菜单**：个人中心、文档、GitHub、帮助、退出登录
- **通知面板**：消息列表、已读/未读标记、清空、查看全部
- **锁屏**：`LockScreen` 组件
- **登录过期弹窗**：`AuthenticationLoginExpiredModal`（嵌入 login.vue）
- **水印**：根据偏好动态生成/销毁水印

#### AuthPageLayout ([layouts/auth.vue](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/layouts/auth.vue))

登录/注册页面的认证布局。

---

### 4.10 偏好设置

配置入口：[preferences.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/src/preferences.ts)

```typescript
overridesPreferences = {
  app: {
    name: 'Auto Proxy Ads',
    accessMode: 'backend',        // 后端权限模式
    enableRefreshToken: false,    // 不启用 refresh token
    compact: true,                // antd 紧凑模式
    defaultHomePath: '/dashboard',
    authPageLayout: 'panel-center',
    layout: 'sidebar-mixed-nav',  // 混合侧边导航
  },
  theme: {
    mode: 'auto',                 // 自动深色模式
    builtinType: 'deep-blue',
    radius: '0.75',
  },
  breadcrumb: {
    enable: true,
    showIcon: true,
    styleType: 'background',
  },
}
```

扩展设置项：`enableFormFullscreen`、`tenantMode`（单/多租户）、`defaultTableSize`、`reportTitle`。

---

## 5. 业务视图模块

### 5.1 核心视图 (`views/_core/`)

| 目录/文件 | 功能 |
|----------|------|
| `authentication/login.vue` | 密码登录页 |
| `authentication/code-login.vue` | 验证码登录页 |
| `authentication/qrcode-login.vue` | 扫码登录页 |
| `authentication/forget-password.vue` | 忘记密码页 |
| `authentication/register.vue` | 注册页 |
| `profile/index.vue` | 个人中心（基本设置/安全设置/修改密码/消息提醒） |
| `fallback/forbidden.vue` | 403 禁止访问 |
| `fallback/not-found.vue` | 404 页面不存在 |
| `fallback/internal-error.vue` | 500 服务器错误 |
| `fallback/offline.vue` | 离线页面 |
| `fallback/coming-soon.vue` | 即将上线 |
| `about/index.vue` | 关于页面 |

### 5.2 仪表盘 (`views/dashboard/`)

- `analytics/` — 数据分析仪表盘（趋势、访问数据、销售、来源等）
- `workspace/` — 工作台

### 5.3 系统管理 (`views/system/`)

| 模块 | 功能 |
|------|------|
| `account/` | 账户管理（列表+创建/编辑） |
| `org/` | 组织管理（树形结构+CRUD） |
| `role/` | 角色管理（列表+创建/编辑+权限分配） |
| `menu/` | 菜单管理（树形+CRUD） |
| `notice/` | 通知公告管理 |
| `main-body/` | 主体管理（套餐历史等） |
| `main_body_combo/` | 主体套餐管理 |
| `data-scope/` | 数据范围管理 |
| `operator/` | 操作日志查看 |

### 5.4 营销管理 (`views/marketing/`)

| 子模块 | 功能 |
|--------|------|
| `account/advertiser/` | 广告主管理（CRUD、授权、子账户导入、批量操作、历史记录） |
| `account/developer/` | 开发者管理 |
| `account/label/` | 账户标签管理 |
| `account/balance_detail/` | 账户消耗详情 |
| `asset/material/` | 素材库（文件夹、素材上传、推送任务） |
| `asset/audiencePackage/` | 定向人群包（支持多家媒体平台） |
| `asset/titlePackage/` | 标题包管理 |
| `asset/pageview/` | 落地页管理 |
| `creation/` | 广告创编（支持字节跳动、腾讯、OPPO、Vivo、华为商店等多平台） |
| `creation/promotion_manager/` | 推广管理（计划、广告组、广告三级管理） |
| `creation/creation_task/` | 创编任务列表 |
| `creation/components/` | 创编公共组件（广告命名、受众选择、创意、监测链接等） |
| `project/` | 项目管理 |
| `report/adreportdata/` | 广告效果报表（含模板、订阅、指标选择） |
| `report/metric/` | 自定义指标管理 |
| `report/metric_group/` | 指标类目管理 |
| `report/subscribe/` | 报表订阅管理 |

### 5.5 OCPX 转化 (`views/ocpx/`)

- `platformcallback/` — 平台回传配置
- `platformbehaviora/` — 转化行为平台配置
- `ocpx_task/` — OCPX 任务（含回调记录、行为记录、点击记录、数据统计、联调测试等）
- `event_sellement/` — 事件结算配置
- `analysis/` — 转化数据分析

### 5.6 ADX 广告交易 (`views/adx/`)

- `rtb/` — RTB 渠道管理
- `dsp/` — DSP 渠道管理
- `campaign_strategy/` — 广告计划策略
- `push/` — Push 推送（含华为/荣耀计划创建）

### 5.7 归因分析 (`views/attribution/`)

- `event/` — 事件配置
- `properties/` — 事件属性
- `attribution_config/` — 归因配置模板
- `sdk_config/` — SDK 应用配置

### 5.8 工具 (`views/tools/`)

- `csjp/product/` — 穿山甲商品查询
- `downloadcenter/` — 下载中心

---

## 6. 关键依赖关系

### 运行时依赖

| 包名 | 用途 |
|------|------|
| `@vben-core/menu-ui` | 菜单 UI 内核 |
| `@vben/access` | 权限控制（路由过滤、指令） |
| `@vben/common-ui` | 通用 UI 组件（Profile、ApiComponent、VCropper等） |
| `@vben/constants` | 框架常量 |
| `@vben/enums` | 框架枚举 |
| `@vben/hooks` | 组合式函数（useSortable、useWatermark等） |
| `@vben/icons` | 图标组件 |
| `@vben/layouts` | 布局组件 |
| `@vben/locales` | 国际化核心 |
| `@vben/plugins` | 插件（Motion、VxeTable等） |
| `@vben/preferences` | 偏好设置管理 |
| `@vben/request` | HTTP 请求封装 |
| `@vben/stores` | 共享状态管理 |
| `@vben/styles` | 全局样式 |
| `@vben/types` | 公共类型定义 |
| `@vben/utils` | 工具函数 |
| `vue` | Vue 3 核心 |
| `vue-router` | 路由 |
| `pinia` | 状态管理 |
| `ant-design-vue` | UI 组件库 |
| `@ant-design/icons-vue` | Antd 图标 |
| `axios` | HTTP 客户端 |
| `vxe-table` / `vxe-pc-ui` | 高性能表格 |
| `exceljs` | Excel 导入导出 |
| `dayjs` | 日期处理 |
| `ali-oss` | 阿里云 OSS SDK |
| `spark-md5` | 文件 MD5 计算 |

### 架构依赖关系图

```
web-antd (app)
  │
  ├── @vben/preferences ───── 偏好设置框架
  ├── @vben/stores ─────────── 全局状态
  ├── @vben/request ────────── HTTP 请求
  ├── @vben/access ─────────── 权限
  ├── @vben/locales ────────── 国际化
  ├── @vben/layouts ────────── 布局
  ├── @vben/common-ui ──────── 通用组件
  ├── @vben/plugins ────────── 插件
  ├── @vben/hooks ──────────── hooks
  ├── @vben/icons ──────────── 图标
  ├── @vben/styles ─────────── 样式
  ├── @vben/constants ──────── 常量
  ├── @vben/enums ──────────── 枚举
  ├── @vben/types ──────────── 类型
  ├── @vben/utils ──────────── 工具
  │
  ├── ant-design-vue ───────── UI 库
  ├── vxe-table ────────────── 表格
  ├── axios ────────────────── HTTP
  └── vue-router ───────────── 路由
```

---

## 7. 项目运行方式

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 8（monorepo 包管理器）

### 安装依赖

```bash
# 在仓库根目录
cd /Users/imac/WebstormProjects/vue-vben-admin
pnpm install
```

### 启动开发服务器

```bash
# 在 web-antd 应用目录
cd apps/web-antd
pnpm dev
```

开发服务器默认在 `http://localhost:5666` 启动（由 `.env.development` 中 `VITE_PORT` 定义）。

API 默认代理到 `http://localhost:60001`（Mock 后端）。

### 构建

```bash
pnpm build          # 生产构建
pnpm build:analyze  # 带打包分析的构建
```

### 类型检查

```bash
pnpm typecheck
```

### 预览生产构建

```bash
pnpm preview
```

### Docker 部署

```bash
# 构建镜像
docker build -t auto-proxy-ads .

# 运行容器
docker run -p 80:80 -p 443:443 auto-proxy-ads
```

---

## 8. 构建与部署

### Vite 构建配置 ([vite.config.ts](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/vite.config.ts))

- 使用 `@vben/vite-config` 的 `defineConfig` 封装
- 路径别名 `#/*` → `src/*`

### Nginx 配置 ([nginx.conf](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/nginx.conf))

- HTTP 80 → HTTPS 443 强制重定向
- SSL/TLS 证书配置
- 静态资源 7 天缓存
- History 路由模式 `try_files` 支持
- `/api/` 反向代理到 `https://turbo.starfiread.com/`
- Gzip 压缩

### Docker 构建 ([Dockerfile](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/Dockerfile))

基于 Nginx 镜像，复制构建产物和 SSL 证书。

### K8s 部署 ([deployment.yaml](file:///Users/imac/WebstormProjects/vue-vben-admin/apps/web-antd/deployment.yaml))

Kubernetes 部署描述文件。

---

## 9. 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | `Auto Proxy Ads` |
| `VITE_APP_NAMESPACE` | 应用命名空间（缓存前缀） | `APA` |
| `VITE_APP_STORE_SECURE_KEY` | store 加密密钥 | — |
| `VITE_PORT` | 开发服务器端口 | `5666` |
| `VITE_BASE` | 路由基础路径 | `/` |
| `VITE_GLOB_API_URL` | API 接口地址 | 开发：`localhost:60001`，生产：`/api` |
| `VITE_NITRO_MOCK` | 是否启用 Nitro Mock | `false` |
| `VITE_DEVTOOLS` | 是否打开 DevTools | `true` |
| `VITE_INJECT_APP_LOADING` | 是否注入全局 loading | 开发：`false`，生产：`true` |
| `VITE_ROUTER_HISTORY` | 路由模式 | `hash` |
| `VITE_COMPRESS` | 打包压缩方式 | `gzip` |
| `VITE_PWA` | 是否开启 PWA | `false` |
| `VITE_ARCHIVER` | 打包后生成 dist.zip | `true` |
| `VITE_MICRO_SERVICE` | 是否启用微服务 | `false` |

### 响应数据结构

后端 API 统一响应格式：

```json
{
  "code": 0,        // 0 表示成功
  "data": {},       // 业务数据
  "message": ""     // 错误消息
}
```

分页列表格式：

```json
{
  "code": 0,
  "data": {
    "items": [],    // 列表数据
    "total": 100    // 总条数
  }
}
```

---

> 文档生成时间：2026-07-24
