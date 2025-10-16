<script lang="ts" setup name="CreateNotice">
import type { CreateNoticeRequest } from '#/api/models';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { noticeApi } from '#/api';

const emit = defineEmits(['pageReload']);

const notice = ref<CreateNoticeRequest>({});
const isUpdate = ref<Boolean>(false);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: async (formVal: Record<string, any>) => {
    await (isUpdate.value
      ? noticeApi.fetchUpdateNotice(JSON.stringify(formVal))
      : noticeApi.fetchCreateNotice(JSON.stringify(formVal)));
    await drawerApi.close();
  },
  layout: 'vertical',
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
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'title',
      // 界面显示的label
      label: `${$t('system.notice.columns.title')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.select')}`,
        options: [
          {
            label: `${$t('system.notice.level.info')}`,
            value: 'info',
          },
          {
            label: `${$t('system.notice.level.warm')}`,
            value: 'warm',
          },
          {
            label: `${$t('system.notice.level.error')}`,
            value: 'error',
          },
        ],
      },
      // 字段名
      fieldName: 'level',
      // 界面显示的label
      label: `${$t('system.notice.columns.level')}`,
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
      fieldName: 'content',
      // 界面显示的label
      label: `${$t('system.notice.columns.content')}`,
      rules: 'required',
    },
  ],
});

const [Drawer, drawerApi] = useVbenDrawer({
  // showConfirmButton: true,
  // showCancelButton: true,
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
    if (isOpen) {
      notice.value = drawerApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}

const title: string = notice.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
