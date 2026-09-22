<script lang="ts" setup>
import { projectApi, titlePackApi } from "#/api";
import { ACTIVE_PLATFORM } from "#/constants/locales";
import { trimObject } from "#/utils/trim";
import { useVbenDrawer, useVbenForm } from "@vben/common-ui";
import { message } from "ant-design-vue";

import type { TitlePackItem } from "./titlePackageType";

const props = defineProps<{
  displayValue?: TitlePackItem;
}>();

const emit = defineEmits(["pageReload"]);

const [titlePackageDrawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  class: "w-[50%]",
  async onCancel() {
    formApi.reset();
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const formValue = await formApi.getValues();
    const params = trimObject({
      id: props.displayValue?.id,
      title: formValue.title,
      platform: formValue.platform,
      projectId: formValue.projectId,
      titles: formValue.titles || []
    });
    try {
      if (props.displayValue?.id) {
        await titlePackApi.fetchModifyTitlePack(params);
        await message.success("修改成功！");
      } else {
        await titlePackApi.fetchNewTitlePack(params);
        await message.success("添加成功！");
      }
      formApi.reset();
      await drawerApi.close();
      emit("pageReload");
    } catch (err) {
      console.log(err);
    }
  },
  async onOpened() {
    if (props.displayValue?.id) {
      const data = props.displayValue;
      formApi.setValues({
        title: data.title,
        platform: data.platform,
        projectId: data.projectId,
        titles: data.titles || []
      });
    }
  }
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
  },
  layout: "horizontal",
  schema: [
    {
      component: "ApiSelect",
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: "请选择",
        api: async (params: any) => {
          return await projectApi.fetchProjectList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000
        },
        valueField: "id",
        labelField: "name",
        resultField: "items"
      },
      fieldName: "projectId",
      label: "产品",
      rules: "required"
    },
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入"
      },
      fieldName: "title",
      label: "标题",
      rules: "required"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        placeholder: "请选择"
      },
      fieldName: "platform",
      label: "平台",
      rules: "required"
    },
    {
      component: "TitleTextarea",
      componentProps: {
        placeholder: "每行一个标题，按换行分隔",
        rows: 10
      },
      fieldName: "titles",
      label: "标题列表",
      rules: "required"
    }
  ]
});
</script>

<template>
  <titlePackageDrawer :title="props.displayValue?.id ? '编辑标题包' : '添加标题包'">
    <Form />
  </titlePackageDrawer>
</template>

<style lang="scss" scoped></style>
