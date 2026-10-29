<script lang="ts" setup name="AiModelConfigCreate">
/**
 * 模型管理 — 新增 / 编辑（vben 抽屉）
 *
 * 字段：供应商 / Base URL / API Key / 模型名 / 能力 / 来源，
 * 视频模型额外配置「能力声明」（首尾帧、参考素材、原生音频、时长上限）。
 *
 * 能力声明为什么要在这里配：分镜段落生成依赖 first_frame/last_frame/mediaRefs，
 * 后端在 ai_asset_model_config.capabilities 里读取；不配置时按保守默认直接拦段落模式。
 *
 * 列表接口不返回 apiKey，编辑时留空表示不修改（提交前剔除空值）。
 */
import type {
  ModelCapabilities,
  ModelConfigItem,
  ModelConfigSaveRequest,
} from '#/api/models/ai_model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useDictStore } from '@vben/stores';

import { useVbenForm } from '#/adapter/form';
import { aiModelApi } from '#/api';

import {
  CAPABILITY_OPTIONS,
  MODEL_NAME_DICT_CODE,
  MODEL_PROVIDER_DICT_CODE,
  SOURCE_OPTIONS,
  VIDEO_CAPABILITY_PRESET,
} from './constants';

const emit = defineEmits(['pageReload']);

const dictStore = useDictStore();

/** 字典 → ApiSelect 选项（系统字典管理里维护） */
function dictOptionsApi(code: string) {
  return async () => {
    const items = await dictStore.getDict(code);
    return {
      items: items.map((item) => ({
        label: item.label,
        value: String(item.value),
      })),
    };
  };
}

const fetchProviderOptions = dictOptionsApi(MODEL_PROVIDER_DICT_CODE);
const fetchModelNameOptions = dictOptionsApi(MODEL_NAME_DICT_CODE);

const isUpdate = ref(false);
const current = ref<ModelConfigItem | Record<string, any>>({});

/** 只有视频模型展示能力声明：其余能力用不到首尾帧/参考素材，配了反而误导 */
const videoOnly = {
  dependencies: {
    show: (values: Record<string, any>) => values.capability === 'video',
    triggerFields: ['capability'],
  },
};

/**
 * 平铺表单字段 → capabilities JSON。
 * 未填写的项回退到万相模板，既避免「空开关被存成不支持」，也避免丢掉后端新增的未知键。
 */
function collectCapabilities(values: Record<string, any>): ModelCapabilities {
  const previous = (current.value.capabilities ?? {}) as ModelCapabilities;
  const bool = (key: keyof ModelCapabilities): boolean => {
    const raw = values[key];
    if (raw === undefined || raw === null) {
      return Boolean(previous[key] ?? VIDEO_CAPABILITY_PRESET[key]);
    }
    return Boolean(raw);
  };
  const num = (key: keyof ModelCapabilities): number => {
    const raw = values[key];
    if (raw === undefined || raw === null || raw === '') {
      return Number(previous[key] ?? VIDEO_CAPABILITY_PRESET[key]);
    }
    return Number(raw);
  };
  return {
    ...previous,
    maxDurationSeconds: num('maxDurationSeconds'),
    maxRefAudios: num('maxRefAudios'),
    maxRefImages: num('maxRefImages'),
    maxRefVideos: num('maxRefVideos'),
    supportsAudio: bool('supportsAudio'),
    supportsFirstFrame: bool('supportsFirstFrame'),
    supportsLastFrame: bool('supportsLastFrame'),
    supportsNegativePrompt: bool('supportsNegativePrompt'),
    supportsRefAudio: bool('supportsRefAudio'),
    supportsRefImage: bool('supportsRefImage'),
    supportsRefVideo: bool('supportsRefVideo'),
  };
}

/** 打开抽屉时把 capabilities 摊平成表单字段；视频模型没有声明时按万相模板预填 */
function capabilityFormValues(
  capabilities?: ModelCapabilities | null,
): ModelCapabilities {
  return { ...VIDEO_CAPABILITY_PRESET, ...(capabilities ?? {}) };
}

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
    // 只有视频模型提交能力声明；其它能力（图片/文本等）不传，后端保留原值
    if (values.capability === 'video') {
      payload.capabilities = collectCapabilities(values);
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
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: fetchProviderOptions,
        filterOption: (input: string, option: { label: string }) =>
          option.label.toLowerCase().includes(input.toLowerCase()),
        labelField: 'label',
        placeholder: $t('common.choice'),
        resultField: 'items',
        showSearch: true,
        valueField: 'value',
      },
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
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: fetchModelNameOptions,
        filterOption: (input: string, option: { label: string }) =>
          option.label.toLowerCase().includes(input.toLowerCase()),
        labelField: 'label',
        placeholder: '选择或搜索模型',
        resultField: 'items',
        showSearch: true,
        valueField: 'value',
      },
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
    // ==================== 能力声明（仅视频模型） ====================
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsFirstFrame,
      fieldName: 'supportsFirstFrame',
      label: '支持首帧',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsLastFrame,
      fieldName: 'supportsLastFrame',
      label: '支持尾帧',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsAudio,
      fieldName: 'supportsAudio',
      label: '支持原生音频',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsRefImage,
      fieldName: 'supportsRefImage',
      label: '支持参考图',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsRefVideo,
      fieldName: 'supportsRefVideo',
      label: '支持参考视频',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsRefAudio,
      fieldName: 'supportsRefAudio',
      label: '支持参考音频',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'Switch',
      defaultValue: VIDEO_CAPABILITY_PRESET.supportsNegativePrompt,
      fieldName: 'supportsNegativePrompt',
      label: '支持负向提示词',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'InputNumber',
      componentProps: { max: 60, min: 1, precision: 0 },
      defaultValue: VIDEO_CAPABILITY_PRESET.maxDurationSeconds,
      fieldName: 'maxDurationSeconds',
      label: '时长上限(秒)',
      formItemClass: 'w-150px',
      ...videoOnly,
    },
    {
      component: 'InputNumber',
      componentProps: { max: 20, min: 0, precision: 0 },
      defaultValue: VIDEO_CAPABILITY_PRESET.maxRefImages,
      fieldName: 'maxRefImages',
      formItemClass: 'w-150px',
      label: '参考图上限',
      ...videoOnly,
    },
    {
      component: 'InputNumber',
      componentProps: { max: 20, min: 0, precision: 0 },
      defaultValue: VIDEO_CAPABILITY_PRESET.maxRefVideos,
      fieldName: 'maxRefVideos',
      formItemClass: 'w-[150px]',
      label: '参考视频上限',
      ...videoOnly,
    },
    {
      component: 'InputNumber',
      componentProps: { max: 20, min: 0, precision: 0 },
      defaultValue: VIDEO_CAPABILITY_PRESET.maxRefAudios,
      fieldName: 'maxRefAudios',
      formItemClass: 'w-150px',
      label: '参考音频上限',
      ...videoOnly,
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
      const data = current.value as ModelConfigItem;
      formApi.setValues({
        ...data,
        ...(data.capability === 'video'
          ? capabilityFormValues(data.capabilities)
          : {}),
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
