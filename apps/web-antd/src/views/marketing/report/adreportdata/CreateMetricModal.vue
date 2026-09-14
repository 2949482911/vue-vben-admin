<script setup lang="ts" name="CreateMetricModal">
import type { CreateSystemMetric } from "#/api/models";

/**
 * 新增自定义（计算）指标弹窗
 *
 * 从 selectmetric.vue 中拆出：指标选择弹窗通过 connectedComponent 打开，组件内再声明
 * useVbenModal 会接管父级弹窗实例，拆成独立组件后两者互不影响。
 * 这里使用 antd 原生 Modal，由父组件通过 v-model:open 控制显隐。
 */
import { ref } from "vue";

import { $t } from "@vben/locales";

import { message, Modal } from "ant-design-vue";

import { useVbenForm } from "#/adapter/form";
import { metricApi } from "#/api";
import { trimObject } from "#/utils/trim";

const props = withDefaults(
  defineProps<{
    /** 弹窗显隐 */
    open?: boolean;
  }>(),
  { open: false }
);

const emit = defineEmits<{
  success: [];
  "update:open": [value: boolean];
}>();

/** 提交中状态 */
const submitting = ref(false);
/** 公式编辑器回调的无花括号英文公式 */
const formulaForSubmit = ref<string>("");

function close() {
  emit("update:open", false);
}

function handleFormulaConfirm(val: any) {
  formulaForSubmit.value = val;
}

function validateFormula(formula: string): boolean {
  if (!formula) {
    message.warning("公式不能为空");
    return false;
  }

  // 1. 括号匹配检查
  let stack = 0;
  for (let i = 0; i < formula.length; i++) {
    if (formula[i] === "(") stack++;
    if (formula[i] === ")") stack--;
    if (stack < 0) {
      message.error("括号不匹配");
      return false;
    }
  }
  if (stack !== 0) {
    message.error("括号不匹配");
    return false;
  }

  // 2. 检查是否包含非法字符（只允许字母数字下划线、运算符、括号、小数点、空格）
  const validCharsRegex = /^[a-zA-Z0-9_+\-*/()\s.]+$/;
  if (!validCharsRegex.test(formula)) {
    message.error("公式包含非法字符");
    return false;
  }

  // 3. 检查连续运算符（如 ++、-- 等）
  if (/[+\-*/]{2,}/.test(formula)) {
    message.error("公式不能包含连续的运算符");
    return false;
  }

  // 4. 检查运算符位置（不能开头结尾）
  if (/^[+\-*/]/.test(formula) || /[+\-*/]$/.test(formula)) {
    message.error("公式不能以运算符开头或结尾");
    return false;
  }

  // 5. 检查是否至少包含一个运算符（派生指标必须由多个指标运算组成）
  if (!/[+\-*/]/.test(formula)) {
    message.error("公式必须包含至少一个运算符");
    return false;
  }

  return true;
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: "w-full" }
  },
  layout: "horizontal",
  handleSubmit: async (formVal: Record<string, any>) => {
    const result = await formApi.validate();
    if (!result.valid) throw new Error("表单验证失败");
    const formValues = { ...formVal };
    let finalFormula = "";
    if (formulaForSubmit.value) {
      finalFormula = formulaForSubmit.value;
    } else if (formValues.formula) {
      finalFormula = formValues.formula.replace(/[{}]/g, "");
    }
    if (!finalFormula) {
      message.warning("请输入公式");
      throw new Error("公式为空");
    }
    if (!validateFormula(finalFormula)) {
      throw new Error("公式不合法");
    }
    formValues.formula = finalFormula;
    const params = trimObject(formValues);
    await metricApi.fetchCreateMetric(params as CreateSystemMetric);
  },
  schema: [
    {
      component: "Input",
      componentProps: { placeholder: $t("common.input") },
      fieldName: "id",
      dependencies: { show: false, triggerFields: ["*"] }
    },
    {
      component: "Input",
      componentProps: { placeholder: $t("common.input") },
      fieldName: "ename",
      label: $t("marketing.metric.columns.ename"),
      rules: "required"
    },
    {
      component: "Input",
      componentProps: { placeholder: $t("common.input") },
      fieldName: "cname",
      label: $t("marketing.metric.columns.cname"),
      rules: "required"
    },
    {
      component: "Input",
      componentProps: { placeholder: $t("common.input") },
      defaultValue: 2,
      fieldName: "metricType",
      dependencies: { show: false, triggerFields: ["*"] }
    },
    {
      component: "Textarea",
      componentProps: { placeholder: $t("common.input") },
      fieldName: "description",
      label: $t("marketing.metric.columns.description"),
      rules: "required"
    },
    {
      component: "MetricFormulaEditor", // 自定义组件
      fieldName: "formula", // 直接绑定到 formula 字段
      label: $t("marketing.metric.columns.rule"),
      componentProps: {
        onConfirm: handleFormulaConfirm
      }
    }
  ]
});

async function handleConfirm() {
  const result = await formApi.validate();
  if (!result.valid) return;
  submitting.value = true;
  try {
    await formApi.submitForm();
    emit("success");
    close();
  } catch (error) {
    // 校验失败或提交失败，弹窗保持打开，错误已通过 message 提示
    console.error("提交失败", error);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Modal
    :confirm-loading="submitting"
    :keyboard="false"
    :open="props.open"
    :width="640"
    title="新增自定义指标"
    @cancel="close"
    @ok="handleConfirm"
  >
    <Form />
  </Modal>
</template>
