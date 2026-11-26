<script lang="ts" setup>
import type {
  EditLabelItemType,
  LabelItem,
  NewLabelItemType,
} from '#/api/models/marketing';

import { ref } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { accountLabelApi } from '#/api';
import { trimObject } from '#/utils/trim';

const emit = defineEmits(['pageReload']);
const objectRequest = ref<LabelItem>({});
const isUpdate = ref(false);
const title = ref('');

const [LabelDrawer, drawerApi] = useVbenDrawer<LabelItem>({
  class: 'w-[560px] max-w-[95vw]',
  closeOnClickModal: false,
  async onCancel() {
    await formApi.reset();
    objectRequest.value = {};
    isUpdate.value = false;
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const formValue = await formApi.getValues();
    const formattedData = trimObject(formValue);
    try {
      if (isUpdate.value) {
        await accountLabelApi.fetchModifyAccountLabel({
          ...(formattedData as Omit<EditLabelItemType, 'id'>),
          id: String(objectRequest.value.id),
        });
        message.success('修改成功！');
      } else {
        await accountLabelApi.fetchNewAccountLabel(
          formattedData as NewLabelItemType,
        );
        message.success('添加成功！');
      }
      isUpdate.value = false;
      await formApi.reset();
      await drawerApi.close();
      emit('pageReload');
    } catch (err) {
      console.error(err);
    }
  },
  async onOpened() {
    objectRequest.value = drawerApi.getData() ?? {};
    if (objectRequest.value.id) {
      title.value = '修改标签';
      isUpdate.value = true;
      await formApi.reset();
      await formApi.setValues({
        id: objectRequest.value.id,
        name: objectRequest.value.name,
        remark: objectRequest.value.remark,
      });
      return;
    }
    isUpdate.value = false;
    title.value = '新增标签';
    await formApi.reset();
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '标签名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'remark',
      label: '备注',
      rules: 'required',
    },
  ],
});
</script>

<template>
  <LabelDrawer :title="title">
    <div class="label-form">
      <div class="label-form-tip">
        标签为全局标签，所有资产业务共用；同名标签后端会自动去重。
      </div>
      <Form />
    </div>
  </LabelDrawer>
</template>

<style lang="scss" scoped>
.label-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.label-form-tip {
  padding: 10px 12px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.6;
  background: hsl(var(--muted) / 50%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
</style>
