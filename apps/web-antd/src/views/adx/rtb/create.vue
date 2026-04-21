<script setup lang="ts">
import { trimObject } from '#/utils/trim';
import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer, Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref, watch } from 'vue'; // 添加 watch
import { message } from 'ant-design-vue';
import type {
  searchDataFilter,
  RtbUpdateItem,
  UpdateSubscribeType,
  RtbItem
} from '#/api/models';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { rtbApi } from '#/api/core/adx.ts';

const title = ref<string>('');
const emit = defineEmits(['pageReload']);
const objectRequest = ref<RtbUpdateItem>({});
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
      await rtbApi.fetchUpdateRtb(params as RtbUpdateItem);
      message.success('修改成功');
    } else {
      // 调用新增接口
      await rtbApi.fetchCreateRtb(params as RtbItem);
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
      label: `${$t('adx.rtb.columns.name')}`
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
      label: `${$t('adx.rtb.columns.platform')}`
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'remark',
      label: `${$t('adx.rtb.columns.remark')}`
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
      objectRequest.value = await drawerApi.getData<RtbUpdateItem>();
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
