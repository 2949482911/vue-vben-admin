<script lang="ts" setup name="DictDataDrawer">
/**
 * 字典项 — 新增 / 编辑（vben 抽屉 + 表单）
 *
 * dictCode 由列表页随抽屉数据带入，不在表单里编辑；状态：1 启用 / 9 停用。
 */
import type {
  DictDataItem,
  DictDataSaveRequest,
} from '#/api/models/dict';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { dictApi } from '#/api';

interface DrawerData {
  dictCode?: string;
  dictName?: string;
  row?: DictDataItem;
}

const emit = defineEmits<{ success: [] }>();

const isUpdate = ref(false);
const dictCode = ref('');
const dictName = ref('');

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    const payload: DictDataSaveRequest = {
      id: values.id || undefined,
      dictCode: dictCode.value,
      label: String(values.label ?? '').trim(),
      value: String(values.value ?? '').trim(),
      color: values.color || undefined,
      sort: values.sort ?? 0,
      remark: values.remark || undefined,
      status: values.status ?? 1,
    };
    await dictApi.saveData(payload);
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
      componentProps: { placeholder: '中文展示名' },
      fieldName: 'label',
      label: '显示文案',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '英文稳定值，如 fantasy' },
      fieldName: 'value',
      label: '字典值',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '#1677ff，可留空' },
      fieldName: 'color',
      label: '标签颜色',
    },
    {
      component: 'InputNumber',
      componentProps: { class: 'w-full', min: 0 },
      fieldName: 'sort',
      label: '排序',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '说明，可留空', rows: 3 },
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
    const data = (drawerApi.getData() as DrawerData) ?? {};
    dictCode.value = data.dictCode ?? '';
    dictName.value = data.dictName ?? '';
    isUpdate.value = Boolean(data.row?.id);

    formApi.resetForm();
    await formApi.setValues(
      data.row?.id
        ? {
            color: data.row.color ?? '',
            id: data.row.id,
            label: data.row.label,
            remark: data.row.remark ?? '',
            sort: data.row.sort ?? 0,
            status: data.row.status ?? 1,
            value: data.row.value,
          }
        : { color: '', label: '', remark: '', sort: 0, status: 1, value: '' },
    );
  },
});

const title = computed(() => {
  const action = isUpdate.value ? '编辑字典项' : '新增字典项';
  return dictName.value ? `${action} · ${dictName.value}` : action;
});
</script>

<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
