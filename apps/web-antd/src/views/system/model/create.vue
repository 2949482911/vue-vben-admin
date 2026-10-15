<script lang="ts" setup name="AiModelConfigCreate">
/**
 * 模型管理 — 新增 / 编辑（vben 抽屉）
 *
 * 字段：供应商 / Base URL / API Key / 模型名 / 能力 / 来源。
 * 列表接口不返回 apiKey，编辑时留空表示不修改（提交前剔除空值）。
 */
import type { ModelConfigItem, ModelConfigSaveRequest } from '#/api/models/ai_model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { aiModelApi } from '#/api';

import { CAPABILITY_OPTIONS, SOURCE_OPTIONS } from './constants';

const emit = defineEmits(['pageReload']);

const isUpdate = ref(false);
const current = ref<ModelConfigItem | Record<string, any>>({});

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    const payload: ModelConfigSaveRequest = {
      id: values.id || undefined,
      provider: values.provider,
      baseUrl: values.baseUrl,
      model: values.model,
      capability: values.capability,
      source: values.source,
    };
    // 编辑时留空表示不修改 API Key：不发空值，避免覆盖既有密钥
    if (values.apiKey) {
      payload.apiKey = values.apiKey;
    }
    await aiModelApi.saveModelConfig(payload);
    await drawerApi.close();
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'id',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '如 openai-compatible / byteplus' },
      fieldName: 'provider',
      label: '供应商',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: 'OpenAI 兼容网关地址' },
      fieldName: 'baseUrl',
      label: 'Base URL',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '编辑时留空表示不修改', type: 'password' },
      fieldName: 'apiKey',
      label: 'API Key',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '如 flux-1.1-pro' },
      fieldName: 'model',
      label: '模型名',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: { options: CAPABILITY_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'capability',
      label: '能力',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: { options: SOURCE_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'source',
      label: '来源',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
    isUpdate.value = false;
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    formApi.resetForm();
    current.value = (drawerApi.getData() as ModelConfigItem) ?? {};
    if (current.value.id) {
      isUpdate.value = true;
      formApi.setValues(current.value as Record<string, any>);
    } else {
      isUpdate.value = false;
    }
  },
});

const title = computed(() => (isUpdate.value ? $t('common.edit') : $t('common.create')));
</script>

<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
