<script lang="ts">
/**
 * 项目级批量操作配置表单（启停/预算/ROI）
 *
 * - 全部应用：通过 v-model:config 绑定单个全局配置
 * - 单独设置：通过 buildProjectConfigChildren 生成表单数组列 schema
 */
import type { VbenFormSchema } from '#/adapter/form';

export interface ProjectConfig {
  optStatus: 'ENABLE' | 'DISABLE';
  budgetMode: string;
  budget: number | undefined;
  roiGoal: number | undefined;
}

export function makeDefaultProjectConfig(): ProjectConfig {
  return {
    optStatus: 'ENABLE',
    budgetMode: 'BUDGET_MODE_DAY',
    budget: undefined,
    roiGoal: undefined,
  };
}

/** 生成「单独设置」表单数组的配置列 schema */
export function buildProjectConfigChildren(
  operationType: string,
): VbenFormSchema[] {
  if (operationType === BatchOperationType.UPDATE_PROJECT_STATUS) {
    return [
      {
        component: 'RadioGroup',
        componentProps: {
          buttonStyle: 'solid',
          optionType: 'button',
          options: [
            { label: $t('marketing.promotionManager.status.enable'), value: 'ENABLE' },
            { label: $t('marketing.promotionManager.status.disable'), value: 'DISABLE' },
          ],
        },
        fieldName: 'optStatus',
        label: $t('marketing.promotionManager.form.status'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_PROJECT_BUDGET) {
    return [
      {
        component: 'RadioGroup',
        componentProps: {
          buttonStyle: 'solid',
          optionType: 'button',
          options: [
            { label: $t('marketing.promotionManager.budgetMode.day'), value: 'BUDGET_MODE_DAY' },
            { label: $t('marketing.promotionManager.budgetMode.total'), value: 'BUDGET_MODE_TOTAL' },
            {
              label: $t('marketing.promotionManager.budgetMode.infinite'),
              value: 'BUDGET_MODE_INFINITE',
            },
          ],
        },
        fieldName: 'budgetMode',
        label: $t('marketing.promotionManager.form.budgetType'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.budgetAmount'),
          precision: 2,
        },
        dependencies: {
          disabled: (_value, _actions, _controller, ctx) =>
            ctx?.row?.budgetMode === 'BUDGET_MODE_INFINITE',
          triggerFields: ['budgetMode'],
        },
        fieldName: 'budget',
        label: $t('marketing.promotionManager.form.budgetAmount'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_PROJECT_ROI) {
    return [
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.roiGoalShort'),
          precision: 2,
        },
        fieldName: 'roiGoal',
        label: $t('marketing.promotionManager.form.roiGoal'),
      },
    ];
  }

  return [];
}
</script>

<script setup lang="ts">
import { Alert, Form, FormItem, InputNumber, RadioButton, RadioGroup } from 'ant-design-vue';

import { $t } from '#/locales';

import { BatchOperationType } from '../../platformOptions';

defineProps<{
  operationType: string;
}>();

const config = defineModel<ProjectConfig>('config', { required: true });

const budgetModeOptions = [
  { label: $t('marketing.promotionManager.budgetMode.day'), value: 'BUDGET_MODE_DAY' },
  { label: $t('marketing.promotionManager.budgetMode.total'), value: 'BUDGET_MODE_TOTAL' },
  { label: $t('marketing.promotionManager.budgetMode.infinite'), value: 'BUDGET_MODE_INFINITE' },
];
</script>

<template>
  <Form layout="vertical" class="batch-config-form">
    <FormItem
      v-if="operationType === BatchOperationType.UPDATE_PROJECT_STATUS"
      :label="$t('marketing.promotionManager.form.status')"
    >
      <RadioGroup v-model:value="config.optStatus" button-style="solid">
        <RadioButton value="ENABLE">{{ $t('marketing.promotionManager.status.enable') }}</RadioButton>
        <RadioButton value="DISABLE">{{ $t('marketing.promotionManager.status.disable') }}</RadioButton>
      </RadioGroup>
    </FormItem>

    <template v-else-if="operationType === BatchOperationType.UPDATE_PROJECT_BUDGET">
      <FormItem :label="$t('marketing.promotionManager.form.budgetType')">
        <RadioGroup v-model:value="config.budgetMode" button-style="solid">
          <RadioButton v-for="opt in budgetModeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </RadioButton>
        </RadioGroup>
      </FormItem>
      <FormItem
        v-if="config.budgetMode !== 'BUDGET_MODE_INFINITE'"
        :label="$t('marketing.promotionManager.form.budgetAmount')"
        required
      >
        <InputNumber
          v-model:value="config.budget"
          :min="0"
          :precision="2"
          :placeholder="$t('marketing.promotionManager.form.placeholder.budgetAmount')"
          class="w-full"
        />
      </FormItem>
      <Alert
        v-else
        type="info"
        show-icon
        :message="$t('marketing.promotionManager.form.alert.infiniteBudget')"
      />
    </template>

    <FormItem
      v-else-if="operationType === BatchOperationType.UPDATE_PROJECT_ROI"
      :label="$t('marketing.promotionManager.form.roiGoal')"
      required
    >
      <InputNumber
        v-model:value="config.roiGoal"
        :min="0"
        :precision="2"
        :step="0.1"
        :placeholder="$t('marketing.promotionManager.form.placeholder.roiGoal')"
        class="w-full"
      />
    </FormItem>
  </Form>
</template>

<style scoped lang="scss">
.batch-config-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.batch-config-form :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}
</style>
