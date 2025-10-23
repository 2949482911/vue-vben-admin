<script lang="ts" setup name="CreateNotice">
import type {BehavioraPlatformItem, OcpxPlatformMatch,} from '#/api/models';

import {ref} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {useVbenForm} from '#/adapter/form';
import {behavioraPlatformApi} from '#/api/core/ocpx';
import {BEHAVIORA_PLATFORM, MatchFieldSelect, ModelSelect, PLATFORM} from '#/constants/locales';
import {Card, Divider} from "ant-design-vue";
import MatchTable from "./matchTable.vue";
import {Platform} from "#/constants/enums";

const emit = defineEmits(['pageReload']);
// 创建表格
const matchTableRef = ref<any>();

// 匹配列表
const ocpxPlatformMatchList = ref<Array<OcpxPlatformMatch>>([]);


const objectRequest = ref<BehavioraPlatformItem>({});
const isUpdate = ref<Boolean>(false);
const matchModel = ref<string>('callback');

// 配置项
const platformConfigForm = new Map<string, Array<any>>();

// 京东配置
platformConfigForm.set(Platform.JD, [
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
    label: `secretKey`,
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
    fieldName: 'secret',
    // 界面显示的label
    label: `secret`,
    rules: 'required',
  },
]);

// 京东科技
platformConfigForm.set(Platform.JDKJ, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'code',
    // 界面显示的label
    label: `code`,
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
    fieldName: 'account_id',
    // 界面显示的label
    label: `account_id`,
    rules: 'required',
  },

]);

const [ConfigForm, configFormApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  schema: platformConfigForm.get(Platform.JD),
})


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
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    formVal.config = await configFormApi.getValues();
    if (ocpxPlatformMatchList.value && ocpxPlatformMatchList.value.length> 0) {
      formVal.ocpxPlatformMatches = ocpxPlatformMatchList.value;
    }
    await (isUpdate.value
      ? behavioraPlatformApi.fetchUpdateBehavioraPlatform(formVal)
      : behavioraPlatformApi.fetchCreateBehavioraPlatform(formVal));
    await formApi.resetForm();
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
        options: BEHAVIORA_PLATFORM,
        onSelect: value => {
          configFormApi.setState((_) => {
            return {
              schema: platformConfigForm.get(value),
            }
          })
        }
      },
      defaultValue: Platform.JD,
      // 字段名
      fieldName: 'platform',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.platform')}`,
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
      label: `${$t('ocpx.behavioraplatform.columns.name')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: ModelSelect,
        onChange(value) {
          matchModel.value = value
        }
      },
      defaultValue: 'callback',
      // 字段名
      fieldName: 'model',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.model')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: MatchFieldSelect
      },
      // 字段名
      fieldName: 'matchField',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.matchField')}`,
      rules: 'required',
      defaultValue: 'clickId'
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
      label: `${$t('ocpx.behavioraplatform.columns.remark')}`,
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await configFormApi.resetForm();
    ocpxPlatformMatchList.value = [];
    isUpdate.value = false;
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate()
    const configFormResult = await configFormApi.validate();
    if (!result.valid && !configFormResult.valid) {
      return
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
        ocpxPlatformMatchList.value = objectRequest.value.ocpxPlatformMatchList;
        matchModel.value = objectRequest.value.model;

      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row: BehavioraPlatformItem) {
  formApi.setValues(row);
  configFormApi.setState((_) => {
    return {
      schema: platformConfigForm.get(row.platform),
    }
  });
  configFormApi.setValues(row.config);
}

const title: string = objectRequest.value.id
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Divider>{{ $t('core.baseInfo') }}</Divider>

    <Card :bordered="false">
      <Form/>
    </Card>

    <Divider>{{ $t('core.configuration') }}</Divider>
    <Card :bordered="false">
      <ConfigForm/>
    </Card>

    <Card :bordered="false" v-if="matchModel === 'match'">
      <MatchTable ref="matchTableRef" :match-data-list="ocpxPlatformMatchList"></MatchTable>
    </Card>
  </Modal>
</template>
