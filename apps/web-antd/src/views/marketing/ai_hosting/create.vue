<script setup lang="ts" name="CreateHostingTask">
/**
 * AI 智能托管 — 创建/编辑托管任务抽屉
 *
 * 配置任务名称、平台、执行模式、托管账户、规则列表
 * 规则可动态添加/删除，每条规则包含触发条件和执行动作
 */
import { reactive, ref } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { Button, Card, Empty, Form, FormItem, Input, InputNumber, message, Select, Space, Switch, Tag } from 'ant-design-vue';
import { aiHostingApi } from '#/api/core';
import { PLATFORM } from '#/constants/locales';
import type { HostingTask, HostingRule, RuleCondition, RuleAction, ExecutionMode, RuleType, ActionType } from '#/api/models/ai_hosting';

import {
  EXECUTION_MODE_OPTIONS,
  RULE_TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
  METRIC_OPTIONS,
  OPERATOR_OPTIONS,
  RULE_TYPE_MAP,
} from './constants';

// ==================== 抽屉逻辑 ====================

const emit = defineEmits(['page-reload']);

const isEdit = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[600px]',
  closeOnClickModal: false,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as HostingTask | {};
      if ((data as HostingTask)?.id) {
        isEdit.value = true;
        Object.assign(formData, data);
      } else {
        isEdit.value = false;
        resetForm();
      }
    }
  },
  onConfirm: async () => {
    if (!formData.name) {
      message.warning('请输入任务名称');
      return;
    }
    if (formData.rules.length === 0) {
      message.warning('请至少添加一条规则');
      return;
    }

    try {
      if (isEdit.value) {
        await aiHostingApi.fetchUpdateTask(formData);
        message.success('更新成功');
      } else {
        await aiHostingApi.fetchCreateTask(formData);
        message.success('创建成功');
      }
      emit('page-reload');
      await drawerApi.close();
    } catch (e) {
      console.error('[AI Hosting] 保存失败:', e);
    }
  },
});

// ==================== 表单数据 ====================

const formData = reactive<Partial<HostingTask>>({
  name: '',
  platform: 'bytedance',
  executionMode: 'auto' as ExecutionMode,
  advertiserIds: [],
  rules: [],
  pollInterval: 15,
  status: 'paused',
});

function resetForm() {
  formData.name = '';
  formData.platform = 'bytedance';
  formData.executionMode = 'auto';
  formData.advertiserIds = [];
  formData.rules = [];
  formData.pollInterval = 15;
  formData.status = 'paused';
}

// ==================== 规则管理 ====================

/** 添加规则 */
function addRule() {
  const rule: HostingRule = {
    name: `规则 ${formData.rules!.length + 1}`,
    type: 'stop_loss' as RuleType,
    conditions: [createDefaultCondition()],
    conditionLogic: 'AND',
    actions: [createDefaultAction()],
    enabled: true,
  };
  formData.rules!.push(rule);
}

/** 删除规则 */
function removeRule(index: number) {
  formData.rules!.splice(index, 1);
}

/** 添加条件 */
function createDefaultCondition(): RuleCondition {
  return { metric: 'cost', operator: 'gt', threshold: 0, duration: 30 };
}

function addCondition(rule: HostingRule) {
  rule.conditions.push(createDefaultCondition());
}

function removeCondition(rule: HostingRule, index: number) {
  rule.conditions.splice(index, 1);
}

/** 添加动作 */
function createDefaultAction(): RuleAction {
  return { type: 'pause_ad' as ActionType, params: {} };
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
    stop_loss: 'pause_ad',
    budget_optimize: 'decrease_budget',
    bid_adjust: 'decrease_bid',
    scale_up: 'increase_budget',
  };
  rule.actions = [{ type: defaultActions[type] || 'alert', params: {} }];
}
</script>

