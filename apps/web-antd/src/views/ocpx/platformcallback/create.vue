<script lang="ts" setup name="CreateNotice">
import type {
  CreatePlatformCallbackRequest,
  UpdatePlatformCallbackRequest,
} from '#/api/models';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { platformCallbackApi } from '#/api/core/ocpx';
import { PLATFORM } from '#/constants/locales';

const emit = defineEmits(['pageReload']);

const objectRequest = ref<
  CreatePlatformCallbackRequest | UpdatePlatformCallbackRequest
>({});
const isUpdate = ref<Boolean>(false);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    formVal.config = JSON.parse(formVal.config);
    await (isUpdate.value
      ? platformCallbackApi.fetchPlatformcallbackUpdate(JSON.stringify(formVal))
      : platformCallbackApi.fetchPlatformcallbackCreate(
          JSON.stringify(formVal),
        ));
    await drawerApi.close();
  },
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'id',
      // 界面显示的label
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: PLATFORM,
      },
      // 字段名
      fieldName: 'platform',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.platform')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.name')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'config',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.config')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'remark',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.remark')}`,
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    isUpdate.value = false;
  },
  async onConfirm() {
    // const result = await formApi.validate()
    // if (!result.valid) {
    //   return
    // }
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<Record<string, any>>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}

const title: string = objectRequest.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Form />
  </Modal>
</template>
