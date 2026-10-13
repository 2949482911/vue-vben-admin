<script setup lang="ts" name="CreateHostingTask">
import type {
  ActionType,
  ExecutionMode,
  HostingRule,
  HostingTarget,
  HostingTask,
  RuleAction,
  RuleCondition,
  RuleType
} from "#/api/models/ai_hosting";
import type { ReportFilter } from "#/api/models/marketing";

/**
 * AI 智能托管 — 创建/编辑托管任务抽屉
 *
 * 配置任务名称、平台、执行模式、监控目标（账户/计划/广告三级任选其一）、规则判定方式与规则列表；
 * 每条规则下可配置「通知方式」（邮箱/飞书/钉钉 webhook，可多种并存，命中告警与执行成功时推送）。
 * 监控目标使用 antd 原生 Transfer 穿梭框选择，计划/广告层级额外提供账户、计划筛选。
 *
 * UI：全部由 ant-design-vue / vben 组件搭建（Card / Segmented / Row / Col / Transfer / Tag …），
 * 仅保留「AI 高级感」所需的样式微调，颜色取设计 token。
 */
import { computed, h, reactive, ref } from "vue";

import { useVbenDrawer } from "@vben/common-ui";

import { BellOutlined, ThunderboltOutlined } from "@ant-design/icons-vue";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Row,
  Segmented,
  Select,
  Spin,
  Switch,
  Tag,
  Transfer,
  Typography
} from "ant-design-vue";

import { advertiserApi, aiHostingApi, aManagementApi } from "#/api/core";
import { PLATFORM } from "#/constants/locales";

import {
  ACTION_TYPE_OPTIONS,
  ALERT_METHOD_OPTIONS,
  ALERT_VALUE_PLACEHOLDER,
  createDefaultAlertMethod,
  EXECUTION_MODE_OPTIONS,
  MAX_TARGET_COUNT,
  METRIC_OPTIONS,
  OPERATOR_OPTIONS,
  RULE_TYPE_MAP,
  RULE_TYPE_OPTIONS,
  RULES_MODE_HINT,
  RULES_MODE_OPTIONS,
  TARGET_LEVEL_HINT,
  TARGET_LEVEL_NAME,
  TARGET_LEVEL_OPTIONS
} from "./constants";

// ==================== 抽屉逻辑 ====================

const emit = defineEmits(["pageReload"]);

const isEdit = ref(false);

/** 打开抽屉时回显/初始化数据的加载状态：直接使用 Drawer 自带的 loading */
async function withPageLoading(task: Promise<void>) {
  drawerApi.setState({ loading: true });
  try {
    await task;
  } finally {
    drawerApi.setState({ loading: false });
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[75%]",
  closeOnClickModal: false,
  closeOnPressEscape: true,
  loading: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as HostingTask | {};
      if ((data as HostingTask)?.id) {
        isEdit.value = true;
        Object.assign(formData, data);
        void withPageLoading(syncFromTask(data as HostingTask));
      } else {
        isEdit.value = false;
        resetForm();
        void withPageLoading(initCreate());
      }
    }
  },
  onConfirm: async () => {
    if (!formData.name) {
      await message.warning("请输入任务名称");
      return;
    }
    if (formData.rules?.length === 0) {
      await message.warning("请至少添加一条规则");
      return;
    }
    if (targetKeys.value.length === 0) {
      await message.warning(`请至少选择一个监控${currentLevelName.value}`);
      return;
    }
    if (targetKeys.value.length > MAX_TARGET_COUNT) {
      await message.warning(`单次最多监控 ${MAX_TARGET_COUNT} 个目标`);
      return;
    }
    if (needAdvertiserFilter.value && filterAdvertiserIds.value.length === 0) {
      await message.warning("请先选择账户筛选条件");
      return;
    }

    Object.assign(formData, buildTargetPayload());

    // 显式带上监控层级与规则模式，避免提交体缺字段；通知方式剔除空地址行
    const payload: Partial<HostingTask> = {
      ...formData,
      rules: (formData.rules ?? []).map((rule) => ({
        ...rule,
        alertMethods: (rule.alertMethods ?? []).filter(
          (item) => item.alert_value && item.alert_value.trim()
        )
      })),
      target: currentTarget.value,
      rulesMode: formData.rulesMode ?? "all"
    };

    // 提交期间锁定抽屉：内置 spinner 覆盖内容、提交按钮 loading、禁止手动关闭
    drawerApi.lock();

    try {
      if (isEdit.value) {
        await aiHostingApi.fetchUpdateTask(payload);
        await message.success("更新成功");
      } else {
        await aiHostingApi.fetchCreateTask(payload);
        await message.success("创建成功");
      }
      emit("pageReload");
      await drawerApi.close();
    } catch (e) {
      console.error("[AI Hosting] 保存失败:", e);
    } finally {
      drawerApi.unlock();
    }
  }
});

