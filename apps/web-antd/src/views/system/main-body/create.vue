<script lang="ts" setup name="CreateOrg">
import type { OrgCreateRequest } from '#/api/models/users';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { mainBodyApi, orgApi, roleApi } from '#/api';

const emit = defineEmits(['pageReload']);

const notice = ref<OrgCreateRequest>({});
const menuData = ref([]);
const roleData = ref([]);
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
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: `${$t('system.mainbody.columns.name')}`,
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
      fieldName: 'email',
      // 界面显示的label
      label: `${$t('system.mainbody.columns.email')}`,
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
      label: `${$t('system.mainbody.columns.remark')}`,
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await (isUpdate.value
      ? mainBodyApi.fetchMainUpdate(JSON.stringify(values))
      : mainBodyApi.fetchMainCreate(JSON.stringify(values)));
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
      roleApi.fetchRoleList({ page: 1000 }).then((res) => {
        roleData.value = res.items;
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
