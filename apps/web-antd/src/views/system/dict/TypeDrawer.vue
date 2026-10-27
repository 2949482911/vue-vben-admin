<script lang="ts" setup name="DictTypeDrawer">
/**
 * 字典类型 — 新增 / 编辑（vben 抽屉 + 表单）
 *
 * 编码创建后不可修改（后端同样校验）；状态：1 启用 / 9 停用。
 */
import type {
  DictTypeItem,
  DictTypeSaveRequest,
} from '#/api/models/dict';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { dictApi } from '#/api';

const emit = defineEmits<{ success: [] }>();

const isUpdate = ref(false);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    const payload: DictTypeSaveRequest = {
      id: values.id || undefined,
      code: String(values.code ?? '').trim(),
      name: String(values.name ?? '').trim(),
      sort: values.sort ?? 0,
      remark: values.remark || undefined,
      status: values.status ?? 1,
    };
    await dictApi.saveType(payload);
    await drawerApi.close();
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'id',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '小写字母开头，如 ai_novel_genre' },
      fieldName: 'code',
      label: '字典编码',
      rules: z
        .string()
        .min(1, '请输入字典编码')
        .regex(
          /^[a-z][a-z0-9_]{1,63}$/,
          '仅支持小写字母/数字/下划线，且以字母开头',
        ),
    },
    {
      component: 'Input',
      componentProps: { placeholder: '如 小说类型' },
      fieldName: 'name',
      label: '字典名称',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: { class: 'w-full', min: 0 },
      fieldName: 'sort',
      label: '排序',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '用途说明，可留空', rows: 3 },
      fieldName: 'remark',
      label: '备注',
    },
    {
      component: 'Switch',
      componentProps: { checkedValue: 1, unCheckedValue: 9 },
      fieldName: 'status',
      label: '启用',
      formItemClass: 'w-[150px]'
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('success');
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    formApi.resetForm();
    const data = drawerApi.getData() as DictTypeItem | undefined;
    isUpdate.value = Boolean(data?.id);
    await formApi.updateSchema([
      { fieldName: 'code', componentProps: { disabled: isUpdate.value } },
    ]);
    await formApi.setValues(
      data?.id
        ? {
            code: data.code,
            id: data.id,
            name: data.name,
            remark: data.remark,
            sort: data.sort ?? 0,
            status: data.status ?? 1,
          }
        : { code: '', name: '', remark: '', sort: 0, status: 1 },
    );
  },
});

const title = computed(() =>
  isUpdate.value ? '编辑字典类型' : '新增字典类型',
);
</script>

<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
