<script lang="ts">
/**
 * 广告组级批量操作配置表单（启停/基础出价/日限额/投放时间/转化出价/深度转化出价/免一阶/Deeplink/ROI）
 *
 * - 全部应用：通过 v-model:config 绑定单个全局配置
 * - 单独设置：通过 buildAdGroupConfigChildren 生成表单数组列 schema
 * 注：open_adgroup_default_second_stage 无配置参数，由父组件单独渲染提示，不使用本表单。
 *     投放起止时间（update_adgroup_datetime）只用一组值，同样只在「全部应用」下渲染本表单。
 *
 * 媒体差异（由 platform 传入）：
 * - 腾讯（tencent）update_adgroup_price 只支持绝对值出价，字段为 bid_amount（分），不提供按比例与计费方式
 */
import type { VbenFormSchema } from '#/adapter/form';

export interface AdGroupConfig {
  optStatus: 'ENABLE' | 'DISABLE';
  priceMode: 'price' | 'percent';
  price: number | undefined;
  percent: number | undefined;
  ocpcMode: 'value' | 'percent';
  ocpcPrice: number | undefined;
  ocpcPercent: number | undefined;
  deepMode: 'value' | 'percent';
  deepOcpcPrice: number | undefined;
  deepOcpcPercent: number | undefined;
  billingType: number | undefined;
  deepUrl: string;
  roiMode: 'value' | 'percent';
  targetROI: number | undefined;
  targetROIPercent: number | undefined;
  dailyBudget: number | undefined;
  beginDate: string;
  endDate: string;
  timeSeries: string;
}

export function makeDefaultAdGroupConfig(): AdGroupConfig {
  return {
    optStatus: 'ENABLE',
    priceMode: 'price',
    price: undefined,
    percent: undefined,
    ocpcMode: 'value',
    ocpcPrice: undefined,
    ocpcPercent: undefined,
    deepMode: 'value',
    deepOcpcPrice: undefined,
    deepOcpcPercent: undefined,
    billingType: undefined,
    deepUrl: '',
    roiMode: 'value',
    targetROI: undefined,
    targetROIPercent: undefined,
    dailyBudget: undefined,
    beginDate: '',
    endDate: '',
    timeSeries: '',
  };
}

const billingTypeSchemaOptions = [
  { label: 'CPD', value: 1 },
  { label: 'CPC', value: 2 },
  { label: 'CPM', value: 3 },
  { label: 'CPS', value: 4 },
  { label: 'OCPC', value: 5 },
  { label: 'CPA', value: 6 },
];

const statusColumn: VbenFormSchema = {
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
};

const modifyModeColumn = (modeField: string): VbenFormSchema => ({
  component: 'RadioGroup',
  componentProps: {
    buttonStyle: 'solid',
    optionType: 'button',
    options: [
      { label: $t('marketing.promotionManager.form.specifyPrice'), value: 'value' },
      { label: $t('marketing.promotionManager.form.byPercent'), value: 'percent' },
    ],
  },
  fieldName: modeField,
  label: $t('marketing.promotionManager.form.modifyMode'),
});

