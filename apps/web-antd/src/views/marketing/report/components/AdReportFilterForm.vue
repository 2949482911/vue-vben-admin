<!-- components/AdReportFilterForm.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useVbenForm, type VbenFormProps } from "@vben/common-ui";
import { ACTIVE_PLATFORM, DIMS } from "#/constants/locales";
import { $t } from "@vben/locales";
import { advertiserApi, projectApi } from "#/api";
import type { ProjectItem } from "../../account/advertiser/advertiser";
import dayjs from 'dayjs';
import { useAdLinkage } from '../adreportdata/adDropdown';

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
  resetKey?: number; // ✅ 新增
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
  {immediate: true,deep: true}
);
const emits = defineEmits<{
  submit: [values: any];
  reset: [];
  'update:values': [values: any];
}>();

const selectPlatform = ref<string>(null);
const {
  planOptions,
  advertisementOptions,
  adGroupOptions,
  creativityOptions,
  loadAdLinkage,
  resetLoadedMap,
  setFormApi,
} = useAdLinkage();

// 项目选项
const projectOptions = ref<ProjectItem[]>([]);

onMounted(async () => {
  const res = await projectApi.fetchProjectList({
    page: 1,
    pageSize: 1000,
  });
  projectOptions.value = res.items;
});

const projectSelectOptions = computed(() =>
  projectOptions.value.map((item: ProjectItem) => ({
    label: item.name,
    value: item.id,
  }))
);

const filterCriteria = ref();

// 重置表单的方法
async function resetFormToDefault() {
  
  // 1. 重置标准表单字段
  await formApi.resetForm();
  
  // 2. 显式清空所有自定义字段（防止组件内部状态残留）
  await formApi.setFieldValue('advertiserId', []);   // HybridSearchSelect 清空
  await formApi.setFieldValue('projectId', null);   // HybridSearchSelect 清空
  await formApi.setFieldValue('campaign_id', []);      // 计划
  await formApi.setFieldValue('promotion_id', []);     // 广告
  await formApi.setFieldValue('adgroup_id', []);       // 广告组
  await formApi.setFieldValue('creative_id', []);      // 创意
  await formApi.setFieldValue('queryMetric', []);
  
  // 3. 重置联动选项的加载状态（清空已缓存的选项列表）
  await resetLoadedMap(); // 确保此函数内部将 planOptions.value 等置为 []
  
  // 4. 重新设置默认值
  await formApi.setFieldValue('dateTimeRange', [
    dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ]);
  await formApi.setFieldValue('dims', ['day']);
  
  // 5. 可选：强制刷新 platform 字段（如果需要恢复默认平台）
  // await formApi.setFieldValue('platform', ['vivo']);
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
      defaultValue:['vivo'],
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        mode: 'multiple',
        maxTagCount: 1,
        placeholder: `${$t('common.choice')}`,
        onChange: () => resetLoadedMap(),
        onSelect: async () => {
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
        options: DIMS,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
        maxTagCount: 1,
      },
      defaultValue: ['day'],
      fieldName: 'dims',
      label: `${$t('marketing.report.dims.title')}`,
    },
    {
      component: 'HybridSearchSelect',
      componentProps: {
        mode: 'multiple',
        placeholder: `${$t('common.select')}`,
        allowClear: true,
        initialApi: async () => {
          const formData = await formApi.getValues();
          selectPlatform.value = formData.platform?.join(',');
          const res = await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 1000,
            putStatue: 1,
            platform: selectPlatform.value
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
            platform: selectPlatform.value,
            advertiserId: params.keyword,
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
        onChange: () => {
          resetLoadedMap();
        },
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
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: projectSelectOptions,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'projectId',
      label: '项目',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
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
  showCollapseButton: props.isShowActions,
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
