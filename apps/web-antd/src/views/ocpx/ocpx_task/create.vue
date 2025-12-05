<script lang="ts" setup name="CreateOcpxTask">
import type {OcpxTaskItem,} from '#/api/models';

import {ref} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {useVbenForm} from '#/adapter/form';
import {behavioraPlatformApi, ocpxTaskApi, platformCallbackApi} from '#/api/core/ocpx';
import {PLATFORM, STATUS_SELECT} from '#/constants/locales';

const emit = defineEmits(['pageReload']);

const objectRequest = ref<OcpxTaskItem>({});
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
  handleSubmit: async (formVal: Record<string, any>) => {
    await (isUpdate.value
      ? ocpxTaskApi.fetchUpdateOcpxTask(formVal)
      : ocpxTaskApi.fetchCreateOcpxTask(formVal,));
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
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: PLATFORM,
      },
      // 字段名
      fieldName: 'platform',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.platform')}`,
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
      fieldName: 'name',
      // 界面显示的label
      label: `${$t('ocpx.ocpx_task.columns.name')}`,
      rules: 'required',
    },


    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: STATUS_SELECT
      },
      // 字段名
      fieldName: 'taskState',
      // 界面显示的label
      label: `${$t('ocpx.ocpx_task.columns.taskState')}`,
      rules: 'required',
      defaultValue: 1,
    },


    {
      component: 'ApiSelect',
      fieldName: 'behavioraPlatformIds',
      label: `${$t('ocpx.ocpx_task.columns.behavioraPlatform')}`,
      componentProps: {
        showSearch: true,
        filterOption: (inputValue: string, option: {label: string}) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        mode: 'multiple',
        placeholder: `${$t('common.select')}`,
        api: async (params: any) => {
          return await behavioraPlatformApi.fetchBehavioraPlatformList(params);
        },
        params: {
          page: 1,
          size: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: "items"
      },
      rules: 'required',
    },

    {
      component: 'ApiSelect',
      fieldName: 'platformCallbackIds',
      label: `${$t('ocpx.ocpx_task.columns.platformCallback')}`,
      componentProps: {
        mode: 'multiple',
        showSearch: true,
        filterOption: (inputValue: string, option: {label: string}) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        placeholder: `${$t('common.select')}`,
        api: async (params: any) => {
          return await platformCallbackApi.fetchPlatformcallbackList(params);
        },
        params: {
          page: 1,
          size: 10000,
        },

        labelField: 'name',
        valueField: 'id',
        resultField: "items"
      },
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
      fieldName: 'description',
      // 界面显示的label
      label: `${$t('ocpx.ocpx_task.columns.description')}`,
    },

    {
      component: 'Slider',
      fieldName: 'clickRangeDay',
      componentProps: {
        marks: {
          3: '3',
          7: '7',
          15: '15',
          30: '30',
        },
        max: 30,
        min: 3
      },
      label: `${$t('ocpx.ocpx_task.columns.clickRangeDay')}`,
      rules: 'required',
      formItemClass: () => {
        return 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1'
      }
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    formApi.resetForm();
    isUpdate.value = false;
  },
  async onConfirm() {
    const result = await formApi.validate()
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
      objectRequest.value = modalApi.getData<Record<string, any>>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}

const title: string = objectRequest.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Form/>
  </Modal>
</template>
