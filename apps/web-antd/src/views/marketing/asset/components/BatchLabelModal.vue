<script setup lang="ts" name="AssetBatchLabelModal">
import type {
  AssetBatchLabelAsset,
  AssetBatchLabelData,
} from './batchLabelTypes';

import type { BatchOptions } from '#/api/models/core';

import { computed, h, ref } from 'vue';

import { useVbenForm, useVbenModal } from '@vben/common-ui';

import { message, Tag } from 'ant-design-vue';

import {
  accountLabelApi,
  loadingPageApi,
  targetedPackageApi,
  titlePackApi,
  uploadEditApi,
} from '#/api';
import { LABEL_TYPE_CODES, LABEL_TYPE_COLORS } from '#/views/marketing/account/label/constants';

const emit = defineEmits<{ success: [] }>();

const ASSET_CONFIG: Record<
  AssetBatchLabelAsset,
  {
    labelType: string;
    request: (params: BatchOptions) => Promise<unknown>;
    type: string;
  }
> = {
  audience: {
    labelType: LABEL_TYPE_CODES.target,
    request: (params) => targetedPackageApi.fetchBatchOptions(params),
    type: 'update_material_audience_package_label',
  },
  loading_page: {
    labelType: LABEL_TYPE_CODES.page,
    request: (params) => loadingPageApi.fetchBatchOptions(params),
    type: 'update_material_loading_page_label',
  },
  material: {
    labelType: LABEL_TYPE_CODES.material,
    request: (params) => uploadEditApi.fetchBatchOptions(params),
    type: 'update_material_label',
  },
  title: {
    labelType: LABEL_TYPE_CODES.title,
    request: (params) => titlePackApi.fetchBatchOptions(params),
    type: 'update_material_title_page_label',
  },
};

const asset = ref<AssetBatchLabelAsset>('material');
const targetIds = ref<string[]>([]);
const labelOptions = ref<Array<{ label: string; value: string }>>([]);

const title = computed(() => `批量修改标签（${targetIds.value.length} 条）`);
const labelColor = computed(
  () => LABEL_TYPE_COLORS[ASSET_CONFIG[asset.value].labelType] ?? 'default',
);

async function loadLabelOptions() {
  const res: any = await accountLabelApi.fetchGetAccountLabelList({
    labelType: ASSET_CONFIG[asset.value].labelType,
    page: 1,
    pageSize: 1000,
  });
  labelOptions.value = (res?.items ?? [])
    .filter((item: any) => item.status === undefined || item.status === 1)
    .map((item: any) => ({
      label: item.name || String(item.id),
      value: String(item.id),
    }));
}

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
        mode: 'multiple',
        optionFilterProp: 'label',
        options: labelOptions.value,
        placeholder: '不选择表示清空标签',
        showSearch: true,
        tagRender: (tagProps: any) =>
          h(
            Tag,
            {
              bordered: false,
              closable: tagProps.closable,
              color: labelColor.value,
              onClose: tagProps.onClose,
              style: { marginInlineEnd: '4px' },
            },
            () => tagProps.label,
          ),
      }),
      fieldName: 'labelIds',
      label: '标签',
    },
  ],
});

const [Modal, modalApi] = useVbenModal<AssetBatchLabelData>({
  class: 'w-[460px]',
  async onCancel() {
    await formApi.reset();
    await modalApi.close();
  },
  async onConfirm() {
    const formValue = await formApi.getValues();
    const config = ASSET_CONFIG[asset.value];
    const labelIds = Array.isArray(formValue.labelIds)
      ? formValue.labelIds.map((id: number | string) => String(id))
      : [];
    try {
      await config.request({
        targetIds: targetIds.value,
        type: config.type,
        values: { labelIds },
      });
      message.success(`已更新 ${targetIds.value.length} 条数据的标签`);
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
    const data = modalApi.getData();
    if (!data) {
      return;
    }
    asset.value = data.asset;
    targetIds.value = data.targetIds ?? [];
    await formApi.reset();
    await loadLabelOptions();
  },
});
</script>

<template>
  <Modal :title="title">
    <div class="batch-label-body">
      <div class="batch-label-tip">
        将全量替换所选 {{ targetIds.length }} 条数据的标签；不选择任何标签表示清空。
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
