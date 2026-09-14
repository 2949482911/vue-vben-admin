<!-- 素材报表筛选表单（字段对齐后端 material_report 接口支持的过滤维度） -->
<script setup lang="ts">
import { computed, nextTick, ref, unref, watch } from "vue";

import { useVbenForm, type VbenFormProps } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { Tag, Typography } from "ant-design-vue";
import dayjs from 'dayjs';

import { advertiserApi } from "#/api";
import { ACTIVE_PLATFORM } from "#/constants/locales";

import { useAdLinkage } from '../adreportdata/adDropdown';

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  showMetricField: true,
  customSubmit: false,
  isShowActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  content: '确认',
  resultTotal: 0,
  onConfirm: undefined,
  onCancel: undefined
});

const emits = defineEmits<{
  submit: [values: any];
  reset: [];
  'update:values': [values: any];
}>();

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
  /** 查询命中的行数，用于已选条件行展示 */
  resultTotal?: number;
  onConfirm?: (values: any) => void;
  onCancel?: () => void;
  resetKey?: number;
}

watch(
  () => props.resetKey,
  async (newKey, oldKey) => {
    if (newKey !== oldKey && newKey !== undefined) {
      await resetFormToDefault();
    }
  },
  { immediate: true, deep: true }
);

const selectPlatform = ref<null | string>(null);
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
  await syncActiveValues();
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
    // ===== 基础三项：时间范围 / 维度 / 平台（折叠态默认展示一行）=====
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
    // ===== 高级筛选：账户及以下层级，默认收起 =====
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
        selectPlatform,
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
      // 素材报表后端不支持按账户过滤行数据，该字段只用于收窄计划/广告/创意下拉范围
      label: `${$t('marketing.advertiser.columns.advertiserName')}（仅收窄下级范围）`,
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
  // 折叠态只展示基础三项所在的一行，其余字段通过「展开」查看
  collapsed: true,
  collapsedRows: 1,
  showCollapseButton: true,
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
    await syncActiveValues();
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

/* ---------------- 已选条件回显 ---------------- */

/** 当前生效的查询条件（提交、重置、模板回显后同步） */
const activeValues = ref<Record<string, any>>({});
/** 不在已选条件行展示的字段：指标有独立入口 */
const HIDDEN_TAG_FIELDS = new Set(['queryMetric']);

async function syncActiveValues() {
  activeValues.value = (await formApi.getValues()) ?? {};
}

/** 取值展示文案：有 options 的取 label，区间用 ~ 连接 */
function toDisplayText(field: any, values: any[]) {
  if (field?.component === 'RangePicker') return values.join(' ~ ');
  const options = unref(field?.componentProps?.options);
  return values
    .map((value) => {
      const hit = Array.isArray(options)
        ? options.find((opt: any) => String(opt.value) === String(value))
        : undefined;
      return hit ? String(hit.label) : String(value);
    })
    .join('、');
}

/** 已选条件行：仅在存在有效值时展示 */
const activeFilterTags = computed(() => {
  const tags: { closable: boolean; field: string; label: string; text: string }[] = [];
  for (const field of (formOptions.schema ?? []) as any[]) {
    const name = field.fieldName as string;
    if (!name || HIDDEN_TAG_FIELDS.has(name)) continue;
    const raw = activeValues.value[name];
    const values = Array.isArray(raw)
      ? raw.filter((item) => item !== undefined && item !== null && item !== '')
      : raw === undefined || raw === null || raw === ''
        ? []
        : [raw];
    if (values.length === 0) continue;
    tags.push({
      closable: field.rules !== 'required',
      field: name,
      label: String(field.label ?? name),
      text: toDisplayText(field, values)
    });
  }
  return tags;
});

/** 移除单个条件后立即重查 */
async function handleRemoveFilter(field: string) {
  await formApi.setFieldValue(field, []);
  if (field === 'platform') {
    await resetLoadedMap();
  }
  await syncActiveValues();
  await formApi.submitForm();
}

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
    await syncActiveValues();
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
  <!-- 已选条件回显：单个条件可直接移除并重查 -->
  <div
    v-if="activeFilterTags.length > 0"
    class="mt-3 flex flex-wrap items-center gap-2"
  >
    <Tag
      v-for="tag in activeFilterTags"
      :key="tag.field"
      :closable="tag.closable"
      @close="handleRemoveFilter(tag.field)"
    >
      {{ tag.label }}：{{ tag.text }}
    </Tag>
    <Typography.Text type="secondary" class="ml-auto">
      命中 {{ props.resultTotal ?? 0 }} 行 · 前端分页
    </Typography.Text>
  </div>
</template>