<template>
  <Drawer :title="isEdit ? '编辑托管任务' : '创建托管任务'">
    <div class="create-hosting-form">
      <!-- 基本信息 -->
      <Card title="基本信息" size="small" class="form-section">
        <Form layout="vertical">
          <FormItem label="任务名称" required>
            <Input
              v-model:value="formData.name"
              placeholder="请输入任务名称"
            />
          </FormItem>

          <FormItem label="平台">
            <Select
              v-model:value="formData.platform"
              :options="PLATFORM"
              placeholder="请选择平台"
            />
          </FormItem>

          <FormItem label="执行模式">
            <Select
              v-model:value="formData.executionMode"
              :options="EXECUTION_MODE_OPTIONS"
            />
            <div class="mode-hint">
              <span v-if="formData.executionMode === 'auto'">
                系统自动执行所有规则，无需人工确认
              </span>
              <span v-else-if="formData.executionMode === 'manual'">
                所有规则触发后需人工确认才执行
              </span>
              <span v-else>
                小操作自动执行，大操作需人工确认
              </span>
            </div>
          </FormItem>

          <FormItem label="轮询间隔（分钟）">
            <InputNumber
              v-model:value="formData.pollInterval"
              :min="5"
              :max="60"
              :step="5"
              style="width: 100%"
            />
          </FormItem>
        </Form>
      </Card>

      <!-- 规则配置 -->
      <Card title="规则配置" size="small" class="form-section">
        <Empty
          v-if="formData.rules!.length === 0"
          description="暂无规则，点击下方按钮添加"
        />

        <div
          v-for="(rule, ruleIndex) in formData.rules"
          :key="ruleIndex"
          class="rule-card"
        >
          <div class="rule-header">
            <Tag :color="RULE_TYPE_MAP[rule.type]?.color" :bordered="false">
              {{ RULE_TYPE_MAP[rule.type]?.label }}
            </Tag>
            <Input
              v-model:value="rule.name"
              size="small"
              style="width: 200px"
              placeholder="规则名称"
            />
            <div class="rule-controls">
              <span class="rule-enabled-label">启用</span>
              <Switch v-model:checked="rule.enabled" size="small" />
              <Button type="link" size="small" danger @click="removeRule(ruleIndex)">
                删除规则
              </Button>
            </div>
          </div>

          <!-- 规则类型选择 -->
          <div class="rule-row">
            <span class="rule-label">规则类型</span>
            <Select
              v-model:value="rule.type"
              :options="RULE_TYPE_OPTIONS"
              size="small"
              style="width: 160px"
              @change="onRuleTypeChange(rule)"
            />
          </div>

          <!-- 触发条件 -->
          <div class="rule-section">
            <div class="rule-section-header">
              <span class="rule-label">触发条件</span>
              <Button type="link" size="small" @click="addCondition(rule)">
                + 添加条件
              </Button>
            </div>
            <div
              v-for="(cond, condIdx) in rule.conditions"
              :key="condIdx"
              class="condition-row"
            >
              <Select
                v-model:value="cond.metric"
                :options="METRIC_OPTIONS"
                size="small"
                style="width: 120px"
                placeholder="指标"
              />
              <Select
                v-model:value="cond.operator"
                :options="OPERATOR_OPTIONS"
                size="small"
                style="width: 100px"
                placeholder="比较"
              />
              <InputNumber
                v-model:value="cond.threshold"
                size="small"
                style="width: 120px"
                placeholder="阈值"
              />
              <span class="condition-text">持续</span>
              <InputNumber
                v-model:value="cond.duration"
                size="small"
                style="width: 80px"
                placeholder="分钟"
              />
              <span class="condition-text">分钟</span>
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
            <div v-if="rule.conditions.length > 1" class="logic-select">
              <span class="rule-label">条件关系</span>
              <Select
                v-model:value="rule.conditionLogic"
                size="small"
                style="width: 80px"
                :options="[
                  { label: '且 (AND)', value: 'AND' },
                  { label: '或 (OR)', value: 'OR' },
                ]"
              />
            </div>
          </div>

          <!-- 执行动作 -->
          <div class="rule-section">
            <div class="rule-section-header">
              <span class="rule-label">执行动作</span>
              <Button type="link" size="small" @click="addAction(rule)">
                + 添加动作
              </Button>
            </div>
            <div
              v-for="(act, actIdx) in rule.actions"
              :key="actIdx"
              class="action-row"
            >
              <Select
                v-model:value="act.type"
                :options="ACTION_TYPE_OPTIONS"
                size="small"
                style="width: 140px"
                placeholder="动作"
              />
              <template v-if="act.type === 'increase_budget' || act.type === 'decrease_budget' || act.type === 'increase_bid' || act.type === 'decrease_bid'">
                <span class="condition-text">调整比例</span>
                <InputNumber
                  v-model:value="act.params.ratio"
                  size="small"
                  style="width: 100px"
                  placeholder="百分比"
                  :min="1"
                  :max="100"
                />
                <span class="condition-text">%</span>
              </template>
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
        </div>

        <Button
          type="dashed"
          block
          class="add-rule-btn"
          @click="addRule"
        >
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

.form-section {
  :deep(.ant-card-body) {
    padding: 16px;
  }
}

.mode-hint {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.rule-card {
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rule-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-enabled-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rule-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
}

.rule-section {
  margin-bottom: 12px;
}

.rule-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.condition-row,
.action-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.condition-text {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.logic-select {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.add-rule-btn {
  margin-top: 8px;
}
</style>
