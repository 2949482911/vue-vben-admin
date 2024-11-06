<script lang="ts" setup name="CreateMenu">
import type { CreateMenuRequest } from '#/api/models/menu';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { fetchCreateMenu, fetchUpdateMenu } from '#/api';

const emit = defineEmits(['pageReload']);

const notice = ref<CreateMenuRequest>({});
const isUpdate = ref<Boolean>(false);

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    message.info('onConfirm');
    formApi.resetForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = drawerApi.getData<Record<string, any>>();
      if (notice.value) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: (formVal: Record<string, any>) => {
    if (isUpdate.value.id) {
      fetchUpdateMenu(JSON.stringify(formVal)).then(() => {
        drawerApi.close();
        drawerApi.resetForm();
      });
    } else {
      fetchCreateMenu(JSON.stringify(formVal)).then(() => {
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
      label: `${$t('system.menu.columns.title')}`,
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
      label: `${$t('system.menu.columns.name')}`,
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'icon',
      label: `${$t('system.menu.columns.icon')}`,
      rules: 'required',
    },
  ],
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
