<script lang="ts" setup name="CreateOrg">
import type { OrgCreateRequest } from '#/api/models/users';

import {computed, ref} from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
  wrapperClass: 'grid-cols-1',
  handleSubmit: async (values: Record<string, any>) => {
    await (isUpdate.value
      ? mainBodyApi.fetchMainUpdate(JSON.stringify(values))
      : mainBodyApi.fetchMainCreate(JSON.stringify(values)));
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
      roleApi.fetchRoleList({ page: 1000 }).then((res) => {
        roleData.value = res.items;
      });
    }
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}

const title = computed(() =>
  isUpdate.value ? `${$t('common.edit')}` : `${$t('common.create')}`,
);
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
