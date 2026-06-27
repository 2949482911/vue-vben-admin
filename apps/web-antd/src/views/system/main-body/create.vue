<script lang="ts" setup name="CreateOrg">
import type { MainBodyComboPageItem, MainBodyCreateRequest } from "#/api/models/main-body";

import { onMounted, ref } from "vue";

import { useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { Card, message } from "ant-design-vue";

import { useVbenForm } from "#/adapter/form";
import { mainBodyApi, mainBodyComboApi } from "#/api";

const emit = defineEmits(["pageReload"]);

const notice = ref<MainBodyCreateRequest>({
  comboId: "", email: "", id: "", name: "", remark: ""
});
const isUpdate = ref<Boolean>(false);

// 套餐选项列表
const comboOptions = ref<{ label: string; value: string }[]>([]);

// 加载套餐选项
async function loadComboOptions() {
  try {
    const res = await mainBodyComboApi.fetchMainBodyComboList({
      name: "", type: "",
      page: 1,
      pageSize: 1000,
      status: 1
    });
    comboOptions.value = res.items.map((item: MainBodyComboPageItem) => ({
      label: item.name,
      value: item.id
    }));
  } catch (err) {
    console.error("加载套餐列表失败:", err);
  }
}

onMounted(() => {
  loadComboOptions();
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
  },
  schema: [
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "id",
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "name",
      label: `${$t("system.mainbody.columns.name")}`,
      rules: "required"
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "email",
      label: `${$t("system.mainbody.columns.email")}`,
      rules: "required"
    },
    {
      component: "Textarea",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "remark",
      label: `${$t("system.mainbody.columns.remark")}`
    },
    {
      component: "Select",
      componentProps: {
        placeholder: "请选择套餐",
        options: comboOptions,
        allowClear: true,
        showSearch: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        }
      },
      fieldName: "comboId",
      label: "套餐",
      rules: "required"
    }
  ]
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
    isUpdate.value = false;
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const values = await formApi.getValues();
    try {
      if (isUpdate.value) {
        // @ts-ignore
        await mainBodyApi.fetchMainUpdate(values);
        message.success("修改成功！");
      } else {
        // @ts-ignore
        await mainBodyApi.fetchMainCreate(values);
        message.success("创建成功！");
      }
      await drawerApi.close();
      isUpdate.value = false;
      emit("pageReload");
    } catch (err) {
      console.error("保存失败:", err);
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 重新加载套餐选项数据
      await loadComboOptions();
      // @ts-ignore
      notice.value = drawerApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
        formApi.resetForm();
      }
    }
  }
});

function handleSetFormValue(row: any) {
  formApi.setValues(row);
}
</script>
<template>
  <Drawer :title="isUpdate ? `${$t('common.edit')}` : `${$t('common.create')}`">
    <Card>
      <Form />
    </Card>
  </Drawer>
</template>
