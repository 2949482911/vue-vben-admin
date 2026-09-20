<script setup lang="ts">
/**
 * 批量操作「单独设置」通用表单数组组件
 *
 * 基于 vben 的 `type: 'array'` 表单数组（VbenFormFieldArray），把每一个已选元素
 * 渲染为一行，配置字段作为列。行数与已选元素一致，且不允许增删（增删由父级勾选决定）。
 *
 * 通过 `initialConfigs` 接收父级已持久化的逐行配置作为初始值（这样在「全部应用 /
 * 单独设置」来回切换时不会丢失已编辑内容），并通过 `update:configs` 事件把最新
 * 逐行配置（去掉内部名称字段）同步回父级，供父级校验与组装提交参数。
 */
import type { VbenFormSchema } from '#/adapter/form';

import { useVbenForm } from '#/adapter/form';

import { $t } from '#/locales';

const props = defineProps<{
  /** 已选元素（顺序即表单数组行顺序） */
  rows: any[];
  /** 元素展示名称 */
  nameOf: (row: any) => string;
  /** 配置字段列（不含名称列，名称列由本组件注入） */
  children: VbenFormSchema[];
  /** 逐行初始配置（顺序与 rows 一致，由父级持久化） */
  initialConfigs: Record<string, any>[];
}>();

const emit = defineEmits<{
  'update:configs': [configs: Record<string, any>[]];
}>();

/** 初始行数据（名称列 + 配置字段） */
function buildInitialConfigs(): Record<string, any>[] {
  return props.rows.map((row, index) => ({
    __name: props.nameOf(row),
    ...(props.initialConfigs[index] ?? {}),
  }));
}

/** 去掉内部名称字段 */
function stripName(config: Record<string, any>): Record<string, any> {
  const result = { ...config };
  delete result.__name;
  return result;
}

/** 表单值变化时同步各行配置给父级 */
function syncConfigs(values: any) {
  const list = (values.configs ?? []) as Array<Record<string, any>>;
  emit('update:configs', list.map(stripName));
}

const schema: VbenFormSchema[] = [
  {
    arrayProps: {
      actionText: '',
      addButtonText: $t('marketing.promotionManager.form.addElement'),
      max: props.rows.length,
      min: props.rows.length,
      showIndex: true,
    },
    children: [
      {
        component: 'Input',
        componentProps: { disabled: true, variant: 'borderless' },
        fieldName: '__name',
        label: $t('marketing.promotionManager.form.elementName'),
      },
      ...props.children,
    ],
    defaultValue: buildInitialConfigs(),
    fieldName: 'configs',
    hideLabel: true,
    label: '',
    type: 'array',
  },
];

const [Form] = useVbenForm({
  handleValuesChange: (values: any) => syncConfigs(values),
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});
</script>

<template>
  <div class="batch-individual-form-array">
    <Form />
  </div>
</template>

<style scoped lang="scss">
.batch-individual-form-array {
  // 行数固定为已选元素数，隐藏「添加一行」按钮与每行删除按钮
  :deep(.border-dashed) {
    display: none;
  }

  :deep(.rounded-full) {
    display: none;
  }
}
</style>