// ==================== 表单数据 ====================

const formData = reactive<Partial<HostingTask>>({
  name: "",
  platform: "bytedance",
  executionMode: "auto" as ExecutionMode,
  advertiserIds: [],
  projectId: [],
  promotionIds: [],
  rules: [],
  rulesMode: "all",
  target: "advertiser" as HostingTarget,
  pollInterval: 15,
  taskStatus: "paused"
});

function resetForm() {
  formData.name = "";
  formData.platform = "bytedance";
  formData.executionMode = "auto";
  formData.advertiserIds = [];
  formData.projectId = [];
  formData.promotionIds = [];
  formData.rules = [];
  formData.rulesMode = "all";
  formData.target = "advertiser";
  formData.pollInterval = 15;
  formData.taskStatus = "paused";
}

// ==================== 监控目标 ====================

/** 当前监控层级 */
const currentTarget = computed<HostingTarget>(() => formData.target ?? "advertiser");
/** 当前层级对象称谓 */
const currentLevelName = computed(() => TARGET_LEVEL_NAME[currentTarget.value]);
/** 计划/广告层级需要账户筛选 */
const needAdvertiserFilter = computed(() => currentTarget.value !== "advertiser");
/** 广告层级需要计划筛选 */
const needCampaignFilter = computed(() => currentTarget.value === "promotion");

/** 已选目标 key */
const targetKeys = ref<string[]>([]);
/** 穿梭框数据源 */
const transferData = ref<{ key: string; title: string; description: string }[]>([]);
const targetLoading = ref(false);
/** 账户筛选值 */
const filterAdvertiserIds = ref<string[]>([]);
/** 计划筛选值 */
const filterCampaignIds = ref<string[]>([]);
/** 账户下拉选项 */
const advertiserOptions = ref<{ label: string; value: string }[]>([]);
const advertiserLoading = ref(false);
/** 计划下拉选项 */
const campaignOptions = ref<{ label: string; value: string }[]>([]);
const campaignLoading = ref(false);

/** 各层级 ID / 名称候选字段（兼容媒体原生列命名） */
const ID_FIELDS: Record<string, string[]> = {
  campaign: ["campaignId", "campaign_id"],
  promotion: ["promotionId", "promotion_id"]
};
const NAME_FIELDS: Record<string, string[]> = {
  campaign: ["campaignName", "campaign_name"],
  promotion: ["promotionName", "promotion_name"]
};

function pickField(row: Record<string, any>, fields: string[]): string {
  for (const field of fields) {
    const value = row?.[field];
    if (value !== undefined && value !== null && String(value) !== "") {
      return String(value);
    }
  }
  return "";
}

/** 组装列表接口筛选条件 */
function buildLevelFilters(level: string): ReportFilter[] {
  const filters: ReportFilter[] = [
    { field: "platform", operator: 1, values: [String(formData.platform)] }
  ];
  if (filterAdvertiserIds.value.length > 0) {
    filters.push({
      field: "platform_account_id",
      operator: 1,
      values: filterAdvertiserIds.value
    });
  }
  if (level === "promotion" && filterCampaignIds.value.length > 0) {
    filters.push({
      field: "campaignId",
      operator: 1,
      values: filterCampaignIds.value
    });
  }
  return filters;
}

/** 拉取指定层级列表（promotion/list） */
async function fetchLevelList(level: string) {
  const res: any = await aManagementApi.fetchAdManagementList({
    page: 1,
    pageSize: 500,
    level,
    filters: buildLevelFilters(level)
  });
  return (res?.items ?? []) as Record<string, any>[];
}

