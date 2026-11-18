<script setup lang="ts" name="UnitProjectDrawer">
import type {
  UnitProjectCreateRequest,
  UnitSelectedProduct,
} from '../bytedance';

/**
 * 巨量引擎-全域项目配置抽屉
 *
 * 字段对齐 BytedanceUniProjectCreateRequest：项目名/预算/ROI/变现模式/商品/排期/定向基础项。
 */
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { markRaw } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import TimeSelectionPeriod from '#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue';

import UnitProductButtonField from './UnitProductButtonField.vue';

const props = defineProps<{
  accountInfo: AccountInfo[];
  project: UnitProjectCreateRequest;
}>();
const emit = defineEmits<{
  'update:project': [value: UnitProjectCreateRequest];
}>();

/** 表单项按控件类型固定宽度，避免一行一项时输入框被拉满 */
const FIELD_ITEM_CLASS = {
  date: 'w-full max-w-[220px]',
  input: 'w-full max-w-[360px]',
  select: 'w-full max-w-[220px]',
  shortSelect: 'w-full max-w-[160px]',
} as const;

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: [
    {
      component: 'AdNameGen',
      componentProps: {
        class: FIELD_ITEM_CLASS.input,
        placeholderTags: ['<产品名称>', '<日期>', '<序号>'],
      },
      fieldName: 'name',
      label: '项目名称',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: FIELD_ITEM_CLASS.select,
        options: [{ label: '剧目（ALBUM）', value: 'ALBUM' }],
      },
      defaultValue: 'ALBUM',
      fieldName: 'delivery_product',
      label: '营销产品',
      rules: 'required',
    },
    {
      component: markRaw(UnitProductButtonField),
      componentProps: {
        getAccountInfo: () => props.accountInfo,
      },
      fieldName: 'selected_product',
      label: '投放商品',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 300,
        precision: 2,
        style: { width: '180px' },
      },
      fieldName: 'budget',
      label: '项目预算（元）',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        precision: 2,
        style: { width: '180px' },
      },
      fieldName: 'uni_roi_goal',
      label: 'ROI 系数',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: FIELD_ITEM_CLASS.select,
        options: [
          { label: 'IAP', value: 'IAP' },
          { label: 'IAA 和 IAP', value: 'IAA_AND_IAP' },
        ],
      },
      defaultValue: 'IAP',
      fieldName: 'monetization_mode',
      label: '变现模式',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: FIELD_ITEM_CLASS.select,
        options: [
          { label: '从今天开始', value: 'SCHEDULE_FROM_NOW' },
          { label: '指定起止日期', value: 'SCHEDULE_START_END' },
        ],
      },
      defaultValue: 'SCHEDULE_FROM_NOW',
      fieldName: 'schedule_type',
      label: '投放时间',
      rules: 'required',
    },
    {
      component: 'DatePicker',
      componentProps: { class: FIELD_ITEM_CLASS.date, valueFormat: 'YYYY-MM-DD' },
      dependencies: {
        show: (values: Record<string, any>) =>
          values.schedule_type === 'SCHEDULE_START_END',
        triggerFields: ['schedule_type'],
      },
      fieldName: 'start_time',
      label: '开始日期',
    },
    {
      component: 'DatePicker',
      componentProps: { class: FIELD_ITEM_CLASS.date, valueFormat: 'YYYY-MM-DD' },
      dependencies: {
        show: (values: Record<string, any>) =>
          values.schedule_type === 'SCHEDULE_START_END',
        triggerFields: ['schedule_type'],
      },
      fieldName: 'end_time',
      label: '结束日期',
    },
    {
      component: TimeSelectionPeriod,
      fieldName: 'schedule_time',
      label: '投放时段',
    },
    {
      component: 'Select',
      componentProps: {
        class: FIELD_ITEM_CLASS.shortSelect,
        options: [
          { label: '开启', value: 'ON' },
          { label: '关闭', value: 'OFF' },
        ],
      },
      defaultValue: 'ON',
      fieldName: 'aigc_dynamic_creative_switch',
      label: 'AIGC 动态创意',
    },
    {
      component: 'Input',
      componentProps: {
        class: FIELD_ITEM_CLASS.input,
        placeholder: '媒体必填，来源标识',
      },
      fieldName: 'source',
      label: '来源',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: FIELD_ITEM_CLASS.shortSelect,
        options: [
          { label: '开启', value: 'ON' },
          { label: '关闭', value: 'OFF' },
        ],
      },
      defaultValue: 'OFF',
      dependencies: {
        show: (values: Record<string, any>) =>
          values.monetization_mode === 'IAA_AND_IAP',
        triggerFields: ['monetization_mode'],
      },
      fieldName: 'going_global_switch',
      label: '出海流量',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        precision: 2,
        style: { width: '180px' },
      },
      dependencies: {
        show: (values: Record<string, any>) =>
          values.monetization_mode === 'IAA_AND_IAP' &&
          values.going_global_switch === 'ON',
        triggerFields: ['monetization_mode', 'going_global_switch'],
      },
      fieldName: 'going_global_budget',
      label: '出海预算',
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        precision: 2,
        style: { width: '180px' },
      },
      dependencies: {
        show: (values: Record<string, any>) =>
          values.monetization_mode === 'IAA_AND_IAP' &&
          values.going_global_switch === 'ON',
        triggerFields: ['monetization_mode', 'going_global_switch'],
      },
      fieldName: 'going_global_roi_goal',
      label: '出海 ROI',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

