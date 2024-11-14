<script lang="ts" setup name="CreateOrg">
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {orgApi, roleApi} from '#/api';
import type {OrgCreateRequest} from "#/api/models/users";
import {SEX_SELECT} from "#/constants/locales";

const emit = defineEmits(['pageReload']);

const notice = ref<OrgCreateRequest>({});
const menuData = ref([])
const roleData = ref([])
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
        triggerFields: ["*"]
      }
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
        }
      },
      // 字段名
      fieldName: 'orgId',
      // 界面显示的label
      label: `${$t('system.user.columns.orgId')}`,
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
      fieldName: 'nickname',
      // 界面显示的label
      label: `${$t('system.user.columns.nickname')}`,
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
      fieldName: 'authName',
      // 界面显示的label
      label: `${$t('system.user.columns.authName')}`,
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
      fieldName: 'phone',
      // 界面显示的label
      label: `${$t('system.user.columns.phone')}`,
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
      fieldName: 'qq',
      // 界面显示的label
      label: `${$t('system.user.columns.qq')}`,
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
      label: `${$t('system.user.columns.email')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: SEX_SELECT
      },
      // 字段名
      fieldName: 'sex',
      // 界面显示的label
      label: `${$t('system.user.columns.sex')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: SEX_SELECT,
        mode: "multiple",
        options: roleData,
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        }
      },
      // 字段名
      fieldName: 'roleIds',
      // 界面显示的label
      label: `${$t('system.user.columns.roleIds')}`,
      rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await orgApi.fetchOrgUpdate(JSON.stringify(values))
    } else {
      await orgApi.fetchOrgCreate(JSON.stringify(values))
    }
    modalApi.close();
  }
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
    await emit("pageReload");
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
      orgApi.fetchOrgTree().then(res => {
        menuData.value = res
      })
      roleApi.fetchRoleList({page: 1000}).then(res => {
        roleData.value = res.items
      })
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
      <Form>

      </Form>
    </Card>
  </Modal>
</template>
