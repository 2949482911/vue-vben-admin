<script setup lang="ts" name="CreateProject">
import {Page, useVbenDrawer} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {computed, ref} from 'vue';

import type {
  CreateProjectRequest,
  UpdateProjectRequest
} from "#/api/models";
import { projectApi } from "#/api";
import { useVbenForm } from "#/adapter/form";
import { trimObject } from '#/utils/trim';
import { ProjectType, ProjectTypeLabel } from "#/views/marketing/project/enums";
import { useOssClient } from "#/views/marketing/asset/material/useOssClient";
import { uploadToOss } from "#/utils/uploadToOss";
import { calcFileMd5 } from "#/utils/fileMd5";
import { useUserStore } from "@vben/stores";

const emit = defineEmits(['pageReload']);

const objectRequest = ref<CreateProjectRequest | UpdateProjectRequest>({
  miniProgramId: "",
  description: "",
  icon: "",
  id: "",
  name: "",
  packageName: "",
  projectType: ProjectType.ANDROID,
  appId: ''
});

const isUpdate = ref<Boolean>(false);

const title = computed(() => isUpdate.value ? `${$t('common.edit')}` : `${$t('common.create')}`);

/** 上传 icon 到阿里云 OSS */
async function uploadIcon(file: File, onSuccess?: Function, onError?: Function) {
  try {
    const client = await useOssClient();
    const md5 = await calcFileMd5(file);
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const userStore = useUserStore();
    const mainId = userStore.userInfo?.mainId;
    const ossKey = `${mainId}/image/project_icon/${md5}${ext}`;
    const result = await uploadToOss(client, file, ossKey);
    onSuccess?.({ url: result.url });
  } catch (err) {
    onError?.(err);
  }
}

function extractIconUrl(icon: any): string {
  if (!icon) return '';
  if (typeof icon === 'string') return icon;
  if (Array.isArray(icon) && icon.length > 0) {
    return icon[0]?.url || icon[0]?.response?.url || '';
  }
  return '';
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
  handleSubmit: async (values) => {
    const formVal = values as Record<string, any>;
    formVal.icon = extractIconUrl(formVal.icon);
    const params = trimObject(formVal) as CreateProjectRequest | UpdateProjectRequest;
    await (isUpdate.value ? projectApi.fetchUpdateProject(params as UpdateProjectRequest)
      : projectApi.fetchCreateProject(params))
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
      component: "Upload",
      componentProps: {
        accept: '.png,.jpg,.jpeg,.svg,.ico',
        maxCount: 1,
        maxSize: 2,
        multiple: false,
        listType: 'picture-card',
        customRequest: async (option: { file: File; onSuccess?: Function; onError?: Function }) => {
          await uploadIcon(option.file, option.onSuccess, option.onError);
        },
      },
      fieldName: "icon",
      rules: 'required',
      label: `${$t('marketing.project.columns.icon')}`,
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: ProjectTypeLabel,
      },
      // 字段名
      fieldName: 'projectType',
      defaultValue: ProjectType.ANDROID,
      // 界面显示的label
      label: `${$t('marketing.project.columns.projectType')}`,
      rules: 'required',
    },

    {
      component: "Input",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      label: `${$t('marketing.project.columns.appId')}`,
      rules: 'required',
      fieldName: "appId"
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      label: `${$t('marketing.project.columns.miniProgramId')}`,
      rules: "required",
      fieldName: "miniProgramId",
      dependencies: {
        show: (val: any) => {
          return val.projectType === ProjectType.WECHAT_MINI_GAME || val.projectType === ProjectType.WECHAT_MINI_PROGRAM
        },
        triggerFields: ["projectType"],
      }
    },
    {
      component: "Textarea",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      label: `${$t('marketing.project.columns.description')}`,
      fieldName: "description",
    }
  ],
});


const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onCancel() {
    await formApi.resetForm();
    objectRequest.value = {
      description: "",
      icon: "",
      id: "",
      name: "",
      packageName: "",
      projectType: '',
      miniProgramId: "",
      appId: ""
    };
    isUpdate.value = false;
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }

    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    await formApi.resetForm();
    await drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = drawerApi.getData<CreateProjectRequest | UpdateProjectRequest>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
        formApi.resetForm();
      }
    } else {
      isUpdate.value = false;
    }
  },
});

function handleSetFormValue(row: CreateProjectRequest | UpdateProjectRequest) {
  formApi.setValues({
    ...row,
    icon: row.icon
      ? [{ uid: row.icon, name: 'icon', status: 'done', url: row.icon }]
      : undefined,
  });
}


</script>

<template>
  <Page>
    <Drawer :title="title">
      <Form/>
    </Drawer>
  </Page>
</template>

<style scoped>

</style>
