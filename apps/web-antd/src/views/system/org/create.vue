<script lang="ts" setup name="CreateOrg">
import type { OrgCreateRequest } from '#/api/models/users';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';


import { useVbenForm } from '#/adapter/form';
import { orgApi } from '#/api';
import { trimObject } from '#/utils/trim';

const emit = defineEmits(['pageReload']);

const notice = ref<OrgCreateRequest>({});
const menuData = ref([]);
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
      component: 'TreeSelect',
      // 对应组件的参数
      componentProps: {
        width: 200,
        placeholder: `${$t('common.input')}`,
        showSearch: true,
        filterTreeNode: true,
        treeData: menuData,
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
      },
      // 字段名
      fieldName: 'parentId',
      // 界面显示的label
      label: `${$t('system.org.parentId')}`,
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
      label: `${$t('system.org.columns.name')}`,
      rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
  handleSubmit: async (values: Record<string, any>) => {
    const params = trimObject(values);
    await (isUpdate.value
      ? orgApi.fetchOrgUpdate(JSON.stringify(params))
      : orgApi.fetchOrgCreate(JSON.stringify(params)));
    await drawerApi.close();
  },
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
    if (isOpen) {
      formApi.resetForm();
      notice.value = drawerApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
      orgApi.fetchOrgTree().then((res) => {
        menuData.value = res;
      });
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
