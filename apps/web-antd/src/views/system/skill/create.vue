<script lang="ts" setup name="AiSkillCreate">
/**
 * Skill 管理 — 新增 / 编辑（vben 抽屉）
 *
 * 字段：名称 / 类型 / 默认模型 / 提示词模板 / 参数 schema(JSON)。
 */
import type { SkillItem, SkillSaveRequest } from '#/api/models/ai_model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { aiModelApi } from '#/api';

import { SKILL_TYPE_OPTIONS } from './constants';

const emit = defineEmits(['pageReload']);

const isUpdate = ref(false);
const current = ref<Record<string, any> | SkillItem>({});

/** 参数 schema：文本 → JSON 对象（空则不发） */
function parseParamSchema(text?: string): null | Record<string, any> {
  if (!text || !text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    const payload: SkillSaveRequest = {
      id: values.id || undefined,
      name: values.name,
      type: values.type,
      // 模型选择器取模型库的 id 作为默认模型（与生成请求的 modelId 口径一致）
      defaultModel:
        values.defaultModel === undefined ||
        values.defaultModel === null ||
        values.defaultModel === ''
          ? undefined
          : String(values.defaultModel),
      promptTemplate: values.promptTemplate,
      paramSchema: parseParamSchema(values.paramSchema),
    };
    await aiModelApi.saveSkill(payload);
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
      componentProps: { placeholder: '如 修图(白底/去背)' },
      fieldName: 'name',
      label: 'Skill 名称',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: { options: SKILL_TYPE_OPTIONS, placeholder: $t('common.choice') },
      fieldName: 'type',
      label: '类型',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        // 模型库列表（取 id 作值）；仅保留可用模型
        api: async () => {
          const res = await aiModelApi.fetchModelConfigList({
            page: 1,
            pageSize: 500,
          });
          return {
            items: (res?.items ?? [])
              .filter((m) => m.status === undefined || m.status === 1)
              .map((m) => ({
                id: String(m.id),
                label: `${m.model ?? ''}（${m.provider ?? m.source ?? ''}）`,
              })),
          };
        },
        filterOption: (inputValue: string, option: { label: string }) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()),
        labelField: 'label',
        placeholder: '未选模型时的默认模型',
        resultField: 'items',
        showSearch: true,
        valueField: 'id',
      },
      fieldName: 'defaultModel',
      label: '默认模型',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '提示词模板', rows: 4 },
      fieldName: 'promptTemplate',
      label: '提示词模板',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '参数 schema（JSON），可留空', rows: 4 },
      fieldName: 'paramSchema',
      label: '参数 schema',
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
    current.value = (drawerApi.getData() as SkillItem) ?? {};
    if (current.value.id) {
      isUpdate.value = true;
      const { paramSchema, ...rest } = current.value as SkillItem;
      formApi.setValues({
        ...rest,
        paramSchema: paramSchema ? JSON.stringify(paramSchema, null, 2) : '',
      } as Record<string, any>);
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
