<script lang="ts">
/**
 * 广告创意级批量操作配置表单（启停/监测链接）
 *
 * - 全部应用：通过 v-model:config 绑定单个全局配置
 * - 单独设置：通过 buildPromotionConfigChildren 生成表单数组列 schema
 */
import type { VbenFormSchema } from '#/adapter/form';

export interface PromotionConfig {
  optStatus: 'ENABLE' | 'DISABLE';
  clickUrl: string;
  exposeUrl: string;
}

export function makeDefaultPromotionConfig(): PromotionConfig {
  return {
    optStatus: 'ENABLE',
    clickUrl: '',
    exposeUrl: '',
  };
}

/** 生成「单独设置」表单数组的配置列 schema */
export function buildPromotionConfigChildren(
  operationType: string,
): VbenFormSchema[] {
  if (operationType === BatchOperationType.UPDATE_PROMOTION_STATUS) {
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

  // update_promotion_monitor_url
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('marketing.promotionManager.form.placeholder.clickMonitorUrl'),
      },
      fieldName: 'clickUrl',
      label: $t('marketing.promotionManager.form.clickMonitorUrl'),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('marketing.promotionManager.form.placeholder.exposeMonitorUrl'),
      },
      fieldName: 'exposeUrl',
      label: $t('marketing.promotionManager.form.exposeMonitorUrl'),
    },
  ];
}
</script>

<script setup lang="ts">
import { Alert, Form, FormItem, Input, RadioButton, RadioGroup } from 'ant-design-vue';

import { $t } from '#/locales';

import { BatchOperationType } from '../../platformOptions';

defineProps<{
  operationType: string;
}>();

const config = defineModel<PromotionConfig>('config', { required: true });
</script>

<template>
  <Form layout="vertical" class="batch-config-form">
    <FormItem
      v-if="operationType === BatchOperationType.UPDATE_PROMOTION_STATUS"
      :label="$t('marketing.promotionManager.form.status')"
    >
      <RadioGroup v-model:value="config.optStatus" button-style="solid">
        <RadioButton value="ENABLE">{{ $t('marketing.promotionManager.status.enable') }}</RadioButton>
        <RadioButton value="DISABLE">{{ $t('marketing.promotionManager.status.disable') }}</RadioButton>
      </RadioGroup>
    </FormItem>

    <template v-else-if="operationType === BatchOperationType.UPDATE_PROMOTION_MONITOR_URL">
      <FormItem :label="$t('marketing.promotionManager.form.clickMonitorUrlFull')">
        <Input
          v-model:value="config.clickUrl"
          :placeholder="$t('marketing.promotionManager.form.placeholder.clickMonitorUrl')"
        />
      </FormItem>
      <FormItem :label="$t('marketing.promotionManager.form.exposeMonitorUrlFull')">
        <Input
          v-model:value="config.exposeUrl"
          :placeholder="$t('marketing.promotionManager.form.placeholder.exposeMonitorUrl')"
        />
      </FormItem>
      <Alert
        type="info"
        show-icon
        :message="$t('marketing.promotionManager.form.alert.monitorUrlRequired')"
      />
    </template>
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