/** 加载账户下拉（按媒体） */
async function loadAdvertisers() {
  if (!formData.platform) return;
  advertiserLoading.value = true;
  try {
    const res: any = await advertiserApi.fetchAdvertiserList({
      page: 1,
      pageSize: 10_000,
      putStatue: 1,
      platform: formData.platform,
      advertiserRole: []
    });
    advertiserOptions.value = (res?.items ?? []).map((item: any) => ({
      label: `${item.advertiserName}（${item.advertiserId}）`,
      value: String(item.advertiserId)
    }));
  } finally {
    advertiserLoading.value = false;
  }
}

/** 加载计划下拉（广告层级筛选用） */
async function loadCampaignOptions() {
  if (!needCampaignFilter.value || filterAdvertiserIds.value.length === 0) {
    campaignOptions.value = [];
    return;
  }
  campaignLoading.value = true;
  try {
    const items = await fetchLevelList("campaign");
    campaignOptions.value = items
      .map((row) => {
        const id = pickField(row, ID_FIELDS.campaign!);
        const name = pickField(row, NAME_FIELDS.campaign!);
        return { label: name ? `${name}（${id}）` : id, value: id };
      })
      .filter((item) => item.value);
  } finally {
    campaignLoading.value = false;
  }
}

/**
 * 保证已选目标始终存在于穿梭框数据源
 * 筛选结果可能不含已选项（分页截断、账户筛选条件变化），缺失时以 ID 兜底，避免回显丢失
 */
function mergeSelectedKeys(
  list: { key: string; title: string; description: string }[]
) {
  const existed = new Set(list.map((item) => item.key));
  const missing = targetKeys.value
    .filter((key) => !existed.has(key))
    .map((key) => ({ key, title: key, description: "" }));
  return [...missing, ...list];
}

/** 待选目标原始行：目标 ID → 列表接口返回行，保存时用于推导上级层级 ID */
const transferRowMap = new Map<string, Record<string, any>>();

/** 上级层级 ID 候选字段（各媒体层级字段已统一，保留兼容写法） */
const PARENT_FIELDS: Record<string, string[]> = {
  advertiser: ["advertiserId", "advertiser_id", "platform_account_id"],
  campaign: ["campaignId", "campaign_id"]
};

/** 从已选目标的原始行推导上级层级 ID（去重） */
function collectParentIds(keys: string[], parent: string): string[] {
  const ids = new Set<string>();
  for (const key of keys) {
    const row = transferRowMap.get(key);
    if (!row) continue;
    const id = pickField(row, PARENT_FIELDS[parent]!);
    if (id) ids.add(id);
  }
  return [...ids];
}

/** 加载穿梭框待选数据 */
async function loadTargetList() {
  if (!formData.platform) return;
  // 计划/广告层级必须先选定账户，避免拉取到无关账户下的数据
  if (needAdvertiserFilter.value && filterAdvertiserIds.value.length === 0) {
    transferData.value = [];
    return;
  }
  targetLoading.value = true;
  try {
    if (currentTarget.value === "advertiser") {
      if (advertiserOptions.value.length === 0) await loadAdvertisers();
      transferData.value = mergeSelectedKeys(
        advertiserOptions.value.map((item) => ({
          key: item.value,
          title: item.label,
          description: ""
        }))
      );
      return;
    }
    const level = currentTarget.value;
    const items = await fetchLevelList(level);
    const list: { key: string; title: string; description: string }[] = [];
    for (const row of items) {
      const id = pickField(row, ID_FIELDS[level]!);
      if (!id) continue;
      transferRowMap.set(id, row);
      list.push({
        key: id,
        title: pickField(row, NAME_FIELDS[level]!) || id,
        description: id
      });
    }
    transferData.value = mergeSelectedKeys(list);
  } finally {
    targetLoading.value = false;
  }
}

/** 穿梭框数据源：已达上限时禁用未选项 */
const transferDataSource = computed(() => {
  const reached = targetKeys.value.length >= MAX_TARGET_COUNT;
  return transferData.value.map((item) => ({
    ...item,
    disabled: reached && !targetKeys.value.includes(item.key)
  }));
});

