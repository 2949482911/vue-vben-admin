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

import { useSkillTypeOptions } from './useSkillTypeOptions';

const emit = defineEmits(['pageReload']);

const isUpdate = ref(false);
const current = ref<Record<string, any> | SkillItem>({});
const { loadSkillTypeOptions, skillTypeOptions } = useSkillTypeOptions();

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

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!,
  );
}

/** 纯文本 → 富文本编辑器内容（段落 + 换行） */
function textToHtml(text?: string) {
  if (!text) {
    return '';
  }
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** 富文本编辑器内容 → 纯文本（提示词模板落库保持纯文本，保留段落换行） */
function htmlToText(html?: string) {
  if (!html) {
    return '';
  }
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|h[1-6]|li|p)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  const decoder = document.createElement('textarea');
  decoder.innerHTML = withBreaks;
  return decoder.value.replace(/\n{3,}/g, '\n\n').trim();
}

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    const payload: SkillSaveRequest = {
      id: values.id || undefined,
      name: values.name,
      type: values.type,
      description: values.description || undefined,
      // 模型选择器取模型库的 id 作为默认模型（与生成请求的 modelId 口径一致）
      defaultModel:
        values.defaultModel === undefined ||
        values.defaultModel === null ||
        values.defaultModel === ''
          ? undefined
          : String(values.defaultModel),
      promptTemplate: htmlToText(values.promptTemplate),
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
      component: 'Textarea',
      componentProps: {
        placeholder: '用于 LangChain4j 加载技能时的描述',
        rows: 2,
      },
      fieldName: 'description',
      label: '技能描述',
    },
    {
      component: 'Select',
      componentProps: () => ({
        allowClear: true,
        optionFilterProp: 'label',
        options: skillTypeOptions.value,
        placeholder: $t('common.choice'),
        showSearch: true,
      }),
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
      component: 'RichEditor',
      componentProps: { minHeight: 320 },
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
  class: 'w-[75%]',
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
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    await loadSkillTypeOptions();
    await formApi.updateSchema([
      {
        componentProps: {
          allowClear: true,
          optionFilterProp: 'label',
          options: skillTypeOptions.value,
          placeholder: $t('common.choice'),
          showSearch: true,
        },
        fieldName: 'type',
      },
    ]);
    formApi.resetForm();
    current.value = (drawerApi.getData() as SkillItem) ?? {};
    if (current.value.id) {
      isUpdate.value = true;
      const {
        paramSchema,
        promptTemplate,
        ...rest
      } = current.value as SkillItem;
      formApi.setValues({
        ...rest,
        promptTemplate: textToHtml(promptTemplate),
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
