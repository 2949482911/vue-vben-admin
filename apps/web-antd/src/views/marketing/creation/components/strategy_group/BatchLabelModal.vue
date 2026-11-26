<script setup lang="ts" name="StrategyGroupBatchLabelModal">
import { computed, ref } from 'vue';

import { useVbenForm, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { strategyGropApi } from '#/api/core';
import { useAccountLabelOptions } from '#/views/marketing/account/label/useAccountLabelOptions';

const emit = defineEmits<{ success: [] }>();

interface BatchLabelData {
  targetIds: string[];
}

const targetIds = ref<string[]>([]);
const { labelOptions, loadLabelOptions } = useAccountLabelOptions();

const title = computed(() => `批量修改策略组标签（${targetIds.value.length} 条）`);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: () => ({
        allowClear: true,
        maxTagCount: 'responsive',
        mode: 'multiple',
        optionFilterProp: 'label',
        options: labelOptions.value,
        placeholder: '不选择表示清空标签',
        showSearch: true,
      }),
      fieldName: 'labelIds',
      label: '策略组标签',
    },
  ],
});

const [Modal, modalApi] = useVbenModal<BatchLabelData>({
  class: 'w-[480px]',
  async onCancel() {
    await formApi.reset();
    await modalApi.close();
  },
  async onConfirm() {
    const formValue = await formApi.getValues();
    const labelIds = Array.isArray(formValue.labelIds)
      ? formValue.labelIds.map((id: number | string) => String(id))
      : [];
    try {
      await strategyGropApi.fetchBatchStrategyGrop({
        targetIds: targetIds.value,
        type: 'update_strategy_label',
        values: { labelIds },
      });
      message.success('策略组标签修改成功');
      emit('success');
      await formApi.reset();
      await modalApi.close();
    } catch (err) {
      console.error(err);
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    targetIds.value = modalApi.getData()?.targetIds ?? [];
    await formApi.reset();
    await loadLabelOptions();
  },
});
</script>

<template>
  <Modal :title="title">
    <div class="batch-label-body">
      <div class="batch-label-tip">
        将全量替换所选 {{ targetIds.length }} 条策略组的标签；不选择任何标签表示清空。
      </div>
      <Form />
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.batch-label-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.batch-label-tip {
  padding: 9px 11px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.6;
  background: hsl(var(--muted) / 50%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
</style>
