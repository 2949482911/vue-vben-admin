<script lang="ts" setup name="CreateMenu">
import type {CreateMenuRequest, MenuItem} from '#/api/models/menu';
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {menuApi} from '#/api';

const emit = defineEmits(['pageReload']);

const notice = ref<CreateMenuRequest>({});
const menuData = ref([])
const isUpdate = ref<Boolean>(false);

function updateMenuTitle(menu: MenuItem) {
  menu.title = `${$t(menu.title)}`
  if (!menu.children) {
    return
  }
  menu.children.forEach(x => {
    updateMenuTitle(x)
  })
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
          title: 'title',
          value: 'id',
          children: 'children',
        }
      },
      renderComponentContent: (value, _) =>  {
        return {
          strengthText: () => $t(`${value.title}`),
        };
      },
      // 字段名
      fieldName: 'parentId',
      // 界面显示的label
      label: `${$t('system.menu.parentId')}`,
    },
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
      rules: "required"
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
      component: 'Select',
      defaultValue: 1,
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: `${$t('system.menu.type.menu')}`,
            value: 1,
          },
          {
            label: `${$t('system.menu.type.interface')}`,
            value: 2,
          },
          {
            label: `${$t('system.menu.type.button')}`,
            value: 3,
          }
        ]
      },
      fieldName: 'type',
      label: `${$t('system.menu.columns.type')}`,
      rules: 'required',
      disabled: isUpdate,
    },


    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'component',
      // 界面显示的label
      label: `${$t('system.menu.columns.component')}`,

      dependencies: {
        show: (val) => {
          return val.type === 1
        },
        required: (value) => {
          return value.type === 1
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'icon',
      label: `${$t('system.menu.columns.icon')}`,
      dependencies: {
        show: (val) => {
          return val.type === 1;
        },
        required: (value) => {
          return value.type === 1
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'activeIcon',
      label: `${$t('system.menu.columns.activeIcon')}`,
      dependencies: {
        show: (val) => {
          return val.type === 1;
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'badge',
      label: `${$t('system.menu.columns.badge')}`,
      dependencies: {
        show: (val) => {
          return val.type === 1;
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: "dot",
            value: "dot",
          },
          {
            label: "normal",
            value: "normal",
          },
        ]
      },
      fieldName: 'badgeType',
      label: `${$t('system.menu.columns.badgeType')}`,
      dependencies: {
        show: (val) => {
          return val.type === 1;
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: "default",
            value: "default",
          },
          {
            label: "destructive",
            value: "destructive",
          },
          {
            label: "primary",
            value: "primary",
          },
          {
            label: "success",
            value: "success",
          },
          {
            label: "warning",
            value: "warning",
          },
        ]
      },
      fieldName: 'badgeVariants',
      label: `${$t('system.menu.columns.badgeVariants')}`,
      dependencies: {
        show: (val) => {
          return val.type === 1;
        },

        triggerFields: ["type"]
      }
    },


    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'path',
      label: `${$t('system.menu.columns.path')}`,
      dependencies: {
        show: (val) => {
          return val.type == 1
        },
        required: (val) => {
          return val.type === 1
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'sort',
      label: `${$t('system.menu.columns.sort')}`,
      rules: 'required',
    },

    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'redirect',
      label: `${$t('system.menu.columns.redirect')}`,
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'backendUrl',
      label: `${$t('system.menu.columns.backendUrl')}`,
      dependencies: {
        show: (values) => {
          return values.type === 2
        },
        triggerFields: ["type"]
      }
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'mark',
      label: `${$t('system.menu.columns.mark')}`,
      dependencies: {
        show: (values) => {
          return values.type === 2
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Checkbox',
      componentProps: {
        placeholder: `${$t('common.input')}`,

      },
      fieldName: 'hideMenu',
      label: `${$t('system.menu.columns.hideMenu')}`,
      formItemClass: 'col-span-3 items-baseline',
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    },


    {
      component: 'Checkbox',
      componentProps: {
        placeholder: `${$t('common.input')}`,

      },
      fieldName: 'keepAlive',
      label: `${$t('system.menu.columns.keepAlive')}`,
      formItemClass: 'col-span-3 items-baseline',
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    },

    {
      component: 'Checkbox',
      componentProps: {
        placeholder: `${$t('common.input')}`,

      },
      fieldName: 'hideInBreadcrumb',
      label: `${$t('system.menu.columns.hideInBreadcrumb')}`,
      formItemClass: 'col-span-3 items-baseline',
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    },
    {
      component: 'Checkbox',
      componentProps: {
        placeholder: `${$t('common.input')}`,

      },
      fieldName: 'hideInTab',
      label: `${$t('system.menu.columns.hideInTab')}`,
      formItemClass: 'col-span-3 items-baseline',
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    },
    {
      component: 'Checkbox',
      componentProps: {
        placeholder: `${$t('common.input')}`,

      },
      fieldName: 'ignoreAccess',
      label: `${$t('system.menu.columns.ignoreAccess')}`,
      formItemClass: 'col-span-3 items-baseline',
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    },
    {
      component: 'Checkbox',
      componentProps: {
        placeholder: `${$t('common.input')}`,

      },
      fieldName: 'menuVisibleWithForbidden',
      label: `${$t('system.menu.columns.menuVisibleWithForbidden')}`,
      formItemClass: 'col-span-3 items-baseline',
      dependencies: {
        show: (values) => {
          return values.type === 1
        },
        triggerFields: ["type"]
      }
    }
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await menuApi.fetchUpdateMenu(JSON.stringify(values))
    } else {
      await menuApi.fetchCreateMenu(JSON.stringify(values))
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
  async onConfirm()  {
    await formApi.submitForm();
    isUpdate.value = false;
    emit("pageReload");
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = modalApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
        if (notice.value.parentId) {
          handleSetFormValue(notice.value);
        }
      }
      menuApi.fetchMenuTree().then(res => {
        menuData.value = res
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
