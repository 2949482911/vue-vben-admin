<script lang="ts" setup name="CreateRole">
import type {CreateRoleRequest} from '#/api/models';
import type {MenuItem} from '#/api/models/menu';

import {ref} from 'vue';

import {Tree, useVbenModal} from '@vben/common-ui';
import {IconifyIcon} from '@vben/icons';
import {$t} from '@vben/locales';

import {Card} from 'ant-design-vue';

import {useVbenForm} from '#/adapter/form';
import {menuApi, roleApi} from '#/api';
import {ROLE_TYPE_OPTIONS} from '#/constants/locales';

const emit = defineEmits(['pageReload']);

const createObject = ref<CreateRoleRequest>({comment: "", id: "", menuIds: [], name: "", roleType: 0});
const isUpdate = ref<Boolean>(false);
const menuData = ref<MenuItem[]>([]);
// const menuParentIds = ref<string[]>([]);

const checkedKeys = ref<string[]>([]);

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
      component: 'Input',
      fieldName: 'name',
      rules: 'required',
      label: `${$t('system.role.columns.name')}`,
    },

    {
      component: 'Select',
      componentProps: {
        options: ROLE_TYPE_OPTIONS,
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'roleType',
      rules: 'required',
      label: `${$t('system.role.columns.roleType')}`,
    },
    {
      component: 'Textarea',
      componentProps: {
        max: 200,
        line: 5,
      },
      fieldName: 'comment',
      label: `${$t('system.role.columns.comment')}`,
    },
    {
      component: 'Tree',
      rules: 'required',
      formItemClass: 'items-start',
      modelPropName: 'modelValue',
      // componentProps: {
      //   treeData: menuData,
      //   rowKey: 'id',
      //   checkedKeys,
      //   height: 200,
      //   checkable: true,
      //   multiple: true,
      //   checkStrictly: true,
      //   // onCheck: (checkedKeys, info) => {
      //   //   // let checkedKeysResult = [...checkedKeys, ...info.halfCheckedKeys];
      //   //   if (menuParentIds.value.indexOf(info.node.parentId)) {
      //   //     menuParentIds.value.push(info.node.parentId);
      //   //   }
      //   // },
      //   fieldNames: {
      //     key: 'id',
      //     children: 'children',
      //     title: 'title',
      //   },
      // },
      fieldName: 'menuIds',
      label: `${$t('system.role.columns.menuIds')}`,
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    await (isUpdate.value
      ? roleApi.fetchUpdateRole(JSON.stringify(values))
      : roleApi.fetchCreateRole(JSON.stringify(values)));
    await modalApi.close();
  },
});

function updateMenuTitle(menu: MenuItem) {
  menu.title = `${$t(menu.title)}`;
  if (!menu.children) {
    return;
  }
  menu.children.forEach((x) => {
    updateMenuTitle(x);
  });
}

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    isUpdate.value = false;
    // checkedKeys.value = [];
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
      debugger
      createObject.value = modalApi.getData<Record<string, any>>();
      if (createObject.value.id) {
        isUpdate.value = true;
        // checkedKeys.value = notice.value.menuIds;
        // notice.value.menuIds = []
        handleSetFormValue(createObject.value);
      } else {
        isUpdate.value = false;
      }
      menuApi.fetchMenuTree().then((res) => {
        menuData.value = res;
        // 获取国际化名字
        menuData.value.forEach((x) => {
          x.title = `${$t(x.title)}`;
          updateMenuTitle(x);
        });
      });
    }
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}

function getNodeClass(node: any) {
  const classes: string[] = [];
  if (node.value?.type === 2) {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}

const title: string = createObject.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Card>
      <Form>
        <template #menuIds="slotProps">
          <Tree
            :tree-data="menuData"
            multiple
            bordered
            :default-expanded-level="2"
            v-bind="slotProps"
            :get-node-class="getNodeClass"
            value-field="id"
            label-field="title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.icon" :icon="value.icon"/>
              {{ $t(value.title) }}
            </template>
          </Tree>
        </template>
      </Form>
    </Card>
  </Modal>
</template>
