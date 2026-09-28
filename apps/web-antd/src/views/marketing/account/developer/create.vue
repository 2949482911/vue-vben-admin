<script lang="ts" setup name="CreateDeveloper">
import type { CreateDeveloperRequest, UpdateDeveloperRequest } from '#/api/models';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { developerApi } from '#/api/core';
import { Platform } from '#/constants/enums';
import { DEVELOPER_AUTH_ACCOUNT_PLATFORM } from '#/constants/locales';
import { trimObject } from '#/utils/trim';

const emit = defineEmits(['pageReload']);

/** 是否为编辑态：决定标题文案与提交时调用的接口 */
const isUpdate = ref(false);

/**
 * 标题必须用 computed：
 * 原先写成普通 const，只在初始化时求值一次，新增时也会显示成「编辑」
 */
const title = computed(() =>
  isUpdate.value ? `${$t('common.edit')}` : `${$t('common.create')}`,
);

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
    const params = trimObject(formVal);
    await (isUpdate.value
      ? developerApi.fetchUpdateDeveloper(params as UpdateDeveloperRequest)
      : developerApi.fetchCreateDeveloper(params as CreateDeveloperRequest)
    );
  },
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'id',
      // 主键仅用于回显，不在界面上展示
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: DEVELOPER_AUTH_ACCOUNT_PLATFORM,
      },
      defaultValue: Platform.VIVO,
      fieldName: 'platform',
      label: `${$t('marketing.developer.columns.platform')}`,
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'name',
      label: `${$t('marketing.developer.columns.name')}`,
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'apiKey',
      label: `${$t('marketing.developer.columns.apiKey')}`,
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'apiSecret',
      label: `${$t('marketing.developer.columns.apiSecret')}`,
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'remark',
      label: `${$t('marketing.developer.columns.remark')}`,
    },
  ],
  // 抽屉内单列展示，字段宽度更充裕
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[600px]',
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
    await drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    // 先重置再回显，避免上一次的值残留到本次
    formApi.resetForm();
    const row = drawerApi.getData() as Record<string, any> | undefined;
    isUpdate.value = Boolean(row?.id);
    if (row?.id) {
      formApi.setValues(row);
    }
  },
});
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
