<script setup lang="ts" name="CreateProject">
import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {ref} from 'vue';

import type {
  CreateProjectRequest,
  UpdateProjectRequest
} from "#/api/models";
import {projectApi} from "#/api";
import {useVbenForm} from "#/adapter/form";

const emit = defineEmits(['pageReload']);


const objectRequest = ref<CreateProjectRequest | UpdateProjectRequest>({
  description: "",
  icon: "",
  id: "",
  name: "",
  packageName: "",
  projectType: 1
});


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
  handleSubmit: async (formVal: CreateProjectRequest | UpdateProjectRequest) => {
    await (isUpdate.value ? projectApi.fetchUpdateProject(formVal as UpdateProjectRequest)
      : projectApi.fetchCreateProject(formVal))
  },
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
      rules: 'required',
      label: `${$t('marketing.project.columns.name')}`,
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'packageName',
      // 界面显示的label
      rules: 'required',
      label: `${$t('marketing.project.columns.packageName')}`,

    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: "APP",
            value: 1,
          },
          {
            label: "MiniApp",
            value: 2,
          },
        ],
      },
      // 字段名
      fieldName: 'projectType',
      defaultValue: 1,
      // 界面显示的label
      label: `${$t('marketing.project.columns.projectType')}`,
      rules: 'required',
    },

  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await formApi.resetForm();
    objectRequest.value = {
      description: "",
      icon: "",
      id: "",
      name: "",
      packageName: "",
      projectType: 1
    };
    isUpdate.value = false;
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }

    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');

    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<CreateProjectRequest | UpdateProjectRequest>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      }
    } else {
      isUpdate.value = false;
    }
  },
});

function handleSetFormValue(row: CreateProjectRequest | UpdateProjectRequest) {
  formApi.setValues(row)
}


</script>

<template>
  <Page>
    <Modal>
      <Form/>
    </Modal>
  </Page>
</template>

<style scoped>

</style>