const transferTitles = computed<[string, string]>(() => [
  `待选${currentLevelName.value}`,
  `已选${currentLevelName.value}`
]);

const transferListStyle = {
  width: "calc(50% - 24px)",
  minWidth: "260px",
  height: "320px"
};

/** 穿梭框列表项渲染 */
function renderTransferItem(item: any) {
  return h("span", { class: "inline-flex items-center gap-2" }, [
    h("span", {}, item.title),
    item.description
      ? h(Typography.Text, { type: "secondary" }, {
          default: () => `（${item.description}）`
        })
      : null
  ]);
}

function filterTransferOption(inputValue: string, item: any) {
  const keyword = inputValue.toLowerCase();
  return `${item.title ?? ""}${item.description ?? ""}`
    .toLowerCase()
    .includes(keyword);
}

/** 切换监控层级 */
function handleTargetLevelChange(value: HostingTarget) {
  formData.target = value;
  targetKeys.value = [];
  filterCampaignIds.value = [];
  campaignOptions.value = [];
  if (value === "promotion") {
    void loadCampaignOptions();
  }
  void loadTargetList();
}

/** 切换媒体 */
async function handlePlatformChange() {
  filterAdvertiserIds.value = [];
  filterCampaignIds.value = [];
  campaignOptions.value = [];
  advertiserOptions.value = [];
  targetKeys.value = [];
  await loadAdvertisers();
  await loadTargetList();
}

/** 切换账户筛选 */
function handleAccountChange() {
  filterCampaignIds.value = [];
  targetKeys.value = [];
  void loadCampaignOptions();
  void loadTargetList();
}

/** 切换计划筛选 */
function handleCampaignChange() {
  targetKeys.value = [];
  void loadTargetList();
}

/**
 * 按监控层级组装写入后端的字段
 * 只保存当前层级及其以上层级的 ID：账户层级只存账户；计划层级存账户 + 计划；广告层级存账户 + 计划 + 广告
 * 上级层级 ID 优先从所选目标的原始行推导（列表接口已返回上级 ID），推导不到时回退到筛选值
 */
function buildTargetPayload() {
  const keys = [...targetKeys.value];
  if (currentTarget.value === "advertiser") {
    return { advertiserIds: keys, projectId: [], promotionIds: [] };
  }
  const parentAdvertiserIds = collectParentIds(keys, "advertiser");
  const advertiserIds =
    parentAdvertiserIds.length > 0
      ? parentAdvertiserIds
      : [...filterAdvertiserIds.value];
  if (currentTarget.value === "campaign") {
    return { advertiserIds, projectId: keys, promotionIds: [] };
  }
  const parentProjectIds = collectParentIds(keys, "campaign");
  const projectId =
    parentProjectIds.length > 0 ? parentProjectIds : [...filterCampaignIds.value];
  return { advertiserIds, projectId, promotionIds: keys };
}

/** 新建：初始化默认层级并加载账户 */
async function initCreate() {
  targetKeys.value = [];
  filterAdvertiserIds.value = [];
  filterCampaignIds.value = [];
  campaignOptions.value = [];
  await loadAdvertisers();
  await loadTargetList();
}

/** 合法的监控层级值 */
const VALID_TARGETS: HostingTarget[] = ["advertiser", "campaign", "promotion"];

/** 解析监控层级：接口未返回 target 时按已选层级数据反推 */
function resolveTarget(task: HostingTask): HostingTarget {
  const target = task.target as HostingTarget | undefined;
  if (target && VALID_TARGETS.includes(target)) return target;
  if (task.promotionIds?.length) return "promotion";
  if (task.projectId?.length) return "campaign";
  return "advertiser";
}

