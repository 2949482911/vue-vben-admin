<script lang="ts" setup name="CreateNotice">
import type {CreateNoticeRequest} from '#/api/models';

import {ref} from 'vue';

import {useVbenDrawer} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {useVbenForm} from '#/adapter/form';
import {noticeApi} from '#/api';

const emit = defineEmits(['pageReload']);

const notice = ref<CreateNoticeRequest>({});
const isUpdate = ref<Boolean>(false);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: (formVal: Record<string, any>) => {
    if (isUpdate.value) {
      noticeApi.fetchUpdateNotice(JSON.stringify(formVal)).then(() => {
        drawerApi.close();
        drawerApi.resetForm();
      });
    } else {
      noticeApi.fetchCreateNotice(JSON.stringify(formVal)).then(() => {
        drawerApi.close();
        drawerApi.resetForm();
      });
    }

    emit('pageReload');
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
      fieldName: 'title',
      // 界面显示的label
      label: `${$t('system.notice.columns.title')}`,
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
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    await formApi.submitForm();
    await formApi.resetForm();
    drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = drawerApi.getData<Record<string, any>>();
      console.log(notice.value);
      if (notice.value) {
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
