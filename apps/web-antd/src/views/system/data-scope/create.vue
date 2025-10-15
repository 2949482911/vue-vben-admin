<script lang="ts" setup name="CreateOrg">
import type { UserInfo } from '@vben/types';

import type { OrgCreateRequest, UserItem } from '#/api/models/users';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Card } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { dataRangeApi, orgApi, userApi } from '#/api';
import { DATA_SCOPE } from '#/constants/locales';

const emit = defineEmits(['pageReload']);

const notice = ref<OrgCreateRequest>({});
const menuData = ref([]);
const isUpdate = ref<Boolean>(false);
const userList = ref<UserItem>([]);
// 用户信息
const userInfo: UserInfo = useUserStore().userInfo;
const dataScope = ref<[]>();

filterDataScope();

// // 过滤筛选项
function filterDataScope(): [] {
  dataScope.value = [...DATA_SCOPE];
  if (userInfo.mainAdmin) {
    dataScope.value = dataScope.value.filter(
      (x) => ![5, 8].indexOf(x.value) < 0,
    );
  }
}

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
      label: `${$t('system.data_scope.columns.name')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: dataScope,
      },
      // 字段名
      defaultValue: 1,
      fieldName: 'type',
      // 界面显示的label
      label: `${$t('system.data_scope.columns.type')}`,
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
      label: `${$t('system.data_scope.columns.remark')}`,
    },

    {
      component: 'Select',
      componentProps: {
        options: userList,
        fieldNames: {
          label: 'nickname',
          value: 'id',
        },
        mode: 'multiple',
      },
      fieldName: 'userIds',
      dependencies: {
        show: (val) => {
          if (val.type == 2 || val.type == 4) {
            userApi
              .fetchUserList({
                page: 1,
                pageSize: 1000,
              })
              .then((res) => {
                userList.value = res.items;
              });
            return true;
          }
          return false;
        },
        required: (val) => {
          if (val.type == 2 || val.type == 4) {
            return true;
          }
          return false;
        },
        triggerFields: ['type'],
      },
      label: `${$t('system.data_scope.columns.userIds')}`,
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'multiple',
      },
      fieldName: 'mainIds',
      dependencies: {
        show: (val) => {
          if (val.type == 8) {
            return true;
          }
          return false;
        },
        required: (val) => {
          if (val.type == 8) {
            return true;
          }
          return false;
        },
        triggerFields: ['type'],
      },
      label: `${$t('system.data_scope.columns.mainIds')}`,
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: menuData,
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
      },
      fieldName: 'orgIds',
      dependencies: {
        show: (val) => {
          if (val.type == 3 || val.type == 4) {
            orgApi.fetchOrgTree().then((res) => {
              menuData.value = res;
            });
            return true;
          }
          return false;
        },
        required: (val) => {
          if (val.type == 3 || val.type == 4) {
            return true;
          }
          return false;
        },
        triggerFields: ['type'],
      },
      label: `${$t('system.data_scope.columns.orgIds')}`,
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    await (isUpdate.value
      ? dataRangeApi.fetchUpdateDataRange(JSON.stringify(values))
      : dataRangeApi.fetchCreateDataRange(JSON.stringify(values)));
    modalApi.close();
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
    await emit('pageReload');
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