/** 编辑：回显层级、筛选条件与已选目标 */
async function syncFromTask(task: HostingTask) {
  const target = resolveTarget(task);
  formData.target = target;
  filterCampaignIds.value = [];
  campaignOptions.value = [];
  if (target === "advertiser") {
    filterAdvertiserIds.value = [];
    targetKeys.value = [...(task.advertiserIds ?? [])];
  } else if (target === "campaign") {
    filterAdvertiserIds.value = [...(task.advertiserIds ?? [])];
    targetKeys.value = [...(task.projectId ?? [])];
  } else {
    filterAdvertiserIds.value = [...(task.advertiserIds ?? [])];
    filterCampaignIds.value = [...(task.projectId ?? [])];
    targetKeys.value = [...(task.promotionIds ?? [])];
  }
  await loadAdvertisers();
  if (target === "promotion") await loadCampaignOptions();
  await loadTargetList();
}

// ==================== 规则管理 ====================

/** 添加规则 */
function addRule() {
  const rule: HostingRule = {
    name: `规则 ${formData.rules!.length + 1}`,
    type: "stop_loss" as RuleType,
    conditions: [createDefaultCondition()],
    conditionLogic: "AND",
    actions: [createDefaultAction()],
    enabled: true,
    report_day: 1,
    alertMethods: []
  };
  formData.rules!.push(rule);
}

/** 删除规则 */
function removeRule(index: number) {
  formData.rules!.splice(index, 1);
}

/** 添加条件 */
function createDefaultCondition(): RuleCondition {
  return { metric: "AdCost", operator: "gt", threshold: 0, duration: 30 };
}

function addCondition(rule: HostingRule) {
  rule.conditions.push(createDefaultCondition());
}

function removeCondition(rule: HostingRule, index: number) {
  rule.conditions.splice(index, 1);
}

/** 添加动作 */
function createDefaultAction(): RuleAction {
  return { type: "pause_ad" as ActionType, params: {} };
}

function addAction(rule: HostingRule) {
  rule.actions.push(createDefaultAction());
}

function removeAction(rule: HostingRule, index: number) {
  rule.actions.splice(index, 1);
}

/** 规则类型变化时重置条件和动作的默认值 */
function onRuleTypeChange(rule: HostingRule) {
  const type = rule.type;
  // 根据规则类型设置默认动作
  const defaultActions: Record<string, ActionType> = {
    stop_loss: "pause_ad",
    budget_optimize: "decrease_budget",
    bid_adjust: "decrease_bid",
    scale_up: "increase_budget"
  };
  rule.actions = [{ type: defaultActions[type] || "alert", params: {} }];
}

// ==================== 通知方式 ====================

/** 添加一条通知方式（邮箱/飞书/钉钉） */
function addAlertMethod(rule: HostingRule) {
  rule.alertMethods = rule.alertMethods ?? [];
  rule.alertMethods.push(createDefaultAlertMethod());
}

/** 删除指定通知方式 */
function removeAlertMethod(rule: HostingRule, index: number) {
  rule.alertMethods?.splice(index, 1);
}

/** 需「调整比例」的动作 */
const RATIO_ACTIONS: ActionType[] = [
  "increase_budget",
  "decrease_budget",
  "increase_bid",
  "decrease_bid"
];
/** 媒体可直接自动执行的动作 */
const AUTO_ACTIONS: ActionType[] = ["pause_ad", "resume_ad"];
</script>