defineExpose({
  open: () => drawerApi.open(),
});

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[50%]',
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const values = await formApi.getValues();
    const base = props.project;
    const monetizationMode = String(values.monetization_mode || 'IAP');
    const goingGlobalEnabled =
      monetizationMode === 'IAA_AND_IAP' &&
      values.going_global_switch === 'ON';
    const selectedProduct =
      (values.selected_product as null | undefined | UnitSelectedProduct) ??
      null;
    const project: UnitProjectCreateRequest = {
      ...base,
      aigc_dynamic_creative_switch: String(
        values.aigc_dynamic_creative_switch || 'ON',
      ),
      budget: Number(values.budget) || 0,
      delivery_product: String(values.delivery_product || 'ALBUM'),
      end_time:
        values.schedule_type === 'SCHEDULE_START_END'
          ? String(values.end_time || '')
          : '',
      going_global_budget: goingGlobalEnabled
        ? Number(values.going_global_budget) || 0
        : undefined,
      going_global_roi_goal: goingGlobalEnabled
        ? Number(values.going_global_roi_goal) || 0
        : undefined,
      going_global_switch:
        monetizationMode === 'IAA_AND_IAP'
          ? String(values.going_global_switch || 'OFF')
          : undefined,
      monetization_mode: monetizationMode,
      name: String(values.name || ''),
      related_product: selectedProduct
        ? {
            product_id: String(selectedProduct.product_id),
            product_platform_id: String(selectedProduct.product_platform_id),
          }
        : undefined,
      schedule_time: String(values.schedule_time || ''),
      schedule_type: String(values.schedule_type || 'SCHEDULE_FROM_NOW'),
      selectedProduct: selectedProduct
        ? {
            image_url: selectedProduct.image_url,
            name: selectedProduct.name,
            product_id: String(selectedProduct.product_id),
            product_platform_id: String(selectedProduct.product_platform_id),
            title: selectedProduct.title,
          }
        : undefined,
      source: String(values.source || ''),
      start_time:
        values.schedule_type === 'SCHEDULE_START_END'
          ? String(values.start_time || '')
          : '',
      uni_roi_goal: Number(values.uni_roi_goal) || 0,
    };
    emit('update:project', project);
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    await formApi.resetForm();
    const project = props.project;
    const productSelection: null | UnitSelectedProduct =
      project.selectedProduct ??
      (project.related_product
        ? {
            product_id: project.related_product.product_id,
            product_platform_id: project.related_product.product_platform_id,
          }
        : null);
    await formApi.setValues({
      aigc_dynamic_creative_switch:
        project.aigc_dynamic_creative_switch || 'ON',
      budget: project.budget,
      delivery_product: project.delivery_product || 'ALBUM',
      end_time: project.end_time || '',
      going_global_budget: project.going_global_budget,
      going_global_roi_goal: project.going_global_roi_goal,
      going_global_switch: project.going_global_switch || 'OFF',
      monetization_mode: project.monetization_mode || 'IAP',
      name: project.name || '',
      schedule_time: project.schedule_time || '',
      schedule_type: project.schedule_type || 'SCHEDULE_FROM_NOW',
      selected_product: productSelection,
      source: project.source || '',
      start_time: project.start_time || '',
      uni_roi_goal: project.uni_roi_goal,
    });
  },
});
</script>

<template>
  <Drawer title="全域项目配置">
    <Form />
  </Drawer>
</template>
