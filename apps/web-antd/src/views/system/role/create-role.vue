<script lang="ts" setup name="CreateRole">
import type { BasicRole } from "@vben-core/typings/src/basic";

import type { CreateRoleRequest, UpdateRoleRequest } from "#/api/models";
import type { MenuItem } from "#/api/models/menu";

import { computed, onMounted, ref } from "vue";

import { Tree, useVbenDrawer } from "@vben/common-ui";
import { IconifyIcon } from "@vben/icons";
import { $t } from "@vben/locales";
import { useUserStore } from "@vben/stores";

import { useVbenForm } from "#/adapter/form";
import { menuApi, roleApi } from "#/api";
import { ROLE_TYPE_OPTIONS } from "#/constants/locales";

const emit = defineEmits(["pageReload"]);
const userStore = useUserStore();

const createObject = ref<CreateRoleRequest | UpdateRoleRequest>({
  comment: "",
  id: "",
  menuIds: [],
  name: "",
  roleType: 0
});
const isUpdate = ref<Boolean>(false);
const menuData = ref<MenuItem[]>([]);
const roleType = ref<Array<{ label: string, value: number }>>([
  {
    label: `${$t("core.role_type.platform_user")}`,
    value: 3
  },
  {
    label: `${$t("core.role_type.main_admin")}`,
    value: 4
  },
  {
    label: `${$t("core.role_type.main_user")}`,
    value: 5
  }
]);
// const menuParentIds = ref<string[]>([]);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    formItemClass: 'w-[300px]',
    componentProps: {
      class: "w-[300px]"
    }
  },
  layout: "horizontal",
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: "Input",
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      // 字段名
      fieldName: "id",
      // 界面显示的label
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },
    {
      component: "Input",
      fieldName: "name",
      rules: "required",
      label: `${$t("system.role.columns.name")}`
    },

    {
      component: "Select",
      componentProps: {
        options: roleType,
        allowClear: true,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "roleType",
      rules: "required",
      label: `${$t("system.role.columns.roleType")}`
    },
    {
      component: "Textarea",
      componentProps: {
        max: 200,
        line: 5
      },
      fieldName: "comment",
      label: `${$t("system.role.columns.comment")}`
    },
    {
      // 树在模板的 #menuIds 插槽里渲染（vben 的 Tree，model 是 modelValue），
      // 所以这里不写 componentProps；app 注册的 'Tree' 是 antd 的 Tree（model 是 checkedKeys），
      // 两者模型名不同，插槽里必须用 componentField 绑定，不能整包 spread slotProps
      component: "Tree",
      rules: "required",
      formItemClass: 'w-[600px]',
      fieldName: "menuIds",
      label: `${$t("system.role.columns.menuIds")}`
    }
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: "grid-cols-1",
  handleSubmit: async (values: Record<string, any>) => {
    await (isUpdate.value
      ? roleApi.fetchUpdateRole(values as UpdateRoleRequest)
      : roleApi.fetchCreateRole(values as CreateRoleRequest));
    await drawerApi.close();
  }
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

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  class: "w-[75%]",
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
    emit("pageReload");
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      formApi.resetForm();
      createObject.value = drawerApi.getData<Record<string, any>>() as CreateRoleRequest | UpdateRoleRequest;
      // 编辑：把角色已有的 menuIds 写进表单，树由表单值回显（角色列表接口已带回 menuIds）
      if (createObject.value.id) {
        isUpdate.value = true;
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
  }
});

function handleSetFormValue(row: CreateRoleRequest | UpdateRoleRequest) {
  formApi.setValues(row);
}

function getNodeClass(node: any) {
  const classes: string[] = [];
  if (node.value?.type === 2) {
    classes.push("inline-flex");
  }

  return classes.join(" ");
}

onMounted(() => {
  //  handler role type options
  //  if (userStore.userInfo?.maxRoleCode)
  var supperUser: boolean = false;
  userStore.roles.forEach((role: BasicRole) => {
    if (role.roleType === 1) {
      supperUser = true;
    }
  });
  if (supperUser) {
    roleType.value = ROLE_TYPE_OPTIONS;
  }
});

const title = computed(() =>
  isUpdate.value ? `${$t("common.edit")}` : `${$t("common.create")}`
);
</script>
<template>
  <Drawer :title="title">
    <Form>
      <template #menuIds="slotProps">
        <!--
          componentField 里有 modelValue + onUpdate:modelValue（写回表单字段 menuIds）。
          原来整包 v-bind="slotProps"：只有 modelValue，没有 onUpdate:modelValue，
          勾选结果永远回不到表单 —— 新建时 required 校验不过、编辑时新增的权限被丢弃。
        -->
        <Tree
          v-bind="slotProps.componentField"
          :tree-data="menuData"
          :multiple="true"
          bordered
          :check-strictly="false"
          :default-expanded-level="2"
          :include-indeterminate="true"
          :get-node-class="getNodeClass"
          value-field="id"
          label-field="title"
          icon-field="meta.icon"
          :auto-check-parent="true"
        >
          <template #node="{ value }">
            <IconifyIcon v-if="value.icon" :icon="value.icon" />
            {{ $t(value.title) }}
          </template>
        </Tree>
      </template>
    </Form>
  </Drawer>
</template>
