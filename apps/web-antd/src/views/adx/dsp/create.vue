<script setup lang="ts">
import { trimObject } from '#/utils/trim';
import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer, Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref, watch } from 'vue'; // 添加 watch
import { message } from 'ant-design-vue';
import type {
  searchDataFilter,
  DspUpdateItem,
  UpdateSubscribeType,
  DspItem
} from '#/api/models';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { dspApi } from '#/api/core/adx.ts';

const title = ref<string>('');
const emit = defineEmits(['pageReload']);
const objectRequest = ref<DspUpdateItem>({});
const isUpdate = ref<Boolean>(false);
  watch(isUpdate,(newVal) => {
  if(newVal) {
    title.value = "修改渠道"
  } else {
    title.value = "新增渠道"
  }
},{ deep: true, immediate: true });
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const params = trimObject(formVal);
    if(isUpdate.value) {
      // 调用修改接口
      await dspApi.fetchUpdateDsp(params as DspUpdateItem);
      message.success('修改成功');
    } else {
      // 调用新增接口
      await dspApi.fetchCreateDsp(params as DspItem);
      message.success('新增成功');
     }
     emit('pageReload');
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'name',
      label: `${$t('adx.dsp.columns.name')}`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.choice')}`,
        options: PLATFORM,
        allowClear: true,
      },
      rules: 'required',
      fieldName: 'platform',
      label: `${$t('adx.dsp.columns.platform')}`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'api',
      label: `${$t('adx.dsp.columns.api')}`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'apiVersion',
      label: `${$t('adx.dsp.columns.apiVersion')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'qpsLimit',
      label: `${$t('adx.dsp.columns.qpsLimit')}`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'weight',
      label: `${$t('adx.dsp.columns.weight')}`
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'remark',
      label: `${$t('adx.dsp.columns.remark')}`
    },
  ],
});
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: false,
  // 当抽屉打开状态改变时触发
  async onOpenChange(isOpen) {
    if (!isOpen) {
      await drawerApi.close();
    } else {
      objectRequest.value = await drawerApi.getData<DspUpdateItem>();
      formApi.setValues(objectRequest.value);
      isUpdate.value = !!objectRequest.value.id;
    }
  },
  async onConfirm() {
    const result = await formApi.validate();
    if(!result.valid) return;
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    await drawerApi.close();
  },
});
</script>
<template> 
  <div>
    <Page auto-content-height>
      <Drawer class="w-[40%]" :title="title">
        <Form>
        </Form>
      </Drawer>
    </Page>
  </div>
</template>

<style lang="scss" scoped>
</style>