/** 生成「单独设置」表单数组的配置列 schema */
export function buildAdGroupConfigChildren(
  operationType: string,
  platform?: string,
): VbenFormSchema[] {
  if (operationType === BatchOperationType.UPDATE_ADGROUP_STATUS) {
    return [statusColumn];
  }

  if (operationType === BatchOperationType.UPDATE_ADGROUP_DAILY_BUDGET) {
    return [
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.dailyBudgetShort'),
          precision: 2,
        },
        fieldName: 'dailyBudget',
        label: $t('marketing.promotionManager.form.dailyBudget'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_ADGROUP_PRICE) {
    // 腾讯只支持绝对值出价：只保留出价输入，不提供按比例与计费方式
    if (platform === MediaPlatform.TENCENT) {
      return [
        {
          component: 'InputNumber',
          componentProps: {
            min: 0,
            placeholder: $t('marketing.promotionManager.form.placeholder.priceShort'),
            precision: 2,
          },
          fieldName: 'price',
          label: $t('marketing.promotionManager.form.basePrice'),
        },
      ];
    }
    return [
      {
        component: 'RadioGroup',
        componentProps: {
          buttonStyle: 'solid',
          optionType: 'button',
          options: [
            { label: $t('marketing.promotionManager.form.specifyPrice'), value: 'price' },
            { label: $t('marketing.promotionManager.form.byPercent'), value: 'percent' },
          ],
        },
        fieldName: 'priceMode',
        label: $t('marketing.promotionManager.form.modifyMode'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.priceShort'),
          precision: 2,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.priceMode !== 'price',
          triggerFields: ['priceMode'],
        },
        fieldName: 'price',
        label: $t('marketing.promotionManager.form.basePrice'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.percent'),
          precision: 0,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.priceMode !== 'percent',
          triggerFields: ['priceMode'],
        },
        fieldName: 'percent',
        label: $t('marketing.promotionManager.form.percent'),
      },
      {
        component: 'Select',
        componentProps: {
          options: billingTypeSchemaOptions,
          placeholder: $t('marketing.promotionManager.form.billingType'),
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.priceMode !== 'price',
          triggerFields: ['priceMode'],
        },
        fieldName: 'billingType',
        label: $t('marketing.promotionManager.form.billingType'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE) {
    return [
      modifyModeColumn('ocpcMode'),
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.ocpcPriceShort'),
          precision: 2,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.ocpcMode !== 'value',
          triggerFields: ['ocpcMode'],
        },
        fieldName: 'ocpcPrice',
        label: $t('marketing.promotionManager.form.targetOcpcPrice'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.percent'),
          precision: 0,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.ocpcMode !== 'percent',
          triggerFields: ['ocpcMode'],
        },
        fieldName: 'ocpcPercent',
        label: $t('marketing.promotionManager.form.ocpcPercent'),
      },
      {
        component: 'Select',
        componentProps: {
          options: billingTypeSchemaOptions,
          placeholder: $t('marketing.promotionManager.form.billingType'),
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.ocpcMode !== 'value',
          triggerFields: ['ocpcMode'],
        },
        fieldName: 'billingType',
        label: $t('marketing.promotionManager.form.billingType'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE) {
    return [
      modifyModeColumn('deepMode'),
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.deepOcpcPriceShort'),
          precision: 2,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.deepMode !== 'value',
          triggerFields: ['deepMode'],
        },
        fieldName: 'deepOcpcPrice',
        label: $t('marketing.promotionManager.form.deepOcpcPrice'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.percent'),
          precision: 0,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.deepMode !== 'percent',
          triggerFields: ['deepMode'],
        },
        fieldName: 'deepOcpcPercent',
        label: $t('marketing.promotionManager.form.deepOcpcPercent'),
      },
      {
        component: 'Select',
        componentProps: {
          options: billingTypeSchemaOptions,
          placeholder: $t('marketing.promotionManager.form.billingType'),
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.deepMode !== 'value',
          triggerFields: ['deepMode'],
        },
        fieldName: 'billingType',
        label: $t('marketing.promotionManager.form.billingType'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_ADGROUP_DEEPLINK) {
    return [
      {
        component: 'Input',
        componentProps: {
          placeholder: $t('marketing.promotionManager.form.placeholder.deeplinkShort'),
        },
        fieldName: 'deepUrl',
        label: $t('marketing.promotionManager.form.deeplink'),
      },
    ];
  }

  if (operationType === BatchOperationType.UPDATE_ADGROUP_ROI) {
    return [
      {
        component: 'RadioGroup',
        componentProps: {
          buttonStyle: 'solid',
          optionType: 'button',
          options: [
            { label: $t('marketing.promotionManager.form.specifyCoefficient'), value: 'value' },
            { label: $t('marketing.promotionManager.form.byRatio'), value: 'percent' },
          ],
        },
        fieldName: 'roiMode',
        label: $t('marketing.promotionManager.form.modifyMode'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.roi'),
          precision: 0,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.roiMode !== 'value',
          triggerFields: ['roiMode'],
        },
        fieldName: 'targetROI',
        label: $t('marketing.promotionManager.form.roi'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: $t('marketing.promotionManager.form.placeholder.roiRatioShort'),
          precision: 0,
        },
        dependencies: {
          disabled: (_v, _a, _c, ctx) => ctx?.row?.roiMode !== 'percent',
          triggerFields: ['roiMode'],
        },
        fieldName: 'targetROIPercent',
        label: $t('marketing.promotionManager.form.roiPercent'),
      },
    ];
  }

  return [];
}
</script>

<script setup lang="ts">
import {
  Alert,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  RadioButton,
  RadioGroup,
  Select,
} from 'ant-design-vue';
import { computed } from 'vue';

import { $t } from '#/locales';

import TimeSelectionPeriod from '#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue';

import { BatchOperationType, MediaPlatform } from '../../platformOptions';

const props = defineProps<{
  operationType: string;
  /** 媒体标识，用于处理同操作类型下的媒体参数差异（如腾讯出价） */
  platform?: string;
}>();

const config = defineModel<AdGroupConfig>('config', { required: true });

/** 腾讯：出价只支持绝对值，隐藏按比例与计费方式 */
const isTencent = computed(() => props.platform === MediaPlatform.TENCENT);

const billingTypeOptions = [
  { label: 'CPD', value: 1 },
  { label: 'CPC', value: 2 },
  { label: 'CPM', value: 3 },
  { label: 'CPS', value: 4 },
  { label: 'OCPC', value: 5 },
  { label: 'CPA', value: 6 },
];
</script>

<template>
  <Form layout="vertical" class="batch-config-form">
    <!-- 启停 -->
    <FormItem
      v-if="operationType === BatchOperationType.UPDATE_ADGROUP_STATUS"
      :label="$t('marketing.promotionManager.form.status')"
    >
      <RadioGroup v-model:value="config.optStatus" button-style="solid">
        <RadioButton value="ENABLE">{{ $t('marketing.promotionManager.status.enable') }}</RadioButton>
        <RadioButton value="DISABLE">{{ $t('marketing.promotionManager.status.disable') }}</RadioButton>
      </RadioGroup>
    </FormItem>

    <!-- 基础出价 -->
    <template v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_PRICE">
      <!-- 腾讯只支持绝对值出价，不展示修改方式与计费方式 -->
      <template v-if="isTencent">
        <FormItem :label="$t('marketing.promotionManager.form.basePrice')" required>
          <InputNumber
            v-model:value="config.price"
            :min="0"
            :precision="2"
            :placeholder="$t('marketing.promotionManager.form.placeholder.basePrice')"
            class="w-full"
          />
        </FormItem>
        <Alert
          type="info"
          show-icon
          :message="$t('marketing.promotionManager.form.alert.tencentBidAbsolute')"
        />
      </template>
      <template v-else>
        <FormItem :label="$t('marketing.promotionManager.form.modifyMode')">
          <RadioGroup v-model:value="config.priceMode" button-style="solid">
            <RadioButton value="price">{{ $t('marketing.promotionManager.form.specifyPrice') }}</RadioButton>
            <RadioButton value="percent">{{ $t('marketing.promotionManager.form.byPercent') }}</RadioButton>
          </RadioGroup>
        </FormItem>
        <template v-if="config.priceMode === 'price'">
          <FormItem :label="$t('marketing.promotionManager.form.basePrice')" required>
            <InputNumber
              v-model:value="config.price"
              :min="0"
              :precision="2"
              :placeholder="$t('marketing.promotionManager.form.placeholder.basePrice')"
              class="w-full"
            />
          </FormItem>
          <FormItem :label="$t('marketing.promotionManager.form.billingType')" required>
            <Select
              v-model:value="config.billingType"
              :options="billingTypeOptions"
              :placeholder="$t('marketing.promotionManager.form.placeholder.billingType')"
              class="w-full"
            />
          </FormItem>
        </template>
        <FormItem v-else :label="$t('marketing.promotionManager.form.percent')" required>
          <InputNumber
            v-model:value="config.percent"
            :min="0"
            :precision="0"
            :placeholder="$t('marketing.promotionManager.form.placeholder.percent')"
            class="w-full"
          />
        </FormItem>
      </template>
    </template>

    <!-- 营销单元日限额 -->
    <template v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_DAILY_BUDGET">
      <FormItem :label="$t('marketing.promotionManager.form.dailyBudget')" required>
        <InputNumber
          v-model:value="config.dailyBudget"
          :min="0"
          :precision="2"
          :placeholder="$t('marketing.promotionManager.form.placeholder.dailyBudget')"
          class="w-full"
        />
      </FormItem>
      <Alert
        v-if="isTencent"
        type="info"
        show-icon
        :message="$t('marketing.promotionManager.form.alert.tencentDailyBudget')"
      />
    </template>

    <!-- 营销单元投放起止时间与投放时段 -->
    <template v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_DATETIME">
      <FormItem :label="$t('marketing.promotionManager.form.beginDate')">
        <DatePicker
          v-model:value="config.beginDate"
          value-format="YYYY-MM-DD"
          :placeholder="$t('marketing.promotionManager.form.placeholder.beginDate')"
          class="w-full"
        />
      </FormItem>
      <FormItem :label="$t('marketing.promotionManager.form.endDate')">
        <DatePicker
          v-model:value="config.endDate"
          value-format="YYYY-MM-DD"
          :placeholder="$t('marketing.promotionManager.form.placeholder.endDate')"
          class="w-full"
        />
      </FormItem>
      <FormItem :label="$t('marketing.promotionManager.form.timeSeries')">
        <TimeSelectionPeriod v-model="config.timeSeries" />
      </FormItem>
      <Alert
        type="info"
        show-icon
        :message="$t('marketing.promotionManager.form.alert.datetimeAtLeastOne')"
      />
    </template>

    <!-- 转化出价 -->
    <template v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE">
      <FormItem :label="$t('marketing.promotionManager.form.modifyMode')">
        <RadioGroup v-model:value="config.ocpcMode" button-style="solid">
          <RadioButton value="value">{{ $t('marketing.promotionManager.form.specifyPrice') }}</RadioButton>
          <RadioButton value="percent">{{ $t('marketing.promotionManager.form.byPercent') }}</RadioButton>
        </RadioGroup>
      </FormItem>
      <template v-if="config.ocpcMode === 'value'">
        <FormItem :label="$t('marketing.promotionManager.form.targetOcpcPrice')" required>
          <InputNumber
            v-model:value="config.ocpcPrice"
            :min="0"
            :precision="2"
            :placeholder="$t('marketing.promotionManager.form.placeholder.targetOcpcPrice')"
            class="w-full"
          />
        </FormItem>
        <FormItem :label="$t('marketing.promotionManager.form.billingType')" required>
          <Select
            v-model:value="config.billingType"
            :options="billingTypeOptions"
            :placeholder="$t('marketing.promotionManager.form.placeholder.billingType')"
            class="w-full"
          />
        </FormItem>
      </template>
      <FormItem v-else :label="$t('marketing.promotionManager.form.ocpcPercent')" required>
        <InputNumber
          v-model:value="config.ocpcPercent"
          :min="0"
          :precision="0"
          :placeholder="$t('marketing.promotionManager.form.placeholder.percent')"
          class="w-full"
        />
      </FormItem>
    </template>

    <!-- 深度转化出价 -->
    <template v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE">
      <FormItem :label="$t('marketing.promotionManager.form.modifyMode')">
        <RadioGroup v-model:value="config.deepMode" button-style="solid">
          <RadioButton value="value">{{ $t('marketing.promotionManager.form.specifyPrice') }}</RadioButton>
          <RadioButton value="percent">{{ $t('marketing.promotionManager.form.byPercent') }}</RadioButton>
        </RadioGroup>
      </FormItem>
      <template v-if="config.deepMode === 'value'">
        <FormItem :label="$t('marketing.promotionManager.form.deepOcpcPrice')" required>
          <InputNumber
            v-model:value="config.deepOcpcPrice"
            :min="0"
            :precision="2"
            :placeholder="$t('marketing.promotionManager.form.placeholder.deepOcpcPrice')"
            class="w-full"
          />
        </FormItem>
        <FormItem :label="$t('marketing.promotionManager.form.billingType')" required>
          <Select
            v-model:value="config.billingType"
            :options="billingTypeOptions"
            :placeholder="$t('marketing.promotionManager.form.placeholder.billingType')"
            class="w-full"
          />
        </FormItem>
      </template>
      <FormItem v-else :label="$t('marketing.promotionManager.form.deepOcpcPercent')" required>
        <InputNumber
          v-model:value="config.deepOcpcPercent"
          :min="0"
          :precision="0"
          :placeholder="$t('marketing.promotionManager.form.placeholder.percent')"
          class="w-full"
        />
      </FormItem>
    </template>

    <!-- Deeplink -->
    <FormItem
      v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_DEEPLINK"
      :label="$t('marketing.promotionManager.form.deeplink')"
      required
    >
      <Input
        v-model:value="config.deepUrl"
        :placeholder="$t('marketing.promotionManager.form.placeholder.deeplink')"
      />
    </FormItem>

    <!-- ROI 系数 -->
    <template v-else-if="operationType === BatchOperationType.UPDATE_ADGROUP_ROI">
      <FormItem :label="$t('marketing.promotionManager.form.modifyMode')">
        <RadioGroup v-model:value="config.roiMode" button-style="solid">
          <RadioButton value="value">{{ $t('marketing.promotionManager.form.specifyCoefficient') }}</RadioButton>
          <RadioButton value="percent">{{ $t('marketing.promotionManager.form.byRatio') }}</RadioButton>
        </RadioGroup>
      </FormItem>
      <FormItem
        v-if="config.roiMode === 'value'"
        :label="$t('marketing.promotionManager.form.roi')"
        required
      >
        <InputNumber
          v-model:value="config.targetROI"
          :min="0"
          :precision="0"
          :placeholder="$t('marketing.promotionManager.form.placeholder.roi')"
          class="w-full"
        />
      </FormItem>
      <FormItem v-else :label="$t('marketing.promotionManager.form.roiPercent')" required>
        <InputNumber
          v-model:value="config.targetROIPercent"
          :min="0"
          :precision="0"
          :placeholder="$t('marketing.promotionManager.form.placeholder.roiPercent')"
          class="w-full"
        />
      </FormItem>
    </template>

    <!-- 兜底提示（理论上不会走到） -->
    <Alert
      v-else
      type="info"
      show-icon
      :message="$t('marketing.promotionManager.form.alert.noConfig')"
    />
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
