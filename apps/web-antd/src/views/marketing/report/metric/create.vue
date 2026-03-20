<script lang="ts" setup name="CreateNotice">
import type {
  CreateSystemMetric,
  PlatformMetricMap,
  UpdateMetric,
  MetricItem
} from '#/api/models';

import { onMounted, ref } from 'vue';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useVbenForm } from '#/adapter/form';
import { metricApi } from '#/api/core';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { Button, Divider, Select, Input, message } from 'ant-design-vue';
import { ACTIVE_PLATFORM } from '#/constants/locales';
import { trimObject } from '#/utils/trim';

const emit = defineEmits(['pageReload']);
// 在 script 顶部添加
const metricList = ref<MetricItem[]>([]);
// 媒体字段映射
const platformMetricMap = ref<PlatformMetricMap[]>([
  { platform: 'vivo', metricName: '' },
]);
const showPlatformMetricMap = ref<Boolean>(true);

function defaultPlatformMetricMap() {
  platformMetricMap.value = [{ platform: 'vivo', metricName: '' }];
  gridApi.setGridOptions({ data: platformMetricMap.value });
  gridApi.reload();
}

const objectRequest = ref<CreateSystemMetric | UpdateMetric>({
  platformMetricMap: [],
  tags: [],
  cname: '',
  description: '',
  metricType: 0,
  ename: '',
  formula: '',
  id: '',
  implMethod: '',
});
const isUpdate = ref<Boolean>(false);
const formulaForSubmit = ref<string>(''); // 存储无花括号英文公式用于提交

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const result = await formApi.validate();
    if (!result.valid) throw new Error('表单验证失败');

    const formValues = { ...formVal };
    console.log('handlesubmit',formValues)
    let finalFormula = '';
    if (formulaForSubmit.value) {
      finalFormula = formulaForSubmit.value;
    } else if (formValues.formula) {
      finalFormula = formValues.formula.replace(/[{}]/g, '');
    }

    if (!finalFormula) {
      message.warning('请输入公式');
      throw new Error('公式为空');
    }

    if (!validateFormula(finalFormula)) {
      // validateFormula 内部已显示错误消息，这里直接抛出
      throw new Error('公式不合法');
    }

    formValues.formula = finalFormula;

    const params = trimObject(formValues);
    console.log('params', params);
    await (isUpdate.value
      ? metricApi.fetchUpdateMetric(params as UpdateMetric)
      : metricApi.fetchCreateSystemMetric(params as CreateSystemMetric));

    // 提交成功后正常结束，不抛出错误
  },
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'id',
      dependencies: { show: false, triggerFields: ['*'] },
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'ename',
      label: $t('marketing.metric.columns.ename'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'cname',
      label: $t('marketing.metric.columns.cname'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'description',
      label: $t('marketing.metric.columns.description'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: $t('common.input'),
        onSelect: (value: number) => {
          if (value === 1) {
            showPlatformMetricMap.value = true;
          } else if (value === 2) {
            showPlatformMetricMap.value = false;
            defaultPlatformMetricMap();
          } else if (value === 4) {
            showPlatformMetricMap.value = false;
          }
        },
        options: [
          { label: $t('marketing.metric.metricType.atomic'), value: 1 },
          { label: $t('marketing.metric.metricType.derive'), value: 2 },
          { label: $t('marketing.metric.metricType.eventMetric'), value: 3 },
          { label: $t('marketing.metric.metricType.platformMetric'), value: 4 },
        ],
      },
      defaultValue: 1,
      rules: 'required',
      fieldName: 'metricType',
      label: $t('marketing.metric.columns.metricType'),
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: $t('common.input'),
        options: ACTIVE_PLATFORM,
      },
      rules: 'required',
      fieldName: 'platform',
      label: $t('marketing.metric.columns.platform'),
      dependencies: {
        show: async () => (await formApi.getValues()).metricType === 4,
        triggerFields: ['metricType'],
      },
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      rules: 'required',
      fieldName: 'implMethod',
      label: $t('marketing.metric.columns.implMethod'),
      dependencies: {
        show: async () => (await formApi.getValues()).metricType === 3,
        triggerFields: ['metricType'],
      },
    },
    {
      component: 'InputNumber',
      componentProps: { placeholder: $t('common.input'), min: 1 },
      defaultValue: 1,
      rules: 'required',
      fieldName: 'sort',
      label: $t('marketing.metric.columns.sort'),
    },
    {
      component: 'MetricFormulaEditor', // 自定义组件
      fieldName: 'formula', // 直接绑定到 formula 字段
      label: $t('marketing.metric.columns.formula'),
      componentProps: {
        onConfirm: handleFormulaConfirm,
      },
      dependencies: {
        show: async () => (await formApi.getValues()).metricType === 2,
        triggerFields: ['metricType'],
      },
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

// 表格配置（不变）
const columns = [
  { title: '序号', type: 'seq' },
  { field: 'platform', title: $t('ocpx.behavioraplatform.columns.platform'), slots: { default: 'platform' } },
  { field: 'metricName', title: '指标名字', slots: { default: 'metricName' } },
  { field: 'options', title: $t('core.columns.options'), fixed: 'right', slots: { default: 'action' } },
];

const gridOptions: VxeGridProps<PlatformMetricMap> = {
  border: true,
  checkboxConfig: { highlight: true },
  columns,
  keepSource: true,
  proxyConfig: { enabled: false, autoLoad: false },
  data: objectRequest.value.platformMetricMap,
  pagerConfig: { enabled: false },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function addPlatformMetric() {
  platformMetricMap.value.push({ platform: 'vivo', metricName: '' });
  gridApi.setGridOptions({ data: platformMetricMap.value });
  gridApi.reload();
}

function deletePlatformMetricMap(index: number) {
  platformMetricMap.value.splice(index, 1);
  gridApi.setGridOptions({ data: platformMetricMap.value });
}

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await formApi.resetForm();
    objectRequest.value = {
      platformMetricMap: [],
      tags: [],
      cname: '',
      description: '',
      metricType: 0,
      ename: '',
      formula: '',
      id: '',
      implMethod: '',
    };
    defaultPlatformMetricMap();
    isUpdate.value = false;
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;
    try {
      await formApi.submitForm();
      isUpdate.value = false;
      emit('pageReload');
      defaultPlatformMetricMap();
      await modalApi.close();
    } catch (error) {
      console.error('提交失败', error);
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 先加载指标列表
      metricList.value = await metricApi.fetchMetric();
      objectRequest.value = modalApi.getData<UpdateMetric | CreateSystemMetric>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
      }
      gridApi.setGridOptions({ data: platformMetricMap.value, columns });
    }
  },
});
function handleFormulaConfirm(val) {
  formulaForSubmit.value = val
}
function validateFormula(formula: string): boolean {
  if (!formula) {
    message.warning('公式不能为空');
    return false;
  }

  // 1. 括号匹配检查
  let stack = 0;
  for (let i = 0; i < formula.length; i++) {
    if (formula[i] === '(') stack++;
    if (formula[i] === ')') stack--;
    if (stack < 0) {
      message.error('括号不匹配');
      return false;
    }
  }
  if (stack !== 0) {
    message.error('括号不匹配');
    return false;
  }

  // 2. 检查是否包含非法字符（只允许字母数字下划线、运算符、括号、小数点、空格）
  const validCharsRegex = /^[a-zA-Z0-9_+\-*/()\s.]+$/;
  if (!validCharsRegex.test(formula)) {
    message.error('公式包含非法字符');
    return false;
  }

  // 3. 检查连续运算符（如 ++、-- 等）
  if (/[+\-*/]{2,}/.test(formula)) {
    message.error('公式不能包含连续的运算符');
    return false;
  }

  // 4. 检查运算符位置（不能开头结尾）
  if (/^[+\-*/]/.test(formula) || /[+\-*/]$/.test(formula)) {
    message.error('公式不能以运算符开头或结尾');
    return false;
  }

  return true;
}
function handleSetFormValue(row: UpdateMetric | CreateSystemMetric) {
  const rawFormula = row.formula || '';
  
  // 精确转换：只将 metricList 中存在的指标名包裹花括号
  let displayFormula = rawFormula;
  if (displayFormula && !displayFormula.includes('{')) {
    displayFormula = displayFormula.replace(/([a-zA-Z0-9_]+)/g, (match) => {
      const exists = metricList.value.some(m => m.ename === match);
      return exists ? `{${match}}` : match; // 存在才加花括号
    });
  }

  // 设置表单值，同时将 metricList 通过 componentProps 传递给子组件
  formApi.setValues({
    ...row,
    formula: displayFormula,
  });

  formulaForSubmit.value = rawFormula;
  platformMetricMap.value = row.platformMetricMap;
}
onMounted(async () => {
  // 加载指标列表，用于回显转换
  metricList.value = await metricApi.fetchMetric();
  console.log('指标数据',metricList.value)
})
const title: string = isUpdate.value ? $t('common.edit') : $t('common.create');
</script>

<template>
  <Modal :title="title">
    <Page>
      <Form />
      <Divider />
      <Grid v-show="showPlatformMetricMap">
        <template #platform="{ seq }">
          <Select
            :options="ACTIVE_PLATFORM"
            v-model:value="platformMetricMap[seq - 1].platform"
            width="100%"
          />
        </template>
        <template #metricName="{ seq }">
          <Input v-model:value="platformMetricMap[seq - 1].metricName" />
        </template>
        <template #action="{ seq }">
          <Button type="link" @click="deletePlatformMetricMap(seq as number)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <template #toolbar-tools>
          <Button block class="mt-5" type="dashed" @click="addPlatformMetric">
            {{ $t('common.create') }}
          </Button>
        </template>
      </Grid>
    </Page>
  </Modal>
</template>
