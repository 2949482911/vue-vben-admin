<script lang="ts" setup name="AiAssetWorkspaceCreate">
/**
 * 工作区 — 新建（vben 弹窗）
 */
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { aiAssetApi } from '#/api';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    await aiAssetApi.createWorkspace({ name: values.name });
    await modalApi.close();
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: '如 品牌A · 双十一主投' },
      fieldName: 'name',
      label: '工作区名称',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('success');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      formApi.resetForm();
    }
  },
});
</script>

<template>
  <Modal title="新建工作区">
    <p class="create-hint">
      每个工作区是独立数据域：素材 / 资产 / 创作台都归属于它，工作区之间互不可见。
    </p>
    <Form />
  </Modal>
</template>

<style scoped lang="scss">
.create-hint {
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}
</style>
