<script lang="ts" setup name="CreateOrg">
import type { OrgCreateRequest } from '#/api/models/users';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { orgApi } from '#/api';

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
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    await (isUpdate.value
      ? orgApi.fetchOrgUpdate(JSON.stringify(values))
      : orgApi.fetchOrgCreate(JSON.stringify(values)));
    await modalApi.close();
  },
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
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
      notice.value = modalApi.getData<Record<string, any>>();
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
  <Modal :title="title">
    <Card>
      <Form />
    </Card>
  </Modal>
</template>
