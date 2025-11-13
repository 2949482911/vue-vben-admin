<script lang="ts" setup name="CreateNotice">
import type {PlatformCallbackBehaviorTypeItem, PlatformcallbackItem} from '#/api/models';

import {ref} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Divider} from 'ant-design-vue';

import {useVbenForm} from '#/adapter/form';
import {advertiserApi} from '#/api';
import {platformCallbackApi} from '#/api/core/ocpx';
import {Platform} from '#/constants/enums';
import {PLATFORM} from '#/constants/locales';

const emit = defineEmits(['pageReload']);

const objectRequest = ref<PlatformcallbackItem>({});
const isUpdate = ref<Boolean>(false);

// 媒体配置表单
const platformConfigForm = new Map<string, Array<any>>();
// vivo 配置清单
platformConfigForm.set(Platform.VIVO, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'srcType',
    // 界面显示的label
    label: `srcType`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'pkgName',
    // 界面显示的label
    label: `pkgName`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'ApiSelect',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.select')}`,
      api: async (params: any) => {
        return await advertiserApi.fetchAdvertiserList(params);
      },
      onSelect: async (_, data: any) => {
        await formApi.setFieldValue('advertiserId', data.advertiserId);
        await formApi.setFieldValue('advertiserName', data.label);
      },
      params: {
        page: 1,
        size: 1000,
      },
      valueField: 'id',
      labelField: 'advertiserName',
      resultField: 'items',
    },
    // 字段名
    fieldName: 'advertiserName',
    // 界面显示的label
    label: `advertiser`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'srcId',
    // 界面显示的label
    label: `srcId`,
    rules: 'required',
  },
]);
// oppo 配置清单
platformConfigForm.set(Platform.OPPO, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'salt',
    // 界面显示的label
    label: `salt`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'base64Key',
    // 界面显示的label
    label: `base64Key`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'pkgName',
    // 界面显示的label
    label: `pkgName`,
    rules: 'required',
  },
  {
    defaultValue: '1',
    // 媒体配置表单
    component: 'Select',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
      options: [
        {
          label: 'oppo',
          value: '1',
        },
      ],
    },
    // 字段名
    fieldName: 'channel',
    // 界面显示的label
    label: `channel`,
    rules: 'required',
  },
]);
// 华为配置表
platformConfigForm.set(Platform.HUAWEI, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'secretKey',
    // 界面显示的label
    label: 'secretKey',
    rules: 'required',
  },
]);
// 字节回传
platformConfigForm.set(Platform.BYTEDANCE, []);


/**
 *
 * @param platform 平台
 */
async function getPlatformCallbackBehaviorTypeItem(platform: string) {
  behaviorTypeList.value = await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(
    platform
  );
}

const behaviorTypeList = ref<Array<PlatformCallbackBehaviorTypeItem>>([]);


const [ConfigForm, configFormApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  schema: platformConfigForm.get(Platform.VIVO),
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

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
    formVal.config = await configFormApi.getValues();
    await (isUpdate.value
      ? platformCallbackApi.fetchPlatformcallbackUpdate(formVal)
      : platformCallbackApi.fetchPlatformcallbackCreate(formVal));
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
        onSelect: async (value: string) => {
          configFormApi.setState((_) => {
            return {
              schema: platformConfigForm.get(value),
            };
          });
          // 更新字段
          const values = await formApi.getValues();
          if (values["behaviorTypeMoel"] === 'custom') {
            await getPlatformCallbackBehaviorTypeItem(value)
          }
        },
      },
      // 字段名
      fieldName: 'platform',
      defaultValue: Platform.VIVO,
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
      label: `${$t('ocpx.platformcallback.columns.name')}`,
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
      fieldName: 'advertiserId',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.advertiserId')}`,
      rules: 'required',
      dependencies: {
        show: (value) => {
          return value.platform !== Platform.VIVO;
        },
        triggerFields: ['platform'],
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
      fieldName: 'advertiserName',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.advertiserName')}`,
      rules: 'required',
      dependencies: {
        show: (value) => {
          return value.platform !== Platform.VIVO;
        },
        triggerFields: ['platform'],
      },
    },


    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: `${$t('ocpx.platformcallback.auto')}`,
            value: 'auto',
          },
          {
            label: `${$t('ocpx.platformcallback.custom')}`,
            value: 'custom',
          }
        ],
        onSelect: async (value: string) => {
          if (value === "custom") {
            const values = await  formApi.getValues();
            await getPlatformCallbackBehaviorTypeItem(values["platform"])
          }
        }
      },
      defaultValue: 'auto',
      // 字段名
      fieldName: 'behaviorTypeMoel',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.behaviorTypeMoel')}`,
      rules: 'required',
    },


    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.select')}`,
        options: behaviorTypeList,
      },
      // 字段名
      fieldName: 'behaviorType',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.behaviorType')}`,
      rules: 'required',
      dependencies: {
        show: (value) => {
          return value.behaviorTypeMoel === 'custom';
        },
        triggerFields: ['behaviorTypeMoel'],
      },
    },


    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'InputNumber',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        min: 0,
        max: 100,
        formatter: (value: number) => `${value}%`,
        parser: (value: string) => value.replace('%', ''),
      },
      // 字段名
      fieldName: 'ratio',
      defaultValue: 100,
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.ratio')}`,
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
      fieldName: 'remark',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.remark')}`,
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
    objectRequest.value = {};
    isUpdate.value = false;
  },
  async onConfirm() {
    const result = await formApi.validate();
    const configFormApiResult = await configFormApi.validate();
    if (!result.valid && !configFormApiResult.valid) {
      return;
    }
    await formApi.submitForm();
    await configFormApi.resetForm();
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
        getPlatformCallbackBehaviorTypeItem(objectRequest.value.platform);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row: PlatformcallbackItem) {
  formApi.setValues(row);
  configFormApi.setState((_) => {
    return {
      schema: platformConfigForm.get(row.platform),
    };
  });
  configFormApi.setValues(row.config);
}

const title: string = objectRequest.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Divider>{{ $t('core.baseInfo') }}</Divider>

    <Form/>

    <Divider>{{ $t('core.configuration') }}</Divider>
    <ConfigForm/>
  </Modal>
</template>
