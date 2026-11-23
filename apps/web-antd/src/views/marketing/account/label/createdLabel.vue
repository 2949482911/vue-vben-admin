<script lang="ts" setup>
import type {
  EditLabelItemType,
  LabelItem,
  NewLabelItemType,
} from '#/api/models/marketing';

import { ref } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { useDictStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { accountLabelApi } from '#/api';
import { trimObject } from '#/utils/trim';

import { LABEL_TYPE_DICT_CODE } from './constants';

const emit = defineEmits(['pageReload']);
const dictStore = useDictStore();
const objectRequest = ref<LabelItem>({});
const isUpdate = ref(false);
const title = ref('');
const labelTypeOptions = ref<Array<{ label: string; value: string }>>([]);

/** 标签类型下拉：来自系统字典 label_type */
async function loadLabelTypeOptions() {
  const items = await dictStore.getDict(LABEL_TYPE_DICT_CODE);
  labelTypeOptions.value = items.map((item) => ({
    label: item.label,
    value: String(item.value),
  }));
}

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
    await loadLabelTypeOptions();
    objectRequest.value = drawerApi.getData() ?? {};
    if (objectRequest.value.id) {
      title.value = '修改标签';
      isUpdate.value = true;
      await formApi.reset();
      await formApi.setValues({
        id: objectRequest.value.id,
        labelType: objectRequest.value.labelType,
        name: objectRequest.value.name,
        remark: objectRequest.value.remark,
      });
      return;
    }
    isUpdate.value = false;
    title.value = '新增标签';
    await formApi.reset();
    // 新建默认选中全部标签类型，一次为每个类型各生成一条同名标签
    await formApi.setValues({
      labelType: labelTypeOptions.value.map((item) => item.value),
    });
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
      component: 'Select',
      componentProps: () => ({
        allowClear: isUpdate.value,
        maxTagCount: 'responsive',
        mode: isUpdate.value ? undefined : 'multiple',
        optionFilterProp: 'label',
        options: labelTypeOptions.value,
        placeholder: isUpdate.value
          ? '请选择标签类型'
          : '默认选中全部标签类型',
        showSearch: true,
      }),
      fieldName: 'labelType',
      label: '标签类型',
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
        {{
          isUpdate
            ? '修改仅作用于当前标签。'
            : '可同时选择多个标签类型，系统会为每个类型各创建一条同名标签；新建默认选中全部类型。'
        }}
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