<template>
  <Drawer :title="isEdit ? '编辑托管任务' : '创建托管任务'">
    <div class="create-hosting-form">
      <!-- AI 头部条 -->
      <Flex class="ai-strip" align="center" :gap="12">
        <span class="ai-badge">
          <ThunderboltOutlined />
          AI
        </span>
        <Flex vertical :gap="0">
          <Typography.Text strong>AI 盯盘托管</Typography.Text>
          <Typography.Text class="ai-strip__sub" type="secondary">
            配置规则 · 命中后自动处置，并按通知方式提醒
          </Typography.Text>
        </Flex>
      </Flex>

      <!-- ==================== 01 基本信息 ==================== -->
      <Card size="small" class="sec">
        <template #title>
          <span class="sec-title"><span class="step">01</span>基本信息</span>
        </template>
        <Form layout="vertical">
          <Row :gutter="16">
            <Col :span="12">
              <FormItem label="任务名称" required>
                <Input v-model:value="formData.name" placeholder="请输入任务名称" />
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="媒体">
                <Select
                  v-model:value="formData.platform"
                  :options="PLATFORM"
                  placeholder="请选择媒体"
                  @change="handlePlatformChange"
                />
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col :span="12">
              <FormItem label="执行模式">
                <Segmented
                  v-model:value="formData.executionMode"
                  :options="EXECUTION_MODE_OPTIONS"
                  block
                />
                <div class="mode-hint">
                  <span v-if="formData.executionMode === 'auto'">
                    系统自动执行所有规则，无需人工确认
                  </span>
                  <span v-else-if="formData.executionMode === 'manual'">
                    所有规则触发后需人工确认才执行
                  </span>
                  <span v-else>小操作自动执行，大操作需人工确认</span>
                </div>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="轮询间隔（分钟）">
                <InputNumber
                  v-model:value="formData.pollInterval"
                  :min="5"
                  :max="60"
                  :step="5"
                  style="width: 100%"
                />
                <div class="mode-hint">建议 5–60 分钟，越短越灵敏、成本略高</div>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>

      <!-- ==================== 02 监控目标 ==================== -->
      <Card size="small" class="sec">
        <template #title>
          <span class="sec-title">
            <span class="step">02</span>监控目标
            <span class="sec-count">
              已选 <b>{{ targetKeys.length }}</b> / {{ MAX_TARGET_COUNT }}
            </span>
          </span>
        </template>

        <Segmented
          :options="TARGET_LEVEL_OPTIONS"
          :value="currentTarget"
          block
          @change="(val: any) => handleTargetLevelChange(val as HostingTarget)"
        />
        <div class="mode-hint">{{ TARGET_LEVEL_HINT[currentTarget] }}</div>

        <Form v-if="needAdvertiserFilter" layout="vertical" class="target-filter">
          <Row :gutter="16">
            <Col :span="needCampaignFilter ? 12 : 24">
              <FormItem label="账户筛选">
                <Select
                  v-model:value="filterAdvertiserIds"
                  :options="advertiserOptions"
                  :loading="advertiserLoading"
                  mode="multiple"
                  allow-clear
                  show-search
                  option-filter-prop="label"
                  placeholder="请选择账户"
                  @change="handleAccountChange"
                />
              </FormItem>
            </Col>
            <Col v-if="needCampaignFilter" :span="12">
              <FormItem label="计划筛选">
                <Select
                  v-model:value="filterCampaignIds"
                  :options="campaignOptions"
                  :loading="campaignLoading"
                  mode="multiple"
                  allow-clear
                  show-search
                  option-filter-prop="label"
                  placeholder="请选择计划"
                  @change="handleCampaignChange"
                />
              </FormItem>
            </Col>
          </Row>
        </Form>

        <Spin :spinning="targetLoading">
          <Transfer
            v-model:target-keys="targetKeys"
            :data-source="transferDataSource"
            :titles="transferTitles"
            :list-style="transferListStyle"
            :render="renderTransferItem"
            :filter-option="filterTransferOption"
            show-search
            :locale="{
              itemUnit: '个',
              itemsUnit: '个',
              searchPlaceholder: '请输入搜索内容'
            }"
          />
        </Spin>

        <div class="mode-hint">
          单次最多监控 {{ MAX_TARGET_COUNT }} 个目标
          <template v-if="needAdvertiserFilter">
            ，切换账户或计划后待选列表会自动刷新，保存时自动带上所选目标的所属账户{{
              needCampaignFilter ? "与所属计划" : ""
            }}
          </template>
        </div>
      </Card>

      <!-- ==================== 03 规则与通知 ==================== -->
      <Card size="small" class="sec">
        <template #title>
          <span class="sec-title"><span class="step">03</span>规则与通知</span>
        </template>

        <Flex class="rule-mode" align="center" :gap="10">
          <span class="k">规则判定方式</span>
          <Segmented
            v-model:value="formData.rulesMode"
            :options="RULES_MODE_OPTIONS"
            size="small"
          />
          <Typography.Text class="mode-hint-inline" type="secondary">
            {{ RULES_MODE_HINT[formData.rulesMode ?? 'all'] }}
          </Typography.Text>
        </Flex>

        <Empty
          v-if="formData.rules!.length === 0"
          description="暂无规则，点击下方按钮添加"
        />

        <div
          v-for="(rule, ruleIndex) in formData.rules"
          :key="ruleIndex"
          class="rule"
        >
          <div class="rule-head">
            <Tag :bordered="false" :color="RULE_TYPE_MAP[rule.type]?.color">
              {{ RULE_TYPE_MAP[rule.type]?.label }}
            </Tag>
            <Input
              v-model:value="rule.name"
              class="rule-name"
              size="small"
              placeholder="规则名称"
            />
            <span class="spacer"></span>
            <span class="rule-enabled-label">启用</span>
            <Switch v-model:checked="rule.enabled" size="small" />
            <Button type="link" size="small" danger @click="removeRule(ruleIndex)">
              删除规则
            </Button>
          </div>

          <!-- 规则类型 -->
          <div class="rule-row">
            <span class="k">规则类型</span>
            <Select
              v-model:value="rule.type"
              :options="RULE_TYPE_OPTIONS"
              class="w-160"
              size="small"
              @change="onRuleTypeChange(rule)"
            />
          </div>

          <!-- 触发条件 -->
          <div class="block">
            <div class="block-head">
              <span class="k">触发条件</span>
              <Button type="link" size="small" @click="addCondition(rule)">
                + 添加条件
              </Button>
            </div>
            <div
              v-for="(cond, condIdx) in rule.conditions"
              :key="condIdx"
              class="cond-row"
            >
              <Select
                v-model:value="cond.metric"
                :options="METRIC_OPTIONS"
                class="w-130"
                size="small"
                placeholder="指标"
              />
              <Select
                v-model:value="cond.operator"
                :options="OPERATOR_OPTIONS"
                class="w-110"
                size="small"
                placeholder="比较"
              />
              <InputNumber
                v-model:value="cond.threshold"
                class="w-110"
                size="small"
                placeholder="阈值"
              />
              <span class="cond-tx">持续</span>
              <InputNumber
                v-model:value="cond.duration"
                class="w-80"
                size="small"
                placeholder="分钟"
              />
              <span class="cond-tx">分钟</span>
              <span class="spacer"></span>
              <Button
                v-if="rule.conditions.length > 1"
                type="link"
                size="small"
                danger
                @click="removeCondition(rule, condIdx)"
              >
                删除
              </Button>
            </div>
            <div v-if="rule.conditions.length > 1" class="cond-row">
              <span class="k">条件关系</span>
              <Select
                v-model:value="rule.conditionLogic"
                class="w-120"
                size="small"
                :options="[
                  { label: '且 (AND)', value: 'AND' },
                  { label: '或 (OR)', value: 'OR' }
                ]"
              />
            </div>
          </div>

          <!-- 执行动作 -->
          <div class="block">
            <div class="block-head">
              <span class="k">执行动作</span>
              <Button type="link" size="small" @click="addAction(rule)">
                + 添加动作
              </Button>
            </div>
            <div
              v-for="(act, actIdx) in rule.actions"
              :key="actIdx"
              class="cond-row"
            >
              <Select
                v-model:value="act.type"
                :options="ACTION_TYPE_OPTIONS"
                class="w-140"
                size="small"
                placeholder="动作"
              />
              <template v-if="RATIO_ACTIONS.includes(act.type)">
                <span class="cond-tx">调整比例</span>
                <InputNumber
                  v-model:value="act.params.ratio"
                  class="w-100"
                  size="small"
                  placeholder="百分比"
                  :min="1"
                  :max="100"
                />
                <span class="cond-tx">%</span>
              </template>
              <Tag v-if="AUTO_ACTIONS.includes(act.type)" :bordered="false" color="cyan">
                可自动执行
              </Tag>
              <span class="spacer"></span>
              <Button
                v-if="rule.actions.length > 1"
                type="link"
                size="small"
                danger
                @click="removeAction(rule, actIdx)"
              >
                删除
              </Button>
            </div>
          </div>

          <!-- 通知方式（数组表单） -->
          <div class="block notify">
            <div class="block-head">
              <span class="k k--notify">
                <BellOutlined />
                通知方式
              </span>
              <Button type="link" size="small" @click="addAlertMethod(rule)">
                + 添加通知方式
              </Button>
            </div>

            <Typography.Text
              v-if="!rule.alertMethods?.length"
              class="notify-empty"
              type="secondary"
            >
              未配置通知方式：仅记录留痕，不做消息推送
            </Typography.Text>

            <div
              v-for="(am, amIdx) in rule.alertMethods"
              :key="amIdx"
              class="notify-row"
              :class="`notify-row--${am.alert_method}`"
            >
              <Select
                v-model:value="am.alert_method"
                :options="ALERT_METHOD_OPTIONS"
                class="w-110"
                size="small"
              />
              <Input
                v-model:value="am.alert_value"
                :placeholder="ALERT_VALUE_PLACEHOLDER[am.alert_method]"
                class="notify-value"
                size="small"
              />
              <Button
                type="link"
                size="small"
                danger
                @click="removeAlertMethod(rule, amIdx)"
              >
                删除
              </Button>
            </div>

            <div class="mode-hint">
              仅告警、以及执行成功时，按上述方式推送；可多种并存
            </div>
          </div>
        </div>

        <Button type="dashed" block class="add-rule-btn" @click="addRule">
          + 添加规则
        </Button>
      </Card>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.create-hosting-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---- AI 头部条 ---- */
