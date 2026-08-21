<!-- 素材报表筛选表单（字段对齐后端 material_report 接口支持的过滤维度） -->
<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useVbenForm, type VbenFormProps } from "@vben/common-ui";
import { ACTIVE_PLATFORM } from "#/constants/locales";
import { $t } from "@vben/locales";
import { advertiserApi } from "#/api";
import dayjs from 'dayjs';
import { useAdLinkage } from '../adreportdata/adDropdown';

// 素材报表支持维度（对应后端 Dimension.MATERIAL_REPORT_DIMENSION）
const MATERIAL_DIMS = [
  { label: $t('marketing.report.dims.hour'), value: 'hour' },
  { label: $t('marketing.report.dims.day'), value: 'day' },
  { label: $t('marketing.report.dims.week'), value: 'week' },
  { label: $t('marketing.report.dims.month'), value: 'month' },
  { label: $t('marketing.report.dims.year'), value: 'year' },
  { label: $t('marketing.report.dims.advertiser'), value: 'platform_account_id' },
  { label: '创意维度', value: 'creative_id' },
  { label: '计划维度', value: 'campaign_id' },
  { label: '广告组维度', value: 'adgroup_id' },
  { label: '广告维度', value: 'promotion_id' },
  { label: '平台维度', value: 'platform' },
];

// Props 定义
interface Props {
  initialValues?: Record<string, any>;
  showMetricField?: boolean;
  customSubmit?: boolean;
  isShowActions?: boolean;
  wrapperClass?: string;
  content?: string;
  onConfirm?: (values: any) => void;
  onCancel?: () => void;
  resetKey?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  showMetricField: true,
  customSubmit: false,
  isShowActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  content: '确认',
  onConfirm: undefined,
  onCancel: undefined
});

watch(
  () => props.resetKey,
  async (newKey, oldKey) => {
    if (newKey !== oldKey && newKey !== undefined) {
      await resetFormToDefault();
    }
  },
  { immediate: true, deep: true }
);

const emits = defineEmits<{
  submit: [values: any];
  reset: [];
  'update:values': [values: any];
}>();

const selectPlatform = ref<string | null>(null);
const {
  planOptions,
  advertisementOptions,
  adGroupOptions,
  creativityOptions,
  loadAdLinkage,
  resetLoadedMap,
  setFormApi,
} = useAdLinkage();

const filterCriteria = ref();

// 重置表单的方法
async function resetFormToDefault() {
  // 1. 重置标准表单字段
  await formApi.resetForm();

  // 2. 显式清空所有自定义字段（防止组件内部状态残留）
  await formApi.setFieldValue('advertiserId', []);   // HybridSearchSelect 清空
  await formApi.setFieldValue('campaign_id', []);      // 计划
  await formApi.setFieldValue('promotion_id', []);     // 广告
  await formApi.setFieldValue('adgroup_id', []);       // 广告组
  await formApi.setFieldValue('creative_id', []);      // 创意
  await formApi.setFieldValue('queryMetric', []);

  // 3. 重置联动选项的加载状态（清空已缓存的选项列表）
  await resetLoadedMap();

  // 4. 重新设置默认值
  await formApi.setFieldValue('dateTimeRange', [
    dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ]);
  await formApi.setFieldValue('dims', ['day']);
}

