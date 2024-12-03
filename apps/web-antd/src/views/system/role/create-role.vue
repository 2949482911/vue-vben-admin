<script lang="ts" setup name="CreateRole">
import type {MenuItem} from '#/api/models/menu';
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {menuApi, roleApi} from '#/api';
import {ROLE_TYPE_OPTIONS} from "#/constants/locales";
import type {CreateRoleRequest} from "#/api/models";

const emit = defineEmits(['pageReload']);

const notice = ref<CreateRoleRequest>({});
const isUpdate = ref<Boolean>(false);
const menuData = ref<MenuItem>([])
const menuParentIds = ref<string[]>([])

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
        triggerFields: ["*"]
      }
    },
    {
      component: 'Input',
      fieldName: 'name',
      required: true,
      label: `${$t('system.role.columns.name')}`
    },

    {
      component: 'Select',
      componentProps: {
        options: ROLE_TYPE_OPTIONS,
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'roleType',
      required: true,
      label: `${$t('system.role.columns.roleType')}`
    },
    {
      component: 'Textarea',
      componentProps: {
        max: 200,
        line: 5
      },
      fieldName: 'comment',
      label: `${$t('system.role.columns.comment')}`,
    },
    {
      component: "Tree",
      required: true,
      componentProps: {
        treeData: menuData,
        rowKey: 'id',
        checkedKeys: checkedKeys,
        height: 200,
        checkable: true,
        multiple: true,
        // checkStrictly: true,
        onCheck: (checkedKeys, info) => {
          // let checkedKeysResult = [...checkedKeys, ...info.halfCheckedKeys];
          if (menuParentIds.value.indexOf(info.node.parentId)) {
            menuParentIds.value.push(info.node.parentId);
          }
        },
        fieldNames: {
          key: 'id',
          children: 'children',
          title: 'title',
        },
      },
      fieldName: 'menuIds',
      label: `${$t('system.role.columns.menuIds')}`,
    }
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    if (menuParentIds.value.length > 0) {
      menuParentIds.value.push(...values["menuIds"])
      values["menuIds"] = menuParentIds.value
    }
    if (isUpdate.value) {
      await roleApi.fetchUpdateRole(JSON.stringify(values));
    } else {
      await roleApi.fetchCreateRole(JSON.stringify(values));
    }
    modalApi.close();
  }
});

function updateMenuTitle(menu: MenuItem) {
  menu.title = `${$t(menu.title)}`
  if (!menu.children) {
    return
  }
  menu.children.forEach(x => {
    updateMenuTitle(x)
  })
}

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    isUpdate.value = false;
    checkedKeys.value = []
  },
  async onConfirm() {
    await formApi.submitForm();
    isUpdate.value = false;
    checkedKeys.value = []
    emit("pageReload");
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = modalApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        checkedKeys.value = notice.value.menuIds
        // notice.value.menuIds = []
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
      menuApi.fetchMenuTree().then(res => {
        menuData.value = res
        // 获取国际化名字
        menuData.value.forEach(x => {
          x.title = `${$t(x.title)}`
          updateMenuTitle(x)
        })
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