.ai-strip {
  padding: 10px 14px;
  background: linear-gradient(
    180deg,
    hsl(var(--primary) / 6%),
    hsl(var(--primary) / 2%)
  );
  border: 1px solid hsl(var(--primary) / 18%);
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.ai-badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--primary-foreground));
  letter-spacing: 0.5px;
  background: linear-gradient(
    135deg,
    hsl(var(--primary)),
    hsl(var(--primary) / 70%)
  );
  border-radius: 7px;
}

.ai-strip__sub {
  font-size: 12px;
}

/* ---- 分区卡片 ---- */
.sec {
  :deep(.ant-card-head) {
    min-height: auto;
    padding: 0 16px;
  }

  :deep(.ant-card-head-title) {
    padding: 12px 0;
  }

  :deep(.ant-card-body) {
    padding: 16px;
  }
}

.sec-title {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-weight: 600;
}

.step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 7px;
}

.sec-count {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.sec-count b {
  color: hsl(var(--primary));
}

.mode-hint {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.mode-hint-inline {
  font-size: 12px;
}

.target-filter {
  margin-top: 12px;
}

.rule-mode {
  margin-bottom: 10px;
}

/* ---- 规则卡 ---- */
.rule {
  position: relative;
  padding: 12px 14px 14px 16px;
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.rule::before {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    hsl(var(--primary)),
    hsl(var(--primary) / 40%)
  );
  content: '';
}

.rule-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.rule-name {
  width: 180px;
}

.rule-enabled-label {
  font-size: 13px;
  color: hsl(var(--foreground) / 65%);
}

.spacer {
  margin-left: auto;
}

.rule-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.k {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground) / 70%);
  white-space: nowrap;
}

.block {
  padding: 10px 12px;
  margin-top: 10px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cond-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.cond-row:last-child {
  margin-bottom: 0;
}

.cond-tx {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.w-80 {
  width: 80px;
}

.w-100 {
  width: 100px;
}

.w-110 {
  width: 110px;
}

.w-120 {
  width: 120px;
}

.w-130 {
  width: 130px;
}

.w-140 {
  width: 140px;
}

.w-160 {
  width: 160px;
}

/* ---- 通知方式 ---- */
.notify {
  background: linear-gradient(
    180deg,
    hsl(var(--primary) / 5%),
    hsl(var(--primary) / 2%)
  );
  border-color: hsl(var(--primary) / 16%);
}

.k--notify {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: hsl(var(--primary));
}

.notify-empty {
  font-size: 12px;
}

.notify-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-left: 8px;
  margin-bottom: 8px;
  border-left: 3px solid hsl(var(--border));
}

.notify-row--email {
  border-left-color: hsl(var(--primary));
}

.notify-row--feishu {
  border-left-color: hsl(var(--success));
}

.notify-row--dingtalk {
  border-left-color: hsl(var(--warning));
}

.notify-value {
  flex: 1;
}

.add-rule-btn {
  margin-top: 12px;
}
</style>