// 表单配置
const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'RangePicker',
      defaultValue: [
        dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
      ],
      componentProps: {
        placeholder: [`${$t('common.select')}`, `${$t('common.select')}`],
        format: ['YYYY-MM-DD', 'YYYY-MM-DD'],
        valueFormat: 'YYYY-MM-DD',
        disabledDate: (current: any) => {
          return current && current > dayjs().endOf('day');
        },
      },
      fieldName: 'dateTimeRange',
      label: 'Time',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        mode: 'multiple',
        maxTagCount: 1,
        placeholder: `${$t('common.choice')}`,
        onChange: async () => {
          resetLoadedMap();
          const values = await formApi.getValues();
          selectPlatform.value = values.platform?.join(',');
        }
      },
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: MATERIAL_DIMS,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
        maxTagCount: 1
      },
      defaultValue: ['day'],
      fieldName: 'dims',
      label: `${$t('marketing.report.dims.title')}`,
    },
    {
      component: 'HybridSearchSelect',
      componentProps: {
        mode: 'multiple',
        maxTagCount: 1,
        placeholder: `${$t('common.select')}`,
        allowClear: true,
        initialApi: async () => {
          const formData = await formApi.getValues();
          selectPlatform.value = formData.platform?.join(',');
          const res = await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 1000,
            putStatue: 1,
            platform: selectPlatform.value ?? undefined,
            advertiserRole: [],
          });
          if (res.items) {
            res.items = res.items.map((item: any) => ({
              ...item,
              displayName: `${item.advertiserName}-${item.advertiserId}`
            }));
          }
          return res;
        },
        remoteApi: async (params: any) => {
          const res = await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 1000,
            putStatue: 1,
            platform: selectPlatform.value ?? undefined,
            advertiserId: params.keyword,
            advertiserRole: [],
          });
          if (res.items) {
            res.items = res.items.map((item: any) => ({
              ...item,
              displayName: `${item.advertiserName}-${item.advertiserId}`
            }));
          }
          return res;
        },
        valueField: 'advertiserId',
        labelField: 'displayName',
        resultField: 'items',
        remoteSearchField: 'keyword',
        searchDebounce: 300,
        remoteSearchMinLength: 1,
        clearSearchOnSelect: true,
        selectPlatform: selectPlatform,
        onChange: () => {
          resetLoadedMap();
        }
      },
      dependencies: {
        triggerFields: ['platform'],
        if: (value: any) => {
          return value.platform?.length > 0;
        }
      },
      fieldName: 'advertiserId',
      label: `${$t('marketing.advertiser.columns.advertiserName')}`,
    },
    ...(props.showMetricField ? [{
      defaultValue: [],
      fieldName: 'queryMetric',
      label: '指标',
      rules: 'required',
      component: 'ApiSelect',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    }] : []),
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 1,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: planOptions,
        onFocus: async () => {
          await loadAdLinkage('campaign');
        },
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'campaign_id',
      label: '计划',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 1,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: advertisementOptions,
        onFocus: async () => {
          await loadAdLinkage('promotion');
        },
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'promotion_id',
      label: '广告',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 1,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: adGroupOptions,
        onFocus: async () => {
          await loadAdLinkage('adgroup');
        },
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'adgroup_id',
      label: '广告组',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 1,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: creativityOptions,
        onFocus: async () => {
          await loadAdLinkage('creative');
        },
      },
      fieldName: 'creative_id',
      label: '创意',
    },
  ],
  showDefaultActions: props.isShowActions,
  submitOnEnter: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: props.wrapperClass,
  submitButtonOptions: {
    content: props.content,
  },
  layout: 'horizontal',
  handleSubmit: props.customSubmit ? undefined : async (values) => {
    emits('submit', values);
    filterCriteria.value = values
    if (props.onConfirm) {
      props.onConfirm(values);
    }
  },
  handleReset: props.customSubmit ? undefined : async () => {
    await resetFormToDefault();
    emits('reset');
    if (props.onCancel) {
      props.onCancel();
    }
  },
};

// 创建表单实例
const [FormComponent, formApi] = useVbenForm(formOptions);
setFormApi(formApi);

// 监听 initialValues 变化，回显数据
watch(
  () => props.initialValues,
  async (newVal) => {
    // 如果没有值或者空对象，重置表单
    if (!newVal || Object.keys(newVal).length === 0) {
      await resetFormToDefault();
      return;
    }

    // 有值时才回显
    await nextTick();
    const valuesToSet = { ...newVal };
    if (newVal.subscribeDateTimeRange && !newVal.dateTimeRange) {
      valuesToSet.dateTimeRange = newVal.subscribeDateTimeRange;
    }

    // 设置表单值
    await formApi.setValues(valuesToSet);
    if (newVal.platform && newVal.platform.length > 0) {
      selectPlatform.value = newVal.platform.join(',');
    }
  },
  { deep: true, immediate: true }
);

// 暴露方法给父组件
defineExpose({
  getValues: () => formApi.getValues(),
  setValues: (values: any) => formApi.setValues(values),
  resetForm: () => resetFormToDefault(),
  submitForm: () => formApi.submitForm(),
  setFieldValue: (field: string, value: any) => formApi.setFieldValue(field, value),
  getFormApi: () => formApi,
});
</script>

<template>
  <FormComponent />
</template>
